'use client';

import { useReforms, REFORM_STATUSES, CATEGORIES } from '@/hooks/useReforms';
import { useAuth } from '@/hooks/useAuth';
import ReformCard from './ReformCard';
import ReformForm from './ReformForm';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrendingUp, FiFilter } from 'react-icons/fi';

export default function ReformList() {
  const { user } = useAuth();
  const {
    reforms, submitReform, voteReform, toggleLike, toggleDislike,
    activeCategory, setActiveCategory,
    activeStatus, setActiveStatus,
  } = useReforms();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-border dark:border-border-dark text-sm font-medium mb-4">
          <FiTrendingUp className="w-4 h-4 text-accent-saffron" />
          Policy Reforms
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-primary dark:text-white mb-2">
          Propose & Vote on Reforms
        </h1>
        <p className="text-sm text-muted dark:text-muted-dark">
          Propose policy changes, vote on ideas, and track their progress from proposal to adoption.
        </p>
      </motion.div>

      <ReformForm onSubmit={submitReform} user={user} />

      {/* Filter bar */}
      <div className="flex items-center gap-2 mb-5 overflow-x-auto scrollbar-hide pb-1">
        <FiFilter className="w-3.5 h-3.5 text-muted dark:text-muted-dark shrink-0" />
        {/* Status filters */}
          {REFORM_STATUSES.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveStatus(s.id)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all ${
                activeStatus === s.id
                  ? 'gradient-bg text-white shadow-lg shadow-primary/25'
                  : 'glass border border-border dark:border-border-dark text-muted dark:text-muted-dark hover:text-primary dark:hover:text-white'
              }`}
            >
              {s.label}
            </button>
          ))}
          <button
            onClick={() => setActiveStatus('all')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all ${
              activeStatus === 'all'
                ? 'gradient-bg text-white shadow-lg shadow-primary/25'
                : 'glass border border-border dark:border-border-dark text-muted dark:text-muted-dark hover:text-primary dark:hover:text-white'
            }`}
          >
            All Status
          </button>
        <div className="w-px h-5 bg-border dark:bg-border-dark mx-1" />
        {/* Category filters */}
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-3 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all ${
            activeCategory === 'all'
              ? 'gradient-bg text-white shadow-lg shadow-primary/25'
              : 'glass border border-border dark:border-border-dark text-muted dark:text-muted-dark hover:text-primary dark:hover:text-white'
          }`}
        >
          All
        </button>
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all flex items-center gap-1 ${
              activeCategory === cat.id
                ? 'gradient-bg text-white shadow-lg shadow-primary/25'
                : 'glass border border-border dark:border-border-dark text-muted dark:text-muted-dark hover:text-primary dark:hover:text-white'
            }`}
          >
            <span>{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Reforms list */}
      <div className="space-y-3">
        <AnimatePresence>
          {reforms.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="w-14 h-14 mx-auto rounded-2xl bg-accent-saffron/10 flex items-center justify-center mb-4">
                <FiTrendingUp className="w-6 h-6 text-accent-saffron" />
              </div>
              <p className="text-sm text-muted dark:text-muted-dark">
                No reforms yet. Be the first to propose one!
              </p>
            </motion.div>
          ) : (
            reforms.map(r => (
              <ReformCard
                key={r.id}
                reform={r}
                onVote={voteReform}
                onLike={toggleLike}
                onDislike={toggleDislike}
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
