import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const send = mutation({
  args: {
    userId: v.string(),
    userName: v.string(),
    email: v.optional(v.string()),
    subject: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("contactMessages", {
      userId: args.userId,
      userName: args.userName,
      email: args.email,
      subject: args.subject,
      message: args.message,
      status: "unread",
      createdAt: Date.now(),
    });
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("contactMessages").order("desc").collect();
  },
});

export const markAsRead = mutation({
  args: { id: v.id("contactMessages") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: "read" });
  },
});
