import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser, hasPermission } from "@/convex/utils";

// Get account by user ID
export const getAccountByUserId = query({
  args: { userId: v.id("users"), authEmail: v.string() },
  handler: async (ctx, args) => {
    await getCurrentUser(args.authEmail, ctx);
    const hasAccess = await hasPermission(
      ctx,
      ["admin", "treasurer"],
      args.authEmail,
    );
    if (!hasAccess) {
      throw new Error("Unauthorized");
    }
    return await ctx.db
      .query("accounts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();
  },
});

// Get an account by ID
export const getAccountById = query({
  args: { id: v.id("accounts"), authEmail: v.string() },
  handler: async (ctx, args) => {
    await getCurrentUser(args.authEmail, ctx);
    const hasAccess = await hasPermission(
      ctx,
      ["admin", "treasurer"],
      args.authEmail,
    );
    if (!hasAccess) {
      throw new Error("Unauthorized");
    }
    return await ctx.db.get(args.id);
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
    authEmail: v.string(),
  },
  handler: async (ctx, args) => {
    await getCurrentUser(args.authEmail, ctx);
    const hasAccess = await hasPermission(
      ctx,
      ["admin", "treasurer"],
      args.authEmail,
    );
    if (!hasAccess) {
      throw new Error("Unauthorized");
    }
    let accounts = await ctx.db.query("accounts").collect();

    if (args.status) {
      accounts = accounts.filter((acc) => acc.status === args.status);
    }

    // Get user details for each account
    return await Promise.all(
      accounts.map(async (account) => {
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
  },
});

// Get account statistics
export const getAccountStats = query({
  args: {
    userId: v.optional(v.id("users")),
    authEmail: v.string(),
  },
  handler: async (ctx, args) => {
    await getCurrentUser(args.authEmail, ctx);
    const hasAccess = await hasPermission(
      ctx,
      ["admin", "treasurer"],
      args.authEmail,
    );
    if (!hasAccess) {
      throw new Error("Unauthorized");
    }
    let q = ctx.db.query("accounts");
    if (args?.userId) {
      // @ts-expect-error query type inference issue with optional args
      q = q.withIndex("by_user", (q) => q.eq("userId", args.userId!));
    }

    const accounts = await q.collect();

    return accounts.reduce(
      (acc, a) => {
        switch (a.status) {
          case "good_standing":
            acc.goodStanding++;
            break;
          case "owing":
            acc.owing++;
            break;
          case "overdue":
            acc.overdue++;
            break;
        }
        acc.totalBorrowed += a.borrowedAmount;
        acc.totalFines += a.fineAmount;
        acc.totalOutstanding += a.currentBalance;
        return acc;
      },
      {
        goodStanding: 0,
        owing: 0,
        overdue: 0,
        totalBorrowed: 0,
        totalFines: 0,
        totalOutstanding: 0,
      },
    );
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
    if (!hasAccess) {
      throw new Error("Unauthorized");
    }
    const account = await ctx.db
      .query("accounts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    if (!account) {
      throw new Error("Account not found");
    }

    const user = await ctx.db.get(args.userId);

    const newBorrowedAmount = account.borrowedAmount + args.amount;
    const newBalance = account.currentBalance + args.amount;

    // Determine status
    let status: "good_standing" | "owing" | "overdue" = "owing";
    if (newBalance === 0) {
      status = "good_standing";
    } else if (args.dueDate < Date.now()) {
      status = "overdue";
    }

    // Update payment history
    const newPaymentHistory = [
      ...account.paymentHistory,
      {
        type: "borrow" as const,
        amount: args.amount,
        date: Date.now(),
        description: args.description || "Borrowed amount",
        dueDate: args.dueDate,
      },
    ];

    await ctx.db.patch(account._id, {
      borrowedAmount: newBorrowedAmount,
      currentBalance: newBalance,
      dueDate: args.dueDate,
      status,
      paymentHistory: newPaymentHistory,
    });

    // Create an activity log
    await ctx.db.insert("activities", {
      userId: args.userId,
      type: "payment",
      user: `${authUser.firstName} ${authUser.lastName}`,
      action: "record_borrow",
      description: `recorded borrowed amount of EUR${args.amount.toLocaleString()} for ${user?.firstName} ${user?.lastName}`,
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
    const account = await ctx.db
      .query("accounts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    if (!account) {
      throw new Error("Account not found");
    }

    const user = await ctx.db.get(args.userId);

    const newBalance = Math.max(0, account.currentBalance - args.amount);

    // Determine status
    let status: "good_standing" | "owing" | "overdue" = "good_standing";
    if (newBalance > 0) {
      if (account.dueDate && account.dueDate < Date.now()) {
        status = "overdue";
      } else {
        status = "owing";
      }
    }

    // Update payment history
    const newPaymentHistory = [
      ...account.paymentHistory,
      {
        type: "payment" as const,
        amount: args.amount,
        date: Date.now(),
        description: args.description || "Payment received",
      },
    ];

    await ctx.db.patch(account._id, {
      currentBalance: newBalance,
      status,
      paymentHistory: newPaymentHistory,
    });

    // Create an activity log
    await ctx.db.insert("activities", {
      userId: args.userId,
      type: "payment",
      user: `${authUser.firstName} ${authUser.lastName}`,
      action: "record_payment",
      description: `recorded payment of the sum EUR${args.amount.toLocaleString()} for ${user?.firstName} ${user?.lastName}`,
      metadata: { amount: args.amount, newBalance },
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
    if (!hasAccess) {
      throw new Error("Unauthorized");
    }
    const account = await ctx.db
      .query("accounts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    if (!account) {
      throw new Error("Account not found");
    }

    const user = await ctx.db.get(args.userId);

    const newFineAmount = account.fineAmount + args.amount;
    const newBalance = account.currentBalance + args.amount;

    // Update payment history
    const newPaymentHistory = [
      ...account.paymentHistory,
      {
        type: "fine" as const,
        amount: args.amount,
        date: Date.now(),
        description: `Fine: ${args.reason}`,
      },
    ];

    await ctx.db.patch(account._id, {
      fineAmount: newFineAmount,
      currentBalance: newBalance,
      status: newBalance > 0 ? "owing" : "good_standing",
      paymentHistory: newPaymentHistory,
    });

    // Create an activity log
    await ctx.db.insert("activities", {
      userId: args.userId,
      type: "payment",
      user: `${authUser.firstName} ${authUser.lastName}`,
      action: "record_fine",
      description: `gave fine of EUR${args.amount.toLocaleString()} to ${user?.firstName} ${user?.lastName}: ${args.reason}`,
      metadata: {
        amount: args.amount,
        reason: args.reason,
        user: user?.firstName,
      },
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
    const authUser = await getCurrentUser(args.authEmail, ctx);
    const hasAccess = await hasPermission(
      ctx,
      ["admin", "treasurer"],
      args.authEmail,
    );
    if (!hasAccess) {
      throw new Error("Unauthorized");
    }
    const accounts = await ctx.db.query("accounts").collect();
    const now = Date.now();
    let updatedCount = 0;

    for (const account of accounts) {
      if (
        account.dueDate &&
        account.dueDate < now &&
        account.currentBalance > 0 &&
        account.status !== "overdue"
      ) {
        await ctx.db.patch(account._id, { status: "overdue" });
        updatedCount++;

        const user = await ctx.db.get(account.userId);
        await ctx.db.insert("activities", {
          userId: account.userId,
          type: "payment",
          user: `${authUser.firstName} ${authUser.lastName}`,
          action: "auto_update_overdue",
          description: `update ${user?.firstName}'s account to overdue`,
          metadata: {
            dueDate: account.dueDate,
            balance: account.currentBalance,
            user: user?.firstName,
          },
          timestamp: Date.now(),
        });
      }
    }

    return { updatedCount };
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
