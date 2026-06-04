import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import {
  getCurrentUser,
  hasPermission,
  notifyAllMembers,
} from "@/convex/utils";
import { Id } from "@/convex/_generated/dataModel";
import { paginationOptsValidator } from "convex/server";

// ============================================================================
// TYPES & CONSTANTS
// ============================================================================

type MediaWithUrl = {
  storageId: Id<"_storage">;
  url: string | null;
  type: "image" | "video";
  mimeType: string;
  size: number;
}[];

export const EVENT_STATUS = {
  UPCOMING: "upcoming",
  ONGOING: "ongoing",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export const EVENT_TYPE = {
  MEETING: "meeting",
  SOCIAL: "social",
  FUNDRAISER: "fundraiser",
  WORKSHOP: "workshop",
  OTHERS: "others",
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Gets current date range for this month
 * @returns Object with start and end timestamps for the current month
 */
function getCurrentMonthRange() {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const endOfMonth = new Date();
  endOfMonth.setMonth(endOfMonth.getMonth() + 1);
  endOfMonth.setDate(0);
  endOfMonth.setHours(23, 59, 59, 999);

  return { startOfMonth: startOfMonth.getTime(), endOfMonth: endOfMonth.getTime() };
}

/**
 * Validates user has permission to manage events
 * @param isPermitted - Permission check result
 * @throws Error if not permitted
 */
function validateEventPermission(isPermitted: boolean): void {
  if (!isPermitted) {
    throw new Error("Unauthorized: Only admins and pro members can manage events");
  }
}

/**
 * Validates event exists and throws detailed error
 * @param event - Event object to validate
 * @throws Error if event not found
 */
function validateEventExists(event: any): void {
  if (!event) {
    throw new Error("Unauthorized: Event not found");
  }
}

/**
 * Builds search field from event details
 * @param title - Event title
 * @param description - Event description
 * @param location - Event location
 * @returns Lowercase search field
 */
function buildEventSearchField(title: string, description: string, location: string): string {
  return `${title} ${description} ${location}`.toLowerCase();
}

/**
 * Logs event activity for audit trail
 * @param ctx - Convex context
 * @param userId - User performing action
 * @param user - User full name
 * @param action - Action type (created, updated, deleted, etc.)
 * @param description - Human-readable description
 * @param metadata - Additional context
 */
async function logEventActivity(
  ctx: any,
  userId: any,
  user: string,
  action: string,
  description: string,
  metadata: any = {},
) {
  await ctx.db.insert("activities", {
    userId,
    type: "event",
    user,
    action,
    description,
    metadata,
    timestamp: Date.now(),
  });
}

/**
 * Processes media files and gets their URLs
 * @param ctx - Convex context
 * @param media - Array of media objects with storage IDs
 * @returns Media array with generated URLs
 */
async function processMediaWithUrls(ctx: any, media: any[]): Promise<MediaWithUrl | undefined> {
  if (!media || media.length === 0) return undefined;
  
  return Promise.all(
    media.map(async (m: any) => ({
      ...m,
      url: await ctx.storage.getUrl(m.storageId),
    })),
  );
}

/**
 * Merges new media with existing media, preventing duplicates
 * @param newMedia - New media to add
 * @param existingMedia - Existing media in event
 * @returns Merged media array
 */
function mergeMediaArrays(newMedia: MediaWithUrl | undefined, existingMedia: any): any {
  if (newMedia?.length) {
    return [...newMedia, ...(Array.isArray(existingMedia) ? existingMedia : [])];
  }
  return Array.isArray(existingMedia) ? existingMedia : [];
}

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Retrieves all events with optional filtering and search
 * @param status - Filter by event status
 * @param type - Filter by event type
 * @param search - Search in title, description, location
 * @param paginationOpts - Pagination options
 * @returns Paginated events
 */
export const getEvents = query({
  args: {
    status: v.optional(
      v.union(
        v.literal(EVENT_STATUS.UPCOMING),
        v.literal(EVENT_STATUS.ONGOING),
        v.literal(EVENT_STATUS.COMPLETED),
        v.literal(EVENT_STATUS.CANCELLED),
      ),
    ),
    type: v.optional(
      v.union(
        v.literal(EVENT_TYPE.MEETING),
        v.literal(EVENT_TYPE.SOCIAL),
        v.literal(EVENT_TYPE.FUNDRAISER),
        v.literal(EVENT_TYPE.WORKSHOP),
        v.literal(EVENT_TYPE.OTHERS),
      ),
    ),
    search: v.optional(v.string()),
    paginationOpts: paginationOptsValidator,
  },

  handler: async (ctx, args) => {
    let q;

    if (args.search) {
      q = ctx.db
        .query("events")
        .withSearchIndex("search_title_description_location", (q: any) =>
          q.search("searchField", args.search!),
        );
    } else if (args.status && args.type) {
      q = ctx.db
        .query("events")
        .withIndex("by_status_type", (q: any) =>
          q.eq("status", args.status!).eq("type", args.type!),
        )
        .order("desc");
    } else if (args.status) {
      q = ctx.db
        .query("events")
        .withIndex("by_status", (q: any) => q.eq("status", args.status!))
        .order("desc");
    } else if (args.type) {
      q = ctx.db
        .query("events")
        .withIndex("by_type", (q: any) => q.eq("type", args.type!))
        .order("desc");
    } else {
      q = ctx.db.query("events").withIndex("by_startDate").order("desc");
    }

    return await q.paginate(args.paginationOpts);
  },
});

/**
 * Retrieves a single event by ID with creator details
 * @param id - Event ID
 * @returns Event object with creator information or null if not found
 */
export const getEventById = query({
  args: { id: v.id("events") },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.id);
    if (!event) return null;

    const creator = await ctx.db.get(event.createdBy);

    return {
      ...event,
      creator: creator
        ? {
            name: `${creator.firstName} ${creator.lastName}`,
            email: creator.email,
          }
        : null,
    };
  },
});

