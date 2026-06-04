import { query } from "./_generated/server";

export const getAppStats = query({
  args: {},
  handler: async (ctx) => {
    const ESTABLISHED_YEAR = 2020;
    const currentYear = new Date().getFullYear();
    const ageInYears = currentYear - ESTABLISHED_YEAR;

    // ── Members ──────────────────────────────────────────────────
    const allMembers = await ctx.db.query("users").collect();
    const totalMembers = allMembers.length;
    const activeMembers = allMembers.filter(
      (u) => u.status === "active",
    ).length;
    const suspendedMembers = allMembers.filter(
      (u) => u.status === "suspended",
    ).length;
    const inactiveMembers = allMembers.filter(
      (u) => u.status === "inactive",
    ).length;

    // Role breakdown
    const adminCount = allMembers.filter((u) => u.role === "admin").length;
    const memberCount = allMembers.filter((u) => u.role === "member").length;
    const treasurerCount = allMembers.filter(
      (u) => u.role === "treasurer",
    ).length;
    const proCount = allMembers.filter((u) => u.role === "pro").length;

    // ── Events ───────────────────────────────────────────────────
    const allEvents = await ctx.db.query("events").collect();
    const totalEvents = allEvents.length;
    const upcomingEvents = allEvents.filter(
      (e) => e.status === "upcoming",
    ).length;
    const ongoingEvents = allEvents.filter(
      (e) => e.status === "ongoing",
    ).length;
    const completedEvents = allEvents.filter(
      (e) => e.status === "completed",
    ).length;
    const cancelledEvents = allEvents.filter(
      (e) => e.status === "cancelled",
    ).length;

    // Event type breakdown
    const meetingCount = allEvents.filter((e) => e.type === "meeting").length;
    const socialCount = allEvents.filter((e) => e.type === "social").length;
    const fundraiserCount = allEvents.filter(
      (e) => e.type === "fundraiser",
    ).length;
    const workshopCount = allEvents.filter((e) => e.type === "workshop").length;

    // ── Financials (from treasury singleton) ─────────────────────
    const treasuryRecords = await ctx.db.query("treasury").collect();
    const treasury = treasuryRecords[0] ?? null;

    const totalMoneyCollected = treasury
      ? treasury.totalDues + treasury.totalFines + treasury.totalBorrowed
      : 0;
    const moneyAtHand = treasury?.moneyAtHand ?? 0;
    const totalOutstanding =
      (treasury?.totalOutStandingBorrow ?? 0) +
      (treasury?.totalOutStandingFine ?? 0) +
      (treasury?.totalOutStandingDues ?? 0);

    // Standing breakdown
    const goodStandingMembers = treasury?.noOfGoodStandingMembers ?? 0;
    const owingMembers = treasury?.noOfOwingMembers ?? 0;
    const overdueMembers = treasury?.noOfOverdueMembers ?? 0;

    // ── Activities ───────────────────────────────────────────────
    const totalActivities = await ctx.db.query("activities").collect();
    const recentActivities = totalActivities
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 5);

    // ── Notifications ────────────────────────────────────────────
    const allNotifications = await ctx.db.query("notifications").collect();
    const unreadNotifications = allNotifications.filter((n) => !n.read).length;

    // ── Reports ──────────────────────────────────────────────────
    const allReports = await ctx.db.query("reports").collect();
    const totalReports = allReports.length;
    const pendingReports = allReports.filter(
      (r) => r.status === "pending",
    ).length;

    return {
      // Club meta
      establishedYear: ESTABLISHED_YEAR,
      ageInYears,

      // Members
      members: {
        total: totalMembers,
        active: activeMembers,
        suspended: suspendedMembers,
        inactive: inactiveMembers,
        byRole: {
          admin: adminCount,
          member: memberCount,
          treasurer: treasurerCount,
          pro: proCount,
        },
      },

      // Events
      events: {
        total: totalEvents,
        upcoming: upcomingEvents,
        ongoing: ongoingEvents,
        completed: completedEvents,
        cancelled: cancelledEvents,
        byType: {
          meeting: meetingCount,
          social: socialCount,
          fundraiser: fundraiserCount,
          workshop: workshopCount,
        },
      },

      // Financials
      financials: {
        moneyAtHand,
        totalMoneyCollected,
        totalOutstanding,
        totalDues: treasury?.totalDues ?? 0,
        totalFines: treasury?.totalFines ?? 0,
        totalBorrowed: treasury?.totalBorrowed ?? 0,
        outstandingDues: treasury?.totalOutStandingDues ?? 0,
        outstandingFines: treasury?.totalOutStandingFine ?? 0,
        outstandingBorrowed: treasury?.totalOutStandingBorrow ?? 0,
      },

      // Member standing
      standing: {
        goodStanding: goodStandingMembers,
        owing: owingMembers,
        overdue: overdueMembers,
      },

      // Misc
      totalActivities: totalActivities.length,
      recentActivities,
      unreadNotifications,
      totalReports,
      pendingReports,
    };
  },
});
