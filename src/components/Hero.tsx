'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  FiUpload,
  FiMessageSquare,
  FiArrowRight,
  FiUsers,
  FiCheckCircle,
  FiThumbsUp,
  FiMapPin,
} from 'react-icons/fi';
import Link from 'next/link';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useIssues } from '@/hooks/useIssues';

export default function Hero() {
  const { issues } = useIssues();
  const convexStats = useQuery(api.dashboard.getStats);

  // Single highest-voted issue across all issues
  const topTrendingIssue = useMemo(() => {
    if (!issues || issues.length === 0) return null;
    const sorted = [...issues].sort((a, b) => b.likes - a.likes);
    return sorted[0];
  }, [issues]);

  const statCards = [
    { icon: FiUpload, value: (convexStats?.totalReports ?? (issues?.length || 0)).toString(), label: 'Reports Filed' },
    { icon: FiUsers, value: (convexStats?.activeCitizens ?? 2).toString(), label: 'Active Citizens' },
    { icon: FiCheckCircle, value: (convexStats?.resolvedIssues ?? 0).toString(), label: 'Issues Solved' },
  ];

  return (
    <section id="home" className="relative min-h-screen flex items-center pt-28 pb-16 overflow-hidden scroll-mt-24 lg:scroll-mt-28">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 dark:bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent-saffron/5 dark:bg-amber-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Text content */}
          <div className="space-y-8 animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-border dark:border-border-dark text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
              <span className="text-muted dark:text-muted-dark">Civic Tech Platform</span>
              <span className="text-accent-saffron font-semibold">— Live</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] tracking-tight">
              <span className="text-primary dark:text-white">Your Voice.</span>
              <br />
              <span className="text-primary dark:text-white">Your Country.</span>
              <br />
              <span className="gradient-text">Your Change.</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted dark:text-muted-dark leading-relaxed max-w-lg">
              Join citizens shaping India&apos;s future. Report issues,{' '}
              discuss solutions, and drive real change — all from one platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#evidence"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl gradient-bg text-white font-semibold text-base shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 hover:opacity-90 transition-all duration-300"
              >
                <FiUpload className="w-5 h-5" />
                Upload Issues
                <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
              <Link
                href="/solved-issues"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl glass border border-border dark:border-border-dark text-primary dark:text-white font-semibold text-base hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-300"
              >
                <FiCheckCircle className="w-5 h-5 text-emerald-500" />
                Solved Issues
              </Link>
            </div>

            <div className="flex items-center gap-6 text-sm text-muted dark:text-muted-dark">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-white dark:border-surface-dark bg-gradient-to-br from-primary-light to-primary flex items-center justify-center text-white text-xs font-bold"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <span>
                <strong className="text-primary dark:text-white">{convexStats?.activeCitizens ?? 2}</strong> active citizens registered
              </span>
              <span className="hidden sm:inline">
                <strong className="text-primary dark:text-white">100%</strong> transparent tracking
              </span>
            </div>
          </div>

          {/* Right: Stats cards + Single Top Trending Now */}
          <div className="relative">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {statCards.map((stat, index) => (
                <div
                  key={stat.label}
                  className="relative group animate-scale-in"
                  style={{ animationDelay: `${0.3 + index * 0.1}s`, animationFillMode: 'both' }}
                >
                  <div className="relative p-6 rounded-2xl glass border border-border dark:border-border-dark hover:shadow-xl hover:shadow-primary/5 dark:hover:shadow-blue-500/5 transition-all duration-300 card-hover text-center sm:text-left">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-blue-500/10 flex items-center justify-center mb-4 mx-auto sm:mx-0">
                      <stat.icon className="w-5 h-5 text-primary dark:text-blue-400" />
                    </div>
                    <div className="text-2xl font-bold text-primary dark:text-white">{stat.value}</div>
                    <div className="text-sm text-muted dark:text-muted-dark mt-1">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Trending Now Single Highest Voted Card */}
            {topTrendingIssue && (
              <Link
                href="/#issues"
                className="mt-6 block p-5 rounded-2xl glass border border-border dark:border-border-dark card-hover animate-scale-in transition-all duration-300 group"
                style={{ animationDelay: '0.6s', animationFillMode: 'both' }}
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-11 h-11 rounded-xl gradient-bg flex items-center justify-center text-white shrink-0 font-bold text-xs shadow-md shadow-primary/20">
                    IN
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-primary dark:text-white">Trending Now</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-500 border border-red-500/20 animate-pulse">
                        LIVE
                      </span>
                    </div>
                    <p className="text-sm font-medium text-muted dark:text-muted-dark group-hover:text-primary dark:group-hover:text-white transition-colors truncate">
                      &ldquo;{topTrendingIssue.title}&rdquo;
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted dark:text-muted-dark flex-wrap">
                      <span className="flex items-center gap-1 font-semibold text-accent-saffron">
                        <FiThumbsUp className="w-3.5 h-3.5" />
                        {topTrendingIssue.likes} {topTrendingIssue.likes === 1 ? 'vote' : 'votes'}
                      </span>
                      <span className="flex items-center gap-1 truncate max-w-[200px]">
                        <FiMapPin className="w-3 h-3 text-primary/70 dark:text-blue-400" />
                        {topTrendingIssue.location}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
