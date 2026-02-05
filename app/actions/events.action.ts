import { EVENT_STATUSES, EVENT_TYPES } from "@/lib/utils";
import { createEventSchema } from "@/app/schemas/events-create.schema";
import { convexServer } from "@/lib/convexServer";
import { api } from "@/convex/_generated/api";

type CreateEventResponse = {
  message?: string;
  success?: boolean;
  errors?: Record<string, string>;
  title?: string;
  description?: string;
  location?: string;
  status?: keyof typeof EVENT_STATUSES;
  startDate?: number;
  endDate?: number;
  startTime?: number;
  endTime?: number;
  type?: keyof typeof EVENT_TYPES;
  minutes?: string;
  files?: File[];
};

export async function createEventAction(
  _prev: CreateEventResponse,
  formData: FormData,
): Promise<CreateEventResponse> {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const location = formData.get("location") as string;
  const status = formData.get("status") as string;
  const startDate = formData.get("startDate") as string;
  const endDate = formData.get("endDate") as string;
  const startTime = formData.get("startTime") as string;
  const endTime = formData.get("endTime") as string;
  const type = formData.get("type") as string;
  const minutes = formData.get("minutes") as string;
  const authEmail = formData.get("authEmail") as string;

  try {
    const data = {
      title,
      description,
      location,
      status,
      startDate,
      endDate,
      startTime,
      endTime,
      type,
      minutes,
    };
    const parsed = createEventSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        errors: parsed.error.flatten().fieldErrors as Record<string, string>,
        ...Object.fromEntries(formData.entries()),
      };
    }

    const uploadedMedia = [];
    const uploadUrl = await convexServer.mutation(api.files.generateUploadUrl);
    for (const file of files) {
      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      const { storageId } = await res.json();

      uploadedMedia.push({
        storageId,
        type: file.type.startsWith("video") ? "video" : "image",
        mimeType: file.type,
        size: file.size,
      });
    }

    return {
      success: true,
      message: "Event created successfully!",
    };
  } catch (error) {
    return {
      message:
        (error as Error)?.message ??
        "An unexpected error occurred. Please try again.",
      success: false,
      ...Object.fromEntries(formData.entries()),
    };
  }
}
