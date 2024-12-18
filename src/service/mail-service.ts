import { GroupMailValues } from "@/components/dialog/add-group-mail-dialog";
import { PersonalMailValues } from "@/components/dialog/add-personal-mail-dialog";
import prisma from "@/db/prisma";
import { auth } from "@/lib/auth-config";
import {
  GroupMailFilter,
  PersonalMailFilter,
} from "@/types/filters/mail-filter";
import { GlobalReturn } from "@/types/global-return";
import {
  GroupMailReward,
  GroupMailTableData,
  PersonalMailTableData,
} from "@/types/mail";
import { Prisma, GroupMail, PersonalMail } from "@prisma/client";
import { redirect } from "next/navigation";

const ITEMS_PER_PAGE = 50;

class MailService {
  async getGroupMails(
    page: number,
    filter: GroupMailFilter
  ): Promise<GlobalReturn<GroupMailTableData>> {
    try {
      const session = await auth();
      if (!session?.user) return redirect("/login");

      const where: Prisma.GroupMailWhereInput = {};

      if (filter.reason) {
        where.reason = {
          contains: filter.reason,
        };
      }

      if (filter.userId) {
        where.registrant = {
          userId: filter.userId,
        };
      }

      if (filter.startDate && filter.endDate) {
        where.startDate = {
          gte: new Date(filter.startDate),
        };
        where.endDate = {
          lte: new Date(filter.endDate),
        };
      } else if (filter.startDate) {
        where.startDate = { gte: new Date(filter.startDate) };
      } else if (filter.endDate) {
        where.endDate = { lte: new Date(filter.endDate) };
      }

      const [records, total] = await Promise.all([
        prisma.groupMail.findMany({
          where,
          skip: (page - 1) * ITEMS_PER_PAGE,
          take: ITEMS_PER_PAGE,
          orderBy: { createdAt: "desc" },
          include: {
            registrant: {
              select: {
                nickname: true,
                userId: true,
                id: true,
              },
            },
          },
        }),
        prisma.groupMail.count({ where }),
      ]);

      return {
        success: true,
        message: "단체 우편 내역 조회 성공",
        data: {
          records: records.map((record) => ({
            ...record,
            registrant: record.registrant || undefined,
            rewards: record.rewards as GroupMailReward[],
          })),
          metadata: {
            total,
            page,
            totalPages: Math.ceil(total / ITEMS_PER_PAGE),
          },
        },
        error: null,
      };
    } catch (error) {
      console.error("Get group mails error:", error);
      return {
        success: false,
        message: "단체 우편 내역 조회 실패",
        data: null,
        error,
      };
    }
  }

  async createGroupMail(data: GroupMailValues) {
    const session = await auth();
    if (!session?.user) return redirect("/login");

    try {
      const newGroupMail = await prisma.groupMail.create({
        data: {
          reason: data.reason,
          content: data.content,
          rewards: data.rewards as GroupMailReward[],
          startDate: data.startDate,
          endDate: data.endDate,
          registrantId: session.user.id,
        },
      });

      return {
        success: true,
        message: "단체 우편 생성 성공",
        data: newGroupMail,
        error: null,
      };
    } catch (error) {
      console.error("Create group mail error:", error);
      return {
        success: false,
        message: "단체 우편 생성 실패",
        data: null,
        error,
      };
    }
  }

  async updateGroupMail(id: string, data: Partial<GroupMailValues>) {
    try {
      const session = await auth();
      if (!session?.user) return redirect("/login");

      const updatedMail = await prisma.groupMail.update({
        where: { id },
        data: {
          reason: data.reason,
          content: data.content,
          rewards: data.rewards as GroupMailReward[],
          startDate: data.startDate,
          endDate: data.endDate,
        },
      });

      return {
        success: true,
        message: "단체 우편 수정 성공",
        data: updatedMail,
        error: null,
      };
    } catch (error) {
      console.error("Update group mail error:", error);
      return {
        success: false,
        message: "단체 우편 수정 실패",
        data: null,
        error,
      };
    }
  }

  async deleteGroupMail(id: string) {
    const session = await auth();
    if (!session?.user) return redirect("/login");

    try {
      await prisma.groupMail.delete({
        where: { id },
      });

      return {
        success: true,
        message: "단체 우편 삭제 성공",
        data: null,
        error: null,
      };
    } catch (error) {
      console.error("Delete group mail error:", error);
      return {
        success: false,
        message: "단체 우편 삭제 실패",
        data: null,
        error,
      };
    }
  }

  async getPersonalMails(
    page: number,
    filter: PersonalMailFilter
  ): Promise<GlobalReturn<PersonalMailTableData>> {
    try {
      const session = await auth();
      if (!session?.user) return redirect("/login");

      const where: Prisma.PersonalMailWhereInput = {};

      if (filter.reason) {
        where.reason = {
          contains: filter.reason,
        };
      }

      if (filter.userId) {
        where.registrant = {
          userId: filter.userId,
        };
      }

      if (filter.startDate && filter.endDate) {
        where.createdAt = {
          gte: new Date(filter.startDate),
          lte: new Date(filter.endDate),
        };
      }

      const [records, total] = await Promise.all([
        prisma.personalMail.findMany({
          where,
          skip: (page - 1) * ITEMS_PER_PAGE,
          take: ITEMS_PER_PAGE,
          orderBy: { createdAt: "desc" },
          include: {
            registrant: {
              select: {
                nickname: true,
                userId: true,
                id: true,
              },
            },
          },
        }),
        prisma.personalMail.count({ where }),
      ]);

      return {
        success: true,
        message: "개인 우편 내역 조회 성공",
        data: {
          records: records.map((record) => ({
            ...record,
            registrant: record.registrant || undefined,
            rewards: record.rewards as GroupMailReward[],
            needItems: record.needItems as GroupMailReward[],
          })),
          metadata: {
            total,
            page,
            totalPages: Math.ceil(total / ITEMS_PER_PAGE),
          },
        },
        error: null,
      };
    } catch (error) {
      console.error("Get personal mails error:", error);
      return {
        success: false,
        message: "개인 우편 내역 조회 실패",
        data: null,
        error,
      };
    }
  }

