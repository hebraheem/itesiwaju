"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Calendar, DollarSign, AlertCircle } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import MotionDiv from "@/components/animations/MotionDiv";
import { useAuth } from "@/lib/hooks/use-auth";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { EVENT_STATUSES, getMonth, parseDate, quickActions } from "@/lib/utils";
import { usePaginatedQuery } from "convex-helpers/react";

export function DashboardHome() {
  const t = useTranslations("dashboard");
  const at = useTranslations("activity");
  const { user } = useAuth();
  const { results: upcomingEvents } = usePaginatedQuery(
    api.events.getEvents,
    { status: EVENT_STATUSES.upcoming as keyof typeof EVENT_STATUSES },
    { initialNumItems: 5 },
  );
  const eventStat = useQuery(api.events.getEventStats);
  const userStat = useQuery(api.users.getMemberStats);

  const activities = useQuery(api.activities.getRecentActivities, {
    limit: 5,
    userId: user?._id,
  });

  const stats = [
    {
      icon: Users,
      label: "stats.totalMembers",
      value: userStat?.totalMembers,
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: Calendar,
      label: "stats.eventsThisMonth",
      value: eventStat?.eventsThisMonth,
      color: "from-orange-500 to-orange-600",
    },
    {
      icon: DollarSign,
      label: "stats.totalCollections",
      value: "₦2.4M",
      color: "from-green-500 to-green-600",
    },
    {
      icon: AlertCircle,
      label: "stats.pendingPayments",
      value: "18",
      color: "from-red-500 to-red-600",
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="space-y-6">
      {/* Welcome, Header */}
      <MotionDiv
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold capitalize">
          {t("welcome", { name: user?.name?.split(" ")[0] || "" })}
        </h1>
        <p className="text-muted-foreground">{t("overview")}</p>
      </MotionDiv>

      {/* Stats Cards */}
      <MotionDiv
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat, index) => (
          <MotionDiv key={index} variants={item}>
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      {t(stat.label)}
                    </p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <div
                    className={`p-3 bg-linear-to-br ${stat.color} rounded-xl`}
                  >
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </MotionDiv>
        ))}
      </MotionDiv>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <MotionDiv
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>{t("quickActions.title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  asChild
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Link href={action.href}>
                    <div className={`p-2 ${action.color} rounded-lg mr-3`}>
                      <action.icon className="w-4 h-4 text-white" />
                    </div>
                    {t(action.label)}
                  </Link>
                </Button>
              ))}
            </CardContent>
          </Card>
        </MotionDiv>

        {/* Upcoming Events */}
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t("upcomingEvents.title")}</CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link href="/events">{t("upcomingEvents.viewAll")}</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingEvents.map((event) => (
                <div
                  key={event._id}
                  className="flex gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="shrink-0 text-center">
                    <div className="w-16 h-16 bg-orange-500 text-white rounded-xl flex flex-col items-center justify-center">
                      <div className="text-2xl font-bold">
                        {event.startDate.split("-")[2]}
                      </div>
                      <div className="text-xs uppercase">
                        {getMonth(event.startDate)}
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold">{event.title}</h4>
                      <Badge variant={"default"}>{event.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {event.startTime}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {event.location}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </MotionDiv>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <MotionDiv
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t("recentActivity.title")}</CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link href="/activity">{t("recentActivity.viewAll")}</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {(activities ?? []).map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-orange-600">
                      {activity?.user?.[0]?.toUpperCase() ??
                        user?.firstName?.[0]?.toUpperCase()}
                      {activity?.user
                        ?.split(" ")
                        ?.slice(-1)[0]
                        ?.charAt(0)
                        ?.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-semibold">{activity.user}</span>{" "}
                      <span className="text-muted-foreground">
                        {activity?.action
                          ? at(activity?.action)
                          : activity?.description}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {parseDate(activity?._creationTime)}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </MotionDiv>

        {/* Account Status Overview */}
        <MotionDiv
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t("accountStatus.title")}</CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link href="/account-status">{t("accountStatus.viewAll")}</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">
                    {t("accountStatus.goodStanding")}
                  </span>
                  <span className="text-sm font-bold text-green-600">186</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500"
                    style={{ width: "75%" }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">
                    {t("accountStatus.pendingPayments")}
                  </span>
                  <span className="text-sm font-bold text-yellow-600">44</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-500"
                    style={{ width: "18%" }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">
                    {t("accountStatus.overdue")}
                  </span>
                  <span className="text-sm font-bold text-red-600">18</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-red-500" style={{ width: "7%" }} />
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">
                    {t("accountStatus.totalOutstanding")}
                  </span>
                  <span className="text-2xl font-bold text-orange-600">
                    ₦246,000
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </MotionDiv>
      </div>
    </div>
  );
}
