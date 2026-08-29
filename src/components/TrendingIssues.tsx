'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { FiMapPin, FiClock, FiTrendingUp, FiClock as FiClockSolid, FiThumbsUp, FiThumbsDown, FiZap, FiX } from 'react-icons/fi';
import { useIssues } from '@/hooks/useIssues';
import { useAuth } from '@/hooks/useAuth';

const categories = ['All', 'Roads', 'Education', 'Jobs', 'Corruption', 'Technology', 'Healthcare', 'Environment'];

export default function TrendingIssues() {
  const { user } = useAuth();
  const { issues, toggleLike, removeLike, toggleDislike, removeDislike } = useIssues();
  const [activeCat, setActiveCat] = useState('All');
  const [sortBy, setSortBy] = useState<'popular' | 'newest'>('popular');
  const [liked, setLiked] = useState<Record<number, 'like' | 'dislike' | null>>({});
  const [showLoginPopup, setShowLoginPopup] = useState(false);

  const requireAuth = (action: () => void) => {
    if (!user) { setShowLoginPopup(true); return; }
    action();
  };

  const handleLike = (id: number) => {
    requireAuth(() => {
      const current = liked[id];
      if (current === 'like') { removeLike(id); setLiked(prev => ({ ...prev, [id]: null })); }
      else if (current === 'dislike') { removeDislike(id); toggleLike(id); setLiked(prev => ({ ...prev, [id]: 'like' })); }
      else { toggleLike(id); setLiked(prev => ({ ...prev, [id]: 'like' })); }
    });
  };

  const handleDislike = (id: number) => {
    requireAuth(() => {
      const current = liked[id];
      if (current === 'dislike') { removeDislike(id); setLiked(prev => ({ ...prev, [id]: null })); }
      else if (current === 'like') { removeLike(id); toggleDislike(id); setLiked(prev => ({ ...prev, [id]: 'dislike' })); }
      else { toggleDislike(id); setLiked(prev => ({ ...prev, [id]: 'dislike' })); }
    });
  };

  // Memoized so filter+sort only re-runs when data or controls change
  const filtered = useMemo(() => {
    const base = activeCat === 'All'
      ? [...issues]
      : issues.filter(i => i.category === activeCat);
    if (sortBy === 'popular') {
      base.sort((a, b) => b.likes - a.likes);
    } else {
      base.sort((a, b) => b.createdAt - a.createdAt);
    }
    return base;
  }, [issues, activeCat, sortBy]);
  return (
    <section id="issues" className="py-20 lg:py-28 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-border dark:border-border-dark text-sm font-medium mb-4">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Trending Issues
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-primary dark:text-white mb-4">
            What Citizens Are Reporting
          </h2>
          <p className="text-muted dark:text-muted-dark text-lg">
            Real issues flagged by your fellow citizens. Each report is verified and tracked until resolved.
          </p>
        </motion.div>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-4 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCat(cat)}
              className={`px-5 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                activeCat === cat
                  ? 'gradient-bg text-white shadow-lg shadow-primary/25'
                  : 'glass border border-border dark:border-border-dark text-muted dark:text-muted-dark hover:text-primary dark:hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => setSortBy('popular')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              sortBy === 'popular'
                ? 'bg-primary/10 dark:bg-white/10 text-primary dark:text-white shadow-sm'
                : 'text-muted dark:text-muted-dark hover:text-primary dark:hover:text-white'
            }`}
          >
            <FiTrendingUp className="w-4 h-4" />
            Popular
          </button>
          <button
            onClick={() => setSortBy('newest')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              sortBy === 'newest'
                ? 'bg-primary/10 dark:bg-white/10 text-primary dark:text-white shadow-sm'
                : 'text-muted dark:text-muted-dark hover:text-primary dark:hover:text-white'
            }`}
          >
            <FiClockSolid className="w-4 h-4" />
            Newest
          </button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((issue, index) => (
            <motion.div
              key={issue.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4, delay: Math.min(index, 5) * 0.05 }}
              className="group relative p-6 rounded-2xl glass border border-border dark:border-border-dark card-hover cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <span className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold ${issue.statusColor}`}>
                  {issue.status}
                </span>
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg ${
                  issue.urgency === 'Critical' ? 'bg-red-500/10 text-red-500' :
                  issue.urgency === 'High' ? 'bg-orange-500/10 text-orange-500' :
                  'bg-green-500/10 text-green-500'
                }`}>
                  {issue.urgency}
                </span>
              </div>

              <h3 className="text-base font-semibold text-primary dark:text-white mb-2 group-hover:text-primary-light dark:group-hover:text-blue-400 transition-colors">
                {issue.title}
              </h3>

              <div className="flex items-center gap-3 text-xs text-muted dark:text-muted-dark mb-4">
                <span className="flex items-center gap-1">
                  <FiMapPin className="w-3 h-3" />
                  {issue.location}
                </span>
                <span className="flex items-center gap-1">
                  <FiClock className="w-3 h-3" />
                  {issue.time}
                </span>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border dark:border-border-dark">
                <button onClick={() => handleLike(issue.id)} className={`inline-flex items-center gap-1.5 text-sm font-medium transition-all duration-200 ${
                  liked[issue.id] === 'like'
                    ? 'text-emerald-500'
                    : 'text-muted dark:text-muted-dark hover:text-emerald-500'
                }`}>
                  <FiThumbsUp className="w-4 h-4" />
                  {issue.likes}
                </button>
                <button onClick={() => handleDislike(issue.id)} className={`inline-flex items-center gap-1.5 text-sm font-medium transition-all duration-200 ${
                  liked[issue.id] === 'dislike'
                    ? 'text-red-500'
                    : 'text-muted dark:text-muted-dark hover:text-red-500'
                }`}>
                  <FiThumbsDown className="w-4 h-4" />
                  {issue.dislikes}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <button className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl glass border border-border dark:border-border-dark text-primary dark:text-white font-semibold text-sm hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-300">
            View All Issues
            <FiTrendingUp className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>

      <AnimatePresence>
        {showLoginPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowLoginPopup(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="relative max-w-sm w-full p-6 rounded-2xl glass border border-border dark:border-border-dark shadow-2xl"
            >
              <button onClick={() => setShowLoginPopup(false)} className="absolute top-3 right-3 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-muted dark:text-muted-dark transition-colors">
                <FiX className="w-4 h-4" />
              </button>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto rounded-xl gradient-bg flex items-center justify-center mb-3">
                  <FiZap className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-primary dark:text-white mb-1">Login Required</h3>
                <p className="text-sm text-muted dark:text-muted-dark mb-5">Please sign in to like or dislike issues.</p>
                <Link
                  href="/signin"
                  onClick={() => setShowLoginPopup(false)}
                  className="inline-flex items-center justify-center w-full px-5 py-2.5 rounded-xl gradient-bg text-white text-sm font-semibold hover:opacity-90 transition-all shadow-lg shadow-primary/25"
                >
                  Sign In
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
