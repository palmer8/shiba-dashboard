import { Prisma } from "../../generated/postgresql";

type SignUpUser = Omit<Prisma.UserCreateInput, "hashedPassword">;

export type { SignUpUser };
