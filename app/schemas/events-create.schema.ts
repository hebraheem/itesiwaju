import * as z from "zod";

export const createEventSchema = z.object({
  title: z.string("eventTitleRequired"),
  description: z.string().min(8, "eventDescriptionRequired"),
  location: z.string().min(3, "eventLocationRequired"),
  status: z.enum(
    ["upcoming", "ongoing", "completed", "cancelled"],
    "eventStatusRequired",
  ),
  startDate: z.string("eventStartDateRequired"),
  endDate: z.optional(z.string()),
  startTime: z.string("eventStartTimeRequired"),
  endTime: z.optional(z.string()),
  type: z.enum(
    ["meeting", "social", "workshop", "fundraiser", "others"],
    "eventTypeRequired",
  ),
  minutes: z.optional(z.string()),
});
