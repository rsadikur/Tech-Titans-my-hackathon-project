'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FiArrowLeft,
  FiCheckCircle,
  FiUploadCloud,
  FiCalendar,
  FiUser,
  FiMapPin,
  FiTag,
  FiAlertCircle,
  FiFileText,
  FiX,
} from 'react-icons/fi';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../../../convex/_generated/api';
import { Id } from '../../../../../../convex/_generated/dataModel';
import { fileToCompressedDataUrl } from '@/lib/localEvidence';

export default function IssueResolutionReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const decodedId = decodeURIComponent(id);

  const convexIssue = useQuery(api.issues.getByIdOrTitle, { identifier: decodedId });
  const resolveIssueMutation = useMutation(api.admin.resolveIssue);

  // Resolution Form State
  const [resolutionReview, setResolutionReview] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [resolutionDate, setResolutionDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [evidencePreview, setEvidencePreview] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  // Confirmation Modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (convexIssue) {
      if (convexIssue.resolutionReview) setResolutionReview(convexIssue.resolutionReview);
      if (convexIssue.resolutionNotes) setResolutionNotes(convexIssue.resolutionNotes);
      if (convexIssue.resolutionEvidenceUrl) setEvidencePreview(convexIssue.resolutionEvidenceUrl);
      if (convexIssue.resolvedAt) {
        setResolutionDate(new Date(convexIssue.resolvedAt).toISOString().split('T')[0]);
      }
    }
  }, [convexIssue]);

  const rawIssue: any = convexIssue;
  const loading = convexIssue === undefined;

  const issue = rawIssue
    ? {
        _id: rawIssue._id,
        reportId: rawIssue.reportId || String(rawIssue._id || '').slice(-6),
        title: rawIssue.title,
        description: rawIssue.description,
        category: rawIssue.category || 'General',
        location: rawIssue.address || rawIssue.location || rawIssue.localArea || 'Phagwara',
        userName: rawIssue.createdByName || rawIssue.userName || 'Citizen',
        createdAt: rawIssue.createdAt || rawIssue._creationTime || Date.now(),
        url: rawIssue.evidence?.[0]?.url || rawIssue.url || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=1000&auto=format&fit=crop&q=80',
        type: rawIssue.evidence?.[0]?.mediaType || rawIssue.type || 'photo',
      }
    : null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError('');
    try {
      const dataUrl = await fileToCompressedDataUrl(file, 1080, 0.75);
      setEvidencePreview(dataUrl);
    } catch {
      setError('Could not process the resolution image. Please try a different photo.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolutionReview.trim()) {
      setError('Please provide a resolution review description describing how the problem was resolved.');
      return;
    }
    setError('');
    setShowConfirmModal(true);
  };

  const handleConfirmResolution = async () => {
    if (!issue) return;
    setIsSubmitting(true);

    try {
      if (convexIssue?._id) {
        await resolveIssueMutation({
          issueId: convexIssue._id as Id<'issues'>,
          resolutionReview: resolutionReview.trim(),
          resolutionEvidenceUrl: evidencePreview || undefined,
          resolutionNotes: resolutionNotes.trim() || undefined,
        });
      }

      setShowConfirmModal(false);
      router.push('/admin/solved-issues');
    } catch {
      setError('An error occurred while saving the resolution. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center text-zinc-400">
        <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-3" />
        Loading issue resolution details...
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-zinc-800 flex items-center justify-center mb-4">
          <FiAlertCircle className="w-7 h-7 text-zinc-500" />
        </div>
        <h2 className="text-lg font-bold text-white mb-2">Issue Not Found</h2>
        <p className="text-sm text-zinc-400 mb-6">The requested civic report could not be found.</p>
        <Link
          href="/admin/approved"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500 text-white text-xs font-semibold"
        >
          <FiArrowLeft className="w-4 h-4" /> Back to Approved Issues
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <Link
        href="/admin/approved"
        className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
      >
        <FiArrowLeft className="w-4 h-4" /> Back to Approved Issues
      </Link>

      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
          <FiCheckCircle className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Officially Mark Issue as Solved</h1>
          <p className="text-xs text-zinc-400">
            Submit the official administrative review & evidence to publish this resolution to citizens
          </p>
        </div>
      </div>

      {/* Issue Summary Card */}
      <div className="p-5 rounded-2xl bg-[#0f0f1a] border border-white/5 space-y-4">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span className="font-semibold text-white uppercase tracking-wider">Problem Summary</span>
          {issue.reportId && <span className="font-mono text-zinc-500">#{issue.reportId}</span>}
        </div>

        <div className="grid sm:grid-cols-12 gap-4 items-center">
          <div className="sm:col-span-4 h-36 rounded-xl overflow-hidden bg-black border border-white/5">
            {issue.url ? (
              issue.type === 'video' ? (
                <video src={issue.url} controls className="w-full h-full object-cover" />
              ) : (
                <img src={issue.url} alt={issue.title} className="w-full h-full object-cover" />
              )
            ) : (
              <div className="flex items-center justify-center h-full text-zinc-600 text-xs">
                No Preview
              </div>
            )}
          </div>

          <div className="sm:col-span-8 space-y-2">
            <h3 className="text-base font-bold text-white leading-snug">{issue.title}</h3>
            {issue.description && (
              <p className="text-xs text-zinc-400 line-clamp-2">{issue.description}</p>
            )}

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-400 pt-1">
              <span className="flex items-center gap-1">
                <FiMapPin className="w-3.5 h-3.5 text-indigo-400" />
                {issue.location || 'Reported Location'}
              </span>
              <span className="flex items-center gap-1">
                <FiUser className="w-3.5 h-3.5 text-indigo-400" />
                {issue.userName || 'Citizen'}
              </span>
              <span className="flex items-center gap-1">
                <FiCalendar className="w-3.5 h-3.5 text-indigo-400" />
                {new Date(issue.createdAt).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <FiTag className="w-3.5 h-3.5 text-indigo-400" />
                {issue.category || 'General'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Resolution Submission Form */}
      <form onSubmit={handleInitialSubmit} className="space-y-6">
        <div className="p-6 rounded-2xl bg-[#0f0f1a] border border-white/5 space-y-5">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <FiFileText className="w-4 h-4 text-emerald-400" /> Resolution Review Details
          </h2>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
              <FiAlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          {/* 1. Official Resolution Review */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-300">
              Official Resolution Review <span className="text-red-400">*</span>
            </label>
            <p className="text-[11px] text-zinc-500">
              Describe in detail what action was taken, repair work executed, or how the complaint was resolved on site.
            </p>
            <textarea
              required
              rows={4}
              value={resolutionReview}
              onChange={(e) => setResolutionReview(e.target.value)}
              placeholder="e.g. The damaged water pipeline was repaired by municipal plumbing division. Pressure testing completed successfully."
              className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* 2. Photo Evidence of Resolution */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-300">
              Resolution Photo Evidence (After Repair)
            </label>
            <p className="text-[11px] text-zinc-500">
              Upload a photographic proof showing the resolved location / repaired site.
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-1">
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-all">
                <FiUploadCloud className="w-4 h-4" />
                {isUploading ? 'Compressing...' : 'Upload After-Photo'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>

              {evidencePreview && (
                <button
                  type="button"
                  onClick={() => setEvidencePreview('')}
                  className="text-xs text-zinc-500 hover:text-red-400 flex items-center gap-1 transition-colors"
                >
                  <FiX className="w-3.5 h-3.5" /> Remove uploaded photo
                </button>
              )}
            </div>

            {/* Photo Preview */}
            {evidencePreview && (
              <div className="pt-3">
                <div className="relative w-48 h-32 rounded-xl overflow-hidden border border-emerald-500/30 bg-black">
                  <img src={evidencePreview} alt="Resolution evidence" className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-[10px] text-emerald-400 font-bold">
                    Resolved Proof
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 3. Resolution Date & Administrative Notes */}
          <div className="grid sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-zinc-300">
                Official Resolution Date <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                required
                value={resolutionDate}
                onChange={(e) => setResolutionDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-zinc-300">
                Departmental Reference / Notes (Optional)
              </label>
              <input
                type="text"
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="e.g. Ward 14 Work Order #9812"
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end gap-3">
          <Link
            href="/admin/approved"
            className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-all"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <FiCheckCircle className="w-4 h-4" /> Save & Mark Solved
          </button>
        </div>
      </form>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="max-w-md w-full rounded-2xl bg-[#0f0f1a] border border-emerald-500/30 p-6 space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto">
              <FiCheckCircle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-white">Confirm Official Resolution</h3>
              <p className="text-xs text-zinc-400">
                Are you sure you want to mark this issue as officially solved? It will be moved to the Solved Issues section and the reporter will receive an official notification.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs text-zinc-300 space-y-1">
              <p className="font-semibold text-white truncate">{issue.title}</p>
              <p className="text-[11px] text-zinc-500 italic line-clamp-2">&ldquo;{resolutionReview}&rdquo;</p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmResolution}
                disabled={isSubmitting}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all cursor-pointer"
              >
                {isSubmitting ? 'Publishing...' : 'Yes, Confirm Solved'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
