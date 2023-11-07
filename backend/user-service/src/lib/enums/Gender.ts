import { ZodError, ZodIssue, ZodIssueCode } from "zod";

enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHER = "OTHER",
}

export const convertStringToGender = (gender: string) => {
  switch (gender.toUpperCase()) {
    case "MALE":
      return Gender.MALE;
    case "FEMALE":
      return Gender.FEMALE;
    case "OTHER":
      return Gender.OTHER;
    default:
      throw new ZodError([{ message: "Invalid gender" } as ZodIssue]);
  }
};

export default Gender;
