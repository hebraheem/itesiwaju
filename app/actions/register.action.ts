"use server";

import { registerSchema } from "@/app/schemas/registration.schema";

export type RegisterState = {
  errors?: Record<string, string>;
  success?: boolean;
  message?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  terms?: boolean;
};

export async function registerAction(
  _prev: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  try {
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const terms = Boolean(formData.get("terms")) as boolean;

    const data = { firstName, lastName, email, phone, terms };
    const parsed = registerSchema.safeParse(data);
    if (!parsed.success) {
      return {
        errors: parsed.error.flatten().fieldErrors as Record<string, string>,
        ...Object.fromEntries(formData.entries()),
      };
    }
    return { success: true, message: "Registration successful!" };
  } catch (e: any) {
    return {
      message: e.message || "Registration failed",
      success: false,
      ...Object.fromEntries(formData.entries()),
    };
  }
}
