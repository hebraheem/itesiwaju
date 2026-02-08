"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Wallet,
  User,
} from "lucide-react";
import { useAuth } from "@/lib/hooks/use-auth";

export function BottomNav() {
  const t = useTranslations("sidebar");
  const pathname = usePathname();
  const { user } = useAuth();
  const hasAccountAccess = user && ["admin", "treasurer"].includes(user.role);

  const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: t("dashboard") },
    { href: "/events", icon: Calendar, label: t("events") },
    { href: "/members", icon: Users, label: t("members") },
    {
      href: hasAccountAccess
        ? "/account-status"
        : `/account-status/${user?._id}`,
      icon: Wallet,
      label: t("accountStatus"),
    },
    { href: "/profile", icon: User, label: t("profile") },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t lg:hidden">
      <div className="flex items-center justify-around h-16 px-2 safe-area-inset-bottom">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all flex-1 min-w-0",
                isActive
                  ? "text-orange-500"
                  : "text-muted-foreground active:scale-95",
              )}
            >
              <item.icon
                className={cn(
                  "w-5 h-5 transition-transform",
                  isActive && "scale-110",
                )}
              />
              <span className="text-[10px] font-medium truncate w-full text-center">
                {item.label}
              </span>
              {isActive && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-orange-500 rounded-t-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
