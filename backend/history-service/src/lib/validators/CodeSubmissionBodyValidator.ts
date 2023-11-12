import { z } from "zod";
import { convertStringToLanguage } from "../enums/Language";

export const CodeSubmissionBodyValidator = z.object({
  language: z.string().transform(convertStringToLanguage),
  code: z.string().min(10).max(10000),
});

export type CodeSubmissionBody = z.infer<typeof CodeSubmissionBodyValidator>;
