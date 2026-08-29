'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiMapPin,
  FiNavigation,
  FiSearch,
  FiX,
  FiThumbsUp,
  FiPlus,
  FiLayers,
  FiLoader,
  FiInfo,
  FiCrosshair,
  FiCheckCircle,
} from 'react-icons/fi';
import { useIssues, Issue } from '@/hooks/useIssues';
import { useAuth } from '@/hooks/useAuth';
import 'leaflet/dist/leaflet.css';
import type * as LType from 'leaflet';

// ─── Known coordinate lookup for standard demo locations ──────────────────────
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
};

function getCoordsForLocation(issue: Issue, index: number): [number, number] {
  if (typeof issue.latitude === 'number' && typeof issue.longitude === 'number') {
    return [issue.latitude, issue.longitude];
  }
  const locationStr = issue.location;
  if (LOCATION_COORDS[locationStr]) {
    return LOCATION_COORDS[locationStr];
  }
  for (const [key, coords] of Object.entries(LOCATION_COORDS)) {
    if (locationStr.toLowerCase().includes(key.toLowerCase().split(',')[0])) {
      return coords;
    }
  }
  // Deterministic scatter around Phagwara / Punjab region for realism
  const baseLat = 31.224 + ((index * 37) % 30) * 0.03 - 0.45;
  const baseLng = 75.7708 + ((index * 53) % 30) * 0.03 - 0.45;
  return [baseLat, baseLng];
}

const CATEGORIES = [
  { id: 'all', label: 'All Issues', icon: '📍' },
  { id: 'roads', label: 'Roads & Infra', icon: '🛣️' },
  { id: 'water', label: 'Water & Sanitation', icon: '🚰' },
  { id: 'healthcare', label: 'Healthcare', icon: '🏥' },
  { id: 'electricity', label: 'Electricity', icon: '⚡' },
  { id: 'environment', label: 'Environment', icon: '🌳' },
  { id: 'education', label: 'Education', icon: '🎓' },
];

interface SearchResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
}

