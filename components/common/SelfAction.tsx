"use client";

import { ReactNode } from "react";
import { useAuth } from "@/lib/hooks/use-auth";

const SelfAction = ({ id, children }: { id: string; children: ReactNode }) => {
  const { user } = useAuth();
  const userId = user?._id ?? "";

  if (id !== userId) {
    return null;
  }
  return children;
};
export default SelfAction;
