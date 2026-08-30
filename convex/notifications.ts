import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {
    userId: v.optional(v.id("users")),
    username: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    let targetUserId = args.userId;

    if (!targetUserId && args.username) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_username", (q) => q.eq("username", args.username!.trim().toLowerCase()))
        .first();
      if (user) {
        targetUserId = user._id;
      }
    }

    if (!targetUserId) {
      return [];
    }

    return await ctx.db
      .query("notifications")
      .withIndex("by_userId", (q) => q.eq("userId", targetUserId!))
      .order("desc")
      .take(limit);
  },
});

export const getUnreadCount = query({
  args: {
    userId: v.optional(v.id("users")),
    username: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let targetUserId = args.userId;

    if (!targetUserId && args.username) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_username", (q) => q.eq("username", args.username!.trim().toLowerCase()))
        .first();
      if (user) {
        targetUserId = user._id;
      }
    }

    if (!targetUserId) {
      return 0;
    }

    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q) =>
        q.eq("userId", targetUserId!).eq("isRead", false)
      )
      .collect();
    return unread.length;
  },
});

export const markAsRead = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { isRead: true });
  },
});

export const markAllAsRead = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q) =>
        q.eq("userId", args.userId).eq("isRead", false)
      )
      .collect();

    for (const item of unread) {
      await ctx.db.patch(item._id, { isRead: true });
    }
  },
});

export const sendAdminNotification = mutation({
  args: {
    target: v.union(v.literal("all"), v.literal("user")),
    username: v.optional(v.string()),
    title: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    if (args.target === "user" && args.username) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_username", (q) => q.eq("username", args.username!.trim().toLowerCase()))
        .first();
      if (user) {
        await ctx.db.insert("notifications", {
          userId: user._id,
          type: "admin_announcement",
          title: args.title.trim(),
          message: args.message.trim(),
          isRead: false,
          createdAt: now,
        });
      }
    } else {
      const allUsers = await ctx.db.query("users").collect();
      for (const u of allUsers) {
        await ctx.db.insert("notifications", {
          userId: u._id,
          type: "admin_announcement",
          title: args.title.trim(),
          message: args.message.trim(),
          isRead: false,
          createdAt: now,
        });
      }
    }
  },
});
