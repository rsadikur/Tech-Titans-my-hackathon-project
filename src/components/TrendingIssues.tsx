'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  FiMapPin,
  FiClock,
  FiTrendingUp,
  FiThumbsUp,
  FiThumbsDown,
  FiZap,
  FiX,
  FiNavigation,
  FiPlusCircle,
} from 'react-icons/fi';
import { useIssues, Issue } from '@/hooks/useIssues';
import { useAuth } from '@/hooks/useAuth';

// ─── Known coordinate lookup for standard locations ──────────────────────────
const LOCATION_COORDS: Record<string, [number, number]> = {
  'Phagwara, Punjab': [31.224, 75.7708],
  'Phagwara': [31.224, 75.7708],
  'New Delhi': [28.6139, 77.209],
  'Delhi': [28.6139, 77.209],
  'Mumbai, Maharashtra': [19.076, 72.8777],
  'Bengaluru, Karnataka': [12.9716, 77.5946],
  'Chandigarh': [30.7333, 76.7794],
  'Jaipur, Rajasthan': [26.9124, 75.7873],
  'Lucknow, Uttar Pradesh': [26.8467, 80.9462],
  'Pune, Maharashtra': [18.5204, 73.8567],
  'Kolkata, West Bengal': [22.5726, 88.3639],
  'Hyderabad, Telangana': [17.385, 78.4867],
  'Chennai, Tamil Nadu': [13.0827, 80.2707],
  'Ahmedabad, Gujarat': [23.0225, 72.5714],
  'Jalandhar, Punjab': [31.326, 75.5762],
  'Ludhiana, Punjab': [30.901, 75.8573],
  'Amritsar, Punjab': [31.634, 74.8723],
  'Kapurthala': [31.38, 75.38],
};

function getCoordsForIssue(issue: Issue, index: number): [number, number] {
  if (typeof issue.latitude === 'number' && typeof issue.longitude === 'number') {
    return [issue.latitude, issue.longitude];
  }
  const loc = issue.location || '';
  if (LOCATION_COORDS[loc]) return LOCATION_COORDS[loc];
  for (const [key, coords] of Object.entries(LOCATION_COORDS)) {
    if (loc.toLowerCase().includes(key.toLowerCase().split(',')[0])) {
      return coords;
    }
  }
  const baseLat = 31.2536 + ((index * 17) % 20) * 0.005 - 0.05;
  const baseLng = 75.7037 + ((index * 23) % 20) * 0.005 - 0.05;
  return [baseLat, baseLng];
}

/** Haversine Great-Circle distance formula (distance in km) */
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatDistance(distKm: number): string {
  if (distKm < 0.05) return 'Exact Spot (< 50 m)';
  if (distKm < 1.0) return `${Math.round(distKm * 1000)} m away`;
  return `${distKm.toFixed(1)} km away`;
}

type LocationFilter = 'Nearby' | 'District' | 'State' | 'All';
type SortOption = 'popular' | 'newest' | 'nearest';

const LOCATION_FILTERS: { id: LocationFilter; label: string }[] = [
  { id: 'Nearby', label: 'Nearby' },
  { id: 'District', label: 'District' },
  { id: 'State', label: 'State' },
  { id: 'All', label: 'All' },
];

