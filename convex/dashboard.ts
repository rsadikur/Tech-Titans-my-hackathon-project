import { v } from "convex/values";
import { query } from "./_generated/server";

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const allIssues = await ctx.db.query("issues").collect();
    const allUsers = await ctx.db.query("users").collect();
    const allIdeas = await ctx.db.query("ideas").collect();
    const allVotes = await ctx.db.query("issueVotes").collect();

    const totalReports = allIssues.length;
    const activeCitizens = allUsers.length;
    const resolvedIssues = allIssues.filter((i) => i.status === "Resolved").length;
    const resolutionRate = totalReports > 0 ? Math.round((resolvedIssues / totalReports) * 100) : 0;

    // Reports by category
    const categoryCount: Record<string, number> = {};
    for (const issue of allIssues) {
      const cat = issue.category;
      categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    }

    const reportsByCategory = Object.entries(categoryCount).map(([category, count]) => ({
      category,
      count,
    }));

    // Top supported issues
    const topIssues = [...allIssues]
      .sort((a, b) => b.voteCount - a.voteCount)
      .slice(0, 5);

    return {
      totalReports,
      activeCitizens,
      resolvedIssues,
      resolutionRate,
      reportsByCategory,
      totalIdeas: allIdeas.length,
      totalVotes: allVotes.length,
      topIssues,
    };
  },
});

export const getCitizenStats = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const raw = args.username.trim().toLowerCase();
    const allUsers = await ctx.db.query("users").collect();
    const user = allUsers.find(
      (u) =>
        u.username.toLowerCase() === raw ||
        u.name.toLowerCase() === raw ||
        u.name.toLowerCase().replace(/\s+/g, "_") === raw ||
        String(u._id) === raw
    );

    if (!user) {
      const allIssues = await ctx.db.query("issues").collect();
      const userIssues = allIssues.filter(
        (i) =>
          i.createdByName.toLowerCase() === raw ||
          i.createdByName.toLowerCase().replace(/\s+/g, "_") === raw
      );
      const reportedCount = userIssues.length;
      const resolvedCount = userIssues.filter((i) => i.status === "Resolved").length;
      return {
        reportedCount,
        supportedCount: Math.max(reportedCount * 3, 0),
        resolvedCount,
        impactPoints: reportedCount * 50 + resolvedCount * 500,
      };
    }

    const userIssues = await ctx.db
      .query("issues")
      .withIndex("by_createdBy", (q) => q.eq("createdBy", user._id))
      .collect();

    const reportedCount = userIssues.length;
    const resolvedCount = userIssues.filter((i) => i.status === "Resolved").length;

    const userVotes = await ctx.db
      .query("issueVotes")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    const supportedCount = userVotes.length;
    const impactPoints = reportedCount * 50 + resolvedCount * 500 + supportedCount * 10;

    return {
      reportedCount,
      supportedCount,
      resolvedCount,
      impactPoints,
    };
  },
});

export const getLeaderboard = query({
  args: {},
  handler: async (ctx) => {
    const resolvedIssues = await ctx.db
      .query("issues")
      .withIndex("by_status", (q) => q.eq("status", "Resolved"))
      .collect();

    if (resolvedIssues.length === 0) return [];

    const allUsers = await ctx.db.query("users").collect();
    const allIssues = await ctx.db.query("issues").collect();

    const userMap: Record<
      string,
      {
        userId: string;
        name: string;
        username: string;
        solvedCount: number;
        reportsCount: number;
        points: number;
      }
    > = {};

    for (const issue of resolvedIssues) {
      const authorId = issue.createdBy;
      const user = allUsers.find((u) => u._id === authorId);
      const name = user?.name || issue.createdByName || "Citizen";
      const username = user?.username || name.toLowerCase().replace(/\s+/g, "_");
      const key = String(authorId);

      if (!userMap[key]) {
        const totalReports = allIssues.filter((i) => i.createdBy === authorId).length;
        userMap[key] = {
          userId: username,
          name,
          username,
          solvedCount: 0,
          reportsCount: totalReports,
          points: 0,
        };
      }

      userMap[key].solvedCount += 1;
      userMap[key].points += 500;
    }

    const list = Object.values(userMap).map((c) => {
      const initials = c.name
        .split(" ")
        .map((p) => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

      return {
        ...c,
        avatar: initials || "CP",
        color: "from-emerald-500 to-teal-600",
      };
    });

    list.sort((a, b) => {
      if (b.solvedCount !== a.solvedCount) {
        return b.solvedCount - a.solvedCount;
      }
      return b.points - a.points;
    });

    return list.map((item, idx) => ({
      ...item,
      rank: idx + 1,
    }));
  },
});
