import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all reports
export const getReports = query({
  args: {
    type: v.optional(
      v.union(
        v.literal("financial"),
        v.literal("membership"),
        v.literal("events"),
        v.literal("custom"),
      ),
    ),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("completed"),
        v.literal("failed"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    let reports = await ctx.db.query("reports").order("desc").collect();

    if (args.type) {
      reports = reports.filter((r) => r.type === args.type);
    }

    if (args.status) {
      reports = reports.filter((r) => r.status === args.status);
    }

    // Get creator details
    return await Promise.all(
      reports.map(async (report) => {
        const creator = await ctx.db.get(report.createdBy);
        return {
          ...report,
          creator: creator
            ? {
                name: `${creator.firstName} ${creator.lastName}`,
                email: creator.email,
              }
            : null,
        };
      }),
    );
  },
});

// Get report by ID
export const getReportById = query({
  args: { id: v.id("reports") },
  handler: async (ctx, args) => {
    const report = await ctx.db.get(args.id);
    if (!report) {
      return null;
    }

    const creator = await ctx.db.get(report.createdBy);

    return {
      ...report,
      creator: creator
        ? {
            name: `${creator.firstName} ${creator.lastName}`,
            email: creator.email,
            role: creator.role,
          }
        : null,
    };
  },
});

// Get report statistics
export const getReportStats = query({
  handler: async (ctx) => {
    const reports = await ctx.db.query("reports").collect();

    const totalReports = reports.length;
    const completedReports = reports.filter(
      (r) => r.status === "completed",
    ).length;
    const pendingReports = reports.filter((r) => r.status === "pending").length;
    const failedReports = reports.filter((r) => r.status === "failed").length;

    // Count by type
    const reportTypes: Record<string, number> = {};
    reports.forEach((report) => {
      reportTypes[report.type] = (reportTypes[report.type] || 0) + 1;
    });

    return {
      totalReports,
      completedReports,
      pendingReports,
      failedReports,
      reportTypes,
    };
  },
});

// Create a report
export const createReport = mutation({
  args: {
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
    createdBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.createdBy);
    if (!user || user.role !== "admin") {
      throw new Error("Only admins can create reports");
    }

    const reportId = await ctx.db.insert("reports", {
      title: args.title,
      type: args.type,
      description: args.description,
      dateRange: args.dateRange,
      status: "pending",
      data: {},
      createdBy: args.createdBy,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Create an activity log
    await ctx.db.insert("activities", {
      userId: args.createdBy,
      type: "system",
      action: "report_created",
      user: `${user.firstName} ${user.lastName}`,
      description: `New ${args.type} report "${args.title}" created`,
      metadata: { reportId, type: args.type },
      timestamp: Date.now(),
    });

    return reportId;
  },
});

// Generate report data (this would be called after creating a report)
export const generateReportData = mutation({
  args: {
    reportId: v.id("reports"),
  },
  handler: async (ctx, args) => {
    const report = await ctx.db.get(args.reportId);
    if (!report) {
      throw new Error("Report not found");
    }

    try {
      let data: any = {};

      if (report.type === "financial") {
        // Generate financial report
        const accounts = await ctx.db.query("accounts").collect();
        const totalBorrowed = accounts.reduce(
          (sum, a) => sum + a.totalBorrowedAmount,
          0,
        );
        const totalFines = accounts.reduce((sum, a) => sum + a.totalFineAmount, 0);
        const totalOutstanding = accounts.reduce(
          (sum, a) => sum + a.borrowedAmountToBalance + a.fineToBalance + a.duesToBalance,
          0,
        );

        const goodStanding = accounts.filter(
          (a) => a.status === "good_standing",
        ).length;
        const owing = accounts.filter((a) => a.status === "owing").length;
        const overdue = accounts.filter((a) => a.status === "overdue").length;

        data = {
          totalBorrowed,
          totalFines,
          totalOutstanding,
          accountStatus: { goodStanding, owing, overdue },
          totalAccounts: accounts.length,
        };
      } else if (report.type === "membership") {
        // Generate a membership report
        const users = await ctx.db.query("users").collect();
        const totalMembers = users.length;
        const activeMembers = users.filter((u) => u.status === "active").length;
        const suspendedMembers = users.filter(
          (u) => u.status === "suspended",
        ).length;
        const admins = users.filter((u) => u.role === "admin").length;

        // New members in the date range
        const newMembers = users.filter(
          (u) =>
            u.joinedAt >= report.dateRange.start &&
            u.joinedAt <= report.dateRange.end,
        ).length;

        data = {
          totalMembers,
          activeMembers,
          suspendedMembers,
          admins,
          newMembers,
        };
      } else if (report.type === "events") {
        // Generate events report
        const events = await ctx.db.query("events").collect();
        const eventsInRange = events.filter(
          (e) => {
            const eventDate = new Date(e.startDate).getTime();
            return eventDate >= report.dateRange.start && eventDate <= report.dateRange.end;
          }
        );

        const totalEvents = eventsInRange.length;
        const upcomingEvents = eventsInRange.filter(
          (e) => e.status === "upcoming",
        ).length;
        const completedEvents = eventsInRange.filter(
          (e) => e.status === "completed",
        ).length;
        const cancelledEvents = eventsInRange.filter(
          (e) => e.status === "cancelled",
        ).length;

        data = {
          totalEvents,
          upcomingEvents,
          completedEvents,
          cancelledEvents,
        };
      }

      await ctx.db.patch(args.reportId, {
        status: "completed",
        data,
        completedAt: Date.now(),
        updatedAt: Date.now(),
      });

      const creator = await ctx.db.get(report.createdBy);
      
      // Create an activity log
      await ctx.db.insert("activities", {
        userId: report.createdBy,
        type: "system",
        action: "report_generated",
        user: creator ? `${creator.firstName} ${creator.lastName}` : "System",
        description: `Report "${report.title}" generated successfully`,
        metadata: { reportId: args.reportId },
        timestamp: Date.now(),
      });

      return args.reportId;
    } catch (error) {
      await ctx.db.patch(args.reportId, {
        status: "failed",
        updatedAt: Date.now(),
      });

      throw error;
    }
  },
});

// Update report
export const updateReport = mutation({
  args: {
    id: v.id("reports"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("completed"),
        v.literal("failed"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    const report = await ctx.db.get(id);
    if (!report) {
      throw new Error("Report not found");
    }

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });

    const creator = await ctx.db.get(report.createdBy);

    // Create an activity log
    await ctx.db.insert("activities", {
      userId: report.createdBy,
      type: "system",
      action: "report_updated",
      user: creator ? `${creator.firstName} ${creator.lastName}` : "System",
      description: `Report "${report.title}" was updated`,
      metadata: { reportId: id, updates },
      timestamp: Date.now(),
    });

    return id;
  },
});

// Delete a report
export const deleteReport = mutation({
  args: {
    id: v.id("reports"),
    deletedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.deletedBy);
    if (!user || user.role !== "admin") {
      throw new Error("Only admins can delete reports");
    }

    const report = await ctx.db.get(args.id);
    if (!report) {
      throw new Error("Report not found");
    }

    await ctx.db.delete(args.id);

    // Create an activity log
    await ctx.db.insert("activities", {
      userId: args.deletedBy,
      type: "system",
      action: "report_deleted",
      user: `${user.firstName} ${user.lastName}`,
      description: `Report "${report.title}" was deleted`,
      metadata: { reportId: args.id },
      timestamp: Date.now(),
    });

    return args.id;
  },
});
