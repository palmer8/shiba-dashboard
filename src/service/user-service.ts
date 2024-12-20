import prisma from "@/db/prisma";
import { ApiResponse } from "@/types/global.dto";
import bcrypt from "bcrypt";
import { User, UserRole } from "@prisma/client";
import { auth } from "@/lib/auth-config";
import { SignUpUser, UpdateProfileData } from "@/types/user";
import pool from "@/db/mysql";

class UserService {
  async signup(data: {
    name: string;
    password: string;
    userId: number;
    nickname: string;
  }): Promise<ApiResponse<SignUpUser>> {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const isSpecialAccount = [1, 2].includes(Number(data.userId));

    try {
      const existingUser = await this.findByUserId(data.userId);
      if (existingUser) {
        return {
          success: false,
          error: "이미 존재하는 고유번호입니다.",
          data: null,
        };
      }

      const user = await prisma.user.create({
        data: {
          name: data.name,
          hashedPassword,
          userId: data.userId,
          nickname: data.nickname,
          role: isSpecialAccount ? UserRole.SUPERMASTER : UserRole.STAFF,
          isPermissive: isSpecialAccount,
          email: null,
        },
      });

      const { hashedPassword: omittedPassword, ...userWithoutPassword } = user;
      return {
        success: true,
        error: null,
        data: userWithoutPassword,
      };
    } catch (error) {
      console.error("Signup error:", error);
      return {
        success: false,
        error: "회원가입에 실패하였습니다.",
        data: null,
      };
    }
  }

  async findByUserId(userId: number) {
    return prisma.user.findFirst({
      where: { userId },
    });
  }

  async validatePassword(user: { hashedPassword: string }, password: string) {
    return bcrypt.compare(password, user.hashedPassword);
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
        where: { id },
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

      if (data.password) {
        updateData.hashedPassword = await bcrypt.hash(data.password, 10);
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
}

export const userService = new UserService();
