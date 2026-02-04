import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all activities (with pagination)
export const getActivities = query({
  args: {
    limit: v.optional(v.number()),
    type: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let activities = await ctx.db.query("activities").order("desc").collect();

    // Filter by type if provided
    if (args.type) {
      activities = activities.filter((a) => a.type === args.type);
    }

    // Apply limit
    if (args.limit) {
      activities = activities.slice(0, args.limit);
    }

    // Get user details for each activity
    return await Promise.all(
      activities.map(async (activity) => {
        const user = await ctx.db.get(activity.userId);
        return {
          ...activity,
          user: user
            ? {
                name: `${user.firstName} ${user.lastName}`,
                email: user.email,
                role: user.role,
              }
            : null,
        };
      }),
    );
  },
});

// Get recent activities (for dashboard)
export const getRecentActivities = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const activities = await ctx.db
      .query("activities")
      .order("desc")
      .take(args.limit || 10);

    // Get user details for each activity
    return await Promise.all(
      activities.map(async (activity) => {
        const user = await ctx.db.get(activity.userId);
        return {
          ...activity,
          user: user
            ? {
                name: `${user.firstName} ${user.lastName}`,
                email: user.email,
                role: user.role,
              }
            : null,
        };
      }),
    );
  },
});

// Get activities by user
export const getActivitiesByUser = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const activities = await ctx.db
      .query("activities")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    if (args.limit) {
      return activities.slice(0, args.limit);
    }

    return activities;
  },
});

// Get activities by type
export const getActivitiesByType = query({
  args: {
    type: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const activities = await ctx.db
      .query("activities")
      .filter((q) => q.eq(q.field("type"), args.type))
      .order("desc")
      .collect();

    if (args.limit) {
      return activities.slice(0, args.limit);
    }

    return await Promise.all(
      activities.map(async (activity) => {
        const user = await ctx.db.get(activity.userId);
        return {
          ...activity,
          user: user
            ? { name: `${user.firstName} ${user.lastName}`, email: user.email }
            : null,
        };
      }),
    );
  },
});

// Get activity by ID
export const getActivityById = query({
  args: { id: v.id("activities") },
  handler: async (ctx, args) => {
    const activity = await ctx.db.get(args.id);
    if (!activity) {
      return null;
    }

    const user = await ctx.db.get(activity.userId);

    return {
      ...activity,
      user: user
        ? {
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            role: user.role,
          }
        : null,
    };
  },
});

// Get activity statistics
export const getActivityStats = query({
  handler: async (ctx) => {
    const activities = await ctx.db.query("activities").collect();

    const totalActivities = activities.length;

    // Count by type
    const activityTypes: Record<string, number> = {};
    activities.forEach((activity) => {
      activityTypes[activity.type] = (activityTypes[activity.type] || 0) + 1;
    });

    // Get today's activities
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayActivities = activities.filter(
      (a) => a.timestamp >= today.getTime(),
    ).length;

    // Get this week's activities
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const weekActivities = activities.filter(
      (a) => a.timestamp >= weekAgo,
    ).length;

    return {
      totalActivities,
      activityTypes,
      todayActivities,
      weekActivities,
    };
  },
});

// Create activity (this is called by other mutations)
export const createActivity = mutation({
  args: {
    userId: v.id("users"),
    type: v.union(
      v.literal("payment"),
      v.literal("payment_received"),
      v.literal("member"),
      v.literal("account_created"),
      v.literal("account_updated"),
      v.literal("account_deleted"),
      v.literal("account_status_updated"),
      v.literal("account_overdue"),
      v.literal("profile"),
      v.literal("user_created"),
      v.literal("user_updated"),
      v.literal("user_deleted"),
      v.literal("event"),
      v.literal("event_created"),
      v.literal("event_updated"),
      v.literal("event_deleted"),
      v.literal("event_cancelled"),
      v.literal("event_completed"),
      v.literal("borrow"),
      v.literal("borrow_recorded"),
      v.literal("fine"),
      v.literal("fine_recorded"),
      v.literal("report_created"),
      v.literal("report_updated"),
      v.literal("report_deleted"),
      v.literal("report_generated"),
    ),
    description: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("activities", {
      userId: args.userId,
      type: args.type,
      description: args.description,
      metadata: args.metadata || {},
      timestamp: Date.now(),
    });
  },
});

// Delete old activities (cleanup)
export const deleteOldActivities = mutation({
  args: {
    olderThanDays: v.number(),
  },
  handler: async (ctx, args) => {
    const cutoffTime = Date.now() - args.olderThanDays * 24 * 60 * 60 * 1000;
    const activities = await ctx.db.query("activities").collect();

    let deletedCount = 0;
    for (const activity of activities) {
      if (activity.timestamp < cutoffTime) {
        await ctx.db.delete(activity._id);
        deletedCount++;
      }
    }

    return { deletedCount };
  },
});

// Delete activity by ID
export const deleteActivity = mutation({
  args: { id: v.id("activities") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return args.id;
  },
});
