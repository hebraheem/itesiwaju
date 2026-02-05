"use client";

import { useActionState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { EVENT_STATUSES, EVENT_TYPES } from "@/lib/utils";
import { createEventAction } from "@/app/actions/events.action";
import { useAuth } from "@/lib/hooks/use-auth";

export function EventForm({ eventId }: { eventId?: string }) {
  const t = useTranslations("events.form");
  const { user } = useAuth();
  const router = useRouter();
  const [state, action, isPending] = useActionState(createEventAction, {});

  useEffect(
    () => {
      if (String(state?.success) === "false") {
        console.error("state.error", state.message);
        toast.error(t(state.message ?? "errorMessage"));
      }

      if (state?.success) {
        toast.success(t("successMessage"));
        router.push("/events");
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.success],
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl space-y-6"
    >
      <div>
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">
          {eventId ? "Edit Event" : "Create Event"}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {eventId ? "Update event details" : "Add new event"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={action} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">{t("title")}</Label>
              <Input
                id="title"
                name="title"
                placeholder="Monthly General Meeting"
                className={state?.errors?.title ? "border-red-500" : ""}
              />
              {state?.errors?.title && (
                <p className="text-sm text-red-500">
                  {state?.errors?.title[0]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t("description")}</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Join us for our monthly meeting where we discuss community matters..."
                rows={4}
                className={state?.errors?.description ? "border-red-500" : ""}
              />
              {state?.errors?.description && (
                <p className="text-sm text-red-500">
                  {state.errors.description[0]}
                </p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="date">{t("date")}</Label>
                <Input
                  id="date"
                  type="date"
                  name="startDate"
                  className={state?.errors?.date ? "border-red-500" : ""}
                />
                {state?.errors?.date && (
                  <p className="text-sm text-red-500">{state.errors.date[0]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">{t("endDate")}</Label>
                <Input
                  id="endDate"
                  type="date"
                  name="endDate"
                  className={state?.errors?.endDate ? "border-red-500" : ""}
                />
                {state?.errors?.endDate && (
                  <p className="text-sm text-red-500">
                    {state.errors.endDate[0]}
                  </p>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="time">{t("time")}</Label>
                <Input
                  id="date"
                  type="time"
                  name="startTime"
                  className={state?.errors?.startTime ? "border-red-500" : ""}
                />
                {state?.errors?.startTime && (
                  <p className="text-sm text-red-500">
                    {state.errors.startTime[0]}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime">{t("endTime")}</Label>
                <Input
                  id="endTime"
                  type="time"
                  name="endTime"
                  className={state?.errors?.endTime ? "border-red-500" : ""}
                />
                {state?.errors?.endTime && (
                  <p className="text-sm text-red-500">
                    {state.errors.endTime[0]}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">{t("location")}</Label>
              <Input
                id="location"
                name="location"
                placeholder="Community Hall, 123 Main St."
                className={state?.errors?.location ? "border-red-500" : ""}
              />
              {state?.errors?.location && (
                <p className="text-sm text-red-500">
                  {state.errors.location[0]}
                </p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="type">{t("type")}</Label>
                <Select name="type">
                  <SelectTrigger
                    className={state?.errors?.type ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(EVENT_TYPES).map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {state?.errors?.type && (
                  <p className="text-sm text-red-500">{state.errors.type[0]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">{t("status")}</Label>
                <Select name="status">
                  <SelectTrigger
                    className={state?.errors?.status ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(EVENT_STATUSES).map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {state?.errors?.status && (
                  <p className="text-sm text-red-500">
                    {state.errors.status[0]}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="minutes">{t("minutes")}</Label>
              <Textarea
                id="minutes"
                name="minutes"
                placeholder="What happend at the event.."
                rows={4}
                className={state?.errors?.minutes ? "border-red-500" : ""}
              />
              {state?.errors?.minutes && (
                <p className="text-sm text-red-500">
                  {state.errors.minutes[0]}
                </p>
              )}
            </div>
            <input defaultValue={user?.email ?? ""} hidden name="authEmail" />
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 text-white"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {t("submit")}
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                {t("cancel")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
