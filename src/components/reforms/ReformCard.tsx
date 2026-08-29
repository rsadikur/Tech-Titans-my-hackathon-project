'use client';

import { Reform, REFORM_STATUSES, CATEGORIES } from '@/hooks/useReforms';
import { FiArrowUp, FiArrowDown, FiClock, FiThumbsUp, FiThumbsDown } from 'react-icons/fi';
import { motion } from 'framer-motion';

interface ReformCardProps {
  reform: Reform;
  onVote: (id: string, delta: number) => void;
  onLike: (id: string) => void;
  onDislike: (id: string) => void;
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

export default function ReformCard({ reform, onVote, onLike, onDislike }: ReformCardProps) {
  const cat = CATEGORIES.find(c => c.id === reform.category) || CATEGORIES[0];
  const statusInfo = REFORM_STATUSES.find(s => s.id === reform.status) || REFORM_STATUSES[0];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-2xl glass border border-border dark:border-border-dark card-hover"
    >
      <div className="flex items-start gap-3">
        <div className="flex flex-col items-center gap-0.5 shrink-0">
          <button
            onClick={() => onVote(reform.id, 1)}
            className="p-1.5 rounded-lg hover:bg-primary/5 dark:hover:bg-blue-500/5 transition-colors"
          >
            <FiArrowUp className="w-4 h-4 text-muted dark:text-muted-dark hover:text-emerald-500" />
          </button>
          <span className="text-xs font-bold text-primary dark:text-white min-w-[20px] text-center">
            {reform.votes}
          </span>
          <button
            onClick={() => onVote(reform.id, -1)}
            className="p-1.5 rounded-lg hover:bg-primary/5 dark:hover:bg-blue-500/5 transition-colors"
          >
            <FiArrowDown className="w-4 h-4 text-muted dark:text-muted-dark hover:text-red-500" />
          </button>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium border ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border ${cat.color}`}>
              {cat.icon} {cat.label}
            </span>
          </div>
          <h3 className="text-sm font-bold text-primary dark:text-white mb-1">
            {reform.title}
          </h3>
          <p className="text-xs text-muted dark:text-muted-dark leading-relaxed mb-3">
            {reform.description}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-md bg-gradient-to-br ${getAvatarColor(reform.userName)} flex items-center justify-center text-white text-[8px] font-bold`}>
                {getInitials(reform.userName)}
              </div>
              <span className="text-[10px] text-muted dark:text-muted-dark">{reform.userName}</span>
              <span className="flex items-center gap-1 text-[10px] text-muted dark:text-muted-dark">
                <FiClock className="w-2.5 h-2.5" />
                {formatTime(reform.timestamp)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onLike(reform.id)}
                className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-emerald-500/10 transition-colors text-muted dark:text-muted-dark hover:text-emerald-500"
              >
                <FiThumbsUp className="w-3 h-3" />
                <span className="text-[10px] font-medium">{reform.likes}</span>
              </button>
              <button
                onClick={() => onDislike(reform.id)}
                className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-red-500/10 transition-colors text-muted dark:text-muted-dark hover:text-red-500"
              >
                <FiThumbsDown className="w-3 h-3" />
                <span className="text-[10px] font-medium">{reform.dislikes}</span>
              </button>
              <div className="flex items-center gap-1">
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
