'use client';

import { useEffect, useState } from 'react';
import { FiMessageSquare, FiMail, FiCheck } from 'react-icons/fi';
import { getContactMessages, markContactMessageAsRead, CONTACT_EVENT, ContactMessage } from '@/lib/adminData';

export default function AdminContactMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);

  useEffect(() => {
    const refresh = () => setMessages(getContactMessages());
    refresh();
    window.addEventListener(CONTACT_EVENT, refresh);
    return () => window.removeEventListener(CONTACT_EVENT, refresh);
  }, []);

  const handleMarkAsRead = (id: string) => {
    markContactMessageAsRead(id);
  };

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FiMessageSquare className="w-5 h-5 text-indigo-400" />
        <div>
          <h1 className="text-xl font-bold text-white">Contact Messages</h1>
          <p className="text-sm text-zinc-400 mt-1">Messages sent by users</p>
        </div>
      </div>

      {!messages ? (
        <div className="text-center py-12 text-zinc-500 text-sm">Loading...</div>
      ) : messages.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 mx-auto rounded-xl bg-white/5 flex items-center justify-center mb-3">
            <FiMessageSquare className="w-6 h-6 text-zinc-500" />
          </div>
          <p className="text-zinc-400 text-sm">No messages yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((msg: any) => (
            <div
              key={msg._id}
              className={`rounded-2xl border p-4 transition-all ${msg.read ? 'bg-[#0f0f1a] border-white/5' : 'bg-indigo-500/5 border-indigo-500/20'}`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-white">{msg.userName}</span>
                    <span className="text-xs text-zinc-500">@{msg.userId}</span>
                    {!msg.read && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />}
                  </div>
                  <h3 className="text-sm font-medium text-white/90">{msg.subject}</h3>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-zinc-500">{formatDate(msg.createdAt)}</span>
                  {!msg.read && (
                    <button
                      onClick={() => handleMarkAsRead(msg._id)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all"
                      title="Mark as read"
                    >
                      <FiCheck className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed">{msg.message}</p>
              {msg.email && (
                <div className="flex items-center gap-1.5 mt-2 text-xs text-zinc-500">
                  <FiMail className="w-3 h-3" />
                  {msg.email}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
