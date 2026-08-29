'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { HiBell } from 'react-icons/hi';
import { FiCheck, FiMessageSquare } from 'react-icons/fi';
import { useNotifications } from '@/hooks/useNotifications';

export default function NotificationDropdown() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2.5 rounded-xl text-muted dark:text-muted-dark hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-200 relative"
        aria-label="Notifications"
      >
        <HiBell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl glass border border-border dark:border-border-dark shadow-xl shadow-black/10 z-50 overflow-hidden">
          <div className="p-3 border-b border-border dark:border-border-dark flex items-center justify-between">
            <p className="text-xs font-semibold text-primary dark:text-white">
              Notifications {unreadCount > 0 && <span className="text-muted dark:text-muted-dark font-normal">({unreadCount} unread)</span>}
            </p>
            {unreadCount > 0 && (
              <button
                onClick={() => { markAllAsRead(); }}
                className="text-[10px] text-primary dark:text-blue-400 hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center">
                <div className="w-10 h-10 mx-auto rounded-xl bg-primary/5 dark:bg-blue-500/5 flex items-center justify-center mb-2">
                  <HiBell className="w-5 h-5 text-muted dark:text-muted-dark" />
                </div>
                <p className="text-xs text-muted dark:text-muted-dark">No notifications yet</p>
              </div>
            ) : (
              notifications.slice(0, 10).map((n: any) => {
                const time = new Date(n.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                return (
                  <button
                    key={n._id}
                    onClick={() => { if (!n.read) markAsRead(n._id); }}
                    className={`w-full text-left p-3 border-b border-border dark:border-border-dark last:border-0 hover:bg-black/5 dark:hover:bg-white/5 transition-all ${n.read ? '' : 'bg-primary/5 dark:bg-blue-500/5'}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-medium text-primary dark:text-white">{n.title}</p>
                      {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-primary dark:bg-blue-400 shrink-0 mt-1" />}
                    </div>
                    <p className="text-[10px] text-muted dark:text-muted-dark mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-[9px] text-muted dark:text-muted-dark mt-1">{time}</p>
                  </button>
                );
              })
            )}
          </div>

          {notifications.length > 0 && (
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-1.5 p-3 border-t border-border dark:border-border-dark text-[10px] font-medium text-primary dark:text-blue-400 hover:bg-black/5 dark:hover:bg-white/5 transition-all"
            >
              <FiCheck className="w-3 h-3" />
              View All Notifications
            </Link>
          )}
          <Link
            href="/contact-admin"
            onClick={() => setOpen(false)}
            className="flex items-center justify-center gap-1.5 p-3 border-t border-border dark:border-border-dark text-[10px] font-medium text-primary dark:text-blue-400 hover:bg-black/5 dark:hover:bg-white/5 transition-all"
          >
            <FiMessageSquare className="w-3 h-3" />
            Talk to Admin
          </Link>
        </div>
      )}
    </div>
  );
}
