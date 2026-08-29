'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import NotificationDropdown from '@/components/NotificationDropdown';
import { HiMenu, HiSun, HiMoon } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiLogOut, FiX, FiHome, FiFlag, FiMessageCircle, FiCamera, FiMap, FiGitBranch, FiMessageSquare, FiStar, FiGrid } from 'react-icons/fi';
import LogoHorizontal from '@/components/LogoHorizontal';

const navLinks = [
  { label: 'Home', href: '/#home', icon: FiHome },
  { label: 'Issues', href: '/#issues', icon: FiFlag },
  { label: 'Discuss', href: '/#discuss', icon: FiMessageCircle },
  { label: 'Evidence', href: '/evidence', icon: FiCamera },
  { label: 'Map', href: '/map', icon: FiMap },
  { label: 'Reforms', href: '/#reforms', icon: FiGitBranch },
  { label: 'Chat', href: '/chat', icon: FiMessageSquare },
  { label: 'Thoughts', href: '/thoughts', icon: FiStar },
  { label: 'Dashboard', href: '/dashboard', icon: FiGrid },
];



export default function Navbar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  if (pathname.startsWith('/admin')) return null;

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = useCallback(() => {
    setMobileOpen(prev => {
      const next = !prev;
      if (next) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
      return next;
    });
  }, []);

  const closeMenu = useCallback(() => {
    setMobileOpen(false);
    document.body.style.overflow = '';
  }, []);

  useEffect(() => {
    return () => { document.body.style.overflow = ''; };
  }, []);

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'glass shadow-lg shadow-black/5'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <Link href="/" className="flex items-center gap-2.5 group">
              <LogoHorizontal size="sm" showTagline={false} />
            </Link>

            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="px-4 py-2 text-sm font-medium text-muted dark:text-muted-dark hover:text-primary dark:hover:text-white rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-200"
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              {mounted && (
                <button
                  onClick={toggleTheme}
                  className="p-2 sm:p-2.5 rounded-xl text-muted dark:text-muted-dark hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-200"
                  aria-label="Toggle theme"
                >
                  {theme === 'light' ? <HiMoon className="w-5 h-5" /> : <HiSun className="w-5 h-5 text-amber-400" />}
                </button>
              )}
              {user ? (
                <>
                  <NotificationDropdown />
                  <Link
                    href="/dashboard"
                    className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl glass border border-border dark:border-border-dark text-sm font-medium text-primary dark:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-200"
                  >
                    <div className="w-7 h-7 rounded-lg gradient-bg flex items-center justify-center text-white text-[10px] font-bold">
                      {initials}
                    </div>
                    <span className="hidden md:inline text-xs">{user.name}</span>
                  </Link>
                  <button
                    onClick={logout}
                    className="hidden sm:flex p-2.5 rounded-xl text-muted dark:text-muted-dark hover:bg-red-500/10 hover:text-red-500 transition-all duration-200"
                    aria-label="Sign out"
                  >
                    <FiLogOut className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/signin"
                    className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl glass border border-border dark:border-border-dark text-sm font-medium text-muted dark:text-muted-dark hover:text-primary dark:hover:text-white transition-all duration-200"
                  >
                    <FiUser className="w-4 h-4" />
                    <span className="hidden md:inline">Sign In</span>
                  </Link>
                  <Link
                    href="/signup"
                    className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl gradient-bg text-white text-sm font-medium hover:opacity-90 transition-all duration-200 shadow-lg shadow-primary/25"
                  >
                    Get Started
                  </Link>
                </>
              )}
              <button
                onClick={toggleMenu}
                className="lg:hidden p-2 sm:p-2.5 rounded-xl text-muted dark:text-muted-dark hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-200"
                aria-label="Toggle menu"
              >
                <HiMenu className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="drawer-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={closeMenu}
            />

            <motion.div
              key="drawer-panel"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 z-50 h-dvh w-[75vw] max-w-sm bg-[#0c0c14] border-l border-white/5 shadow-2xl flex flex-col lg:hidden"
            >
              <div className="flex items-center justify-between px-5 h-16 shrink-0 border-b border-white/5">
                <p className="text-sm font-semibold text-white">Menu</p>
                <button
                  onClick={closeMenu}
                  className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;
                  return (
                    <a
                      key={link.label}
                      href={link.href}
                      onClick={closeMenu}
                      className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-indigo-500/10 text-indigo-400'
                          : 'text-zinc-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      {link.label}
                    </a>
                  );
                })}
              </div>

              <div className="shrink-0 px-3 py-4 border-t border-white/5">
                {user ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5">
                      <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                        <p className="text-[10px] text-zinc-500 truncate">@{user.username}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => { logout(); closeMenu(); }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      <FiLogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link
                      href="/signin"
                      onClick={closeMenu}
                      className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl glass border border-white/5 text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5 transition-all"
                    >
                      <FiUser className="w-4 h-4" />
                      Sign In
                    </Link>
                    <Link
                      href="/signup"
                      onClick={closeMenu}
                      className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl gradient-bg text-white text-sm font-medium hover:opacity-90 transition-all"
                    >
                      Get Started
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
