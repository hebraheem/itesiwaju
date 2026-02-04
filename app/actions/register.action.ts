"use server";

import { registerSchema } from "@/app/schemas/registration.schema";
import { convexServer } from "@/lib/convexServer";
import { api } from "@/convex/_generated/api";
import { USER_ROLES, USER_STATUSES } from "@/lib/utils";

export type RegisterState = {
  errors?: Record<string, string>;
  success?: boolean;
  message?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  terms?: boolean;
  role?: string;
  status?: string;
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
    const role = formData.get("role") ?? ("member" as keyof typeof USER_ROLES);

    const data = { firstName, lastName, email, phone, terms, role };
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

export async function adminUpdateAction(
  _prev: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  try {
    const status = formData.get("status") as keyof typeof USER_STATUSES;
    const role = formData.get("role") as keyof typeof USER_ROLES;
    const authEmail = formData.get("authEmail") as string;
    const id = formData.get("id") as string;

    await convexServer.mutation(api.users.updateUserStatusAndRole, {
      status,
      authEmail,
      role,
      // @ts-expect-error id type Id<User> not assignable to string
      id,
    });
    return { success: true, message: "Update successful!" };
  } catch (e: any) {
    return {
      message: e.message || "Registration failed",
      success: false,
      ...Object.fromEntries(formData.entries()),
    };
  }
}
