'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiX } from 'react-icons/fi';
import { CATEGORIES, MessageCategory } from '@/hooks/useChat';

interface CategoryPickerProps {
  text: string;
  onSend: (category: MessageCategory) => void;
  onClose: () => void;
}

export default function CategoryPicker({ text, onSend, onClose }: CategoryPickerProps) {
  const [selected, setSelected] = useState<MessageCategory | null>(null);

  const handleSend = () => {
    onSend(selected || 'general');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-40 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-lg mx-4 mb-0 sm:mb-0 rounded-t-3xl sm:rounded-3xl glass border border-border dark:border-border-dark shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-border dark:border-border-dark">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-primary dark:text-white">Choose a category</h3>
              <p className="text-[11px] text-muted dark:text-muted-dark truncate mt-0.5">
                &ldquo;{text}&rdquo;
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-muted dark:text-muted-dark transition-colors ml-2 shrink-0"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>

          {/* Category grid */}
          <div className="p-5">
            <div className="grid grid-cols-2 gap-2.5">
              {CATEGORIES.filter(c => c.key !== 'general').map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setSelected(cat.key)}
                  className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    selected === cat.key
                      ? `bg-gradient-to-br ${cat.color} text-white shadow-lg`
                      : 'bg-white/50 dark:bg-white/5 border border-border dark:border-border-dark text-muted dark:text-muted-dark hover:text-primary dark:hover:text-white hover:bg-white/80 dark:hover:bg-white/10'
                  }`}
                >
                  <span className="text-base">{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>

            {/* Send button */}
            <button
              onClick={handleSend}
              className="w-full mt-4 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl gradient-bg text-white font-semibold text-sm hover:opacity-90 transition-all duration-200 shadow-lg shadow-primary/25"
            >
              <FiSend className="w-4 h-4" />
              {selected ? `Send as ${CATEGORIES.find(c => c.key === selected)?.label}` : 'Send as General'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
