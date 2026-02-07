import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser, hasPermission } from "@/convex/utils";
import { paginationOptsValidator } from "convex/server";

// Get account by user ID
export const getAccountByUserId = query({
  args: { userId: v.id("users"), authEmail: v.string() },
  handler: async (ctx, args) => {
    await getCurrentUser(args.authEmail, ctx);
    const user = await ctx.db.get(args.userId);
    const hasAccess = await hasPermission(
      ctx,
      ["admin", "treasurer"],
      args.authEmail,
    );
    if (!hasAccess) {
      throw new Error("Unauthorized");
    }
    const account = await ctx.db
      .query("accounts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    return {
      ...account,
      user: user
        ? {
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            phone: user.phone,
            role: user.role,
          }
        : null,
    };
  },
});

// Get all accounts with user details
export const getAllAccounts = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("good_standing"),
        v.literal("owing"),
        v.literal("overdue"),
      ),
    ),
    search: v.optional(v.string()),
    authEmail: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    await getCurrentUser(args.authEmail, ctx);

    const hasAccess = await hasPermission(
      ctx,
      ["admin", "treasurer"],
      args.authEmail,
    );
    if (!hasAccess) throw new Error("Unauthorized");

    let q;

    if (args.search) {
      q = ctx.db
        .query("accounts")
        .withSearchIndex("search_history", (q) =>
          q.search("searchField", args.search!),
        );
    } else if (args.status) {
      q = ctx.db
        .query("accounts")
        .withIndex("by_status", (q) => q.eq("status", args.status!));
    }
    // 📂 Fallback
    else {
      q = ctx.db.query("accounts");
    }

    const page = await q.paginate(args.paginationOpts);

    const enriched = await Promise.all(
      page.page.map(async (account) => {
        const user = await ctx.db.get(account.userId);
        return {
          ...account,
          user: user
            ? {
                name: `${user.firstName} ${user.lastName}`,
                email: user.email,
                phone: user.phone,
              }
            : null,
        };
      }),
    );

    return {
      ...page,
      page: enriched,
    };
  },
});

// Get account statistics
export const getAccountStats = query({
  args: { authEmail: v.string() },
  handler: async (ctx, args) => {
    await getCurrentUser(args.authEmail, ctx);
    return await getTreasury(ctx);
  },
});

