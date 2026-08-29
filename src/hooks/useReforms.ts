'use client';

import { useState, useEffect, useCallback } from 'react';
import { useMutation, useQuery, api } from '@/lib/convexDisconnected';
import { useAuth } from './useAuth';
import { useConvexReady } from './useConvex';
import { CATEGORIES } from './useThoughts';

export type ReformStatus = 'proposed' | 'in-discussion' | 'adopted';

export interface Reform {
  id: string;
  userId: string;
  userName: string;
  title: string;
  description: string;
  category: string;
  status: ReformStatus;
  votes: number;
  timestamp: number;
  likes: number;
  dislikes: number;
}

export const REFORM_STATUSES: { id: ReformStatus; label: string; color: string }[] = [
  { id: 'proposed', label: 'Proposed', color: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20' },
  { id: 'in-discussion', label: 'In Discussion', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' },
  { id: 'adopted', label: 'Adopted', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
];

export { CATEGORIES };

export function useReforms() {
  const { user } = useAuth();
  const convexReady = useConvexReady();
  const createReform = useMutation(api.reforms.create);
  const toggleVoteConvex = useMutation(api.reforms.toggleVote);
  const toggleLikeConvex = useMutation(api.reforms.toggleLike);
  const toggleDislikeConvex = useMutation(api.reforms.toggleDislike);
  const convexReforms = useQuery(api.reforms.list, convexReady ? { sortBy: 'recent' } : 'skip');

  const [reforms, setReforms] = useState<Reform[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeStatus, setActiveStatus] = useState<ReformStatus | 'all'>('all');

  useEffect(() => {
    if (convexReady && convexReforms) {
      const mapped = convexReforms.map((cr: any) => ({
        id: cr._id || '',
        userId: cr.authorId || '',
        userName: cr.author || 'Anonymous',
        title: cr.title || '',
        description: cr.description || '',
        category: cr.category || 'general',
        status: (cr.status || 'proposed').toLowerCase() as ReformStatus,
        votes: cr.votes || 0,
        timestamp: cr.createdAt || Date.now(),
        likes: cr.likes || 0,
        dislikes: cr.dislikes || 0,
      }));
      setReforms(mapped);
    }
  }, [convexReady, convexReforms]);

  const submitReform = useCallback((title: string, description: string, category: string) => {
    if (!title.trim() || !description.trim() || !user) return;
    if (convexReady && createReform) {
      createReform({
        title: title.trim(),
        description: description.trim(),
        author: user.name,
        authorId: user.username,
        avatar: '',
        category,
      });
    }
  }, [user, convexReady, createReform]);

  const voteReform = useCallback((id: string, _delta: number) => {
    if (convexReady && toggleVoteConvex && user) {
      toggleVoteConvex({ reformId: id as any, userId: user.username });
    }
  }, [convexReady, toggleVoteConvex, user]);

  const toggleLike = useCallback((id: string) => {
    if (convexReady && toggleLikeConvex && user) {
      toggleLikeConvex({ reformId: id as any, userId: user.username });
    }
  }, [convexReady, toggleLikeConvex, user]);

  const toggleDislike = useCallback((id: string) => {
    if (convexReady && toggleDislikeConvex && user) {
      toggleDislikeConvex({ reformId: id as any, userId: user.username });
    }
  }, [convexReady, toggleDislikeConvex, user]);

  const updateStatus = useCallback((_id: string, _status: ReformStatus) => {
  }, []);

  const deleteReform = useCallback((_id: string) => {
  }, []);

  const filtered = reforms.filter(r => {
    if (activeCategory !== 'all' && r.category !== activeCategory) return false;
    if (activeStatus !== 'all' && r.status !== activeStatus) return false;
    return true;
  });

  return {
    reforms: filtered,
    allReforms: reforms,
    submitReform,
    voteReform,
    toggleLike,
    toggleDislike,
    updateStatus,
    deleteReform,
    activeCategory, setActiveCategory,
    activeStatus, setActiveStatus,
    user,
  };
}