  async createPersonalMail(data: PersonalMailValues) {
    const session = await auth();
    if (!session?.user) return redirect("/login");

    try {
      const newPersonalMail = await prisma.personalMail.create({
        data: {
          reason: data.reason,
          needItems: data.needItems as GroupMailReward[],
          content: data.content,
          rewards: data.rewards as GroupMailReward[],
          userId: Number(data.userId),
          registrantId: session.user.id,
        },
      });

      return {
        success: true,
        message: "개인 우편 생성 성공",
        data: newPersonalMail,
        error: null,
      };
    } catch (error) {
      console.error("Create personal mail error:", error);
      return {
        success: false,
        message: "개인 우편 생성 실패",
        data: null,
        error,
      };
    }
  }

  async updatePersonalMail(id: string, data: Partial<PersonalMailValues>) {
    try {
      const session = await auth();
      if (!session?.user) return redirect("/login");

      const updatedMail = await prisma.personalMail.update({
        where: { id },
        data: {
          reason: data.reason,
          content: data.content,
          rewards: data.rewards as GroupMailReward[],
          needItems: data.needItems as GroupMailReward[],
          userId: Number(data.userId),
        },
      });

      return {
        success: true,
        message: "개인 우편 수정 성공",
        data: updatedMail,
        error: null,
      };
    } catch (error) {
      console.error("Update personal mail error:", error);
      return {
        success: false,
        message: "개인 우편 수정 실패",
        data: null,
        error,
      };
    }
  }

  async deletePersonalMail(id: string) {
    try {
      const session = await auth();
      if (!session?.user) return redirect("/login");

      await prisma.personalMail.delete({
        where: { id },
      });

      return {
        success: true,
        message: "개인 우편 삭제 성공",
        data: null,
        error: null,
      };
    } catch (error) {
      console.error("Delete personal mail error:", error);
      return {
        success: false,
        message: "개인 우편 삭제 실패",
        data: null,
        error,
      };
    }
  }

  async getGroupMailsByIds(ids: string[]) {
    const session = await auth();
    if (!session?.user) return redirect("/login");

    const records = await prisma.groupMail.findMany({
      where: { id: { in: ids } },
    });
    if (records.length) {
      return {
        success: true,
        message: "선택된 단체 우편 내역 조회 성공",
        data: records,
        error: null,
      };
    }
    return {
      success: false,
      message: "선택된 단체 우편 내역이 존재하지 않습니다",
      data: null,
      error: null,
    };
  }

  async getGroupMailsByIdsOrigin(
    ids: string[]
  ): Promise<GlobalReturn<GroupMail[]>> {
    const session = await auth();
    if (!session?.user) return redirect("/login");

    try {
      const records = await prisma.groupMail.findMany({
        where: {
          id: { in: ids },
        },
      });

      return {
        success: true,
        message: "선택된 단체 우편 내역 조회 성공",
        data: records,
        error: null,
      };
    } catch (error) {
      console.error("Get group mails by IDs error:", error);
      return {
        success: false,
        message: "선택된 단체 우편 내역 조회 실패",
        data: null,
        error,
      };
    }
  }

  async getPersonalMailsByIdsOrigin(
    ids: string[]
  ): Promise<GlobalReturn<PersonalMail[]>> {
    const session = await auth();
    if (!session?.user) return redirect("/login");

    try {
      const records = await prisma.personalMail.findMany({
        where: {
          id: { in: ids },
        },
      });

      return {
        success: true,
        message: "선택된 개인 우편 내역 조회 성공",
        data: records,
        error: null,
      };
    } catch (error) {
      console.error("Get personal mails by IDs error:", error);
      return {
        success: false,
        message: "선택된 개인 우편 내역 조회 실패",
        data: null,
        error,
      };
    }
  }

  async createPersonalMailsFromCSV(records: any[]) {
    const session = await auth();
    if (!session?.user) return redirect("/login");

    try {
      // 데이터 유효성 검사
      const validRecords = records.filter(
        (record) =>
          record.reason?.trim() &&
          record.content?.trim() &&
          !isNaN(record.userId) &&
          record.userId > 0
      );

      if (validRecords.length === 0) {
        return {
          success: false,
          message: "유효한 데이터가 없습니다.",
          data: null,
          error: "No valid data",
        };
      }

      const createdMails = await prisma.personalMail.createMany({
        data: validRecords.map((record) => ({
          reason: record.reason.trim(),
          content: record.content.trim(),
          rewards: record.rewards || [],
          needItems: record.needItems || [],
          userId: record.userId,
          registrantId: session.user!.id,
        })),
      });

      return {
        success: true,
        message: `${createdMails.count}개의 개인 우편이 생성되었습니다.`,
        data: createdMails,
        error: null,
      };
    } catch (error) {
      console.error("Create personal mails from CSV error:", error);
      return {
        success: false,
        message: "CSV 파일로부터 개인 우편 생성 실패",
        data: null,
        error,
      };
    }
  }
}

export const mailService = new MailService();
