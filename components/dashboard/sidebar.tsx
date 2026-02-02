"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Wallet,
  Settings,
  User,
  LogOut,
  FileText,
  Activity as ActivityIcon,
} from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Image from "next/image";
import React from "react";
import logo from "@/public/images/logo.png";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function DashboardSidebar({ onClose }: { onClose?: () => void }) {
  const t = useTranslations("sidebar");
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: t("dashboard") },
    { href: "/events", icon: Calendar, label: t("events") },
    { href: "/members", icon: Users, label: t("members") },
    { href: "/account-status", icon: Wallet, label: t("accountStatus") },
    { href: "/reports", icon: FileText, label: "Reports" },
    { href: "/activity", icon: ActivityIcon, label: "Activity" },
  ];

  const settingsItems = [
    { href: "/profile", icon: User, label: t("profile") },
    { href: "/settings", icon: Settings, label: t("settings") },
  ];

  return (
    <motion.aside
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className="w-64 bg-card border-r flex flex-col h-full"
    >
      {/* Logo */}
      <div className="p-6 border-b">
        <Link
          href="/dashboard"
          className="flex items-center gap-3"
          onClick={onClose}
        >
          <div className="w-10 h-10 bg-linear-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
            <Image
              src={logo}
              alt="logo"
              width={60}
              height={60}
              className="rounded-full"
            />
          </div>
          <div>
            <h2 className="font-bold text-lg">Itesiwaju</h2>
            <p className="text-xs text-muted-foreground">Ìgbìmọ̀ Ìṣọ̀kan</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                isActive
                  ? "bg-orange-500 text-white"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Settings */}
      <div className="p-4 space-y-1 border-t">
        <p className="px-4 text-xs font-semibold text-muted-foreground uppercase mb-2">
          Settings
        </p>
        {settingsItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                isActive
                  ? "bg-orange-500 text-white"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* User Profile */}
      <div className="p-4 border-t">
        <div className="flex items-center gap-3 mb-3">
          <Avatar>
            <AvatarFallback className="bg-orange-500 text-white">
              {user?.firstName[0]}
              {user?.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-muted-foreground capitalize">
              {user?.role}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="w-full" onClick={logout}>
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </motion.aside>
  );
}
