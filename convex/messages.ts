import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const send = mutation({
  args: {
    userId: v.string(),
    userName: v.string(),
    text: v.string(),
    category: v.string(),
    channel: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert('messages', {
      userId: args.userId,
      userName: args.userName,
      text: args.text,
      category: args.category,
      timestamp: Date.now(),
      channel: args.channel || 'general',
    });
    return messageId;
  },
});

export const list = query({
  args: {
    channel: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const channel = args.channel || 'general';
    const limit = args.limit || 100;
    return await ctx.db
      .query('messages')
      .withIndex('by_channel', q => q.eq('channel', channel))
      .order('desc')
      .take(limit);
  },
});

export const getRecent = query({
  args: {
    channel: v.optional(v.string()),
    since: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const channel = args.channel || 'general';
    const since = args.since || 0;
    return await ctx.db
      .query('messages')
      .withIndex('by_channel', q => q.eq('channel', channel))
      .filter(q => q.gte(q.field('timestamp'), since))
      .order('desc')
      .take(50);
  },
});
