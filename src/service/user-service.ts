import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

class UserService {
  async signup(data: {
    name: string;
    password: string;
    userId: number;
    nickname: string;
  }) {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const isSpecialAccount = [1, 2].includes(Number(data.userId));

    const user = await prisma.user.create({
      data: {
        name: data.name,
        hashedPassword,
        userId: data.userId,
        nickname: data.nickname,
        role: isSpecialAccount ? UserRole.SUPERMASTER : UserRole.MANAGER,
        isPermissive: isSpecialAccount,
        isUsingAccount: isSpecialAccount,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { hashedPassword: omittedPassword, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async findByUserId(userId: number) {
    return prisma.user.findFirst({
      where: { userId },
    });
  }

  async validatePassword(user: { hashedPassword: string }, password: string) {
    return bcrypt.compare(password, user.hashedPassword);
  }
}

export const userService = new UserService();
