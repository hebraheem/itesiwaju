import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ============================================================================
// TYPES & CONSTANTS
// ============================================================================

export const REPORT_TYPE = {
  FINANCIAL: "financial",
  MEMBERSHIP: "membership",
  EVENTS: "events",
  CUSTOM: "custom",
} as const;

export const REPORT_STATUS = {
  PENDING: "pending",
  COMPLETED: "completed",
  FAILED: "failed",
} as const;

// Type aliases can be added when needed for mutations/queries

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Retrieves user details (name and email) from database
 * @param ctx - Convex context
 * @param userId - User ID to fetch
 * @returns User object with name and email or null
 */
async function getUserDetails(ctx: any, userId: any) {
  const user = await ctx.db.get(userId);
  return user
    ? { name: `${user.firstName} ${user.lastName}`, email: user.email }
    : null;
}

/**
 * Validates user is admin
 * @param user - User object to validate
 * @throws Error if user is not admin
 */
function validateIsAdmin(user: any): void {
  if (user?.role !== "admin") {
    throw new Error("Unauthorized: Only admins can perform this action");
  }
}

/**
 * Calculates financial report data
 * @param ctx - Convex context
 * @returns Financial report statistics
 */
async function calculateFinancialReport(ctx: any) {
  const accounts = await ctx.db.query("accounts").collect();

  const totalBorrowed = accounts.reduce(
    (sum: number, a: any) => sum + (a.totalBorrowedAmount || 0),
    0,
  );
  const totalFines = accounts.reduce(
    (sum: number, a: any) => sum + (a.totalFineAmount || 0),
    0,
  );
  const totalOutstanding = accounts.reduce(
    (sum: number, a: any) =>
      sum +
      (a.borrowedAmountToBalance || 0) +
      (a.fineToBalance || 0) +
      (a.duesToBalance || 0),
    0,
  );

  const goodStanding = accounts.filter(
    (a: any) => a.status === "good_standing",
  ).length;
  const owing = accounts.filter((a: any) => a.status === "owing").length;
  const overdue = accounts.filter((a: any) => a.status === "overdue").length;

  return {
    totalBorrowed,
    totalFines,
    totalOutstanding,
    accountStatus: { goodStanding, owing, overdue },
    totalAccounts: accounts.length,
  };
}

/**
 * Calculates membership report data
 * @param ctx - Convex context
 * @param dateRange - Date range for new member calculation
 * @returns Membership report statistics
 */
async function calculateMembershipReport(ctx: any, dateRange: any) {
  const users = await ctx.db.query("users").collect();

  const totalMembers = users.length;
  const activeMembers = users.filter((u: any) => u.status === "active").length;
  const suspendedMembers = users.filter((u: any) => u.status === "suspended").length;
  const admins = users.filter((u: any) => u.role === "admin").length;
  const newMembers = users.filter(
    (u: any) =>
      u.joinedAt >= dateRange.start && u.joinedAt <= dateRange.end,
  ).length;

  return { totalMembers, activeMembers, suspendedMembers, admins, newMembers };
}

/**
 * Calculates events report data
 * @param ctx - Convex context
 * @param dateRange - Date range for event filtering
 * @returns Events report statistics
 */
async function calculateEventsReport(ctx: any, dateRange: any) {
  const events = await ctx.db.query("events").collect();
  const eventsInRange = events.filter((e: any) => {
    const eventDate = new Date(e.startDate).getTime();
    return (
      eventDate >= dateRange.start && eventDate <= dateRange.end
    );
  });

  const totalEvents = eventsInRange.length;
  const upcomingEvents = eventsInRange.filter(
    (e: any) => e.status === "upcoming",
  ).length;
  const completedEvents = eventsInRange.filter(
    (e: any) => e.status === "completed",
  ).length;
  const cancelledEvents = eventsInRange.filter(
    (e: any) => e.status === "cancelled",
  ).length;

  return {
    totalEvents,
    upcomingEvents,
    completedEvents,
    cancelledEvents,
  };
}

/**
 * Logs activity for audit trail
 * @param ctx - Convex context
 * @param userId - User performing action
 * @param action - Action type
 * @param description - Human-readable description
 * @param metadata - Additional context
 */
async function logReportActivity(
  ctx: any,
  userId: any,
  action: string,
  description: string,
  metadata: any = {},
) {
  const user = await ctx.db.get(userId);
  await ctx.db.insert("activities", {
    userId,
    type: "system",
    action,
    user: user ? `${user.firstName} ${user.lastName}` : "System",
    description,
    metadata,
    timestamp: Date.now(),
  });
}

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Retrieves all reports with optional filtering
 * @param type - Filter by report type (financial, membership, events, custom)
 * @param status - Filter by report status (pending, completed, failed)
 * @returns Array of reports with creator details
 */
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
      reports = reports.filter((r: any) => r.type === args.type);
    }

    if (args.status) {
      reports = reports.filter((r: any) => r.status === args.status);
    }

    // Get creator details
    return await Promise.all(
      reports.map(async (report: any) => {
        const creator = await getUserDetails(ctx, report.createdBy);
        return { ...report, creator };
      }),
    );
  },
});

