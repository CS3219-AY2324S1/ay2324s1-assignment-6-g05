import { z } from "zod";
import { convertStringToComplexity } from "../enums/Complexity";
import { convertStringToLanguage } from "../enums/Language";
import { convertStringToTopic } from "../enums/Topic";

export const UpdateUserPreferencesValidator = z.object({
  languages: z
    .array(z.string().transform(convertStringToLanguage))
    .refine(
      (languages) => new Set(languages).size === languages.length,
      "Language provided must be unique"
    )
    .optional(),
  difficulties: z
    .array(z.string().transform(convertStringToComplexity))
    .refine(
      (difficulties) => new Set(difficulties).size === difficulties.length,
      "Difficulty provided must be unique"
    )
    .optional(),
  topics: z
    .array(z.string().transform(convertStringToTopic))
    .refine(
      (topics) => new Set(topics).size === topics.length,
      "Topic provided must be unique"
    )
    .optional(),
});

export type UpdateUserPreferencesBody = z.infer<
  typeof UpdateUserPreferencesValidator
>;
