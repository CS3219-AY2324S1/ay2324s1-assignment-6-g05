import { ZodError, ZodIssue } from "zod";

enum Complexity {
  EASY = "EASY",
  MEDIUM = "MEDIUM",
  HARD = "HARD",
}

export const convertStringToComplexity = (complexity: string): Complexity => {
  switch (complexity.toUpperCase()) {
    case "EASY":
      return Complexity.EASY;
    case "MEDIUM":
      return Complexity.MEDIUM;
    case "HARD":
      return Complexity.HARD;
    default:
      throw new ZodError([{ message: "Invalid complexity" } as ZodIssue]);
  }
};

export default Complexity;
