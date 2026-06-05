"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useAuth() {
  const { data: session, status } = useSession();

  const authEmail =
    session?.user?.email ??
    (typeof window !== "undefined"
      ? (localStorage.getItem("authEmail") ?? "")
      : "");

  const user = useQuery(
    api.users.getUserByEmail,
    // Only skip if we're certain there's no email AND session isn't loading
    // Never skip while status is "loading" — wait for session first
    status === "loading" || !authEmail ? "skip" : { email: authEmail },
  );

  const isLoading =
    status === "loading" ||
    // Authenticated but query hasn't returned yet
    (status === "authenticated" && user === undefined) ||
    // Email is present (from localStorage) but session hasn't confirmed yet
    (status === "unauthenticated" && !!authEmail && user === undefined);

  return {
    user: user
      ? {
          ...user,
          name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
        }
      : null,
    isLoading,
    isAuthenticated: status === "authenticated" && !!user,
    isAdmin: session?.user?.role === "admin" || user?.role === "admin",
    isMember: session?.user?.role === "member" || user?.role === "member",
  };
}
