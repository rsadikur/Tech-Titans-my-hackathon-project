'use client';

import { useNotifications, type Notification } from '@/hooks/useNotifications';
import { FiBell, FiCheck, FiArrowLeft } from 'react-icons/fi';
import Link from 'next/link';

function NotificationCard({ n, onMarkRead }: { n: Notification; onMarkRead: (id: string) => void }) {
  const time = new Date(n.createdAt).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
  return (
    <div
      className={`p-4 rounded-2xl border transition-all ${
        n.read
          ? 'border-border dark:border-border-dark glass'
          : 'border-primary/20 dark:border-blue-400/20 bg-primary/5 dark:bg-blue-500/5'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${n.read ? 'bg-transparent' : 'bg-primary dark:bg-blue-400'}`} />
            <p className="text-sm font-semibold text-primary dark:text-white">{n.title}</p>
          </div>
          <p className="text-xs text-muted dark:text-muted-dark mt-1">{n.message}</p>
          <p className="text-[10px] text-muted dark:text-muted-dark mt-2">{time}</p>
        </div>
        {!n.read && (
          <button
            onClick={() => onMarkRead(n._id)}
            className="shrink-0 p-2 rounded-lg bg-primary/10 dark:bg-blue-500/10 text-primary dark:text-blue-400 hover:bg-primary/20 dark:hover:bg-blue-500/20 transition-all"
            title="Mark as read"
          >
            <FiCheck className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted dark:text-muted-dark hover:text-primary dark:hover:text-white transition-colors">
          <FiArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FiBell className="w-5 h-5 text-primary dark:text-blue-400" />
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-primary dark:text-white">Notifications</h1>
              <p className="text-xs text-muted dark:text-muted-dark">
                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
              </p>
            </div>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl glass border border-border dark:border-border-dark text-xs font-medium text-muted dark:text-muted-dark hover:text-primary dark:hover:text-white transition-all"
            >
              <FiCheck className="w-3.5 h-3.5" />
              Mark all read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/5 dark:bg-blue-500/5 flex items-center justify-center mb-4">
              <FiBell className="w-6 h-6 text-muted dark:text-muted-dark" />
            </div>
            <h2 className="text-lg font-semibold text-primary dark:text-white mb-1">No notifications yet</h2>
            <p className="text-sm text-muted dark:text-muted-dark">You&apos;re all caught up!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n: any) => (
              <NotificationCard key={n._id} n={n} onMarkRead={markAsRead} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
