import { prisma } from "@/db/prisma";
import { generateCouponCode } from "@/lib/utils";
import { CouponGroupType, Prisma } from "@prisma/client";
import { CouponFilter, CouponGroup } from "@/types/coupon";
import { CouponGroupValues } from "@/components/dialog/add-coupon-dialog";
import { auth } from "@/lib/auth-config";

export class CouponService {
  async getCouponGroupList(page: number, filter: CouponFilter) {
    try {
      const pageSize = 50;
      const skip = page * pageSize;
      const where: Prisma.CouponGroupWhereInput = {};

      if (filter.startDate || filter.endDate) {
        where.AND = [];
        if (filter.startDate) {
          where.AND.push({ startDate: { gte: new Date(filter.startDate) } });
        }
        if (filter.endDate) {
          where.AND.push({ endDate: { lte: new Date(filter.endDate) } });
        }
      }

      // 상태 필터링
      if (filter.groupStatus) {
        const now = new Date();
        switch (filter.groupStatus) {
          case "ACTIVE":
            where.AND = [
              { startDate: { lte: now } },
              { endDate: { gte: now } },
            ];
            break;
          case "INACTIVE":
            where.startDate = { gt: now };
            break;
          case "EXPIRED":
            where.endDate = { lt: now };
            break;
        }
      }

      // 그룹 타입 필터링
      if (filter.groupType && filter.groupType !== "ALL") {
        where.groupType = filter.groupType;
      }

      // 사유 필터링
      if (filter.groupReason) {
        where.groupReason = { contains: filter.groupReason };
      }

      const [count, couponGroups] = await Promise.all([
        prisma.couponGroup.count({ where }),
        prisma.couponGroup.findMany({
          where,
          skip,
          take: pageSize,
          orderBy: { createdAt: "desc" },
        }),
      ]);

      const totalPages = Math.ceil(count / pageSize);

      return {
        couponGroups,
        count,
        totalPages,
      };
    } catch (error) {
      console.error("Get coupon group list error:", error);
      throw error;
    }
  }

  async getCouponsByGroupId(groupId: string, page: number = 0) {
    try {
      const pageSize = 100;
      const skip = page * pageSize;

      const [coupons, total] = await Promise.all([
        prisma.coupon.findMany({
          where: { couponGroupId: groupId },
          orderBy: { createdAt: "desc" },
          take: pageSize,
          skip: skip,
        }),
        prisma.coupon.count({
          where: { couponGroupId: groupId },
        }),
      ]);

      const totalPages = Math.ceil(total / pageSize);

      return {
        success: true,
        message: "쿠폰 조회가 완료되었습니다.",
        data: {
          coupons,
          total,
          totalPages,
          currentPage: page,
        },
        error: null,
      };
    } catch (error) {
      console.error("Get coupons by group error:", error);
      return {
        success: false,
        message: "쿠폰 조회에 실패하였습니다.",
        data: null,
        error: error,
      };
    }
  }

  async createCouponGroup(values: CouponGroupValues) {
    try {
      const isPublic = values.groupType === "PUBLIC";

      const result = await prisma.couponGroup.create({
        data: {
          ...values,
          groupType: values.groupType as CouponGroupType,
          isIssued: isPublic,
          quantity: isPublic ? 0 : values.quantity,
        },
      });
      return result;
    } catch (error) {
      console.error("Create coupon group error:", error);
      throw error;
    }
  }

  async createCoupons(selectedGroups: CouponGroup[]) {
    const session = await auth();

    if (!session || !session.user) {
      return {
        error: null,
        message: "로그인 상태가 아닙니다.",
        data: null,
        success: false,
      };
    }

    const hasInvalidGroup = selectedGroups.some(
      (group) =>
        group.groupType === "PUBLIC" ||
        (group.groupType === "COMMON" && group.isIssued)
    );

    if (hasInvalidGroup) {
      return {
        success: false,
        message: "이미 발급된 그룹이나 퍼블릭 그룹은 발급할 수 없습니다.",
        data: null,
        error: null,
      };
    }

    const groups = selectedGroups.filter((group) => !group.isIssued);

    try {
      return await prisma.$transaction(async (tx) => {
        // 2. 쿠폰 생성 배치 처리
        const BATCH_SIZE = 1000;
        for (const group of groups) {
          const couponsForGroup = Array.from(
            { length: group.quantity },
            () => ({
              code: generateCouponCode(),
              rewards: group.rewards as Prisma.InputJsonValue,
              couponGroupId: group.id,
            })
          );

          // 배치 단위로 나누어 처리
          for (let i = 0; i < couponsForGroup.length; i += BATCH_SIZE) {
            const batch = couponsForGroup.slice(i, i + BATCH_SIZE);
            await tx.coupon.createMany({
              data: batch,
            });
          }
        }

        // 3. 그룹 상태 한번에 업데이트
        await tx.couponGroup.updateMany({
          where: { id: { in: groups.map((g) => g.id) } },
          data: { isIssued: true },
        });

        // 4. 로그 기록
        await tx.accountUsingQuerylog.create({
          data: {
            content: `쿠폰 발급: ${groups.reduce(
              (sum, g) => sum + g.quantity,
              0
            )}개 생성, ${groups.length}개 그룹`,
            registrantId: session.user!.id,
          },
        });

        return {
          success: true,
          message: "쿠폰 발급이 완료되었습니다.",
          data: { count: groups.reduce((sum, g) => sum + g.quantity, 0) },
          error: null,
        };
      });
    } catch (error) {
      console.error("Create coupons error:", error);
      return {
        success: false,
        message: "쿠폰 발급에 실패하였습니다.",
        data: null,
        error: error,
      };
    }
  }

  async deleteCouponGroupWithCoupons(couponGroupId: string) {
    const result = await prisma.couponGroup.delete({
      where: { id: couponGroupId },
    });
    return result;
  }

  async updateCouponGroup(id: string, data: Partial<CouponGroupValues>) {
    try {
      const result = await prisma.couponGroup.update({
        where: { id },
        data: {
          groupName: data.groupName,
          groupReason: data.groupReason,
          startDate: data.startDate,
          endDate: data.endDate,
          usageLimit: data.usageLimit,
          rewards: data.rewards,
        },
      });
      if (result) {
        return {
          success: true,
          message: "쿠폰 그룹 수정이 완료되었습니다.",
          data: result,
          error: null,
        };
      }
      return {
        success: false,
        message: "쿠폰 그룹 수정에 실패하였습니다.",
        data: null,
        error: null,
      };
    } catch (error) {
      console.error("Update coupon group error:", error);
      throw error;
    }
  }
}

export const couponService = new CouponService();
