import { GenericQueryCtx, GenericMutationCtx } from "convex/server";
import { DataModel, Id } from "@/convex/_generated/dataModel";

export async function getCurrentUser(
  email: string,
  ctx: GenericQueryCtx<DataModel> | GenericMutationCtx<DataModel>,
) {
  if (!email) throw new Error("Unauthorized");
  const user = await ctx.db
    .query("users")
    .withIndex("by_email", (q) => q.eq("email", email!))
    .unique();

  if (!user) throw new Error("User not logged in or does not exist");

  return user;
}

export async function hasPermission(
  ctx: GenericQueryCtx<DataModel> | GenericMutationCtx<DataModel>,
  role: string | string[],
  email: string,
): Promise<boolean> {
  try {
    const user = await getCurrentUser(email, ctx);
    if (!user) return false;

    if (user.role === "admin") return true;

    if (Array.isArray(role)) {
      return role.includes(user.role);
    }

    return user.role === role;
  } catch {
    return false;
  }
}

export function buildSearchText(fields: string[]): string {
  return fields
    .map((field) => field.toLowerCase().trim())
    .join(" ")
    .toLowerCase();
}

// Notification helper functions
export async function notifyUser(
  ctx: GenericMutationCtx<DataModel>,
  params: {
    userId: Id<"users">;
    title: string;
    message: string;
    type: "member" | "event" | "payment" | "profile" | "system";
    relatedId?: string;
    actionUrl?: string;
  },
) {
  await ctx.db.insert("notifications", {
    userId: params.userId,
    title: params.title,
    message: params.message,
    type: params.type,
    relatedId: params.relatedId,
    actionUrl: params.actionUrl,
    read: false,
    createdAt: Date.now(),
  });
}

export async function notifyAllMembers(
  ctx: GenericMutationCtx<DataModel>,
  params: {
    title: string;
    message: string;
    type: "member" | "event" | "payment" | "profile" | "system";
    relatedId?: string;
    actionUrl?: string;
    excludeUserId?: Id<"users">;
  },
) {
  const users = await ctx.db
    .query("users")
    .withIndex("by_status", (q) => q.eq("status", "active"))
    .collect();

  const notifications = users
    .filter(
      (user) => !params.excludeUserId || user._id !== params.excludeUserId,
    )
    .map((user) => ({
      userId: user._id,
      title: params.title,
      message: params.message,
      type: params.type,
      relatedId: params.relatedId,
      actionUrl: params.actionUrl,
      read: false,
      createdAt: Date.now(),
    }));

  await Promise.all(
    notifications.map((notification) =>
      ctx.db.insert("notifications", notification),
    ),
  );
}
