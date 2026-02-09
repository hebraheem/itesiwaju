"use client";

import React from "react";
import { USER_ROLES } from "@/lib/utils";
import { useAuth } from "@/lib/hooks/use-auth";

const RoleAction = ({
  roles,
  children,
}: {
  roles: (keyof typeof USER_ROLES)[];
  children: React.ReactNode;
}) => {
  const { user } = useAuth();
  const userRole = user?.role ?? "";

  if (!roles.includes(userRole as keyof typeof USER_ROLES)) {
    return null;
  }
  return children;
};
export default RoleAction;
