import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

async function requireAdmin(ctx: any, adminUserId: any) {
  const user = await ctx.db.get(adminUserId);
  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized: Admin privileges required.");
  }
  return user;
}

export const verifyIssue = mutation({
  args: {
    adminUserId: v.optional(v.id("users")),
    issueId: v.id("issues"),
  },
  handler: async (ctx, args) => {
    let adminName = "Admin";
    if (args.adminUserId) {
      try {
        const admin = await ctx.db.get(args.adminUserId);
        if (admin) adminName = admin.name;
      } catch {}
    }
    const issue = await ctx.db.get(args.issueId);
    if (!issue) throw new Error("Issue not found");

    await ctx.db.patch(args.issueId, {
      status: "Verified",
      updatedAt: Date.now(),
    });

    await ctx.db.insert("notifications", {
      userId: issue.createdBy,
      type: "issue_verified",
      title: "Issue Officially Verified",
      message: `Your reported issue "${issue.title}" has been verified by ${adminName}.`,
      relatedIssueId: issue._id,
      isRead: false,
      createdAt: Date.now(),
    });
  },
});

export const rejectIssue = mutation({
  args: {
    adminUserId: v.optional(v.id("users")),
    issueId: v.id("issues"),
  },
  handler: async (ctx, args) => {
    const issue = await ctx.db.get(args.issueId);
    if (!issue) throw new Error("Issue not found");

    // Remove attached votes
    const votes = await ctx.db
      .query("issueVotes")
      .withIndex("by_issueId", (q) => q.eq("issueId", args.issueId))
      .collect();
    for (const v of votes) {
      await ctx.db.delete(v._id);
    }

    await ctx.db.delete(args.issueId);
  },
});

export const updateIssueStatus = mutation({
  args: {
    adminUserId: v.optional(v.id("users")),
    issueId: v.id("issues"),
    status: v.union(
      v.literal("Reported"),
      v.literal("Verified"),
      v.literal("In Progress"),
      v.literal("Resolved")
    ),
  },
  handler: async (ctx, args) => {
    const issue = await ctx.db.get(args.issueId);
    if (!issue) throw new Error("Issue not found");

    await ctx.db.patch(args.issueId, {
      status: args.status,
      updatedAt: Date.now(),
    });

    if (args.status === "Verified" || args.status === "In Progress" || args.status === "Resolved") {
      const evidenceList = await ctx.db
        .query("evidence")
        .withIndex("by_issueId", (q) => q.eq("issueId", args.issueId))
        .collect();
      for (const ev of evidenceList) {
        await ctx.db.patch(ev._id, {
          approvalStatus: "approved",
        });
      }
    }
  },
});

export const resolveIssue = mutation({
  args: {
    adminUserId: v.optional(v.id("users")),
    issueId: v.id("issues"),
    resolutionReview: v.string(),
    resolutionEvidenceStorageId: v.optional(v.id("_storage")),
    resolutionEvidenceUrl: v.optional(v.string()),
    resolutionNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let adminName = "CivicPulse Admin";
    if (args.adminUserId) {
      try {
        const admin = await ctx.db.get(args.adminUserId);
        if (admin) adminName = admin.name;
      } catch {}
    }
    const issue = await ctx.db.get(args.issueId);
    if (!issue) throw new Error("Issue not found");

    const now = Date.now();
    await ctx.db.patch(args.issueId, {
      status: "Resolved",
      resolvedAt: now,
      resolvedBy: `${adminName} (CivicPulse Admin)`,
      resolutionReview: args.resolutionReview.trim(),
      resolutionEvidenceStorageId: args.resolutionEvidenceStorageId,
      resolutionEvidenceUrl: args.resolutionEvidenceUrl,
      resolutionNotes: args.resolutionNotes?.trim(),
      updatedAt: now,
    });

    await ctx.db.insert("notifications", {
      userId: issue.createdBy,
      type: "issue_resolved",
      title: "🎉 Issue Successfully Resolved!",
      message: `Your reported civic issue "${issue.title}" has been officially resolved on ground and verified by ${adminName}.`,
      relatedIssueId: issue._id,
      isRead: false,
      createdAt: now,
    });
  },
});

export const reopenIssue = mutation({
  args: {
    issueId: v.id("issues"),
  },
  handler: async (ctx, args) => {
    const issue = await ctx.db.get(args.issueId);
    if (!issue) throw new Error("Issue not found");

    await ctx.db.patch(args.issueId, {
      status: "Verified",
      resolvedAt: undefined,
      resolvedBy: undefined,
      resolutionReview: undefined,
      resolutionEvidenceUrl: undefined,
      updatedAt: Date.now(),
    });
  },
});

export const reviewEvidence = mutation({
  args: {
    adminUserId: v.id("users"),
    evidenceId: v.id("evidence"),
    status: v.union(v.literal("approved"), v.literal("rejected")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminUserId);
    const ev = await ctx.db.get(args.evidenceId);
    if (!ev) throw new Error("Evidence not found");

    await ctx.db.patch(args.evidenceId, {
      approvalStatus: args.status,
    });
  },
});

export const listAllIssues = query({
  args: { adminUserId: v.id("users") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminUserId);
    const issues = await ctx.db.query("issues").order("desc").collect();
    return await Promise.all(
      issues.map(async (i) => {
        const media = await ctx.db
          .query("evidence")
          .withIndex("by_issueId", (q) => q.eq("issueId", i._id))
          .first();
        const mediaUrl = media ? await ctx.storage.getUrl(media.storageId) : null;
        return {
          ...i,
          mediaUrl,
        };
      })
    );
  },
});
