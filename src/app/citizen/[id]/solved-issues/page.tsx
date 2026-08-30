'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FiArrowLeft,
  FiCheckCircle,
  FiUser,
  FiCalendar,
  FiMapPin,
  FiThumbsUp,
  FiFileText,
  FiAward,
  FiExternalLink,
  FiShield,
} from 'react-icons/fi';
import { useQuery } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';

export default function CitizenSolvedIssuesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const decodedId = decodeURIComponent(id);

  const convexSolved = useQuery(api.issues.listCitizenResolved, { username: decodedId });
  const citizenStats = useQuery(api.dashboard.getCitizenStats, { username: decodedId });

  const targetName = decodedId.replace(/[-_]/g, ' ');
  const targetUsername = decodedId.toLowerCase().replace(/\s+/g, '_');

  const initials = targetName
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const citizenInfo = {
    name: targetName,
    username: targetUsername,
    avatar: initials || 'CP',
  };

  const solvedIssues = (convexSolved || []).map((item: any) => ({
    _id: item._id,
    title: item.title,
    description: item.description,
    category: item.category,
    location: item.address || item.localArea || item.district || 'Location on record',
    userName: item.createdByName || targetName,
    createdAt: item.createdAt || item._creationTime,
    resolvedAt: item.resolvedAt || item.updatedAt || item.createdAt,
    resolvedBy: item.resolvedBy || 'Verified by Admin',
    resolutionReview: item.resolutionReview,
    resolutionNotes: item.resolutionNotes,
    resolutionEvidence: item.afterUrl || item.resolutionEvidenceUrl,
    url: item.beforeUrl || item.mediaUrl || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=1000&auto=format&fit=crop&q=80',
    type: item.evidence?.[0]?.mediaType || 'photo',
  }));

  const totalReportsCount = citizenStats?.reportedCount ?? solvedIssues.length;

  return (
    <div className="min-h-screen pt-28 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Back Link */}
        <div>
          <Link
            href="/#leaderboard"
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted dark:text-muted-dark hover:text-primary dark:hover:text-white transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" /> Back to Citizens Making a Difference
          </Link>
        </div>

        {/* Citizen Profile Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 sm:p-8 rounded-3xl glass border border-emerald-500/20 shadow-xl shadow-black/5"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-xl sm:text-2xl shadow-lg shadow-emerald-500/25 shrink-0">
                {citizenInfo?.avatar || 'CP'}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-primary dark:text-white capitalize">
                    {citizenInfo?.name || 'Citizen'}
                  </h1>
                  <span className="text-xs text-muted dark:text-muted-dark font-mono">
                    @{citizenInfo?.username}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap mt-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                    <FiCheckCircle className="w-3.5 h-3.5" />
                    {solvedIssues.length} {solvedIssues.length === 1 ? 'Issue Solved' : 'Issues Solved'}
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-semibold">
                    ?? Verified Impact
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-6 sm:border-l sm:border-border sm:dark:border-border-dark sm:pl-8">
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-primary dark:text-white">
                  {totalReportsCount}
                </div>
                <div className="text-xs text-muted dark:text-muted-dark">Reports Filed</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                  {solvedIssues.length}
                </div>
                <div className="text-xs text-muted dark:text-muted-dark">Verified Solved</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Solved Issues List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-primary dark:text-white flex items-center gap-2">
              <FiAward className="w-5 h-5 text-emerald-500" />
              Verified Solved Issues by {citizenInfo?.name || 'this Citizen'}
            </h2>
            <span className="text-xs text-muted dark:text-muted-dark">
              {solvedIssues.length} {solvedIssues.length === 1 ? 'resolution' : 'resolutions'}
            </span>
          </div>

          {solvedIssues.length === 0 ? (
            <div className="text-center py-16 rounded-3xl glass border border-border dark:border-border-dark p-6">
              <p className="text-sm text-muted dark:text-muted-dark">
                No officially verified solved issues found for this citizen.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {solvedIssues.map((issue) => (
                <motion.div
                  key={issue._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-3xl glass border border-emerald-500/20 overflow-hidden shadow-lg shadow-black/5 hover:shadow-xl transition-all"
                >
                  {/* Card Top Ribbon */}
                  <div className="px-6 py-3.5 bg-emerald-500/[0.05] border-b border-border dark:border-border-dark flex items-center justify-between gap-4 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      <FiCheckCircle className="w-4 h-4" /> RESOLVED & VERIFIED
                    </span>
                    <div className="flex items-center gap-4 text-xs text-muted dark:text-muted-dark">
                      <span className="flex items-center gap-1">
                        <FiCalendar className="w-3.5 h-3.5 text-emerald-500" />
                        Solved on:{' '}
                        <strong className="text-primary dark:text-white">
                          {new Date(issue.resolvedAt || issue.createdAt).toLocaleDateString(undefined, {
                            dateStyle: 'medium',
                          })}
                        </strong>
                      </span>
                      <span className="flex items-center gap-1">
                        <FiShield className="w-3.5 h-3.5 text-sky-500" />
                        {issue.resolvedBy || 'Verified by Admin'}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* Before & After Media Previews */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      {/* Before */}
                      <div className="space-y-1.5">
                        <span className="text-xs font-bold text-amber-500">?? BEFORE (Problem)</span>
                        <div className="relative rounded-2xl overflow-hidden bg-black/5 dark:bg-black/40 h-48 border border-border dark:border-border-dark">
                          {issue.url ? (
                            issue.type === 'video' ? (
                              <video src={issue.url} controls className="w-full h-full object-cover" />
                            ) : (
                              <img src={issue.url} alt="Before" className="w-full h-full object-cover" />
                            )
                          ) : (
                            <div className="flex items-center justify-center h-full text-xs text-muted">
                              No photo
                            </div>
                          )}
                        </div>
                      </div>

                      {/* After */}
                      <div className="space-y-1.5">
                        <span className="text-xs font-bold text-emerald-500">?? AFTER (Resolution)</span>
                        <div className="relative rounded-2xl overflow-hidden bg-black/5 dark:bg-black/40 h-48 border border-emerald-500/30">
                          {issue.resolutionEvidence ? (
                            <img
                              src={issue.resolutionEvidence}
                              alt="After resolved"
                              className="w-full h-full object-cover"
                            />
                          ) : issue.url ? (
                            <img src={issue.url} alt="Resolved" className="w-full h-full object-cover" />
                          ) : (
                            <div className="flex items-center justify-center h-full text-xs text-muted">
                              Proof on record
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Title, Details & Resolution Review */}
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-bold text-primary dark:text-white mb-1">
                          {issue.title}
                        </h3>
                        {issue.description && (
                          <p className="text-xs text-muted dark:text-muted-dark leading-relaxed">
                            {issue.description}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted dark:text-muted-dark">
                        <span className="flex items-center gap-1">
                          <FiMapPin className="w-3.5 h-3.5 text-primary dark:text-blue-400" />
                          {issue.location || 'Reported Location'}
                        </span>
                        <span className="flex items-center gap-1">
                          <FiCalendar className="w-3.5 h-3.5" />
                          Reported: {new Date(issue.createdAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1 text-accent-saffron font-semibold">
                          <FiThumbsUp className="w-3.5 h-3.5" />
                          Community supported
                        </span>
                      </div>

                      {/* Resolution Review Summary Box */}
                      <div className="p-4 rounded-2xl bg-emerald-500/[0.06] border border-emerald-500/20 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          <FiFileText className="w-4 h-4" />
                          Official Resolution Review
                        </div>
                        <p className="text-xs text-primary/90 dark:text-zinc-200 leading-relaxed font-medium">
                          &ldquo;{issue.resolutionReview || 'Problem was inspected, repaired and verified on ground by municipal authorities.'}&rdquo;
                        </p>
                      </div>

                      {/* Click to open full details page */}
                      <div className="pt-2">
                        <Link
                          href={`/issues/${encodeURIComponent(issue._id)}`}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-bg text-white text-xs font-semibold shadow-md shadow-primary/20 hover:opacity-90 transition-all"
                        >
                          View Full Before/After Details <FiExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
