import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import bcrypt from "bcryptjs";
import { buildSearchText, getCurrentUser, hasPermission } from "@/convex/utils";
import { paginationOptsValidator } from "convex/server";

// Get user by email
export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    //   await getCurrentUser(ctx);
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
  },
});

// Get user by ID
export const getUserById = query({
  args: { id: v.id("users"), email: v.string() },
  handler: async (ctx, args) => {
    await getCurrentUser(args.email, ctx);
    return await ctx.db.get(args.id);
  },
});

// Get all users (with pagination and filters)
export const getUsers = query({
  args: {
    limit: v.optional(v.number()),
    role: v.optional(v.union(v.literal("admin"), v.literal("member"))),
    status: v.optional(
      v.union(
        v.literal("active"),
        v.literal("suspended"),
        v.literal("inactive"),
      ),
    ),
    search: v.optional(v.string()),
    paginationOpts: paginationOptsValidator,
    userEmail: v.string(), // Pass from client to validate user
  },
  handler: async (ctx, args) => {
    // Validate user is authenticated by checking if the userEmail is provided
    await getCurrentUser(args.userEmail, ctx);
    if (!args.userEmail) {
      throw new Error("Unauthorized - No user email provided");
    }

    // Verify user exists
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.userEmail!))
      .unique();

    if (!currentUser) {
      throw new Error("Unauthorized - User not found");
    }

    // --- BASE QUERY ---
    let q;

    if (args.role && args.status) {
      q = ctx.db
        .query("users")
        .withIndex("by_role_status", (q) =>
          q.eq("role", args.role!).eq("status", args.status!),
        )
        .order("desc");
    } else if (args.role) {
      q = ctx.db
        .query("users")
        .withIndex("by_role", (q) => q.eq("role", args.role!))
        .order("desc");
    } else if (args.status) {
      q = ctx.db
        .query("users")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc");
    } else {
      q = ctx.db.query("users").withIndex("by_email").order("desc");
    }

    // --- SEARCH (secondary filter) ---
    if (args.search) {
      q = ctx.db
        .query("users")
        .withSearchIndex("search_name", (q) =>
          q.search("searchField", args.search!),
        );
    }

    // --- PAGINATE ---
    return await q.paginate(args.paginationOpts);
  },
});

// Get member statistics
export const getMemberStats = query({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const totalMembers = users.length;
    const activeMembers = users.filter((u) => u.status === "active").length;
    const suspendedMembers = users.filter(
      (u) => u.status === "suspended",
    ).length;
    const admins = users.filter((u) => u.role === "admin").length;

    return {
      totalMembers,
      activeMembers,
      suspendedMembers,
      admins,
    };
  },
});

// Create a user (registration)
export const createUser = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    otherName: v.optional(v.string()),
    phone: v.optional(v.string()),
    role: v.optional(v.union(v.literal("admin"), v.literal("member"))),
  },
  handler: async (ctx, args) => {
    // Check if a user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Create user
    const userId = await ctx.db.insert("users", {
      email: args.email,
      password: args.password,
      firstName: args.firstName,
      lastName: args.lastName,
      otherName: args.otherName,
      phone: args.phone,
      role: args.role || "member",
      status: "active",
      joinedAt: Date.now(),
      searchField: buildSearchText([
        args.firstName,
        args.lastName,
        args.email,
        args.otherName || "",
      ]),
    });

    // Create an activity log
    await ctx.db.insert("activities", {
      userId,
      type: "profile",
      description: `New user ${args.firstName} ${args.lastName} registered`,
      metadata: { email: args.email, role: args.role || "member" },
      timestamp: Date.now(),
    });

    return userId;
  },
});

