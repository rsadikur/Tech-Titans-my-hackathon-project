'use client';

import { useEffect, useState } from 'react';
import { FiClock, FiCheck, FiX, FiTrash2, FiUser, FiCalendar, FiTag } from 'react-icons/fi';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';

export default function AdminPendingPage() {
  const convexPending = useQuery(api.issues.list, { status: 'Reported' });
  const updateIssueStatusMutation = useMutation(api.admin.updateIssueStatus);
  const rejectIssueMutation = useMutation(api.admin.rejectIssue);

  const handleApprove = async (id: string) => {
    try {
      await updateIssueStatusMutation({
        issueId: id as Id<'issues'>,
        status: 'Verified',
      });
    } catch (err) {
      console.warn('Convex approve notice:', err);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectIssueMutation({
        issueId: id as Id<'issues'>,
      });
    } catch (err) {
      console.warn('Convex reject notice:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await rejectIssueMutation({
        issueId: id as Id<'issues'>,
      });
    } catch (err) {
      console.warn('Convex delete notice:', err);
    }
  };

  const pending = (convexPending || []).map((i: any) => ({
    _id: i._id,
    title: i.title,
    description: i.description,
    category: i.category,
    location: i.address || i.location || i.localArea || 'Phagwara',
    userName: i.createdByName || i.userName || 'Citizen',
    createdAt: i.createdAt || i._creationTime,
    status: 'pending' as const,
    url: i.evidence?.[0]?.url || i.url || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=1000&auto=format&fit=crop&q=80',
    type: (i.evidence?.[0]?.mediaType === 'video' ? 'video' : 'photo') as 'video' | 'photo',
  }));

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <FiClock className="w-5 h-5 text-amber-400" />
        <div>
          <h1 className="text-xl font-bold text-white">Pending Reports & Approvals</h1>
          <p className="text-sm text-zinc-400">{pending?.length ?? 0} citizen complaints awaiting administrative review</p>
        </div>
      </div>

      {!pending || pending.length === 0 ? (
        <div className="text-center py-20 rounded-2xl bg-[#0f0f1a] border border-white/5">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-zinc-800 flex items-center justify-center mb-4">
            <FiCheck className="w-6 h-6 text-zinc-500" />
          </div>
          <p className="text-zinc-400 text-sm">No pending submissions awaiting review</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pending.map((item) => (
            <div key={item._id} className="rounded-2xl bg-[#0f0f1a] border border-white/5 overflow-hidden group">
              {item.url ? (
                item.type === 'video' ? (
                  <video src={item.url} controls className="w-full h-48 object-cover bg-black" />
                ) : (
                  <img src={item.url} alt={item.title} className="w-full h-48 object-cover bg-black" />
                )
              ) : (
                <div className="w-full h-48 bg-zinc-800 flex items-center justify-center text-zinc-500 text-xs">No preview</div>
              )}

              <div className="p-4 space-y-3">
                <h3 className="text-sm font-semibold text-white truncate">{item.title}</h3>
                {item.description && (
                  <p className="text-xs text-zinc-400 line-clamp-2">{item.description}</p>
                )}

                <div className="flex flex-wrap gap-2 text-[10px] text-zinc-500">
                  <span className="flex items-center gap-1"><FiUser className="w-3 h-3" />{item.userName}</span>
                  <span className="flex items-center gap-1"><FiCalendar className="w-3 h-3" />{new Date(item.createdAt).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1"><FiTag className="w-3 h-3" />{item.category}</span>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => handleApprove(item._id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition-all cursor-pointer"
                  >
                    <FiCheck className="w-3.5 h-3.5" /> Approve & Verify
                  </button>
                  <button
                    onClick={() => handleReject(item._id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-red-500/10 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-all cursor-pointer"
                  >
                    <FiX className="w-3.5 h-3.5" /> Reject
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="p-2 rounded-xl bg-zinc-800 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                  >
                    <FiTrash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
