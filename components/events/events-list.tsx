"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Loader2, MapPin, Plus, Search } from "lucide-react";
import { motion } from "framer-motion";
import { usePaginatedQuery } from "convex-helpers/react";
import { api } from "@/convex/_generated/api";
import {
  EVENT_STATUSES,
  EVENT_TYPES,
  getMonth,
  removeEmptyFields,
} from "@/lib/utils";

export function EventsList() {
  const t = useTranslations("events");
  const [query, setQuery] = useState({
    search: "" as string | undefined,
    status: "upcoming" as keyof typeof EVENT_STATUSES | undefined,
    type: "" as keyof typeof EVENT_TYPES | undefined,
  });
  const { results, loadMore, status, isLoading } = usePaginatedQuery(
    api.events.getEvents,
    { ...removeEmptyFields(query) },
    { initialNumItems: 10 },
  );

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-4 md:flex-row flex-col md:items-center  md:justify-between justify-start"
      >
        <div>
          <h1 className="text-3xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground">
            Manage community events and calendar
          </p>
        </div>
        <Button
          asChild
          className="bg-orange-500 hover:bg-orange-600 text-white"
        >
          <Link href="/events/create">
            <Plus className="w-4 h-4 mr-2" />
            {t("create")}
          </Link>
        </Button>
      </motion.div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            value={query.search}
            onChange={(e) =>
              setQuery((prev) => ({ ...prev, search: e.target.value }))
            }
            className="pl-10"
          />
        </div>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-6">
        <TabsList className="overflow-x-auto w-full">
          {Object.keys(EVENT_STATUSES).map((evt) => (
            <TabsTrigger
              key={evt}
              value={evt}
              onClick={() =>
                setQuery((prev) => ({
                  ...prev,
                  status: evt as keyof typeof EVENT_STATUSES,
                }))
              }
            >
              {t(evt)}
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.keys(EVENT_STATUSES).map((evt) => {
          return (
            <TabsContent value={evt} key={evt}>
              {isLoading && status !== "LoadingMore" && (
                <Loader2 className="w-12 h-12 animate-spin text-orange-600 mx-auto" />
              )}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((event, index) => (
                  <motion.div
                    key={event._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex gap-4">
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
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h3 className="font-semibold line-clamp-2">
                                {event.title}
                              </h3>
                              <Badge
                                variant={
                                  event.status === "upcoming"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {event.status}
                              </Badge>
                            </div>
                            <div className="space-y-1 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span>{event.startTime}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                <span className="truncate">
                                  {event.location}
                                </span>
                              </div>
                            </div>
                            <Button
                              asChild
                              variant="outline"
                              size="sm"
                              className="w-full mt-4"
                            >
                              <Link href={`/events/${event._id}`}>
                                View Details
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
