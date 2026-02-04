import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get account by user ID
export const getAccountByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("accounts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();
  },
});

// Get an account by ID
export const getAccountById = query({
  args: { id: v.id("accounts") },
  handler: async (ctx, args) => {
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
  },
  handler: async (ctx, args) => {
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
  handler: async (ctx) => {
    const accounts = await ctx.db.query("accounts").collect();

    const goodStanding = accounts.filter(
      (a) => a.status === "good_standing",
    ).length;
    const owing = accounts.filter((a) => a.status === "owing").length;
    const overdue = accounts.filter((a) => a.status === "overdue").length;

    const totalBorrowed = accounts.reduce(
      (sum, a) => sum + a.borrowedAmount,
      0,
    );
    const totalFines = accounts.reduce((sum, a) => sum + a.fineAmount, 0);
    const totalOutstanding = accounts.reduce(
      (sum, a) => sum + a.currentBalance,
      0,
    );

    return {
      goodStanding,
      owing,
      overdue,
      totalBorrowed,
      totalFines,
      totalOutstanding,
    };
  },
});

// Get overdue accounts
export const getOverdueAccounts = query({
  handler: async (ctx) => {
    const accounts = await ctx.db
      .query("accounts")
      .withIndex("by_status", (q) => q.eq("status", "overdue"))
      .collect();

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

// Create an account for a user
export const createAccount = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Check if an account already exists
    const existingAccount = await ctx.db
      .query("accounts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    if (existingAccount) {
      throw new Error("Account already exists for this user");
    }

    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    const accountId = await ctx.db.insert("accounts", {
      userId: args.userId,
      borrowedAmount: 0,
      fineAmount: 0,
      currentBalance: 0,
      status: "good_standing",
      paymentHistory: [],
    });

    // Create an activity log
    await ctx.db.insert("activities", {
      userId: args.userId,
      type: "account_created",
      description: `Account created for ${user.firstName} ${user.lastName}`,
      metadata: {},
      timestamp: Date.now(),
    });

    return accountId;
  },
});

// Record borrowed amount
export const recordBorrow = mutation({
  args: {
    userId: v.id("users"),
    amount: v.number(),
    dueDate: v.number(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
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
      type: "borrow_recorded",
      description: `${user?.firstName} ${user?.lastName}, borrowed ₦${args.amount.toLocaleString()}`,
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
  },
  handler: async (ctx, args) => {
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
      type: "payment_received",
      description: `${user?.firstName} ${user?.lastName} made a payment of ₦${args.amount.toLocaleString()}`,
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
  },
  handler: async (ctx, args) => {
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
      type: "fine_recorded",
      description: `Fine of ₦${args.amount.toLocaleString()} added to ${user?.firstName} ${user?.lastName}: ${args.reason}`,
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
  },
  handler: async (ctx, args) => {
    const account = await ctx.db.get(args.accountId);
    if (!account) {
      throw new Error("Account not found");
    }

    const user = await ctx.db.get(account.userId);

    await ctx.db.patch(args.accountId, { status: args.status });

    // Create an activity log
    await ctx.db.insert("activities", {
      userId: account.userId,
      type: "account_status_updated",
      description: `${user?.firstName}'s account status changed to ${args.status}`,
      metadata: { oldStatus: account.status, newStatus: args.status },
      timestamp: Date.now(),
    });

    return args.accountId;
  },
});

// Check and update overdue accounts
export const updateOverdueAccounts = mutation({
  handler: async (ctx) => {
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
          type: "account_overdue",
          description: `${user?.firstName}'s account is now overdue`,
          metadata: {
            dueDate: account.dueDate,
            balance: account.currentBalance,
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
  args: { accountId: v.id("accounts") },
  handler: async (ctx, args) => {
    const account = await ctx.db.get(args.accountId);
    if (!account) {
      throw new Error("Account not found");
    }

    const user = await ctx.db.get(account.userId);

    await ctx.db.delete(args.accountId);

    // Create an activity log
    await ctx.db.insert("activities", {
      userId: account.userId,
      type: "account_deleted",
      description: `Account deleted for ${user?.firstName} ${user?.lastName}`,
      metadata: {},
      timestamp: Date.now(),
    });

    return args.accountId;
  },
});
