import z from "zod";
import { convertStringToRole } from "../enums/Role";
import { convertStringToGender } from "../enums/Gender";

export const CreateUserValidator = z.object({
  name: z.string().min(2).max(20),
  email: z.string().email().max(100),
  password: z.string().min(8),
  role: z.string().transform(convertStringToRole),
  image: z.string().url().optional(),
  bio: z.string().min(3).max(255).optional(),
  gender: z.string().transform(convertStringToGender).optional(),
  verificationToken: z.string(),
});

export type CreateUserValidatorType = z.infer<typeof CreateUserValidator>;