export default function CivicMapPage() {
  const { issues, toggleLike } = useIssues();
  const { user } = useAuth();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LType.Map | null>(null);
  const markersLayerRef = useRef<LType.LayerGroup | null>(null);
  const userMarkerRef = useRef<LType.Marker | null>(null);
  const userAccuracyCircleRef = useRef<LType.Circle | null>(null);
  const leafletRef = useRef<typeof import('leaflet') | null>(null);

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsMessage, setGpsMessage] = useState<string | null>(null);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [liveLocationName, setLiveLocationName] = useState<string | null>(null);
  const [isLiveActive, setIsLiveActive] = useState(false);

  // Search autocomplete
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Filter issues by category
  const filteredIssues = useMemo(() => {
    if (selectedCategory === 'all') return issues;
    return issues.filter((i) =>
      i.category.toLowerCase().includes(selectedCategory.toLowerCase())
    );
  }, [issues, selectedCategory]);

  // Initial center preference (user registered location > default Phagwara/Punjab)
  const initialCenter: [number, number] = useMemo(() => {
    if (user?.location?.lat && user?.location?.lng) {
      return [user.location.lat, user.location.lng];
    }
    return [31.224, 75.7708]; // Phagwara center
  }, [user]);

  // ── 1. Helper to render user live marker + accuracy circle ────────────────
  const renderUserLocationBeacon = useCallback(
    (lat: number, lng: number, accuracy = 80) => {
      if (!mapInstanceRef.current || !leafletRef.current) return;
      const L = leafletRef.current;
      const map = mapInstanceRef.current;

      // Custom pulsing GPS beacon icon
      const userIcon = L.divIcon({
        className: 'user-live-gps-beacon',
        html: `
          <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
            <div style="
              position: absolute;
              width: 36px;
              height: 36px;
              border-radius: 50%;
              background: rgba(30, 58, 95, 0.25);
              animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
            "></div>
            <div style="
              position: absolute;
              width: 22px;
              height: 22px;
              border-radius: 50%;
              background: rgba(255, 153, 51, 0.35);
              animation: pulse 2s ease-in-out infinite;
            "></div>
            <div style="
              position: relative;
              width: 16px;
              height: 16px;
              border-radius: 50%;
              background: linear-gradient(135deg, #1E3A5F 0%, #2B5A8C 100%);
              border: 3px solid #FFFFFF;
              box-shadow: 0 3px 10px rgba(30, 58, 95, 0.6);
            "></div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -18],
      });

      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([lat, lng]);
      } else {
        const marker = L.marker([lat, lng], {
          icon: userIcon,
          zIndexOffset: 1000,
        }).addTo(map);

        marker.bindPopup(`
          <div style="font-family: system-ui, sans-serif; padding: 4px;">
            <div style="font-size: 11px; font-weight: 700; color: #1E3A5F; display: flex; align-items: center; gap: 4px; margin-bottom: 2px;">
              <span>📍 YOUR LIVE LOCATION</span>
            </div>
            <p style="font-size: 12px; color: #475569; margin: 0;">
              Coordinates: ${lat.toFixed(5)}, ${lng.toFixed(5)}
            </p>
          </div>
        `);
        userMarkerRef.current = marker;
      }

      // Accuracy circle
      if (userAccuracyCircleRef.current) {
        userAccuracyCircleRef.current.setLatLng([lat, lng]);
        userAccuracyCircleRef.current.setRadius(accuracy);
      } else {
        const circle = L.circle([lat, lng], {
          radius: accuracy,
          color: '#1E3A5F',
          weight: 1.5,
          opacity: 0.4,
          fillColor: '#2B5A8C',
          fillOpacity: 0.08,
        }).addTo(map);
        userAccuracyCircleRef.current = circle;
      }
    },
    []
  );

  // ── 2. Real GPS auto-detect & auto-zoom ────────────────────────────────────
  const locateAndZoomLivePosition = useCallback(
    (zoomLevel = 16, notify = false) => {
      if (typeof window === 'undefined' || !navigator.geolocation) {
        if (notify) setGpsMessage('Geolocation is not supported by your browser.');
        return;
      }

      setGpsLoading(true);
      if (notify) setGpsMessage(null);

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude: lat, longitude: lng, accuracy } = pos.coords;
          setGpsLoading(false);
          setUserCoords({ lat, lng });
          setIsLiveActive(true);

          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([lat, lng], zoomLevel, {
              duration: 1.5,
              easeLinearity: 0.25,
            });
          }

          renderUserLocationBeacon(lat, lng, accuracy || 60);

          // Reverse geocode to get human-readable location name
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=jsonv2`
            );
            if (res.ok) {
              const data = await res.json();
              const addr = data.address || {};
              const name =
                addr.suburb ||
                addr.neighbourhood ||
                addr.city ||
                addr.town ||
                addr.state_district ||
                'Your Area';
              setLiveLocationName(name);
            }
          } catch {
            setLiveLocationName('Live GPS');
          }
        },
        (err) => {
          setGpsLoading(false);
          // If auto-detection is denied, fallback to registered user location or center
          if (user?.location?.lat && user?.location?.lng) {
            const lat = user.location.lat;
            const lng = user.location.lng;
            setUserCoords({ lat, lng });
            renderUserLocationBeacon(lat, lng, 100);
            if (mapInstanceRef.current) {
              mapInstanceRef.current.setView([lat, lng], zoomLevel);
            }
            setLiveLocationName(user.location.localArea || user.location.district || 'Registered Location');
          }
          if (notify) {
            if (err.code === err.PERMISSION_DENIED) {
              setGpsMessage('Location permission denied. Please allow GPS access.');
            } else {
              setGpsMessage('Could not acquire your GPS position.');
            }
          }
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    },
    [renderUserLocationBeacon, user]
  );

  // ── 3. Initialize Map Client-Side ──────────────────────────────────────────
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      try {
        const L = (await import('leaflet')).default;
        if (!isMounted || !mapContainerRef.current || mapInstanceRef.current) return;
        leafletRef.current = L;

        // Auto-center on initial user coords if present, zoom in at 15
        const map = L.map(mapContainerRef.current, {
          center: initialCenter,
          zoom: 15,
          zoomControl: false,
        });

        // Add Zoom control at bottom right
        L.control.zoom({ position: 'bottomright' }).addTo(map);

        // Standard OpenStreetMap public tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);

        const markersLayer = L.layerGroup().addTo(map);
        markersLayerRef.current = markersLayer;
        mapInstanceRef.current = map;
        setMapReady(true);

        // Automatically trigger live location detection and zoom
        locateAndZoomLivePosition(16, false);
      } catch (err) {
        console.error('Map init error:', err);
      }
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersLayerRef.current = null;
        userMarkerRef.current = null;
        userAccuracyCircleRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── 4. Render Issue Markers on Map ────────────────────────────────────────
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !leafletRef.current || !markersLayerRef.current)
      return;

    const L = leafletRef.current;
    const markersLayer = markersLayerRef.current;
    markersLayer.clearLayers();

    filteredIssues.forEach((issue, idx) => {
      const [lat, lng] = getCoordsForLocation(issue, idx);
      const isUrgent = issue.urgency?.toLowerCase() === 'high';

      const markerHtml = `
        <div style="
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: ${isUrgent ? 'linear-gradient(135deg, #EF4444, #DC2626)' : 'linear-gradient(135deg, #1E3A5F, #2B5A8C)'};
          color: white;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
          border: 2px solid #FFFFFF;
          cursor: pointer;
          transition: transform 0.2s ease;
        ">
          <span style="transform: rotate(45deg); font-size: 13px; line-height: 1;">
            ${isUrgent ? '⚠️' : '📍'}
          </span>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'civic-issue-marker',
        html: markerHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });

      const marker = L.marker([lat, lng], { icon: customIcon });

      const popupContent = `
        <div style="min-width: 220px; font-family: system-ui, sans-serif; padding: 4px;">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
            <span style="
              font-size: 10px;
              font-weight: 700;
              text-transform: uppercase;
              padding: 2px 6px;
              border-radius: 6px;
              background: ${isUrgent ? '#FEE2E2; color: #DC2626;' : '#E0E7FF; color: #1E3A5F;'}
            ">
              ${issue.category || 'General'}
            </span>
            <span style="font-size: 11px; color: #64748B;">${issue.location}</span>
          </div>
          <p style="font-weight: 600; font-size: 13px; line-height: 1.3; color: #0F172A; margin: 0 0 8px 0;">
            ${issue.title}
          </p>
          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; color: #64748B;">
            <span>👍 ${issue.upvotes || 0} supporters</span>
            <span>💬 ${issue.comments || 0} notes</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.on('click', () => {
        setSelectedIssue(issue);
      });

      markersLayer.addLayer(marker);
    });
  }, [mapReady, filteredIssues]);

  // ── 5. Fly to Issue Location on Click ─────────────────────────────────────
  const handleSelectIssueFromList = useCallback((issue: Issue, idx: number) => {
    setSelectedIssue(issue);
    if (!mapInstanceRef.current) return;
    const [lat, lng] = getCoordsForLocation(issue, idx);
    mapInstanceRef.current.flyTo([lat, lng], 15, { duration: 1.2 });
  }, []);

  // ── 6. Search Location Autocomplete ───────────────────────────────────────
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          query.trim()
        )}&format=jsonv2&addressdetails=1&limit=5`;
        const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
        if (res.ok) {
          const items: SearchResult[] = await res.json();
          setSearchResults(items);
          setShowSearchDropdown(items.length > 0);
        }
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 350);
  };

  const handleSelectSearchLocation = (item: SearchResult) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    setSearchQuery(item.display_name);
    setShowSearchDropdown(false);

    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lat, lng], 15, { duration: 1.4 });
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] lg:min-h-[calc(100vh-5rem)] flex flex-col pt-16 lg:pt-20 bg-background text-foreground">
      {/* Top Floating Control Bar */}
      <div className="absolute top-20 lg:top-24 left-4 right-4 z-30 pointer-events-none">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pointer-events-auto">
          
          {/* Search + GPS + Live Status */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 max-w-xl w-full relative">
            <div className="relative flex-1 min-w-[200px]">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted dark:text-muted-dark pointer-events-none" />
              <input
                type="text"
                placeholder="Search city, district, or area in India…"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => searchResults.length > 0 && setShowSearchDropdown(true)}
                className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-border dark:border-border-dark text-sm text-primary dark:text-white placeholder:text-muted dark:placeholder:text-muted-dark shadow-lg shadow-black/5 focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-blue-500/20"
              />
              {isSearching && (
                <FiLoader className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary dark:text-blue-400 animate-spin" />
              )}
              {searchQuery && !isSearching && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                    setShowSearchDropdown(false);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted dark:text-muted-dark hover:text-primary dark:hover:text-white"
                >
                  <FiX className="w-4 h-4" />
                </button>
              )}

              {/* Autocomplete dropdown */}
              <AnimatePresence>
                {showSearchDropdown && searchResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="absolute left-0 right-0 top-full mt-1.5 bg-card dark:bg-slate-900 border border-border dark:border-border-dark rounded-2xl shadow-2xl z-50 overflow-hidden max-h-60 overflow-y-auto"
                  >
                    {searchResults.map((item) => (
                      <button
                        key={item.place_id}
                        type="button"
                        onClick={() => handleSelectSearchLocation(item)}
                        className="w-full text-left px-4 py-3 hover:bg-primary/5 dark:hover:bg-white/5 border-b border-border/40 dark:border-border-dark/40 last:border-none text-xs text-primary dark:text-white flex items-start gap-2.5 transition-colors cursor-pointer"
                      >
                        <FiMapPin className="w-3.5 h-3.5 text-accent-saffron shrink-0 mt-0.5" />
                        <span className="truncate flex-1">{item.display_name}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Live GPS Re-center Button */}
            <motion.button
              type="button"
              onClick={() => locateAndZoomLivePosition(16, true)}
              disabled={gpsLoading}
              whileTap={{ scale: 0.96 }}
              title="Recenter & zoom on live location"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-semibold text-white gradient-bg hover:opacity-90 transition-all shadow-lg shadow-primary/20 shrink-0 cursor-pointer disabled:opacity-50"
            >
              {gpsLoading ? (
                <FiLoader className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <FiCrosshair className="w-3.5 h-3.5" />
              )}
              <span>{gpsLoading ? 'Locating…' : 'My Location'}</span>
            </motion.button>
          </div>

          {/* Right side: Live GPS Badge + Report Issue button */}
          <div className="flex items-center gap-2">
            {/* Live Location Active Indicator */}
            {userCoords && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-green-500/30 text-xs text-green-600 dark:text-green-400 font-medium shadow-md"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="truncate max-w-[140px]">
                  {liveLocationName || 'Live GPS Active'}
                </span>
              </motion.div>
            )}

            {/* Action Button: Report Issue */}
            <Link
              href="/evidence"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl gradient-bg text-white text-xs font-semibold shadow-lg shadow-primary/25 hover:opacity-90 transition-all shrink-0 cursor-pointer"
            >
              <FiPlus className="w-4 h-4" />
              <span>Report Issue</span>
            </Link>
          </div>
        </div>

        {/* GPS Alert Message */}
        <AnimatePresence>
          {gpsMessage && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="max-w-md mx-auto mt-2 px-3.5 py-2 rounded-xl bg-amber-500 text-white text-xs shadow-lg flex items-center justify-between"
            >
              <span>{gpsMessage}</span>
              <button
                type="button"
                onClick={() => setGpsMessage(null)}
                className="ml-2 hover:opacity-80"
              >
                <FiX className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Map + Sidebar Area */}
      <div className="relative flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Category Pills Overlay */}
        <div className="absolute top-36 lg:top-40 left-4 right-4 z-20 pointer-events-none">
          <div className="max-w-7xl mx-auto flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-1 pointer-events-auto">
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium backdrop-blur-md border transition-all cursor-pointer whitespace-nowrap shadow-sm ${
                    active
                      ? 'bg-primary text-white border-primary dark:bg-blue-600 dark:border-blue-600 shadow-primary/25'
                      : 'bg-white/80 dark:bg-slate-900/80 text-muted dark:text-muted-dark border-border dark:border-border-dark hover:bg-white dark:hover:bg-slate-800 hover:text-primary dark:hover:text-white'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                  {cat.id === 'all' && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-black/10 dark:bg-white/10">
                      {issues.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Map Canvas */}
        <div className="relative flex-1 w-full min-h-[450px] lg:min-h-full">
          {!mapReady && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-surface dark:bg-surface-dark z-10">
              <FiLoader className="w-8 h-8 text-primary dark:text-blue-400 animate-spin" />
              <p className="text-sm font-medium text-muted dark:text-muted-dark">
                Loading CivicPulse Interactive Map & Live GPS…
              </p>
            </div>
          )}
          <div ref={mapContainerRef} className="w-full h-full min-h-[500px] z-0" />
        </div>

        {/* Side Panel: Issues List & Selected Issue Card */}
        <div className="w-full lg:w-96 lg:max-w-sm bg-card/95 dark:bg-slate-900/95 backdrop-blur-md border-t lg:border-t-0 lg:border-l border-border dark:border-border-dark flex flex-col max-h-[40vh] lg:max-h-full z-20 shadow-2xl">
          {/* Side Panel Header */}
          <div className="p-4 border-b border-border dark:border-border-dark flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg gradient-bg flex items-center justify-center text-white">
                <FiLayers className="w-3.5 h-3.5" />
              </div>
              <h2 className="text-sm font-bold text-primary dark:text-white">
                Civic Issues ({filteredIssues.length})
              </h2>
            </div>
            <span className="text-[11px] text-muted dark:text-muted-dark">
              Click pin to inspect
            </span>
          </div>

          {/* Selected Issue Preview Card (if any selected) */}
          <AnimatePresence>
            {selectedIssue && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 bg-primary/5 dark:bg-blue-900/20 border-b border-border dark:border-border-dark shrink-0"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-accent-saffron/15 text-accent-saffron dark:text-amber-400">
                    {selectedIssue.category}
                  </span>
                  <button
                    onClick={() => setSelectedIssue(null)}
                    className="text-muted dark:text-muted-dark hover:text-primary dark:hover:text-white"
                  >
                    <FiX className="w-3.5 h-3.5" />
                  </button>
                </div>
                <h3 className="text-sm font-semibold text-primary dark:text-white leading-snug mb-2">
                  {selectedIssue.title}
                </h3>
                <div className="flex items-center justify-between text-xs text-muted dark:text-muted-dark">
                  <span className="flex items-center gap-1">
                    <FiMapPin className="w-3 h-3 text-red-500" />
                    {selectedIssue.location}
                  </span>
                  <button
                    onClick={() => toggleLike(selectedIssue.id)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg gradient-bg text-white text-[11px] font-medium shadow-sm hover:opacity-90 cursor-pointer"
                  >
                    <FiThumbsUp className="w-3 h-3" />
                    Support ({selectedIssue.upvotes || 0})
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Scrollable Issues List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filteredIssues.length === 0 ? (
              <div className="text-center py-10 text-muted dark:text-muted-dark">
                <FiInfo className="w-6 h-6 mx-auto mb-2 opacity-50" />
                <p className="text-xs">No issues found in this category.</p>
              </div>
            ) : (
              filteredIssues.map((issue, idx) => {
                const isSelected = selectedIssue?.id === issue.id;
                return (
                  <motion.div
                    key={issue.id}
                    onClick={() => handleSelectIssueFromList(issue, idx)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-primary dark:border-blue-500 bg-primary/5 dark:bg-blue-500/10 shadow-sm'
                        : 'border-border dark:border-border-dark bg-card/60 dark:bg-card-dark/60 hover:border-primary/40 dark:hover:border-blue-500/40'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {issue.category}
                      </span>
                      <span className="text-[11px] text-muted dark:text-muted-dark">
                        {issue.time || 'Recent'}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-primary dark:text-white line-clamp-2 mb-2 leading-relaxed">
                      {issue.title}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-muted dark:text-muted-dark">
                      <span className="flex items-center gap-1 truncate max-w-[160px]">
                        <FiMapPin className="w-3 h-3 text-accent-saffron shrink-0" />
                        {issue.location}
                      </span>
                      <span className="flex items-center gap-1 font-medium text-primary dark:text-blue-400">
                        <FiThumbsUp className="w-3 h-3" />
                        {issue.upvotes || 0}
                      </span>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
