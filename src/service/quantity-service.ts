import prisma from "@/db/prisma";
import { ItemQuantityFilter } from "@/types/filters/quantity-filter";
import {
  CreateItemQuantityData,
  ItemQuantityTableData,
  ItemQuantity,
} from "@/types/quantity";
import { Prisma, ItemQuantity as ItemQuantityOrigin } from "@prisma/client";
import { auth } from "@/lib/auth-config";
import { redirect } from "next/navigation";
import { UpdateUserData } from "@/types/user";
import { ApiResponse } from "@/types/global.dto";
import { userService } from "./user-service";
import { logService } from "./log-service";

const ITEMS_PER_PAGE = 50;
const BATCH_SIZE = 100;

class ItemQuantityService {
  private buildWhereClause(
    filter: ItemQuantityFilter
  ): Prisma.ItemQuantityWhereInput {
    const where: Prisma.ItemQuantityWhereInput = {
      status: filter.status,
      ...(filter.userId && { userId: filter.userId }),
    };

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
      where.approvedAt = {
        ...(filter.approveStartDate && {
          gte: new Date(filter.approveStartDate),
        }),
        ...(filter.approveEndDate && { lte: new Date(filter.approveEndDate) }),
      };
    }

    return where;
  }

  async getItemQuantities(
    page: number,
    filter: ItemQuantityFilter
  ): Promise<ApiResponse<ItemQuantityTableData>> {
    const session = await auth();
    if (!session?.user) return redirect("/login");

    try {
      const where = this.buildWhereClause(filter);

      // Promise.all로 병렬 처리
      const [records, total] = await Promise.all([
        prisma.itemQuantity.findMany({
          where,
          skip: (page - 1) * ITEMS_PER_PAGE,
          take: ITEMS_PER_PAGE,
          orderBy: { createdAt: "desc" },
          include: {
            registrant: { select: { nickname: true } },
            approver: { select: { nickname: true } },
          },
        }),
        prisma.itemQuantity.count({ where }),
      ]);

      return {
        success: true,
        data: {
          records: records as ItemQuantity[],
          metadata: {
            total,
            page,
            totalPages: Math.ceil(total / ITEMS_PER_PAGE),
          },
        },
        error: null,
      };
    } catch (error) {
      console.error("Get item quantities error:", error);
      return {
        success: false,
        error: "아이템 지급/회수 내역 조회 실패",
        data: null,
      };
    }
  }

  async approveItemQuantities(ids: string[]): Promise<ApiResponse<any[]>> {
    const session = await auth();
    if (!session?.user) return redirect("/login");

    try {
      const approveResults: any[] = [];

      // 청크 단위로 처리하여 메모리 효율성 개선
      const chunks = this.chunkArray(ids, BATCH_SIZE);

      await Promise.all(
        chunks.map(async (chunkIds) => {
          await prisma.$transaction(async (prisma) => {
            const itemQuantities = await prisma.itemQuantity.findMany({
              where: {
                id: { in: chunkIds },
                status: "PENDING",
              },
            });

            // 게임 업데이트 병렬 처리
            for (const item of itemQuantities) {
              const [result, nickname] = await Promise.all([
                this.updateItemQuantityByGame({
                  user_id: String(item.userId),
                  itemcode: item.itemId,
                  amount: Number(item.amount),
                  type: item.type.toLowerCase() as "add" | "remove",
                }),
                userService.getGameNicknameByUserId(item.userId),
              ]);

              if (result.success) {
                approveResults.push({
                  nickname: nickname.data,
                  amount: item.amount,
                  finalAmount: result?.finalAmount,
                  result: result.success,
                  userId: item.userId,
                  itemName: item.itemName,
                  online: result.isOnline,
                });
              } else {
                throw new Error(
                  `Failed to apply game changes for quantity ${item.id}`
                );
              }
            }

            await prisma.itemQuantity.updateMany({
              where: { id: { in: chunkIds }, status: "PENDING" },
              data: {
                status: "APPROVED",
                isApproved: true,
                approvedAt: new Date(),
                approverId: session.user!.id,
              },
            });
          });
        })
      );

      await logService.writeAdminLog(
        `아이템 지급/회수 티켓 승인 처리 (${ids.length}건)`
      );

      return { success: true, data: approveResults, error: null };
    } catch (error) {
      console.error("Approve item quantities error:", error);
      return {
        success: false,
        error: "아이템 지급/회수 승인 실패",
        data: null,
      };
    }
  }

  async approveAllItemQuantities(): Promise<ApiResponse<any[]>> {
    const session = await auth();
    if (!session?.user) return redirect("/login");

    try {
      const approveResults: any[] = [];
      const pendingItems = await prisma.itemQuantity.findMany({
        where: { status: "PENDING" },
      });

      if (pendingItems.length === 0) {
        return {
          success: false,
          error: "승인할 티켓이 없습니다.",
          data: null,
        };
      }

      // 청크 단위로 처리
      const chunks = this.chunkArray(
        pendingItems.map((item) => item.id),
        BATCH_SIZE
      );

      await Promise.all(
        chunks.map(async (chunkIds) => {
          await prisma.$transaction(async (prisma) => {
            const itemQuantities = await prisma.itemQuantity.findMany({
              where: {
                id: { in: chunkIds },
                status: "PENDING",
              },
            });

            // 게임 업데이트 병렬 처리
            for (const item of itemQuantities) {
              const [result, nickname] = await Promise.all([
                this.updateItemQuantityByGame({
                  user_id: String(item.userId),
                  itemcode: item.itemId,
                  amount: Number(item.amount),
                  type: item.type.toLowerCase() as "add" | "remove",
                }),
                userService.getGameNicknameByUserId(item.userId),
              ]);

              if (result.success) {
                approveResults.push({
                  nickname: nickname.data,
                  amount: item.amount,
                  finalAmount: result?.finalAmount,
                  result: result.success,
                  userId: item.userId,
                  itemName: item.itemName,
                  online: result.isOnline,
                });
              } else {
                throw new Error(
                  `Failed to apply game changes for quantity ${item.id}`
                );
              }
            }

            await prisma.itemQuantity.updateMany({
              where: { id: { in: chunkIds }, status: "PENDING" },
              data: {
                status: "APPROVED",
                isApproved: true,
                approvedAt: new Date(),
                approverId: session.user!.id,
              },
            });
          });
        })
      );

      await logService.writeAdminLog(
        `아이템 지급/회수 티켓 전체 승인 처리 (${pendingItems.length}건)`
      );

      return { success: true, data: approveResults, error: null };
    } catch (error) {
      console.error("Approve all item quantities error:", error);
      return {
        success: false,
        error: "아이템 지급/회수 전체 승인 실패",
        data: null,
      };
    }
  }

  async rejectItemQuantities(ids: string[]): Promise<ApiResponse<boolean>> {
    const session = await auth();
    if (!session?.user) return redirect("/login");

    try {
      // 청크 단위로 처리
      const chunks = this.chunkArray(ids, BATCH_SIZE);

      await Promise.all(
        chunks.map(async (chunkIds) => {
          await prisma.$transaction(async (prisma) => {
            await prisma.itemQuantity.updateMany({
              where: {
                id: { in: chunkIds },
                status: "PENDING",
              },
              data: {
                status: "REJECTED",
                approverId: session.user!.id,
                approvedAt: new Date(),
              },
            });

            await logService.writeAdminLog(
              `아이템 지급/회수 티켓 거절 - [${chunkIds.length}] 건`
            );
          });
        })
      );

      return { success: true, data: true, error: null };
    } catch (error) {
      console.error("Reject item quantities error:", error);
      return {
        success: false,
        error: "아이템 지급/회수 거절 실패",
        data: null,
      };
    }
  }

  async rejectAllItemQuantities(): Promise<ApiResponse<boolean>> {
    const session = await auth();
    if (!session?.user) return redirect("/login");

    try {
      const count = await prisma.itemQuantity.count({
        where: { status: "PENDING" },
      });

      if (count === 0) {
        return {
          success: false,
          error: "거절할 티켓이 없습니다.",
          data: null,
        };
      }

      await prisma.$transaction(async (prisma) => {
        await prisma.itemQuantity.updateMany({
          where: { status: "PENDING" },
          data: {
            status: "REJECTED",
            approvedAt: new Date(),
            approverId: session.user!.id as string,
          },
        });

        await logService.writeAdminLog(
          `아이템 지급/회수 티켓 전체 거절 처리 (${count}건)`
        );
      });

      return { success: true, data: true, error: null };
    } catch (error) {
      console.error("Reject all item quantities error:", error);
      return {
        success: false,
        error: "아이템 지급/회수 거절 실패",
        data: null,
      };
    }
  }

  async cancelItemQuantity(ids: string[]): Promise<ApiResponse<boolean>> {
    const session = await auth();
    if (!session?.user) return redirect("/login");

    try {
      const chunks = this.chunkArray(ids, BATCH_SIZE);

      await Promise.all(
        chunks.map(async (chunkIds) => {
          await prisma.$transaction(async (prisma) => {
            await prisma.itemQuantity.updateMany({
              where: {
                id: { in: chunkIds },
                status: "PENDING",
                registrantId: session.user!.id,
              },
              data: { status: "CANCELLED" },
            }),
              logService.writeAdminLog(
                `아이템 지급/회수 티켓 취소 - [${chunkIds.length}] 건`
              );
          });
        })
      );

      return { success: true, data: true, error: null };
    } catch (error) {
      console.error("Cancel item quantity error:", error);
      return {
        success: false,
        error: "아이템 지급/회수 취소 실패",
        data: null,
      };
    }
  }

  async deleteItemQuantity(id: string): Promise<ApiResponse<boolean>> {
    const session = await auth();
    if (!session?.user) return redirect("/login");

    try {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
      });

      if (!user || user.role !== "SUPERMASTER") {
        return {
          success: false,
          error: "삭제 권한이 없습니다.",
          data: null,
        };
      }

      const result = await prisma.$transaction(async (prisma) => {
        const deleteResult = await prisma.itemQuantity.delete({
          where: { id },
        });

        await logService.writeAdminLog(
          `아이템 ${deleteResult.type === "ADD" ? "지급" : "회수"
          } 티켓 삭제 - [${deleteResult.itemName}] ${deleteResult.amount
          }개 / 대상: ${deleteResult.userId}`
        );

        return deleteResult;
      });

      return { success: true, data: true, error: null };
    } catch (error) {
      console.error("Delete item quantity error:", error);
      return {
        success: false,
        error: "아이템 지급/회수 기록 삭제에 실패했습니다.",
        data: null,
      };
    }
  }

  async updateItemQuantity(
    id: string,
    data: {
      userId: number;
      itemId: string;
      itemName: string;
      amount: string;
      type: "ADD" | "REMOVE";
      reason: string;
    }
  ): Promise<ApiResponse<ItemQuantity>> {
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
          error: "수정 권한이 없습니다.",
          data: null,
        };
      }

      const result = await prisma.$transaction(async (prisma) => {
        const updateResult = await prisma.itemQuantity.update({
          where: { id, status: "PENDING" },
          data: {
            userId: Number(data.userId),
            itemId: data.itemId,
            itemName: data.itemName,
            amount: data.amount,
            type: data.type,
            reason: data.reason,
            registrantId: session.user!.id,
          },
        });

        await logService.writeAdminLog(
          `아이템 ${data.type === "ADD" ? "지급" : "회수"} 티켓 수정 - [${data.itemName
          }] ${data.amount}개 / 대상: ${data.userId}`
        );

        return updateResult;
      });

      return {
        success: true,
        data: result as ItemQuantity,
        error: null,
      };
    } catch (error) {
      console.error("Update item quantity error:", error);
      return {
        success: false,
        error: "아이템 지급/회수 정보 수정에 실패했습니다.",
        data: null,
      };
    }
  }

  async getItemQuantitiesByIdsOrigin(
    ids: string[]
  ): Promise<ApiResponse<ItemQuantityOrigin[]>> {
    try {
      const chunks = this.chunkArray(ids, BATCH_SIZE);
      const results = await Promise.all(
        chunks.map((chunkIds) =>
          prisma.itemQuantity.findMany({
            where: { id: { in: chunkIds } },
          })
        )
      );

      return {
        success: true,
        data: results.flat() as ItemQuantityOrigin[],
        error: null,
      };
    } catch (error) {
      console.error("Get Item Quantity by IDs error:", error);
      return {
        success: false,
        error: "선택된 아이템 지급/회수 내역 조회 실패",
        data: null,
      };
    }
  }

  async createItemQuantity(
    data: CreateItemQuantityData
  ): Promise<ApiResponse<ItemQuantity[]>> {
    const session = await auth();
    if (!session?.user) return redirect("/login");

    try {
      const nicknameResult = await userService.getGameNicknameByUserId(
        Number(data.userId)
      );

      const result = await prisma.$transaction(async (prisma) => {
        const createdItems: ItemQuantityOrigin[] = [];

        for (const item of data.items) {
          const createResult = await prisma.itemQuantity.create({
            data: {
              userId: Number(data.userId),
              nickname: nicknameResult.data || "",
              itemId: item.itemId,
              itemName: item.itemName,
              amount: item.amount,
              type: data.type,
              reason: data.reason,
              status: "PENDING",
              registrantId: session.user!.id,
            },
            include: {
              registrant: {
                select: { nickname: true },
              },
              approver: {
                select: { nickname: true },
              },
            },
          });
          createdItems.push(createResult);
        }

        await logService.writeAdminLog(
          `아이템 ${data.type === "ADD" ? "지급" : "회수"} 티켓 생성 - [${data.items.length
          }건] / 대상: ${data.userId}`
        );

        return createdItems;
      });

      return {
        success: true,
        data: result as ItemQuantity[],
        error: null,
      };
    } catch (error) {
      console.error("Create item quantity error:", error);
      return {
        success: false,
        error: "아이템 지급/회수 생성에 실패했습니다.",
        data: null,
      };
    }
  }

  // 유틸리티 메서드
  private chunkArray<T>(array: T[], size: number): T[][] {
    return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
      array.slice(i * size, (i + 1) * size)
    );
  }

  private async updateItemQuantityByGame(data: UpdateUserData): Promise<
    | {
      finalAmount: number;
      itemName: string;
      isOnline: boolean;
      success: boolean;
    }
    | any
  > {
    const response = await fetch(
      `${process.env.PRIVATE_API_URL}/DokkuApi/updatePlayerItem`,
      {
        method: "POST",
        headers: {
          key: process.env.PRIVATE_API_KEY || "",
        },
        body: JSON.stringify(data),
      }
    );

    return response.json();
  }
}

export const itemQuantityService = new ItemQuantityService();
