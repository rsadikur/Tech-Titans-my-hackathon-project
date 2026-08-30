import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const setTyping = mutation({
  args: {
    channel: v.string(),
    userId: v.string(),
    userName: v.string(),
    isTyping: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("typingIndicators")
      .withIndex("by_channel_user", (q) =>
        q.eq("channel", args.channel).eq("userId", args.userId)
      )
      .first();

    if (existing) {
      if (args.isTyping) {
        await ctx.db.patch(existing._id, { updatedAt: Date.now() });
      } else {
        await ctx.db.delete(existing._id);
      }
    } else if (args.isTyping) {
      await ctx.db.insert("typingIndicators", {
        channel: args.channel,
        userId: args.userId,
        userName: args.userName,
        updatedAt: Date.now(),
      });
    }
  },
});

export const getTyping = query({
  args: { channel: v.string() },
  handler: async (ctx, args) => {
    const recent = Date.now() - 5000;
    const typing = await ctx.db
      .query("typingIndicators")
      .withIndex("by_channel", (q) => q.eq("channel", args.channel))
      .filter((q) => q.gt(q.field("updatedAt"), recent))
      .first();

    if (!typing) return null;
    return { id: typing.userId, name: typing.userName };
  },
});
