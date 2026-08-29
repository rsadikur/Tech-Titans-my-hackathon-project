'use client';

import { useState, useEffect, useCallback } from 'react';
import { useMutation, useQuery, api } from '@/lib/convexDisconnected';
import { useAuth } from './useAuth';
import { useConvexReady } from './useConvex';
import { getRegisteredUsers } from '@/lib/adminData';

const CHAT_STORAGE_KEY = 'public_chat_messages';
const CHAT_EVENT = 'chat-messages-updated';

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

const DEFAULT_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'chat-seed-1',
    userId: 'priya_s',
    userName: 'Priya Sharma',
    text: 'Hello everyone! Has anyone reported the heavy waterlogging near the Phagwara main market?',
    category: 'roads',
    timestamp: Date.now() - 3600000 * 2,
  },
  {
    id: 'chat-seed-2',
    userId: 'rajesh_k',
    userName: 'Rajesh Kumar',
    text: 'Yes Priya, I just uploaded a report with photos in the Evidence section. Please upvote so it gets escalated!',
    category: 'roads',
    timestamp: Date.now() - 3600000 * 1.8,
  },
  {
    id: 'chat-seed-3',
    userId: 'sneha_p',
    userName: 'Sneha Patel',
    text: 'Upvoted! Also noticed the streetlights along the link road were fixed after our report last week. Great to see fast action.',
    category: 'electricity',
    timestamp: Date.now() - 3600000 * 1.2,
  },
  {
    id: 'chat-seed-4',
    userId: 'amit_v',
    userName: 'Amit Verma',
    text: 'Welcome all new citizens to CivicPulse! Remember to attach clear photo proof when reporting civic issues.',
    category: 'general',
    timestamp: Date.now() - 3600000 * 0.5,
  },
];

function getStoredChatMessages(): ChatMessage[] {
  if (typeof window === 'undefined') return DEFAULT_CHAT_MESSAGES;
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(DEFAULT_CHAT_MESSAGES));
      return DEFAULT_CHAT_MESSAGES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_CHAT_MESSAGES;
  } catch {
    return DEFAULT_CHAT_MESSAGES;
  }
}

function saveStoredChatMessages(msgs: ChatMessage[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(msgs));
    window.dispatchEvent(new Event(CHAT_EVENT));
  } catch (err) {
    console.error('Failed to save chat message:', err);
  }
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

  const [messages, setMessages] = useState<ChatMessage[]>(() => getStoredChatMessages());
  const [typing, setTyping] = useState<{ name: string; id: string } | null>(null);
  const [onlineCount, setOnlineCount] = useState(() => {
    const registered = getRegisteredUsers();
    return Math.max(registered.length + 6, 12);
  });
  const [input, setInput] = useState('');
  const [sendError, setSendError] = useState('');

  useEffect(() => {
    const refresh = () => setMessages(getStoredChatMessages());
    window.addEventListener(CHAT_EVENT, refresh);
    return () => window.removeEventListener(CHAT_EVENT, refresh);
  }, []);

  useEffect(() => {
    if (convexReady && convexMessages) {
      const mapped = convexMessages.map((cm: any) => ({
        id: cm._id,
        userId: cm.userId,
        userName: cm.userName,
        text: cm.text,
        category: cm.category as MessageCategory,
        timestamp: cm.timestamp || Date.now(),
      }));
      setMessages(mapped.reverse());
    }
  }, [convexReady, convexMessages]);

  useEffect(() => {
    if (convexReady && convexTyping && convexTyping.length > 0) {
      const last = convexTyping[convexTyping.length - 1];
      if (last && last.id !== user?.username) {
        setTyping(last);
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
      updateOnlineStatusConvex({ username: user.username, isOnline: true });
    }
  }, [convexReady, user, updateOnlineStatusConvex]);

  useEffect(() => {
    return () => {
      try {
        if (convexReady && user && updateOnlineStatusConvex) {
          updateOnlineStatusConvex({ username: user.username, isOnline: false });
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

    const currentList = getStoredChatMessages();
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      userId: user.username,
      userName: user.name,
      text: text.trim(),
      category: category || 'general',
      timestamp: Date.now(),
    };

    const updated = [...currentList, newMsg];
    saveStoredChatMessages(updated);
    setMessages(updated);
    setInput('');

    if (convexReady && sendConvex) {
      try {
        await sendConvex({
          userId: user.username,
          userName: user.name,
          text: text.trim(),
          category,
          channel: chatChannel,
        });
      } catch (e) {
        console.error('Convex send error:', e);
      }
    }

    // Interactive community simulation reply
    setTimeout(() => {
      setTyping({ name: 'Priya Sharma', id: 'priya_s' });
      setTimeout(() => {
        setTyping(null);
        const replies = [
          'Thank you for raising this issue! Upvoted.',
          'Acknowledged. Great to see citizens actively discussing local improvements.',
          'Let’s also share this on the Discussion Area to get more visibility.',
        ];
        const randomReply = replies[Math.floor(Math.random() * replies.length)];
        const replyMsg: ChatMessage = {
          id: `msg-reply-${Date.now()}`,
          userId: 'priya_s',
          userName: 'Priya Sharma',
          text: randomReply,
          category: category || 'general',
          timestamp: Date.now(),
        };
        const latest = getStoredChatMessages();
        const withReply = [...latest, replyMsg];
        saveStoredChatMessages(withReply);
        setMessages(withReply);
      }, 2000);
    }, 1500);
  }, [user, sendConvex, chatChannel, convexReady]);

  const handleTyping = useCallback(() => {
    if (!user) return;
    if (convexReady && setTypingConvex) {
      setTypingConvex({
        userId: user.username,
        userName: user.name,
        channel: chatChannel,
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
