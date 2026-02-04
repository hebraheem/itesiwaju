import { GenericQueryCtx, GenericMutationCtx } from "convex/server";
import { DataModel } from "@/convex/_generated/dataModel";

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