// Record borrowed amount
export const recordBorrow = mutation({
  args: {
    userId: v.id("users"),
    amount: v.number(),
    dueDate: v.number(),
    description: v.optional(v.string()),
    authEmail: v.string(),
  },
  handler: async (ctx, args) => {
    const authUser = await getCurrentUser(args.authEmail, ctx);
    const hasAccess = await hasPermission(
      ctx,
      ["admin", "treasurer"],
      args.authEmail,
    );
    if (!hasAccess) throw new Error("Unauthorized");

    const account = await ctx.db
      .query("accounts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();
    if (!account) throw new Error("Account not found");

    const user = await ctx.db.get(args.userId);

    const treasury = await getTreasury(ctx);

    if (treasury.moneyAtHand > args.amount) {
      throw new Error("Insufficient funds in treasury");
    }
    if (
      account.status === "owing" &&
      account.dueDate &&
      account.dueDate < Date.now() &&
      account.currentBorrowedAmount + args.amount > 500
    ) {
      throw new Error("Cannot borrow while account is not in good standing");
    }
    const currentBorrowedAmount = account.currentBorrowedAmount + args.amount;

    const status = args.dueDate < Date.now() ? "overdue" : "owing";

    await ctx.db.patch(account._id, {
      currentBorrowedAmount,
      borrowedAmountToBalance: account.borrowedAmountToBalance + args.amount,
      totalBorrowedAmount: account.totalBorrowedAmount + args.amount,
      dueDate: args.dueDate,
      status,
      paymentHistory: [
        ...account.paymentHistory,
        {
          type: "borrow",
          amount: args.amount,
          date: Date.now(),
          description: args.description ?? "Borrowed amount",
          dueDate: args.dueDate,
        },
      ],
    });

    await ctx.db.patch(treasury._id, {
      totalBorrowed: treasury.totalBorrowed + args.amount,
      totalOutStandingBorrow: treasury.totalOutStandingBorrow + args.amount,
      noOfOwingMembers:
        account.status === "good_standing"
          ? treasury.noOfOwingMembers + 1
          : treasury.noOfOwingMembers,
      moneyAtHand: treasury.moneyAtHand - args.amount,
    });

    await ctx.db.insert("activities", {
      userId: args.userId,
      type: "payment",
      user: `${authUser.firstName} ${authUser.lastName}`,
      action: "record_borrow",
      description: `recorded borrow of EUR${args.amount.toLocaleString()} for ${user?.firstName}`,
      metadata: { amount: args.amount, dueDate: args.dueDate },
      timestamp: Date.now(),
    });

    return account._id;
  },
});

// Record payment
export const recordPayment = mutation({
  args: {
    userId: v.id("users"),
    amount: v.number(),
    description: v.optional(v.string()),
    authEmail: v.string(),
    paymentType: v.union(
      v.literal("fine_payment"),
      v.literal("borrow_payment"),
      v.literal("due_payment"),
    ),
  },
  handler: async (ctx, args) => {
    const authUser = await getCurrentUser(args.authEmail, ctx);
    const hasAccess = await hasPermission(
      ctx,
      ["admin", "treasurer"],
      args.authEmail,
    );
    if (!hasAccess) throw new Error("Unauthorized");

    const account = await ctx.db
      .query("accounts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();
    if (!account) throw new Error("Account not found");

    if (args.paymentType === "fine_payment" && !account.fineToBalance) {
      throw new Error("No outstanding fines to record");
    }
    if (
      args.paymentType === "borrow_payment" &&
      !account.borrowedAmountToBalance
    ) {
      throw new Error("No outstanding borrowed amount to record");
    }
    if (args.paymentType === "due_payment" && !account.duesToBalance) {
      throw new Error("No outstanding dues to record");
    }
    if (
      args.paymentType === "fine_payment" &&
      args.amount > account.fineToBalance
    ) {
      throw new Error("Payment amount exceeds outstanding fine balance");
    }

    const user = await ctx.db.get(args.userId);

    let newBorrowed = account.currentBorrowedAmount;
    let newFine = account.currentFineAmount;
    let newDues = account.currentDuesAmount;
    let newAmountToBalance = account.borrowedAmountToBalance;
    let newFineToBalance = account.fineToBalance;
    let newDuesToBalance = account.duesToBalance;

    switch (args.paymentType) {
      case "borrow_payment":
        newBorrowed = Math.max(0, account.currentBorrowedAmount - args.amount);
        newAmountToBalance = Math.max(
          0,
          account.borrowedAmountToBalance - args.amount,
        );
        break;
      case "fine_payment":
        newFine = Math.max(0, account.currentFineAmount - args.amount);
        newFineToBalance = Math.max(0, account.fineToBalance - args.amount);
        break;
      case "due_payment":
        newDues = Math.max(0, account.currentDuesAmount - args.amount);
        newDuesToBalance = Math.max(0, account.duesToBalance - args.amount);
        break;
    }
    if (
      newFineToBalance < 0 ||
      newAmountToBalance < 0 ||
      newDuesToBalance < 0
    ) {
      throw new Error("Payment amount exceeds outstanding balance");
    }

    const outstanding = newBorrowed + newFine + newDues;

    const status =
      outstanding === 0
        ? "good_standing"
        : account.dueDate && account.dueDate < Date.now()
          ? "overdue"
          : "owing";

    await ctx.db.patch(account._id, {
      currentBorrowedAmount: newBorrowed,
      currentFineAmount: newFine,
      currentDuesAmount: newDues,
      borrowedAmountToBalance: newAmountToBalance,
      fineToBalance: newFineToBalance,
      duesToBalance: newDuesToBalance,
      dueDate: status === "good_standing" ? undefined : account.dueDate,
      status,
      paymentHistory: [
        ...account.paymentHistory,
        {
          type: args.paymentType,
          amount: args.amount,
          date: Date.now(),
          description: args.description ?? `${args.paymentType} payment`,
        },
      ],
    });

    const treasury = await getTreasury(ctx);

    let outBorrow = treasury.totalOutStandingBorrow;
    let outFine = treasury.totalOutStandingFine;
    let outDues = treasury.totalOutStandingDues;

    switch (args.paymentType) {
      case "borrow_payment":
        outBorrow = Math.max(0, outBorrow - args.amount);
        break;
      case "fine_payment":
        outFine = Math.max(0, outFine - args.amount);
        break;
      case "due_payment":
        outDues = Math.max(0, outDues - args.amount);
        break;
    }

    await ctx.db.patch(treasury._id, {
      moneyAtHand: treasury.moneyAtHand + args.amount,
      totalOutStandingBorrow: outBorrow,
      totalOutStandingFine: outFine,
      totalOutStandingDues: outDues,
      noOfOwingMembers:
        status === "good_standing" && treasury.noOfOwingMembers
          ? treasury.noOfOwingMembers - 1
          : treasury.noOfOwingMembers,
    });

    await ctx.db.insert("activities", {
      userId: args.userId,
      type: "payment",
      user: `${authUser.firstName} ${authUser.lastName}`,
      action: "record_payment",
      description: `recorded ${args.paymentType} payment of EUR${args.amount.toLocaleString()} for ${user?.firstName}`,
      metadata: {
        paymentType: args.paymentType,
        amount: args.amount,
      },
      timestamp: Date.now(),
    });

    return account._id;
  },
});

// Record fine
export const recordFine = mutation({
  args: {
    userId: v.id("users"),
    amount: v.number(),
    reason: v.string(),
    authEmail: v.string(),
  },
  handler: async (ctx, args) => {
    const authUser = await getCurrentUser(args.authEmail, ctx);
    const hasAccess = await hasPermission(
      ctx,
      ["admin", "treasurer"],
      args.authEmail,
    );
    if (!hasAccess) throw new Error("Unauthorized");

    const account = await ctx.db
      .query("accounts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();
    if (!account) throw new Error("Account not found");
    const prevAccountStatus = account.status;
    await ctx.db.patch(account._id, {
      currentFineAmount: account.currentFineAmount + args.amount,
      fineToBalance: account.fineToBalance + args.amount,
      totalFineAmount: account.totalFineAmount + args.amount,
      status: "owing",
      paymentHistory: [
        ...account.paymentHistory,
        {
          type: "fine",
          amount: args.amount,
          date: Date.now(),
          description: args.reason,
        },
      ],
    });

    const treasury = await getTreasury(ctx);

    await ctx.db.patch(treasury._id, {
      totalFines: treasury.totalFines + args.amount,
      totalOutStandingFine: treasury.totalOutStandingFine + args.amount,
      noOfOwingMembers:
        prevAccountStatus === "good_standing"
          ? treasury.noOfOwingMembers + 1
          : treasury.noOfOwingMembers,
    });

    await ctx.db.insert("activities", {
      userId: args.userId,
      type: "payment",
      user: `${authUser.firstName} ${authUser.lastName}`,
      action: "record_fine",
      description: `recorded fine of EUR${args.amount.toLocaleString()} for ${account.userId} for reason: ${args.reason}`,
      metadata: { amount: args.amount, reason: args.reason },
      timestamp: Date.now(),
    });
    return account._id;
  },
});

// Update account status manually
export const updateAccountStatus = mutation({
  args: {
    accountId: v.id("accounts"),
    status: v.union(
      v.literal("good_standing"),
      v.literal("owing"),
      v.literal("overdue"),
    ),
    authEmail: v.string(),
  },
  handler: async (ctx, args) => {
    const authUser = await getCurrentUser(args.authEmail, ctx);
    const hasAccess = await hasPermission(
      ctx,
      ["admin", "treasurer"],
      args.authEmail,
    );
    if (!hasAccess) {
      throw new Error("Unauthorized");
    }

    const account = await ctx.db.get(args.accountId);
    if (!account) {
      throw new Error("Account not found");
    }

    const user = await ctx.db.get(account.userId);

    await ctx.db.patch(args.accountId, { status: args.status });

    // Create an activity log
    await ctx.db.insert("activities", {
      userId: account.userId,
      type: "payment",
      user: `${authUser.firstName} ${authUser.lastName}`,
      action: "update_status",
      description: `update payment status for ${user?.firstName}'s from ${account.status} to ${args.status}`,
      metadata: {
        oldStatus: account.status,
        newStatus: args.status,
        user: user?.firstName,
      },
      timestamp: Date.now(),
    });

    return args.accountId;
  },
});

// Check and update overdue accounts
export const updateOverdueAccounts = mutation({
  args: { authEmail: v.string() },
  handler: async (ctx, args) => {
    const hasAccess = await hasPermission(
      ctx,
      ["admin", "treasurer"],
      args.authEmail,
    );
    if (!hasAccess) throw new Error("Unauthorized");

    const now = Date.now();
    const overdue = await ctx.db
      .query("accounts")
      .withIndex("by_status", (q) => q.eq("status", "owing"))
      .collect();

    let updated = 0;

    for (const acc of overdue) {
      if (acc.dueDate && acc.dueDate < now) {
        await ctx.db.patch(acc._id, {
          status: "overdue",
        });
        updated++;
      }
    }

    const treasury = await getTreasury(ctx);
    const overdueCount = treasury.noOfOverdueMembers;

    await ctx.db.patch(treasury._id, {
      noOfOverdueMembers: overdueCount + updated,
      noOfOwingMembers: treasury.noOfOwingMembers - updated,
    });

    return { updated };
  },
});

// Delete an account
export const deleteAccount = mutation({
  args: { accountId: v.id("accounts"), authEmail: v.string() },
  handler: async (ctx, args) => {
    const authUser = await getCurrentUser(args.authEmail, ctx);
    const hasAccess = await hasPermission(
      ctx,
      ["admin", "treasurer"],
      args.authEmail,
    );
    if (!hasAccess) {
      throw new Error("Unauthorized");
    }
    const account = await ctx.db.get(args.accountId);
    if (!account) {
      throw new Error("Account not found");
    }

    const user = await ctx.db.get(account.userId);

    await ctx.db.delete(args.accountId);

    // Create an activity log
    await ctx.db.insert("activities", {
      userId: account.userId,
      type: "payment",
      user: `${authUser.firstName} ${authUser.lastName}`,
      action: "delete_account",
      description: `deleted account for ${user?.firstName} ${user?.lastName}`,
      metadata: {
        user: user?.firstName,
      },
      timestamp: Date.now(),
    });

    return args.accountId;
  },
});

// Record dues for a user
export const recordDue = mutation({
  args: {
    userId: v.id("users"),
    amount: v.number(),
    dueDate: v.number(),
    description: v.optional(v.string()),
    authEmail: v.string(),
  },
  handler: async (ctx, args) => {
    const authUser = await getCurrentUser(args.authEmail, ctx);
    const hasAccess = await hasPermission(
      ctx,
      ["admin", "treasurer"],
      args.authEmail,
    );
    if (!hasAccess) throw new Error("Unauthorized");

    const account = await ctx.db
      .query("accounts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();
    if (!account) throw new Error("Account not found");

    const user = await ctx.db.get(args.userId);
    const treasury = await getTreasury(ctx);

    const currentDuesAmount = account.currentDuesAmount + args.amount;
    const status = args.dueDate < Date.now() ? "overdue" : "owing";

    // ---- UPDATE ACCOUNT ----
    await ctx.db.patch(account._id, {
      currentDuesAmount,
      duesToBalance: account.duesToBalance + args.amount,
      totalDuesAmount: account.totalDuesAmount + args.amount,
      dueDate: args.dueDate,
      status,
      paymentHistory: [
        ...account.paymentHistory,
        {
          type: "dues",
          amount: args.amount,
          date: Date.now(),
          description: args.description ?? "Membership dues",
          dueDate: args.dueDate,
        },
      ],
    });

    // ---- UPDATE TREASURY ----
    await ctx.db.patch(treasury._id, {
      totalDues: treasury.totalDues + args.amount,
      totalOutStandingDues: treasury.totalOutStandingDues + args.amount,
      noOfOwingMembers:
        account.status === "good_standing"
          ? treasury.noOfOwingMembers + 1
          : treasury.noOfOwingMembers,
    });

    // ---- ACTIVITY LOG ----
    await ctx.db.insert("activities", {
      userId: args.userId,
      type: "payment",
      user: `${authUser.firstName} ${authUser.lastName}`,
      action: "record_due",
      description: `recorded dues of EUR${args.amount.toLocaleString()} for ${user?.firstName}`,
      metadata: { amount: args.amount, dueDate: args.dueDate },
      timestamp: Date.now(),
    });

    return account._id;
  },
});

export const initTreasury = mutation({
  handler: async (ctx) => {
    const existing = await ctx.db.query("treasury").first();
    if (!existing) {
      await ctx.db.insert("treasury", {
        moneyAtHand: 0,
        totalBorrowed: 0,
        totalFines: 0,
        totalDues: 0,
        totalOutStandingBorrow: 0,
        totalOutStandingFine: 0,
        totalOutStandingDues: 0,
        noOfGoodStandingMembers: 0,
        noOfOwingMembers: 0,
        noOfOverdueMembers: 0,
      });
    }
  },
});

async function getTreasury(ctx: any) {
  const t = await ctx.db.query("treasury").first();
  const accounts = await ctx.db.query("accounts").collect();
  t.noOfGoodStandingMembers = accounts.filter(
    (acc: any) => acc.status === "good_standing",
  ).length;
  if (!t) throw new Error("Treasury not initialized");
  return t;
}
