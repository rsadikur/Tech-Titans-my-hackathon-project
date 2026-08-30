'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { useAuth } from './useAuth';
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
  const convexIdeas = useQuery(api.ideas.list, {});
  const createIdeaMutation = useMutation(api.ideas.create);
  const toggleIdeaVoteMutation = useMutation(api.votes.toggleIdeaVote);

  const [reforms, setReforms] = useState<Reform[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeStatus, setActiveStatus] = useState<ReformStatus | 'all'>('all');

  useEffect(() => {
    if (convexIdeas && convexIdeas.length > 0) {
      const mapped: Reform[] = convexIdeas.map((ci: any) => ({
        id: ci._id,
        userId: ci.createdBy,
        userName: ci.createdByName || 'Citizen',
        title: ci.title,
        description: ci.description,
        category: ci.category.toLowerCase(),
        status: 'proposed',
        votes: ci.voteCount || 0,
        timestamp: ci.createdAt || Date.now(),
        likes: ci.voteCount || 0,
        dislikes: 0,
      }));
      setReforms(mapped);
    }
  }, [convexIdeas]);

  const submitReform = useCallback(
    async (title: string, description: string, category: string, scope = 'National') => {
      if (!title.trim() || !description.trim() || !user?._id) return;
      const validCategories: any = [
        'Education',
        'Healthcare',
        'Environment',
        'Transport',
        'Technology',
        'Governance',
        'Infrastructure',
        'Other',
      ];
      const matchedCat =
        validCategories.find(
          (c: string) => c.toLowerCase() === category.toLowerCase()
        ) || 'Other';

      try {
        await createIdeaMutation({
          title: title.trim(),
          description: description.trim(),
          category: matchedCat,
          scope: 'National',
          userId: user._id as Id<'users'>,
        });
      } catch (e) {
        console.warn('Convex createIdea notice:', e);
      }
    },
    [user, createIdeaMutation]
  );

  const voteReform = useCallback(
    async (id: string) => {
      if (user?._id && id) {
        try {
          await toggleIdeaVoteMutation({
            ideaId: id as Id<'ideas'>,
            userId: user._id as Id<'users'>,
          });
        } catch (e) {
          console.warn('Convex voteIdea notice:', e);
        }
      }
    },
    [user, toggleIdeaVoteMutation]
  );

  const toggleLike = useCallback(
    (id: string) => {
      voteReform(id);
    },
    [voteReform]
  );

  const toggleDislike = useCallback((_id: string) => {}, []);
  const updateStatus = useCallback((_id: string, _status: ReformStatus) => {}, []);
  const deleteReform = useCallback((_id: string) => {}, []);

  return {
    reforms,
    allReforms: reforms,
    activeCategory,
    setActiveCategory,
    activeStatus,
    setActiveStatus,
    submitReform,
    voteReform,
    toggleLike,
    toggleDislike,
    updateStatus,
    deleteReform,
  };
}
