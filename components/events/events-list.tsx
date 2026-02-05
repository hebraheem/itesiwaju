"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, MapPin, Plus, Search } from "lucide-react";
import { motion } from "framer-motion";

const mockEvents = [
  {
    id: "1",
    date: "15",
    month: "NOV",
    title: "Monthly General Meeting",
    time: "2:00 PM - 5:00 PM",
    location: "Community Hall Lagos",
    status: "confirmed",
    type: "meeting",
  },
  {
    id: "2",
    date: "22",
    month: "NOV",
    title: "Financial Workshop",
    time: "10:00 AM - 1:00 PM",
    location: "Online (Zoom)",
    status: "pending",
    type: "workshop",
  },
  {
    id: "3",
    date: "30",
    month: "NOV",
    title: "Community Outreach Program",
    time: "8:00 AM - 4:00 PM",
    location: "Ikeja District",
    status: "confirmed",
    type: "social",
  },
];

const pastEvents = [
  {
    id: "4",
    date: "05",
    month: "OCT",
    title: "Annual General Meeting",
    time: "1:00 PM - 4:00 PM",
    location: "Community Hall",
    status: "completed",
    type: "meeting",
  },
];

export function EventsList() {
  const t = useTranslations("events");
  const [search, setSearch] = useState("");

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
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
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-6">
        <TabsList>
          <TabsTrigger value="upcoming">{t("upcoming")}</TabsTrigger>
          <TabsTrigger value="past">{t("past")}</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 text-center">
                        <div className="w-16 h-16 bg-orange-500 text-white rounded-xl flex flex-col items-center justify-center">
                          <div className="text-2xl font-bold">{event.date}</div>
                          <div className="text-xs uppercase">{event.month}</div>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-semibold line-clamp-2">
                            {event.title}
                          </h3>
                          <Badge
                            variant={
                              event.status === "confirmed"
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
                            <span>{event.time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span className="truncate">{event.location}</span>
                          </div>
                        </div>
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="w-full mt-4"
                        >
                          <Link href={`/events/${event.id}`}>View Details</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="past">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastEvents.map((event) => (
              <Card key={event.id} className="opacity-75">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 text-center">
                      <div className="w-16 h-16 bg-gray-400 text-white rounded-xl flex flex-col items-center justify-center">
                        <div className="text-2xl font-bold">{event.date}</div>
                        <div className="text-xs uppercase">{event.month}</div>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold mb-2">{event.title}</h3>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{event.location}</span>
                        </div>
                      </div>
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="w-full mt-4"
                      >
                        <Link href={`/events/${event.id}`}>View Details</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
