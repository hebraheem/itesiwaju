import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser, hasPermission } from "@/convex/utils";

// Get all events
export const getEvents = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("upcoming"),
        v.literal("ongoing"),
        v.literal("completed"),
        v.literal("cancelled"),
      ),
    ),
    type: v.optional(
      v.union(
        v.literal("meeting"),
        v.literal("social"),
        v.literal("fundraiser"),
        v.literal("workshop"),
        v.literal("other"),
      ),
    ),
    search: v.optional(v.string()),
    paginationOpts: v.optional(v.any()), // from usePaginatedQuery
  },

  handler: async (ctx, args) => {
    let q;

    if (args.search) {
      q = ctx.db
        .query("events")
        .withSearchIndex("search_title_description_location", (q) =>
          q.search("searchField", args.search!),
        );
    } else if (args.status && args.type) {
      q = ctx.db
        .query("events")
        .withIndex("by_status_type", (q) =>
          q.eq("status", args.status!).eq("type", args.type!),
        )
        .order("desc");
    } else if (args.status) {
      q = ctx.db
        .query("events")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc");
    } else if (args.type) {
      q = ctx.db
        .query("events")
        .withIndex("by_type", (q) => q.eq("type", args.type!))
        .order("desc");
    } else {
      q = ctx.db.query("events").withIndex("by_startDate").order("desc");
    }

    return await q.paginate(args.paginationOpts);
  },
});

// Get event by ID
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

// Get event statistics
export const getEventStats = query({
  handler: async (ctx) => {
    const now = Date.now();
    const events = await ctx.db.query("events").collect();

    const totalEvents = events.length;
    const upcomingEvents = events.filter(
      (e) => e.startDate >= now && e.status !== "cancelled",
    ).length;
    const completedEvents = events.filter(
      (e) => e.status === "completed",
    ).length;
    const cancelledEvents = events.filter(
      (e) => e.status === "cancelled",
    ).length;

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date();
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);
    endOfMonth.setDate(0);
    endOfMonth.setHours(23, 59, 59, 999);

    const eventsThisMonth = events.filter(
      (e) =>
        e.startDate >= startOfMonth.getTime() &&
        e.startDate <= endOfMonth.getTime(),
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

// Create event
export const createEvent = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    location: v.string(),
    status: v.union(
      v.literal("upcoming"),
      v.literal("ongoing"),
      v.literal("completed"),
      v.literal("cancelled"),
    ),
    startDate: v.number(),
    startTime: v.number(),
    endDate: v.optional(v.number()),
    endTime: v.optional(v.number()),
    minutes: v.optional(v.string()),
    type: v.union(
      v.literal("meeting"),
      v.literal("social"),
      v.literal("fundraiser"),
      v.literal("workshop"),
      v.literal("other"),
    ),
    authEmail: v.string(),
    media: v.optional(
      v.array(
        v.object({
          storageId: v.id("_storage"),
          type: v.union(v.literal("image"), v.literal("video")),
          mimeType: v.string(),
          size: v.number(),
        }),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(args.authEmail, ctx);

    const isPermitted = await hasPermission(
      ctx,
      ["admin", "pro"],
      args.authEmail,
    );
    if (!isPermitted) throw new Error("Unauthorized");

    const media =
      args.media &&
      (await Promise.all(
        args.media.map(async (m) => ({
          ...m,
          url: (await ctx.storage.getUrl(m.storageId))!,
        })),
      ));

    return await ctx.db.insert("events", {
      ...args,
      media,
      createdBy: user._id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      searchField:
        `${args.title} ${args.description} ${args.location}`.toLowerCase(),
    });
  },
});

// Update event
export const updateEvent = mutation({
  args: {
    id: v.id("events"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    startTime: v.optional(v.number()),
    endTime: v.optional(v.number()),
    location: v.optional(v.string()),
    minutes: v.optional(v.string()),
    type: v.optional(
      v.union(
        v.literal("meeting"),
        v.literal("social"),
        v.literal("fundraiser"),
        v.literal("workshop"),
        v.literal("other"),
      ),
    ),
    status: v.optional(
      v.union(
        v.literal("upcoming"),
        v.literal("ongoing"),
        v.literal("completed"),
        v.literal("cancelled"),
      ),
    ),
    authEmail: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(args.authEmail, ctx);
    const isPermitted = await hasPermission(
      ctx,
      ["admin", "pro"],
      args.authEmail,
    );
    if (!isPermitted) {
      throw new Error("Only admins and pro can update events");
    }

    const event = await ctx.db.get(args.id);
    if (!event) {
      throw new Error("Event not found");
    }

    const { id, ...updates } = args;

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
      searchField:
        `${args.title ?? event.title} ${args.description ?? event.description} ${args.location ?? event.location}`.toLowerCase(),
    });

    // Create an activity log
    await ctx.db.insert("activities", {
      userId: user._id,
      type: "event",
      user: `${user.firstName} ${user.lastName}`,
      action: "eventUpdated",
      description: `Updated event "${event.title}"`,
      metadata: { eventId: id, updates, title: updates.title || event.title },
      timestamp: Date.now(),
    });

    return id;
  },
});

// Delete event
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
    if (!isPermitted) {
      throw new Error("Only admins and pro can delete events");
    }

    const event = await ctx.db.get(args.id);
    if (!event) {
      throw new Error("Event not found");
    }

    await ctx.db.delete(args.id);

    // Create an activity log
    await ctx.db.insert("activities", {
      userId: user._id,
      type: "event",
      action: "eventDeleted",
      user: `${user.firstName} ${user.lastName}`,
      description: `deleted event "${event.title}"`,
      metadata: { eventId: args.id, title: event.title },
      timestamp: Date.now(),
    });

    return args.id;
  },
});

