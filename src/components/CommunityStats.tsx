'use client';

import { motion } from 'framer-motion';
import { FiUpload, FiUsers, FiCheckCircle, FiMapPin, FiTrendingUp } from 'react-icons/fi';
import { useEffect, useRef, useState } from 'react';

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
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
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

const stats = [
  { icon: FiUpload, value: 12456, label: 'Total Reports Filed', suffix: '+', color: 'from-blue-500 to-blue-600' },
  { icon: FiUsers, value: 48230, label: 'Active Citizens', suffix: '+', color: 'from-emerald-500 to-emerald-600' },
  { icon: FiCheckCircle, value: 8123, label: 'Issues Solved', suffix: '+', color: 'from-green-500 to-green-600' },
  { icon: FiMapPin, value: 1567, label: 'Cities Covered', suffix: '+', color: 'from-purple-500 to-purple-600' },
];

export default function CommunityStats() {
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
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-primary dark:text-white mb-4">
            Community in Numbers
          </h2>
          <p className="text-muted dark:text-muted-dark text-lg">
            Transparency drives trust. See the real impact citizens are making every day.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative group"
            >
              <div className="relative p-6 lg:p-8 rounded-2xl glass border border-border dark:border-border-dark text-center card-hover">
                <div className={`w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl lg:text-4xl font-bold text-primary dark:text-white mb-1">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-sm text-muted dark:text-muted-dark">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Progress bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-10 p-6 rounded-2xl glass border border-border dark:border-border-dark"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <FiTrendingUp className="w-5 h-5 text-accent-green" />
              <div>
                <span className="text-sm font-semibold text-primary dark:text-white">Resolution Rate</span>
                <p className="text-xs text-muted dark:text-muted-dark">65.2% of all reported issues resolved</p>
              </div>
            </div>
            <div className="w-full sm:w-64 h-3 rounded-full bg-border dark:bg-border-dark overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: '65.2%' }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, delay: 0.6, ease: 'easeOut' }}
                className="h-full rounded-full gradient-bg"
              />
            </div>
            <span className="text-sm font-bold text-primary dark:text-white">65.2%</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
