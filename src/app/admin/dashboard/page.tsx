'use client';

import { useEffect, useState } from 'react';
import { FiUsers, FiVideo, FiClock, FiCheckCircle, FiTrendingUp } from 'react-icons/fi';
import { getLocalEvidence, LOCAL_EVIDENCE_EVENT } from '@/lib/localEvidence';
import { getRegisteredUsers, USERS_EVENT } from '@/lib/adminData';

const cards = [
  { label: 'Total Users', key: 'users', icon: FiUsers, color: 'from-blue-500/20 to-blue-600/10 text-blue-400' },
  { label: 'Total Uploaded', key: 'total', icon: FiVideo, color: 'from-violet-500/20 to-violet-600/10 text-violet-400' },
  { label: 'Pending Approvals', key: 'pending', icon: FiClock, color: 'from-amber-500/20 to-amber-600/10 text-amber-400' },
  { label: 'Approved Videos', key: 'approved', icon: FiCheckCircle, color: 'from-emerald-500/20 to-emerald-600/10 text-emerald-400' },
];

export default function AdminDashboardPage() {
  const [data, setData] = useState(() => {
    const evidence = getLocalEvidence();
    const users = getRegisteredUsers();
    const pending = evidence.filter((e) => e.status === 'pending').length;
    const approved = evidence.filter((e) => e.status === 'approved' || e.status === 'important').length;
    return {
      users: users.length,
      total: evidence.length,
      pending,
      approved,
    };
  });

  useEffect(() => {
    const updateStats = () => {
      const evidence = getLocalEvidence();
      const users = getRegisteredUsers();
      const pending = evidence.filter((e) => e.status === 'pending').length;
      const approved = evidence.filter((e) => e.status === 'approved' || e.status === 'important').length;

      setData({
        users: users.length,
        total: evidence.length,
        pending,
        approved,
      });
    };

    updateStats();
    window.addEventListener(LOCAL_EVIDENCE_EVENT, updateStats);
    window.addEventListener(USERS_EVENT, updateStats);
    return () => {
      window.removeEventListener(LOCAL_EVIDENCE_EVENT, updateStats);
      window.removeEventListener(USERS_EVENT, updateStats);
    };
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-zinc-400 mt-1">Overview of platform activity</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.key} className="rounded-2xl bg-[#0f0f1a] border border-white/5 p-4 space-y-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{data[card.key as keyof typeof data]}</p>
                <p className="text-xs text-zinc-400">{card.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl bg-[#0f0f1a] border border-white/5 p-5">
        <div className="flex items-center gap-2 mb-4">
          <FiTrendingUp className="w-4 h-4 text-indigo-400" />
          <h2 className="text-sm font-semibold text-white">Quick Actions</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <a
            href="/admin/pending"
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/5 border border-amber-500/10 hover:bg-amber-500/10 transition-all"
          >
            <FiClock className="w-5 h-5 text-amber-400" />
            <div>
              <p className="text-sm font-medium text-white">Review Pending</p>
              <p className="text-xs text-zinc-400">{data.pending} videos waiting</p>
            </div>
          </a>
          <a
            href="/admin/approved"
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 hover:bg-emerald-500/10 transition-all"
          >
            <FiCheckCircle className="w-5 h-5 text-emerald-400" />
            <div>
              <p className="text-sm font-medium text-white">Manage Approved</p>
              <p className="text-xs text-zinc-400">{data.approved} videos live</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
