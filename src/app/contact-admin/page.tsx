'use client';

import { useState, useEffect } from 'react';
import { useMutation, api } from '@/lib/convexDisconnected';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiSend, FiMessageSquare, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import { saveContactMessage } from '@/lib/adminData';

export default function ContactAdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const sendMessage = useMutation(api.contact.send);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    if (!user) return;
    setSending(true);
    setError('');
    try {
      saveContactMessage({
        userId: user.username,
        userName: user.name,
        email: email.trim() || undefined,
        subject: subject.trim(),
        message: message.trim(),
      });
      await sendMessage({
        userId: user.username,
        userName: user.name,
        email: email.trim() || undefined,
        subject: subject.trim(),
        message: message.trim(),
      });
      setSent(true);
    } catch (err) {
      setError('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen pt-16 lg:pt-20 flex items-center justify-center bg-gray-50 dark:bg-[#0a0a14]">
        <div className="text-center p-8 max-w-md">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center mb-4">
            <FiMessageSquare className="w-7 h-7 text-indigo-500" />
          </div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">Sign in to contact Admin</h2>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mb-4">Please sign in to send a message to the admin team.</p>
          <Link
            href="/signin"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-indigo-500/25 transition-all"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (sent) {
    return (
      <div className="min-h-screen pt-16 lg:pt-20 flex items-center justify-center bg-gray-50 dark:bg-[#0a0a14]">
        <div className="text-center p-8 max-w-md">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mb-4">
            <FiCheckCircle className="w-7 h-7 text-emerald-500" />
          </div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">Message Sent!</h2>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mb-6">Your message has been sent to the admin team. They will get back to you soon.</p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => { setSent(false); setSubject(''); setMessage(''); setEmail(''); }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-indigo-500/25 transition-all"
            >
              Send Another
            </button>
            <Link
              href="/"
              className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-gray-700 dark:text-zinc-300 text-sm font-semibold hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 lg:pt-20 bg-gray-50 dark:bg-[#0a0a14]">
      <div className="max-w-lg mx-auto px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200 transition-colors mb-6"
        >
          <FiArrowLeft className="w-4 h-4" />
          Back
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-sm">
            <FiMessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-800 dark:text-white/90">Talk to Admin</h1>
            <p className="text-sm text-gray-500 dark:text-zinc-400">Send a message to the admin team</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1.5 block">Your Name</label>
            <input
              value={user.name}
              disabled
              className="w-full px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm text-gray-500 dark:text-zinc-400 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1.5 block">
              Email <span className="text-gray-400 dark:text-zinc-500 font-normal">(optional)</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#16162a] border border-gray-200 dark:border-white/10 text-sm text-gray-800 dark:text-white/90 placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1.5 block">Subject</label>
            <input
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="What is this about?"
              className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#16162a] border border-gray-200 dark:border-white/10 text-sm text-gray-800 dark:text-white/90 placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1.5 block">Message</label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Write your message here..."
              rows={5}
              className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#16162a] border border-gray-200 dark:border-white/10 text-sm text-gray-800 dark:text-white/90 placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 transition-all resize-none"
            />
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 px-4 py-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={sending || !subject.trim() || !message.trim()}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-indigo-500/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <FiSend className="w-4 h-4" />
            {sending ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </div>
  );
}
