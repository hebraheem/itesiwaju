"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";

export function useAuth() {
  const { data: session, status } = useSession();
  const [authEmail] = useState(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("authEmail") || session?.user?.email || "";
  });

  // Fetch user by email
  // queryKey in dependency forces refetch on session change
  const user = useQuery(
    api.users.getUserByEmail,
    authEmail && status === "authenticated" ? { email: authEmail! } : "skip",
  );

  return {
    user: user
      ? {
          ...user,
          name: `${user.firstName ?? ""} ${user.lastName ?? ""}`,
        }
      : null,
    isLoading: !session?.user,
    //status === "loading" ||
    //(status === "authenticated" && user === undefined),
    isAuthenticated: status === "authenticated" && !!user,
    isAdmin: session?.user?.role === "admin" || user?.role === "admin",
    isMember: session?.user?.role === "member" || user?.role === "member",
  };
}
