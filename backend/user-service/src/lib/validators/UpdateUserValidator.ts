import z from "zod";
import { convertStringToRole } from "../enums/Role";
import { convertStringToGender } from "../enums/Gender";

export const UpdateUserValidator = z.object({
  name: z.string().min(2).max(20).optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  role: z.string().transform(convertStringToRole).optional(),
  image: z.string().url().optional(),
  bio: z.string().max(255).optional(),
  gender: z.string().transform(convertStringToGender).optional(),
  passwordResetToken: z.string().optional(),
  isVerified: z.boolean().optional(),
  verificationToken: z.string().optional(),
});

export type UpdateUserValidatorType = z.infer<typeof UpdateUserValidator>;
