"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useAuth() {
  const { data: session, status } = useSession();

  // Fetch user by email instead of ID
  const user = useQuery(
    api.users.getUserByEmail,
    session?.user?.email ? { email: session.user.email } : "skip"
  );

  return {
    user: user
      ? {
          ...user,
          name: `${user.firstName ?? ""} ${user.lastName ?? ""}`,
        }
      : null,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    isAdmin: session?.user?.role === "admin" || user?.role === "admin",
    isMember: session?.user?.role === "member" || user?.role === "member",
  };
}
