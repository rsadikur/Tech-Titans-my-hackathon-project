'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FiCheckCircle,
  FiUser,
  FiCalendar,
  FiMapPin,
  FiShield,
  FiFileText,
  FiTrendingUp,
  FiPlusCircle,
  FiAward,
} from 'react-icons/fi';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { LOCAL_EVIDENCE_KEY } from '@/lib/localEvidence';

export default function PublicSolvedIssuesPage() {
  const convexSolved = useQuery(api.issues.listResolved, {});
  const [search, setSearch] = useState('');

  // Delete legacy local storage data on load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(LOCAL_EVIDENCE_KEY);
      } catch {}
    }
  }, []);

  const solvedIssues = (convexSolved || []).map((item: any) => ({
    _id: item._id,
    title: item.title,
    description: item.description,
    category: item.category,
    location: item.address || item.localArea || item.district || 'Location on record',
    userName: item.createdByName || 'Citizen',
    createdAt: item.createdAt || item._creationTime,
    resolvedAt: item.resolvedAt || item.updatedAt || item.createdAt,
    resolvedBy: item.resolvedBy || 'Verified by Admin',
    resolutionReview: item.resolutionReview,
    resolutionNotes: item.resolutionNotes,
    resolutionEvidence: item.afterUrl || item.resolutionEvidenceUrl,
    url: item.beforeUrl || item.mediaUrl || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=1000&auto=format&fit=crop&q=80',
    type: item.evidence?.[0]?.mediaType || 'photo',
  }));

  const filtered = solvedIssues.filter((issue) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      issue.title.toLowerCase().includes(q) ||
      (issue.location && issue.location.toLowerCase().includes(q)) ||
      (issue.category && issue.category.toLowerCase().includes(q)) ||
      (issue.userName && issue.userName.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-border dark:border-border-dark text-sm font-medium mb-4">
            <FiAward className="w-4 h-4 text-emerald-500" />
            <span>Civic Achievements</span>
            <span className="text-emerald-500 font-semibold">— Verified Impact</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary dark:text-white mb-4">
            Officially Solved Issues
          </h1>
          <p className="text-muted dark:text-muted-dark text-base sm:text-lg leading-relaxed">
            Real civic problems reported by citizens, verified by authorities, and successfully resolved on the ground.
          </p>
        </motion.div>

        {/* Search Bar & Stats */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by issue, location or reporter..."
            className="w-full sm:max-w-md px-4 py-2.5 rounded-xl glass border border-border dark:border-border-dark text-sm text-primary dark:text-white placeholder:text-muted dark:placeholder:text-muted-dark focus:outline-none focus:ring-2 focus:ring-primary/20"
          />

          <div className="text-xs text-muted dark:text-muted-dark shrink-0">
            Showing <strong className="text-primary dark:text-white">{filtered.length}</strong> verified resolutions
          </div>
        </div>

        {/* Solved Issues Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 px-4 rounded-3xl glass border border-border dark:border-border-dark my-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4 text-emerald-500">
              <FiCheckCircle className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-semibold text-primary dark:text-white mb-2">
              No Solved Issues Found
            </h3>
            <p className="text-sm text-muted dark:text-muted-dark max-w-md mx-auto mb-6">
              {search ? 'Try adjusting your search terms.' : 'Issues marked as resolved by authorities will appear here.'}
            </p>
            <Link
              href="/evidence"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-bg text-white font-semibold text-sm shadow-lg shadow-primary/25 hover:opacity-90 transition-all"
            >
              <FiPlusCircle className="w-4 h-4" />
              Report an Issue
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {filtered.map((item, index) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="rounded-3xl glass border border-emerald-500/20 overflow-hidden shadow-xl shadow-black/5 hover:shadow-2xl transition-all duration-300"
              >
                {/* Header Banner */}
                <div className="px-6 py-4 bg-emerald-500/[0.04] border-b border-border dark:border-border-dark flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center gap-1.5">
                      <FiCheckCircle className="w-3.5 h-3.5" /> RESOLVED & VERIFIED
                    </span>
                    <span className="text-xs text-muted dark:text-muted-dark">
                      Reported by <strong className="text-primary dark:text-white">{item.userName || 'Citizen'}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted dark:text-muted-dark">
                    <span className="flex items-center gap-1">
                      <FiCalendar className="w-3.5 h-3.5 text-emerald-500" />
                      Solved on:{' '}
                      <strong className="text-primary dark:text-white">
                        {new Date(item.resolvedAt || item.createdAt).toLocaleDateString(undefined, {
                          dateStyle: 'medium',
                        })}
                      </strong>
                    </span>
                  </div>
                </div>

                <div className="p-6 sm:p-8 space-y-6">
                  {/* Before / After Comparison */}
                  <div className="grid sm:grid-cols-2 gap-6">
                    {/* Before Card */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-amber-500">
                        <span>🔴 BEFORE (Problem Reported)</span>
                      </div>
                      <div className="relative rounded-2xl overflow-hidden bg-black/5 dark:bg-black/40 h-60 border border-border dark:border-border-dark">
                        {item.url ? (
                          item.type === 'video' ? (
                            <video src={item.url} controls className="w-full h-full object-cover" />
                          ) : (
                            <img src={item.url} alt="Problem before" className="w-full h-full object-cover" />
                          )
                        ) : (
                          <div className="flex items-center justify-center h-full text-muted text-xs">
                            No photo available
                          </div>
                        )}
                      </div>
                    </div>

                    {/* After Card */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-emerald-500">
                        <span>🟢 AFTER (Resolved Problem)</span>
                      </div>
                      <div className="relative rounded-2xl overflow-hidden bg-black/5 dark:bg-black/40 h-60 border border-emerald-500/30">
                        {item.resolutionEvidence ? (
                          <img
                            src={item.resolutionEvidence}
                            alt="Problem resolved"
                            className="w-full h-full object-cover"
                          />
                        ) : item.url ? (
                          <img src={item.url} alt="Resolved" className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex items-center justify-center h-full text-muted text-xs">
                            Resolution proof on file
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Issue Info and Official Resolution Review */}
                  <div className="grid lg:grid-cols-12 gap-6 pt-2">
                    <div className="lg:col-span-6 space-y-3">
                      <h3 className="text-xl font-bold text-primary dark:text-white">{item.title}</h3>
                      {item.description && (
                        <p className="text-sm text-muted dark:text-muted-dark leading-relaxed">
                          {item.description}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted dark:text-muted-dark pt-1">
                        <span className="flex items-center gap-1.5">
                          <FiMapPin className="w-3.5 h-3.5 text-primary dark:text-blue-400" />
                          {item.location || 'Reported Location'}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <FiShield className="w-3.5 h-3.5 text-sky-500" />
                          {item.resolvedBy || 'Verified by Admin'}
                        </span>
                      </div>
                    </div>

                    {/* Official Resolution Review Box */}
                    <div className="lg:col-span-6 p-5 rounded-2xl bg-emerald-500/[0.06] border border-emerald-500/20 space-y-2.5">
                      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                        <FiFileText className="w-4 h-4" />
                        Official Resolution Review
                      </div>
                      <p className="text-sm text-primary/90 dark:text-zinc-200 leading-relaxed font-medium">
                        &ldquo;{item.resolutionReview || 'Problem was inspected, repaired and verified on ground by municipal authorities.'}&rdquo;
                      </p>
                      {item.resolutionNotes && (
                        <p className="text-xs text-muted dark:text-muted-dark pt-2 border-t border-emerald-500/10">
                          <strong>Reference Info:</strong> {item.resolutionNotes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-border dark:border-border-dark flex-wrap gap-3">
                    <span className="text-xs text-muted dark:text-muted-dark">
                      Reported by{' '}
                      <Link
                        href={`/citizen/${encodeURIComponent(item.userName || 'citizen')}/solved-issues`}
                        className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                      >
                        {item.userName || 'Citizen'}
                      </Link>
                    </span>

                    <Link
                      href={`/issues/${encodeURIComponent(item._id)}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl gradient-bg text-white text-xs font-semibold shadow-md shadow-primary/20 hover:opacity-90 transition-all"
                    >
                      View Full Before/After Details &rarr;
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link
            href="/#issues"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl glass border border-border dark:border-border-dark text-primary dark:text-white font-semibold text-sm hover:bg-black/5 dark:hover:bg-white/5 transition-all"
          >
            <FiTrendingUp className="w-4 h-4" /> View All Active Civic Issues
          </Link>
        </div>
      </div>
    </div>
  );
}
