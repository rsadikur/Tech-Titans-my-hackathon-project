'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  FiHome, FiClock, FiCheckCircle, FiUsers, FiLogOut, FiShield, FiMenu, FiX, FiVideo, FiBell, FiMessageSquare, FiGlobe,
} from 'react-icons/fi';

const sidebarLinks = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: FiHome },
  { label: 'Pending Videos', href: '/admin/pending', icon: FiClock },
  { label: 'Approved Videos', href: '/admin/approved', icon: FiCheckCircle },
  { label: 'Notifications', href: '/admin/notifications', icon: FiBell },
  { label: 'Contact Messages', href: '/admin/contact-messages', icon: FiMessageSquare },
  { label: 'Visitors', href: '/admin/visitors', icon: FiGlobe },
  { label: 'Users', href: '/admin/users', icon: FiUsers },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [admin, setAdmin] = useState<{ email: string; name: string } | null>(null);
  const [checkedSession, setCheckedSession] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Clear any stale persistent session in localStorage to prevent auto-login
    try {
      localStorage.removeItem('adminSession');
    } catch {}

    const session = typeof window !== 'undefined' ? sessionStorage.getItem('adminSession') : null;
    if (session) {
      try {
        const parsed = JSON.parse(session);
        setAdmin(parsed);
        if (pathname === '/admin') {
          router.push('/admin/dashboard');
        }
      } catch {
        sessionStorage.removeItem('adminSession');
        setAdmin(null);
        if (pathname !== '/admin') {
          router.replace('/admin');
        }
      }
    } else if (pathname !== '/admin') {
      router.replace('/admin');
    }
    setCheckedSession(true);
  }, [router, pathname]);

  const handleLogout = () => {
    try {
      sessionStorage.removeItem('adminSession');
      localStorage.removeItem('adminSession');
    } catch {}
    setAdmin(null);
    router.push('/admin');
  };

  if (pathname === '/admin') return <>{children}</>;

  if (!checkedSession || !admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] text-sm text-zinc-400">
        Checking admin session...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#0f0f1a] border-r border-white/5 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center">
              <FiShield className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Admin Panel</p>
              <p className="text-[10px] text-zinc-500">{admin.email}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  isActive
                    ? 'bg-indigo-500/10 text-indigo-400'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-zinc-400 hover:text-red-400 hover:bg-red-500/5 transition-all"
          >
            <FiLogOut className="w-4 h-4" />
            Logout
          </button>
        </nav>

        <div className="p-3 border-t border-white/5">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-all"
          >
            <FiVideo className="w-3.5 h-3.5" />
            View Public Site
          </Link>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="sticky top-0 z-40 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5 px-4 lg:px-6 h-14 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
          >
            {sidebarOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
          </button>
          <div className="flex-1" />
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-red-400 hover:bg-red-500/5 transition-all"
          >
            <FiLogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </header>
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
