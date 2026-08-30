'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { useAuth } from './useAuth';

export interface Issue {
  id: number;
  title: string;
  category: string;
  location: string;
  urgency: string;
  upvotes: number;
  comments: number;
  views: number;
  time: string;
  status: string;
  statusColor: string;
  createdAt: number;
  likes: number;
  dislikes: number;
  latitude?: number;
  longitude?: number;
  _id?: string;
}

export interface IssueInput {
  title: string;
  category: string;
  location: string;
  urgency?: string;
  latitude?: number;
  longitude?: number;
  district?: string;
  state?: string;
  pinCode?: string;
}

interface IssuesContextType {
  issues: Issue[];
  addIssue: (issue: IssueInput) => Promise<string | undefined>;
  toggleLike: (id: number) => void;
  removeLike: (id: number) => void;
  toggleDislike: (id: number) => void;
  removeDislike: (id: number) => void;
}

const IssuesContext = createContext<IssuesContextType>({
  issues: [],
  addIssue: async () => undefined,
  toggleLike: () => {},
  removeLike: () => {},
  toggleDislike: () => {},
  removeDislike: () => {},
});

function formatTime(createdAt: number): string {
  const diff = Date.now() - createdAt;
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

export function IssuesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);

  // Real Convex query
  const convexIssues = useQuery(api.issues.list, {});
  const createIssueMutation = useMutation(api.issues.create);
  const toggleIssueVoteMutation = useMutation(api.votes.toggleIssueVote);

  useEffect(() => {
    if (convexIssues && convexIssues.length > 0) {
      const mapped: Issue[] = convexIssues
        .filter((ci: any) => ci.status !== 'Resolved')
        .map((ci: any, idx: number) => {
        let statusColor = 'text-emerald-500 bg-emerald-500/10';
        if (ci.status === 'Verified') {
          statusColor = 'text-blue-500 bg-blue-500/10';
        } else if (ci.status === 'In Progress') {
          statusColor = 'text-amber-500 bg-amber-500/10';
        } else if (ci.status === 'Resolved') {
          statusColor = 'text-sky-500 bg-sky-500/10';
        }

        return {
          id: idx + 1,
          _id: ci._id,
          title: ci.title,
          category: ci.category,
          location: ci.address || ci.localArea || 'Citizen Report',
          urgency: 'Medium',
          upvotes: ci.voteCount || 0,
          comments: 0,
          views: 0,
          time: formatTime(ci.createdAt || Date.now()),
          status: ci.status || 'Verified',
          statusColor: statusColor,
          createdAt: ci.createdAt || Date.now(),
          likes: ci.voteCount || 0,
          dislikes: 0,
          latitude: ci.latitude,
          longitude: ci.longitude,
        };
      });
      setIssues(mapped);
    } else {
      setIssues([]);
    }
  }, [convexIssues]);

  const addIssue = useCallback(
    async (data: IssueInput) => {
      try {
        if (user?._id) {
          const categoryValid = [
            'Pothole',
            'Road Damage',
            'Garbage',
            'Broken Streetlight',
            'Water / Drainage',
            'Public Infrastructure',
            'Other',
          ].includes(data.category)
            ? (data.category as any)
            : 'Other';

          const res = await createIssueMutation({
            title: data.title,
            description: data.title,
            category: categoryValid,
            latitude: data.latitude || 31.2536,
            longitude: data.longitude || 75.7037,
            address: data.location,
            localArea: data.district || 'Phagwara',
            district: data.district || 'Kapurthala',
            state: data.state || 'Punjab',
            pinCode: data.pinCode || '144411',
            userId: user._id as Id<'users'>,
          });
          return res;
        }
      } catch (e) {
        console.warn('Convex addIssue notice:', e);
      }
      return undefined;
    },
    [createIssueMutation, user]
  );

  const toggleLike = useCallback(
    async (id: number) => {
      const target = issues.find((i) => i.id === id);
      if (!target) return;

      if (user?._id && target._id) {
        try {
          await toggleIssueVoteMutation({
            issueId: target._id as Id<'issues'>,
            userId: user._id as Id<'users'>,
          });
        } catch (e) {
          console.warn('Convex toggleVote notice:', e);
        }
      }
    },
    [issues, toggleIssueVoteMutation, user]
  );

  const removeLike = useCallback(
    async (id: number) => {
      const target = issues.find((i) => i.id === id);
      if (!target) return;

      if (user?._id && target._id) {
        try {
          await toggleIssueVoteMutation({
            issueId: target._id as Id<'issues'>,
            userId: user._id as Id<'users'>,
          });
        } catch {}
      }
    },
    [issues, toggleIssueVoteMutation, user]
  );

  const toggleDislike = useCallback(
    (_id: number) => {
      // Dislike is client-side interaction or unvote
    },
    []
  );

  const removeDislike = useCallback(
    (_id: number) => {
      // Dislike is client-side interaction or unvote
    },
    []
  );

  return (
    <IssuesContext.Provider value={{ issues, addIssue, toggleLike, removeLike, toggleDislike, removeDislike }}>
      {children}
    </IssuesContext.Provider>
  );
}

export const useIssues = () => useContext(IssuesContext);
