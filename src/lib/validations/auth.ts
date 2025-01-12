import * as z from "zod";

export const signUpSchema = z
  .object({
    name: z
      .string()
      .min(2, "아이디는 2글자 이상이어야 합니다.")
      .max(20, "아이디는 20글자를 초과할 수 없습니다.")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "아이디는 영문자, 숫자, 언더바(_)만 사용할 수 있습니다."
      ),
    password: z
      .string()
      .min(8, "비밀번호는 최소 8자 이상이어야 합니다.")
      .max(20, "비밀번호는 20자를 초과할 수 없습니다.")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()])[A-Za-z\d!@#$%^&*()]{8,}$/,
        "비밀번호는 영문 대/소문자, 숫자, 특수문자를 포함해야 합니다."
      ),
    confirmPassword: z.string(),
    userId: z.number().int().positive("유효한 고유번호를 입력해주세요."),
    nickname: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["confirmPassword"],
  });

export type SignUpFormValues = z.infer<typeof signUpSchema>;

export const loginSchema = z.object({
  name: z.string().min(1, "아이디를 입력해주세요."),
  password: z.string().min(1, "비밀번호를 입력해주세요."),
  autoLogin: z.boolean().optional(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
