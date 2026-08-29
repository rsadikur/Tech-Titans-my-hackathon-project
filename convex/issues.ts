import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const create = mutation({
  args: {
    title: v.string(),
    category: v.string(),
    location: v.string(),
    urgency: v.optional(v.string()),
    authorId: v.optional(v.string()),
    authorName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('issues', {
      title: args.title,
      category: args.category,
      location: args.location || 'Citizen Report',
      urgency: args.urgency || 'Medium',
      upvotes: 0,
      comments: 0,
      views: 0,
      time: 'Just now',
      status: 'New',
      statusColor: 'text-emerald-500 bg-emerald-500/10',
      likes: 0,
      dislikes: 0,
      createdAt: Date.now(),
      authorId: args.authorId,
      authorName: args.authorName,
    });
  },
});

export const list = query({
  args: {
    category: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query('issues').order('desc');
    if (args.category && args.category !== 'All') {
      query = query.filter(q => q.eq(q.field('category'), args.category));
    }
    return await query.take(args.limit || 50);
  },
});

export const toggleLike = mutation({
  args: { issueId: v.id('issues'), userId: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('issueReactions')
      .withIndex('by_issue_user', q => q.eq('issueId', args.issueId).eq('userId', args.userId))
      .first();

    const issue = await ctx.db.get(args.issueId);
    if (!issue) return;

    if (existing) {
      if (existing.type === 'like') {
        await ctx.db.delete(existing._id);
        await ctx.db.patch(args.issueId, { likes: Math.max(0, issue.likes - 1) });
      } else {
        await ctx.db.patch(existing._id, { type: 'like' });
        await ctx.db.patch(args.issueId, {
          likes: issue.likes + 1,
          dislikes: Math.max(0, issue.dislikes - 1),
        });
      }
    } else {
      await ctx.db.insert('issueReactions', {
        issueId: args.issueId,
        userId: args.userId,
        type: 'like',
        createdAt: Date.now(),
      });
      await ctx.db.patch(args.issueId, { likes: issue.likes + 1 });
    }
  },
});

export const toggleDislike = mutation({
  args: { issueId: v.id('issues'), userId: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('issueReactions')
      .withIndex('by_issue_user', q => q.eq('issueId', args.issueId).eq('userId', args.userId))
      .first();

    const issue = await ctx.db.get(args.issueId);
    if (!issue) return;

    if (existing) {
      if (existing.type === 'dislike') {
        await ctx.db.delete(existing._id);
        await ctx.db.patch(args.issueId, { dislikes: Math.max(0, issue.dislikes - 1) });
      } else {
        await ctx.db.patch(existing._id, { type: 'dislike' });
        await ctx.db.patch(args.issueId, {
          dislikes: issue.dislikes + 1,
          likes: Math.max(0, issue.likes - 1),
        });
      }
    } else {
      await ctx.db.insert('issueReactions', {
        issueId: args.issueId,
        userId: args.userId,
        type: 'dislike',
        createdAt: Date.now(),
      });
      await ctx.db.patch(args.issueId, { dislikes: issue.dislikes + 1 });
    }
  },
});

export const getUserReaction = query({
  args: { issueId: v.id('issues'), userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('issueReactions')
      .withIndex('by_issue_user', q => q.eq('issueId', args.issueId).eq('userId', args.userId))
      .first();
  },
});

export const getTrending = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const issues = await ctx.db.query('issues').collect();
    return issues
      .sort((a, b) => b.likes - a.likes)
      .slice(0, args.limit || 50);
  },
});