export default function TrendingIssues() {
  const { user } = useAuth();
  const { issues, toggleLike, removeLike, toggleDislike, removeDislike } = useIssues();
  const [activeFilter, setActiveFilter] = useState<LocationFilter>('All');
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [showLoginPopup, setShowLoginPopup] = useState(false);

  // Persistent Vote State
  const [liked, setLiked] = useState<Record<string | number, 'like' | 'dislike' | null>>({});

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedKey = user ? `civic_votes_${user.username}` : 'civic_votes_guest';
        const saved = localStorage.getItem(storedKey);
        if (saved) {
          setLiked(JSON.parse(saved));
        }
      } catch {}
    }
  }, [user]);

  const persistVote = useCallback(
    (newVotes: Record<string | number, 'like' | 'dislike' | null>) => {
      setLiked(newVotes);
      if (typeof window !== 'undefined') {
        try {
          const storedKey = user ? `civic_votes_${user.username}` : 'civic_votes_guest';
          localStorage.setItem(storedKey, JSON.stringify(newVotes));
        } catch {}
      }
    },
    [user]
  );

  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(() => {
    if (user?.location?.lat && user?.location?.lng) {
      return { lat: user.location.lat, lng: user.location.lng };
    }
    return null;
  });
  const [userDistrict, setUserDistrict] = useState<string>(() => user?.location?.district || '');
  const [userState, setUserState] = useState<string>(() => user?.location?.state || '');

  useEffect(() => {
    if (user?.location?.lat && user?.location?.lng) {
      setUserCoords({ lat: user.location.lat, lng: user.location.lng });
      if (user.location.district) setUserDistrict(user.location.district);
      if (user.location.state) setUserState(user.location.state);
    }

    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setUserCoords({ lat, lng });

          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
            );
            if (res.ok) {
              const data = await res.json();
              const addr = data.address || {};
              const dist = addr.state_district || addr.county || addr.district || addr.city || '';
              const st = addr.state || '';
              if (dist) setUserDistrict(dist);
              if (st) setUserState(st);
            }
          } catch {}
        },
        () => {
          setUserCoords((prev) => prev || { lat: 31.2536, lng: 75.7037 });
          setUserDistrict((prev) => prev || 'Kapurthala');
          setUserState((prev) => prev || 'Punjab');
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    }
  }, [user]);

  const handleLike = (id: number) => {
    const current = liked[id];
    if (current === 'like') {
      removeLike(id);
      persistVote({ ...liked, [id]: null });
    } else if (current === 'dislike') {
      removeDislike(id);
      toggleLike(id);
      persistVote({ ...liked, [id]: 'like' });
    } else {
      toggleLike(id);
      persistVote({ ...liked, [id]: 'like' });
    }
  };

  const handleDislike = (id: number) => {
    const current = liked[id];
    if (current === 'dislike') {
      removeDislike(id);
      persistVote({ ...liked, [id]: null });
    } else if (current === 'like') {
      removeLike(id);
      toggleDislike(id);
      persistVote({ ...liked, [id]: 'dislike' });
    } else {
      toggleDislike(id);
      persistVote({ ...liked, [id]: 'dislike' });
    }
  };

  const filtered = useMemo(() => {
    let list = issues.map((issue, idx) => {
      const coords = getCoordsForIssue(issue, idx);
      let distanceKm: number | null = null;
      if (userCoords && coords) {
        distanceKm = calculateDistanceKm(userCoords.lat, userCoords.lng, coords[0], coords[1]);
      }
      return { ...issue, coords, distanceKm };
    });

    if (activeFilter === 'Nearby') {
      list = list.filter((i) => i.distanceKm !== null && i.distanceKm <= 5.0);
    } else if (activeFilter === 'District') {
      const distTarget = (userDistrict || 'Kapurthala').toLowerCase();
      list = list.filter((i) => {
        const locLower = i.location.toLowerCase();
        return (
          locLower.includes(distTarget) ||
          (userDistrict && locLower.includes(userDistrict.toLowerCase())) ||
          locLower.includes('phagwara') ||
          locLower.includes('kapurthala')
        );
      });
    } else if (activeFilter === 'State') {
      const stateTarget = (userState || 'Punjab').toLowerCase();
      list = list.filter((i) => {
        const locLower = i.location.toLowerCase();
        return (
          locLower.includes(stateTarget) ||
          (userState && locLower.includes(userState.toLowerCase())) ||
          locLower.includes('punjab')
        );
      });
    }

    if (sortBy === 'popular') {
      list.sort((a, b) => b.likes - a.likes);
    } else if (sortBy === 'newest') {
      list.sort((a, b) => b.createdAt - a.createdAt);
    } else if (sortBy === 'nearest') {
      list.sort((a, b) => {
        if (a.distanceKm === null) return 1;
        if (b.distanceKm === null) return -1;
        return a.distanceKm - b.distanceKm;
      });
    }

    return list;
  }, [issues, activeFilter, sortBy, userCoords, userDistrict, userState]);

  return (
    <section id="issues" className="py-24 lg:py-32 scroll-mt-24 lg:scroll-mt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-border dark:border-border-dark text-sm font-medium mb-4">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Trending Issues
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-primary dark:text-white mb-4">
            What Citizens Are Reporting
          </h2>
          <p className="text-muted dark:text-muted-dark text-lg">
            Real issues flagged by your fellow citizens. Each report is verified and tracked until resolved.
          </p>
        </motion.div>

        {/* Location Filters */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap pb-2 mb-6">
          {LOCATION_FILTERS.map((filter) => {
            const isActive = activeFilter === filter.id;
            return (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'gradient-bg text-white shadow-lg shadow-primary/25 scale-[1.02]'
                    : 'glass border border-border dark:border-border-dark text-muted dark:text-muted-dark hover:text-primary dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        {/* Sorting Controls */}
        <div className="flex items-center justify-between flex-wrap gap-3 mb-6 pb-2 border-b border-border dark:border-border-dark">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setSortBy('popular')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 ${
                sortBy === 'popular'
                  ? 'bg-primary/10 dark:bg-white/10 text-primary dark:text-white shadow-sm'
                  : 'text-muted dark:text-muted-dark hover:text-primary dark:hover:text-white'
              }`}
            >
              <FiTrendingUp className="w-3.5 h-3.5" />
              Most Voted
            </button>
            <button
              onClick={() => setSortBy('newest')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 ${
                sortBy === 'newest'
                  ? 'bg-primary/10 dark:bg-white/10 text-primary dark:text-white shadow-sm'
                  : 'text-muted dark:text-muted-dark hover:text-primary dark:hover:text-white'
              }`}
            >
              <FiClock className="w-3.5 h-3.5" />
              Newest
            </button>
            <button
              onClick={() => setSortBy('nearest')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 ${
                sortBy === 'nearest'
                  ? 'bg-primary/10 dark:bg-white/10 text-primary dark:text-white shadow-sm'
                  : 'text-muted dark:text-muted-dark hover:text-primary dark:hover:text-white'
              }`}
            >
              <FiNavigation className="w-3.5 h-3.5" />
              Nearest
            </button>
          </div>

          <span className="text-xs text-muted dark:text-muted-dark">
            {filtered.length} {filtered.length === 1 ? 'issue' : 'issues'} found
          </span>
        </div>

        {/* Issues Grid or Empty State */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 px-4 rounded-3xl glass border border-border dark:border-border-dark my-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 dark:bg-blue-500/10 flex items-center justify-center mb-4">
              <FiMapPin className="w-7 h-7 text-primary dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-primary dark:text-white mb-2">
              {activeFilter === 'Nearby'
                ? 'No reported issues found within 5 km.'
                : 'No civic issues found in this area yet.'}
            </h3>
            <p className="text-sm text-muted dark:text-muted-dark max-w-md mx-auto mb-6">
              Be the first citizen to report a problem in this location and help bring positive change.
            </p>
            <Link
              href="/evidence"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-bg text-white font-semibold text-sm shadow-lg shadow-primary/25 hover:opacity-90 transition-all duration-200"
            >
              <FiPlusCircle className="w-4 h-4" />
              Report an Issue
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((issue, index) => {
              const issueTarget = `/issues/${encodeURIComponent(issue._id || issue.title)}`;
              return (
                <motion.div
                  key={issue.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.4, delay: Math.min(index, 5) * 0.05 }}
                  className="group relative p-6 rounded-2xl glass border border-border dark:border-border-dark card-hover flex flex-col justify-between cursor-pointer transition-all hover:border-primary/40 dark:hover:border-blue-500/40"
                >
                  <Link href={issueTarget} className="block flex-1 min-w-0">
                    <div>
                      {issue.distanceKm !== null && (
                        <div className="flex items-center justify-end mb-3">
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-500 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md">
                            <FiNavigation className="w-3 h-3" />
                            {formatDistance(issue.distanceKm)}
                          </span>
                        </div>
                      )}

                      <h3 className="text-base font-semibold text-primary dark:text-white mb-2 group-hover:text-primary-light dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                        {issue.title}
                      </h3>

                      <div className="space-y-1 text-xs text-muted dark:text-muted-dark mb-4">
                        <div className="flex items-start gap-1.5">
                          <FiMapPin className="w-3.5 h-3.5 text-primary/60 dark:text-blue-400/70 shrink-0 mt-0.5" />
                          <span className="line-clamp-2 leading-relaxed">{issue.location}</span>
                        </div>
                        <div className="flex items-center gap-1.5 pt-1">
                          <FiClock className="w-3.5 h-3.5 shrink-0" />
                          <span>{issue.time}</span>
                        </div>
                      </div>
                    </div>
                  </Link>

                  <div className="flex items-center justify-between pt-4 border-t border-border dark:border-border-dark mt-2 z-10 relative">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleLike(issue.id);
                      }}
                      className={`inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-xl transition-all duration-200 cursor-pointer ${
                        liked[issue.id] === 'like'
                          ? 'text-emerald-500 bg-emerald-500/10 scale-105 font-bold'
                          : 'text-muted dark:text-muted-dark hover:text-emerald-500 hover:bg-emerald-500/5'
                      }`}
                    >
                      <FiThumbsUp className="w-4 h-4" />
                      <span>{issue.likes}</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDislike(issue.id);
                      }}
                      className={`inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-xl transition-all duration-200 cursor-pointer ${
                        liked[issue.id] === 'dislike'
                          ? 'text-red-500 bg-red-500/10 scale-105 font-bold'
                          : 'text-muted dark:text-muted-dark hover:text-red-500 hover:bg-red-500/5'
                      }`}
                    >
                      <FiThumbsDown className="w-4 h-4" />
                      <span>{issue.dislikes}</span>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <Link
            href="/evidence"
            className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl glass border border-border dark:border-border-dark text-primary dark:text-white font-semibold text-sm hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-300"
          >
            Report an Issue
            <FiPlusCircle className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
          </Link>
        </motion.div>
      </div>

      {/* Login Required Popup */}
      <AnimatePresence>
        {showLoginPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowLoginPopup(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-sm w-full p-6 rounded-2xl glass border border-border dark:border-border-dark shadow-2xl"
            >
              <button
                onClick={() => setShowLoginPopup(false)}
                className="absolute top-3 right-3 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-muted dark:text-muted-dark transition-colors"
              >
                <FiX className="w-4 h-4" />
              </button>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto rounded-xl gradient-bg flex items-center justify-center mb-3">
                  <FiZap className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-primary dark:text-white mb-1">Login Required</h3>
                <p className="text-sm text-muted dark:text-muted-dark mb-5">
                  Please sign in to vote or support civic issues.
                </p>
                <Link
                  href="/signin"
                  onClick={() => setShowLoginPopup(false)}
                  className="inline-flex items-center justify-center w-full px-5 py-2.5 rounded-xl gradient-bg text-white text-sm font-semibold hover:opacity-90 transition-all shadow-lg shadow-primary/25"
                >
                  Sign In
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
