"use server";

import { registerSchema } from "@/app/schemas/registration.schema";
import { convexServer } from "@/lib/convexServer";
import { api } from "@/convex/_generated/api";

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
    const passwordHash = await convexServer.action(
      api.auth.actions.hashPassword,
      {
        password: `pass@${lastName.toLowerCase()}123!`,
      },
    );
    console.log(
      "`pass@${lastName.toLowerCase()}123!`",
      `pass@${lastName.toLowerCase()}123!`,
    );

    const { terms: _, ...registrationData } = parsed.data;
    await convexServer.mutation(api.users.createUser, {
      ...registrationData,
      password: passwordHash,
    });
    return { success: true, message: "Registration successful!" };
  } catch (e: any) {
    return {
      message: e.message || "Registration failed",
      success: false,
      ...Object.fromEntries(formData.entries()),
    };
  }
}
