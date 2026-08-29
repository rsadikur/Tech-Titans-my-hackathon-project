'use client';

import { useState, useEffect, useCallback } from 'react';
import { useMutation, useQuery, api } from '@/lib/convexDisconnected';
import { useAuth } from './useAuth';
import { useConvexReady } from './useConvex';

export interface Thought {
  id: string;
  userId: string;
  userName: string;
  text: string;
  category: string;
  timestamp: number;
  upvotes: number;
}

export const CATEGORIES = [
  { id: 'education', label: 'Education', icon: '📚', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  { id: 'roads', label: 'Roads', icon: '🛣️', color: 'bg-orange-500/10 text-orange-500 border-orange-500/20' },
  { id: 'jobs', label: 'Jobs', icon: '💼', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
  { id: 'corruption', label: 'Corruption', icon: '🔍', color: 'bg-red-500/10 text-red-500 border-red-500/20' },
  { id: 'technology', label: 'Technology', icon: '💻', color: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20' },
  { id: 'healthcare', label: 'Healthcare', icon: '🏥', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
  { id: 'environment', label: 'Environment', icon: '🌿', color: 'bg-green-500/10 text-green-500 border-green-500/20' },
];

export function useThoughts() {
  const { user } = useAuth();
  const convexReady = useConvexReady();
  const createThought = useMutation(api.thoughts.create);
  const upvoteConvex = useMutation(api.thoughts.upvote);
  const convexThoughts = useQuery(api.thoughts.list, convexReady ? { limit: 100 } : 'skip');

  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [input, setInput] = useState('');
  const [pendingText, setPendingText] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    if (convexReady && convexThoughts) {
      const mapped = convexThoughts.map((ct: any) => ({
        id: ct._id || '',
        userId: ct.userId || '',
        userName: ct.userName || 'Anonymous',
        text: ct.text || '',
        category: ct.category || 'general',
        timestamp: ct.timestamp || Date.now(),
        upvotes: ct.upvotes || 0,
      }));
      setThoughts(mapped);
    }
  }, [convexReady, convexThoughts]);

  const requestCategory = useCallback((text: string) => {
    setPendingText(text);
  }, []);

  const cancelCategory = useCallback(() => {
    setPendingText(null);
    setInput('');
  }, []);

  const submitThought = useCallback((text: string, category: string) => {
    if (!text.trim() || !user) return;
    if (convexReady) {
      createThought({
        userId: user.username,
        userName: user.name,
        text: text.trim(),
        category,
      });
    }
    setInput('');
    setPendingText(null);
  }, [user, convexReady, createThought]);

  const upvoteThought = useCallback((id: string) => {
    if (convexReady && upvoteConvex) {
      upvoteConvex({ thoughtId: id as any });
    }
  }, [convexReady, upvoteConvex]);

  const filtered = activeCategory === 'all'
    ? thoughts
    : thoughts.filter(t => t.category === activeCategory);

  return {
    thoughts: filtered,
    allThoughts: thoughts,
    input, setInput,
    pendingText, requestCategory, cancelCategory, submitThought,
    upvoteThought,
    activeCategory, setActiveCategory,
    user,
  };
}
