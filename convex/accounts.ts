import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser, hasPermission } from "@/convex/utils";
import { paginationOptsValidator } from "convex/server";
import { Id } from "./_generated/dataModel";

// ============================================================================
// CONSTANTS & TYPES
// ============================================================================

/** Account status representing member's financial standing */
export const ACCOUNT_STATUS = {
  GOOD_STANDING: "good_standing",
  OWING: "owing",
  OVERDUE: "overdue",
} as const;

/** Payment types for financial transactions */
export const PAYMENT_TYPE = {
  FINE_PAYMENT: "fine_payment",
  BORROW_PAYMENT: "borrow_payment",
  DUE_PAYMENT: "due_payment",
} as const;

/** Business rules for financial transactions */
export const BUSINESS_RULES = {
  /** Maximum borrow amount for overdue members */
  MAX_OVERDUE_BORROW: 500,
  /** Currency used in the system */
  CURRENCY: "EUR",
} as const;

type AccountStatus = (typeof ACCOUNT_STATUS)[keyof typeof ACCOUNT_STATUS];
type PaymentType = (typeof PAYMENT_TYPE)[keyof typeof PAYMENT_TYPE];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculates account status based on outstanding amounts and due date
 * Status hierarchy: good_standing > owing > overdue
 */
function calculateAccountStatus(
  outstandingBorrowed: number,
  outstandingFine: number,
  outstandingDues: number,
  dueDate: number | undefined,
): AccountStatus {
  const totalOutstanding =
    outstandingBorrowed + outstandingFine + outstandingDues;

  if (totalOutstanding === 0) {
    return ACCOUNT_STATUS.GOOD_STANDING;
  }

  if (dueDate && dueDate < Date.now()) {
    return ACCOUNT_STATUS.OVERDUE;
  }

  return ACCOUNT_STATUS.OWING;
}

/**
 * Logs financial activities for audit trail and transparency
 */
async function logActivity(
  ctx: any,
  userId: string,
  authUser: any,
  action: string,
  description: string,
  metadata: Record<string, any>,
) {
  await ctx.db.insert("activities", {
    userId,
    type: "payment",
    user: `${authUser.firstName} ${authUser.lastName}`,
    action,
    description,
    metadata,
    timestamp: Date.now(),
  });
}

/**
 * Formats currency amounts for display
 */
function formatCurrency(amount: number): string {
  return `${BUSINESS_RULES.CURRENCY}${amount.toLocaleString()}`;
}

/**
 * Retrieves treasury record with current member statistics
 * Recalculates good standing count to ensure accuracy
 */
async function getTreasury(ctx: any) {
  const treasury = await ctx.db.query("treasury").first();
  if (!treasury) {
    throw new Error("Treasury not initialized - please contact administrator");
  }

  // Recalculate good standing members for consistency
  const accounts = await ctx.db.query("accounts").collect();
  const goodStandingCount = accounts.filter(
    (acc: any) => acc.status === ACCOUNT_STATUS.GOOD_STANDING,
  ).length;

  return {
    ...treasury,
    noOfGoodStandingMembers: goodStandingCount,
  };
}

/**
 * Retrieves account by user ID with validation
 * Throws if account doesn't exist
 */
async function getAccountByUserIdOrThrow(ctx: any, userId: string) {
  const account = await ctx.db
    .query("accounts")
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .unique();

  if (!account) {
    throw new Error(`Account not found for user ID: ${userId}`);
  }

  return account;
}

/**
 * Validates that member has sufficient treasury funds for borrow operation
 */
function validateSufficientTreasuryFunds(
  treasuryBalance: number,
  requestedAmount: number,
): void {
  if (treasuryBalance < requestedAmount) {
    throw new Error(
      `Insufficient treasury funds. Available: ${formatCurrency(treasuryBalance)}, Requested: ${formatCurrency(requestedAmount)}`,
    );
  }
}

/**
 * Validates that overdue members cannot borrow beyond limit
 */
