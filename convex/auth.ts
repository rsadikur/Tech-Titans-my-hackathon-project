import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const getOrCreateUser = mutation({
  args: {
    username: v.string(),
    name: v.string(),
    password: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('users')
      .filter(q => q.eq(q.field('username'), args.username))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        isOnline: true,
        lastSeen: Date.now(),
      });
      return existing._id;
    }

    return await ctx.db.insert('users', {
      username: args.username,
      name: args.name,
      password: args.password || 'default',
      isOnline: true,
      lastSeen: Date.now(),
      createdAt: Date.now(),
    });
  },
});

export const getUser = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('users')
      .filter(q => q.eq(q.field('username'), args.username))
      .first();
  },
});

export const getOnlineUsers = query({
  args: {},
  handler: async (ctx) => {
    const cutoff = Date.now() - 30000;
    return await ctx.db
      .query('users')
      .filter(q => q.eq(q.field('isOnline'), true))
      .filter(q => q.gte(q.field('lastSeen'), cutoff))
      .collect();
  },
});

export const setOffline = mutation({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .filter(q => q.eq(q.field('username'), args.username))
      .first();
    if (user) {
      await ctx.db.patch(user._id, { isOnline: false, lastSeen: Date.now() });
    }
  },
});

export const updateOnlineStatus = mutation({
  args: { username: v.string(), isOnline: v.boolean() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .filter(q => q.eq(q.field('username'), args.username))
      .first();
    if (user) {
      await ctx.db.patch(user._id, { isOnline: args.isOnline, lastSeen: Date.now() });
    }
  },
});
