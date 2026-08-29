import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const create = mutation({
  args: {
    userId: v.string(),
    userName: v.string(),
    text: v.string(),
    category: v.string(),
  },
  handler: async (ctx, args) => {
    const thoughtId = await ctx.db.insert('thoughts', {
      userId: args.userId,
      userName: args.userName,
      text: args.text,
      category: args.category,
      timestamp: Date.now(),
      upvotes: 0,
      likes: 0,
      dislikes: 0,
      status: 'New',
    });

    await ctx.db.insert('reforms', {
      title: args.text,
      description: args.text,
      author: args.userName,
      authorId: args.userId,
      avatar: '',
      votes: 0,
      likes: 0,
      dislikes: 0,
      comments: 0,
      time: 'Just now',
      status: 'proposed',
      category: args.category,
      createdAt: Date.now(),
    });

    return thoughtId;
  },
});

export const list = query({
  args: {
    category: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query('thoughts').order('desc');
    if (args.category && args.category !== 'all') {
      query = query.filter(q => q.eq(q.field('category'), args.category));
    }
    return await query.take(args.limit || 100);
  },
});

export const upvote = mutation({
  args: { thoughtId: v.id('thoughts') },
  handler: async (ctx, args) => {
    const thought = await ctx.db.get(args.thoughtId);
    if (thought) {
      await ctx.db.patch(args.thoughtId, { upvotes: thought.upvotes + 1 });
    }
  },
});
