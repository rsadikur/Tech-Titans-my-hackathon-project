import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const login = mutation({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query('admins').collect();
    if (existing.length === 0) {
      await ctx.db.insert('admins', {
        email: 'admin@civicpulse.local',
        password: 'admin123',
        name: 'Admin',
      });
    }
    let admin = await ctx.db.query('admins')
      .filter(q => q.eq(q.field('email'), args.email))
      .first();
    if (!admin && args.email === 'admin@civicpulse.local') {
      admin = await ctx.db.query('admins')
        .filter(q => q.eq(q.field('email'), 'admin@cjp.lpu'))
        .first();
    }
    if (!admin || admin.password !== args.password) {
      throw new Error('Invalid credentials');
    }
    if (admin.email === 'admin@cjp.lpu') {
      await ctx.db.patch(admin._id, { email: 'admin@civicpulse.local' });
    }
    return { email: admin.email, name: admin.name };
  },
});

export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query('users').collect();
    return users.map(u => ({
      username: u.username,
      name: u.name,
      email: u.email,
      isOnline: u.isOnline,
      lastSeen: u.lastSeen,
      createdAt: u.createdAt,
    }));
  },
});
