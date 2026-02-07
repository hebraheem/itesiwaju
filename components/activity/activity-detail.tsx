"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  FileText,
  Activity as ActivityIcon,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { parseDate } from "@/lib/utils";

const activityIcons = {
  payment: FileText,
  member: User,
  event: Calendar,
  report: FileText,
  profile: User,
};

const activityColors = {
  payment: "text-green-600 bg-green-100 dark:bg-green-900/30",
  member: "text-blue-600 bg-blue-100 dark:bg-blue-900/30",
  event: "text-purple-600 bg-purple-100 dark:bg-purple-900/30",
  report: "text-orange-600 bg-orange-100 dark:bg-orange-900/30",
  profile: "text-pink-600 bg-pink-100 dark:bg-pink-900/30",
};

export function ActivityDetail({ activityId }: { activityId: string }) {
  const t = useTranslations("activity");
  const tc = useTranslations("common");
  const router = useRouter();

  const activity = useQuery(api.activities.getActivityById, {
    id: activityId as Id<"activities">,
  });

  if (activity === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 animate-spin text-orange-600" />
      </div>
    );
  }

  if (activity === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <ActivityIcon className="w-16 h-16 text-muted-foreground" />
        <p className="text-xl text-muted-foreground">{t("notFound")}</p>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          {tc("back")}
        </Button>
      </div>
    );
  }

  const Icon = activityIcons[activity.type as keyof typeof activityIcons] || ActivityIcon;
  const colorClass = activityColors[activity.type as keyof typeof activityColors] || "text-gray-600 bg-gray-100 dark:bg-gray-900/30";

  return (
    <div className="space-y-6 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {tc("back")}
        </Button>
        <div className="flex items-start gap-4">
          <div className={`p-4 rounded-xl ${colorClass}`}>
            <Icon className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-2xl md:text-3xl font-bold">{t("details")}</h1>
              <Badge variant="outline" className="capitalize">
                {t(activity.type)}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {activity?.action ? (
                activity.metadata && Object.keys(activity.metadata).length > 0 
                  ? t(activity.action, activity.metadata)
                  : activity.description || t(activity.action, {})
              ) : activity.description}
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid gap-6 md:grid-cols-2"
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("activityInfo")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <User className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("performedBy")}</p>
                <p className="font-semibold">
                  {typeof activity.user === 'string' 
                    ? activity.user 
                    : activity.user?.name || 'Unknown User'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("date")}</p>
                <p className="font-semibold">{parseDate(activity._creationTime)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("time")}</p>
                <p className="font-semibold">
                  {new Date(activity._creationTime).toLocaleTimeString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <ActivityIcon className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("actionType")}</p>
                <p className="font-semibold capitalize">{activity.action || t("noAction")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {activity.metadata && Object.keys(activity.metadata).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t("additionalDetails")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(activity.metadata).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-start">
                    <span className="text-sm text-muted-foreground capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}:
                    </span>
                    <span className="font-semibold text-sm text-right max-w-[60%]">
                      {typeof value === 'number' && key.toLowerCase().includes('date')
                        ? parseDate(value)
                        : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("fullDescription")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">
            {activity.description || t("noDescription")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
