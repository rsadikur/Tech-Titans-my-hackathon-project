'use client';

import { useEffect, useState } from 'react';
import { FiUsers, FiBarChart2, FiGlobe, FiCalendar, FiExternalLink, FiMapPin } from 'react-icons/fi';
import { getTrackedVisitors, getVisitorStats, VISITORS_EVENT, VisitorRecord } from '@/lib/adminData';

export default function AdminVisitorsPage() {
  const [visits, setVisits] = useState<VisitorRecord[]>(() => getTrackedVisitors());
  const [stats, setStats] = useState(() => getVisitorStats());

  useEffect(() => {
    const refresh = () => {
      setVisits(getTrackedVisitors());
      setStats(getVisitorStats());
    };
    refresh();
    window.addEventListener(VISITORS_EVENT, refresh);
    return () => window.removeEventListener(VISITORS_EVENT, refresh);
  }, []);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FiUsers className="w-5 h-5 text-indigo-400" />
        <div>
          <h1 className="text-xl font-bold text-white">Visitor Tracking</h1>
          <p className="text-sm text-zinc-400 mt-1">Monitor page visits across the platform</p>
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

      {visits.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 mx-auto rounded-xl bg-white/5 flex items-center justify-center mb-3">
            <FiUsers className="w-6 h-6 text-zinc-500" />
          </div>
          <p className="text-zinc-400 text-sm">No visitor data yet</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-[#0f0f1a] border border-white/5 overflow-hidden">
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Recent Activity</h2>
            <span className="text-xs text-zinc-500">{visits.length} recorded visits</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">User</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">Page</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">Source</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">Country</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500">Time</th>
                </tr>
              </thead>
              <tbody>
                {visits.map((v: VisitorRecord) => (
                  <tr key={v._id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[9px] font-bold">
                          {v.userName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{v.userName}</p>
                          <p className="text-[10px] text-zinc-500">@{v.userId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex px-2 py-1 rounded-md bg-white/5 text-xs text-zinc-400">
                        {getPageLabel(v.page)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-zinc-400">{v.source || 'Direct'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-xs text-zinc-400">
                        <FiMapPin className="w-3 h-3 text-indigo-400" />
                        {v.country || 'India'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-xs text-zinc-500">{formatDate(v.createdAt)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
