import { z } from "zod";
import { isPrismaCuid } from "../utils/stringUtils";
import { convertStringToLanguage } from "../enums/Language";

export const GetQuestionCodeHistoryParamsValidator = z.object({
  userId: z.string().refine((id) => isPrismaCuid(id), "Invalid user id"),
  questionId: z
    .string()
    .refine((id) => isPrismaCuid(id), "Invalid question id"),
  language: z
    .union([
      z
        .array(z.string().transform(convertStringToLanguage))
        .refine(
          (lang) => new Set(lang).size === lang.length,
          "Duplicate languages"
        ),
      z.string().transform(convertStringToLanguage),
    ])
    .optional(),
});

export type GetQuestionCodeHistoryParams = z.infer<
  typeof GetQuestionCodeHistoryParamsValidator
>;
