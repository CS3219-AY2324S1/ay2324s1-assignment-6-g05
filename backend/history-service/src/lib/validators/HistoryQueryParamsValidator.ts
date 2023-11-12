import z from "zod";
import { isPrismaCuid } from "../utils/stringUtils";

export const HistoryQueryParamsValidator = z.object({
  userId: z
    .union([
      z
        .array(z.string().refine((id) => isPrismaCuid(id), "Invalid user id"))
        .max(10)
        .refine(
          (ids) => new Set(ids).size === ids.length,
          "Duplicate user ids"
        ),
      z.string().refine((id) => isPrismaCuid(id), "Invalid user id"),
    ])
    .optional(),
  questionId: z
    .union([
      z
        .array(
          z.string().refine((id) => isPrismaCuid(id), "Invalid question id")
        )
        .max(10)
        .refine(
          (ids) => new Set(ids).size === ids.length,
          "Duplicate user ids"
        ),
      z.string().refine((id) => isPrismaCuid(id), "Invalid question id"),
    ])
    .optional(),
});

export type HistoryQueryParams = z.infer<typeof HistoryQueryParamsValidator>;
