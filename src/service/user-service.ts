import prisma from "@/db/prisma";
import { ApiResponse } from "@/types/global.dto";
import bcrypt from "bcrypt";
import { User, UserRole } from "@prisma/client";
import { auth } from "@/lib/auth-config";
import { SignUpUser, UpdateProfileData } from "@/types/user";
import pool from "@/db/mysql";
import { SignUpFormValues, signUpSchema } from "@/lib/validations/auth";
import { ROLE_HIERARCHY } from "@/lib/utils";
import { logService } from "./log-service";

class UserService {
  async signup(data: SignUpFormValues): Promise<ApiResponse<SignUpUser>> {
    try {
      // 1. 입력값 검증
      const validationResult = signUpSchema.safeParse(data);
      if (!validationResult.success) {
        return {
          success: false,
          error: validationResult.error.errors[0].message,
          data: null,
        };
      }

      // 2. 아이디 중복 검사
      const existingUserByName = await prisma.user.findFirst({
        where: { name: data.name },
      });

      if (existingUserByName) {
        return {
          success: false,
          error: "이미 사용중인 아이디입니다.",
          data: null,
        };
      }

      // 3. userId 중복 검사
      const existingUser = await this.findByUserId(data.userId);

      if (existingUser.success) {
        return {
          success: false,
          error: "이미 등록된 게임 계정입니다.",
          data: null,
        };
      }

      // 4. 게임 닉네임 조회 및 검증
      const gameNickname = await this.getGameNicknameByUserId(data.userId);
      if (!gameNickname.success || !gameNickname.data) {
        return {
          success: false,
          error: "계정을 찾을 수 없습니다.",
          data: null,
        };
      }

      // 5. 비밀번호 해싱
      const hashedPassword = await bcrypt.hash(data.password, 10);
      const isSpecialAccount = [1, 2].includes(data.userId);

      // 6. 유저 생성
      const user = await prisma.user.create({
        data: {
          name: data.name,
          hashedPassword,
          userId: data.userId,
          nickname: gameNickname.data,
          role: isSpecialAccount ? UserRole.SUPERMASTER : UserRole.STAFF,
          isPermissive: isSpecialAccount,
          email: null,
        },
      });

      const { hashedPassword: _, ...userWithoutPassword } = user;
      return {
        success: true,
        error: null,
        data: userWithoutPassword,
      };
    } catch (error) {
      console.error("Signup error:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "회원가입에 실패하였습니다.",
        data: null,
      };
    }
  }

  async findByUserId(userId: number): Promise<ApiResponse<User>> {
    try {
      const user = await prisma.user.findFirst({
        where: { userId },
      });

      if (!user) {
        return {
          success: false,
          error: "사용자를 찾을 수 없습니다.",
          data: null,
        };
      }

      return {
        success: true,
        error: null,
        data: user,
      };
    } catch (error) {
      console.error("User find error:", error);
      return {
        success: false,
        error: "사용자 조회에 실패했습니다.",
        data: null,
      };
    }
  }

  async validatePassword(
    user: { hashedPassword: string },
    password: string
  ): Promise<ApiResponse<boolean>> {
    try {
      const isValid = await bcrypt.compare(password, user.hashedPassword);
      return {
        success: true,
        error: null,
        data: isValid,
      };
    } catch (error) {
      return {
        success: false,
        error: "비밀번호 검증에 실패했습니다.",
        data: null,
      };
    }
  }

  async getGameNicknameByUserId(userId: number): Promise<ApiResponse<string>> {
    try {
      const [rows] = await pool.execute(
        "SELECT last_login FROM vrp_users WHERE id = ?",
        [userId]
      );

      const result = (rows as { last_login: string }[])[0];

      if (!result || !result.last_login) {
        return {
          success: false,
          error: "닉네임을 찾을 수 없습니다.",
          data: null,
        };
      }

      return {
        success: true,
        error: null,
        data: result.last_login.split(" ")[3],
      };
    } catch (error) {
      console.error("MySQL query error:", error);
      return {
        success: false,
        error: "데이터베이스 조회 중 오류가 발생했습니다.",
        data: null,
      };
    }
  }

