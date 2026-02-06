"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { Link } from "@/i18n/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ACCOUNT_STATUSES, removeEmptyFields } from "@/lib/utils";
import { usePaginatedQuery } from "convex-helpers/react";

export function AccountStatusList() {
  const t = useTranslations("accountStatus");
  const { data: session } = useSession();

  const [query, setQuery] = useState({
    search: "",
    onlyMine: true,
    status: "" as keyof typeof ACCOUNT_STATUSES | undefined,
  });

  const convexArgs = {
    ...removeEmptyFields(query),
    authEmail: session?.user?.email || "",
  };

  const copyConvexArgs = { ...convexArgs };
  delete copyConvexArgs.onlyMine;
  const { results, loadMore, isLoading, status } = usePaginatedQuery(
    api.accounts.getAllAccounts,
    { ...copyConvexArgs },
    { initialNumItems: 10 },
  );
  const accountSummary = useQuery(api.accounts.getAccountStats, {
    authEmail: session?.user?.email || "",
  });
  console.log("accountSummary", accountSummary);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "good_standing":
        return "default";
      case "overdue":
        return "destructive";
      case "owing":
        return "secondary";
      default:
        return "outline";
    }
  };

  const tabs = [
    { value: "all", label: t("tabs.all") },
    { value: "good_standing", label: t("status.goodStanding") },
    { value: "owing", label: t("status.owing") },
    { value: "overdue", label: t("status.overdue") },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{t("title")}</h1>
            <p className="text-muted-foreground">{t("description")}</p>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: t("stats.totalOutstanding"),
            value:
              "€" + (accountSummary?.totalOutstanding ?? 0).toLocaleString(),
            color: "text-orange-600",
          },
          {
            label: t("stats.moneyAtHand"),
            value: "€" + (accountSummary?.moneyAtHand ?? 0).toLocaleString(),
            color: "text-green-600",
          },
          {
            label: t("stats.totalFine"),
            value: "€" + (accountSummary?.totalFines ?? 0).toLocaleString(),
            color: "text-orange-600",
          },
          {
            label: t("stats.totalBorrowed"),
            value: "€" + (accountSummary?.totalBorrowed ?? 0).toLocaleString(),
            color: "text-orange-600",
          },
          {
            label: t("stats.goodStanding"),
            value: accountSummary?.goodStanding ?? 0,
            color: "text-green-600",
          },
          {
            label: t("stats.pendingPayments"),
            value: accountSummary?.owing ?? 0,
            color: "text-yellow-600",
          },
          {
            label: t("stats.overdue"),
            value: accountSummary?.overdue ?? 0,
            color: "text-red-600",
          },
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-6 text-center">
              <p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
              <p className={`text-2xl md:text-3xl font-bold ${stat.color}`}>
                {stat.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 h-auto overflow-auto">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="text-xs sm:text-sm"
              onClick={() =>
                setQuery((prev) => ({
                  ...prev,
                  status:
                    tab.value === "all"
                      ? undefined
                      : (tab.value as keyof typeof ACCOUNT_STATUSES),
                }))
              }
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t("search")}
            value={query.search}
            onChange={(e) =>
              setQuery((prev) => ({ ...prev, search: e.target.value }))
            }
            className="pl-10"
          />
        </div>

        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            <div className="space-y-4">
              {results.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <p className="text-muted-foreground">{t("noRecords")}</p>
                  </CardContent>
                </Card>
              ) : (
                results.map((account, index) => (
                  <motion.div
                    key={account._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex  sm:flex-row sm:items-center gap-4">
                          <Avatar className="w-12 h-12">
                            <AvatarFallback className="bg-orange-500 text-white font-semibold">
                              {account.user?.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm sm:text-base">
                              {account.user?.name}
                            </h3>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              {t("details.borrowedAmount")}: €
                              {account.currentBorrowedAmount.toLocaleString()}
                            </p>
                          </div>
                          {account?.dueDate && (
                            <div className="hidden md:block">
                              <p className="text-sm text-muted-foreground">
                                {t("details.dueDate")}: {account?.dueDate}
                              </p>
                            </div>
                          )}
                          <div className="flex items-center gap-2 sm:gap-3">
                            <Badge
                              variant={getStatusBadgeVariant(account.status)}
                              className="text-xs"
                            >
                              {t(`status.${account.status}`)}
                            </Badge>
                            <Button asChild variant="outline" size="sm">
                              <Link href={`/account-status/${account.userId}`}>
                                {t("viewDetails")}
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