// Update user
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
        v.literal("admin"),
        v.literal("member"),
        v.literal("treasurer"),
        v.literal("pro"),
      ),
    ),
    status: v.optional(
      v.union(
        v.literal("active"),
        v.literal("suspended"),
        v.literal("inactive"),
      ),
    ),
    authEmail: v.string(),
  },
  handler: async (ctx, args) => {
    await getCurrentUser(args.authEmail, ctx);
    const { id, ...updates } = args;

    if (args.firstName || args.lastName || args.otherName || args.email) {
      updates.searchField = buildSearchText([
        args.firstName || "",
        args.lastName || "",
      ]);
    }

    if (args.role || args.status) {
      const hasRole = hasPermission(ctx, "admin", args.authEmail);
      if (!hasRole) {
        throw new Error("Unauthorized to update role or status");
      }
    }

    const user = await ctx.db.get(id);
    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(id, updates);

    // Create an activity log
    await ctx.db.insert("activities", {
      userId: id,
      type: "profile",
      description: `User ${user.firstName} ${user.lastName} updated their profile`,
      metadata: updates,
      timestamp: Date.now(),
    });

    return id;
  },
});

// Update user status (suspend/activate)
export const updateUserStatus = mutation({
  args: {
    id: v.id("users"),
    status: v.union(
      v.literal("active"),
      v.literal("suspended"),
      v.literal("inactive"),
    ),
    authEmail: v.string(),
  },
  handler: async (ctx, args) => {
    const authUser = await getCurrentUser(args.authEmail, ctx);
    const hasRole = await hasPermission(ctx, "admin", args.authEmail);
    if (!hasRole) {
      throw new Error("Unauthorized to update user status");
    }
    const user = await ctx.db.get(args.id);
    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(args.id, { status: args.status });

    // Create an activity log
    await ctx.db.insert("activities", {
      userId: args.id,
      type: "profile",
      description: `${authUser?.firstName} updates ${user.firstName} status to ${args.status}`,
      metadata: { oldStatus: user.status, newStatus: args.status },
      timestamp: Date.now(),
    });

    return args.id;
  },
});

// Delete user
export const deleteUser = mutation({
  args: { id: v.id("users"), authEmail: v.string() },
  handler: async (ctx, args) => {
    const authUser = await getCurrentUser(args.authEmail, ctx);
    const hasRole = await hasPermission(ctx, "admin", args.authEmail);
    if (!hasRole) {
      throw new Error("Unauthorized to delete user");
    }
    const user = await ctx.db.get(args.id);
    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.delete(args.id);

    // Create an activity log
    await ctx.db.insert("activities", {
      userId: args.id,
      type: "profile",
      description: `${authUser?.firstName} removed ${user.firstName} from the system`,
      metadata: { email: user.email },
      timestamp: Date.now(),
    });

    return args.id;
  },
});

// Update password
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
    if (!user) {
      throw new Error("User not found");
    }

    // Verify the current password
    const isValid = await bcrypt.compare(args.currentPassword, user.password);
    if (!isValid) {
      throw new Error("Current password is incorrect");
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(args.newPassword, 10);

    await ctx.db.patch(args.userId, { password: hashedPassword });

    // Create an activity log
    await ctx.db.insert("activities", {
      userId: args.userId,
      type: "profile",
      description: `Password updated for ${user.firstName} ${user.lastName}`,
      metadata: {},
      timestamp: Date.now(),
    });

    return args.userId;
  },
});

// Reset password (for forgot password flow)
export const resetPassword = mutation({
  args: {
    email: v.string(),
    newPassword: v.string(),
    resetToken: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // In production, verify resetToken here
    // For now, we'll just update the password

    const hashedPassword = await bcrypt.hash(args.newPassword, 10);
    await ctx.db.patch(user._id, { password: hashedPassword });

    // Create an activity log
    await ctx.db.insert("activities", {
      userId: user._id,
      type: "profile",
      description: `Password reset for ${user.firstName} ${user.lastName}`,
      metadata: {},
      timestamp: Date.now(),
    });

    return user._id;
  },
});

// Verify login credentials
export const verifyCredentials = query({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (!user) {
      return null;
    }

    return user;
  },
});
