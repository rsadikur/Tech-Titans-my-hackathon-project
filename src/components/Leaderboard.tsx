'use client';

import { useQuery, api } from '@/lib/convexDisconnected';
import { useConvexReady } from '@/hooks/useConvex';
import { motion } from 'framer-motion';
import { FiAward, FiStar, FiTrendingUp, FiZap, FiShield, FiHeart } from 'react-icons/fi';

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <FiAward className="w-5 h-5 text-amber-500" />;
  if (rank === 2) return <FiAward className="w-5 h-5 text-slate-400" />;
  if (rank === 3) return <FiAward className="w-5 h-5 text-amber-700" />;
  return <span className="text-sm font-bold text-muted dark:text-muted-dark">#{rank}</span>;
}

export default function Leaderboard() {
  const convexReady = useConvexReady();
  const contributors = useQuery(api.leaderboard.getLeaderboard, convexReady ? { limit: 5 } : 'skip');

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
            Recognizing the most active and impactful members of our community.
          </p>
        </motion.div>

        {!contributors ? (
          <div className="text-center py-12">
            <p className="text-muted dark:text-muted-dark text-sm">Loading...</p>
          </div>
        ) : contributors.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted dark:text-muted-dark text-sm">No contributors yet</p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-4">
            {contributors.map((person: any, index: number) => (
              <motion.div
                key={person.username}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="relative"
              >
                <div className={`relative p-5 rounded-2xl glass border border-border dark:border-border-dark card-hover ${
                  person.rank <= 3 ? 'ring-2 ring-amber-500/20 dark:ring-amber-400/20' : ''
                }`}>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 shrink-0">
                      <RankBadge rank={person.rank} />
                    </div>

                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${person.color} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                      {person.avatar}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-semibold text-sm text-primary dark:text-white">{person.name}</h3>
                        <span className="text-[10px] text-muted dark:text-muted-dark">· {person.role}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {person.badges.map((badge: string) => (
                          <span
                            key={badge}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                              badge === 'Gold' ? 'bg-amber-500/10 text-amber-500' :
                              badge === 'Silver' ? 'bg-slate-500/10 text-slate-400' :
                              badge === 'Bronze' ? 'bg-amber-700/10 text-amber-700' :
                              badge === 'Top Reporter' ? 'bg-blue-500/10 text-blue-500' :
                              badge === 'Verified' ? 'bg-emerald-500/10 text-emerald-500' :
                              'bg-purple-500/10 text-purple-500'
                            }`}
                          >
                            <FiShield className="w-2.5 h-2.5" />
                            {badge}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-bold text-primary dark:text-white">
                        {person.points.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-muted dark:text-muted-dark">points</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border dark:border-border-dark text-xs text-muted dark:text-muted-dark">
                    <span>📋 {person.reports} reports</span>
                    <span>✅ {person.solutions} solutions</span>
                    <span className="flex items-center gap-1 ml-auto">
                      <FiHeart className="w-3 h-3 text-red-400" />
                      Impact Score: {(person.points / 100).toFixed(0)}
                    </span>
                  </div>
                </div>

                {person.rank === 1 && (
                  <div className="absolute -top-2 -right-2">
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
          <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl glass border border-border dark:border-border-dark text-sm font-medium text-muted dark:text-muted-dark hover:text-primary dark:hover:text-white transition-all duration-200">
            <FiTrendingUp className="w-4 h-4" />
            View Full Leaderboard
          </button>
        </motion.div>
      </div>
    </section>
  );
}
