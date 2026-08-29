import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const createUser = mutation({
  args: {
    name: v.string(),
    username: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('users')
      .filter(q => q.eq(q.field('username'), args.username))
      .first();

    if (existing) {
      throw new Error('Username already exists');
    }

    const userId = await ctx.db.insert('users', {
      name: args.name,
      username: args.username,
      password: args.password,
      isOnline: true,
      lastSeen: Date.now(),
      createdAt: Date.now(),
    });

    await ctx.db.insert('notifications', {
      userId: args.username,
      type: 'welcome',
      title: '🎉 Welcome to Cockroach Janata Party!',
      message: 'Your account has been created successfully.\n\nYou can now:\n🗣 Join public discussions\n📹 Upload evidence videos\n💡 Share your thoughts and ideas\n🌍 Connect with the community\n\nPlease follow community guidelines and help keep the platform respectful and safe for everyone.\n\nThanks for joining the community 🚀',
      read: false,
      createdAt: Date.now(),
    });

    return userId;
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

export const authenticate = mutation({
  args: { username: v.string(), password: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .filter(q => q.eq(q.field('username'), args.username))
      .first();

    if (!user) return null;
    if (user.password !== args.password) return null;

    return { name: user.name, username: user.username };
  },
});
