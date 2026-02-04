import * as z from "zod";

export const updateProfileSchema = z.object({
  firstName: z.string().min(2, "firstNameRequired"),
  lastName: z.string().min(2, "lastNameRequired"),
  email: z.email("emailRequired"),
  phone: z.string().min(10, "phoneRequired"),
  otherName: z.string().optional(),
  address: z
    .object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      country: z.string().optional(),
    })
    .optional(),
});
