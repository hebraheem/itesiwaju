"use client";

import { useActionState, useEffect, useState } from "react";
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
import {
  ArrowLeft,
  Loader2,
  Save,
  Upload,
  X,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { EVENT_STATUSES, EVENT_TYPES } from "@/lib/utils";
import { createEventAction } from "@/app/actions/events.action";
import { useAuth } from "@/lib/hooks/use-auth";
import Image from "next/image";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";

export function EventForm({ eventId }: { eventId?: Id<"events"> }) {
  const t = useTranslations("events.form");
  const event = useQuery(
    api.events.getEventById,
    eventId ? { id: eventId } : "skip",
  );
  const { user } = useAuth();
  const router = useRouter();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
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
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              selectedFiles.forEach((file) => {
                fd.append("files", file);
              });
              action(fd);
            }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <Label htmlFor="title">{t("title")}</Label>
              <Input
                id="title"
                name="title"
                defaultValue={event?.title ?? state?.title}
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
                defaultValue={event?.description ?? state?.description}
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
                <Label htmlFor="startDate">{t("startDate")}</Label>
                <Input
                  id="startDate"
                  type="date"
                  defaultValue={event?.startDate ?? state?.startDate}
                  name="startDate"
                  className={state?.errors?.startDate ? "border-red-500" : ""}
                />
                {state?.errors?.startDate && (
                  <p className="text-sm text-red-500">
                    {state.errors.startDate[0]}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">{t("endDate")}</Label>
                <Input
                  id="endDate"
                  type="date"
                  defaultValue={event?.endDate ?? state?.endDate}
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
                <Label htmlFor="startTime">{t("startTime")}</Label>
                <Input
                  id="startTime"
                  type="time"
                  defaultValue={event?.startTime ?? state?.startTime}
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
                  defaultValue={event?.endTime ?? state?.endTime}
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
                defaultValue={event?.location ?? state?.location}
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
                <Select name="type" defaultValue={event?.type ?? state?.type}>
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
                <Select
                  name="status"
                  defaultValue={event?.status ?? state?.status}
                >
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
                defaultValue={event?.minutes ?? state?.minutes}
                className={state?.errors?.minutes ? "border-red-500" : ""}
              />
              {state?.errors?.minutes && (
                <p className="text-sm text-red-500">
                  {state.errors.minutes[0]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="files">{t("files")}</Label>
              <div className="space-y-3">
                <div className="relative">
                  <Input
                    id="files"
                    name="selectedFiles"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []) as File[];
                      setSelectedFiles((prev) => [...prev, ...files]);
                    }}
                    className="cursor-pointer file:cursor-pointer"
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                    <Upload className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                {selectedFiles.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {selectedFiles.map((file, index) => {
                      const isImage = file.type.startsWith("image/");
                      const fileUrl = URL.createObjectURL(file);

                      return (
                        <motion.div
                          key={`${file.name}-${index}`}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="relative group aspect-square rounded-lg overflow-hidden border border-border bg-muted"
                        >
                          {isImage && (
                            <Image
                              src={fileUrl}
                              alt={file.name}
                              width={400}
                              height={400}
                              className="w-full h-full object-cover"
                            />
                          )}
                          {!isImage && (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="w-8 h-8 text-muted-foreground" />
                            </div>
                          )}

                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button
                              type="button"
                              size="icon"
                              variant="destructive"
                              className="h-8 w-8 rounded-full"
                              onClick={() => {
                                URL.revokeObjectURL(fileUrl);
                                setSelectedFiles((prev) =>
                                  prev.filter((_, i) => i !== index),
                                );
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/70 to-transparent p-2">
                            <p className="text-xs text-white truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-white/70">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}

                <p className="text-xs text-muted-foreground">
                  {t("filesHint")}
                </p>
              </div>
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
            <input hidden name="id" defaultValue={eventId} />
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