// Cancel event
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
    if (!isPermitted) {
      throw new Error("Only admins and pro can cancel events");
    }

    const event = await ctx.db.get(args.id);
    if (!event) {
      throw new Error("Event not found");
    }

    await ctx.db.patch(args.id, {
      status: "cancelled",
      updatedAt: Date.now(),
    });

    // Create an activity log
    await ctx.db.insert("activities", {
      userId: user._id,
      type: "event",
      user: `${user.firstName} ${user.lastName}`,
      action: "eventCancelled",
      description: `cancelled "${event.title}" ${args.reason ? `: ${args.reason}` : ""}`,
      metadata: { eventId: args.id, reason: args.reason },
      timestamp: Date.now(),
    });

    return args.id;
  },
});

// Mark the event as completed
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
    if (!isPermitted) {
      throw new Error("Only admins and pro can mark events as completed");
    }

    const event = await ctx.db.get(args.id);
    if (!event) {
      throw new Error("Event not found");
    }

    await ctx.db.patch(args.id, {
      status: "completed",
      updatedAt: Date.now(),
    });

    // Create an activity log
    await ctx.db.insert("activities", {
      userId: user._id,
      type: "event",
      user: `${user.firstName} ${user.lastName}`,
      action: "eventCompleted",
      description: `marked event "${event.title}" as completed`,
      metadata: { eventId: args.id },
      timestamp: Date.now(),
    });

    return args.id;
  },
});

// Add media to event
export const addEventMedia = mutation({
  args: {
    eventId: v.id("events"),
    storageId: v.id("_storage"),
    type: v.union(v.literal("image"), v.literal("video")),
    mimeType: v.string(),
    size: v.number(),
    authEmail: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(args.authEmail, ctx);

    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error("Event not found");

    if (event.createdBy !== user._id) throw new Error("Not allowed");

    const url = await ctx.storage.getUrl(args.storageId);

    const media = event.media ?? [];

    await ctx.db.patch(args.eventId, {
      media: [
        ...media,
        {
          storageId: args.storageId,
          url: url!,
          type: args.type,
          mimeType: args.mimeType,
          size: args.size,
        },
      ],
      updatedAt: Date.now(),
    });
  },
});
