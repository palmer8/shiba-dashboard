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
import { userService } from "./user-service";
import { logService } from "./log-service";
import pool from "@/db/mysql"; // MySQL 연결 풀 가져오기
import { ResultSetHeader } from "mysql2"; // 타입 추가

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
                nickname: true,
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

  /**
   * Private API를 통해 게임 재화(현금, 계좌)를 업데이트합니다.
   */
  private async updateGameDataViaApi(data: {
    userId: number;
    amount: string;
    type: ActionType;
    creditType: "MONEY" | "BANK";
  }): Promise<{ success: boolean; resultMoney?: number }> {
    let urlSegment: string;
    const gameData = {
      user_id: Number(data.userId),
      amount: Number(data.amount),
      type: data.type === "ADD" ? "add" : "subtract",
    };

    switch (data.creditType) {
      case "MONEY":
        urlSegment = "updateMoney";
        break;
      case "BANK":
        urlSegment = "updateBankMoney";
        break;
      // CREDIT, CREDIT2, CURRENT_COIN은 여기서 처리하지 않음
      default:
        console.error(
          "Unsupported credit type for API update:",
          data.creditType
        );
        return { success: false };
    }

    try {
      const response = await fetch(
        `${process.env.PRIVATE_API_URL}/DokkuApi/${urlSegment}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            key: process.env.PRIVATE_API_KEY || "",
          },
          body: JSON.stringify(gameData),
        }
      );
      if (!response.ok) {
        const errorBody = await response.text();
        console.error(
          `API Error for ${urlSegment} (${response.status}): ${errorBody}`
        );
        return { success: false };
      }
      return response.json(); // { success: boolean, resultMoney?: number } 형태를 기대
    } catch (error) {
      console.error(`Fetch Error for ${urlSegment}:`, error);
      return { success: false };
    }
  }

  /**
   * MySQL DB를 직접 업데이트하여 캐시 및 마일리지 재화를 조정합니다.
   */
  private async updateCashshopData(data: {
    userId: number;
    amount: number;
    type: ActionType;
    creditType: "CREDIT" | "CREDIT2" | "CURRENT_COIN";
  }): Promise<{ success: boolean }> {
    let sql: string;
    const params: number[] = [];
    const operator = data.type === "ADD" ? "+" : "-";

    switch (data.creditType) {
      case "CREDIT": // 무료캐시: current_cash 만 조정
        sql = `UPDATE dokku_cashshop SET current_cash = current_cash ${operator} ? WHERE user_id = ?`;
        params.push(data.amount, data.userId);
        break;
      case "CREDIT2": // 유료캐시: current_cash 및 cumulative_cash 조정
        sql = `UPDATE dokku_cashshop SET current_cash = current_cash ${operator} ?, cumulative_cash = cumulative_cash ${operator} ? WHERE user_id = ?`;
        params.push(data.amount, data.amount, data.userId);
        break;
      case "CURRENT_COIN": // 마일리지: current_coin 만 조정
        sql = `UPDATE dokku_cashshop SET current_coin = current_coin ${operator} ? WHERE user_id = ?`;
        params.push(data.amount, data.userId);
        break;
      default:
        console.error(
          "Unsupported credit type for DB update:",
          data.creditType
        );
        return { success: false };
    }

    try {
      const connection = await pool.getConnection(); // 풀에서 연결 가져오기
      const [result] = await connection.execute<ResultSetHeader>(sql, params);
      connection.release(); // 연결 반환

      if (result.affectedRows > 0) {
        console.log(
          `DB update success for user ${data.userId}, type ${data.creditType}, amount ${data.amount}, action ${data.type}`
        );
        return { success: true };
      } else {
        console.warn(
          `DB update affected 0 rows for user ${data.userId}, type ${data.creditType}. User might not exist in dokku_cashshop.`
        );
        // 사용자가 테이블에 없는 경우 실패로 간주하지 않을 수 있음 (정책에 따라 결정)
        // 여기서는 일단 성공으로 간주하지 않음 (업데이트 대상이 없었으므로)
        return { success: false };
      }
    } catch (error) {
      console.error(
        `DB update error for user ${data.userId}, type ${data.creditType}:`,
        error
      );
      return { success: false };
    }
  }

  async approveRewardRevokes(ids: string[]): Promise<ApiResponse<any[]>> {
    const session = await auth();
    if (!session?.user) return redirect("/login");

    let approveResults: any[] = []; // catch 블록에서도 접근 가능하도록 스코프 변경

    try {
      // Prisma 트랜잭션 시작 (DB 업데이트는 트랜잭션 밖에서 수행)
      const rewardRevokes = await prisma.rewardRevoke.findMany({
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

      // 게임 서버/DB 업데이트 처리
      for (const revoke of rewardRevokes) {
        let updateResult: { success: boolean; resultMoney?: number };
        const nicknameResult = await userService.getGameNicknameByUserId(
          revoke.userId
        );
        const nickname = nicknameResult.data || `User(${revoke.userId})`; // 닉네임 조회 실패 시 ID 사용

        if (revoke.creditType === "MONEY" || revoke.creditType === "BANK") {
          // API 호출
          updateResult = await this.updateGameDataViaApi({
            userId: revoke.userId,
            amount: revoke.amount, // API는 문자열 금액을 받을 수 있으므로 그대로 전달
            type: revoke.type,
            creditType: revoke.creditType, // MONEY 또는 BANK
          });
        } else if (
          revoke.creditType === "CREDIT" ||
          revoke.creditType === "CREDIT2" ||
          revoke.creditType === "CURRENT_COIN"
        ) {
          // DB 직접 업데이트
          const amountNumber = Number(revoke.amount); // DB는 숫자 금액 필요
          if (isNaN(amountNumber)) {
            console.error(
              `Invalid amount for DB update: ${revoke.amount} (ID: ${revoke.id})`
            );
            updateResult = { success: false };
          } else {
            updateResult = await this.updateCashshopData({
              userId: revoke.userId,
              amount: amountNumber,
              type: revoke.type,
              creditType: revoke.creditType, // CREDIT, CREDIT2, CURRENT_COIN
            });
          }
        } else {
          // 지원하지 않는 타입
          console.error(
            `Unsupported creditType for approval: ${revoke.creditType} (ID: ${revoke.id})`
          );
          updateResult = { success: false };
        }

        // 결과 기록
        approveResults.push({
          id: revoke.id, // 어떤 티켓에 대한 결과인지 식별하기 위해 ID 추가
          nickname: nickname,
          amount: revoke.amount,
          finalAmount: updateResult.resultMoney, // API 호출 시에만 존재, DB 업데이트 시 undefined
          result: updateResult.success,
          userId: revoke.userId,
          creditType: revoke.creditType,
        });
      }

      // 성공한 업데이트만 골라서 Prisma 상태 업데이트
      const successfulRevokeIds = approveResults
        .filter((r) => r.result)
        .map((r) => r.id);

      if (successfulRevokeIds.length > 0) {
        await prisma.$transaction(async (tx) => {
          await tx.rewardRevoke.updateMany({
            where: {
              id: { in: successfulRevokeIds },
              status: "PENDING", // 다시 한번 확인
            },
            data: {
              status: "APPROVED",
              approverId: session.user!.id,
              approvedAt: new Date(),
              isApproved: true, // 필요하다면 이 필드 사용
            },
          });

          // 로그 생성 (성공 건수 기준)
          await tx.accountUsingQuerylog.create({
            data: {
              content: `재화 지급/회수 티켓 승인 처리 (${successfulRevokeIds.length}건 성공)`,
              registrantId: session.user!.id,
            },
          });
        });
        revalidateTag("reward-revokes");
      }

      // 최종 결과 반환 (성공/실패 포함)
      return { success: true, error: null, data: approveResults };
    } catch (error) {
      console.error("Approve reward revokes error:", error);
      // 실패한 경우에도 approveResults 일부가 있을 수 있으므로, 부분 성공/실패를 나타내기 위해 그대로 반환하거나 별도 처리
      return {
        success: false,
        error: "재화 지급/회수 승인 중 오류 발생",
        data: approveResults, // 부분 결과 포함 가능
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

  // async updateCredit(userId: number, amount: number) {
  //   const session = await auth();
  //   if (!session?.user) return redirect("/login");

  // }

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
          throw new Error(
            "No matching records found to cancel or unauthorized"
          );
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
        error:
          "재화 지급/회수 취소 실패: " +
          (error instanceof Error ? error.message : "알 수 없는 오류"),
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
          nickname: true,
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

  // approveAllRewardRevokes 함수 수정 필요
  async approveAllRewardRevokes(): Promise<ApiResponse<any[]>> {
    const session = await auth();
    if (!session?.user) return redirect("/login");

    try {
      const approveResults: any[] = [];
      const rewardRevokes = await prisma.rewardRevoke.findMany({
        where: { status: "PENDING" },
        select: {
          id: true,
          userId: true,
          amount: true,
          type: true,
          creditType: true,
        },
      });

      // 게임 서버/DB 업데이트 처리
      for (const revoke of rewardRevokes) {
        let updateResult: { success: boolean; resultMoney?: number };
        const nicknameResult = await userService.getGameNicknameByUserId(
          revoke.userId
        );
        const nickname = nicknameResult.data || `User(${revoke.userId})`; // 닉네임 조회 실패 시 ID 사용

        if (revoke.creditType === "MONEY" || revoke.creditType === "BANK") {
          // API 호출
          updateResult = await this.updateGameDataViaApi({
            userId: revoke.userId,
            amount: revoke.amount,
            type: revoke.type,
            creditType: revoke.creditType,
          });
        } else if (
          revoke.creditType === "CREDIT" ||
          revoke.creditType === "CREDIT2" ||
          revoke.creditType === "CURRENT_COIN"
        ) {
          // DB 직접 업데이트
          const amountNumber = Number(revoke.amount);
          if (isNaN(amountNumber)) {
            console.error(
              `Invalid amount for DB update: ${revoke.amount} (ID: ${revoke.id})`
            );
            updateResult = { success: false };
          } else {
            updateResult = await this.updateCashshopData({
              userId: revoke.userId,
              amount: amountNumber,
              type: revoke.type,
              creditType: revoke.creditType,
            });
          }
        } else {
          // 지원하지 않는 타입
          console.error(
            `Unsupported creditType for approval: ${revoke.creditType} (ID: ${revoke.id})`
          );
          updateResult = { success: false };
        }

        // 결과 기록
        approveResults.push({
          id: revoke.id,
          nickname: nickname,
          amount: revoke.amount,
          finalAmount: updateResult.resultMoney,
          result: updateResult.success,
          userId: revoke.userId,
          creditType: revoke.creditType,
        });
      }

      // 성공한 업데이트만 골라서 Prisma 상태 업데이트
      const successfulRevokeIds = approveResults
        .filter((r) => r.result)
        .map((r) => r.id);

      if (successfulRevokeIds.length > 0) {
        await prisma.$transaction(async (tx) => {
          await tx.rewardRevoke.updateMany({
            where: {
              id: { in: successfulRevokeIds },
              status: "PENDING",
            },
            data: {
              status: "APPROVED",
              approverId: session.user!.id,
              approvedAt: new Date(),
              isApproved: true,
            },
          });

          // 로그 생성 (성공 건수 기준)
          await tx.accountUsingQuerylog.create({
            data: {
              content: `재화 지급/회수 티켓 전체 승인 처리 (${successfulRevokeIds.length}건 성공 / ${rewardRevokes.length}건 시도)`,
              registrantId: session.user!.id,
            },
          });
        });
        revalidateTag("reward-revokes");
      }

      return { success: true, error: null, data: approveResults }; // 성공/실패 결과 포함 반환
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
      const nicknameResult = await userService.getGameNicknameByUserId(
        Number(data.userId)
      );

      // amount가 숫자인지, 양수인지 등 유효성 검사 추가 가능
      const amountNumber = Number(data.amount);
      if (isNaN(amountNumber) || amountNumber <= 0) {
        return {
          success: false,
          error: "유효하지 않은 수량입니다.",
          data: null,
        };
      }

      await prisma.rewardRevoke.create({
        data: {
          userId: Number(data.userId),
          nickname: nicknameResult.data || "", // 닉네임 조회 실패 시 빈 문자열 저장
          type: data.type,
          creditType: data.creditType,
          amount: data.amount, // Prisma 스키마가 amount를 String으로 기대한다면 그대로 저장
          reason: data.reason,
          registrantId: session.user.id,
        },
      });

      await logService.writeAdminLog(
        `재화 지급/회수 티켓 생성 : User ${data.userId}, Type ${data.creditType}, Amount ${data.amount}, Reason ${data.reason}`
      );

      revalidateTag("reward-revokes"); // 생성 후 캐시 무효화
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
      await prisma.$transaction(async (tx) => {
        // 삭제 권한 확인 (예: SUPERMASTER만 가능하게)
        // if (!hasAccess(session.user.role, UserRole.SUPERMASTER)) {
        //   throw new Error("Unauthorized to delete reward revoke tickets.");
        // }

        const deletedRecord = await tx.rewardRevoke.delete({
          where: {
            id,
            // 추가 조건 가능: e.g., status: "PENDING" 또는 특정 역할만 삭제 가능
          },
        });

        await tx.accountUsingQuerylog.create({
          data: {
            content: `재화 지급/회수 티켓 삭제 : ID ${id}`,
            registrantId: session.user!.id,
          },
        });
      });

      revalidateTag("reward-revokes");
      return { success: true, error: null, data: true };
    } catch (error) {
      console.error("Delete reward revoke error:", error);
      // Prisma 에러 코드 등으로 더 구체적인 오류 메시지 제공 가능
      const errorMessage =
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
          ? "삭제할 티켓을 찾을 수 없습니다."
          : "재화 지급/회수 티켓 삭제 실패";
      return {
        success: false,
        error: errorMessage,
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
      // amount 유효성 검사
      const amountNumber = Number(data.amount);
      if (isNaN(amountNumber) || amountNumber <= 0) {
        return {
          success: false,
          error: "유효하지 않은 수량입니다.",
          data: null,
        };
      }

      const result = await prisma.$transaction(async (tx) => {
        // 닉네임 다시 조회 (userId가 변경되었을 수 있으므로)
        const nicknameResult = await userService.getGameNicknameByUserId(
          Number(data.userId)
        );

        await tx.rewardRevoke.update({
          where: {
            id,
            // 수정 권한 확인: 본인이 등록했고 PENDING 상태인 경우 또는 특정 역할
            // OR: [
            //   { registrantId: session.user!.id, status: "PENDING" },
            //   { user: { role: UserRole.SUPERMASTER } } // 예시: 슈퍼마스터는 항상 수정 가능
            // ],
            status: "PENDING", // 기본적으로 PENDING 상태만 수정 가능하도록 제한
          },
          data: {
            userId: Number(data.userId),
            nickname: nicknameResult.data || "", // 닉네임 업데이트
            type: data.type,
            creditType: data.creditType,
            amount: data.amount, // 스키마 타입에 맞게 String으로 유지
            reason: data.reason,
            // updatedAt: new Date() // Prisma가 자동으로 처리
          },
        });
        await tx.accountUsingQuerylog.create({
          data: {
            content: `재화 지급/회수 티켓 수정 : ID ${id}, Reason ${data.reason}`,
            registrantId: session.user!.id,
          },
        });
      });

      revalidateTag("reward-revokes");
      return { success: true, error: null, data: true };
    } catch (error) {
      console.error("Update reward revoke error:", error);
      const errorMessage =
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
          ? "수정할 티켓을 찾을 수 없거나 수정 권한이 없습니다."
          : "재화 지급/회수 티켓 수정 실패";
      return {
        success: false,
        error: errorMessage,
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
