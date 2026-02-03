"use server";

import { signIn as nextAuthSignIn, signOut as nextAuthSignOut } from "@/lib/auth";
import { AuthError } from "next-auth";

export async function signIn(email: string, password: string) {
  try {
    const result = await nextAuthSignIn("credentials", {
      email,
      password,
      redirect: false,
    });

    return { success: true, error: null };
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: "Invalid email or password" };
    }
    return { success: false, error: "An error occurred. Please try again." };
  }
}

export async function signOut() {
  await nextAuthSignOut({ redirectTo: "/" });
}
