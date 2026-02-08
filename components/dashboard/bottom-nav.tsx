"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Wallet,
  MoreHorizontal,
  LogOut,
  Settings,
  Activity,
  User,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/hooks/use-auth";
import { useState } from "react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export function BottomNav() {
  const t = useTranslations("sidebar");
  const pathname = usePathname();
  const { user } = useAuth();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
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
  ];

  const moreItems = [
    { href: "/profile", icon: User, label: t("profile") },
    { href: "/activity", icon: Activity, label: t("activity") },
    { href: "/settings", icon: Settings, label: t("settings") },
  ];

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <>
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

          {/* More Menu */}
          <button
            onClick={() => setIsMoreOpen(true)}
            className={cn(
              "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all flex-1 min-w-0",
              "text-muted-foreground active:scale-95",
            )}
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-[10px] font-medium truncate w-full text-center">
              {t("more")}
            </span>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {isMoreOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMoreOpen(false)}
              className="fixed inset-0 bg-black/60 z-50 lg:hidden"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-xl shadow-lg lg:hidden pb-safe"
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">{t("more")}</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMoreOpen(false)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {moreItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMoreOpen(false)}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  ))}
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="w-full justify-start gap-3 p-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">{t("logout")}</span>
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
