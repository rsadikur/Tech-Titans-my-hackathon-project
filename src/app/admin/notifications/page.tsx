'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { FiSend, FiUsers, FiUser, FiBell } from 'react-icons/fi';

export default function AdminNotificationsPage() {
  const sendNotification = useMutation(api.notifications.sendAdminNotification);
  const [target, setTarget] = useState<'all' | 'user'>('all');
  const [username, setUsername] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;
    if (target === 'user' && !username.trim()) return;
    setSending(true);
    try {
      await sendNotification({
        target,
        username: target === 'user' ? username.trim() : undefined,
        title: title.trim(),
        message: message.trim(),
      });
      setSent(true);
      setTitle('');
      setMessage('');
      setUsername('');
    } catch (err) {
      console.error('Failed to send:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <FiBell className="w-5 h-5 text-indigo-400" />
        <div>
          <h1 className="text-xl font-bold text-white">Send Notification</h1>
          <p className="text-sm text-zinc-400 mt-1">Send alerts to users across the platform</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-2xl bg-[#0f0f1a] border border-white/5 p-5 space-y-4">
          <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Recipients</p>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setTarget('all')}
              className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${
                target === 'all'
                  ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                  : 'border-white/5 text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <FiUsers className="w-4 h-4" />
              All Users
            </button>
            <button
              type="button"
              onClick={() => setTarget('user')}
              className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${
                target === 'user'
                  ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                  : 'border-white/5 text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <FiUser className="w-4 h-4" />
              Specific User
            </button>
          </div>

          {target === 'user' && (
            <div>
              <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Username</label>
              <input
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 transition-all"
              />
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-[#0f0f1a] border border-white/5 p-5 space-y-4">
          <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Notification Content</p>

          <div>
            <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Title</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Maintenance Alert"
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Message</label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Write your notification message..."
              rows={4}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 transition-all resize-none"
            />
          </div>
        </div>

        {sent && (
          <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-sm text-emerald-400">
            Notification sent successfully
          </div>
        )}

        <button
          type="submit"
          disabled={sending || !title.trim() || !message.trim() || (target === 'user' && !username.trim())}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold transition-all shadow-lg shadow-indigo-600/25"
        >
          <FiSend className="w-4 h-4" />
          {sending ? 'Sending...' : `Send Notification to ${target === 'all' ? 'All Users' : username}`}
        </button>
      </form>
    </div>
  );
}
