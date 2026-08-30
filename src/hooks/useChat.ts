'use client';

import { useState, useEffect, useCallback } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useAuth } from './useAuth';
import { useConvexReady } from './useConvex';

const BLOCKED_WORDS = [
  'fuck', 'fucking', 'fuckyou', 'fck', 'fuk', 'fcuk',
  'shit', 'shitting',
  'asshole', 'ass',
  'bitch', 'bitching',
  'bastard',
  'motherfucker', 'mofo',
  'dick', 'cock', 'cocksucker',
  'porn', 'porno', 'pornography',
  'sex', 'sexy', 'sexual', 'sexually',
  'nude', 'naked', 'nudity',
  'whore', 'slut', 'prostitute',
  'pimp',
  'rape', 'raping', 'rapist', 'raped',
  'blowjob', 'handjob', 'oral', 'anal',
  'cum', 'cumming', 'semen', 'ejaculate',
  'penis', 'vagina', 'clit', 'clitoris',
  'fingering', 'masturbate', 'masturbation',
  'harami', 'haraami',
  'kutta', 'kutti', 'kutiya', 'kutte',
  'bhosdi', 'bhosdike', 'bhosda',
  'madarchod', 'madarchodh',
  'behenchod', 'bhenchod', 'behenchodd',
  'chutiya', 'chutiyo', 'chutiye',
  'gaand', 'gandu', 'gandoo', 'gaandu',
  'lauda', 'loda', 'laude', 'lavde', 'land', 'landi',
  'muth', 'muthal', 'hila', 'hilane', 'hilaane',
  'randi', 'randwa', 'randibaaz',
  'saala', 'saali', 'saale',
  'tatte', 'tatta',
  'balatkar', 'balatkari', 'balatkaar',
  'bhadwa', 'bhadwe',
  'chhinaal', 'chinal',
  'dhakkan',
  'hijra',
  'jhaant', 'jhaantu',
  'kamina', 'kameena',
  'lun', 'lulli',
  'moot', 'mutth', 'mootna',
  'naajaayaz', 'najayaz',
  'paagal', 'pagal',
  'suar', 'suwar',
  'ullu', 'ulloo',
  'badtameez',
  'bakwas', 'bakwaas',
  'behuda',
  'bewakoof',
  'fuddu',
  'gadha',
  'ganwar',
  'haraamkhor',
  'khotte',
  'nalayak',
  'nikamma',
];

function containsBlockedContent(text: string): boolean {
  const lower = text.toLowerCase().replace(/[^a-zA-Z\u0900-\u097F\s]/g, '');
  for (const word of BLOCKED_WORDS) {
    if (lower.includes(word)) return true;
  }
  return false;
}

export type MessageCategory =
  | 'education' | 'roads' | 'jobs' | 'corruption'
  | 'technology' | 'healthcare' | 'environment' | 'general';

export const CATEGORIES: { key: MessageCategory; label: string; icon: string; color: string }[] = [
  { key: 'education', label: 'Education', icon: '📚', color: 'from-blue-500 to-blue-600' },
  { key: 'roads', label: 'Roads', icon: '🛣️', color: 'from-amber-500 to-amber-600' },
  { key: 'jobs', label: 'Jobs', icon: '💼', color: 'from-emerald-500 to-emerald-600' },
  { key: 'corruption', label: 'Corruption', icon: '🔍', color: 'from-red-500 to-red-600' },
  { key: 'technology', label: 'Technology', icon: '💻', color: 'from-purple-500 to-purple-600' },
  { key: 'healthcare', label: 'Healthcare', icon: '🏥', color: 'from-rose-500 to-rose-600' },
  { key: 'environment', label: 'Environment', icon: '🌿', color: 'from-green-500 to-green-600' },
  { key: 'general', label: 'General', icon: '💬', color: 'from-slate-500 to-slate-600' },
];

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  text: string;
  category: MessageCategory;
  timestamp: number;
}

export function useChat(channel?: string) {
  const { user } = useAuth();
  const convexReady = useConvexReady();
  const chatChannel = channel || 'public';

  const sendConvex = useMutation(api.messages.send);
  const setTypingConvex = useMutation(api.typing.setTyping);
  const updateOnlineStatusConvex = useMutation(api.auth.updateOnlineStatus);
  const convexMessages = useQuery(api.messages.list, convexReady ? { channel: chatChannel, limit: 100 } : 'skip');
  const convexTyping = useQuery(api.typing.getTyping, convexReady ? { channel: chatChannel } : 'skip');
  const convexOnlineUsers = useQuery(api.auth.getOnlineUsers, convexReady ? {} : 'skip');

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typing, setTyping] = useState<{ name: string; id: string } | null>(null);
  const [onlineCount, setOnlineCount] = useState(1);
  const [input, setInput] = useState('');
  const [sendError, setSendError] = useState('');

  useEffect(() => {
    if (convexReady && convexMessages) {
      const mapped = convexMessages.map((cm: any) => ({
        id: cm._id,
        userId: cm.userId,
        userName: cm.userName,
        text: cm.text,
        category: (cm.category || 'general') as MessageCategory,
        timestamp: cm.createdAt || cm.timestamp || Date.now(),
      }));
      setMessages(mapped.reverse());
    }
  }, [convexReady, convexMessages]);

  useEffect(() => {
    if (convexReady && convexTyping) {
      if (convexTyping.id !== user?.username) {
        setTyping(convexTyping);
        const timer = setTimeout(() => setTyping(null), 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [convexReady, convexTyping, user?.username]);

  useEffect(() => {
    if (convexReady && convexOnlineUsers) {
      setOnlineCount(convexOnlineUsers.length);
    }
  }, [convexReady, convexOnlineUsers]);

  useEffect(() => {
    if (convexReady && user) {
      updateOnlineStatusConvex({ userId: user.username, userName: user.name, isOnline: true });
    }
  }, [convexReady, user, updateOnlineStatusConvex]);

  useEffect(() => {
    return () => {
      try {
        if (convexReady && user && updateOnlineStatusConvex) {
          updateOnlineStatusConvex({ userId: user.username, userName: user.name, isOnline: false });
        }
      } catch {}
    };
  }, [convexReady, user, updateOnlineStatusConvex]);

  const sendMessage = useCallback(async (text: string, category: MessageCategory) => {
    if (!text.trim() || !user) return;
    setSendError('');
    if (containsBlockedContent(text)) {
      setSendError('This message contains inappropriate language');
      return;
    }

    setInput('');

    if (convexReady && sendConvex) {
      try {
        await sendConvex({
          userId: user.username,
          userName: user.name,
          text: text.trim(),
          channel: chatChannel,
        });
      } catch (e) {
        console.error('Convex send error:', e);
      }
    }
  }, [user, sendConvex, chatChannel, convexReady]);

  const handleTyping = useCallback(() => {
    if (!user) return;
    if (convexReady && setTypingConvex) {
      setTypingConvex({
        userId: user.username,
        userName: user.name,
        channel: chatChannel,
        isTyping: true,
      });
    }
  }, [user, convexReady, setTypingConvex, chatChannel]);

  return {
    messages, typing, onlineCount,
    input, setInput,
    sendMessage, handleTyping, sendError, setSendError,
    groupName: 'CivicPulse — Public Chat',
    user,
  };
}
