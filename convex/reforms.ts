import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    author: v.string(),
    authorId: v.string(),
    avatar: v.string(),
    category: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('reforms', {
      title: args.title,
      description: args.description,
      author: args.author,
      authorId: args.authorId,
      avatar: args.avatar,
      votes: 0,
      likes: 0,
      dislikes: 0,
      comments: 0,
      time: 'Just now',
      status: 'proposed',
      category: args.category,
      createdAt: Date.now(),
    });
  },
});

export const list = query({
  args: {
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
    sortBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    let items = await ctx.db.query('reforms').collect();

    if (args.status && args.status !== 'All') {
      const status = args.status;
      items = items.filter(r => r.status.toLowerCase() === status.toLowerCase());
    }

    if (args.sortBy === 'recent') {
      items.sort((a, b) => b.createdAt - a.createdAt);
    } else if (args.sortBy === 'votes') {
      items.sort((a, b) => b.votes - a.votes);
    } else {
      items.sort((a, b) => (b.likes + b.votes) - (a.likes + a.votes));
    }

    return items.slice(0, limit);
  },
});

export const toggleVote = mutation({
  args: { reformId: v.id('reforms'), userId: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('reformReactions')
      .withIndex('by_reform_user', q => q.eq('reformId', args.reformId).eq('userId', args.userId))
      .first();

    const reform = await ctx.db.get(args.reformId);
    if (!reform) return;

    if (existing) {
      if (existing.type === 'vote') {
        await ctx.db.delete(existing._id);
        await ctx.db.patch(args.reformId, { votes: Math.max(0, reform.votes - 1) });
      } else {
        await ctx.db.patch(existing._id, { type: 'vote' });
        await ctx.db.patch(args.reformId, {
          votes: reform.votes + 1,
          likes: existing.type === 'like' ? Math.max(0, reform.likes - 1) : reform.likes,
          dislikes: existing.type === 'dislike' ? Math.max(0, reform.dislikes - 1) : reform.dislikes,
        });
      }
    } else {
      await ctx.db.insert('reformReactions', {
        reformId: args.reformId,
        userId: args.userId,
        type: 'vote',
        createdAt: Date.now(),
      });
      await ctx.db.patch(args.reformId, { votes: reform.votes + 1 });
    }
  },
});

export const toggleLike = mutation({
  args: { reformId: v.id('reforms'), userId: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('reformReactions')
      .withIndex('by_reform_user', q => q.eq('reformId', args.reformId).eq('userId', args.userId))
      .first();

    const reform = await ctx.db.get(args.reformId);
    if (!reform) return;

    if (existing) {
      if (existing.type === 'like') {
        await ctx.db.delete(existing._id);
        await ctx.db.patch(args.reformId, { likes: Math.max(0, reform.likes - 1) });
      } else {
        await ctx.db.patch(existing._id, { type: 'like' });
        await ctx.db.patch(args.reformId, {
          likes: reform.likes + 1,
          dislikes: existing.type === 'dislike' ? Math.max(0, reform.dislikes - 1) : reform.dislikes,
          votes: existing.type === 'vote' ? Math.max(0, reform.votes - 1) : reform.votes,
        });
      }
    } else {
      await ctx.db.insert('reformReactions', {
        reformId: args.reformId,
        userId: args.userId,
        type: 'like',
        createdAt: Date.now(),
      });
      await ctx.db.patch(args.reformId, { likes: reform.likes + 1 });
    }
  },
});

export const toggleDislike = mutation({
  args: { reformId: v.id('reforms'), userId: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('reformReactions')
      .withIndex('by_reform_user', q => q.eq('reformId', args.reformId).eq('userId', args.userId))
      .first();

    const reform = await ctx.db.get(args.reformId);
    if (!reform) return;

    if (existing) {
      if (existing.type === 'dislike') {
        await ctx.db.delete(existing._id);
        await ctx.db.patch(args.reformId, { dislikes: Math.max(0, reform.dislikes - 1) });
      } else {
        await ctx.db.patch(existing._id, { type: 'dislike' });
        await ctx.db.patch(args.reformId, {
          dislikes: reform.dislikes + 1,
          likes: existing.type === 'like' ? Math.max(0, reform.likes - 1) : reform.likes,
          votes: existing.type === 'vote' ? Math.max(0, reform.votes - 1) : reform.votes,
        });
      }
    } else {
      await ctx.db.insert('reformReactions', {
        reformId: args.reformId,
        userId: args.userId,
        type: 'dislike',
        createdAt: Date.now(),
      });
      await ctx.db.patch(args.reformId, { dislikes: reform.dislikes + 1 });
    }
  },
});

export const getUserReaction = query({
  args: { reformId: v.id('reforms'), userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('reformReactions')
      .withIndex('by_reform_user', q => q.eq('reformId', args.reformId).eq('userId', args.userId))
      .first();
  },
});