/**
 * Retrieves statistics about all events
 * @returns Object containing total, status counts, and events this month
 */
export const getEventStats = query({
  handler: async (ctx) => {
    const now = Date.now();
    const events = await ctx.db.query("events").collect();

    const totalEvents = events.length;
    const upcomingEvents = events.filter(
      (e: any) => new Date(e.startDate).getTime() >= now && e.status !== EVENT_STATUS.CANCELLED,
    ).length;
    const completedEvents = events.filter(
      (e: any) => e.status === EVENT_STATUS.COMPLETED,
    ).length;
    const cancelledEvents = events.filter(
      (e: any) => e.status === EVENT_STATUS.CANCELLED,
    ).length;

    const { startOfMonth, endOfMonth } = getCurrentMonthRange();

    const eventsThisMonth = events.filter(
      (e: any) =>
        new Date(e.startDate).getTime() >= startOfMonth &&
        new Date(e.startDate).getTime() <= endOfMonth,
    ).length;

    return {
      totalEvents,
      upcomingEvents,
      completedEvents,
      cancelledEvents,
      eventsThisMonth,
    };
  },
});

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Creates a new event
 * @param title - Event title
 * @param description - Event description
 * @param location - Event location
 * @param status - Initial status (upcoming, ongoing, completed, cancelled)
 * @param startDate - Event start date (ISO string)
 * @param startTime - Event start time
 * @param endDate - Optional end date
 * @param endTime - Optional end time
 * @param minutes - Optional meeting minutes/notes
 * @param type - Event type (meeting, social, fundraiser, workshop, others)
 * @param authEmail - Email of creating user
 * @param media - Optional media files (images/videos)
 * @returns Event ID
 * @throws Error if user not authorized
 * @side-effect Creates activity log, sends notification to all members
 */
