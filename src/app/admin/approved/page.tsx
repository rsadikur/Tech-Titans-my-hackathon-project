'use client';

import { useEffect, useState } from 'react';
import { FiCheckCircle, FiStar, FiTrash2, FiUser, FiCalendar, FiTag, FiAlertCircle } from 'react-icons/fi';
import { getLocalEvidence, saveLocalEvidence, LOCAL_EVIDENCE_EVENT, LocalEvidenceRecord } from '@/lib/localEvidence';

export default function AdminApprovedPage() {
  const [approved, setApproved] = useState<LocalEvidenceRecord[]>([]);

  useEffect(() => {
    const refresh = () => setApproved(getLocalEvidence().filter((item) => item.status === 'approved' || item.status === 'important'));
    refresh();
    window.addEventListener(LOCAL_EVIDENCE_EVENT, refresh);
    return () => window.removeEventListener(LOCAL_EVIDENCE_EVENT, refresh);
  }, []);

  const admin = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('adminSession') || '{}') : {};

  const handleRemove = async (id: string) => {
    saveLocalEvidence(getLocalEvidence().filter((item) => item._id !== id));
  };

  const handleToggleImportant = async (id: string) => {
    saveLocalEvidence(getLocalEvidence().map((item) => item._id === id ? { ...item, status: item.status === 'important' ? 'approved' : 'important' } : item));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <FiCheckCircle className="w-5 h-5 text-emerald-400" />
        <div>
          <h1 className="text-xl font-bold text-white">Approved Videos</h1>
          <p className="text-sm text-zinc-400">{approved?.length ?? 0} videos visible to the public</p>
        </div>
      </div>

      {!approved || approved.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-zinc-800 flex items-center justify-center mb-4">
            <FiAlertCircle className="w-6 h-6 text-zinc-500" />
          </div>
          <p className="text-zinc-400 text-sm">No approved videos yet</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {approved.map((item) => (
            <div key={item._id} className={`rounded-2xl border overflow-hidden group ${
              item.status === 'important' ? 'bg-amber-500/5 border-amber-500/20' : 'bg-[#0f0f1a] border-white/5'
            }`}>
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
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold text-white truncate">{item.title}</h3>
                  {item.status === 'important' && (
                    <span className="shrink-0 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-medium">Important</span>
                  )}
                </div>
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
                    onClick={() => handleToggleImportant(item._id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-all ${
                      item.status === 'important'
                        ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                        : 'bg-zinc-800 text-zinc-400 hover:bg-amber-500/10 hover:text-amber-400'
                    }`}
                  >
                    <FiStar className="w-3.5 h-3.5" /> {item.status === 'important' ? 'Unmark' : 'Important'}
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
