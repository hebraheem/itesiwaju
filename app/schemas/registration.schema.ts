import * as z from "zod";

export const registerSchema = z.object({
  firstName: z.string().min(2, "firstNameRequired"),
  lastName: z.string().min(2, "lastNameRequired"),
  email: z.email("emailRequired"),
  phone: z.string().min(10, "phoneRequired"),
  terms: z.boolean().refine((val) => val, "termsRequired"),
  role: z
    .enum({
      admin: "admin",
      member: "member",
      treasurer: "treasurer",
      pro: "pro",
    })
    .optional(),
  status: z
    .enum({
      active: "active",
      suspended: "suspended",
      inactive: "inactive",
    })
    .optional(),
});
