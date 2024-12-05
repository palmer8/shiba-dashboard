import prisma from "@/db/prisma";
import { CreditFilter } from "@/types/filters/credit-filter";
import { GlobalReturn } from "@/types/global-return";
import {
  RewardRevoke,
  CreditTableData,
  CreateRewardRevokeData,
  UpdateRewardRevokeData,
  GameData,
} from "@/types/credit";
import { RewardRevoke as RewardRevokeOrigin } from "@prisma/client";
import { Prisma, RewardRevokeCreditType, ActionType } from "@prisma/client";
import { auth } from "@/lib/auth-config";
import { redirect } from "next/navigation";
import { formatKoreanNumber } from "@/lib/utils";

const ITEMS_PER_PAGE = 50;

class CreditService {
  async getRewardRevokes(
    page: number,
    filter: CreditFilter
  ): Promise<GlobalReturn<CreditTableData>> {
    const session = await auth();
    if (!session?.user) redirect("/login");

    try {
      const where: Prisma.RewardRevokeWhereInput = {
        status: filter.status,
      };

      if (filter.userId) {
        where.userId = filter.userId;
      }

      if (filter.type) {
        where.type = filter.type;
      }

      if (filter.creditType) {
        where.creditType = filter.creditType;
      }

      if (filter.startDate && filter.endDate) {
        where.createdAt = {
          gte: new Date(filter.startDate),
          lte: new Date(filter.endDate),
        };
      } else if (filter.startDate) {
        where.createdAt = { gte: new Date(filter.startDate) };
      } else if (filter.endDate) {
        where.createdAt = { lte: new Date(filter.endDate) };
      }

      if (
        filter.status === "APPROVED" &&
        (filter.approveStartDate || filter.approveEndDate)
      ) {
        where.approvedAt = {};
        if (filter.approveStartDate) {
          where.approvedAt.gte = new Date(filter.approveStartDate);
        }
        if (filter.approveEndDate) {
          where.approvedAt.lte = new Date(filter.approveEndDate);
        }
      }

      const [records, total] = await Promise.all([
        prisma.rewardRevoke.findMany({
          where,
          skip: (page - 1) * ITEMS_PER_PAGE,
          take: ITEMS_PER_PAGE,
          orderBy: { createdAt: "desc" },
          include: {
            registrant: {
              select: {
                nickname: true,
              },
            },
            approver: {
              select: {
                nickname: true,
              },
            },
          },
        }),
        prisma.rewardRevoke.count({ where }),
      ]);

      return {
        success: true,
        message: "재화 지급/회수 내역 조회 성공",
        data: {
          records: records as RewardRevoke[],
          metadata: {
            total,
            page,
            totalPages: Math.ceil(total / ITEMS_PER_PAGE),
          },
        },
        error: null,
      };
    } catch (error) {
      console.error("Get reward revokes error:", error);
      return {
        success: false,
        message: "재화 지급/회수 내역 조회 실패",
        data: null,
        error,
      };
    }
  }

