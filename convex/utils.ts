import { GenericQueryCtx } from "convex/server";
import { DataModel } from "@/convex/_generated/dataModel";

export async function getCurrentUser(ctx: GenericQueryCtx<DataModel>) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthorized");

  return await ctx.db
    .query("users")
    .withIndex("by_email", (q) => q.eq("email", identity.email!))
    .unique();
}

export async function hasPermission(
  ctx: GenericQueryCtx<DataModel>,
  role: string | string[],
): Promise<boolean> {
  const user = await getCurrentUser(ctx);
  if (!user) return false;

  if (user.role === "admin") return true;

  if (Array.isArray(role)) {
    return role.includes(user.role);
  }

  return user.role === role;
}

export function buildSearchText(fields: string[]): string {
  return fields
    .map((field) => field.toLowerCase().trim())
    .join(" ")
    .toLowerCase();
}
