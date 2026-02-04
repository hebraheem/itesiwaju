"use client";

import React from "react";
import { USER_ROLES } from "@/lib/utils";
import { useSession } from "next-auth/react";

const RoleAction = ({
  roles,
  children,
}: {
  roles: (keyof typeof USER_ROLES)[];
  children: React.ReactNode;
}) => {
  const session = useSession();
  const userRole = session.data?.user.role ?? "";

  if (!roles.includes(userRole as keyof typeof USER_ROLES)) {
    return null;
  }
  return children;
};
export default RoleAction;