  async addRewardRevokeByGame(data: RewardRevoke): Promise<any> {
    let url: string;
    const gameData: GameData = {
      user_id: data.userId,
      amount: data.amount,
      type: data.type,
    };

    switch (data.creditType) {
      case "MONEY":
        url = "updateMoney";
        break;
      case "BANK":
        url = "updateBankMoney";
        break;
      case "CREDIT":
        url = "updateCredit";
        break;
      case "CREDIT2":
        url = "updateCredit2";
        break;
      default:
        return null;
    }

    const result = await fetch(
      `${process.env.PRIVATE_API_URL}/DokkuApi/${url}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(gameData),
      }
    );

    if (!result.ok) {
      throw new Error(`Failed to update game data: ${result.statusText}`);
    }

    return result.json();
  }

  async approveRewardRevokes(ids: string[]): Promise<GlobalReturn<boolean>> {
    const session = await auth();
    if (!session?.user) redirect("/login");

    const rewardRevokes = await prisma.rewardRevoke.findMany({
      where: {
        id: { in: ids },
        status: "PENDING",
      },
    });

    try {
      await prisma.$transaction(async (prisma) => {
        await prisma.rewardRevoke.updateMany({
          where: {
            id: { in: ids },
            status: "PENDING",
          },
          data: {
            approverId: session.user?.id,
            isApproved: true,
            status: "APPROVED",
            approvedAt: new Date(),
          },
        });

        for (const revoke of rewardRevokes) {
          await this.addRewardRevokeByGame(revoke as RewardRevoke);
        }

        await prisma.accountUsingQuerylog.createMany({
          data: rewardRevokes.map((revoke) => ({
            content: `재화 ${
              revoke.type === "ADD" ? "지급" : "회수"
            } 티켓 승인 - [${revoke.creditType}] ${formatKoreanNumber(
              Number(revoke.amount)
            )}원 / 대상: ${revoke.userId}`,
            registrantId: session.user?.id,
          })),
        });
      });

      return {
        success: true,
        message: "재화 지급/회수 승인 성공",
        data: true,
        error: null,
      };
    } catch (error) {
      console.error("Approve reward revokes error:", error);
      return {
        success: false,
        message: "재화 지급/회수 승인 실패",
        data: null,
        error,
      };
    }
  }

  async rejectRewardRevokes(ids: string[]): Promise<GlobalReturn<boolean>> {
    const session = await auth();
    if (!session?.user) redirect("/login");

    try {
      await prisma.$transaction(async (prisma) => {
        await prisma.rewardRevoke.updateMany({
          where: {
            id: { in: ids },
            status: "PENDING",
          },
          data: {
            status: "REJECTED",
            approverId: session.user?.id,
            approvedAt: new Date(),
          },
        });

        await prisma.accountUsingQuerylog.createMany({
          data: ids.map((id) => ({
            content: `재화 지급/회수 티켓 거절 - [${id}] 건 / 대상: ${session.user?.id}`,
            registrantId: session.user?.id,
          })),
        });
      });

      return {
        success: true,
        message: "재화 지급/회수 거절 성공",
        data: true,
        error: null,
      };
    } catch (error) {
      console.error("Reject reward revokes error:", error);
      return {
        success: false,
        message: "재화 지급/회수 거절 실패",
        data: null,
        error,
      };
    }
  }

  async cancelRewardRevokes(ids: string[]): Promise<GlobalReturn<boolean>> {
    const session = await auth();
    if (!session?.user) redirect("/login");

    try {
      await prisma.rewardRevoke.updateMany({
        where: {
          id: { in: ids },
          status: "PENDING",
          registrantId: session.user?.id,
        },
        data: {
          status: "CANCELLED",
        },
      });

      await prisma.accountUsingQuerylog.createMany({
        data: ids.map((id) => ({
          content: `재화 지급/회수 티켓 취소 - [${id}] 건 / 대상: ${session.user?.id}`,
          registrantId: session.user?.id,
        })),
      });

      return {
        success: true,
        message: "재화 지급/회수 취소 성공",
        data: true,
        error: null,
      };
    } catch (error) {
      console.error("Cancel reward revokes error:", error);
      return {
        success: false,
        message: "재화 지급/회수 취소 실패",
        data: null,
        error,
      };
    }
  }

  async createRewardRevoke(
    data: CreateRewardRevokeData
  ): Promise<GlobalReturn<RewardRevoke>> {
    const session = await auth();
    if (!session?.user) redirect("/login");

    try {
      const record = await prisma.rewardRevoke.create({
        data: {
          userId: Number(data.userId),
          creditType: data.creditType,
          type: data.type,
          amount: data.amount,
          reason: data.reason,
          registrantId: session.user.id,
          status: "PENDING",
        },
      });

      await prisma.accountUsingQuerylog.create({
        data: {
          content: `재화 ${
            data.type === "ADD" ? "지급" : "회수"
          } 티켓 생성 - [${data.creditType}] ${formatKoreanNumber(
            Number(data.amount)
          )}원 / 대상: ${data.userId}`,
          registrantId: session.user.id,
        },
      });

      return {
        success: true,
        message: "재화 지급/회수 티켓이 생성되었습니다.",
        data: record as RewardRevoke,
        error: null,
      };
    } catch (error) {
      console.error("Create reward revoke error:", error);
      return {
        success: false,
        message: "재화 지급/회수 티켓 생성에 실패했습니다.",
        data: null,
        error,
      };
    }
  }

  async deleteRewardRevoke(id: string): Promise<GlobalReturn<boolean>> {
    const session = await auth();
    if (!session?.user) redirect("/login");

    try {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
      });

      if (!user || user.role !== "SUPERMASTER") {
        return {
          success: false,
          message: "삭제 권한이 없습니다.",
          data: null,
          error: new Error("Unauthorized"),
        };
      }

      const result = await prisma.$transaction(async (prisma) => {
        const deleteResult = await prisma.rewardRevoke.delete({
          where: { id },
        });

        const logResult = await prisma.accountUsingQuerylog.create({
          data: {
            content: `재화 ${
              deleteResult.type === "ADD" ? "지급" : "회수"
            } 티켓 삭제 - [${deleteResult.creditType}] ${formatKoreanNumber(
              Number(deleteResult.amount)
            )}원 / 대상: ${deleteResult.userId}`,
            registrantId: session.user?.id,
          },
        });

        return { deleteResult, logResult };
      });

      return {
        success: true,
        message: "재화 지급/회수 기록이 삭제되었습니다.",
        data: true,
        error: null,
      };
    } catch (error) {
      console.error("Delete reward revoke error:", error);
      return {
        success: false,
        message: "재화 지급/회수 기록 삭제에 실패했습니다.",
        data: null,
        error,
      };
    }
  }

  async updateRewardRevoke(
    id: string,
    data: UpdateRewardRevokeData
  ): Promise<GlobalReturn<RewardRevoke>> {
    const session = await auth();
    if (!session?.user) redirect("/login");

    try {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
      });

      if (!user || user.role !== "SUPERMASTER") {
        return {
          success: false,
          message: "수정 권한이 없습니다.",
          data: null,
          error: new Error("Unauthorized"),
        };
      }

      const result = await prisma.$transaction(async (prisma) => {
        const updateResult = await prisma.rewardRevoke.update({
          where: { id, status: "PENDING" },
          data: {
            userId: Number(data.userId),
            creditType: data.creditType,
            type: data.type,
            amount: data.amount,
            reason: data.reason,
            registrantId: session.user?.id,
          },
        });

        const logResult = await prisma.accountUsingQuerylog.create({
          data: {
            content: `재화 ${
              data.type === "ADD" ? "지급" : "회수"
            } 티켓 수정 - [${data.creditType}] ${formatKoreanNumber(
              Number(data.amount)
            )}원 / 대상: ${data.userId}`,
            registrantId: session.user?.id,
          },
        });

        return { updateResult, logResult };
      });

      return {
        success: true,
        message: "재화 지급/회수 정보가 수정되었습니다.",
        data: result.updateResult as RewardRevoke,
        error: null,
      };
    } catch (error) {
      console.error("Update reward revoke error:", error);
      return {
        success: false,
        message: "재화 지급/회수 정보 수정에 실패했습니다.",
        data: null,
        error,
      };
    }
  }

  async approveAllRewardRevokes(): Promise<GlobalReturn<boolean>> {
    const session = await auth();
    if (!session?.user) redirect("/login");

    try {
      const rewardRevokes = await prisma.rewardRevoke.findMany({
        where: { status: "PENDING" },
      });

      await prisma.rewardRevoke.updateMany({
        where: { status: "PENDING" },
        data: {
          status: "APPROVED",
          isApproved: true,
          approvedAt: new Date(),
          approverId: session.user.id,
        },
      });

      await prisma.accountUsingQuerylog.create({
        data: {
          content: `재화 지급/회수 티켓 전체 승인 처리 (${rewardRevokes.length}건)`,
          registrantId: session.user.id,
        },
      });

      return {
        success: true,
        message: "재화 지급/회수 승인 성공",
        data: true,
        error: null,
      };
    } catch (error) {
      console.error("Approve all reward revokes error:", error);
      return {
        success: false,
        message: "재화 지급/회수 승인 실패",
        data: null,
        error,
      };
    }
  }

  async rejectAllRewardRevokes(): Promise<GlobalReturn<boolean>> {
    const session = await auth();
    if (!session?.user) redirect("/login");

    try {
      const rewardRevokes = await prisma.rewardRevoke.findMany({
        where: { status: "PENDING" },
      });

      await prisma.rewardRevoke.updateMany({
        where: { status: "PENDING" },
        data: {
          status: "REJECTED",
          approvedAt: new Date(),
          approverId: session.user.id,
        },
      });

      await prisma.accountUsingQuerylog.create({
        data: {
          content: `재화 지급/회수 티켓 전체 거절 처리 (${rewardRevokes.length}건)`,
          registrantId: session.user.id,
        },
      });

      return {
        success: true,
        message: "재화 지급/회수 거절 성공",
        data: true,
        error: null,
      };
    } catch (error) {
      console.error("Reject all reward revokes error:", error);
      return {
        success: false,
        message: "재화 지급/회수 거절 실패",
        data: null,
        error,
      };
    }
  }

  async getRewardRevokeByIdsOrigin(
    ids: string[]
  ): Promise<GlobalReturn<RewardRevokeOrigin[]>> {
    try {
      const records = await prisma.rewardRevoke.findMany({
        where: {
          id: { in: ids },
        },
      });

      return {
        success: true,
        message: "선택된 재화 지급/회수 내역 조회 성공",
        data: records as RewardRevokeOrigin[],
        error: null,
      };
    } catch (error) {
      console.error("Get reward revoke by IDs error:", error);
      return {
        success: false,
        message: "선택된 재화 지급/회수 내역 조회 실패",
        data: null,
        error,
      };
    }
  }
}

export const creditService = new CreditService();