import { GenericQueryCtx, GenericMutationCtx } from "convex/server";
import { DataModel } from "@/convex/_generated/dataModel";
import { getAuthedConvex } from "@/lib/convexserverAuth";

export async function getCurrentUser(
  ctx: GenericQueryCtx<DataModel> | GenericMutationCtx<DataModel>,
) {
  const identity = await ctx.auth.getUserIdentity();
  console.log("identity", identity);

  if (!identity) throw new Error("Unauthorized");

  const user = await ctx.db
    .query("users")
    .withIndex("by_email", (q) => q.eq("email", identity.email!))
    .unique();

  if (!user) throw new Error("User not found");

  return user;
}

export async function hasPermission(
  ctx: GenericQueryCtx<DataModel> | GenericMutationCtx<DataModel>,
  role: string | string[],
): Promise<boolean> {
  try {
    const user = await getCurrentUser(ctx);
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
