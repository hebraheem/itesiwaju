"use client";

import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";
import { ThemeSwitcher } from "@/components/common/ThemeSwitcher";
import { useRouter } from "@/i18n/navigation";
import { useSession } from "next-auth/react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import Image from "next/image";
import logo from "@/public/images/logo.png";

export function DashboardTopbar() {
  const router = useRouter();
  const { data: session } = useSession();
  const userEmail = session?.user?.email || "";

  // Get current user
  const currentUser = useQuery(
    api.users.getUserByEmail,
    userEmail ? { email: userEmail } : "skip"
  );

  // Get unread notification count
  const unreadCount = useQuery(
    api.notifications.getUnreadCount,
    currentUser?._id ? { userId: currentUser._id } : "skip"
  );

  return (
    <header className="h-16 border-b bg-card flex items-center justify-between px-4 md:px-6">
      {/* Mobile Logo */}
      <div className="flex items-center gap-3 lg:hidden">
        <div className="w-10 h-10 rounded-xl overflow-hidden">
          <Image
            src={logo}
            alt="Itesiwaju"
            width={40}
            height={40}
            className="object-cover"
          />
        </div>
        <div>
          <h2 className="font-bold text-base">Itesiwaju</h2>
          <p className="text-[10px] text-muted-foreground">Ìgbìmọ̀ Ìṣọ̀kan</p>
        </div>
      </div>

      {/* Desktop Search */}
      <div className="hidden lg:flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search..." className="pl-10" />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3 ml-auto">
        <LanguageSwitcher />
        <ThemeSwitcher />
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={() => router.push("/dashboard/notifications")}
        >
          <Bell className="w-5 h-5" />
          {unreadCount && unreadCount > 0 ? (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          ) : null}
        </Button>
      </div>
    </header>
  );
}
