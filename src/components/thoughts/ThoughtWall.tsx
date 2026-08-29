'use client';

import { useThoughts, CATEGORIES } from '@/hooks/useThoughts';
import ThoughtCard from './ThoughtCard';
import CategoryPicker from '@/components/chat/CategoryPicker';
import { motion, AnimatePresence } from 'framer-motion';
import { FiZap, FiSend } from 'react-icons/fi';

export default function ThoughtWall() {
  const {
    thoughts, input, setInput,
    pendingText, requestCategory, cancelCategory, submitThought,
    upvoteThought, activeCategory, setActiveCategory, user,
  } = useThoughts();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-border dark:border-border-dark text-sm font-medium mb-4">
          <FiZap className="w-4 h-4 text-accent-saffron" />
          Share Your Thoughts
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-primary dark:text-white mb-2">
          Ideas for a Better Nation
        </h1>
        <p className="text-sm text-muted dark:text-muted-dark">
          Type your thought, pick a topic category, and share it with the community.
        </p>
      </motion.div>

      {/* Input area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-4 rounded-2xl glass border border-border dark:border-border-dark mb-6"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={user ? 'What\'s your idea for change?' : 'Sign in to share your thoughts'}
          disabled={!user}
          rows={3}
          className="w-full bg-transparent border-0 outline-none resize-none text-sm text-primary dark:text-white placeholder:text-muted dark:placeholder:text-muted-dark disabled:opacity-50"
        />
        <div className="flex items-center justify-between pt-3 border-t border-border dark:border-border-dark">
          <span className="text-[10px] text-muted dark:text-muted-dark">
            {user ? 'Choose a category after posting' : 'Sign in required'}
          </span>
          <button
            onClick={() => { if (input.trim()) requestCategory(input); }}
            disabled={!input.trim() || !user}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl gradient-bg text-white text-xs font-semibold hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-primary/25"
          >
            <FiSend className="w-3.5 h-3.5" />
            Share
          </button>
        </div>
      </motion.div>

      {/* Category tabs */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1 mb-5">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
            activeCategory === 'all'
              ? 'gradient-bg text-white shadow-lg shadow-primary/25'
              : 'glass border border-border dark:border-border-dark text-muted dark:text-muted-dark hover:text-primary dark:hover:text-white'
          }`}
        >
          All Ideas
        </button>
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1 ${
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

      {/* Thoughts list */}
      <div className="space-y-3">
        <AnimatePresence>
          {thoughts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="w-14 h-14 mx-auto rounded-2xl bg-accent-saffron/10 flex items-center justify-center mb-4">
                <FiZap className="w-6 h-6 text-accent-saffron" />
              </div>
              <p className="text-sm text-muted dark:text-muted-dark">
                {activeCategory === 'all'
                  ? 'No thoughts yet. Be the first to share!'
                  : 'No thoughts in this category yet.'}
              </p>
            </motion.div>
          ) : (
            thoughts.map(t => (
              <ThoughtCard key={t.id} thought={t} onUpvote={upvoteThought} />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Category Picker Modal */}
      {pendingText && (
        <CategoryPicker
          text={pendingText}
          onSend={(category) => submitThought(pendingText, category)}
          onClose={cancelCategory}
        />
      )}
    </div>
  );
}
