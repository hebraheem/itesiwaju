"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  Calendar,
  DollarSign,
  UserPlus,
  FileText,
  Users,
  Clock,
  Loader2,
  Search,
} from "lucide-react";
import { usePaginatedQuery } from "convex-helpers/react";
import { api } from "@/convex/_generated/api";
import {
  ACTIVITY_TYPES,
  parseDate,
  removeEmptyFields,
  USER_ROLES,
} from "@/lib/utils";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { useSession } from "next-auth/react";
import RoleAction from "@/components/common/RoleAction";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function Activity() {
  const t = useTranslations("activity");
  const { data: session } = useSession();

  const [query, setQuery] = useState({
    type: "" as keyof typeof ACTIVITY_TYPES,
    search: "",
    onlyMine: true,
  });

  const convexArgs = {
    ...removeEmptyFields(query),
    userId: (query.onlyMine ? session?.user?.id : undefined) as any,
  };

  const copyConvexArgs = { ...convexArgs };
  delete copyConvexArgs.onlyMine;
  const {
    results: activities,
    loadMore,
    isLoading,
    status,
  } = usePaginatedQuery(
    api.activities.getActivities,
    { ...copyConvexArgs },
    { initialNumItems: 10 },
  );

  const tabs = ["all", "payment", "member", "event", "profile"];

  const getTabLabel = (type: string) => {
    switch (type) {
      case "all":
        return t("all");
      case "payment":
        return t("payment");
      case "member":
        return t("member");
      case "event":
        return t("event");
      case "profile":
        return t("profile");
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{t("title")}</h1>
            <p className="text-muted-foreground">{t("description")}</p>
          </div>
          <RoleAction roles={[USER_ROLES.admin]}>
            <div className="flex items-center gap-2">
              <Switch
                id="switch-disabled-unchecked"
                defaultChecked
                onCheckedChange={(checked) =>
                  setQuery((prev) => ({
                    ...prev,
                    onlyMine: checked,
                  }))
                }
              />
              <Label htmlFor="switch-disabled-unchecked">
                Only My Activities
              </Label>
            </div>
          </RoleAction>
        </div>
      </motion.div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 h-auto">
          {tabs.map((type) => (
            <TabsTrigger
              key={type}
              value={type}
              className="text-xs md:text-sm"
              onClick={() =>
                setQuery((prev) => ({
                  ...prev,
                  type: (type === "all"
                    ? ""
                    : type) as keyof typeof ACTIVITY_TYPES,
                }))
              }
            >
              {getTabLabel(type)}
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search activities..."
            value={query.search}
            onChange={(e) =>
              setQuery((prev) => ({ ...prev, search: e.target.value }))
            }
            className="pl-10"
          />
        </div>
        {["all", "payment", "member", "event", "profile"].map((type) => (
          <TabsContent key={type} value={type}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">
                  {getTabLabel(type)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading && status !== "LoadingMore" && (
                  <div className="flex justify-center items-center">
                    <Loader2 className="w-12 h-12 animate-spin text-orange-600 mx-auto" />
                  </div>
                )}
                <div className="space-y-4">
                  {activities.map((activity, index) => {
                    const colorMap: Record<string, string> = {
                      payment:
                        "text-green-600 bg-green-100 dark:bg-green-900/30",
                      member: "text-blue-600 bg-blue-100 dark:bg-blue-900/30",
                      event:
                        "text-orange-600 bg-orange-100 dark:bg-orange-900/30",
                      profile: "text-teal-600 bg-teal-100 dark:bg-teal-900/30",
                    };
                    const iconMap: Record<string, any> = {
                      payment: DollarSign,
                      member: UserPlus,
                      event: Calendar,
                      profile: Users,
                    };
                    const color = colorMap[activity.type] || "bg-muted";
                    const Icon = iconMap[activity.type] || FileText;

                    return (
                      <motion.div
                        key={activity._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-start gap-3 md:gap-4 p-3 md:p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <Avatar className="w-10 h-10 md:w-12 md:h-12 shrink-0">
                          <AvatarFallback className="bg-orange-500 text-white font-semibold text-xs md:text-sm">
                            {activity?.user?.[0]?.toUpperCase() ?? "A"}
                            {activity?.user
                              ?.split(" ")
                              ?.slice(-1)[0]
                              ?.charAt(0)
                              ?.toUpperCase() ?? "B"}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-1">
                            <div className="min-w-0">
                              <p className="text-sm md:text-base">
                                <span className="font-semibold">
                                  {activity.user}
                                </span>{" "}
                                <span className="text-muted-foreground">
                                  {activity?.action
                                    ? t(activity.action)
                                    : activity.description}
                                </span>
                              </p>
                            </div>
                            <Badge
                              variant="outline"
                              className={`${color} border-0 shrink-0`}
                            >
                              <Icon className="w-3 h-3 mr-1" />
                              {activity.type}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                            <Clock className="w-3 h-3" />
                            {parseDate(activity._creationTime)}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                  {status === "CanLoadMore" && (
                    <Button
                      variant="outline"
                      className="w-full mx-auto"
                      size="sm"
                      onClick={() => loadMore(10)}
                    >
                      {isLoading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin justify-center" />
                      )}
                      Load More
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
