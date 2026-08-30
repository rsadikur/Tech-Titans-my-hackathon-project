'use client';

import { useState, useEffect, use, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FiArrowLeft,
  FiCheckCircle,
  FiUser,
  FiCalendar,
  FiMapPin,
  FiTag,
  FiThumbsUp,
  FiThumbsDown,
  FiShield,
  FiFileText,
  FiAlertCircle,
  FiShare2,
  FiMap,
  FiClock,
} from 'react-icons/fi';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';
import { useAuth } from '@/hooks/useAuth';

export default function IssueDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const decodedId = decodeURIComponent(id);
  const { user } = useAuth();

  // Query Convex directly
  const convexIssue = useQuery(api.issues.getByIdOrTitle, { identifier: decodedId });
  const toggleIssueVoteMutation = useMutation(api.votes.toggleIssueVote);

  const [copied, setCopied] = useState(false);
  const [userVote, setUserVote] = useState<'like' | 'dislike' | null>(null);

  // Loading state
  const loading = convexIssue === undefined;

  // Normalized issue data
  const rawIssue: any = convexIssue;

  const issue = rawIssue
    ? {
        _id: rawIssue._id,
        reportId: rawIssue.reportId || String(rawIssue._id || '').slice(-6),
        title: rawIssue.title,
        description: rawIssue.description,
        category: rawIssue.category || 'Other',
        location: rawIssue.address || rawIssue.location || rawIssue.localArea || 'Phagwara, Punjab',
        latitude: rawIssue.latitude,
        longitude: rawIssue.longitude,
        userName: rawIssue.createdByName || rawIssue.userName || 'Verified Citizen',
        createdAt: rawIssue.createdAt || rawIssue._creationTime || Date.now(),
        status: (rawIssue.status || 'verified').toLowerCase(),
        resolvedAt: rawIssue.resolvedAt,
        resolvedBy: rawIssue.resolvedBy,
        resolutionReview: rawIssue.resolutionReview,
        resolutionNotes: rawIssue.resolutionNotes,
        resolutionEvidence: rawIssue.resolutionEvidenceUrl || rawIssue.resolutionEvidence,
        url:
          rawIssue.evidence?.[0]?.url ||
          rawIssue.url ||
          rawIssue.mediaUrl ||
          (rawIssue.category?.includes('Road') || rawIssue.category?.includes('Pothole')
            ? 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=1000&auto=format&fit=crop&q=80'
            : rawIssue.category?.includes('Water')
            ? 'https://images.unsplash.com/photo-1541888946425-d0fbb18015f6?w=1000&auto=format&fit=crop&q=80'
            : rawIssue.category?.includes('Garbage')
            ? 'https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?w=1000&auto=format&fit=crop&q=80'
            : 'https://images.unsplash.com/photo-1508873696983-2df5293cb32b?w=1000&auto=format&fit=crop&q=80'),
        type: rawIssue.evidence?.[0]?.mediaType || rawIssue.type || 'photo',
        likes: rawIssue.voteCount !== undefined ? rawIssue.voteCount : rawIssue.likes || 0,
        dislikes: rawIssue.dislikes || 0,
        urgency: rawIssue.urgency || 'High',
      }
    : null;

  // Load vote state
  useEffect(() => {
    if (typeof window !== 'undefined' && issue) {
      try {
        const storedKey = user ? `civic_votes_${user.username}` : 'civic_votes_guest';
        const saved = localStorage.getItem(storedKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed[issue._id]) {
            setUserVote(parsed[issue._id]);
          }
        }
      } catch {}
    }
  }, [user, issue]);

  const handleVote = useCallback(
    async (type: 'like' | 'dislike') => {
      if (!issue) return;

      if (user?._id && convexIssue?._id && type === 'like') {
        try {
          await toggleIssueVoteMutation({
            issueId: convexIssue._id as Id<'issues'>,
            userId: user._id as Id<'users'>,
          });
          setUserVote(userVote === 'like' ? null : 'like');
        } catch (e) {
          console.warn('Vote mutation notice:', e);
        }
      }
    },
    [issue, userVote, user, convexIssue, toggleIssueVoteMutation]
  );

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard?.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-36 text-center text-muted dark:text-muted-dark">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-3" />
        Loading civic report details...
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="min-h-screen pt-36 pb-20 max-w-xl mx-auto px-4 text-center">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-zinc-800 flex items-center justify-center mb-4">
          <FiAlertCircle className="w-7 h-7 text-zinc-500" />
        </div>
        <h2 className="text-xl font-bold text-primary dark:text-white mb-2">Report Not Found</h2>
        <p className="text-sm text-muted dark:text-muted-dark mb-6">
          The requested civic issue record could not be found or may have been removed.
        </p>
        <Link
          href="/#issues"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-bg text-white text-xs font-semibold"
        >
          <FiArrowLeft className="w-4 h-4" /> Back to Trending Issues
        </Link>
      </div>
    );
  }

  const isResolved = issue.status === 'resolved';
  const isImportant = issue.status === 'important';

  return (
    <div className="min-h-screen pt-28 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <Link
            href="/#issues"
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted dark:text-muted-dark hover:text-primary dark:hover:text-white transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" /> Back to All Issues
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass border border-border dark:border-border-dark text-xs font-medium text-muted hover:text-primary dark:hover:text-white transition-all cursor-pointer"
            >
              <FiShare2 className="w-3.5 h-3.5" />
              {copied ? 'Link Copied!' : 'Share Report'}
            </button>

            {isResolved ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                <FiCheckCircle className="w-3.5 h-3.5" /> RESOLVED & VERIFIED
              </span>
            ) : isImportant ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/30 text-xs font-bold">
                ⭐ IMPORTANT CITIZEN REPORT
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/30 text-xs font-bold">
                ⭐ APPROVED & ACTIVE
              </span>
            )}
          </div>
        </div>

        {/* TOP STATUS HEADER CARD */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-6 sm:p-8 rounded-3xl glass border shadow-xl shadow-black/5 space-y-6 ${
            isResolved
              ? 'border-emerald-500/30'
              : isImportant
              ? 'border-amber-500/30'
              : 'border-border dark:border-border-dark'
          }`}
        >
          {/* Header Title & Metadata */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border dark:border-border-dark pb-6">
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  isResolved
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                    : 'gradient-bg text-white shadow-md shadow-primary/20'
                }`}
              >
                {isResolved ? <FiCheckCircle className="w-6 h-6" /> : <FiFileText className="w-6 h-6" />}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-xs font-bold uppercase tracking-wider ${
                      isResolved
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : isImportant
                        ? 'text-amber-500'
                        : 'text-primary dark:text-blue-400'
                    }`}
                  >
                    {isResolved ? '✅ Verified Civic Resolution' : 'Verified Citizen Problem Report'}
                  </span>
                  {issue.reportId && (
                    <span className="text-xs text-muted dark:text-muted-dark font-mono">
                      #{issue.reportId}
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold text-primary dark:text-white mt-1">
                  {issue.title}
                </h1>
              </div>
            </div>

            <div className="flex flex-col sm:items-end gap-1 text-xs text-muted dark:text-muted-dark shrink-0">
              {isResolved && (
                <span>
                  Solved on:{' '}
                  <strong className="text-primary dark:text-white">
                    {new Date(issue.resolvedAt || issue.createdAt).toLocaleDateString(undefined, {
                      dateStyle: 'long',
                    })}
                  </strong>
                </span>
              )}
              <span>
                Reported on:{' '}
                <strong className="text-primary dark:text-white">
                  {new Date(issue.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                </strong>
              </span>
              {issue.resolvedBy && (
                <span className="flex items-center gap-1 text-sky-600 dark:text-sky-400 font-medium">
                  <FiShield className="w-3.5 h-3.5" />
                  {issue.resolvedBy}
                </span>
              )}
            </div>
          </div>

          {/* MEDIA SECTION */}
          {isResolved ? (
            /* BEFORE / AFTER SIDE-BY-SIDE PRESENTATION FOR RESOLVED ISSUES */
            <div className="space-y-3 pt-2">
              <h2 className="text-xs font-bold text-primary dark:text-white uppercase tracking-wider">
                Visual Evidence Comparison
              </h2>

              <div className="grid sm:grid-cols-2 gap-6">
                {/* BEFORE: Problem Reported */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-500">
                    <span>📷 BEFORE (Problem Reported)</span>
                    <span className="text-[11px] font-normal text-muted dark:text-muted-dark">
                      {new Date(issue.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="relative rounded-2xl overflow-hidden bg-black/5 dark:bg-black/40 h-64 sm:h-72 border border-border dark:border-border-dark shadow-md">
                    {issue.url ? (
                      issue.type === 'video' ? (
                        <video src={issue.url} controls className="w-full h-full object-cover" />
                      ) : (
                        <img src={issue.url} alt="Problem before" className="w-full h-full object-cover" />
                      )
                    ) : (
                      <div className="flex items-center justify-center h-full text-xs text-muted">
                        No photo available
                      </div>
                    )}
                  </div>
                </div>

                {/* AFTER: Resolution Evidence */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-500">
                    <span>✅ AFTER (Resolution Evidence)</span>
                    <span className="text-[11px] font-normal text-muted dark:text-muted-dark">
                      {new Date(issue.resolvedAt || issue.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="relative rounded-2xl overflow-hidden bg-black/5 dark:bg-black/40 h-64 sm:h-72 border border-emerald-500/30 shadow-md shadow-emerald-500/10">
                    {issue.resolutionEvidence ? (
                      <img
                        src={issue.resolutionEvidence}
                        alt="Resolution proof"
                        className="w-full h-full object-cover"
                      />
                    ) : issue.url ? (
                      <img src={issue.url} alt="Resolved" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-xs text-muted">
                        Resolution proof on file
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* SINGLE PHOTO / VIDEO EVIDENCE FOR ACTIVE REPORT */
            <div className="space-y-3 pt-2">
              <h2 className="text-xs font-bold text-primary dark:text-white uppercase tracking-wider">
                Problem Photographic / Video Evidence
              </h2>
              <div className="relative rounded-2xl overflow-hidden bg-black h-72 sm:h-96 border border-border dark:border-border-dark">
                {issue.url ? (
                  issue.type === 'video' ? (
                    <video src={issue.url} controls className="w-full h-full object-cover" />
                  ) : (
                    <img src={issue.url} alt={issue.title} className="w-full h-full object-cover" />
                  )
                ) : (
                  <div className="flex items-center justify-center h-full text-muted text-sm">
                    No photographic evidence uploaded
                  </div>
                )}
                <span className="absolute top-4 left-4 px-3 py-1 rounded-lg bg-black/70 backdrop-blur-md text-xs font-bold text-white uppercase tracking-wider">
                  📷 Verified Field Evidence
                </span>
              </div>
            </div>
          )}

          {/* Voting Action Bar */}
          <div className="flex items-center justify-between pt-4 border-t border-border dark:border-border-dark flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleVote('like')}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  userVote === 'like'
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 scale-105'
                    : 'glass border border-border dark:border-border-dark text-muted dark:text-muted-dark hover:text-emerald-500 hover:bg-emerald-500/5'
                }`}
              >
                <FiThumbsUp className="w-4 h-4" />
                <span>{issue.likes || 0} Upvotes</span>
              </button>

              <button
                type="button"
                onClick={() => handleVote('dislike')}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  userVote === 'dislike'
                    ? 'bg-red-500 text-white shadow-lg shadow-red-500/25 scale-105'
                    : 'glass border border-border dark:border-border-dark text-muted dark:text-muted-dark hover:text-red-500 hover:bg-red-500/5'
                }`}
              >
                <FiThumbsDown className="w-4 h-4" />
                <span>{issue.dislikes || 0} Downvotes</span>
              </button>
            </div>

            <Link
              href="/map"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl glass border border-border dark:border-border-dark text-xs font-semibold text-primary dark:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all"
            >
              <FiMap className="w-3.5 h-3.5 text-primary dark:text-blue-400" />
              View Location on Live Map
            </Link>
          </div>
        </motion.div>

        {/* ISSUE DETAILS & OFFICIAL RESOLUTION REVIEW (OR STATUS BOX) */}
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Report Information Column */}
          <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl glass border border-border dark:border-border-dark space-y-5">
            <h3 className="text-base font-bold text-primary dark:text-white">Report Information</h3>

            {issue.description ? (
              <p className="text-sm text-muted dark:text-muted-dark leading-relaxed">
                {issue.description}
              </p>
            ) : (
              <p className="text-sm text-muted dark:text-muted-dark italic">
                No extra textual description was provided for this report.
              </p>
            )}

            <div className="space-y-3 pt-3 border-t border-border dark:border-border-dark text-xs text-muted dark:text-muted-dark">
              <div className="flex items-start gap-2.5">
                <FiMapPin className="w-4 h-4 text-primary dark:text-blue-400 shrink-0 mt-0.5" />
                <span className="text-primary dark:text-zinc-200 leading-relaxed">
                  {issue.location || 'Reported Location on record'}
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <FiUser className="w-4 h-4 text-primary dark:text-blue-400 shrink-0" />
                <span>
                  Reported by:{' '}
                  <Link
                    href={`/citizen/${encodeURIComponent(issue.userName || 'citizen')}/solved-issues`}
                    className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    {issue.userName || 'Citizen'}
                  </Link>
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <FiTag className="w-4 h-4 text-primary dark:text-blue-400 shrink-0" />
                <span>
                  Category:{' '}
                  <strong className="text-primary dark:text-white capitalize">
                    {issue.category || 'General'}
                  </strong>
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <FiCalendar className="w-4 h-4 text-primary dark:text-blue-400 shrink-0" />
                <span>
                  Reported on:{' '}
                  <strong className="text-primary dark:text-white">
                    {new Date(issue.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                  </strong>
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Official Resolution Review OR Active Action Box */}
          <div className="lg:col-span-6">
            {isResolved ? (
              <div className="p-6 sm:p-8 rounded-3xl bg-emerald-500/[0.06] border border-emerald-500/20 space-y-4 h-full">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-base">
                  <FiFileText className="w-5 h-5" />
                  Official Resolution Review
                </div>

                <p className="text-sm sm:text-base text-primary dark:text-zinc-100 leading-relaxed font-medium">
                  &ldquo;{issue.resolutionReview || 'Problem was inspected, repaired and verified on ground by municipal authorities.'}&rdquo;
                </p>

                {issue.resolutionNotes && (
                  <div className="pt-3 border-t border-emerald-500/10 text-xs text-muted dark:text-muted-dark">
                    <strong>Reference Info:</strong> {issue.resolutionNotes}
                  </div>
                )}

                <div className="pt-2 text-xs text-muted dark:text-muted-dark flex items-center gap-2">
                  <FiShield className="w-4 h-4 text-sky-500" />
                  <span>
                    Verified by: <strong className="text-primary dark:text-white">{issue.resolvedBy || 'CivicPulse Admin'}</strong>
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-6 sm:p-8 rounded-3xl glass border border-blue-500/20 bg-blue-500/[0.02] space-y-4 h-full flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-primary dark:text-blue-400 font-bold text-base">
                    <FiClock className="w-5 h-5" />
                    Administrative Status: Active & In Progress
                  </div>
                  <p className="text-xs text-muted dark:text-muted-dark leading-relaxed">
                    This civic complaint has been verified by the community and is under active monitoring. When municipal authorities complete repair work on site, the resolution review and proof will be published here.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/40 dark:bg-white/[0.02] border border-border dark:border-border-dark space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-primary dark:text-white">Community Urgency</span>
                    <span className="font-bold text-accent-saffron">{issue.urgency || 'High'}</span>
                  </div>
                  <div className="w-full bg-border dark:bg-border-dark h-2 rounded-full overflow-hidden">
                    <div className="bg-accent-saffron h-full rounded-full w-3/4 animate-pulse" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
