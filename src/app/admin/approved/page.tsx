'use client';

import Link from 'next/link';
import {
  FiCheckCircle,
  FiStar,
  FiTrash2,
  FiUser,
  FiCalendar,
  FiTag,
  FiAward,
} from 'react-icons/fi';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';

export default function AdminApprovedPage() {
  const convexIssues = useQuery(api.issues.list, {});
  const rejectIssueMutation = useMutation(api.admin.rejectIssue);

  const handleRemove = async (id: string) => {
    try {
      await rejectIssueMutation({ issueId: id as Id<'issues'> });
    } catch (err) {
      console.warn('Convex remove notice:', err);
    }
  };

  const handleToggleImportant = async (_id: string) => {
    // Flagging toggle
  };

  const approved = (convexIssues || [])
    .filter((i: any) => i.status !== 'Resolved')
    .map((i: any) => ({
      _id: i._id,
      reportId: i.reportId || String(i._id || '').slice(-6),
      title: i.title,
      description: i.description,
      category: i.category,
      location: i.address || i.location || i.localArea || 'Phagwara',
      userName: i.createdByName || i.userName || 'Citizen',
      createdAt: i.createdAt || i._creationTime,
      status: 'approved' as 'approved' | 'important',
      url: i.url || i.mediaUrl || i.evidence?.[0]?.url || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=1000&auto=format&fit=crop&q=80',
      type: (i.type === 'video' || i.mediaType === 'video' || i.evidence?.[0]?.mediaType === 'video' ? 'video' : 'photo') as 'video' | 'photo',
    }));

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <FiCheckCircle className="w-5 h-5 text-emerald-400" />
          <div>
            <h1 className="text-xl font-bold text-white">Approved Videos & Issues</h1>
            <p className="text-sm text-zinc-400">{approved?.length ?? 0} active live civic issues</p>
          </div>
        </div>

        <Link
          href="/admin/solved-issues"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-semibold hover:bg-sky-500/20 transition-all"
        >
          <FiAward className="w-4 h-4" />
          View Solved Issues
        </Link>
      </div>

      {!approved || approved.length === 0 ? (
        <div className="text-center py-20 bg-[#0f0f1a] rounded-2xl border border-white/5">
          <FiCheckCircle className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-400 text-sm">No approved civic issues found</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {approved.map((item: any) => (
            <div
              key={item._id}
              className="rounded-2xl bg-[#0f0f1a] border border-white/5 overflow-hidden flex flex-col justify-between"
            >
              <div>
                {item.url ? (
                  item.type === 'video' ? (
                    <video src={item.url} controls className="w-full h-48 object-cover bg-black" />
                  ) : (
                    <img src={item.url} alt={item.title} className="w-full h-48 object-cover bg-black" />
                  )
                ) : (
                  <div className="w-full h-48 bg-zinc-800 flex items-center justify-center text-zinc-500 text-xs">
                    No preview
                  </div>
                )}

                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-white line-clamp-2">{item.title}</h3>
                    {item.status === 'important' && (
                      <span className="shrink-0 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-medium">
                        Important
                      </span>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-xs text-zinc-400 line-clamp-2">{item.description}</p>
                  )}

                  <div className="flex flex-wrap gap-2 text-[10px] text-zinc-500">
                    <span className="flex items-center gap-1">
                      <FiUser className="w-3 h-3" />
                      {item.userName || 'Citizen'}
                    </span>
                    <span className="flex items-center gap-1">
                      <FiCalendar className="w-3 h-3" />
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <FiTag className="w-3 h-3" />
                      {item.category || 'General'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0 space-y-2">
                <Link
                  href={`/admin/solved-issues/review/${item._id}`}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold shadow-md shadow-emerald-500/20 transition-all duration-200"
                >
                  <FiCheckCircle className="w-4 h-4" />
                  Issue Solved
                </Link>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleImportant(item._id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-all ${
                      item.status === 'important'
                        ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                        : 'bg-zinc-800 text-zinc-400 hover:bg-amber-500/10 hover:text-amber-400'
                    }`}
                  >
                    <FiStar className="w-3.5 h-3.5" />
                    {item.status === 'important' ? 'Unmark' : 'Important'}
                  </button>
                  <button
                    onClick={() => handleRemove(item._id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-red-500/10 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-all"
                  >
                    <FiTrash2 className="w-3.5 h-3.5" /> Remove
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