export const createEvent = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    location: v.string(),
    status: v.union(
      v.literal(EVENT_STATUS.UPCOMING),
      v.literal(EVENT_STATUS.ONGOING),
      v.literal(EVENT_STATUS.COMPLETED),
      v.literal(EVENT_STATUS.CANCELLED),
    ),
    startDate: v.string(),
    startTime: v.string(),
    endDate: v.optional(v.string()),
    endTime: v.optional(v.string()),
    minutes: v.optional(v.string()),
    type: v.union(
      v.literal(EVENT_TYPE.MEETING),
      v.literal(EVENT_TYPE.SOCIAL),
      v.literal(EVENT_TYPE.FUNDRAISER),
      v.literal(EVENT_TYPE.WORKSHOP),
      v.literal(EVENT_TYPE.OTHERS),
    ),
    authEmail: v.string(),
    media: v.optional(
      v.array(
        v.object({
          storageId: v.id("_storage"),
          type: v.union(v.literal("image"), v.literal("video")),
          mimeType: v.string(),
          size: v.number(),
          url: v.union(v.string(), v.null()),
          name: v.optional(v.string()),
        }),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const { authEmail, media, ...eventData } = args;
    const user = await getCurrentUser(authEmail, ctx);

    const isPermitted = await hasPermission(
      ctx,
      ["admin", "pro"],
      args.authEmail,
    );
    validateEventPermission(isPermitted);

    const mediaWithUrl = await processMediaWithUrls(ctx, media || []);

    const event = await ctx.db.insert("events", {
      ...eventData,
      media: mediaWithUrl,
      createdBy: user._id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      searchField: buildEventSearchField(args.title, args.description, args.location),
    });

    await logEventActivity(
      ctx,
      user._id,
      `${user.firstName} ${user.lastName}`,
      "eventCreated",
      `created event "${args.title}"`,
      { eventId: event },
    );

    await notifyAllMembers(ctx, {
      title: "New Event",
      message: `new event has been created: ${args.title}`,
      type: "event",
      actionUrl: `/events/${event}`,
      excludeUserId: user._id,
    });

    return event;
  },
});

/**
 * Updates an existing event
 * @param id - Event ID to update
 * @param title - Optional new title
 * @param description - Optional new description
 * @param startDate - Optional new start date
 * @param endDate - Optional new end date
 * @param startTime - Optional new start time
 * @param endTime - Optional new end time
 * @param location - Optional new location
 * @param minutes - Optional meeting minutes
 * @param type - Optional new type
 * @param status - Optional new status
 * @param media - Optional new media files
 * @param authEmail - Email of updating user
 * @returns Event ID
 * @throws Error if unauthorized or event not found
 * @side-effect Updates event, merges media, sends notification, logs activity
 */
