import prisma from "@/db/prisma";
import { CreditFilter } from "@/types/filters/credit-filter";
import {
  RewardRevoke,
  CreditTableData,
  CreateRewardRevokeData,
  UpdateRewardRevokeData,
} from "@/types/credit";
import { Prisma, RewardRevokeCreditType, ActionType } from "@prisma/client";
import { auth } from "@/lib/auth-config";
import { redirect } from "next/navigation";
import { ApiResponse } from "@/types/global.dto";
import { unstable_cache } from "next/cache";
import { revalidateTag } from "next/cache";
import { realtimeService } from "./realtime-service";
import { userService } from "./user-service";

const ITEMS_PER_PAGE = 50;

class CreditService {
  async getRewardRevokes(
    page: number,
    filter: CreditFilter
  ): Promise<ApiResponse<CreditTableData>> {
    const session = await auth();
    if (!session?.user) return redirect("/login");

    try {
      const where: Prisma.RewardRevokeWhereInput = {
        AND: [
          { status: filter.status },
          filter.userId ? { userId: filter.userId } : {},
          filter.type ? { type: filter.type } : {},
          filter.creditType ? { creditType: filter.creditType } : {},
          filter.startDate || filter.endDate
            ? {
                createdAt: {
                  ...(filter.startDate && { gte: new Date(filter.startDate) }),
                  ...(filter.endDate && { lte: new Date(filter.endDate) }),
                },
              }
            : {},
          filter.status === "APPROVED" &&
          (filter.approveStartDate || filter.approveEndDate)
            ? {
                approvedAt: {
                  ...(filter.approveStartDate && {
                    gte: new Date(filter.approveStartDate),
                  }),
                  ...(filter.approveEndDate && {
                    lte: new Date(filter.approveEndDate),
                  }),
                },
              }
            : {},
        ].filter((condition) => Object.keys(condition).length > 0),
      };

      const getCachedData = unstable_cache(
        async () => {
          const [records, total] = await Promise.all([
            prisma.rewardRevoke.findMany({
              where,
              skip: (page - 1) * ITEMS_PER_PAGE,
              take: ITEMS_PER_PAGE,
              orderBy: { createdAt: "desc" },
              select: {
                id: true,
                userId: true,
                type: true,
                creditType: true,
                amount: true,
                reason: true,
                createdAt: true,
                approvedAt: true,
                status: true,
                registrantId: true,
                approverId: true,
                registrant: {
                  select: {
                    id: true,
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
        },
        [`reward-revokes-${JSON.stringify(where)}-${page}`],
        {
          tags: ["reward-revokes"],
          revalidate: 60,
        }
      );

      return getCachedData();
    } catch (error) {
      console.error("Get reward revokes error:", error);
      return {
        success: false,
        error: "재화 지급/회수 내역 조회 실패",
        data: null,
      };
    }
  }

  async addRewardRevokeByGame(data: {
    userId: number;
    amount: string;
    type: ActionType;
    creditType: RewardRevokeCreditType;
  }): Promise<any> {
    let url: string;
    const gameData = {
      user_id: Number(data.userId),
      amount: Number(data.amount),
      type: data.type === "ADD" ? "add" : "subtract",
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

    const response = await fetch(
      `${process.env.PRIVATE_API_URL}/DokkuApi/${url}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          key: process.env.PRIVATE_API_KEY || "",
        },
        body: JSON.stringify(gameData),
      }
    );

    return response.json();
  }

  async approveRewardRevokes(ids: string[]): Promise<ApiResponse<any[]>> {
    const session = await auth();
    if (!session?.user) return redirect("/login");

    try {
      const approveResults: any[] = [];

      await prisma.$transaction(async (tx) => {
        const rewardRevokes = await tx.rewardRevoke.findMany({
          where: {
            id: { in: ids },
            status: "PENDING",
          },
          select: {
            id: true,
            userId: true,
            amount: true,
            type: true,
            creditType: true,
          },
        });

        // 게임 서버 업데이트 - 기존 로직 유지
        for (const revoke of rewardRevokes) {
          const [result, nickname] = await Promise.all([
            this.addRewardRevokeByGame({
              userId: revoke.userId,
              amount: revoke.amount,
              type: revoke.type,
              creditType: revoke.creditType,
            }),
            userService.getGameNicknameByUserId(revoke.userId),
          ]);

          if (result.success) {
            approveResults.push({
              nickname: nickname.data,
              amount: revoke.amount,
              finalAmount: result.resultMoney,
              result: result.success,
              userId: revoke.userId,
              creditType: revoke.creditType,
            });
          } else {
            throw new Error(
              `Failed to apply game changes for revoke ${revoke.id}`
            );
          }
        }

        // 벌크 업데이트
        await tx.rewardRevoke.updateMany({
          where: {
            id: { in: ids },
            status: "PENDING",
          },
          data: {
            status: "APPROVED",
            approverId: session.user!.id,
            approvedAt: new Date(),
            isApproved: true,
          },
        });

        // 로그 생성
        await tx.accountUsingQuerylog.create({
          data: {
            content: `재화 지급/회수 티켓 승인 처리 (${ids.length}건)`,
            registrantId: session.user!.id,
          },
        });
      });

      revalidateTag("reward-revokes");
      return { success: true, error: null, data: approveResults };
    } catch (error) {
      console.error("Approve reward revokes error:", error);
      return {
        success: false,
        error: "재화 지급/회수 승인 실패",
        data: null,
      };
    }
  }

  async rejectRewardRevokes(ids: string[]): Promise<ApiResponse<boolean>> {
    const session = await auth();
    if (!session?.user) return redirect("/login");

    try {
      await prisma.$transaction(async (tx) => {
        await tx.rewardRevoke.updateMany({
          where: {
            id: { in: ids },
            status: "PENDING",
          },
          data: {
            status: "REJECTED",
            approverId: session.user!.id,
            approvedAt: new Date(),
          },
        });

        await tx.accountUsingQuerylog.create({
          data: {
            content: `재화 지급/회수 티켓 거절 처리 (${ids.length}건)`,
            registrantId: session.user!.id,
          },
        });
      });

      revalidateTag("reward-revokes");

      return {
        success: true,
        error: null,
        data: true,
      };
    } catch (error) {
      console.error("Reject reward revokes error:", error);
      return {
        success: false,
        error: "재화 지급/회수 거절 실패",
        data: null,
      };
    }
  }

  async cancelRewardRevokes(ids: string[]): Promise<ApiResponse<boolean>> {
    const session = await auth();
    if (!session?.user) return redirect("/login");

    try {
      await prisma.$transaction(async (tx) => {
        const result = await tx.rewardRevoke.updateMany({
          where: {
            id: { in: ids },
            status: "PENDING",
            registrantId: session.user!.id,
          },
          data: {
            status: "CANCELLED",
          },
        });

        if (result.count === 0) {
          throw new Error("No matching records found to cancel");
        }

        await tx.accountUsingQuerylog.create({
          data: {
            content: `재화 지급/회수 티켓 취소 처리 (${ids.length}건)`,
            registrantId: session.user!.id,
          },
        });
      });

      revalidateTag("reward-revokes");

      return {
        success: true,
        error: null,
        data: true,
      };
    } catch (error) {
      console.error("Cancel reward revokes error:", error);
      return {
        success: false,
        error: "재화 지급/회수 취소 실패",
        data: null,
      };
    }
  }

  async getRewardRevokeByIds(
    ids: string[]
  ): Promise<ApiResponse<RewardRevoke[]>> {
    const session = await auth();
    if (!session?.user) return redirect("/login");

    try {
      const records = await prisma.rewardRevoke.findMany({
        where: { id: { in: ids } },
        select: {
          id: true,
          userId: true,
          type: true,
          creditType: true,
          amount: true,
          reason: true,
          createdAt: true,
          approvedAt: true,
          status: true,
          registrantId: true,
          approverId: true,
          registrant: {
            select: {
              id: true,
              nickname: true,
            },
          },
          approver: {
            select: {
              nickname: true,
            },
          },
        },
      });

      return {
        success: true,
        error: null,
        data: records as RewardRevoke[],
      };
    } catch (error) {
      console.error("Get reward revoke by IDs error:", error);
      return {
        success: false,
        error: "선택된 재화 지급/회수 내역 조회 실패",
        data: null,
      };
    }
  }

  async approveAllRewardRevokes(): Promise<ApiResponse<any[]>> {
    const session = await auth();
    if (!session?.user) return redirect("/login");

    try {
      const approveResults: any[] = [];
      await prisma.$transaction(async (tx) => {
        const rewardRevokes = await tx.rewardRevoke.findMany({
          where: { status: "PENDING" },
          select: {
            id: true,
            userId: true,
            amount: true,
            type: true,
            creditType: true,
          },
        });

        // 게임 서버 업데이트
        for (const revoke of rewardRevokes) {
          const [result, nickname] = await Promise.all([
            this.addRewardRevokeByGame({
              userId: revoke.userId,
              amount: revoke.amount,
              type: revoke.type,
              creditType: revoke.creditType,
            }),
            userService.getGameNicknameByUserId(revoke.userId),
          ]);

          if (result.success) {
            approveResults.push({
              nickname: nickname.data,
              amount: revoke.amount,
              finalAmount: result.resultMoney,
              result: result.success,
              userId: revoke.userId,
              creditType: revoke.creditType,
            });
          } else {
            throw new Error(
              `Failed to apply game changes for revoke ${revoke.id}`
            );
          }
        }

        // 벌크 업데이트
        await tx.rewardRevoke.updateMany({
          where: { status: "PENDING" },
          data: {
            status: "APPROVED",
            approverId: session.user!.id,
            approvedAt: new Date(),
            isApproved: true,
          },
        });

        // 로그 생성
        await tx.accountUsingQuerylog.create({
          data: {
            content: `재화 지급/회수 티켓 전체 승인 처리 (${rewardRevokes.length}건)`,
            registrantId: session.user!.id,
          },
        });
      });

      revalidateTag("reward-revokes");
      return { success: true, error: null, data: approveResults };
    } catch (error) {
      console.error("Approve all reward revokes error:", error);
      return {
        success: false,
        error: "재화 지급/회수 전체 승인 실패",
        data: null,
      };
    }
  }

  async rejectAllRewardRevokes(): Promise<ApiResponse<boolean>> {
    const session = await auth();
    if (!session?.user) return redirect("/login");

    try {
      await prisma.$transaction(async (tx) => {
        const pendingCount = await tx.rewardRevoke.count({
          where: { status: "PENDING" },
        });

        await tx.rewardRevoke.updateMany({
          where: { status: "PENDING" },
          data: {
            status: "REJECTED",
            approverId: session.user!.id,
            approvedAt: new Date(),
          },
        });

        await tx.accountUsingQuerylog.create({
          data: {
            content: `재화 지급/회수 티켓 전체 거절 처리 (${pendingCount}건)`,
            registrantId: session.user!.id,
          },
        });
      });

      revalidateTag("reward-revokes");
      return { success: true, error: null, data: true };
    } catch (error) {
      console.error("Reject all reward revokes error:", error);
      return {
        success: false,
        error: "재화 지급/회수 전체 거절 실패",
        data: null,
      };
    }
  }

  async createRewardRevoke(
    data: CreateRewardRevokeData
  ): Promise<ApiResponse<boolean>> {
    const session = await auth();
    if (!session?.user) return redirect("/login");

    try {
      await prisma.rewardRevoke.create({
        data: {
          userId: Number(data.userId),
          type: data.type,
          creditType: data.creditType,
          amount: data.amount,
          reason: data.reason,
          registrantId: session.user.id,
        },
      });

      return { success: true, error: null, data: true };
    } catch (error) {
      console.error("Create reward revoke error:", error);
      return {
        success: false,
        error: "재화 지급/회수 티켓 생성 실패",
        data: null,
      };
    }
  }

  async deleteRewardRevoke(id: string): Promise<ApiResponse<boolean>> {
    const session = await auth();
    if (!session?.user) return redirect("/login");

    try {
      await prisma.rewardRevoke.delete({
        where: {
          id,
        },
      });

      return { success: true, error: null, data: true };
    } catch (error) {
      console.error("Delete reward revoke error:", error);
      return {
        success: false,
        error: "재화 지급/회수 티켓 삭제 실패",
        data: null,
      };
    }
  }

  async updateRewardRevoke(
    id: string,
    data: UpdateRewardRevokeData
  ): Promise<ApiResponse<boolean>> {
    const session = await auth();
    if (!session?.user) return redirect("/login");

    try {
      await prisma.rewardRevoke.update({
        where: {
          id,
          registrantId: session.user.id,
          status: "PENDING",
        },
        data: {
          userId: Number(data.userId),
          type: data.type,
          creditType: data.creditType,
          amount: data.amount,
          reason: data.reason,
        },
      });

      return { success: true, error: null, data: true };
    } catch (error) {
      console.error("Update reward revoke error:", error);
      return {
        success: false,
        error: "재화 지급/회수 티켓 수정 실패",
        data: null,
      };
    }
  }

  async getRewardRevokeByIdsOrigin(
    ids: string[]
  ): Promise<ApiResponse<RewardRevoke[]>> {
    const session = await auth();
    if (!session?.user) return redirect("/login");

    try {
      const records = await prisma.rewardRevoke.findMany({
        where: { id: { in: ids } },
      });

      return {
        success: true,
        error: null,
        data: records as RewardRevoke[],
      };
    } catch (error) {
      console.error("Get reward revoke by IDs origin error:", error);
      return {
        success: false,
        error: "선택된 재화 지급/회수 내역 조회 실패",
        data: null,
      };
    }
  }
}

export const creditService = new CreditService();