function validateOverdueBorrowLimit(
  accountStatus: AccountStatus,
  currentBorrowedAmount: number,
  newBorrowAmount: number,
): void {
  if (accountStatus === ACCOUNT_STATUS.OVERDUE) {
    const totalWouldBe = currentBorrowedAmount + newBorrowAmount;
    if (totalWouldBe > BUSINESS_RULES.MAX_OVERDUE_BORROW) {
      throw new Error(
        `Overdue members cannot borrow more than ${formatCurrency(BUSINESS_RULES.MAX_OVERDUE_BORROW)}. Current: ${formatCurrency(currentBorrowedAmount)}`,
      );
    }
  }
}

/**
 * Validates that payment amount doesn't exceed outstanding balance
 */
function validatePaymentAmount(
  paymentType: PaymentType,
  amount: number,
  outstanding: number,
  accountDetails: string,
): void {
  if (amount > outstanding) {
    throw new Error(
      `Payment amount (${formatCurrency(amount)}) exceeds outstanding ${paymentType} balance (${formatCurrency(outstanding)}) for ${accountDetails}`,
    );
  }
}

/**
 * Validates that an outstanding balance exists for payment type
 */
function validateOutstandingBalance(
  paymentType: PaymentType,
  outstanding: number,
  accountDetails: string,
): void {
  if (outstanding === 0) {
    throw new Error(
      `No outstanding ${paymentType} to process for ${accountDetails}`,
    );
  }
}

async function applyPayment(
  ctx: any,
  args: {
    account: any;
    userId: Id<"users">;
    amount: number;
    paymentType: (typeof PAYMENT_TYPE)[keyof typeof PAYMENT_TYPE];
    description?: string;
    authUser: any;
    userDetails: any;
  },
  isInstant = false,
) {
  const {
    account,
    userId,
    amount,
    paymentType,
    description,
    authUser,
    userDetails,
  } = args;

  const updatedAccount = await getAccountByUserIdOrThrow(ctx, userId);

  const outstandingByType = {
    [PAYMENT_TYPE.FINE_PAYMENT]: updatedAccount.fineToBalance,
    [PAYMENT_TYPE.BORROW_PAYMENT]: updatedAccount.borrowedAmountToBalance,
    [PAYMENT_TYPE.DUE_PAYMENT]: updatedAccount.duesToBalance,
  };

  validateOutstandingBalance(
    paymentType,
    outstandingByType[paymentType],
    `${userDetails?.firstName} ${userDetails?.lastName}`,
  );

  validatePaymentAmount(
    paymentType,
    amount,
    outstandingByType[paymentType],
    `${userDetails?.firstName} ${userDetails?.lastName}`,
  );

  let newBorrowed = updatedAccount.currentBorrowedAmount;
  let newFine = updatedAccount.currentFineAmount;
  let newDues = updatedAccount.currentDuesAmount;

  let newBorrowedToBalance = updatedAccount.borrowedAmountToBalance;
  let newFineToBalance = updatedAccount.fineToBalance;
  let newDuesToBalance = updatedAccount.duesToBalance;

  switch (paymentType) {
    case PAYMENT_TYPE.BORROW_PAYMENT:
      newBorrowed = Math.max(0, updatedAccount.currentBorrowedAmount - amount);
      newBorrowedToBalance = Math.max(
        0,
        updatedAccount.borrowedAmountToBalance - amount,
      );
      break;

    case PAYMENT_TYPE.FINE_PAYMENT:
      newFine = Math.max(0, updatedAccount.currentFineAmount - amount);
      newFineToBalance = Math.max(0, updatedAccount.fineToBalance - amount);
      break;

    case PAYMENT_TYPE.DUE_PAYMENT:
      newDues = Math.max(0, updatedAccount.currentDuesAmount - amount);
      newDuesToBalance = Math.max(0, updatedAccount.duesToBalance - amount);
      break;
  }

  const newStatus = calculateAccountStatus(
    newBorrowed,
    newFine,
    newDues,
    updatedAccount.dueDate,
  );

  await ctx.db.patch(updatedAccount._id, {
    currentBorrowedAmount: newBorrowed,
    currentFineAmount: newFine,
    currentDuesAmount: newDues,
    borrowedAmountToBalance: newBorrowedToBalance,
    fineToBalance: newFineToBalance,
    duesToBalance: newDuesToBalance,
    status: newStatus,
    paymentHistory: [
      ...updatedAccount.paymentHistory,
      {
        type: paymentType,
        amount,
        date: Date.now(),
        description: description ?? `${paymentType} payment`,
      },
    ],
  });

  const treasury = await getTreasury(ctx);
  let outstandingBorrow = treasury.totalOutStandingBorrow;
  let outstandingFine = treasury.totalOutStandingFine;
  let outstandingDues = treasury.totalOutStandingDues;

  switch (paymentType) {
    case PAYMENT_TYPE.BORROW_PAYMENT:
      outstandingBorrow = Math.max(0, outstandingBorrow - amount);
      break;
    case PAYMENT_TYPE.FINE_PAYMENT:
      outstandingFine = Math.max(0, outstandingFine - amount);
      break;
    case PAYMENT_TYPE.DUE_PAYMENT:
      outstandingDues = Math.max(0, outstandingDues - amount);
      break;
  }

  const prevStatus = account.status;
  const owingMemberDelta =
    !isInstant &&
    prevStatus !== ACCOUNT_STATUS.GOOD_STANDING &&
    newStatus === ACCOUNT_STATUS.GOOD_STANDING
      ? -1
      : 0;

  await ctx.db.patch(treasury._id, {
    moneyAtHand: treasury.moneyAtHand + amount,
    totalOutStandingBorrow: outstandingBorrow,
    totalOutStandingFine: outstandingFine,
    totalOutStandingDues: outstandingDues,
    noOfOwingMembers: Math.max(0, treasury.noOfOwingMembers + owingMemberDelta),
  });

  await logActivity(
    ctx,
    userId,
    authUser,
    "record_payment",
    `Auto payment of ${formatCurrency(amount)} (${paymentType}) for ${userDetails?.firstName}`,
    {
      paymentType,
      amount,
      user: userDetails?.firstName,
    },
  );
}

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Retrieves account details for a specific user including user information
 * Requires authentication but not role-based access
 */
