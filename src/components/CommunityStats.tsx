'use client';

import { motion } from 'framer-motion';
import { FiUpload, FiUsers, FiCheckCircle, FiMapPin, FiTrendingUp } from 'react-icons/fi';
import { useEffect, useRef, useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const duration = 1200;
    const steps = 30;
    const increment = Math.max(value / steps, 1);
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [visible, value]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

export default function CommunityStats() {
  const convexStats = useQuery(api.dashboard.getStats);

  const counts = {
    reports: convexStats?.totalReports ?? 0,
    users: convexStats?.activeCitizens ?? 0,
    solved: convexStats?.resolvedIssues ?? 0,
    cities: convexStats && convexStats.reportsByCategory.length > 0 ? convexStats.reportsByCategory.length : 1,
  };

  const stats = [
    { icon: FiUpload, value: counts.reports, label: 'Total Reports Filed', suffix: '', color: 'from-blue-500 to-blue-600' },
    { icon: FiUsers, value: counts.users, label: 'Active Citizens', suffix: '', color: 'from-emerald-500 to-emerald-600' },
    { icon: FiCheckCircle, value: counts.solved, label: 'Issues Solved', suffix: '', color: 'from-green-500 to-green-600' },
    { icon: FiMapPin, value: counts.cities, label: 'Districts Monitored', suffix: '+', color: 'from-purple-500 to-purple-600' },
  ];

  return (
    <section className="py-20 lg:py-28 relative overflow-hidden">
      <div className="absolute inset-0 gradient-bg opacity-5 dark:opacity-10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,153,51,0.05),transparent_50%)] dark:bg-[radial-gradient(circle_at_30%_50%,rgba(255,153,51,0.08),transparent_50%)]" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-border dark:border-border-dark text-sm font-medium mb-4">
            <FiTrendingUp className="w-4 h-4 text-accent-saffron" />
            Platform Impact
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-primary dark:text-white mb-4">
            Real Citizen Numbers & Impact
          </h2>
          <p className="text-muted dark:text-muted-dark text-lg">
            Transparent metrics tracking community engagement and resolved civic complaints.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="relative p-6 sm:p-8 rounded-2xl glass border border-border dark:border-border-dark card-hover text-center"
              >
                <div className={`w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white mb-4 shadow-lg shadow-black/5`}>
                  <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <div className="text-3xl sm:text-4xl font-bold text-primary dark:text-white mb-1">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-xs sm:text-sm text-muted dark:text-muted-dark font-medium">
                  {stat.label}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
