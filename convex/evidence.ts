import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const addEvidence = mutation({
  args: {
    issueId: v.id("issues"),
    userId: v.id("users"),
    storageId: v.id("_storage"),
    mediaType: v.union(v.literal("image"), v.literal("video")),
    fileName: v.string(),
    fileSize: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("Authenticated user required.");

    const issue = await ctx.db.get(args.issueId);
    if (!issue) throw new Error("Issue not found.");

    // Validate 100 MB max size
    if (args.fileSize > 100 * 1024 * 1024) {
      throw new Error("File size exceeds 100 MB limit.");
    }

    const evidenceId = await ctx.db.insert("evidence", {
      issueId: args.issueId,
      uploadedBy: user._id,
      uploadedByName: user.name,
      storageId: args.storageId,
      mediaType: args.mediaType,
      fileName: args.fileName,
      fileSize: args.fileSize,
      approvalStatus: "pending",
      createdAt: Date.now(),
    });

    return evidenceId;
  },
});

export const listByIssue = query({
  args: { issueId: v.id("issues") },
  handler: async (ctx, args) => {
    const list = await ctx.db
      .query("evidence")
      .withIndex("by_issueId", (q) => q.eq("issueId", args.issueId))
      .filter((q) => q.eq(q.field("approvalStatus"), "approved"))
      .collect();

    return await Promise.all(
      list.map(async (ev) => ({
        ...ev,
        url: await ctx.storage.getUrl(ev.storageId),
      }))
    );
  },
});

export const listPending = query({
  args: {},
  handler: async (ctx) => {
    const list = await ctx.db
      .query("evidence")
      .withIndex("by_approvalStatus", (q) => q.eq("approvalStatus", "pending"))
      .collect();

    return await Promise.all(
      list.map(async (ev) => {
        const issue = await ctx.db.get(ev.issueId);
        return {
          ...ev,
          issueTitle: issue?.title || "Unknown Issue",
          issueLocation: issue?.address || "Unknown Location",
          url: await ctx.storage.getUrl(ev.storageId),
        };
      })
    );
  },
});