/**
 * Retrieves a single report by ID with creator details
 * @param id - Report ID
 * @returns Report object with creator information or null if not found
 */
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

/**
 * Retrieves statistics about all reports in the system
 * @returns Object containing total, status counts, and breakdown by type
 */
export const getReportStats = query({
  handler: async (ctx) => {
    const reports = await ctx.db.query("reports").collect();

    const totalReports = reports.length;
    const completedReports = reports.filter(
      (r: any) => r.status === REPORT_STATUS.COMPLETED,
    ).length;
    const pendingReports = reports.filter(
      (r: any) => r.status === REPORT_STATUS.PENDING,
    ).length;
    const failedReports = reports.filter(
      (r: any) => r.status === REPORT_STATUS.FAILED,
    ).length;

    // Count by type
    const reportTypes: Record<string, number> = {};
    reports.forEach((report: any) => {
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

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Creates a new report
 * @param title - Report title
 * @param type - Report type (financial, membership, events, custom)
 * @param description - Optional report description
 * @param dateRange - Date range for report generation {start, end}
 * @param createdBy - ID of admin creating the report
 * @returns Report ID
 * @throws Error if user is not admin
 */
export const createReport = mutation({
  args: {
    title: v.string(),
    type: v.union(
      v.literal(REPORT_TYPE.FINANCIAL),
      v.literal(REPORT_TYPE.MEMBERSHIP),
      v.literal(REPORT_TYPE.EVENTS),
      v.literal(REPORT_TYPE.CUSTOM),
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
    validateIsAdmin(user);

    const reportId = await ctx.db.insert("reports", {
      title: args.title,
      type: args.type,
      description: args.description,
      dateRange: args.dateRange,
      status: REPORT_STATUS.PENDING,
      data: {},
      createdBy: args.createdBy,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    await logReportActivity(
      ctx,
      args.createdBy,
      "report_created",
      `New ${args.type} report "${args.title}" created`,
      { reportId, type: args.type },
    );

    return reportId;
  },
});

/**
 * Generates report data based on report type
 * Fetches relevant data and populates the report
 * @param reportId - ID of report to generate
 * @returns Report ID
 * @throws Error if report not found or generation fails
 * @side-effect Updates report status, inserts activity log, updates report data
 */
export const generateReportData = mutation({
  args: {
    reportId: v.id("reports"),
  },
  handler: async (ctx, args) => {
    const report = await ctx.db.get(args.reportId);
    if (!report) {
      throw new Error("Unauthorized: Report not found");
    }

    try {
      let data: any = {};

      switch (report.type) {
        case REPORT_TYPE.FINANCIAL:
          data = await calculateFinancialReport(ctx);
          break;
        case REPORT_TYPE.MEMBERSHIP:
          data = await calculateMembershipReport(ctx, report.dateRange);
          break;
        case REPORT_TYPE.EVENTS:
          data = await calculateEventsReport(ctx, report.dateRange);
          break;
        default:
          data = {};
      }

      await ctx.db.patch(args.reportId, {
        status: REPORT_STATUS.COMPLETED,
        data,
        completedAt: Date.now(),
        updatedAt: Date.now(),
      });

      await logReportActivity(
        ctx,
        report.createdBy,
        "report_generated",
        `Report "${report.title}" generated successfully`,
        { reportId: args.reportId },
      );

      return args.reportId;
    } catch (error) {
      await ctx.db.patch(args.reportId, {
        status: REPORT_STATUS.FAILED,
        updatedAt: Date.now(),
      });

      throw error;
    }
  },
});

/**
 * Updates an existing report
 * @param id - Report ID to update
 * @param title - Optional new title
 * @param description - Optional new description
 * @param status - Optional new status
 * @returns Report ID
 * @throws Error if report not found
 * @side-effect Inserts activity log, updates report timestamps
 */
export const updateReport = mutation({
  args: {
    id: v.id("reports"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal(REPORT_STATUS.PENDING),
        v.literal(REPORT_STATUS.COMPLETED),
        v.literal(REPORT_STATUS.FAILED),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    const report = await ctx.db.get(id);
    if (!report) {
      throw new Error("Unauthorized: Report not found");
    }

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });

    await logReportActivity(
      ctx,
      report.createdBy,
      "report_updated",
      `Report "${report.title}" was updated`,
      { reportId: id, updates },
    );

    return id;
  },
});

/**
 * Deletes a report from the system
 * @param id - Report ID to delete
 * @param deletedBy - ID of admin deleting the report
 * @returns Report ID
 * @throws Error if user is not admin or report not found
 * @side-effect Deletes report, inserts activity log
 */
export const deleteReport = mutation({
  args: {
    id: v.id("reports"),
    deletedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.deletedBy);
    validateIsAdmin(user);

    const report = await ctx.db.get(args.id);
    if (!report) {
      throw new Error("Unauthorized: Report not found");
    }

    await ctx.db.delete(args.id);

    await logReportActivity(
      ctx,
      args.deletedBy,
      "report_deleted",
      `Report "${report.title}" was deleted`,
      { reportId: args.id },
    );

    return args.id;
  },
});
