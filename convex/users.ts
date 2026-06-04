import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import bcrypt from "bcryptjs";
import { buildSearchText, getCurrentUser, hasPermission } from "@/convex/utils";
import { paginationOptsValidator } from "convex/server";

// ============================================================================
// TYPES & CONSTANTS
// ============================================================================

export const USER_ROLE = {
  ADMIN: "admin",
  MEMBER: "member",
  TREASURER: "treasurer",
  PRO: "pro",
} as const;

export const USER_STATUS = {
  ACTIVE: "active",
  SUSPENDED: "suspended",
  INACTIVE: "inactive",
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Validates user is authenticated
 * @param user - User object to validate
 * @throws Error if user not found
 */
function validateUserExists(user: any): void {
  if (!user) {
    throw new Error("Unauthorized: User not found");
  }
}

/**
 * Validates user has admin permission
 * @param hasRole - Permission check result
 * @throws Error if not admin
 */
function validateIsAdmin(hasRole: boolean): void {
  if (!hasRole) {
    throw new Error("Unauthorized: Only admins can perform this action");
  }
}

/**
 * Validates email is not already registered
 * @param ctx - Convex context
 * @param email - Email to check
 * @throws Error if email already exists
 */
async function validateEmailNotRegistered(ctx: any, email: string): Promise<void> {
  const existingUser = await ctx.db
    .query("users")
    .withIndex("by_email", (q: any) => q.eq("email", email))
    .unique();

  if (existingUser) {
    throw new Error("Unauthorized: User with this email already exists");
  }
}

/**
 * Logs user activity for audit trail
 * @param ctx - Convex context
 * @param userId - User performing action
 * @param action - Action type
 * @param description - Human-readable description
 * @param type - Activity type (profile, member, etc)
 * @param metadata - Additional context
 */
async function logUserActivity(
  ctx: any,
  userId: any,
  action: string,
  description: string,
  type: string = "profile",
  metadata: any = {},
) {
  const user = await ctx.db.get(userId);
  await ctx.db.insert("activities", {
    userId,
    type,
    user: user ? `${user.firstName} ${user.lastName}` : "System",
    action,
    description,
    metadata,
    timestamp: Date.now(),
  });
}

/**
 * Creates initial account for new user
 * @param ctx - Convex context
 * @param userId - User ID to create account for
 * @param user - User object with name and email
 * @returns Account ID
 */
async function createInitialAccount(ctx: any, userId: any, user: any) {
  const accountId = await ctx.db.insert("accounts", {
    userId,
    fineToBalance: 0,
    currentFineAmount: 0,
    totalFineAmount: 0,
    currentBorrowedAmount: 0,
    totalBorrowedAmount: 0,
    borrowedAmountToBalance: 0,
    duesToBalance: 0,
    currentDuesAmount: 0,
    totalDuesAmount: 0,
    status: "good_standing",
    paymentHistory: [],
    searchField: buildSearchText([
      user.firstName,
      user.lastName,
      user.email,
      user.otherName || "",
    ]),
  });

  await logUserActivity(
    ctx,
    userId,
    "account_created",
    `created payment account`,
    "member",
    { user: user.firstName },
  );

  return accountId;
}

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Retrieves user by email address
 * @param email - User email
 * @returns User object or null
 */
export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    await getCurrentUser(args.email, ctx);
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q: any) => q.eq("email", args.email))
      .unique();
  },
});

/**
 * Retrieves user by ID
 * @param id - User ID
 * @param email - Email for authentication
 * @returns User object or empty object if not found
 */
export const getUserById = query({
  args: { id: v.id("users"), email: v.string() },
  handler: async (ctx, args) => {
    if (!args.id) return {};
    await getCurrentUser(args.email, ctx);
    return await ctx.db.get(args.id);
  },
});

