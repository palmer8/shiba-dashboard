import prisma from "@/db/prisma";
import { ItemQuantityFilter } from "@/types/filters/quantity-filter";
import { GlobalReturn } from "@/types/global-return";
import {
  CreateItemQuantityData,
  ItemQuantityTableData,
  ItemQuantity,
} from "@/types/quantity";
import { Prisma, ItemQuantity as ItemQuantityOrigin } from "@prisma/client";
import { auth } from "@/lib/auth-config";
import { redirect } from "next/navigation";

const ITEMS_PER_PAGE = 50;

class ItemQuantityService {
  async getItemQuantities(
    page: number,
    filter: ItemQuantityFilter
  ): Promise<GlobalReturn<ItemQuantityTableData>> {
    const session = await auth();
    if (!session?.user) redirect("/login");

    try {
      const where: Prisma.ItemQuantityWhereInput = {
        status: filter.status,
      };

      if (filter.userId) {
        where.userId = filter.userId;
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
        prisma.itemQuantity.findMany({
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
        prisma.itemQuantity.count({ where }),
      ]);

      return {
        success: true,
        message: "아이템 지급/회수 내역 조회 성공",
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
        message: "아이템 지급/회수 내역 조회 실패",
        data: null,
        error,
      };
    }
  }

  async createItemQuantity(
    data: CreateItemQuantityData
  ): Promise<GlobalReturn<ItemQuantity>> {
    const session = await auth();
    if (!session?.user) redirect("/login");

    try {
      const record = await prisma.itemQuantity.create({
        data: {
          userId: Number(data.userId),
          itemId: data.itemId,
          itemName: data.itemName,
          amount: data.amount,
          type: data.type,
          reason: data.reason,
          registrantId: session.user.id,
          status: "PENDING",
        },
      });

      await prisma.accountUsingQuerylog.create({
        data: {
          content: `아이템 ${
            data.type === "ADD" ? "지급" : "회수"
          } 티켓 생성 - [${data.itemName}] ${data.amount}개 / 대상: ${
            data.userId
          }`,
          registrantId: session.user.id,
        },
      });

      return {
        success: true,
        message: "아이템 지급/회수 티켓이 생성되었습니다.",
        data: record as ItemQuantity,
        error: null,
      };
    } catch (error) {
      console.error("Create item quantity error:", error);
      return {
        success: false,
        message: "아이템 지급/회수 티켓 생성에 실패했습니다.",
        data: null,
        error,
      };
    }
  }

  async approveItemQuantities(ids: string[]): Promise<GlobalReturn<boolean>> {
    const session = await auth();
    if (!session?.user) redirect("/login");

    const itemQuantities = await prisma.itemQuantity.findMany({
      where: {
        id: { in: ids },
        status: "PENDING",
      },
    });

    try {
      await prisma.$transaction(async (prisma) => {
        await prisma.itemQuantity.updateMany({
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

        await prisma.accountUsingQuerylog.createMany({
          data: itemQuantities.map((item) => ({
            content: `아이템 ${
              item.type === "ADD" ? "지급" : "회수"
            } 티켓 승인 - [${item.itemName}] ${item.amount}개 / 대상: ${
              item.userId
            }`,
            registrantId: session.user?.id,
          })),
        });
      });

      return {
        success: true,
        message: "아이템 지급/회수 승인 성공",
        data: true,
        error: null,
      };
    } catch (error) {
      console.error("Approve item quantities error:", error);
      return {
        success: false,
        message: "아이템 지급/회수 승인 실패",
        data: null,
        error,
      };
    }
  }

  async rejectItemQuantities(ids: string[]): Promise<GlobalReturn<boolean>> {
    const session = await auth();
    if (!session?.user) redirect("/login");

    try {
      await prisma.$transaction(async (prisma) => {
        await prisma.itemQuantity.updateMany({
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
            content: `아이템 지급/회수 티켓 거절 - [${id}] 건 / 대상: ${session.user?.id}`,
            registrantId: session.user?.id,
          })),
        });
      });

      return {
        success: true,
        message: "아이템 지급/회수 거절 성공",
        data: true,
        error: null,
      };
    } catch (error) {
      console.error("Reject item quantities error:", error);
      return {
        success: false,
        message: "아이템 지급/회수 거절 실패",
        data: null,
        error,
      };
    }
  }

  async cancelItemQuantity(ids: string[]): Promise<GlobalReturn<boolean>> {
    const session = await auth();
    if (!session?.user) redirect("/login");

    try {
      await prisma.itemQuantity.updateMany({
        where: {
          id: { in: ids },
          status: "PENDING",
          registrantId: session.user?.id,
        },
        data: {
          status: "CANCELLED",
        },
      });

      await prisma.accountUsingQuerylog.create({
        data: {
          content: `아이템 지급/회수 티켓 취소 - [${ids.length}] 건 / 대상: ${session.user?.id}`,
          registrantId: session.user?.id,
        },
      });

      return {
        success: true,
        message: "아이템 지급/회수 취소 성공",
        data: true,
        error: null,
      };
    } catch (error) {
      console.error("Cancel item quantity error:", error);
      return {
        success: false,
        message: "아이템 지급/회수 취소 실패",
        data: null,
        error,
      };
    }
  }

