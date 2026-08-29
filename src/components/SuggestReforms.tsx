'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { FiZap, FiThumbsUp, FiThumbsDown, FiClock, FiEye, FiX } from 'react-icons/fi';
import { useReforms } from '@/hooks/useReforms';
import { useAuth } from '@/hooks/useAuth';

const tabs = ['Trending', 'Recent', 'Top Voted', 'Under Review'];

export default function SuggestReforms() {
  const { user } = useAuth();
  const { allReforms, toggleLike, toggleDislike, voteReform } = useReforms();
  const [activeTab, setActiveTab] = useState('Trending');
  const [showLoginPopup, setShowLoginPopup] = useState(false);

  const combinedList = useMemo(() => {
    const items = allReforms.map(r => ({
      id: r.id,
      title: r.title,
      description: r.description,
      author: r.userName,
      avatar: (r.userName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)) || r.userName.slice(0, 2).toUpperCase(),
      votes: r.votes,
      likes: r.likes,
      dislikes: r.dislikes,
      time: r.timestamp > Date.now() - 3600000 ? Math.floor((Date.now() - r.timestamp) / 60000) + 'm ago'
        : r.timestamp > Date.now() - 86400000 ? Math.floor((Date.now() - r.timestamp) / 3600000) + 'h ago'
        : Math.floor((Date.now() - r.timestamp) / 86400000) + 'd ago',
      status: r.status === 'proposed' ? 'New' : r.status === 'in-discussion' ? 'Under Review' : 'Adopted',
      category: r.category.charAt(0).toUpperCase() + r.category.slice(1),
    }));
    return items;
  }, [allReforms]);

  const sortedList = useMemo(() => {
    const list = [...combinedList];
    switch (activeTab) {
      case 'Trending':
        return list.sort((a, b) => (b.likes + b.votes) - (a.likes + a.votes));
      case 'Recent':
        return list.sort((a, b) => (a.id < b.id ? 1 : -1));
      case 'Top Voted':
        return list.sort((a, b) => b.votes - a.votes);
      default:
        return list;
    }
  }, [activeTab, combinedList]);

  const isUnderReview = activeTab === 'Under Review';

  const requireAuth = (action: () => void) => {
    if (!user) { setShowLoginPopup(true); return; }
    action();
  };

  return (
    <section id="reforms" className="py-20 lg:py-28 bg-gradient-to-b from-transparent via-accent-saffron/[0.02] to-transparent dark:via-amber-500/[0.02] scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-border dark:border-border-dark text-sm font-medium mb-4">
            <FiZap className="w-4 h-4 text-accent-saffron" />
            Suggest Reforms
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-primary dark:text-white mb-4">
            Ideas for a Better Nation
          </h2>
          <p className="text-muted dark:text-muted-dark text-lg">
            Propose reforms, vote on ideas, and help shape policy. The best ideas reach policymakers.
          </p>
        </motion.div>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-4 mb-8 justify-center">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                activeTab === tab
                  ? 'gradient-bg text-white shadow-lg shadow-primary/25'
                  : 'glass border border-border dark:border-border-dark text-muted dark:text-muted-dark hover:text-primary dark:hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
          <Link href="/thoughts" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl gradient-bg text-white text-sm font-semibold shadow-lg shadow-primary/25 whitespace-nowrap">
            <FiZap className="w-4 h-4" />
            Propose Idea
          </Link>
        </div>

        {isUnderReview ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-4">
              <FiEye className="w-8 h-8 text-amber-500" />
            </div>
            <h3 className="text-xl font-bold text-primary dark:text-white mb-2">Under Review</h3>
            <p className="text-muted dark:text-muted-dark max-w-md">
              Your ideas are being evaluated by our team. Once approved, they will appear here for community voting.
            </p>
          </motion.div>
        ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {sortedList.length === 0 && (
            <div className="md:col-span-2 text-center py-16">
              <p className="text-muted dark:text-muted-dark">No reforms yet. Be the first to propose one!</p>
            </div>
          )}
          {sortedList.map((reform, index) => (
            <motion.div
              key={reform.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="p-6 rounded-2xl glass border border-border dark:border-border-dark card-hover"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg ${
                      reform.status === 'Trending' ? 'bg-purple-500/10 text-purple-500' :
                      reform.status === 'Popular' ? 'bg-green-500/10 text-green-500' :
                      reform.status === 'Under Review' ? 'bg-amber-500/10 text-amber-500' :
                      'bg-blue-500/10 text-blue-500'
                    }`}>
                      {reform.status}
                    </span>
                    <span className="text-[11px] font-medium text-muted dark:text-muted-dark ml-2">{reform.category}</span>
                  </div>
                  <span className="flex items-center gap-1 text-[11px] text-muted dark:text-muted-dark shrink-0">
                    <FiClock className="w-3 h-3" />
                    {reform.time}
                  </span>
                </div>

                <h3 className="text-base font-semibold text-primary dark:text-white mb-2">
                  {reform.title}
                </h3>
                <p className="text-sm text-muted dark:text-muted-dark leading-relaxed mb-4">
                  {reform.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-light to-primary flex items-center justify-center text-white text-[10px] font-bold">
                      {reform.avatar}
                    </div>
                    <span className="text-xs font-medium text-primary dark:text-white">{reform.author}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted dark:text-muted-dark">
                    <button onClick={() => requireAuth(() => toggleLike(reform.id))} className="inline-flex items-center gap-1 px-2 py-1 rounded-md transition-all duration-200 hover:bg-emerald-500/10 hover:text-emerald-500">
                      <FiThumbsUp className="w-3.5 h-3.5" />
                      {reform.likes}
                    </button>
                    <button onClick={() => requireAuth(() => toggleDislike(reform.id))} className="inline-flex items-center gap-1 px-2 py-1 rounded-md transition-all duration-200 hover:bg-red-500/10 hover:text-red-500">
                      <FiThumbsDown className="w-3.5 h-3.5" />
                      {reform.dislikes}
                    </button>
                    <button onClick={() => requireAuth(() => voteReform(reform.id, 1))} className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold tracking-wide transition-all duration-200 border bg-white/80 dark:bg-white/10 text-primary dark:text-white border-accent-saffron/40 dark:border-accent-saffron/60">
                      Vote • {reform.votes}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        )}
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
                <p className="text-sm text-muted dark:text-muted-dark mb-5">Please sign in to avail this features</p>
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
