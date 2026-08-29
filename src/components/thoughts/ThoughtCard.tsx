'use client';

import { Thought, CATEGORIES } from '@/hooks/useThoughts';
import { FiArrowUp, FiClock } from 'react-icons/fi';
import { motion } from 'framer-motion';

interface ThoughtCardProps {
  thought: Thought;
  onUpvote: (id: string) => void;
}

function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}
function getAvatarColor(name: string): string {
  const colors = ['from-blue-500 to-blue-600', 'from-emerald-500 to-emerald-600', 'from-purple-500 to-purple-600', 'from-amber-500 to-amber-600', 'from-rose-500 to-rose-600'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

export default function ThoughtCard({ thought, onUpvote }: ThoughtCardProps) {
  const cat = CATEGORIES.find(c => c.id === thought.category) || CATEGORIES[0];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-2xl glass border border-border dark:border-border-dark card-hover"
    >
      <div className="flex items-start gap-3">
        <button
          onClick={() => onUpvote(thought.id)}
          className="flex flex-col items-center gap-0.5 px-2 py-2 rounded-xl hover:bg-primary/5 dark:hover:bg-blue-500/5 transition-colors shrink-0"
        >
          <FiArrowUp className="w-4 h-4 text-muted dark:text-muted-dark" />
          <span className="text-xs font-bold text-primary dark:text-white">{thought.upvotes}</span>
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${getAvatarColor(thought.userName)} flex items-center justify-center text-white text-[9px] font-bold`}>
              {getInitials(thought.userName)}
            </div>
            <span className="text-xs font-medium text-primary dark:text-white">{thought.userName}</span>
            <span className="flex items-center gap-1 text-[10px] text-muted dark:text-muted-dark ml-auto">
              <FiClock className="w-3 h-3" />
              {formatTime(thought.timestamp)}
            </span>
          </div>
          <p className="text-sm text-primary dark:text-white leading-relaxed mb-3">
            {thought.text}
          </p>
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-medium border ${cat.color}`}>
            {cat.icon} {cat.label}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
