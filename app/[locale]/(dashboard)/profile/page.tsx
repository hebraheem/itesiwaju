"use client";

import { Profile } from "@/components/profile/profile";
import { useAuth } from "@/lib/hooks/use-auth";

export default function ProfilePage() {
  const { user } = useAuth();

  // Force remount when session email changes
  return <Profile key={user?.email || "no-user"} />;
}
