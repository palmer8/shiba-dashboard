import { UserRole } from "@prisma/client";
import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1, {
    message: "카테고리 이름을 입력해주세요.",
  }),
  isUsed: z.boolean(),
  roles: z.array(z.nativeEnum(UserRole)),
  template: z.any(),
});

export type CategoryForm = z.infer<typeof categorySchema>;

export const editCategorySchema = z.object({
  name: z.string().min(1, {
    message: "카테고리 이름을 입력해주세요.",
  }),
  isUsed: z.boolean(),
  roles: z.array(z.nativeEnum(UserRole)),
  template: z.any(),
});

export type EditCategoryForm = z.infer<typeof editCategorySchema>;
