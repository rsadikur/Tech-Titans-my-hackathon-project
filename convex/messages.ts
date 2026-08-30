import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const send = mutation({
  args: {
    channel: v.string(),
    userId: v.string(),
    userName: v.string(),
    text: v.string(),
    replyTo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("chatMessages", {
      channel: args.channel,
      userId: args.userId,
      userName: args.userName,
      text: args.text.trim(),
      replyTo: args.replyTo,
      createdAt: Date.now(),
    });
  },
});

export const list = query({
  args: {
    channel: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 100;
    return await ctx.db
      .query("chatMessages")
      .withIndex("by_channel", (q) => q.eq("channel", args.channel))
      .order("desc")
      .take(limit);
  },
});