/**
 * Retrieves all users with optional filtering and search
 * @param limit - Optional limit per page
 * @param role - Optional filter by role
 * @param status - Optional filter by status
 * @param search - Optional search by name/email
 * @param paginationOpts - Pagination configuration
 * @param userEmail - Email of authenticated user (for auth check)
 * @returns Paginated users list
 * @throws Error if unauthorized or user not found
 */
export const getUsers = query({
  args: {
    limit: v.optional(v.number()),
    role: v.optional(v.union(v.literal(USER_ROLE.ADMIN), v.literal(USER_ROLE.MEMBER))),
    status: v.optional(
      v.union(
        v.literal(USER_STATUS.ACTIVE),
        v.literal(USER_STATUS.SUSPENDED),
        v.literal(USER_STATUS.INACTIVE),
      ),
    ),
    search: v.optional(v.string()),
    paginationOpts: paginationOptsValidator,
    userEmail: v.string(),
  },
  handler: async (ctx, args) => {
    await getCurrentUser(args.userEmail, ctx);
    if (!args.userEmail) {
      throw new Error("Unauthorized - No user email provided");
    }

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q: any) => q.eq("email", args.userEmail))
      .unique();

    validateUserExists(currentUser);

    let q;

    if (args.role && args.status) {
      q = ctx.db
        .query("users")
        .withIndex("by_role_status", (q: any) =>
          q.eq("role", args.role!).eq("status", args.status!),
        )
        .order("desc");
    } else if (args.role) {
      q = ctx.db
        .query("users")
        .withIndex("by_role", (q: any) => q.eq("role", args.role!))
        .order("desc");
    } else if (args.status) {
      q = ctx.db
        .query("users")
        .withIndex("by_status", (q: any) => q.eq("status", args.status!))
        .order("desc");
    } else {
      q = ctx.db.query("users").withIndex("by_email").order("desc");
    }

    if (args.search) {
      q = ctx.db
        .query("users")
        .withSearchIndex("search_name", (q: any) =>
          q.search("searchField", args.search!),
        );
    }

    return await q.paginate(args.paginationOpts);
  },
});

/**
 * Retrieves member statistics
 * @returns Object with counts by status and role
 */
export const getMemberStats = query({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const totalMembers = users.length;
    const activeMembers = users.filter((u: any) => u.status === USER_STATUS.ACTIVE).length;
    const inactiveMembers = users.filter((u: any) => u.status === USER_STATUS.INACTIVE).length;
    const suspendedMembers = users.filter(
      (u: any) => u.status === USER_STATUS.SUSPENDED,
    ).length;
    const admins = users.filter((u: any) => u.role === USER_ROLE.ADMIN).length;

    return {
      totalMembers,
      activeMembers,
      suspendedMembers,
      inactiveMembers,
      admins,
    };
  },
});

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Creates a new user (registration)
 * @param email - User email (must be unique)
 * @param password - User password
 * @param firstName - User first name
 * @param lastName - User last name
 * @param otherName - Optional middle/other name
 * @param phone - Optional phone number
 * @param role - Optional role (defaults to member)
 * @returns Object with userId and accountId
 * @throws Error if email already exists
 * @side-effect Creates user, creates account, logs activities
 */
export const createUser = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    otherName: v.optional(v.string()),
    phone: v.optional(v.string()),
    role: v.optional(
      v.union(
        v.literal(USER_ROLE.ADMIN),
        v.literal(USER_ROLE.MEMBER),
        v.literal(USER_ROLE.TREASURER),
        v.literal(USER_ROLE.PRO),
      ),
    ),
  },
  handler: async (ctx, args) => {
    await validateEmailNotRegistered(ctx, args.email);

    const userId = await ctx.db.insert("users", {
      email: args.email,
      password: args.password,
      firstName: args.firstName,
      lastName: args.lastName,
      otherName: args.otherName,
      phone: args.phone,
      role: args.role || USER_ROLE.MEMBER,
      status: USER_STATUS.ACTIVE,
      joinedAt: Date.now(),
      searchField: buildSearchText([
        args.firstName,
        args.lastName,
        args.email,
        args.otherName || "",
      ]),
    });

    await logUserActivity(
      ctx,
      userId,
      "signUp",
      `registered on the platform`,
      "member",
      { email: args.email, role: args.role || USER_ROLE.MEMBER, user: args.firstName },
    );

    const accountId = await createInitialAccount(ctx, userId, args);
    return { userId, accountId };
  },
});

