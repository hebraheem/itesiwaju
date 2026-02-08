"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { useRouter } from "@/i18n/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell,
  Check,
  Trash2,
  Users,
  Calendar,
  Wallet,
  User,
  Settings,
  CheckCheck,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export function Notifications() {
  const t = useTranslations("notifications");
  const { data: session } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");

  const userEmail = session?.user?.email || "";

  // Get current user
  const currentUser = useQuery(
    api.users.getUserByEmail,
    userEmail ? { email: userEmail } : "skip",
  );

  // Get all notifications
  const allNotifications = useQuery(
    api.notifications.getUserNotifications,
    currentUser?._id ? { userId: currentUser._id, limit: 100 } : "skip",
  );

  // Mutations
  const markAsRead = useMutation(api.notifications.markAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllAsRead);
  const deleteNotification = useMutation(api.notifications.deleteNotification);
  const deleteReadNotifications = useMutation(
    api.notifications.deleteReadNotifications,
  );

  const handleMarkAsRead = async (notificationId: Id<"notifications">) => {
    try {
      await markAsRead({ notificationId });
    } catch (error) {
      toast.error(
        t((error as { message: string })?.message ?? "errors.markReadFailed"),
      );
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!currentUser?._id) return;
    try {
      await markAllAsRead({ userId: currentUser._id });
      toast.success(t("success.markedAllRead"));
    } catch (error) {
      toast.error(
        t(
          (error as { message: string })?.message ?? "errors.markAllReadFailed",
        ),
      );
    }
  };

  const handleDelete = async (notificationId: Id<"notifications">) => {
    try {
      await deleteNotification({ notificationId });
      toast.success(t("success.deleted"));
    } catch (error) {
      toast.error(
        t((error as { message: string })?.message ?? "errors.deleteFailed"),
      );
    }
  };

  const handleClearRead = async () => {
    if (!currentUser?._id) return;
    try {
      await deleteReadNotifications({ userId: currentUser._id });
      toast.success(t("success.clearedRead"));
    } catch (error) {
      toast.error(
        t((error as { message: string })?.message ?? "errors.clearReadFailed"),
      );
    }
  };

  const handleNotificationClick = async (notification: any) => {
    if (!notification.read) {
      await handleMarkAsRead(notification._id);
    }
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "member":
        return <Users className="w-5 h-5" />;
      case "event":
        return <Calendar className="w-5 h-5" />;
      case "payment":
        return <Wallet className="w-5 h-5" />;
      case "profile":
        return <User className="w-5 h-5" />;
      case "system":
        return <Settings className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case "member":
        return "bg-blue-500";
      case "event":
        return "bg-purple-500";
      case "payment":
        return "bg-green-500";
      case "profile":
        return "bg-orange-500";
      case "system":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const filteredNotifications =
    activeTab === "all"
      ? allNotifications
      : activeTab === "unread"
        ? allNotifications?.filter((n) => !n.read)
        : allNotifications?.filter((n) => n.type === activeTab);

  const unreadCount = allNotifications?.filter((n) => !n.read).length || 0;

  if (!currentUser || !allNotifications) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground mt-1">
            {t("subtitle", { count: unreadCount })}
          </p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="gap-2"
            >
              <CheckCheck className="w-4 h-4" />
              {t("actions.markAllRead")}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearRead}
            className="gap-2"
          >
            <Trash2 className="w-4 h-4" />
            {t("actions.clearRead")}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex overflow-x-auto w-full">
          <TabsTrigger value="all">{t("tabs.all")}</TabsTrigger>
          <TabsTrigger value="unread">
            {t("tabs.unread")}
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 px-1.5">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <AnimatePresence mode="popLayout">
            {filteredNotifications && filteredNotifications.length === 0 ? (
              <Card>
                <CardContent className="py-16 text-center">
                  <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">{t("empty")}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredNotifications?.map((notification) => (
                  <motion.div
                    key={notification._id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        !notification.read
                          ? "border-l-4 border-l-orange-500 bg-orange-50/50 dark:bg-orange-950/20"
                          : ""
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <div
                            className={`shrink-0 w-10 h-10 rounded-full ${getIconColor(notification.type)} flex items-center justify-center text-white`}
                          >
                            {getIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h3 className="font-semibold text-sm md:text-base">
                                {notification.title}
                              </h3>
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {formatDistanceToNow(notification.createdAt, {
                                  addSuffix: true,
                                })}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-2 mt-3">
                              <Badge variant="outline" className="text-xs">
                                {t(`types.${notification.type}`)}
                              </Badge>
                              {!notification.read && (
                                <Badge variant="secondary" className="text-xs">
                                  {t("status.new")}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  await handleMarkAsRead(notification._id);
                                }}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                              onClick={async (e) => {
                                e.stopPropagation();
                                await handleDelete(notification._id);
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </TabsContent>
      </Tabs>
    </div>
  );
}
