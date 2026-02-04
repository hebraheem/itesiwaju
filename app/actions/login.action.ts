"use server";

import { loginSchema } from "@/app/schemas/login.schema";
import { signIn } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { convexServer } from "@/lib/convexServer";
import { api } from "@/convex/_generated/api";
import { USER_STATUSES } from "@/lib/utils";

export type RegisterState = {
  errors?: Record<string, string>;
  success?: boolean;
  message?: string;
  email?: string;
  password?: string;
};

export async function loginAction(
  _prev: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const data = { email, password };
    const parsed = loginSchema.safeParse(data);
    if (!parsed.success) {
      return {
        errors: parsed.error.flatten().fieldErrors as Record<string, string>,
        ...Object.fromEntries(formData.entries()),
      };
    }
    const user = await convexServer.query(api.users.getUserByEmail, { email });
    if (user && user.status === USER_STATUSES.suspended) {
      return {
        message: "accountSuspendedErrorMessage",
        success: false,
      };
    }
    await signIn("credentials", {
      redirect: false,
      email,
      password,
    });
    revalidatePath("/dashboard");
    revalidatePath("/events");
    revalidatePath("/members");
    revalidatePath("/account-status");
    revalidatePath("/activity");
    revalidatePath("/profile");
    revalidatePath("/settings");
    return { success: true, message: "Login successful!" };
  } catch (e: any) {
    return {
      message: e.message || "Login failed",
      success: false,
      ...Object.fromEntries(formData.entries()),
    };
  }
}
