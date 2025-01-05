import { z } from "zod";

export const editUserSchema = z
  .object({
    image: z.string().nullable().optional(),
    currentPassword: z.string().optional(),
    password: z
      .string()
      .min(6, "비밀번호는 6자 이상이어야 합니다")
      .max(20, "비밀번호는 20자를 초과할 수 없습니다")
      .optional(),
    confirmPassword: z
      .string()
      .min(6, "비밀번호는 6자 이상이어야 합니다")
      .max(20, "비밀번호는 20자를 초과할 수 없습니다")
      .optional(),
  })
  .refine(
    (data) => {
      if (data.password || data.confirmPassword) {
        return !!data.currentPassword;
      }
      return true;
    },
    {
      message: "현재 비밀번호를 입력해주세요",
      path: ["currentPassword"],
    }
  )
  .refine(
    (data) => {
      if (data.password || data.confirmPassword) {
        return data.password === data.confirmPassword;
      }
      return true;
    },
    {
      message: "비밀번호가 일치하지 않습니다",
      path: ["confirmPassword"],
    }
  );

export type EditUserFormValues = z.infer<typeof editUserSchema>;
