import bcrypt from "bcryptjs";
import { v } from "convex/values";
import { action } from "@/convex/_generated/server";

export const hashPassword = action({
  args: {
    password: v.string(),
  },
  handler: async (_, { password }: { password: string }) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  },
});

export const verifyPassword = action({
  args: {
    password: v.string(),
    hash: v.string(),
  },
  handler: async (
    _,
    { password, hash }: { password: string; hash: string },
  ) => {
    return await bcrypt.compare(password, hash);
  },
});
