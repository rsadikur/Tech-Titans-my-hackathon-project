import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    userId: v.string(),
    userName: v.string(),
    text: v.string(),
    category: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("thoughts", {
      userId: args.userId,
      userName: args.userName,
      text: args.text.trim(),
      category: args.category,
      upvotes: 0,
      timestamp: Date.now(),
    });
  },
});

export const list = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 100;
    return await ctx.db.query("thoughts").order("desc").take(limit);
  },
});

export const upvote = mutation({
  args: { id: v.id("thoughts") },
  handler: async (ctx, args) => {
    const thought = await ctx.db.get(args.id);
    if (thought) {
      await ctx.db.patch(args.id, { upvotes: (thought.upvotes || 0) + 1 });
    }
  },
});