  async isAccountPermissive(username: string, password: string) {
    const result = await prisma.user.findFirst({
      where: { AND: [{ name: username }] },
    });

    if (!result)
      return {
        success: false,
        error: "아이디 또는 비밀번호가 일치하지 않습니다.",
        data: null,
      };

    const isValidPassword = await this.validatePassword(
      { hashedPassword: result.hashedPassword as string },
      password
    );

    if (!isValidPassword)
      return {
        success: false,
        error: "아이디 또는 비밀번호가 일치하지 않습니다.",
        data: null,
      };

    if (result.isPermissive)
      return {
        success: true,
        error: null,
        data: true,
      };

    return {
      success: true,
      error: null,
      data: false,
    };
  }

  async getUserById(id: string): Promise<ApiResponse<User>> {
    try {
      const user = await prisma.user.findFirst({
        where: { id: id },
      });

      if (!user) {
        return {
          success: false,
          error: "유저를 찾을 수 없습니다.",
          data: null,
        };
      }

      const { hashedPassword, ...userWithoutPassword } = user;

      return {
        success: true,
        error: null,
        data: userWithoutPassword as User,
      };
    } catch (error) {
      return {
        success: false,
        error: "유저 조회 중 오류가 발생했습니다.",
        data: null,
      };
    }
  }

