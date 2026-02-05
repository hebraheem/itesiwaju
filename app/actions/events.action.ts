import { EVENT_STATUSES, EVENT_TYPES } from "@/lib/utils";
import { createEventSchema } from "@/app/schemas/events-create.schema";
import { convexServer } from "@/lib/convexServer";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

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
  prev: CreateEventResponse,
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
  const files = formData.getAll("files") as File[];
  const id = formData.get("id") as string | null;

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
    const service = id ? api.events.updateEvent : api.events.createEvent;
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
        type: "image" as "image" | "video",
        mimeType: file.type,
        size: file.size,
        url: "",
        name: file.name,
      });
    }
    const dataToSave = {
      title: parsed.data.title,
      description: parsed.data.description,
      location: parsed.data.location,
      status: parsed.data.status,
      startDate: parsed.data.startDate,
      endDate: parsed.data.endDate,
      startTime: parsed.data.startTime,
      endTime: parsed.data.endTime,
      type: parsed.data.type,
      minutes: parsed.data.minutes,
      media: uploadedMedia.length > 0 ? uploadedMedia : undefined,
      authEmail,
    };
    if (id) {
      (dataToSave as any).id = id;
    }
    await convexServer.mutation(service, dataToSave);

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

export const deleteEventAction = async (
  eventId: string,
  authEmail: string,
): Promise<{ success: boolean; message: string }> => {
  try {
    await convexServer.mutation(api.events.deleteEvent, {
      id: eventId as Id<"events">,
      authEmail,
    });
    return { success: true, message: "Event deleted successfully!" };
  } catch (error) {
    return {
      success: false,
      message:
        (error as Error)?.message ??
        "An unexpected error occurred while deleting the event. Please try again.",
    };
  }
};

export const cancelEventAction = async (
  eventId: string,
  authEmail: string,
): Promise<{ success: boolean; message: string }> => {
  try {
    await convexServer.mutation(api.events.cancelEvent, {
      id: eventId as Id<"events">,
      authEmail,
    });
    return { success: true, message: "Event cancelled successfully!" };
  } catch (error) {
    return {
      success: false,
      message:
        (error as Error)?.message ??
        "An unexpected error occurred while cancelling the event. Please try again.",
    };
  }
};

export const markEventCompletedAction = async (
  eventId: string,
  authEmail: string,
): Promise<{ success: boolean; message: string }> => {
  try {
    await convexServer.mutation(api.events.completeEvent, {
      id: eventId as Id<"events">,
      authEmail,
    });
    return { success: true, message: "Event marked as completed!" };
  } catch (error) {
    return {
      success: false,
      message:
        (error as Error)?.message ??
        "An unexpected error occurred while updating the event. Please try again.",
    };
  }
};
