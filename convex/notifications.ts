import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get notifications for a user
export const getUserNotifications = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;

    return await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(limit);
  },
});

// Get unread notification count
export const getUnreadCount = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q) =>
        q.eq("userId", args.userId).eq("read", false),
      )
      .collect();

    return notifications.length;
  },
});

// Mark the notification as read
export const markAsRead = mutation({
  args: {
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.notificationId, {
      read: true,
    });
  },
});

// Mark all notifications as read
export const markAllAsRead = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q) =>
        q.eq("userId", args.userId).eq("read", false),
      )
      .collect();

    await Promise.all(
      notifications.map((notification) =>
        ctx.db.patch(notification._id, { read: true }),
      ),
    );
  },
});

// Create notification
export const createNotification = mutation({
  args: {
    userId: v.id("users"),
    title: v.string(),
    message: v.string(),
    type: v.union(
      v.literal("member"),
      v.literal("event"),
      v.literal("payment"),
      v.literal("profile"),
      v.literal("system"),
    ),
    relatedId: v.optional(v.string()),
    actionUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("notifications", {
      userId: args.userId,
      title: args.title,
      message: args.message,
      type: args.type,
      relatedId: args.relatedId,
      actionUrl: args.actionUrl,
      read: false,
      createdAt: Date.now(),
    });
  },
});

// Bulk create notifications (for all members)
export const createBulkNotifications = mutation({
  args: {
    title: v.string(),
    message: v.string(),
    type: v.union(
      v.literal("member"),
      v.literal("event"),
      v.literal("payment"),
      v.literal("profile"),
      v.literal("system"),
    ),
    relatedId: v.optional(v.string()),
    actionUrl: v.optional(v.string()),
    excludeUserId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    // Get all active users
    const users = await ctx.db
      .query("users")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();

    const notifications = users
      .filter((user) => !args.excludeUserId || user._id !== args.excludeUserId)
      .map((user) => ({
        userId: user._id,
        title: args.title,
        message: args.message,
        type: args.type,
        relatedId: args.relatedId,
        actionUrl: args.actionUrl,
        read: false,
        createdAt: Date.now(),
      }));

    await Promise.all(
      notifications.map((notification) =>
        ctx.db.insert("notifications", notification),
      ),
    );

    return notifications.length;
  },
});

// Delete notification
export const deleteNotification = mutation({
  args: {
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.notificationId);
  },
});

// Delete all read notifications for user
export const deleteReadNotifications = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q) =>
        q.eq("userId", args.userId).eq("read", true),
      )
      .collect();

    await Promise.all(
      notifications.map((notification) => ctx.db.delete(notification._id)),
    );

    return notifications.length;
  },
});
