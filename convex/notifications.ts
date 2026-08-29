import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const create = mutation({
  args: {
    userId: v.string(),
    type: v.string(),
    title: v.string(),
    message: v.string(),
    link: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('notifications', {
      userId: args.userId,
      type: args.type,
      title: args.title,
      message: args.message,
      read: false,
      createdAt: Date.now(),
      link: args.link,
    });
  },
});

export const listByUser = query({
  args: { userId: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('notifications')
      .withIndex('by_user', q => q.eq('userId', args.userId))
      .order('desc')
      .take(args.limit || 50);
  },
});

export const markAsRead = mutation({
  args: { notificationId: v.id('notifications') },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.notificationId, { read: true });
  },
});

export const markAllAsRead = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query('notifications')
      .withIndex('by_user', q => q.eq('userId', args.userId))
      .filter(q => q.eq(q.field('read'), false))
      .collect();

    for (const n of notifications) {
      await ctx.db.patch(n._id, { read: true });
    }
  },
});

export const getUnreadCount = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query('notifications')
      .withIndex('by_user', q => q.eq('userId', args.userId))
      .filter(q => q.eq(q.field('read'), false))
      .collect();
    return notifications.length;
  },
});

export const sendAdminNotification = mutation({
  args: {
    target: v.union(v.literal('all'), v.literal('user')),
    username: v.optional(v.string()),
    title: v.string(),
    message: v.string(),
    type: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.target === 'all') {
      const users = await ctx.db.query('users').collect();
      for (const u of users) {
        await ctx.db.insert('notifications', {
          userId: u.username,
          type: args.type || 'admin',
          title: args.title,
          message: args.message,
          read: false,
          createdAt: Date.now(),
        });
      }
    } else if (args.target === 'user' && args.username) {
      await ctx.db.insert('notifications', {
        userId: args.username,
        type: args.type || 'admin',
        title: args.title,
        message: args.message,
        read: false,
        createdAt: Date.now(),
      });
    }
  },
});
