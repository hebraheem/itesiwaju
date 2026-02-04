import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

// Get all events
export const getEvents = query({
  args: {
    status: v.optional(v.union(
      v.literal("upcoming"),
      v.literal("ongoing"),
      v.literal("completed"),
      v.literal("cancelled")
    )),
  },
  handler: async (ctx, args) => {
    let allEvents;
    
    if (args.status) {
      allEvents = await ctx.db
        .query("events")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .collect();
    } else {
      allEvents = await ctx.db.query("events").collect();
    }
    
    // Sort by date (upcoming first, then past)
    return allEvents.sort((a, b) => b.date - a.date);
  },
});

// Get event by ID
export const getEventById = query({
  args: { id: v.id("events") },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.id);
    if (!event) {
      return null;
    }
    
    // Get creator details
    const creator = await ctx.db.get(event.createdBy);
    
    return {
      ...event,
      creator: creator ? { 
        name: `${creator.firstName} ${creator.lastName}`, 
        email: creator.email 
      } : null,
    };
  },
});

// Get upcoming events
export const getUpcomingEvents = query({
  handler: async (ctx) => {
    const now = Date.now();
    const events = await ctx.db.query("events").collect();
    
    return events
      .filter((event) => event.date >= now && event.status !== "cancelled")
      .sort((a, b) => a.date - b.date);
  },
});

// Get past events
export const getPastEvents = query({
  handler: async (ctx) => {
    const now = Date.now();
    const events = await ctx.db.query("events").collect();
    
    return events
      .filter((event) => event.date < now || event.status === "completed")
      .sort((a, b) => b.date - a.date);
  },
});

// Get events for calendar
export const getCalendarEvents = query({
  handler: async (ctx) => {
    const events = await ctx.db.query("events").collect();
    
    return events.map((event) => ({
      id: event._id,
      title: event.title,
      date: event.date,
      location: event.location,
      status: event.status,
    }));
  },
});

// Get event statistics
export const getEventStats = query({
  handler: async (ctx) => {
    const events = await ctx.db.query("events").collect();
    const now = Date.now();
    
    const totalEvents = events.length;
    const upcomingEvents = events.filter(
      (e) => e.date >= now && e.status !== "cancelled"
    ).length;
    const completedEvents = events.filter((e) => e.status === "completed").length;
    const cancelledEvents = events.filter((e) => e.status === "cancelled").length;
    
    // Get this month's events
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const endOfMonth = new Date();
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);
    endOfMonth.setDate(0);
    endOfMonth.setHours(23, 59, 59, 999);
    
    const eventsThisMonth = events.filter(
      (e) => e.date >= startOfMonth.getTime() && e.date <= endOfMonth.getTime()
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
    date: v.number(),
    location: v.string(),
    status: v.union(
      v.literal("upcoming"),
      v.literal("ongoing"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    createdBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.createdBy);
    if (!user || user.role !== "admin") {
      throw new Error("Only admins can create events");
    }
    
    const eventId = await ctx.db.insert("events", {
      title: args.title,
      description: args.description,
      date: args.date,
      location: args.location,
      status: args.status,
      createdBy: args.createdBy,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Create activity log
    await ctx.db.insert("activities", {
      userId: args.createdBy,
      type: "event_created",
      description: `New event "${args.title}" created`,
      metadata: { eventId, date: args.date, location: args.location },
      timestamp: Date.now(),
    });
    
    return eventId;
  },
});

// Update event
export const updateEvent = mutation({
  args: {
    id: v.id("events"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    date: v.optional(v.number()),
    location: v.optional(v.string()),
    status: v.optional(v.union(
      v.literal("upcoming"),
      v.literal("ongoing"),
      v.literal("completed"),
      v.literal("cancelled")
    )),
    updatedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.updatedBy);
    if (!user || user.role !== "admin") {
      throw new Error("Only admins can update events");
    }
    
    const event = await ctx.db.get(args.id);
    if (!event) {
      throw new Error("Event not found");
    }
    
    const { id, updatedBy, ...updates } = args;
    
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
    
    // Create activity log
    await ctx.db.insert("activities", {
      userId: args.updatedBy,
      type: "event_updated",
      description: `Event "${event.title}" was updated`,
      metadata: { eventId: id, updates },
      timestamp: Date.now(),
    });
    
    return id;
  },
});

// Delete event
export const deleteEvent = mutation({
  args: {
    id: v.id("events"),
    deletedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.deletedBy);
    if (!user || user.role !== "admin") {
      throw new Error("Only admins can delete events");
    }
    
    const event = await ctx.db.get(args.id);
    if (!event) {
      throw new Error("Event not found");
    }
    
    await ctx.db.delete(args.id);
    
    // Create activity log
    await ctx.db.insert("activities", {
      userId: args.deletedBy,
      type: "event_deleted",
      description: `Event "${event.title}" was deleted`,
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
    cancelledBy: v.id("users"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.cancelledBy);
    if (!user || user.role !== "admin") {
      throw new Error("Only admins can cancel events");
    }
    
    const event = await ctx.db.get(args.id);
    if (!event) {
      throw new Error("Event not found");
    }
    
    await ctx.db.patch(args.id, {
      status: "cancelled",
      updatedAt: Date.now(),
    });
    
    // Create activity log
    await ctx.db.insert("activities", {
      userId: args.cancelledBy,
      type: "event_cancelled",
      description: `Event "${event.title}" was cancelled${args.reason ? `: ${args.reason}` : ""}`,
      metadata: { eventId: args.id, reason: args.reason },
      timestamp: Date.now(),
    });
    
    return args.id;
  },
});

// Mark event as completed
export const completeEvent = mutation({
  args: {
    id: v.id("events"),
    completedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.completedBy);
    if (!user || user.role !== "admin") {
      throw new Error("Only admins can mark events as completed");
    }
    
    const event = await ctx.db.get(args.id);
    if (!event) {
      throw new Error("Event not found");
    }
    
    await ctx.db.patch(args.id, {
      status: "completed",
      updatedAt: Date.now(),
    });
    
    // Create activity log
    await ctx.db.insert("activities", {
      userId: args.completedBy,
      type: "event_completed",
      description: `Event "${event.title}" marked as completed`,
      metadata: { eventId: args.id },
      timestamp: Date.now(),
    });
    
    return args.id;
  },
});
