import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const toggleIssueVote = mutation({
  args: {
    issueId: v.id("issues"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const issue = await ctx.db.get(args.issueId);
    if (!issue) throw new Error("Issue not found");

    const existingVote = await ctx.db
      .query("issueVotes")
      .withIndex("by_issue_user", (q) =>
        q.eq("issueId", args.issueId).eq("userId", args.userId)
      )
      .first();

    let hasVoted = false;
    let newVoteCount = issue.voteCount;

    if (existingVote) {
      // Remove vote (toggle off)
      await ctx.db.delete(existingVote._id);
      newVoteCount = Math.max(0, issue.voteCount - 1);
      hasVoted = false;
    } else {
      // Add vote
      await ctx.db.insert("issueVotes", {
        issueId: args.issueId,
        userId: args.userId,
        createdAt: Date.now(),
      });
      newVoteCount = issue.voteCount + 1;
      hasVoted = true;

      // Notify issue creator if different user
      if (issue.createdBy !== args.userId) {
        const voter = await ctx.db.get(args.userId);
        await ctx.db.insert("notifications", {
          userId: issue.createdBy,
          type: "issue_supported",
          title: "New Community Support",
          message: `${voter?.name || "A citizen"} supported your reported issue: "${issue.title}".`,
          relatedIssueId: issue._id,
          isRead: false,
          createdAt: Date.now(),
        });
      }
    }

    await ctx.db.patch(args.issueId, {
      voteCount: newVoteCount,
      updatedAt: Date.now(),
    });

    return { hasVoted, voteCount: newVoteCount };
  },
});

export const hasVotedIssue = query({
  args: {
    issueId: v.id("issues"),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    if (!args.userId) return false;
    const vote = await ctx.db
      .query("issueVotes")
      .withIndex("by_issue_user", (q) =>
        q.eq("issueId", args.issueId).eq("userId", args.userId!)
      )
      .first();
    return !!vote;
  },
});

export const toggleIdeaVote = mutation({
  args: {
    ideaId: v.id("ideas"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const idea = await ctx.db.get(args.ideaId);
    if (!idea) throw new Error("Idea not found");

    const existingVote = await ctx.db
      .query("ideaVotes")
      .withIndex("by_idea_user", (q) =>
        q.eq("ideaId", args.ideaId).eq("userId", args.userId)
      )
      .first();

    let hasVoted = false;
    let newVoteCount = idea.voteCount;

    if (existingVote) {
      await ctx.db.delete(existingVote._id);
      newVoteCount = Math.max(0, idea.voteCount - 1);
      hasVoted = false;
    } else {
      await ctx.db.insert("ideaVotes", {
        ideaId: args.ideaId,
        userId: args.userId,
        createdAt: Date.now(),
      });
      newVoteCount = idea.voteCount + 1;
      hasVoted = true;

      if (idea.createdBy !== args.userId) {
        const voter = await ctx.db.get(args.userId);
        await ctx.db.insert("notifications", {
          userId: idea.createdBy,
          type: "idea_supported",
          title: "Idea Support Received",
          message: `${voter?.name || "A citizen"} voted for your idea: "${idea.title}".`,
          relatedIdeaId: idea._id,
          isRead: false,
          createdAt: Date.now(),
        });
      }
    }

    await ctx.db.patch(args.ideaId, {
      voteCount: newVoteCount,
      updatedAt: Date.now(),
    });

    return { hasVoted, voteCount: newVoteCount };
  },
});

export const hasVotedIdea = query({
  args: {
    ideaId: v.id("ideas"),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    if (!args.userId) return false;
    const vote = await ctx.db
      .query("ideaVotes")
      .withIndex("by_idea_user", (q) =>
        q.eq("ideaId", args.ideaId).eq("userId", args.userId!)
      )
      .first();
    return !!vote;
  },
});
