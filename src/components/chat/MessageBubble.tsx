'use client';

import { ChatMessage, CATEGORIES } from '@/hooks/useChat';
import { motion } from 'framer-motion';
import { FiHeart, FiMessageSquare } from 'react-icons/fi';

interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
}

function formatTime(timestamp: number): string {
  const d = new Date(timestamp);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const hours = d.getHours().toString().padStart(2, '0');
  const mins = d.getMinutes().toString().padStart(2, '0');
  if (isToday) return `${hours}:${mins}`;
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${d.getDate()} ${months[d.getMonth()]} ${hours}:${mins}`;
}

function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function getAvatarGradient(name: string): string {
  const gradients = [
    'from-indigo-500 to-purple-600',
    'from-emerald-500 to-teal-600',
    'from-blue-500 to-cyan-600',
    'from-amber-500 to-orange-600',
    'from-rose-500 to-pink-600',
    'from-violet-500 to-fuchsia-600',
    'from-sky-500 to-blue-600',
    'from-lime-500 to-green-600',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return gradients[Math.abs(hash) % gradients.length];
}

export default function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const category = CATEGORIES.find(c => c.key === message.category);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`flex items-end gap-2.5 px-3 py-1 ${isOwn ? 'flex-row-reverse' : ''}`}
    >
      {!isOwn && (
        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${getAvatarGradient(message.userName)} flex items-center justify-center text-white text-[11px] font-bold shrink-0 shadow-sm`}>
          {getInitials(message.userName)}
        </div>
      )}
      <div className={`max-w-[80%] sm:max-w-[68%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
        {!isOwn && (
          <div className="flex items-center gap-1.5 mb-0.5 ml-0.5">
            <span className="text-xs font-semibold text-gray-700 dark:text-white/90 leading-none">{message.userName}</span>
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-zinc-500 leading-none">member</span>
          </div>
        )}
        <div className={`relative px-3.5 py-2.5 text-sm leading-relaxed ${
          isOwn
            ? 'bg-gradient-to-br from-indigo-500 to-blue-600 text-white rounded-2xl rounded-tr-md shadow-md shadow-indigo-500/15'
            : 'bg-white dark:bg-[#16162a] border border-gray-200/60 dark:border-white/[0.06] text-gray-800 dark:text-slate-200 rounded-2xl rounded-tl-md shadow-sm'
        }`}>
          {category && category.key !== 'general' && (
            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium mb-1.5 ${
              isOwn
                ? 'bg-white/15 text-white/90'
                : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-zinc-400'
            }`}>
              <span>{category.icon}</span>
              <span>{category.label}</span>
            </span>
          )}
          <div className="whitespace-pre-wrap break-words leading-relaxed">{message.text}</div>
        </div>
        <div className={`flex items-center gap-2 mt-0.5 ${isOwn ? 'flex-row-reverse' : ''}`}>
          <span className={`text-[10px] text-gray-400 dark:text-zinc-500 ${isOwn ? 'mr-0.5' : 'ml-0.5'}`}>
            {formatTime(message.timestamp)}
            {isOwn && <span className="ml-1 opacity-60">✓✓</span>}
          </span>
          {!isOwn && (
            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 dark:text-zinc-500 hover:text-rose-500 transition-colors">
                <FiHeart className="w-3 h-3" />
              </button>
              <button className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 dark:text-zinc-500 hover:text-indigo-500 transition-colors">
                <FiMessageSquare className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
