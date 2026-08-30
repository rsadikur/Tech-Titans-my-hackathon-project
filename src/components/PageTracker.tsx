'use client';

import { useEffect, useRef, useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useAuth } from '@/hooks/useAuth';
import { useConvexReady } from '@/hooks/useConvex';
import { usePathname } from 'next/navigation';

function getOrCreateSessionId(): string {
  const key = 'visitor_session_id';
  let id = localStorage.getItem(key);
  if (!id) {
    id = 'anon_' + Math.random().toString(36).slice(2, 10);
    localStorage.setItem(key, id);
  }
  return id;
}

function getReferrerSource(): { referrer: string; source: string } {
  const ref = document.referrer || '';
  if (!ref) return { referrer: '', source: 'Direct' };
  if (ref.includes('google.')) return { referrer: ref, source: 'Google' };
  if (ref.includes('bing.')) return { referrer: ref, source: 'Bing' };
  if (ref.includes('yahoo.')) return { referrer: ref, source: 'Yahoo' };
  if (ref.includes('facebook.') || ref.includes('fb.')) return { referrer: ref, source: 'Facebook' };
  if (ref.includes('twitter.') || ref.includes('x.com')) return { referrer: ref, source: 'Twitter' };
  if (ref.includes('instagram.')) return { referrer: ref, source: 'Instagram' };
  if (ref.includes('whatsapp.')) return { referrer: ref, source: 'WhatsApp' };
  if (ref.includes('youtube.')) return { referrer: ref, source: 'YouTube' };
  if (ref.includes('linkedin.')) return { referrer: ref, source: 'LinkedIn' };
  if (ref.includes('telegram.')) return { referrer: ref, source: 'Telegram' };
  return { referrer: ref, source: 'Other' };
}

function detectCountry(): Promise<string> {
  const cached = localStorage.getItem('visitor_country');
  if (cached) return Promise.resolve(cached);
  return fetch('https://ip-api.com/json/?fields=country')
    .then(r => r.json())
    .then(data => {
      const country = data.country || 'Unknown';
      localStorage.setItem('visitor_country', country);
      return country;
    })
    .catch(() => 'Unknown');
}

export default function PageTracker() {
  const { user } = useAuth();
  const pathname = usePathname();
  const convexReady = useConvexReady();
  const logVisit = useMutation(api.visitors.logVisit);
  const lastPath = useRef('');
  const [country, setCountry] = useState('');

  useEffect(() => {
    detectCountry().then(setCountry);
  }, []);

  useEffect(() => {
    if (!convexReady || !pathname || pathname.startsWith('/admin')) return;
    if (pathname === lastPath.current) return;
    lastPath.current = pathname;

    const sessionId = getOrCreateSessionId();
    const userId = user ? user.username : sessionId;
    const userName = user ? user.name : 'Guest';
    const { referrer, source } = getReferrerSource();

    try {
      logVisit({
        sessionId,
        userId,
        userName,
        page: pathname,
        referrer: referrer || undefined,
        source: source === 'Direct' ? undefined : source,
        country: country || undefined,
      });
    } catch (e) {
      console.warn('Visitor tracking notice:', e);
    }
  }, [user, pathname, logVisit, country, convexReady]);

  return null;
}
