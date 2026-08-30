'use client';

import { FiUsers, FiVideo, FiClock, FiCheckCircle, FiTrendingUp, FiAward } from 'react-icons/fi';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';

const cards = [
  { label: 'Total Users', key: 'users', icon: FiUsers, color: 'from-blue-500/20 to-blue-600/10 text-blue-400' },
  { label: 'Total Reports', key: 'total', icon: FiVideo, color: 'from-violet-500/20 to-violet-600/10 text-violet-400' },
  { label: 'Pending Approvals', key: 'pending', icon: FiClock, color: 'from-amber-500/20 to-amber-600/10 text-amber-400' },
  { label: 'Verified & Active', key: 'approved', icon: FiCheckCircle, color: 'from-emerald-500/20 to-emerald-600/10 text-emerald-400' },
  { label: 'Solved Issues', key: 'solved', icon: FiAward, color: 'from-sky-500/20 to-sky-600/10 text-sky-400' },
];

export default function AdminDashboardPage() {
  const convexStats = useQuery(api.dashboard.getStats);
  const convexIssues = useQuery(api.issues.list, {});
  const convexUsers = useQuery(api.users.list, {});

  const totalUsers = convexUsers ? convexUsers.length : (convexStats?.activeCitizens ?? 0);
  const totalReports = convexIssues ? convexIssues.length : (convexStats?.totalReports ?? 0);
  const pendingApprovals = convexIssues ? convexIssues.filter((i) => i.status === 'Reported').length : 0;
  const approvedActive = convexIssues ? convexIssues.filter((i) => i.status === 'Verified' || i.status === 'In Progress').length : 0;
  const solvedIssues = convexIssues ? convexIssues.filter((i) => i.status === 'Resolved').length : (convexStats?.resolvedIssues ?? 0);
  const resolutionRate = totalReports > 0 ? Math.round((solvedIssues / totalReports) * 100) : 0;

  const data: Record<string, number> = {
    users: totalUsers,
    total: totalReports,
    pending: pendingApprovals,
    approved: approvedActive,
    solved: solvedIssues,
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-sm text-zinc-400 mt-1">Real-time overview of platform activity & civic resolution</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.key} className="rounded-2xl bg-[#0f0f1a] border border-white/5 p-4 space-y-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{data[card.key] ?? 0}</p>
                <p className="text-xs text-zinc-400 mt-0.5">{card.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-[#0f0f1a] border border-white/5 p-5 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-white">
            <FiTrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Resolution Rate</span>
          </div>
          <p className="text-3xl font-bold text-emerald-400">{resolutionRate}%</p>
          <p className="text-xs text-zinc-400">Of all reported issues have been officially resolved & verified</p>
        </div>

        <div className="rounded-2xl bg-[#0f0f1a] border border-white/5 p-5 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-white">
            <FiAward className="w-4 h-4 text-sky-400" />
            <span>Verified Citizen Impact</span>
          </div>
          <p className="text-3xl font-bold text-sky-400">{solvedIssues}</p>
          <p className="text-xs text-zinc-400">Civic issues marked as Solved on ground</p>
        </div>
      </div>
    </div>
  );
}
