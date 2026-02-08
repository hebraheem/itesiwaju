"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useState } from "react";

export function useAuth() {
  const { data: session, status } = useSession();
  const [queryKey, setQueryKey] = useState(0);

  // Force query refresh when session changes
  useEffect(() => {
    if (status === "authenticated" && session?.user?.email) {
      // Increment key to force new query
      setQueryKey(prev => prev + 1);
    } else if (status === "unauthenticated") {
      // Reset on logout
      setQueryKey(0);
    }
  }, [status, session?.user?.email]);

  // Fetch user by email
  // queryKey in dependency forces refetch on session change
  const user = useQuery(
    api.users.getUserByEmail,
    session?.user?.email && status === "authenticated" && queryKey > 0
      ? { email: session.user.email } 
      : "skip"
  );

  return {
    user: user
      ? {
          ...user,
          name: `${user.firstName ?? ""} ${user.lastName ?? ""}`,
        }
      : null,
    isLoading: status === "loading" || (status === "authenticated" && user === undefined),
    isAuthenticated: status === "authenticated",
    isAdmin: session?.user?.role === "admin" || user?.role === "admin",
    isMember: session?.user?.role === "member" || user?.role === "member",
  };
}