  async updateUser(
    id: string,
    data: UpdateProfileData
  ): Promise<ApiResponse<User>> {
    try {
      const session = await auth();
      if (!session?.user) {
        return {
          success: false,
          error: "인증되지 않은 사용자입니다.",
          data: null,
        };
      }

      const user = await prisma.user.findUnique({ where: { id } });
      if (!user || user.id !== session.user.id) {
        return {
          success: false,
          error: "사용자를 찾을 수 없습니다.",
          data: null,
        };
      }

      const updateData: any = {};

      if (data.image !== undefined) {
        updateData.image = data.image;
      }

      if (data.password && data.currentPassword) {
        const isValidPassword = await this.validatePassword(
          { hashedPassword: user.hashedPassword as string },
          data.currentPassword
        );

        if (!isValidPassword) {
          return {
            success: false,
            error: "현재 비밀번호가 일치하지 않습니다.",
            data: null,
          };
        }

        updateData.hashedPassword = await bcrypt.hash(data.password, 10);
      }

      if (Object.keys(updateData).length === 0) {
        const { hashedPassword, ...userWithoutPassword } = user;
        return {
          success: true,
          error: null,
          data: userWithoutPassword as User,
        };
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: updateData,
      });

      const { hashedPassword, ...userWithoutPassword } = updatedUser;

      return {
        success: true,
        error: null,
        data: userWithoutPassword as User,
      };
    } catch (error) {
      return {
        success: false,
        error: "프로필 업데이트에 실패했습니다.",
        data: null,
      };
    }
  }

  async deleteUser(id: string, nickname: string): Promise<ApiResponse<User>> {
    try {
      const session = await auth();
      if (!session?.user) {
        return {
          success: false,
          error: "인증되지 않은 사용자입니다.",
          data: null,
        };
      }

      const user = await prisma.user.findUnique({ where: { id } });
      if (!user || user.id !== session.user.id) {
        return {
          success: false,
          error: "사용자를 찾을 수 없습니다.",
          data: null,
        };
      }

      if (user.nickname !== nickname) {
        return {
          success: false,
          error: "닉네임이 일치하지 않습니다.",
          data: null,
        };
      }

      const deletedUser = await prisma.user.delete({ where: { id } });
      const { hashedPassword, ...userWithoutPassword } = deletedUser;

      return {
        success: true,
        error: null,
        data: userWithoutPassword as User,
      };
    } catch (error) {
      return {
        success: false,
        error: "계정 삭제에 실패했습니다.",
        data: null,
      };
    }
  }

  async updateUserByMaster(
    sessionUserId: string,
    sessionUserRole: UserRole,
    sessionUserNickname: string,
    targetUserIdToUpdate: string,
    data: any
  ): Promise<ApiResponse<User>> {
    try {
      if (ROLE_HIERARCHY[sessionUserRole] < ROLE_HIERARCHY[UserRole.MASTER]) {
        return {
          success: false,
          error: "권한이 없습니다.",
          data: null,
        };
      }

      const targetUser = await prisma.user.findUnique({
        where: { id: targetUserIdToUpdate },
      });

      if (!targetUser) {
        return {
          success: false,
          error: "대상 사용자를 찾을 수 없습니다.",
          data: null,
        };
      }

      if (sessionUserRole !== UserRole.SUPERMASTER) {
        if (sessionUserId === targetUserIdToUpdate) {
          return {
            success: false,
            error:
              "자기 자신의 정보는 이 메뉴에서 직접 수정할 수 없습니다. 프로필 설정 메뉴를 이용해주세요.",
            data: null,
          };
        }
        if (
          ROLE_HIERARCHY[sessionUserRole] <= ROLE_HIERARCHY[targetUser.role]
        ) {
          return {
            success: false,
            error: "자신과 같거나 높은 등급의 사용자는 수정할 수 없습니다.",
            data: null,
          };
        }
      } else {
        if (sessionUserId === targetUserIdToUpdate) {
          // 슈퍼마스터가 자기 자신을 수정하려고 할때, 닉네임/로그인ID 변경은 허용 (프로필 수정과 기능 중복되나 일단 허용)
          // 단, 역할 변경 등은 다른 로직에서 처리해야 함
        }
      }

      const updatePayload: Partial<User> = {};
      let changedFieldsLog: string[] = [];

      if (data.nickname && data.nickname !== targetUser.nickname) {
        const existingUserByNickname = await prisma.user.findFirst({
          where: {
            nickname: data.nickname,
            NOT: { id: targetUserIdToUpdate },
          },
        });
        if (existingUserByNickname) {
          return {
            success: false,
            error: "이미 사용중인 닉네임입니다.",
            data: null,
          };
        }
        updatePayload.nickname = data.nickname;
        changedFieldsLog.push(
          `닉네임: "${targetUser.nickname}" -> "${data.nickname}"`
        );
      }

      if (data.userId !== undefined && data.userId !== targetUser.userId) {
        const existingUserByUserId = await prisma.user.findFirst({
          where: {
            userId: data.userId,
            NOT: { id: targetUserIdToUpdate },
          },
        });
        if (existingUserByUserId) {
          return {
            success: false,
            error: "이미 사용중인 고유번호(userId)입니다.",
            data: null,
          };
        }
        updatePayload.userId = data.userId;
        changedFieldsLog.push(
          `고유번호(userId): "${targetUser.userId}" -> "${data.userId}"`
        );
      }

      if (Object.keys(updatePayload).length === 0) {
        const { hashedPassword, ...userWithoutPassword } = targetUser;
        return {
          success: true,
          error: "변경 사항이 없습니다.",
          data: userWithoutPassword as User,
        };
      }

      const updatedUser = await prisma.user.update({
        where: { id: targetUserIdToUpdate },
        data: updatePayload,
      });

      const { hashedPassword, ...userWithoutPassword } = updatedUser;

      await logService.writeAdminLog(
        `${sessionUserNickname}(${sessionUserId})님이 ${targetUser.nickname}(${
          targetUser.userId
        })님의 정보를 수정했습니다: ${changedFieldsLog.join(", ")}`
      );

      return {
        success: true,
        error: null,
        data: userWithoutPassword as User,
      };
    } catch (error) {
      console.error("Update user by master error:", error);
      await logService.writeAdminLog(
        `관리자(${sessionUserNickname}, ${sessionUserId})가 사용자(${targetUserIdToUpdate}) 정보 수정 중 오류 발생: ${
          error instanceof Error ? error.message : "알 수 없는 DB 오류"
        }`
      );
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "프로필 업데이트 중 오류가 발생했습니다.",
        data: null,
      };
    }
  }
}

export const userService = new UserService();
