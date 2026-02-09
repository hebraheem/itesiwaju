"use client";

import { MemberForm } from "@/components/members/member-form";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { use } from "react";
import { UserModel } from "@/types/userModel";
import Loader from "@/components/common/Loader";
import { useAuth } from "@/lib/hooks/use-auth";

export default function UpdateMemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user: u } = useAuth();

  const user = useQuery(api.users.getUserById, {
    // @ts-expect-error id type Id<User> not assignable to string
    id,
    email: u?.email ?? "",
  }) as UserModel;

  if (!user) {
    return <Loader />;
  }

  return <MemberForm user={user} />;
}
