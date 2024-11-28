import { Prisma } from "@prisma/client";

type SignUpUser = Omit<Prisma.UserCreateInput, "hashedPassword">;

export type { SignUpUser };
