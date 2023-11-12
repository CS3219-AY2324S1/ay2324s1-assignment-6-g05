import { ZodError, ZodIssue } from "zod";

enum Role {
  ADMIN = "ADMIN",
  USER = "USER",
}

export const convertStringToRole = (role: string): Role => {
  switch (role.toUpperCase()) {
    case "ADMIN":
      return Role.ADMIN;
    case "USER":
      return Role.USER;
    default:
      throw new ZodError([{ message: "Invalid role" } as ZodIssue]);
  }
};

export default Role;
