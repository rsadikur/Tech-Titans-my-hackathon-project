import { v } from 'convex/values';
import { query } from './_generated/server';

export const getLeaderboard = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 5;
    const users = await ctx.db.query('users').collect();
    const allMessages = await ctx.db.query('messages').collect();
    const allIssues = await ctx.db.query('issues').collect();
    const allThoughts = await ctx.db.query('thoughts').collect();
    const allReforms = await ctx.db.query('reforms').collect();
    const allEvidence = await ctx.db.query('evidence').collect();

    const leaderboard = users.map((user, index) => {
      const messages = allMessages.filter(m => m.userId === user.username).length;
      const issues = allIssues.filter(i => i.authorId === user.username).length;
      const thoughts = allThoughts.filter(t => t.userId === user.username).length;
      const reforms = allReforms.filter(r => r.authorId === user.username).length;
      const evidence = allEvidence.filter(e => e.userId === user.username).length;

      const totalContributions = messages + issues + thoughts + reforms + evidence;
      const score = issues * 20 + thoughts * 15 + reforms * 25 + evidence * 30;

      const avatar = user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

      const badges: string[] = [];
      if (totalContributions >= 10) badges.push('Verified');
      if (messages >= 30) badges.push('Top Reporter');
      if (thoughts >= 15) badges.push('Gold');
      else if (thoughts >= 8) badges.push('Silver');
      else if (thoughts >= 3) badges.push('Bronze');

      const palette = [
        'from-amber-400 to-yellow-600',
        'from-slate-300 to-slate-500',
        'from-amber-600 to-amber-800',
        'from-blue-400 to-blue-600',
        'from-green-400 to-green-600',
        'from-purple-400 to-purple-600',
        'from-rose-400 to-rose-600',
        'from-cyan-400 to-cyan-600',
      ];

      return {
        id: index + 1,
        name: user.name,
        username: user.username,
        avatar,
        role: issues > 0 ? 'Issue Reporter' : messages > 0 ? 'Active Citizen' : 'New Member',
        points: score,
        reports: messages + issues,
        solutions: reforms + thoughts,
        badges,
        rank: 0,
        color: palette[index % palette.length],
      };
    });

    leaderboard.sort((a, b) => b.points - a.points);
    leaderboard.forEach((person, i) => { person.rank = i + 1; });

    return leaderboard.slice(0, limit);
  },
});
