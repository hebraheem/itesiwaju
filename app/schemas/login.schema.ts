import * as z from "zod";

export const loginSchema = z.object({
  email: z.email("emailRequired"),
  password: z.string().min(10, "passwordRequired"),
});
