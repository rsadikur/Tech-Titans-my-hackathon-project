import { FiUpload, FiMessageSquare, FiArrowRight, FiUsers, FiCheckCircle } from 'react-icons/fi';

const stats = [
  { icon: FiUpload, value: '12.4K', label: 'Reports Filed' },
  { icon: FiUsers, value: '48.2K', label: 'Active Citizens' },
  { icon: FiCheckCircle, value: '8.1K', label: 'Issues Solved' },
];

export default function Hero() {
  return (
    <section id="home" className="relative min-h-screen flex items-center pt-24 pb-16 overflow-hidden scroll-mt-20">
      {/* Background decoration — reduced to 2 blobs for GPU perf */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 dark:bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent-saffron/5 dark:bg-amber-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Text content — CSS slide-up animation, no framer-motion needed */}
          <div className="space-y-8 animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-border dark:border-border-dark text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
              <span className="text-muted dark:text-muted-dark">Civic Tech Platform</span>
              <span className="text-accent-saffron font-semibold">— New</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] tracking-tight">
              <span className="text-primary dark:text-white">Your Voice.</span>
              <br />
              <span className="text-primary dark:text-white">Your Country.</span>
              <br />
              <span className="gradient-text">Your Change.</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted dark:text-muted-dark leading-relaxed max-w-lg">
              Join millions of citizens shaping India&apos;s future. Report issues,{' '}
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
              <a
                href="#discuss"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl glass border border-border dark:border-border-dark text-primary dark:text-white font-semibold text-base hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-300"
              >
                <FiMessageSquare className="w-5 h-5" />
                Share Your Ideas
              </a>
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
              <span><strong className="text-primary dark:text-white">5K+</strong> active citizens today</span>
              <span className="hidden sm:inline"><strong className="text-primary dark:text-white">98%</strong> satisfaction rate</span>
            </div>
          </div>

          {/* Right: Stats cards — CSS scale-in with staggered delays */}
          <div className="relative">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className="relative group animate-scale-in"
                  style={{ animationDelay: `${0.3 + index * 0.1}s`, animationFillMode: 'both' }}
                >
                  <div className="relative p-6 rounded-2xl glass border border-border dark:border-border-dark hover:shadow-xl hover:shadow-primary/5 dark:hover:shadow-blue-500/5 transition-all duration-300 card-hover">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-blue-500/10 flex items-center justify-center mb-4">
                      <stat.icon className="w-5 h-5 text-primary dark:text-blue-400" />
                    </div>
                    <div className="text-2xl font-bold text-primary dark:text-white">{stat.value}</div>
                    <div className="text-sm text-muted dark:text-muted-dark mt-1">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Hero illustration card */}
            <div
              className="mt-6 p-6 rounded-2xl glass border border-border dark:border-border-dark card-hover animate-scale-in"
              style={{ animationDelay: '0.6s', animationFillMode: 'both' }}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center text-white font-bold shrink-0">
                  🇮🇳
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-primary dark:text-white text-sm">Trending Now</span>
                    <span className="px-2 py-0.5 rounded-full bg-accent-saffron/10 text-accent-saffron text-[10px] font-semibold">LIVE</span>
                  </div>
                  <p className="text-muted dark:text-muted-dark text-sm">
                    &ldquo;Fix potholes on MG Road — 2.3K citizens demand action&rdquo;
                  </p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-muted dark:text-muted-dark">
                    <span>🔥 2.3K urgent</span>
                    <span>💬 847 comments</span>
                    <span>✅ 67% resolved</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating decoration */}
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-accent-saffron/10 rounded-full blur-xl animate-float" />
          </div>
        </div>
      </div>
    </section>
  );
}
