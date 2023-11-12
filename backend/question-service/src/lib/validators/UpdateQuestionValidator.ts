import z from "zod";
import { convertStringToTopic } from "../enums/Topic";
import { convertStringToComplexity } from "../enums/Complexity";

export const UpdateQuestionValidator = z.object({
  title: z.string().min(3).max(100).optional(),
  description: z
    .string()
    .refine((value) => {
      // Remove HTML tags using a regular expression
      const plainText = value.replace(/<[^>]*>/g, "");

      return plainText.length >= 3;
    }, "Invalid description. String must contain at least 3 character(s)")
    .optional(),
  topics: z
    .array(z.string().transform(convertStringToTopic))
    .refine((topics) => topics.length > 0, "At least one topic is required.")
    .refine(
      (topics) => new Set(topics).size === topics.length,
      "Each topic must be unique."
    )
    .optional(), // enum
  complexity: z.string().transform(convertStringToComplexity).optional(), // enum
  url: z.string().url().optional(),
  author: z.string().min(5).max(50).optional(),
  // examples can be optional, but if it exists, it must have at least one example
  examples: z
    .array(
      z.object({
        input: z.string().min(1).max(10000),
        output: z.string().min(1).max(1000),
        explanation: z.string().min(3).max(10000).optional(),
      })
    )
    .optional(),
  // constraints can be optional, but if it exists, it must have at least one constraint
  constraints: z.array(z.string()).optional(),
});

export type UpdateQuestionRequestBody = z.infer<typeof UpdateQuestionValidator>;
