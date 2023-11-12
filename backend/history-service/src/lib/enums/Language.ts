import { ZodError, ZodIssue } from "zod";

export enum Language {
  PYTHON = "PYTHON",
  JAVA = "JAVA",
  CPP = "C++",
  JAVASCRIPT = "JAVASCRIPT",
}

export const convertStringToLanguage = (language: string): Language => {
  switch (language.toUpperCase()) {
    case "C++":
      return Language.CPP;
    case "PYTHON":
      return Language.PYTHON;
    case "JAVA":
      return Language.JAVA;
    case "JAVASCRIPT":
      return Language.JAVASCRIPT;
    default:
      throw new ZodError([{ message: "Invalid language" } as ZodIssue]);
  }
};

export default Language;
