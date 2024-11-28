import mysqlClient from "@/db/mysql/mysql-client";
import postgresqlClient from "@/db/postgresql/postgresql-client";
import { GlobalReturn } from "@/types/global-return";
import { SignUpUser } from "@/types/user";
import bcrypt from "bcrypt";
import { UserRole } from "../../generated/postgresql";

class UserService {
  async signup(data: {
    name: string;
    password: string;
    userId: number;
    nickname: string;
  }): Promise<GlobalReturn<SignUpUser>> {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const isSpecialAccount = [1, 2].includes(Number(data.userId));

    try {
      const existingUser = await this.findByUserId(data.userId);
      if (existingUser) {
        return {
          success: false,
          message: "이미 존재하는 고유번호입니다.",
          data: null,
          error: new Error("Duplicate userId"),
        };
      }

      const user = await postgresqlClient.user.create({
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
        message: "회원가입에 성공하였습니다.",
        data: userWithoutPassword,
        error: null,
      };
    } catch (error) {
      console.error("Signup error:", error);
      return {
        success: false,
        message: "회원가입에 실패하였습니다.",
        data: null,
        error: error,
      };
    }
  }

  async findByUserId(userId: number) {
    return postgresqlClient.user.findFirst({
      where: { userId },
    });
  }

  async validatePassword(user: { hashedPassword: string }, password: string) {
    return bcrypt.compare(password, user.hashedPassword);
  }

  async getGameNicknameByUserId(userId: number): Promise<GlobalReturn<string>> {
    const result = await mysqlClient.vrp_users
      .findFirst({
        where: {
          id: userId,
        },
      })
      .then((result) => result?.last_login?.split(" ")[3]);
    if (!result)
      return {
        success: false,
        message: "닉네임을 찾을 수 없습니다.",
        data: null,
        error: null,
      };
    return {
      success: true,
      message: "닉네임을 찾았습니다.",
      data: result,
      error: null,
    };
  }

  async isAccessiblePage(userId: string): Promise<GlobalReturn<boolean>> {
    const result = await postgresqlClient.user.findFirst({
      where: {
        AND: [{ id: userId }, { isPermissive: true }],
      },
    });

    if (!result)
      return {
        success: false,
        message: "접근 권한이 없습니다.",
        data: null,
        error: null,
      };

    return {
      success: true,
      message: "접근 가능한 페이지입니다.",
      data: result ? true : false,
      error: null,
    };
  }

  async isAccountPermissive(username: string, password: string) {
    const result = await postgresqlClient.user.findFirst({
      where: { AND: [{ name: username }] },
    });

    if (!result)
      return {
        success: false,
        message: "아이디 또는 비밀번호가 일치하지 않습니다.",
        data: null,
        error: null,
      };

    const isValidPassword = await this.validatePassword(
      { hashedPassword: result.hashedPassword as string },
      password
    );

    if (!isValidPassword)
      return {
        success: false,
        message: "아이디 또는 비밀번호가 일치하지 않습니다.",
        data: null,
        error: null,
      };

    if (result.isPermissive)
      return {
        success: true,
        message: "계정이 활성화되어 있습니다.",
        data: true,
        error: null,
      };

    return {
      success: true,
      message: "계정이 활성화되어 있지 않습니다.",
      data: false,
      error: null,
    };
  }
}

export const userService = new UserService();