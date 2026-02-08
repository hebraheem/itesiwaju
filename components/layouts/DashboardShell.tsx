"use client";

import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { BottomNav } from "@/components/dashboard/bottom-nav";

export function DashboardShell({
  children,
  sidebar,
  topbar,
}: {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  topbar: React.ReactNode;
}) {
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session.data && session.status === "unauthenticated") {
      router.push("/login");
    }
  }, [session.status, session.data, router]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden lg:block">
        {sidebar}
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {topbar}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 lg:pb-6">
          {session.status !== "authenticated" ? (
            <div className="flex items-center justify-center h-screen">
              <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
            </div>
          ) : (
            children
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
