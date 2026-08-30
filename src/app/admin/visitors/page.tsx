'use client';

import { FiUsers, FiBarChart2, FiGlobe, FiCalendar, FiExternalLink, FiMapPin } from 'react-icons/fi';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';

export default function AdminVisitorsPage() {
  const convexVisits = useQuery(api.visitors.list, { limit: 100 });

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getPageLabel = (page: string) => {
    if (page === '/') return 'Home';
    return page.split('/').filter(Boolean).join(' › ') || page;
  };

  const visits = (convexVisits || []).map((v: any) => ({
    id: v._id,
    sessionId: v.sessionId,
    userId: v.userId,
    userName: v.userName,
    page: v.page,
    timestamp: v.createdAt || v._creationTime,
    country: v.country || 'India',
    source: v.source,
  }));

  const total = visits.length;
  const unique = new Set(visits.map((v: any) => v.sessionId || v.userId || v.id)).size;
  const todayStart = new Date().setHours(0, 0, 0, 0);
  const todayVisits = visits.filter((v: any) => (v.timestamp || 0) >= todayStart);
  const todayCount = todayVisits.length;
  const todayUnique = new Set(todayVisits.map((v: any) => v.sessionId || v.userId || v.id)).size;

  const stats = {
    total,
    unique,
    today: todayCount,
    todayUnique,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FiUsers className="w-5 h-5 text-indigo-400" />
        <div>
          <h1 className="text-xl font-bold text-white">Visitor Tracking</h1>
          <p className="text-sm text-zinc-400 mt-1">Real-time telemetry and page visits across CivicPulse</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Visits', value: stats.total, icon: FiGlobe, color: 'from-blue-500 to-blue-600' },
          { label: 'Unique Visitors', value: stats.unique, icon: FiUsers, color: 'from-emerald-500 to-emerald-600' },
          { label: 'Visits Today', value: stats.today, icon: FiCalendar, color: 'from-amber-500 to-amber-600' },
          { label: 'Unique Today', value: stats.todayUnique, icon: FiBarChart2, color: 'from-purple-500 to-purple-600' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl bg-[#0f0f1a] border border-white/5 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs text-zinc-500">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-[#0f0f1a] border border-white/5 overflow-hidden">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Recent Activity Log</h2>
          <span className="text-xs text-zinc-500">{visits.length} recorded events</span>
        </div>

        {visits.length === 0 ? (
          <div className="text-center py-12 text-zinc-500 text-sm">No activity recorded yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-xs text-zinc-500">
                  <th className="text-left px-4 py-3 font-medium">Visitor</th>
                  <th className="text-left px-4 py-3 font-medium">Page Visited</th>
                  <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Region</th>
                  <th className="text-left px-4 py-3 font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {visits.slice(0, 50).map((v: any) => (
                  <tr key={v.id || v.sessionId + v.timestamp} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium text-xs">{v.userName || 'Guest Visitor'}</span>
                        {v.userId && v.userId !== 'anonymous' && (
                          <span className="text-[10px] text-zinc-500">@{v.userId}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-md bg-white/5 text-zinc-300 text-xs font-mono">
                        {getPageLabel(v.page)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-400 text-xs hidden sm:table-cell">
                      <span className="flex items-center gap-1">
                        <FiMapPin className="w-3 h-3 text-zinc-500" />
                        {v.country || 'India'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-500 text-xs">{formatDate(v.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