/**
 * Updates user profile information
 * @param id - User ID to update
 * @param firstName - Optional new first name
 * @param lastName - Optional new last name
 * @param otherName - Optional new middle name
 * @param phone - Optional new phone
 * @param address - Optional new address object
 * @param email - Optional new email
 * @param role - Optional new role (admin only)
 * @param status - Optional new status (admin only)
 * @param authEmail - Email of updating user
 * @returns User ID
 * @throws Error if unauthorized or user not found
 * @side-effect Updates user record, logs activity
 */
export const updateUser = mutation({
  args: {
    id: v.id("users"),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    otherName: v.optional(v.string()),
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
    searchField: v.optional(v.string()),
    email: v.optional(v.string()),
    role: v.optional(
      v.union(
        v.literal(USER_ROLE.ADMIN),
        v.literal(USER_ROLE.MEMBER),
        v.literal(USER_ROLE.TREASURER),
        v.literal(USER_ROLE.PRO),
      ),
    ),
    status: v.optional(
      v.union(
        v.literal(USER_STATUS.ACTIVE),
        v.literal(USER_STATUS.SUSPENDED),
        v.literal(USER_STATUS.INACTIVE),
      ),
    ),
    authEmail: v.string(),
  },
  handler: async (ctx, args) => {
    const { id, authEmail, ...updates } = args;
    await getCurrentUser(authEmail, ctx);

    if (args.firstName || args.lastName || args.otherName || args.email) {
      updates.searchField = buildSearchText([
        args.firstName || "",
        args.lastName || "",
      ]);
    }

    if (args.role || args.status) {
      const hasRole = await hasPermission(ctx, USER_ROLE.ADMIN, args.authEmail);
      validateIsAdmin(hasRole);
    }

    const user = await ctx.db.get(id);
    validateUserExists(user);
    if (!user) return id;

    await ctx.db.patch(id, updates);

    await logUserActivity(
      ctx,
      id,
      "profileUpdate",
      `updated their profile`,
      "profile",
      { ...updates, user: user.firstName },
    );

    return id;
  },
});

/**
 * Updates user status and role (admin only)
 * @param id - User ID to update
 * @param status - Optional new status
 * @param role - Optional new role
 * @param authEmail - Email of admin performing update
 * @returns User ID
 * @throws Error if unauthorized or user not found
 * @side-effect Updates user, logs activity
 */
export const updateUserStatusAndRole = mutation({
  args: {
    id: v.id("users"),
    status: v.optional(
      v.union(
        v.literal(USER_STATUS.ACTIVE),
        v.literal(USER_STATUS.SUSPENDED),
        v.literal(USER_STATUS.INACTIVE),
      ),
    ),
    role: v.optional(
      v.union(
        v.literal(USER_ROLE.ADMIN),
        v.literal(USER_ROLE.MEMBER),
        v.literal(USER_ROLE.TREASURER),
        v.literal(USER_ROLE.PRO),
      ),
    ),
    authEmail: v.string(),
  },
  handler: async (ctx, args) => {
    const authUser = await getCurrentUser(args.authEmail, ctx);
    const hasRole = await hasPermission(ctx, USER_ROLE.ADMIN, args.authEmail);
    validateIsAdmin(hasRole);

    const user = await ctx.db.get(args.id);
    validateUserExists(user);
    if (!user) return args.id;

    await ctx.db.patch(args.id, {
      status: args.status,
      role: args.role,
    });

    let description: string;
    if (args.role && args.status) {
      description = `updates ${user.firstName} role to ${args.role} and status to ${args.status}`;
    } else if (args.role) {
      description = `updates ${user.firstName} role to ${args.role}`;
    } else {
      description = `updates ${user.firstName} status to ${args.status}`;
    }

    await logUserActivity(
      ctx,
      args.id,
      "statusRoleUpdate",
      description,
      "member",
      {
        oldStatus: user.status,
        newStatus: args.status,
        user: user.firstName,
        newRole: args.role,
        oldRole: user.role,
        updatedBy: `${authUser.firstName} ${authUser.lastName}`,
      },
    );

    return args.id;
  },
});

