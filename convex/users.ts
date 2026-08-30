import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const signup = mutation({
  args: {
    name: v.string(),
    username: v.string(),
    email: v.optional(v.string()),
    contactNumber: v.optional(v.string()),
    password: v.optional(v.string()),
    fullAddress: v.optional(v.string()),
    localArea: v.optional(v.string()),
    district: v.optional(v.string()),
    state: v.optional(v.string()),
    pinCode: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    role: v.optional(v.union(v.literal("citizen"), v.literal("admin"))),
  },
  handler: async (ctx, args) => {
    const cleanUsername = args.username.trim().toLowerCase();
    const existing = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", cleanUsername))
      .first();

    if (existing) {
      throw new Error("Username is already taken. Please choose another username.");
    }

    if (args.email) {
      const existingEmail = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", args.email!.trim().toLowerCase()))
        .first();
      if (existingEmail) {
        throw new Error("An account with this email already exists.");
      }
    }

    const now = Date.now();
    const userId = await ctx.db.insert("users", {
      name: args.name.trim(),
      username: cleanUsername,
      email: args.email ? args.email.trim().toLowerCase() : undefined,
      contactNumber: args.contactNumber?.trim(),
      passwordHash: args.password ? args.password : undefined,
      fullAddress: args.fullAddress?.trim(),
      localArea: args.localArea?.trim(),
      district: args.district?.trim(),
      state: args.state?.trim(),
      pinCode: args.pinCode?.trim(),
      latitude: args.latitude,
      longitude: args.longitude,
      role: args.role || (cleanUsername.includes("admin") ? "admin" : "citizen"),
      createdAt: now,
      updatedAt: now,
    });

    return await ctx.db.get(userId);
  },
});

export const signin = mutation({
  args: {
    usernameOrEmail: v.string(),
    password: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identifier = args.usernameOrEmail.trim().toLowerCase();
    let user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", identifier))
      .first();

    if (!user) {
      user = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", identifier))
        .first();
    }

    if (!user) {
      throw new Error("No account found with this username or email.");
    }

    if (user.passwordHash && args.password) {
      if (user.passwordHash !== args.password) {
        throw new Error("Invalid password. Please try again.");
      }
    }

    return user;
  },
});

export const getById = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getByUsername = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username.trim().toLowerCase()))
      .first();
  },
});

export const updateLocation = mutation({
  args: {
    userId: v.id("users"),
    fullAddress: v.optional(v.string()),
    localArea: v.optional(v.string()),
    district: v.optional(v.string()),
    state: v.optional(v.string()),
    pinCode: v.optional(v.string()),
    latitude: v.number(),
    longitude: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    await ctx.db.patch(args.userId, {
      fullAddress: args.fullAddress || user.fullAddress,
      localArea: args.localArea || user.localArea,
      district: args.district || user.district,
      state: args.state || user.state,
      pinCode: args.pinCode || user.pinCode,
      latitude: args.latitude,
      longitude: args.longitude,
      updatedAt: Date.now(),
    });

    return await ctx.db.get(args.userId);
  },
});

export const list = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    return await ctx.db.query("users").order("desc").take(limit);
  },
});
