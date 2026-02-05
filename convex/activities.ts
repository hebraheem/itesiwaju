import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";

// Get all activities (with pagination)
export const getActivities = query({
  args: {
    userId: v.optional(v.id("users")),
    type: v.optional(
      v.union(
        v.literal("payment"),
        v.literal("member"),
        v.literal("profile"),
        v.literal("event"),
      ),
    ),
    search: v.optional(v.string()),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const buildQuery = () => {
      let q;
      if (args.userId && args.type) {
        q = ctx.db
          .query("activities")
          .withIndex("by_user_type", (q) =>
            q.eq("userId", args.userId!).eq("type", args.type!),
          )
          .order("desc");
      } else if (args.userId) {
        q = ctx.db
          .query("activities")
          .withIndex("by_user", (q) => q.eq("userId", args.userId!))
          .order("desc");
      } else if (args.type) {
        q = ctx.db
          .query("activities")
          .withIndex("by_type", (q) => q.eq("type", args.type!))
          .order("desc");
      } else {
        q = ctx.db.query("activities").order("desc");
      }

      // Full-text search
      if (args.search) {
        q = ctx.db
          .query("activities")
          .withSearchIndex("search_description", (q) => {
            let s = q.search("description", args.search!);
            if (args.userId) s = s.eq("userId", args.userId);
            if (args.type) s = s.eq("type", args.type);
            return s;
          });
      }
      return q;
    };
    const base = buildQuery();
    return await base.paginate(args.paginationOpts);
  },
});

// Get recent activities (for dashboard)
export const getRecentActivities = query({
  args: {
    limit: v.optional(v.number()),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("activities")
      .withIndex("by_user", (q) => q.eq("userId", args.userId!))
      .order("desc")
      .take(args.limit || 10);
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
  args: { userId: v.id("users") },
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
