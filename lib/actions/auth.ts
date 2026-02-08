"use server";

import {
  signIn as nextAuthSignIn,
  signOut as nextAuthSignOut,
} from "@/lib/auth";
import { AuthError } from "next-auth";
import { revalidatePath } from "next/cache";

export async function signIn(email: string, password: string) {
  try {
    await nextAuthSignIn("credentials", {
      email,
      password,
      redirect: false,
    });

    revalidatePath("/dashboard", "layout");

    return { success: true, error: null };
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        success: false,
        error: "Invalid email or password",
        email,
        password,
      };
    }
    return {
      success: false,
      error: "An error occurred. Please try again.",
      email,
      password,
    };
  }
}

export async function signOut() {
  await nextAuthSignOut({
    redirectTo: "/login",
    redirect: true,
  });
  await revalidatePaths();
}

export const revalidatePaths = async () => {
  revalidatePath("/dashboard", "layout");
};
