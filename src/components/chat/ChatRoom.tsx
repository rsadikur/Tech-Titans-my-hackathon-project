'use client';

import { useChat } from '@/hooks/useChat';
import ChatHeader from './ChatHeader';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHash, FiTrendingUp, FiMessageCircle, FiX, FiAlertTriangle } from 'react-icons/fi';

const TRENDING_TOPICS = [
  { tag: '#CivicPulse2026', label: 'CivicPulse 2026', msgs: 142, color: 'from-indigo-500 to-purple-600' },
  { tag: '#RoadSafety', label: 'Road Safety', msgs: 89, color: 'from-amber-500 to-orange-600' },
  { tag: '#Education', label: 'Education', msgs: 76, color: 'from-emerald-500 to-teal-600' },
  { tag: '#CleanCity', label: 'Clean City', msgs: 54, color: 'from-sky-500 to-cyan-600' },
  { tag: '#Employment', label: 'Employment', msgs: 41, color: 'from-rose-500 to-pink-600' },
];

export default function ChatRoom() {
  const {
    messages, typing, onlineCount, sendError, setSendError,
    input, setInput,
    sendMessage, handleTyping, user,
  } = useChat();

  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'instant' });
  }, [messages]);

  const handleSend = (text: string) => {
    sendMessage(text, 'general');
  };

  return (
    <div className="relative flex h-full bg-gray-50/80 dark:bg-[#0a0a14]">
      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        <ChatHeader groupName="CivicPulse — Public Chat" onlineCount={onlineCount} />

        <div ref={scrollRef} className="flex-1 overflow-y-auto py-2 space-y-0.5 scrollbar-hide">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500/10 to-blue-600/10 dark:from-indigo-400/5 dark:to-blue-500/5 flex items-center justify-center mb-5 border border-indigo-200/40 dark:border-indigo-500/10 shadow-sm">
                <FiMessageCircle className="w-8 h-8 text-indigo-400 dark:text-indigo-400/60" />
              </div>
              <h3 className="text-base font-semibold text-gray-800 dark:text-white/90 mb-1">Welcome to Public Chat</h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400 max-w-xs leading-relaxed">
                Start a conversation. Your voice matters to the community.
              </p>
            </div>
          )}
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <div key={msg.id} className="group">
                <MessageBubble message={msg} isOwn={user?.username === msg.userId} />
              </div>
            ))}
          </AnimatePresence>

          <AnimatePresence>
            {typing && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2.5 px-3 py-1"
              >
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0 shadow-sm`}>
                  {typing.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div className="px-4 py-3 rounded-2xl rounded-tl-md bg-white dark:bg-[#16162a] border border-gray-200/60 dark:border-white/[0.06] shadow-sm">
                  <div className="flex items-center gap-1">
                    <motion.span
                      animate={{ y: [0, -4, 0] }}
                      transition={{ repeat: Infinity, duration: 0.8, delay: 0 }}
                      className="w-2 h-2 rounded-full bg-indigo-400 dark:bg-indigo-500"
                    />
                    <motion.span
                      animate={{ y: [0, -4, 0] }}
                      transition={{ repeat: Infinity, duration: 0.8, delay: 0.15 }}
                      className="w-2 h-2 rounded-full bg-indigo-400 dark:bg-indigo-500"
                    />
                    <motion.span
                      animate={{ y: [0, -4, 0] }}
                      transition={{ repeat: Infinity, duration: 0.8, delay: 0.3 }}
                      className="w-2 h-2 rounded-full bg-indigo-400 dark:bg-indigo-500"
                    />
                  </div>
                </div>
                <span className="text-[11px] text-gray-400 dark:text-zinc-500">{typing.name} typing...</span>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>

        <AnimatePresence>
          {sendError && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-6"
              onClick={() => setSendError('')}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                onClick={e => e.stopPropagation()}
                className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#16162a] border border-gray-200 dark:border-white/[0.06] shadow-2xl p-6 text-center"
              >
                <div className="w-14 h-14 mx-auto rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center mb-4">
                  <FiAlertTriangle className="w-7 h-7 text-red-500" />
                </div>
                <h3 className="text-base font-semibold text-gray-800 dark:text-white/90 mb-2">Message Blocked</h3>
                <p className="text-sm text-gray-500 dark:text-zinc-400 leading-relaxed mb-5">
                  Your message could not be sent. It may contain hateful or violent words that are not allowed in this community.
                </p>
                <button
                  onClick={() => setSendError('')}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-indigo-500/25 transition-all"
                >
                  Got it
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        <ChatInput
          input={input}
          setInput={setInput}
          onSend={handleSend}
          onTyping={handleTyping}
          disabled={!user}
        />
      </div>

      {/* Sidebar toggle for mobile */}
      <button
        onClick={() => setShowSidebar(!showSidebar)}
        className="fixed bottom-20 right-4 z-30 lg:hidden p-3 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-lg shadow-indigo-500/25 hover:scale-105 active:scale-95 transition-all"
      >
        <FiHash className="w-5 h-5" />
      </button>

      {/* Sidebar backdrop */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={() => setShowSidebar(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: 320 }}
        animate={{ x: showSidebar ? 0 : 320 }}
        transition={{ type: 'spring', damping: 25, stiffness: 250 }}
        className="fixed right-0 top-0 bottom-0 z-40 w-72 lg:relative lg:translate-x-0 bg-white dark:bg-[#0d0d1a] border-l border-gray-200/60 dark:border-white/[0.06] overflow-y-auto scrollbar-hide"
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-4 lg:hidden">
            <h2 className="text-sm font-semibold text-gray-800 dark:text-white/90">Browse</h2>
            <button
              onClick={() => setShowSidebar(false)}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 dark:text-zinc-500"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>

          {/* Trending Topics */}
          <div className="mb-5">
            <div className="flex items-center gap-1.5 mb-3">
              <FiTrendingUp className="w-3.5 h-3.5 text-indigo-500" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400">Trending</h3>
            </div>
            <div className="space-y-1.5">
              {TRENDING_TOPICS.map((topic) => (
                <button
                  key={topic.tag}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/[0.04] transition-colors text-left group"
                >
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${topic.color} flex items-center justify-center text-white text-[10px] font-bold shrink-0 shadow-sm`}>
                    #
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 dark:text-white/80 truncate">{topic.label}</p>
                    <p className="text-[10px] text-gray-400 dark:text-zinc-500">{topic.tag} · {topic.msgs} messages</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Active Discussions */}
          <div>
            <div className="flex items-center gap-1.5 mb-3">
              <FiMessageCircle className="w-3.5 h-3.5 text-emerald-500" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400">Active Discussions</h3>
            </div>
            <div className="space-y-1.5">
              {[
                { title: 'City Infrastructure', replies: 23, users: 12, colorClass: 'bg-emerald-500' },
                { title: 'Upcoming Elections', replies: 18, users: 9, colorClass: 'bg-amber-500' },
                { title: 'Local Events', replies: 11, users: 7, colorClass: 'bg-blue-500' },
              ].map((d) => (
                <button
                  key={d.title}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/[0.04] transition-colors text-left"
                >
                  <div className={`w-1 h-8 rounded-full ${d.colorClass}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 dark:text-white/80 truncate">{d.title}</p>
                    <p className="text-[10px] text-gray-400 dark:text-zinc-500">{d.replies} replies · {d.users} users</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.aside>
    </div>
  );
}
