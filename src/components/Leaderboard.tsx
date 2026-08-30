'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  FiAward,
  FiStar,
  FiTrendingUp,
  FiZap,
  FiShield,
  FiCheckCircle,
  FiArrowRight,
  FiFileText,
} from 'react-icons/fi';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import Link from 'next/link';

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <FiAward className="w-6 h-6 text-amber-500" />;
  if (rank === 2) return <FiAward className="w-6 h-6 text-slate-400" />;
  if (rank === 3) return <FiAward className="w-6 h-6 text-amber-700" />;
  return <span className="text-sm font-bold text-muted dark:text-muted-dark">#{rank}</span>;
}

export default function Leaderboard() {
  const convexLeaderboard = useQuery(api.dashboard.getLeaderboard, {});
  const resolvedCitizens = convexLeaderboard || [];

  return (
    <section className="py-20 lg:py-28" id="leaderboard">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-border dark:border-border-dark text-sm font-medium mb-4">
            <FiStar className="w-4 h-4 text-accent-saffron" />
            Top Contributors
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-primary dark:text-white mb-4">
            Citizens Making a Difference
          </h2>
          <p className="text-muted dark:text-muted-dark text-lg">
            Recognizing citizens whose reported civic issues have been officially resolved and verified by authorities.
          </p>
        </motion.div>

        {resolvedCitizens.length === 0 ? (
          <div className="text-center py-16 px-4 rounded-3xl glass border border-border dark:border-border-dark max-w-2xl mx-auto space-y-3">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <FiCheckCircle className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-primary dark:text-white">
              No civic issues have been successfully resolved yet.
            </h3>
            <p className="text-xs text-muted dark:text-muted-dark max-w-md mx-auto">
              As soon as municipal authorities resolve on-ground issues reported by citizens, they will receive official recognition here.
            </p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-4">
            {resolvedCitizens.map((person, index) => (
              <motion.div
                key={person.name}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="relative"
              >
                <Link
                  href={`/citizen/${encodeURIComponent(person.userId)}/solved-issues`}
                  className={`block relative p-5 rounded-2xl glass border border-border dark:border-border-dark card-hover group transition-all ${
                    person.rank <= 3
                      ? 'ring-2 ring-emerald-500/20 dark:ring-emerald-400/20 shadow-lg shadow-emerald-500/5'
                      : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 shrink-0">
                      <RankBadge rank={person.rank} />
                    </div>

                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${person.color} flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-md shadow-emerald-500/20`}
                    >
                      {person.avatar}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-bold text-base text-primary dark:text-white group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors truncate">
                          {person.name}
                        </h3>
                        <span className="text-xs text-muted dark:text-muted-dark font-mono">
                          @{person.username}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                          <FiCheckCircle className="w-3 h-3" />
                          {person.solvedCount} {person.solvedCount === 1 ? 'Issue Solved' : 'Issues Solved'}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          🏅 Verified Impact
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0 flex items-center gap-3">
                      <div>
                        <div className="text-lg font-bold text-primary dark:text-white">
                          {person.points.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-muted dark:text-muted-dark font-medium">impact pts</div>
                      </div>
                      <FiArrowRight className="w-4 h-4 text-muted group-hover:translate-x-1 group-hover:text-emerald-500 transition-all" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 mt-3 pt-3 border-t border-border dark:border-border-dark text-xs text-muted dark:text-muted-dark">
                    <span>
                      📋 <strong className="text-primary dark:text-white">{person.reportsCount}</strong> Reports Filed
                    </span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <FiCheckCircle className="w-3.5 h-3.5" />
                      {person.solvedCount} Resolved
                    </span>
                    <span className="text-[11px] text-primary/70 dark:text-white/70 group-hover:underline">
                      View Solved Issues &rarr;
                    </span>
                  </div>
                </Link>

                {person.rank === 1 && (
                  <div className="absolute -top-2 -right-2 pointer-events-none">
                    <div className="relative">
                      <FiZap className="w-6 h-6 text-amber-500 animate-pulse" />
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-8"
        >
          <Link
            href="/solved-issues"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl glass border border-border dark:border-border-dark text-sm font-medium text-primary dark:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-200"
          >
            <FiTrendingUp className="w-4 h-4 text-emerald-500" />
            View All Verified Solved Issues
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
