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
    date: v.number(),
    location: v.string(),
    status: v.union(
      v.literal("upcoming"),
      v.literal("ongoing"),
      v.literal("completed"),
      v.literal("cancelled"),
    ),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_date", ["date"])
    .index("by_status", ["status"])
    .index("by_creator", ["createdBy"]),

  // Activities - Activity log for audit trail
  activities: defineTable({
    userId: v.id("users"),
    type: v.union(
      // Payment related
      v.literal("payment"),
      v.literal("payment_received"),
      // Member/Account related
      v.literal("member"),
      v.literal("account_created"),
      v.literal("account_updated"),
      v.literal("account_deleted"),
      v.literal("account_status_updated"),
      v.literal("account_overdue"),
      // User related
      v.literal("profile"),
      v.literal("user_created"),
      v.literal("user_updated"),
      v.literal("user_deleted"),
      // Event related
      v.literal("event"),
      v.literal("event_created"),
      v.literal("event_updated"),
      v.literal("event_deleted"),
      v.literal("event_cancelled"),
      v.literal("event_completed"),
      // Financial related
      v.literal("borrow"),
      v.literal("borrow_recorded"),
      v.literal("fine"),
      v.literal("fine_recorded"),
      // Report related
      v.literal("report_created"),
      v.literal("report_updated"),
      v.literal("report_deleted"),
      v.literal("report_generated"),
    ),
    description: v.string(),
    metadata: v.any(),
    timestamp: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_timestamp", ["timestamp"])
    .index("by_type", ["type"]),

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
