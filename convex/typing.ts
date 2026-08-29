import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const setTyping = mutation({
  args: {
    userId: v.string(),
    userName: v.string(),
    channel: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('typingIndicators')
      .withIndex('by_channel', q => q.eq('channel', args.channel))
      .filter(q => q.eq(q.field('userId'), args.userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { timestamp: Date.now() });
    } else {
      await ctx.db.insert('typingIndicators', {
        userId: args.userId,
        userName: args.userName,
        channel: args.channel,
        timestamp: Date.now(),
      });
    }
  },
});

export const getTyping = query({
  args: { channel: v.string() },
  handler: async (ctx, args) => {
    const cutoff = Date.now() - 3000;
    const typing = await ctx.db
      .query('typingIndicators')
      .withIndex('by_channel', q => q.eq('channel', args.channel))
      .filter(q => q.gte(q.field('timestamp'), cutoff))
      .collect();

    return typing
      .filter(t => t.timestamp >= cutoff)
      .map(t => ({ name: t.userName, id: t.userId }));
  },
});

export const clearTyping = mutation({
  args: {
    userId: v.string(),
    channel: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('typingIndicators')
      .withIndex('by_channel', q => q.eq('channel', args.channel))
      .filter(q => q.eq(q.field('userId'), args.userId))
      .first();
    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});
