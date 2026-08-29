import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const create = mutation({
  args: {
    userId: v.string(),
    userName: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    type: v.union(v.literal('photo'), v.literal('video')),
    storageId: v.id('_storage'),
    category: v.string(),
  },
  handler: async (ctx, args) => {
    const all = await ctx.db.query('evidence').collect();
    const approvedCount = all.filter(e => e.status === 'approved' || e.status === 'important').length;
    if (approvedCount >= 20) {
      throw new Error('Daily upload limit reached');
    }
    return await ctx.db.insert('evidence', {
      userId: args.userId,
      userName: args.userName,
      title: args.title,
      description: args.description,
      type: args.type,
      storageId: args.storageId,
      category: args.category,
      createdAt: Date.now(),
      likes: 0,
      dislikes: 0,
      status: 'pending',
    });
  },
});

function withDefaultStatus(items: any[]) {
  return items.map(item => ({
    ...item,
    status: item.status || 'pending',
  }));
}

export const list = query({
  args: {
    category: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let all = await ctx.db.query('evidence').order('desc').take(args.limit || 50);
    let items = all.filter(e => e.status === 'approved' || e.status === 'important' || !e.status);
    if (args.category && args.category !== 'all') {
      items = items.filter(e => e.category === args.category);
    }
    return await Promise.all(
      items.map(async (item) => ({
        ...withDefaultStatus([item])[0],
        url: await ctx.storage.getUrl(item.storageId),
      }))
    );
  },
});

export const toggleLike = mutation({
  args: { evidenceId: v.id('evidence'), userId: v.string() },
  handler: async (ctx, args) => {
    const evidence = await ctx.db.get(args.evidenceId);
    if (evidence) {
      await ctx.db.patch(args.evidenceId, { likes: evidence.likes + 1 });
    }
  },
});

export const toggleDislike = mutation({
  args: { evidenceId: v.id('evidence'), userId: v.string() },
  handler: async (ctx, args) => {
    const evidence = await ctx.db.get(args.evidenceId);
    if (evidence) {
      await ctx.db.patch(args.evidenceId, { dislikes: evidence.dislikes + 1 });
    }
  },
});

export const listPending = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query('evidence').order('desc').collect();
    const items = all.filter(e => e.status === 'pending' || !e.status);
    return await Promise.all(
      items.map(async (item) => ({
        ...withDefaultStatus([item])[0],
        url: await ctx.storage.getUrl(item.storageId),
      }))
    );
  },
});

export const listApproved = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query('evidence').order('desc').collect();
    const items = all.filter(e => e.status === 'approved' || e.status === 'important');
    return await Promise.all(
      items.map(async (item) => ({
        ...withDefaultStatus([item])[0],
        url: await ctx.storage.getUrl(item.storageId),
      }))
    );
  },
});

export const approve = mutation({
  args: { evidenceId: v.id('evidence'), adminEmail: v.string() },
  handler: async (ctx, args) => {
    const all = await ctx.db.query('evidence').collect();
    const approvedCount = all.filter(e => e.status === 'approved' || e.status === 'important').length;
    if (approvedCount >= 20) {
      throw new Error('Daily upload limit reached');
    }
    await ctx.db.patch(args.evidenceId, {
      status: 'approved',
      reviewedAt: Date.now(),
      reviewedBy: args.adminEmail,
    });
  },
});

export const reject = mutation({
  args: { evidenceId: v.id('evidence'), adminEmail: v.string() },
  handler: async (ctx, args) => {
    const evidence = await ctx.db.get(args.evidenceId);
    if (evidence) {
      await ctx.storage.delete(evidence.storageId);
      await ctx.db.delete(args.evidenceId);
    }
  },
});

export const remove = mutation({
  args: { evidenceId: v.id('evidence') },
  handler: async (ctx, args) => {
    const evidence = await ctx.db.get(args.evidenceId);
    if (evidence) {
      await ctx.storage.delete(evidence.storageId);
      await ctx.db.delete(args.evidenceId);
    }
  },
});

export const toggleImportant = mutation({
  args: { evidenceId: v.id('evidence'), adminEmail: v.string() },
  handler: async (ctx, args) => {
    const evidence = await ctx.db.get(args.evidenceId);
    if (evidence) {
      const newStatus = evidence.status === 'important' ? 'approved' : 'important';
      await ctx.db.patch(args.evidenceId, {
        status: newStatus,
        reviewedAt: Date.now(),
        reviewedBy: args.adminEmail,
      });
    }
  },
});

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query('evidence').collect();
    const total = all.length;
    const pending = all.filter(e => e.status === 'pending' || !e.status).length;
    const approved = all.filter(e => e.status === 'approved' || e.status === 'important').length;
    const important = all.filter(e => e.status === 'important').length;
    return { total, pending, approved, important };
  },
});

export const getUploadLimitStatus = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query('evidence').collect();
    const approvedCount = all.filter(e => e.status === 'approved' || e.status === 'important').length;
    return {
      count: approvedCount,
      limit: 20,
      reached: approvedCount >= 20,
    };
  },
});