export const updateEvent = mutation({
  args: {
    id: v.id("events"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    startTime: v.optional(v.string()),
    endTime: v.optional(v.string()),
    location: v.optional(v.string()),
    minutes: v.optional(v.string()),
    type: v.optional(
      v.union(
        v.literal(EVENT_TYPE.MEETING),
        v.literal(EVENT_TYPE.SOCIAL),
        v.literal(EVENT_TYPE.FUNDRAISER),
        v.literal(EVENT_TYPE.WORKSHOP),
        v.literal(EVENT_TYPE.OTHERS),
      ),
    ),
    status: v.optional(
      v.union(
        v.literal(EVENT_STATUS.UPCOMING),
        v.literal(EVENT_STATUS.ONGOING),
        v.literal(EVENT_STATUS.COMPLETED),
        v.literal(EVENT_STATUS.CANCELLED),
      ),
    ),
    media: v.optional(
      v.array(
        v.object({
          storageId: v.id("_storage"),
          type: v.union(v.literal("image"), v.literal("video")),
          mimeType: v.string(),
          size: v.number(),
          url: v.union(v.string(), v.null()),
          name: v.optional(v.string()),
        }),
      ),
    ),
    authEmail: v.string(),
  },
  handler: async (ctx, args) => {
    const { id, authEmail, media, ...updateData } = args;
    const user = await getCurrentUser(authEmail, ctx);
    const isPermitted = await hasPermission(
      ctx,
      ["admin", "pro"],
      args.authEmail,
    );
    validateEventPermission(isPermitted);

    const event = await ctx.db.get(args.id);
    validateEventExists(event);

    const mediaWithUrl = await processMediaWithUrls(ctx, media || []);
    const mergedMedia = mergeMediaArrays(mediaWithUrl, event?.media);

    const newTitle = updateData.title ?? event!.title;
    const newDescription = updateData.description ?? event!.description;
    const newLocation = updateData.location ?? event!.location;

    await ctx.db.patch(id, {
      ...updateData,
      media: mergedMedia,
      updatedAt: Date.now(),
      searchField: buildEventSearchField(newTitle, newDescription, newLocation),
    });

    await notifyAllMembers(ctx, {
      title: "Event Updated",
      message: `Event has been updated: ${newTitle}`,
      type: "event",
      actionUrl: `/events/${event!._id}`,
      excludeUserId: user._id,
    });

    await logEventActivity(
      ctx,
      user._id,
      `${user.firstName} ${user.lastName}`,
      "eventUpdated",
      `Updated event "${event!.title}"`,
      { eventId: id, updateData, title: newTitle },
    );

    return id;
  },
});

/**
 * Deletes an event from the system
 * @param id - Event ID to delete
 * @param authEmail - Email of deleting user
 * @returns Event ID
 * @throws Error if unauthorized or event not found
 * @side-effect Deletes event, sends notification, logs activity
 */
export const deleteEvent = mutation({
  args: {
    id: v.id("events"),
    authEmail: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(args.authEmail, ctx);
    const isPermitted = await hasPermission(
      ctx,
      ["admin", "pro"],
      args.authEmail,
    );
    validateEventPermission(isPermitted);

    const event = await ctx.db.get(args.id);
    validateEventExists(event);

    await ctx.db.delete(args.id);

    await logEventActivity(
      ctx,
      user._id,
      `${user.firstName} ${user.lastName}`,
      "eventDeleted",
      `deleted event "${event!.title}"`,
      { eventId: args.id, title: event!.title },
    );

    await notifyAllMembers(ctx, {
      title: "Event Deleted",
      message: `Event has been deleted: ${event!.title}`,
      type: "event",
      actionUrl: `/events/${event!._id}`,
      excludeUserId: user._id,
    });

    return args.id;
  },
});

/**
 * Cancels an event (marks as cancelled)
 * @param id - Event ID to cancel
 * @param reason - Optional cancellation reason
 * @param authEmail - Email of cancelling user
 * @returns Event ID
 * @throws Error if unauthorized or event not found
 * @side-effect Updates event status, sends notification, logs activity
 */
export const cancelEvent = mutation({
  args: {
    id: v.id("events"),
    reason: v.optional(v.string()),
    authEmail: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(args.authEmail, ctx);
    const isPermitted = await hasPermission(
      ctx,
      ["admin", "pro"],
      args.authEmail,
    );
    validateEventPermission(isPermitted);

    const event = await ctx.db.get(args.id);
    validateEventExists(event);

    await ctx.db.patch(args.id, {
      status: EVENT_STATUS.CANCELLED,
      updatedAt: Date.now(),
    });

    const reasonSuffix = args.reason ? `: ${args.reason}` : "";
    const description = `cancelled "${event!.title}"${reasonSuffix}`;

    await logEventActivity(
      ctx,
      user._id,
      `${user.firstName} ${user.lastName}`,
      "eventCancelled",
      description,
      { eventId: args.id, reason: args.reason, title: event!.title },
    );

    await notifyAllMembers(ctx, {
      title: "Event Canceled",
      message: `Event has been canceled: ${event!.title}`,
      type: "event",
      actionUrl: `/events/${event!._id}`,
      excludeUserId: user._id,
    });

    return args.id;
  },
});

/**
 * Marks an event as completed
 * @param id - Event ID to complete
 * @param authEmail - Email of user marking event as completed
 * @returns Event ID
 * @throws Error if unauthorized or event not found
 * @side-effect Updates event status, sends notification, logs activity
 */
export const completeEvent = mutation({
  args: {
    id: v.id("events"),
    authEmail: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(args.authEmail, ctx);
    const isPermitted = await hasPermission(
      ctx,
      ["admin", "pro"],
      args.authEmail,
    );
    validateEventPermission(isPermitted);

    const event = await ctx.db.get(args.id);
    validateEventExists(event);

    await ctx.db.patch(args.id, {
      status: EVENT_STATUS.COMPLETED,
      updatedAt: Date.now(),
    });

    await logEventActivity(
      ctx,
      user._id,
      `${user.firstName} ${user.lastName}`,
      "eventCompleted",
      `marked event "${event!.title}" as completed`,
      { eventId: args.id, title: event!.title },
    );

    await notifyAllMembers(ctx, {
      title: "Event Completed",
      message: `Event is marked as completed: ${event!.title}`,
      type: "event",
      actionUrl: `/events/${event!._id}`,
      excludeUserId: user._id,
    });

    return args.id;
  },
});
