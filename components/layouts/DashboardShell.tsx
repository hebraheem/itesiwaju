"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/dashboard/bottom-nav";
import { useAuth } from "@/lib/hooks/use-auth";
import Image from "next/image";
import logo from "@/public/apple-touch-icon.png";

export function DashboardShell({
  children,
  sidebar,
  topbar,
}: {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  topbar: React.ReactNode;
}) {
  const data = useAuth();
  const router = useRouter();

  useEffect(
    () => {
      if (!data.isLoading && !data.isAuthenticated) {
        router.push("/login");
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data.isLoading, data.isAuthenticated],
  );

  if (data.isLoading || !data.isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-orange-500">
          <Image
            src={logo}
            alt="logo"
            width={120}
            height={120}
            className="rounded-full"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden lg:block">{sidebar}</div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {topbar}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 lg:pb-6">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
