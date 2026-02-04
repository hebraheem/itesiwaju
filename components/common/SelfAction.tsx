"use client";

import { ReactNode } from "react";
import { useSession } from "next-auth/react";

const SelfAction = ({ id, children }: { id: string; children: ReactNode }) => {
  const session = useSession();
  const userId = session.data?.user?.id ?? "";

  if (id !== userId) {
    return null;
  }
  return children;
};
export default SelfAction;
