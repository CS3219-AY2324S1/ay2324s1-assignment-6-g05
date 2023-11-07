import z from "zod";
import { isPrismaCuid } from "../utils/stringUtils";
import { convertStringToLanguage } from "../enums/Language";

export const CreateHistoryBodyValidator = z.object({
  userId: z.union([
    z
      .array(z.string().refine((id) => isPrismaCuid(id), "Invalid user id"))
      .length(2)
      .refine((ids) => new Set(ids).size === 2, "Duplicate user ids"),
    z.string().refine((id) => isPrismaCuid(id), "Invalid user id"),
  ]),
  questionId: z
    .string()
    .refine((id) => isPrismaCuid(id), "Invalid question id"),
  // title: z.string().min(3).max(100),
  // topics: z
  //   .array(z.string().transform(convertStringToTopic))
  //   .refine((topics) => topics.length > 0, "At least one topic is required")
  //   .refine(
  //     (topics) => new Set(topics).size === topics.length,
  //     "Each topic must be unique"
  //   ),
  // complexity: z.string().transform(convertStringToComplexity),
  language: z.string().transform(convertStringToLanguage),
  code: z.string().min(10).max(10000).optional(),
});

export type CreateHistoryBody = z.infer<typeof CreateHistoryBodyValidator>;
