"use server";

import {
  signIn as nextAuthSignIn,
  signOut as nextAuthSignOut,
} from "@/lib/auth";
import { AuthError } from "next-auth";
import { revalidatePath } from "next/cache";

export async function signIn(email: string, password: string) {
  try {
    const result = await nextAuthSignIn("credentials", {
      email,
      password,
      redirect: false,
    });

    // Force revalidate all paths after login
    revalidatePath("/", "layout");
    
    return { success: true, error: null };
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: "Invalid email or password" };
    }
    return { success: false, error: "An error occurred. Please try again." };
  }
}

export async function signOut() {
  // Clear cache before sign out
  revalidatePath("/", "layout");
  
  await nextAuthSignOut({ 
    redirectTo: "/",
    redirect: true 
  });
}