export const getAccountByUserId = query({
  args: { userId: v.id("users"), authEmail: v.string() },
  handler: async (ctx, args) => {
    await getCurrentUser(args.authEmail, ctx);
    const user = await ctx.db.get(args.userId);
    const account = await getAccountByUserIdOrThrow(ctx, args.userId);

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

/**
 * Retrieves all accounts with optional filtering and pagination
 * Restricted to admin and treasurer roles
 */
export const getAllAccounts = query({
  args: {
    status: v.optional(
      v.union(
        v.literal(ACCOUNT_STATUS.GOOD_STANDING),
        v.literal(ACCOUNT_STATUS.OWING),
        v.literal(ACCOUNT_STATUS.OVERDUE),
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
    if (!hasAccess)
      throw new Error(
        "Unauthorized: Only admin and treasurer can view all accounts",
      );

    // Build query based on filter type
    let query;
    if (args.search) {
      query = ctx.db
        .query("accounts")
        .withSearchIndex("search_history", (q: any) =>
          q.search("searchField", args.search!),
        );
    } else if (args.status) {
      query = ctx.db
        .query("accounts")
        .withIndex("by_status", (q: any) => q.eq("status", args.status!));
    } else {
      query = ctx.db.query("accounts");
    }

    const page = await query.paginate(args.paginationOpts);

    // Enrich accounts with user details
    const enriched = await Promise.all(
      page.page.map(async (account: any) => {
        const user = await ctx.db.get(account.userId);
        return {
          ...account,
          user: user
            ? {
                name: `${(user as any).firstName} ${(user as any).lastName}`,
                email: (user as any).email,
                phone: (user as any).phone,
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

/**
 * Retrieves treasury statistics including total balances and member counts
 * Restricted to admin and treasurer roles
 */
export const getAccountStats = query({
  args: { authEmail: v.string() },
  handler: async (ctx, args) => {
    await getCurrentUser(args.authEmail, ctx);
    return await getTreasury(ctx);
  },
});

// ============================================================================
// MUTATIONS - FINANCIAL TRANSACTIONS
// ============================================================================

/**
 * Records a borrow transaction for a member
 *
 * Business Rules:
 * - Only admin/treasurer can record borrows
 * - Treasury must have sufficient funds
 * - Overdue members cannot borrow beyond MAX_OVERDUE_BORROW limit
 * - Due date in past automatically sets status to OVERDUE
 */
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
      throw new Error(
        "Unauthorized: Only admin and treasurer can record borrows",
      );
    }

    const account = await getAccountByUserIdOrThrow(ctx, args.userId);
    const user = await ctx.db.get(args.userId);
    const treasury = await getTreasury(ctx);

    // Validate treasury has funds
    validateSufficientTreasuryFunds(treasury.moneyAtHand, args.amount);

    // Validate overdue borrow limit
    validateOverdueBorrowLimit(
      account.status as AccountStatus,
      account.currentBorrowedAmount,
      args.amount,
    );

    const borrowPlusInterest = args.amount * 1.1 // 10% INTEREST

    // Calculate new amounts
    const newBorrowedAmount =
      account.currentBorrowedAmount + borrowPlusInterest;
    const newStatus = calculateAccountStatus(
      newBorrowedAmount,
      account.currentFineAmount,
      account.currentDuesAmount,
      args.dueDate < Date.now() ? args.dueDate : account.dueDate,
    );

    // Update account with borrow record
    await ctx.db.patch(account._id, {
      currentBorrowedAmount: newBorrowedAmount,
      borrowedAmountToBalance:
        account.borrowedAmountToBalance + borrowPlusInterest,
      totalBorrowedAmount: account.totalBorrowedAmount + args.amount,
      dueDate: args.dueDate,
      status: newStatus,
      paymentHistory: [
        ...account.paymentHistory,
        {
          type: "borrow",
          amount: borrowPlusInterest,
          date: Date.now(),
          description: args.description ?? "Borrowed amount and 10% interest",
          dueDate: args.dueDate,
        },
      ],
    });

    // Update treasury
    const prevStatus = account.status;
    const owingMemberDelta =
      prevStatus === ACCOUNT_STATUS.GOOD_STANDING &&
      newStatus !== ACCOUNT_STATUS.GOOD_STANDING
        ? 1
        : 0;

    await ctx.db.patch(treasury._id, {
      totalBorrowed: treasury.totalBorrowed + borrowPlusInterest,
      totalOutStandingBorrow:
        treasury.totalOutStandingBorrow + borrowPlusInterest,
      noOfOwingMembers: treasury.noOfOwingMembers + owingMemberDelta,
      moneyAtHand: treasury.moneyAtHand - args.amount,
    });

    // Log activity
    await logActivity(
      ctx,
      args.userId,
      authUser,
      "record_borrow",
      `Recorded borrow of ${formatCurrency(args.amount)} for ${(user as any)?.firstName}`,
      {
        amount: args.amount,
        dueDate: args.dueDate,
        user: (user as any)?.firstName,
      },
    );

    return account._id;
  },
});

/**
 * Records a payment for an outstanding balance (fine, borrowed amount, or dues)
 *
 * Business Rules:
 * - Payment amount cannot exceed outstanding balance
 * - Account status is recalculated after payment
 * - If all outstanding amounts are cleared, status returns to GOOD_STANDING
 * - Treasury and member counts are updated accordingly
 */
export const recordPayment = mutation({
  args: {
    userId: v.id("users"),
    amount: v.number(),
    description: v.optional(v.string()),
    authEmail: v.string(),
    paymentType: v.union(
      v.literal(PAYMENT_TYPE.FINE_PAYMENT),
      v.literal(PAYMENT_TYPE.BORROW_PAYMENT),
      v.literal(PAYMENT_TYPE.DUE_PAYMENT),
    ),
  },
  handler: async (ctx, args) => {
    const authUser = await getCurrentUser(args.authEmail, ctx);
    const hasAccess = await hasPermission(
      ctx,
      ["admin", "treasurer"],
      args.authEmail,
    );
    if (!hasAccess) {
      throw new Error(
        "Unauthorized: Only admin and treasurer can record payments",
      );
    }

    const account = await getAccountByUserIdOrThrow(ctx, args.userId);
    const user = await ctx.db.get(args.userId);
    await applyPayment(ctx, {
      account,
      userId: args.userId,
      amount: args.amount,
      paymentType: args.paymentType,
      description: args.description,
      authUser,
      userDetails: user,
    });
    return account._id;
  },
});

/**
 * Records a fine (penalty) against a member's account
 *
 * Business Rules:
 * - Only admin/treasurer can record fines
 * - Automatically sets account status to OWING
 * - Updates treasury fine totals and member count if member was in good standing
 */
export const recordFine = mutation({
  args: {
    userId: v.id("users"),
    amount: v.number(),
    reason: v.string(),
    authEmail: v.string(),
    payNow: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const authUser = await getCurrentUser(args.authEmail, ctx);
    const hasAccess = await hasPermission(
      ctx,
      ["admin", "treasurer"],
      args.authEmail,
    );
    if (!hasAccess) {
      throw new Error(
        "Unauthorized: Only admin and treasurer can record fines",
      );
    }

    const account = await getAccountByUserIdOrThrow(ctx, args.userId);
    const user = await ctx.db.get(args.userId);
    const userDetails = user as any;
    const prevStatus = account.status;

    // Update account with fine
    await ctx.db.patch(account._id, {
      currentFineAmount: account.currentFineAmount + args.amount,
      fineToBalance: account.fineToBalance + args.amount,
      totalFineAmount: account.totalFineAmount + args.amount,
      status: ACCOUNT_STATUS.OWING,
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

    // Update treasury
    const treasury = await getTreasury(ctx);
    const owingMemberDelta =
      !args?.payNow && prevStatus === ACCOUNT_STATUS.GOOD_STANDING ? 1 : 0;

    await ctx.db.patch(treasury._id, {
      totalFines: treasury.totalFines + args.amount,
      totalOutStandingFine: treasury.totalOutStandingFine + args.amount,
      noOfOwingMembers: treasury.noOfOwingMembers + owingMemberDelta,
    });

    // Log activity
    await logActivity(
      ctx,
      args.userId,
      authUser,
      "record_fine",
      `Recorded fine of ${formatCurrency(args.amount)} for ${userDetails?.firstName} for reason: ${args.reason}`,
      {
        amount: args.amount,
        reason: args.reason,
        user: userDetails?.firstName,
      },
    );

    if (args.payNow) {
      await applyPayment(
        ctx,
        {
          account,
          userId: args.userId,
          amount: args.amount,
          paymentType: PAYMENT_TYPE.FINE_PAYMENT,
          description: `Immediate fine payment`,
          authUser,
          userDetails,
        },
        true,
      );
    }

    return account._id;
  },
});

/**
 * Records membership dues for a member
 *
 * Business Rules:
 * - Only admin/treasurer can record dues
 * - Due date in past automatically sets status to OVERDUE
 * - Updates treasury dues totals and member count if member was in good standing
 */
export const recordDue = mutation({
  args: {
    userId: v.id("users"),
    amount: v.number(),
    dueDate: v.number(),
    description: v.optional(v.string()),
    authEmail: v.string(),
    payNow: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const authUser = await getCurrentUser(args.authEmail, ctx);
    const hasAccess = await hasPermission(
      ctx,
      ["admin", "treasurer"],
      args.authEmail,
    );
    if (!hasAccess) {
      throw new Error("Unauthorized: Only admin and treasurer can record dues");
    }

    const account = await getAccountByUserIdOrThrow(ctx, args.userId);
    const user = await ctx.db.get(args.userId);
    const userDetails = user as any;
    const prevStatus = account.status;

    const currentDuesAmount = account.currentDuesAmount + args.amount;
    const newStatus = calculateAccountStatus(
      account.currentBorrowedAmount,
      account.currentFineAmount,
      currentDuesAmount,
      args.dueDate < Date.now() ? args.dueDate : account.dueDate,
    );

    // Update account with dues
    await ctx.db.patch(account._id, {
      currentDuesAmount,
      duesToBalance: account.duesToBalance + args.amount,
      totalDuesAmount: account.totalDuesAmount + args.amount,
      dueDate: args.dueDate,
      status: newStatus,
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

    // Update treasury
    const treasury = await getTreasury(ctx);
    const owingMemberDelta =
      prevStatus === ACCOUNT_STATUS.GOOD_STANDING &&
      newStatus !== ACCOUNT_STATUS.GOOD_STANDING &&
      !args?.payNow
        ? 1
        : 0;

    await ctx.db.patch(treasury._id, {
      totalDues: treasury.totalDues + args.amount,
      totalOutStandingDues: treasury.totalOutStandingDues + args.amount,
      noOfOwingMembers: treasury.noOfOwingMembers + owingMemberDelta,
    });

    // Log activity
    await logActivity(
      ctx,
      args.userId,
      authUser,
      "record_due",
      `Recorded dues of ${formatCurrency(args.amount)} for ${userDetails?.firstName}`,
      {
        amount: args.amount,
        dueDate: args.dueDate,
        user: userDetails?.firstName,
      },
    );

    if (args?.payNow) {
      await applyPayment(
        ctx,
        {
          account,
          userId: args.userId,
          amount: args.amount,
          paymentType: PAYMENT_TYPE.DUE_PAYMENT,
          description: args.description ?? "Immediate due payment",
          authUser,
          userDetails,
        },
        true,
      );
    }

    return account._id;
  },
});

/**
 * Manually updates account status to a specific state
 *
 * Use Cases:
 * - Manual corrections for system state issues
 * - Admin overrides for specific situations
 */
export const updateAccountStatus = mutation({
  args: {
    accountId: v.id("accounts"),
    status: v.union(
      v.literal(ACCOUNT_STATUS.GOOD_STANDING),
      v.literal(ACCOUNT_STATUS.OWING),
      v.literal(ACCOUNT_STATUS.OVERDUE),
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
      throw new Error(
        "Unauthorized: Only admin and treasurer can update account status",
      );
    }

    const account = await ctx.db.get(args.accountId);
    if (!account) {
      throw new Error(`Account not found: ${args.accountId}`);
    }

    const user = await ctx.db.get(account.userId);
    const userDetails = user as any;
    const prevStatus = account.status;

    // Update account status
    await ctx.db.patch(args.accountId, { status: args.status });

    // Log activity
    await logActivity(
      ctx,
      account.userId,
      authUser,
      "update_status",
      `Updated payment status for ${userDetails?.firstName} from ${prevStatus} to ${args.status}`,
      {
        oldStatus: prevStatus,
        newStatus: args.status,
        user: userDetails?.firstName,
      },
    );

    return args.accountId;
  },
});

/**
 * Deletes an account and its associated data
 *
 * Warning: This is a destructive operation that removes all financial records
 */
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
      throw new Error(
        "Unauthorized: Only admin and treasurer can delete accounts",
      );
    }

    const account = await ctx.db.get(args.accountId);
    if (!account) {
      throw new Error(`Account not found: ${args.accountId}`);
    }

    const user = await ctx.db.get(account.userId);
    const userDetails = user as any;

    // Delete account
    await ctx.db.delete(args.accountId);

    // Log activity
    await logActivity(
      ctx,
      account.userId,
      authUser,
      "delete_account",
      `Deleted account for ${userDetails?.firstName} ${userDetails?.lastName}`,
      {
        user: userDetails?.firstName,
      },
    );

    return args.accountId;
  },
});

/**
 * Checks and updates all overdue accounts
 *
 * Scheduled Operation:
 * - Run periodically (e.g., daily cron job)
 * - Converts OWING accounts to OVERDUE if due date has passed
 * - Updates treasury member count statistics
 */
export const updateOverdueAccounts = mutation({
  handler: async (ctx) => {
    const now = Date.now();
    const owingAccounts = await ctx.db
      .query("accounts")
      .withIndex("by_status", (q: any) => q.eq("status", ACCOUNT_STATUS.OWING))
      .collect();

    let updatedCount = 0;

    // Update each overdue account
    for (const account of owingAccounts) {
      if (account.dueDate && account.dueDate < now) {
        await ctx.db.patch(account._id, {
          status: ACCOUNT_STATUS.OVERDUE,
        });
        updatedCount++;
      }
    }

    // Update treasury statistics
    if (updatedCount > 0) {
      const treasury = await getTreasury(ctx);
      await ctx.db.patch(treasury._id, {
        noOfOverdueMembers: treasury.noOfOverdueMembers + updatedCount,
        noOfOwingMembers: Math.max(0, treasury.noOfOwingMembers - updatedCount),
      });
    }

    return { updated: updatedCount };
  },
});

/**
 * Initializes the treasury record (called once during system setup)
 *
 * Treasury tracks aggregate financial metrics:
 * - Total money in hand vs. outstanding obligations
 * - Member financial standing distribution
 * - Used for dashboard statistics and financial planning
 */
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
