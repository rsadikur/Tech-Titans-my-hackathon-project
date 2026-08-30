'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FiCheckCircle,
  FiUser,
  FiCalendar,
  FiMapPin,
  FiTag,
  FiAward,
  FiEdit3,
  FiArrowRight,
  FiThumbsUp,
  FiShield,
  FiFileText,
} from 'react-icons/fi';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';
import { LOCAL_EVIDENCE_KEY } from '@/lib/localEvidence';

export default function AdminSolvedIssuesPage() {
  const convexSolved = useQuery(api.issues.listResolved, {});
  const reopenIssueMutation = useMutation(api.admin.reopenIssue);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(LOCAL_EVIDENCE_KEY);
      } catch {}
    }
  }, []);

  const handleReopen = async (id: string) => {
    if (!window.confirm('Are you sure you want to move this issue back to Approved/Active status?')) return;
    try {
      await reopenIssueMutation({ issueId: id as Id<'issues'> });
    } catch (err) {
      console.warn('Reopen error:', err);
    }
  };

  const solvedIssues = (convexSolved || []).map((i: any) => ({
    _id: i._id,
    reportId: i.reportId || String(i._id || '').slice(-6),
    title: i.title,
    description: i.description,
    category: i.category,
    location: i.address || i.location || i.localArea || 'Phagwara',
    userName: i.createdByName || i.userName || 'Citizen',
    createdAt: i.createdAt || i._creationTime,
    status: 'resolved' as const,
    resolvedAt: i.resolvedAt || i.updatedAt,
    resolvedBy: i.resolvedBy || 'Verified by Admin',
    resolutionReview: i.resolutionReview,
    resolutionNotes: i.resolutionNotes,
    resolutionEvidence: i.afterUrl || i.resolutionEvidenceUrl,
    url: i.beforeUrl || i.evidence?.[0]?.url || i.url || 'https://images.unsplash.com/photo-1578874691223-a49626e8517e?w=1000&auto=format&fit=crop&q=80',
    type: (i.evidence?.[0]?.mediaType === 'video' ? 'video' : 'photo') as 'video' | 'photo',
  }));

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <FiCheckCircle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Officially Solved Issues</h1>
            <p className="text-sm text-zinc-400">
              {solvedIssues.length} {solvedIssues.length === 1 ? 'civic problem' : 'civic problems'} successfully resolved & verified
            </p>
          </div>
        </div>

        <Link
          href="/admin/approved"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 text-xs font-semibold transition-all"
        >
          View Active Issues <FiArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Solved Issues Cards */}
      {solvedIssues.length === 0 ? (
        <div className="text-center py-20 rounded-2xl bg-[#0f0f1a] border border-white/5 space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-zinc-800 flex items-center justify-center">
            <FiAward className="w-7 h-7 text-zinc-500" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white mb-1">No Solved Issues Yet</h2>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              When approved civic reports are repaired or resolved on-ground, mark them as solved from the Approved Videos section.
            </p>
          </div>
          <Link
            href="/admin/approved"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold transition-all"
          >
            <FiCheckCircle className="w-4 h-4" /> Go to Approved Issues
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {solvedIssues.map((item) => (
            <div
              key={item._id}
              className="rounded-2xl bg-[#0f0f1a] border border-emerald-500/20 overflow-hidden shadow-lg shadow-black/20"
            >
              {/* Card Header */}
              <div className="px-6 py-4 bg-emerald-500/[0.04] border-b border-white/5 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-2.5">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
                    <FiCheckCircle className="w-3.5 h-3.5" /> RESOLVED & VERIFIED
                  </span>
                  {item.reportId && (
                    <span className="text-xs text-zinc-500 font-mono">#{item.reportId}</span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs text-zinc-400">
                  <span className="flex items-center gap-1">
                    <FiCalendar className="w-3.5 h-3.5 text-emerald-400" />
                    Solved on:{' '}
                    <strong className="text-white">
                      {new Date(item.resolvedAt || item.createdAt).toLocaleDateString(undefined, {
                        dateStyle: 'medium',
                      })}
                    </strong>
                  </span>
                  <span className="flex items-center gap-1">
                    <FiShield className="w-3.5 h-3.5 text-sky-400" />
                    {item.resolvedBy || 'Verified by Admin'}
                  </span>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Media Comparison: BEFORE vs AFTER */}
                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Before */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-zinc-400">
                      <span className="font-bold text-amber-400 flex items-center gap-1">
                        🔴 BEFORE (Problem Reported)
                      </span>
                    </div>
                    <div className="relative rounded-xl overflow-hidden bg-black h-52 border border-white/5">
                      {item.url ? (
                        item.type === 'video' ? (
                          <video src={item.url} controls className="w-full h-full object-cover" />
                        ) : (
                          <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
                        )
                      ) : (
                        <div className="flex items-center justify-center h-full text-zinc-600 text-xs">
                          No preview
                        </div>
                      )}
                    </div>
                  </div>

                  {/* After */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-zinc-400">
                      <span className="font-bold text-emerald-400 flex items-center gap-1">
                        🟢 AFTER (Resolution Evidence)
                      </span>
                    </div>
                    <div className="relative rounded-xl overflow-hidden bg-black h-52 border border-emerald-500/30">
                      {item.resolutionEvidence ? (
                        <img
                          src={item.resolutionEvidence}
                          alt="Resolution proof"
                          className="w-full h-full object-cover"
                        />
                      ) : item.url ? (
                        <img src={item.url} alt="Resolved" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex items-center justify-center h-full text-zinc-600 text-xs">
                          Resolution proof on record
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Issue Details & Resolution Review */}
                <div className="grid md:grid-cols-12 gap-6 pt-2">
                  <div className="md:col-span-6 space-y-3">
                    <div>
                      <h3 className="text-base font-bold text-white mb-1">{item.title}</h3>
                      {item.description && (
                        <p className="text-xs text-zinc-400 leading-relaxed">{item.description}</p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-zinc-400">
                      <span className="flex items-center gap-1.5">
                        <FiMapPin className="w-3.5 h-3.5 text-indigo-400" />
                        {item.location || 'Reported Spot'}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <FiUser className="w-3.5 h-3.5 text-indigo-400" />
                        Reporter: <strong className="text-zinc-200">{item.userName || 'Citizen'}</strong>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <FiTag className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="capitalize">{item.category || 'General'}</span>
                      </span>
                    </div>
                  </div>

                  {/* Resolution Review Box */}
                  <div className="md:col-span-6 p-4 rounded-xl bg-emerald-500/[0.05] border border-emerald-500/20 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                      <FiFileText className="w-4 h-4" />
                      Official Resolution Review
                    </div>
                    <p className="text-xs text-zinc-200 leading-relaxed">
                      {item.resolutionReview || 'Problem was inspected, repaired and verified on ground by municipal authorities.'}
                    </p>
                    {item.resolutionNotes && (
                      <p className="text-[11px] text-zinc-400 pt-2 border-t border-emerald-500/10">
                        <strong>Notes:</strong> {item.resolutionNotes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-white/5 flex-wrap gap-3">
                  <div className="flex items-center gap-3 text-xs text-zinc-400">
                    <span className="flex items-center gap-1 text-accent-saffron font-semibold">
                      <FiThumbsUp className="w-3.5 h-3.5" />
                      Citizen impact recognized
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/solved-issues/review/${item._id}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-all"
                    >
                      <FiEdit3 className="w-3.5 h-3.5" /> Edit Review
                    </Link>
                    <button
                      onClick={() => handleReopen(item._id)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold transition-all cursor-pointer"
                    >
                      Re-open Issue
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
