'use client';

import { useEffect, useState } from 'react';
import { FiClock, FiCheck, FiX, FiTrash2, FiUser, FiCalendar, FiTag } from 'react-icons/fi';
import { getLocalEvidence, saveLocalEvidence, LOCAL_EVIDENCE_EVENT, LocalEvidenceRecord } from '@/lib/localEvidence';

export default function AdminPendingPage() {
  const [pending, setPending] = useState<LocalEvidenceRecord[]>([]);

  useEffect(() => {
    const refresh = () => setPending(getLocalEvidence().filter((item) => item.status === 'pending'));
    refresh();
    window.addEventListener(LOCAL_EVIDENCE_EVENT, refresh);
    return () => window.removeEventListener(LOCAL_EVIDENCE_EVENT, refresh);
  }, []);

  const admin = typeof window !== 'undefined' ? JSON.parse(sessionStorage.getItem('adminSession') || '{}') : {};

  const handleApprove = async (id: string) => {
    try {
      saveLocalEvidence(getLocalEvidence().map((item) => item._id === id ? { ...item, status: 'approved' } : item));
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Failed to approve');
    }
  };

  const handleReject = async (id: string) => {
    saveLocalEvidence(getLocalEvidence().map((item) => item._id === id ? { ...item, status: 'rejected' } : item));
  };

  const handleDelete = async (id: string) => {
    saveLocalEvidence(getLocalEvidence().filter((item) => item._id !== id));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <FiClock className="w-5 h-5 text-amber-400" />
        <div>
          <h1 className="text-xl font-bold text-white">Pending Videos</h1>
          <p className="text-sm text-zinc-400">{pending?.length ?? 0} videos awaiting review</p>
        </div>
      </div>

      {!pending || pending.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-zinc-800 flex items-center justify-center mb-4">
            <FiCheck className="w-6 h-6 text-zinc-500" />
          </div>
          <p className="text-zinc-400 text-sm">No pending videos</p>
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
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition-all"
                  >
                    <FiCheck className="w-3.5 h-3.5" /> Approve
                  </button>
                  <button
                    onClick={() => handleReject(item._id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-red-500/10 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-all"
                  >
                    <FiX className="w-3.5 h-3.5" /> Reject
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="p-2 rounded-xl bg-zinc-800 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
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
