'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useMutation, useQuery, api } from '@/lib/convexDisconnected';
import { useConvexReady } from './useConvex';
import { getLocalEvidence, LOCAL_EVIDENCE_EVENT } from '@/lib/localEvidence';

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
}

interface IssuesContextType {
  issues: Issue[];
  addIssue: (issue: IssueInput) => void;
  toggleLike: (id: number) => void;
  removeLike: (id: number) => void;
  toggleDislike: (id: number) => void;
  removeDislike: (id: number) => void;
}

const IssuesContext = createContext<IssuesContextType>({
  issues: [],
  addIssue: () => {},
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
  const [issues, setIssues] = useState<Issue[]>([]);
  const convexReady = useConvexReady();
  const createIssue = useMutation(api.issues.create);
  const likeMutation = useMutation(api.issues.toggleLike);
  const dislikeMutation = useMutation(api.issues.toggleDislike);
  const convexIssues = useQuery(api.issues.list, convexReady ? { limit: 50 } : 'skip');

  useEffect(() => {
    if (convexReady && convexIssues) {
      const mapped = convexIssues.map((ci: any, idx: number) => ({
        id: idx + 1,
        _id: ci._id,
        title: ci.title,
        category: ci.category,
        location: ci.location || 'Citizen Report',
        urgency: ci.urgency || 'Medium',
        upvotes: ci.upvotes || 0,
        comments: ci.comments || 0,
        views: ci.views || 0,
        time: formatTime(ci.createdAt || Date.now()),
        status: ci.status || 'New',
        statusColor: ci.statusColor || 'text-emerald-500 bg-emerald-500/10',
        createdAt: ci.createdAt || Date.now(),
        likes: ci.likes || 0,
        dislikes: ci.dislikes || 0,
      }));
      setIssues(mapped);
    }
  }, [convexReady, convexIssues]);

  useEffect(() => {
    const refreshLocalIssues = () => {
      const approved = getLocalEvidence().filter((item) => item.status === 'approved' || item.status === 'important');
      setIssues(approved.map((item, index) => ({
        id: index + 1,
        _id: item._id,
        title: item.title,
        category: item.category || 'other',
        location: item.location || 'Citizen Report',
        urgency: item.urgency || 'Medium',
        upvotes: 0,
        comments: 0,
        views: 0,
        time: formatTime(item.createdAt),
        status: item.status === 'important' ? 'Important' : 'Approved',
        statusColor: item.status === 'important' ? 'text-amber-500 bg-amber-500/10' : 'text-emerald-500 bg-emerald-500/10',
        createdAt: item.createdAt,
        likes: 0,
        dislikes: 0,
        latitude: item.latitude,
        longitude: item.longitude,
      })));
    };
    refreshLocalIssues();
    window.addEventListener(LOCAL_EVIDENCE_EVENT, refreshLocalIssues);
    return () => window.removeEventListener(LOCAL_EVIDENCE_EVENT, refreshLocalIssues);
  }, []);

  const addIssue = useCallback((data: IssueInput) => {
    if (convexReady && createIssue) {
      createIssue({
        title: data.title,
        category: data.category,
        location: data.location,
        urgency: data.urgency,
      });
    }
  }, [convexReady, createIssue]);

  const toggleLike = useCallback((id: number) => {
    if (convexReady && likeMutation) {
      const issue = issues.find(i => i.id === id);
      if (issue?._id) {
        likeMutation({ issueId: issue._id as any, userId: 'anonymous' });
      }
    }
  }, [convexReady, likeMutation, issues]);

  const removeLike = useCallback((_id: number) => {
  }, []);

  const toggleDislike = useCallback((id: number) => {
    if (convexReady && dislikeMutation) {
      const issue = issues.find(i => i.id === id);
      if (issue?._id) {
        dislikeMutation({ issueId: issue._id as any, userId: 'anonymous' });
      }
    }
  }, [convexReady, dislikeMutation, issues]);

  const removeDislike = useCallback((_id: number) => {
  }, []);

  return (
    <IssuesContext.Provider value={{ issues, addIssue, toggleLike, removeLike, toggleDislike, removeDislike }}>
      {children}
    </IssuesContext.Provider>
  );
}

export const useIssues = () => useContext(IssuesContext);
