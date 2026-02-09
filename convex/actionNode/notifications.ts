"use node";

import { Id } from "@/convex/_generated/dataModel";
import { action } from "../_generated/server";
import { v } from "convex/values";
import webpush from "web-push";
import { api } from "../_generated/api";

// Must exist at runtime
const subject = process.env.VAPID_SUBJECT!;
const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
const privateKey = process.env.VAPID_PRIVATE_KEY!;

if (!subject || !publicKey || !privateKey) {
  throw new Error("VAPID keys or subject are not set in environment variables");
}

webpush.setVapidDetails(subject, publicKey, privateKey);

export const sendPush = action({
  args: {
    userId: v.optional(v.id("users")),
    authEmail: v.optional(v.string()),
    title: v.string(),
    message: v.string(),
    type: v.union(
      v.literal("member"),
      v.literal("event"),
      v.literal("payment"),
      v.literal("profile"),
      v.literal("system"),
    ),
    relatedId: v.optional(v.string()),
    actionUrl: v.optional(v.string()),
  },

  handler: async (ctx, args) => {
    let targetUserIds: string[] = [];

    if (!args.userId && args.authEmail) {
      const users = await ctx.runQuery(api.users.getAllUser);
      targetUserIds = users.map((u) => u._id);
    } else if (args.userId) targetUserIds = [args.userId];
    else return;

    for (const uid of targetUserIds) {
      const subs = await ctx.runQuery(api.notifications.getUserSubscriptions, {
        userId: uid as Id<"users">,
      });

      for (const s of subs) {
        try {
          await webpush.sendNotification(
            JSON.parse(s.subscription),
            JSON.stringify({
              title: args.title,
              body: args.message,
              type: args.type,
              relatedId: args.relatedId,
              url: args.actionUrl,
            }),
          );
        } catch (err: any) {
          // If the subscription is invalid or gone, remove it automatically
          if (err.statusCode === 410 || err.statusCode === 404) {
            await ctx.runMutation(api.notifications.removeSubscription, {
              endpoint: s.endpoint,
            });
          } else {
            console.error("Push failed for", s._id, err);
          }
        }
      }
    }
  },
});
