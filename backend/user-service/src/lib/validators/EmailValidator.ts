import z from "zod";

export const EmailValidator = z.string().email().min(3).max(254);
