import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const updateOnlineStatus = mutation({
  args: {
    userId: v.string(),
    userName: v.string(),
    isOnline: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("onlineUsers")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        isOnline: args.isOnline,
        lastSeen: Date.now(),
      });
    } else {
      await ctx.db.insert("onlineUsers", {
        userId: args.userId,
        userName: args.userName,
        isOnline: args.isOnline,
        lastSeen: Date.now(),
      });
    }
  },
});

export const getOnlineUsers = query({
  args: {},
  handler: async (ctx) => {
    const threshold = Date.now() - 60000;
    return await ctx.db
      .query("onlineUsers")
      .filter((q) => q.and(q.eq(q.field("isOnline"), true), q.gt(q.field("lastSeen"), threshold)))
      .collect();
  },
});
