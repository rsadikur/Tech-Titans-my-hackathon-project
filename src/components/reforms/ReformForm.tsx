'use client';

import { useState } from 'react';
import { CATEGORIES } from '@/hooks/useReforms';
import { FiSend, FiHash } from 'react-icons/fi';
import { motion } from 'framer-motion';

interface ReformFormProps {
  onSubmit: (title: string, description: string, category: string) => void;
  user: { username: string; name: string } | null;
}

export default function ReformForm({ onSubmit, user }: ReformFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0].id);

  const handleSubmit = () => {
    if (!title.trim() || !description.trim() || !user) return;
    onSubmit(title.trim(), description.trim(), category);
    setTitle('');
    setDescription('');
    setCategory(CATEGORIES[0].id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-2xl glass border border-border dark:border-border-dark mb-6"
    >
      <h3 className="text-sm font-bold text-primary dark:text-white mb-3 flex items-center gap-2">
        <FiHash className="w-4 h-4 text-accent-saffron" />
        Propose a Reform
      </h3>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={user ? 'Title of your reform proposal' : 'Sign in to propose a reform'}
        disabled={!user}
        className="w-full bg-transparent border-0 outline-none text-sm font-medium text-primary dark:text-white placeholder:text-muted dark:placeholder:text-muted-dark mb-2 disabled:opacity-50"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder={user ? 'Describe your reform in detail...' : ''}
        disabled={!user}
        rows={3}
        className="w-full bg-transparent border-0 outline-none resize-none text-sm text-primary dark:text-white placeholder:text-muted dark:placeholder:text-muted-dark disabled:opacity-50"
      />
      <div className="flex items-center gap-2 pt-3 border-t border-border dark:border-border-dark">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          disabled={!user}
          className="bg-transparent text-xs text-muted dark:text-muted-dark border border-border dark:border-border-dark rounded-lg px-2.5 py-1.5 outline-none disabled:opacity-50"
        >
          {CATEGORIES.map(c => (
            <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
          ))}
        </select>
        <span className="text-[10px] text-muted dark:text-muted-dark ml-auto">
          {user ? '' : 'Sign in required'}
        </span>
        <button
          onClick={handleSubmit}
          disabled={!title.trim() || !description.trim() || !user}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl gradient-bg text-white text-xs font-semibold hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-primary/25"
        >
          <FiSend className="w-3.5 h-3.5" />
          Propose
        </button>
      </div>
    </motion.div>
  );
}
