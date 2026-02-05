import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table - Main user authentication and profile
  users: defineTable({
    firstName: v.string(),
    lastName: v.string(),
    otherName: v.optional(v.string()),
    email: v.string(),
    phone: v.optional(v.string()),
    address: v.optional(
      v.object({
        street: v.optional(v.string()),
        city: v.optional(v.string()),
        state: v.optional(v.string()),
        country: v.optional(v.string()),
        zipCode: v.optional(v.string()),
      }),
    ),
    password: v.string(),
    role: v.union(
      v.literal("admin"),
      v.literal("member"),
      v.literal("treasurer"),
      v.literal("pro"),
    ),
    status: v.union(
      v.literal("active"),
      v.literal("suspended"),
      v.literal("inactive"),
    ),
    joinedAt: v.number(),
    searchField: v.optional(v.string()),
  })
    .index("by_role_status", ["role", "status"])
    .index("by_email", ["email"])
    .index("by_role", ["role"])
    .index("by_status", ["status"])
    .searchIndex("search_name", {
      searchField: "searchField",
    }),

  // Events table - All club events
  events: defineTable({
    title: v.string(),
    description: v.string(),
    location: v.string(),
    status: v.union(
      v.literal("upcoming"),
      v.literal("ongoing"),
      v.literal("completed"),
      v.literal("cancelled"),
    ),
    minutes: v.optional(v.string()),
    startDate: v.number(),
    endDate: v.optional(v.number()),
    startTime: v.number(),
    endTime: v.optional(v.number()),
    type: v.union(
      v.literal("meeting"),
      v.literal("social"),
      v.literal("fundraiser"),
      v.literal("workshop"),
      v.literal("other"),
    ),
    media: v.optional(
      v.array(
        v.object({
          storageId: v.id("_storage"),
          url: v.string(),
          type: v.union(v.literal("image"), v.literal("video")),
          mimeType: v.string(),
          size: v.number(),
        }),
      ),
    ),
    createdBy: v.id("users"),
    searchField: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_startDate", ["startDate"])
    .index("by_status", ["status"])
    .index("by_type", ["type"])
    .index("by_creator", ["createdBy"])
    .index("by_status_type", ["status", "type"])
    .searchIndex("search_title_description_location", {
      searchField: "searchField",
    }),

  // Activities - Activity log for audit trail
  activities: defineTable({
    userId: v.id("users"),
    type: v.union(
      v.literal("payment"),
      v.literal("member"),
      v.literal("profile"),
      v.literal("event"),
    ),
    action: v.optional(v.string()),
    user: v.optional(v.string()),
    receiver: v.optional(v.string()),
    description: v.string(),
    metadata: v.any(),
    timestamp: v.number(),
  })
    .index("by_timestamp", ["timestamp"])
    .index("by_type", ["type"])
    .index("by_user", ["userId"])
    .index("by_user_type", ["userId", "type"])
    .searchIndex("search_description", {
      searchField: "description",
      filterFields: ["userId", "type"],
    }),

  // Financial Accounts - Member financial tracking
  accounts: defineTable({
    userId: v.id("users"),
    borrowedAmount: v.number(),
    fineAmount: v.number(),
    currentBalance: v.number(),
    dueDate: v.optional(v.number()),
    status: v.union(
      v.literal("good_standing"),
      v.literal("owing"),
      v.literal("overdue"),
    ),
    paymentHistory: v.array(
      v.object({
        type: v.union(
          v.literal("borrow"),
          v.literal("payment"),
          v.literal("fine"),
        ),
        amount: v.number(),
        date: v.number(),
        description: v.string(),
        dueDate: v.optional(v.number()),
      }),
    ),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"]),

  // Reports - Generated reports
  reports: defineTable({
    title: v.string(),
    type: v.union(
      v.literal("financial"),
      v.literal("membership"),
      v.literal("events"),
      v.literal("custom"),
    ),
    description: v.optional(v.string()),
    dateRange: v.object({
      start: v.number(),
      end: v.number(),
    }),
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("failed"),
    ),
    data: v.any(),
    completedAt: v.optional(v.number()),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_type", ["type"])
    .index("by_status", ["status"])
    .index("by_creator", ["createdBy"]),
});
