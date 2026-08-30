import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const logVisit = mutation({
  args: {
    sessionId: v.string(),
    userId: v.optional(v.string()),
    userName: v.optional(v.string()),
    page: v.string(),
    referrer: v.optional(v.string()),
    source: v.optional(v.string()),
    country: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("visitors", {
      sessionId: args.sessionId,
      userId: args.userId || "anonymous",
      userName: args.userName || "Guest Visitor",
      page: args.page,
      referrer: args.referrer,
      source: args.source,
      country: args.country,
      createdAt: Date.now(),
    });
  },
});

export const list = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    return await ctx.db.query("visitors").order("desc").take(limit);
  },
});