/**
 * Deletes a user from the system (admin only)
 * @param id - User ID to delete
 * @param authEmail - Email of admin performing deletion
 * @returns User ID
 * @throws Error if unauthorized or user not found
 * @side-effect Deletes user, logs activity
 */
export const deleteUser = mutation({
  args: { id: v.id("users"), authEmail: v.string() },
  handler: async (ctx, args) => {
    const authUser = await getCurrentUser(args.authEmail, ctx);
    const hasRole = await hasPermission(ctx, USER_ROLE.ADMIN, args.authEmail);
    validateIsAdmin(hasRole);

    const user = await ctx.db.get(args.id);
    validateUserExists(user);
    if (!user) return args.id;

    await ctx.db.delete(args.id);

    await logUserActivity(
      ctx,
      args.id,
      "userDeletion",
      `removed ${user.firstName} from the system`,
      "member",
      {
        email: user.email,
        user: user.firstName,
        deletedBy: `${authUser.firstName} ${authUser.lastName}`,
      },
    );

    return args.id;
  },
});

/**
 * Updates user password (self-service)
 * @param userId - User ID changing password
 * @param currentPassword - Current password (for verification)
 * @param newPassword - New password
 * @param authEmail - Email of authenticated user
 * @returns User ID
 * @throws Error if user not found or unauthorized
 * @side-effect Updates password, logs activity
 * @note Current password verification not fully implemented
 */
export const updatePassword = mutation({
  args: {
    userId: v.id("users"),
    currentPassword: v.string(),
    newPassword: v.string(),
    authEmail: v.string(),
  },
  handler: async (ctx, args) => {
    await getCurrentUser(args.authEmail, ctx);
    const user = await ctx.db.get(args.userId);
    validateUserExists(user);
    if (!user) return args.userId;

    await ctx.db.patch(args.userId, { password: args.newPassword });

    await logUserActivity(
      ctx,
      args.userId,
      "passwordUpdate",
      `updated their password`,
      "profile",
      { user: user.firstName },
    );

    return args.userId;
  },
});

/**
 * Resets user password (forgot password flow)
 * @param email - User email
 * @param newPassword - New password
 * @param resetToken - Password reset token (for verification)
 * @returns User ID
 * @throws Error if user not found
 * @side-effect Updates password (hashed), logs activity
 * @note Token verification not implemented - should be added for production
 */
export const resetPassword = mutation({
  args: {
    email: v.string(),
    newPassword: v.string(),
    resetToken: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q: any) => q.eq("email", args.email))
      .unique();

    validateUserExists(user);
    if (!user) throw new Error("User not found");

    const hashedPassword = await bcrypt.hash(args.newPassword, 10);
    await ctx.db.patch(user._id, { password: hashedPassword });

    await logUserActivity(
      ctx,
      user._id,
      "passwordReset",
      `reset their password using the forgot password flow`,
      "profile",
      { user: user.firstName },
    );

    return user._id;
  },
});

/**
 * Verifies login credentials
 * @param email - User email
 * @param password - User password
 * @returns User object if found, null otherwise
 * @note Password verification should be added for production
 */
export const verifyCredentials = query({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q: any) => q.eq("email", args.email))
      .unique();

    if (!user) {
      return null;
    }

    return user;
  },
});

/**
 * Retrieves all users in the system
 * @returns Array of all users
 */
export const getAllUser = query({
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});