  async deleteItemQuantity(id: string): Promise<GlobalReturn<boolean>> {
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
        const deleteResult = await prisma.itemQuantity.delete({
          where: { id },
        });

        const logResult = await prisma.accountUsingQuerylog.create({
          data: {
            content: `아이템 ${
              deleteResult.type === "ADD" ? "지급" : "회수"
            } 티켓 삭제 - [${deleteResult.itemName}] ${
              deleteResult.amount
            }개 / 대상: ${deleteResult.userId}`,
            registrantId: session.user?.id,
          },
        });

        return { deleteResult, logResult };
      });

      return {
        success: true,
        message: "아이템 지급/회수 기록이 삭제되었습니다.",
        data: true,
        error: null,
      };
    } catch (error) {
      console.error("Delete item quantity error:", error);
      return {
        success: false,
        message: "아이템 지급/회수 기록 삭제에 실패했습니다.",
        data: null,
        error,
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
  ): Promise<GlobalReturn<ItemQuantity>> {
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
        const updateResult = await prisma.itemQuantity.update({
          where: { id, status: "PENDING" },
          data: {
            userId: Number(data.userId),
            itemId: data.itemId,
            itemName: data.itemName,
            amount: data.amount,
            type: data.type,
            reason: data.reason,
            registrantId: session.user?.id,
          },
        });

        const logResult = await prisma.accountUsingQuerylog.create({
          data: {
            content: `아이템 ${
              data.type === "ADD" ? "지급" : "회수"
            } 티켓 수정 - [${data.itemName}] ${data.amount}개 / 대상: ${
              data.userId
            }`,
            registrantId: session.user?.id,
          },
        });

        return { updateResult, logResult };
      });

      return {
        success: true,
        message: "아이템 지급/회수 정보가 수정되었습니다.",
        data: result.updateResult as ItemQuantity,
        error: null,
      };
    } catch (error) {
      console.error("Update item quantity error:", error);
      return {
        success: false,
        message: "아이템 지급/회수 정보 수정에 실패했습니다.",
        data: null,
        error,
      };
    }
  }

  async approveAllItemQuantities(): Promise<GlobalReturn<boolean>> {
    const session = await auth();
    if (!session?.user) redirect("/login");

    try {
      const itemQuantities = await prisma.itemQuantity.findMany({
        where: { status: "PENDING" },
      });

      if (itemQuantities.length === 0) {
        return {
          success: false,
          message: "승인할 티켓이 없습니다.",
          data: null,
          error: new Error("No tickets to approve"),
        };
      }

      await prisma.itemQuantity.updateMany({
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
          content: `아이템 지급/회수 티켓 전체 승인 처리 (${itemQuantities.length}건)`,
          registrantId: session.user.id,
        },
      });

      return {
        success: true,
        message: "아이템 지급/회수 승인 성공",
        data: true,
        error: null,
      };
    } catch (error) {
      console.error("Approve all item quantities error:", error);
      return {
        success: false,
        message: "아이템 지급/회수 승인 실패",
        data: null,
        error,
      };
    }
  }

  async rejectAllItemQuantities(): Promise<GlobalReturn<boolean>> {
    const session = await auth();
    if (!session?.user) redirect("/login");

    try {
      const itemQuantities = await prisma.itemQuantity.findMany({
        where: { status: "PENDING" },
      });

      if (itemQuantities.length === 0) {
        return {
          success: false,
          message: "거절할 티켓이 없습니다.",
          data: null,
          error: new Error("No tickets to reject"),
        };
      }

      await prisma.itemQuantity.updateMany({
        where: { status: "PENDING" },
        data: {
          status: "REJECTED",
          approvedAt: new Date(),
          approverId: session.user.id,
        },
      });

      await prisma.accountUsingQuerylog.create({
        data: {
          content: `아이템 지급/회수 티켓 전체 거절 처리 (${itemQuantities.length}건)`,
          registrantId: session.user.id,
        },
      });

      return {
        success: true,
        message: "아이템 지급/회수 거절 성공",
        data: true,
        error: null,
      };
    } catch (error) {
      console.error("Reject all item quantities error:", error);
      return {
        success: false,
        message: "아이템 지급/회수 거절 실패",
        data: null,
        error,
      };
    }
  }

  async getItemQuantitiesByIdsOrigin(
    ids: string[]
  ): Promise<GlobalReturn<ItemQuantityOrigin[]>> {
    try {
      const records = await prisma.itemQuantity.findMany({
        where: {
          id: { in: ids },
        },
      });

      return {
        success: true,
        message: "선택된 아이템 지급/회수 내역 조회 성공",
        data: records as ItemQuantityOrigin[],
        error: null,
      };
    } catch (error) {
      console.error("Get Item Quantity by IDs error:", error);
      return {
        success: false,
        message: "선택된 아이템 지급/회수 내역 조회 실패",
        data: null,
        error,
      };
    }
  }
}

export const itemQuantityService = new ItemQuantityService();
