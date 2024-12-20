import { prisma } from "@/db/prisma";
import { generateCouponCode, hasAccess } from "@/lib/utils";
import {
  Coupon,
  CouponGroupStatus,
  CouponGroupType,
  Prisma,
  UserRole,
} from "@prisma/client";
import {
  CouponFilter,
  CouponGroup,
  CouponGroupList,
  CouponList,
} from "@/types/coupon";
import { CouponGroupValues } from "@/components/dialog/add-coupon-dialog";
import { auth } from "@/lib/auth-config";
import { redirect } from "next/navigation";
import { ApiResponse } from "@/types/global.dto";
export class CouponService {
  async getCouponGroupList(
    page: number = 0,
    filter: CouponFilter
  ): Promise<ApiResponse<CouponGroupList>> {
    try {
      const pageSize = 50;
      const skip = page * pageSize;

      // where 조건 구성
      const where: Prisma.CouponGroupWhereInput = {
        ...(filter.startDate &&
          filter.endDate && {
            startDate: {
              gte: new Date(filter.startDate),
            },
            endDate: {
              lte: new Date(filter.endDate),
            },
          }),
        ...(filter.groupStatus && {
          groupStatus: filter.groupStatus,
        }),
        ...(filter.groupType &&
          filter.groupType !== "ALL" && {
            groupType: filter.groupType,
          }),
        ...(filter.groupReason && {
          groupReason: {
            contains: filter.groupReason,
            mode: "insensitive",
          },
        }),
      };

      // 병렬 처리로 성능 최적화
      const [count, couponGroups] = await Promise.all([
        prisma.couponGroup.count({ where }),
        prisma.couponGroup.findMany({
          where,
          skip,
          take: pageSize,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            groupName: true,
            groupType: true,
            groupReason: true,
            groupStatus: true,
            code: true,
            rewards: true,
            isIssued: true,
            quantity: true,
            usageLimit: true,
            startDate: true,
            endDate: true,
            createdAt: true,
            updatedAt: true,
            _count: {
              select: {
                coupons: true,
              },
            },
          },
        }),
      ]);

      return {
        success: true,
        data: {
          couponGroups,
          metadata: {
            currentPage: page,
            totalPages: Math.ceil(count / pageSize),
            totalCount: count,
          },
        },
        error: null,
      };
    } catch (error) {
      console.error("Get coupon group list error:", error);
      return {
        success: false,
        data: {
          couponGroups: [],
          metadata: {
            currentPage: page,
            totalPages: 0,
            totalCount: 0,
          },
        },
        error:
          error instanceof Error
            ? error.message
            : "알 수 없는 에러가 발생하였습니다",
      };
    }
  }

  // 쿠폰 목록 조회 with 캐싱
  async getCouponsByGroupId(
    groupId: string,
    page: number = 0
  ): Promise<ApiResponse<CouponList>> {
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

      return {
        success: true,
        data: {
          coupons: coupons.map((coupon) => ({
            ...coupon,
            rewards: coupon.rewards as any[],
          })),
          metadata: {
            currentPage: page,
            totalPages: Math.ceil(total / pageSize),
            totalCount: total,
          },
        },
        error: null,
      };
    } catch (error) {
      console.error("Get coupons error:", error);
      return {
        success: false,
        data: null,
        error:
          error instanceof Error
            ? error.message
            : "알 수 없는 에러가 발생하였습니다",
      };
    }
  }

  // 쿠폰 그룹 생성
  async createCouponGroup(
    values: CouponGroupValues
  ): Promise<ApiResponse<CouponGroup>> {
    try {
      const session = await auth();
      if (!session?.user)
        return {
          success: false,
          data: null,
          error: "로그인이 필요합니다.",
        };
      if (!hasAccess(session.user.role, UserRole.SUPERMASTER))
        return {
          success: false,
          data: null,
          error: "권한이 없습니다.",
        };

      const isPublic = values.groupType === "PUBLIC";
      const result = await prisma.couponGroup.create({
        data: {
          ...values,
          groupType: values.groupType as CouponGroupType,
          groupStatus: CouponGroupStatus.ACTIVE,
          isIssued: isPublic,
          quantity: isPublic ? 0 : values.quantity,
        },
      });

      return {
        success: true,
        data: result,
        error: null,
      };
    } catch (error) {
      console.error("Create coupon group error:", error);
      return {
        success: false,
        data: null,
        error:
          error instanceof Error
            ? error.message
            : "알 수 없는 에러가 발생하였습니다",
      };
    }
  }

  // 쿠폰 발급
  async createCoupons(
    selectedGroups: CouponGroup[]
  ): Promise<ApiResponse<{ count: number }>> {
    const session = await auth();
    if (!session || !session.user)
      return {
        success: false,
        data: null,
        error: "로그인이 필요합니다.",
      };

    if (!hasAccess(session.user.role, UserRole.SUPERMASTER))
      return {
        success: false,
        data: null,
        error: "권한이 없습니다.",
      };

    const hasInvalidGroup = selectedGroups.some(
      (group) => group.groupType === "PUBLIC" || group.isIssued
    );

    if (hasInvalidGroup) {
      return {
        success: false,
        data: null,
        error: "이미 발급된 그룹이나 퍼블릭 그룹은 발급할 수 없습니다.",
      };
    }

    try {
      const result = await prisma.$transaction(async (tx) => {
        const BATCH_SIZE = 1000;
        let totalCount = 0;

        for (const group of selectedGroups) {
          const couponsForGroup = Array.from(
            { length: group.quantity },
            () => ({
              code: generateCouponCode(),
              rewards: group.rewards as Prisma.JsonValue,
              couponGroupId: group.id,
            })
          );

          for (let i = 0; i < couponsForGroup.length; i += BATCH_SIZE) {
            const batch = couponsForGroup.slice(i, i + BATCH_SIZE);
            await tx.coupon.createMany({
              data: batch.map((coupon) => ({
                ...coupon,
                rewards: coupon.rewards as Prisma.InputJsonValue,
              })),
            });
          }
          totalCount += group.quantity;

          await tx.couponGroup.update({
            where: { id: group.id },
            data: {
              isIssued: true,
              groupStatus: CouponGroupStatus.ACTIVE,
            },
          });
        }

        await tx.accountUsingQuerylog.create({
          data: {
            content: `쿠폰 발급: ${totalCount}개 생성, ${selectedGroups.length}개 그룹`,
            registrantId: session.user!.id,
          },
        });

        return totalCount;
      });

      return {
        success: true,
        data: { count: result },
        error: null,
      };
    } catch (error) {
      console.error("Create coupons error:", error);
      return {
        success: false,
        data: null,
        error:
          error instanceof Error
            ? error.message
            : "알 수 없는 에러가 발생하였습니다",
      };
    }
  }

  // 쿠폰 그룹 삭제
  async deleteCouponGroupWithCoupons(
    id: string
  ): Promise<ApiResponse<CouponGroup>> {
    try {
      const session = await auth();
      if (!session || !session.user)
        return {
          success: false,
          data: null,
          error: "로그인이 필요합니다.",
        };

      if (!hasAccess(session.user.role, UserRole.SUPERMASTER))
        return {
          success: false,
          data: null,
          error: "권한이 없습니다.",
        };

      const result = await prisma.$transaction(async (tx) => {
        // 연관된 쿠폰들 먼저 삭제
        await tx.coupon.deleteMany({
          where: { couponGroupId: id },
        });

        // 쿠폰 그룹 삭제
        const deletedGroup = await tx.couponGroup.delete({
          where: { id },
        });

        // 로그 기록
        await tx.accountUsingQuerylog.create({
          data: {
            content: `쿠폰 그룹 삭제: ${deletedGroup.groupName}`,
            registrantId: session.user!.id,
          },
        });

        return deletedGroup;
      });

      return {
        success: true,
        data: result,
        error: null,
      };
    } catch (error) {
      console.error("Delete coupon group error:", error);
      return {
        success: false,
        data: null,
        error:
          error instanceof Error
            ? error.message
            : "알 수 없는 에러가 발생하였습니다",
      };
    }
  }

  async updateCouponGroup(
    id: string,
    data: Partial<CouponGroupValues>
  ): Promise<ApiResponse<CouponGroup>> {
    try {
      const session = await auth();
      if (!session?.user) return redirect("/login");

      const result = await prisma.couponGroup.update({
        where: { id },
        data: {
          groupName: data.groupName,
          groupReason: data.groupReason,
          startDate: data.startDate,
          endDate: data.endDate,
          usageLimit: data.usageLimit,
          rewards: data.rewards,
          groupType: data.groupType as CouponGroupType,
        },
      });

      return {
        success: true,
        data: result,
        error: null,
      };
    } catch (error) {
      console.error("Update coupon group error:", error);
      return {
        success: false,
        data: null,
        error:
          error instanceof Error
            ? error.message
            : "알 수 없는 에러가 발생하였습니다",
      };
    }
  }

  async getCouponGroupWithCouponsAndIds(ids: string[]) {
    const session = await auth();
    if (!session || !session.user)
      return {
        success: false,
        data: null,
        error: "로그인이 필요합니다.",
      };

    if (!hasAccess(session.user.role, UserRole.SUPERMASTER))
      return {
        success: false,
        data: null,
        error: "권한이 없습니다.",
      };

    try {
      const result = await prisma.couponGroup.findMany({
        where: { id: { in: ids } },
        include: {
          coupons: true,
        },
      });
      return {
        success: true,
        data: result,
        error: null,
      };
    } catch (error) {
      console.error("Get coupon group with coupons and ids error:", error);
      return {
        success: false,
        data: null,
        error:
          error instanceof Error
            ? error.message
            : "알 수 없는 에러가 발생하였습니다",
      };
    }
  }
}

export const couponService = new CouponService();
