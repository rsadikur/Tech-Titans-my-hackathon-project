import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {
    category: v.optional(v.string()),
    scope: v.optional(v.string()),
    sortBy: v.optional(v.union(v.literal("popular"), v.literal("newest"))),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let ideas = await ctx.db.query("ideas").collect();

    // 1. Filter by category
    if (args.category && args.category.toLowerCase() !== "all") {
      ideas = ideas.filter(
        (i) => i.category.toLowerCase() === args.category!.toLowerCase()
      );
    }

    // 2. Filter by scope
    if (args.scope && args.scope.toLowerCase() !== "all") {
      ideas = ideas.filter(
        (i) => i.scope.toLowerCase() === args.scope!.toLowerCase()
      );
    }

    // 3. Sort
    const sortBy = args.sortBy || "popular";
    if (sortBy === "popular") {
      ideas.sort((a, b) => b.voteCount - a.voteCount);
    } else {
      ideas.sort((a, b) => b.createdAt - a.createdAt);
    }

    const limit = args.limit || 50;
    return ideas.slice(0, limit);
  },
});

export const listTop = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 6;
    return await ctx.db
      .query("ideas")
      .withIndex("by_voteCount")
      .order("desc")
      .take(limit);
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    category: v.union(
      v.literal("Education"),
      v.literal("Healthcare"),
      v.literal("Environment"),
      v.literal("Transport"),
      v.literal("Technology"),
      v.literal("Governance"),
      v.literal("Infrastructure"),
      v.literal("Other")
    ),
    scope: v.union(
      v.literal("Local Area"),
      v.literal("District"),
      v.literal("State"),
      v.literal("National")
    ),
    localArea: v.optional(v.string()),
    district: v.optional(v.string()),
    state: v.optional(v.string()),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("Authenticated user required.");

    const now = Date.now();
    const ideaId = await ctx.db.insert("ideas", {
      title: args.title.trim(),
      description: args.description.trim(),
      category: args.category,
      scope: args.scope,
      localArea: args.localArea?.trim(),
      district: args.district?.trim(),
      state: args.state?.trim(),
      createdBy: user._id,
      createdByName: user.name,
      voteCount: 1, // Author gets initial support
      createdAt: now,
      updatedAt: now,
    });

    // Record author vote
    await ctx.db.insert("ideaVotes", {
      ideaId,
      userId: user._id,
      createdAt: now,
    });

    return ideaId;
  },
});
