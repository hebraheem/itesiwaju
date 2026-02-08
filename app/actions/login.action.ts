"use server";

import { loginSchema } from "@/app/schemas/login.schema";
import { convexServer } from "@/lib/convexServer";
import { api } from "@/convex/_generated/api";
import { USER_STATUSES } from "@/lib/utils";
import { signIn } from "@/lib/actions/auth";

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
    await convexServer.mutation(api.accounts.initTreasury);
    const user = await convexServer.query(api.users.getUserByEmail, { email });
    if (user && user.status === USER_STATUSES.suspended) {
      return {
        message: "accountSuspendedErrorMessage",
        success: false,
      };
    }
    return await signIn(email, password);
  } catch (e: any) {
    return {
      message: e.message || "Login failed",
      success: false,
      ...Object.fromEntries(formData.entries()),
    };
  }
}
