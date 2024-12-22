import { z } from "zod";

export const addGroupSchema = z.object({
  groupName: z.string().min(1, "그룹 이름을 입력해주세요."),
});

export type AddGroupFormValues = z.infer<typeof addGroupSchema>;
