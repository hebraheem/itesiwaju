"use client";

import { useRouter } from "@/i18n/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  MapPin,
  ArrowLeft,
  Edit,
  Trash2,
  Users,
  Loader2,
  CheckIcon,
  TimerReset,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { EVENT_STATUSES, parseDate, USER_ROLES } from "@/lib/utils";
import { MediaCarousel } from "@/components/common/MediaCarousel";
import RoleAction from "@/components/common/RoleAction";
import {
  cancelEventAction,
  deleteEventAction,
  markEventCompletedAction,
} from "@/app/actions/events.action";
import { useAuth } from "@/lib/hooks/use-auth";

export function EventDetail({ eventId }: { eventId: Id<"events"> }) {
  const router = useRouter();
  const { user } = useAuth();
  const event = useQuery(api.events.getEventById, { id: eventId });

  const editableAndCancellable = [
    EVENT_STATUSES.upcoming,
    EVENT_STATUSES.ongoing,
  ].includes(event?.status as "upcoming" | "ongoing");
  const canComplete = event?.status === EVENT_STATUSES.ongoing;
  const deletable = [
    EVENT_STATUSES.upcoming,
    EVENT_STATUSES.ongoing,
    EVENT_STATUSES.cancelled,
  ].includes(event?.status as "upcoming" | "ongoing" | "cancelled");

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this event?")) {
      const result = await deleteEventAction(eventId, user?.email ?? "");
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success("Event deleted successfully");
      router.push("/events");
    }
  };
  const handleComplete = async () => {
    if (confirm("Are you sure you want to mark this event as completed?")) {
      const result = await markEventCompletedAction(eventId, user?.email ?? "");
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success("Event marked as completed");
      router.push("/events");
    }
  };
  const handleCancel = async () => {
    if (confirm("Are you sure you want to cancel this event?")) {
      const result = await cancelEventAction(eventId, user?.email ?? "");
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success("Event cancelled successfully");
      router.push("/events");
    }
  };

  if (!event) {
    return (
      <Loader2 className="w-12 h-12 animate-spin text-orange-600 mx-auto" />
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="flex justify-between items-start">
          <div>
            <Badge className="mb-2">{event?.status}</Badge>
            <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
            <p className="text-muted-foreground">Event Details</p>
          </div>
          <RoleAction roles={[USER_ROLES.admin, USER_ROLES.pro]}>
            <div className="flex gap-2">
              {editableAndCancellable && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/events/${eventId}/edit`)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              )}
              {deletable && (
                <Button variant="destructive" onClick={handleDelete} size="sm">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              )}
              {canComplete && (
                <Button asChild size="sm" onClick={handleComplete}>
                  <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md">
                    <CheckIcon className="w-4 h-4 mr-2" />
                    Complete
                  </button>
                </Button>
              )}
              {editableAndCancellable && (
                <Button variant="destructive" onClick={handleCancel} size="sm">
                  <TimerReset className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              )}
            </div>
          </RoleAction>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardContent className="p-8 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <Calendar className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-semibold">
                    {parseDate(new Date(event.startDate).getTime())}{" "}
                    {event?.endDate
                      ? `- ${parseDate(new Date(event?.endDate).getTime())}`
                      : ""}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Time</p>
                  <p className="font-semibold">
                    {event.startTime} {event.endTime ? event.endTime : ""}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <MapPin className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-semibold">{event.location}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Attendees</p>
                  <p className="font-semibold">All members</p>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold text-lg mb-3">Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                {event.description}
              </p>
            </div>
            {event?.minutes && (
              <div className="border-t pt-6">
                <h3 className="font-semibold text-lg mb-3">Description</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {event.minutes}
                </p>
              </div>
            )}
            {event?.media?.length && (
              <div className="border-t pt-6">
                <h3 className="font-semibold text-lg mb-3">Media</h3>
                <MediaCarousel
                  media={
                    event.media.map(({ url }) => ({ url })) as { url: string }[]
                  }
                />
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
