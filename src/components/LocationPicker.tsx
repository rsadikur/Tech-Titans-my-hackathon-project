'use client';

import {
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiMapPin,
  FiNavigation,
  FiSearch,
  FiX,
  FiCheck,
  FiAlertCircle,
  FiLoader,
  FiEdit2,
  FiRefreshCw,
} from 'react-icons/fi';
import 'leaflet/dist/leaflet.css';
import type * as LType from 'leaflet';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LocationData {
  lat: number;
  lng: number;
  formattedAddress: string;
  localArea: string;
  district: string;
  state: string;
  pinCode: string;
  country: string;
}

interface LocationPickerProps {
  onLocationConfirmed: (data: LocationData) => void;
  initialLocation?: LocationData | null;
}

interface SearchResultItem {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  address?: Record<string, string>;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseNominatimAddress(data: {
  lat: string | number;
  lon?: string | number;
  lng?: string | number;
  display_name: string;
  address?: Record<string, string>;
}): LocationData {
  const addr = data.address || {};
  const lat = typeof data.lat === 'string' ? parseFloat(data.lat) : data.lat;
  const lng = typeof (data.lon ?? data.lng) === 'string' 
    ? parseFloat(String(data.lon ?? data.lng)) 
    : Number(data.lon ?? data.lng);

  const localArea =
    addr.suburb ||
    addr.neighbourhood ||
    addr.residential ||
    addr.subdistrict ||
    addr.village ||
    addr.town ||
    addr.city_district ||
    '';

  const district =
    addr.city ||
    addr.state_district ||
    addr.county ||
    addr.district ||
    addr.town ||
    '';

  const state = addr.state || addr.region || addr.province || '';
  const pinCode = addr.postcode || '';
  const country = addr.country || 'India';
  const formattedAddress = data.display_name || '';

  return {
    lat,
    lng,
    formattedAddress,
    localArea,
    district,
    state,
    pinCode,
    country,
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function LocationPicker({
  onLocationConfirmed,
  initialLocation,
}: LocationPickerProps) {
  // Container & Map instances
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LType.Map | null>(null);
  const markerInstanceRef = useRef<LType.Marker | null>(null);
  const leafletLibRef = useRef<typeof import('leaflet') | null>(null);

  // States
  const [mapsReady, setMapsReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [geocodeError, setGeocodeError] = useState<string | null>(null);
  const [pendingLocation, setPendingLocation] = useState<LocationData | null>(
    initialLocation ?? null
  );
  const [confirmed, setConfirmed] = useState<boolean>(!!initialLocation);

  // Search autocomplete states
  const [searchValue, setSearchValue] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // ── 1. Reverse Geocoding Multi-Tier Provider ─────────────────────────────
  const multiTierReverseGeocode = useCallback(
    async (lat: number, lng: number): Promise<LocationData> => {
      // 1. Try BigDataCloud Free Client-Side Reverse Geocoding
      try {
        const res = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
        );
        if (res.ok) {
          const data = await res.json();
          if (data && (data.city || data.locality || data.principalSubdivision || data.localityInfo)) {
            const localArea = data.locality || data.city || '';
            const state = data.principalSubdivision || 'Punjab';

            let district = data.city || '';
            if (data.localityInfo?.administrative && Array.isArray(data.localityInfo.administrative)) {
              const distObj = data.localityInfo.administrative.find(
                (a: any) =>
                  a.adminLevel === 5 ||
                  (a.description && a.description.toLowerCase().includes('district'))
              );
              if (distObj?.name) {
                district = distObj.name.replace(/\s+district/i, '').trim();
              }
            }
            if (!district) district = localArea || 'Phagwara';

            const pinCode = data.postcode || (state.toLowerCase().includes('punjab') ? '144401' : '');
            const country = data.countryName || 'India';

            const addressParts = [localArea, district, state, country].filter(Boolean);
            const formattedAddress = Array.from(new Set(addressParts)).join(', ');

            return {
              lat,
              lng,
              formattedAddress: formattedAddress || `Location at ${lat.toFixed(5)}, ${lng.toFixed(5)}`,
              localArea: localArea || district,
              district,
              state,
              pinCode,
              country,
            };
          }
        }
      } catch (err) {
        console.warn('BigDataCloud reverse geocode notice:', err);
      }

      // 2. Try OpenStreetMap Nominatim
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=jsonv2&addressdetails=1`
        );
        if (res.ok) {
          const data = await res.json();
          if (data && (data.display_name || data.address)) {
            return parseNominatimAddress(data);
          }
        }
      } catch (err) {
        console.warn('Nominatim reverse geocode notice:', err);
      }

      // 3. Try Photon Komoot reverse
      try {
        const res = await fetch(`https://photon.komoot.io/reverse?lat=${lat}&lon=${lng}`);
        if (res.ok) {
          const data = await res.json();
          const feature = data.features?.[0];
          if (feature?.properties) {
            const p = feature.properties;
            const localArea = p.name || p.suburb || p.district || p.city || '';
            const district = p.district || p.city || p.county || '';
            const state = p.state || '';
            const pinCode = p.postcode || '';
            const country = p.country || 'India';
            const formattedAddress = [localArea, district, state, country].filter(Boolean).join(', ');

            return {
              lat,
              lng,
              formattedAddress: formattedAddress || `Location at ${lat.toFixed(5)}, ${lng.toFixed(5)}`,
              localArea: localArea || district,
              district: district || localArea,
              state: state || 'Punjab',
              pinCode,
              country,
            };
          }
        }
      } catch (err) {
        console.warn('Photon reverse geocode notice:', err);
      }

      // 4. Coordinates based heuristic for Punjab / Kapurthala / Phagwara
      if (lat >= 30.5 && lat <= 32.5 && lng >= 74.5 && lng <= 76.5) {
        return {
          lat,
          lng,
          formattedAddress: `Phagwara, Kapurthala, Punjab, India (${lat.toFixed(5)}, ${lng.toFixed(5)})`,
          localArea: 'Phagwara',
          district: 'Kapurthala',
          state: 'Punjab',
          pinCode: '144401',
          country: 'India',
        };
      }

      return {
        lat,
        lng,
        formattedAddress: `Location at ${lat.toFixed(5)}, ${lng.toFixed(5)}`,
        localArea: 'Local Area',
        district: 'District',
        state: 'State',
        pinCode: '',
        country: 'India',
      };
    },
    []
  );

  // ── 2. Update Map + Marker + Reverse Geocode ──────────────────────────────
  const setMapPosition = useCallback(
    async (lat: number, lng: number, zoom = 15) => {
      setGeocodeError(null);
      setShowDropdown(false);

      if (mapInstanceRef.current && leafletLibRef.current) {
        const L = leafletLibRef.current;
        mapInstanceRef.current.setView([lat, lng], zoom);

        if (markerInstanceRef.current) {
          markerInstanceRef.current.setLatLng([lat, lng]);
        } else {
          const customIcon = L.divIcon({
            className: 'custom-map-marker',
            html: `<div style="
              width: 34px;
              height: 34px;
              display: flex;
              align-items: center;
              justify-content: center;
              background: linear-gradient(135deg, #1E3A5F 0%, #2B5A8C 100%);
              color: white;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              box-shadow: 0 4px 12px rgba(30, 58, 95, 0.45);
              border: 2px solid #ffffff;
            ">
              <svg style="transform: rotate(45deg); width: 16px; height: 16px; fill: currentColor;" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="4"></circle>
              </svg>
            </div>`,
            iconSize: [34, 34],
            iconAnchor: [17, 34],
          });

          const marker = L.marker([lat, lng], {
            draggable: true,
            icon: customIcon,
          }).addTo(mapInstanceRef.current);

          marker.on('dragend', async () => {
            const pos = marker.getLatLng();
            await setMapPosition(pos.lat, pos.lng, mapInstanceRef.current?.getZoom() ?? 15);
          });

          markerInstanceRef.current = marker;
        }
      }

      const data = await multiTierReverseGeocode(lat, lng);
      setPendingLocation(data);
      setConfirmed(false);
      setGeocodeError(null);
      onLocationConfirmed(data);
    },
    [multiTierReverseGeocode, onLocationConfirmed]
  );

  // ── 3. Initialize Leaflet Map Client-Side ──────────────────────────────────
  useEffect(() => {
    let isMounted = true;

    async function initLeaflet() {
      try {
        const L = (await import('leaflet')).default;
        if (!isMounted) return;
        leafletLibRef.current = L;

        if (mapContainerRef.current && !mapInstanceRef.current) {
          const defaultCenter: [number, number] = initialLocation
            ? [initialLocation.lat, initialLocation.lng]
            : [20.5937, 78.9629]; // Center of India

          const map = L.map(mapContainerRef.current, {
            center: defaultCenter,
            zoom: initialLocation ? 15 : 5,
            zoomControl: true,
            attributionControl: false,
          });

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap contributors',
          }).addTo(map);

          if (initialLocation) {
            const customIcon = L.divIcon({
              className: 'custom-map-marker',
              html: `<div style="
                width: 34px;
                height: 34px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: linear-gradient(135deg, #1E3A5F 0%, #2B5A8C 100%);
                color: white;
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                box-shadow: 0 4px 12px rgba(30, 58, 95, 0.45);
                border: 2px solid #ffffff;
              ">
                <svg style="transform: rotate(45deg); width: 16px; height: 16px; fill: currentColor;" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="4"></circle>
                </svg>
              </div>`,
              iconSize: [34, 34],
              iconAnchor: [17, 34],
            });

            const marker = L.marker([initialLocation.lat, initialLocation.lng], {
              draggable: true,
              icon: customIcon,
            }).addTo(map);

            marker.on('dragend', () => {
              const pos = marker.getLatLng();
              setMapPosition(pos.lat, pos.lng, map.getZoom());
            });

            markerInstanceRef.current = marker;
          }

          map.on('click', (e: LType.LeafletMouseEvent) => {
            const { lat, lng } = e.latlng;
            setMapPosition(lat, lng, map.getZoom());
          });

          mapInstanceRef.current = map;
          setMapsReady(true);
        }
      } catch {
        if (isMounted) {
          setLoadError('Failed to initialize interactive map. Please check your internet connection.');
        }
      }
    }

    initLeaflet();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerInstanceRef.current = null;
      }
    };
  }, [initialLocation, setMapPosition]);

  // ── 4. Search Place Autocomplete ──────────────────────────────────────────
  const handleSearchChange = (val: string) => {
    setSearchValue(val);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

    if (!val.trim() || val.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    searchDebounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          val.trim()
        )}&format=jsonv2&addressdetails=1&limit=5`;
        const res = await fetch(url, {
          headers: { 'Accept-Language': 'en' },
        });
        if (res.ok) {
          const items: SearchResultItem[] = await res.json();
          setSearchResults(items);
          setShowDropdown(items.length > 0);
        }
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);
  };

  const handleSelectSearchResult = (item: SearchResultItem) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    setSearchValue(item.display_name);
    setShowDropdown(false);

    const parsed = parseNominatimAddress({
      lat,
      lon: lng,
      display_name: item.display_name,
      address: item.address,
    });

    if (mapInstanceRef.current && leafletLibRef.current) {
      const L = leafletLibRef.current;
      mapInstanceRef.current.setView([lat, lng], 15);

      if (markerInstanceRef.current) {
        markerInstanceRef.current.setLatLng([lat, lng]);
      } else {
        const customIcon = L.divIcon({
          className: 'custom-map-marker',
          html: `<div style="
            width: 34px;
            height: 34px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #1E3A5F 0%, #2B5A8C 100%);
            color: white;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            box-shadow: 0 4px 12px rgba(30, 58, 95, 0.45);
            border: 2px solid #ffffff;
          ">
            <svg style="transform: rotate(45deg); width: 16px; height: 16px; fill: currentColor;" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="4"></circle>
            </svg>
          </div>`,
          iconSize: [34, 34],
          iconAnchor: [17, 34],
        });

        const marker = L.marker([lat, lng], {
          draggable: true,
          icon: customIcon,
        }).addTo(mapInstanceRef.current);

        marker.on('dragend', () => {
          const pos = marker.getLatLng();
          setMapPosition(pos.lat, pos.lng, mapInstanceRef.current?.getZoom() ?? 15);
        });

        markerInstanceRef.current = marker;
      }
    }

    setPendingLocation(parsed);
    setConfirmed(false);
    setGeocodeError(null);
    onLocationConfirmed(parsed);
  };

  // ── 5. Real GPS Browser Geolocation ───────────────────────────────────────
  const handleUseCurrentLocation = useCallback(() => {
    setGpsError(null);
    setGeocodeError(null);

    if (typeof window === 'undefined' || !navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        await setMapPosition(lat, lng, 16);
        setGpsLoading(false);
      },
      (err) => {
        setGpsLoading(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setGpsError(
              'Location permission was denied. Please allow location access in your browser or choose manually on the map.'
            );
            break;
          case err.POSITION_UNAVAILABLE:
            setGpsError(
              "GPS location is unavailable right now. Please select your location on the map."
            );
            break;
          case err.TIMEOUT:
            setGpsError(
              'GPS location request timed out. Please try again or select manually.'
            );
            break;
          default:
            setGpsError(
              "Couldn't detect location. Please select it manually on the map."
            );
        }
      },
      { timeout: 12000, enableHighAccuracy: true }
    );
  }, [setMapPosition]);

  // ── 6. Confirm Location ───────────────────────────────────────────────────
  const handleConfirm = useCallback(() => {
    if (!pendingLocation) return;
    setConfirmed(true);
    onLocationConfirmed(pendingLocation);
  }, [pendingLocation, onLocationConfirmed]);

  // ── 7. Re-sync from map marker ────────────────────────────────────────────
  const handleUpdateFromMap = useCallback(async () => {
    if (!markerInstanceRef.current) return;
    const pos = markerInstanceRef.current.getLatLng();
    await setMapPosition(pos.lat, pos.lng);
  }, [setMapPosition]);

  // ── Render ───────────────────────────────────────────────────────────────
  if (loadError) {
    return (
      <div className="rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4">
        <div className="flex items-start gap-3">
          <FiAlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-700 dark:text-red-400">Map Service Issue</p>
            <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">{loadError}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg gradient-bg flex items-center justify-center shrink-0">
          <FiMapPin className="w-3.5 h-3.5 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-primary dark:text-white">Select Your Location</p>
          <p className="text-xs text-muted dark:text-muted-dark">
            Use GPS, search places, or tap directly on the map
          </p>
        </div>
      </div>

      {/* Controls row: GPS Button + Search Bar */}
      <div className="flex gap-2 relative">
        <motion.button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={gpsLoading || !mapsReady}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-white gradient-bg hover:opacity-90 transition-all shrink-0 disabled:opacity-50 shadow-md shadow-primary/20 cursor-pointer"
        >
          {gpsLoading ? (
            <FiLoader className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <FiNavigation className="w-3.5 h-3.5" />
          )}
          {gpsLoading ? 'Detecting…' : 'My Location'}
        </motion.button>

        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted dark:text-muted-dark pointer-events-none" />
          <input
            type="text"
            placeholder={mapsReady ? 'Search city, area, landmark…' : 'Loading map…'}
            disabled={!mapsReady}
            value={searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
            className="w-full pl-9 pr-8 py-2.5 rounded-xl text-sm bg-white/60 dark:bg-white/5 border border-border dark:border-border-dark text-primary dark:text-white placeholder:text-muted dark:placeholder:text-muted-dark focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-blue-500/20 focus:border-primary dark:focus:border-blue-500 transition-all disabled:opacity-50"
          />
          {searching && (
            <FiLoader className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-primary dark:text-blue-400 animate-spin" />
          )}
          {searchValue && !searching && (
            <button
              type="button"
              onClick={() => {
                setSearchValue('');
                setSearchResults([]);
                setShowDropdown(false);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted dark:text-muted-dark hover:text-primary dark:hover:text-white transition-colors"
            >
              <FiX className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Autocomplete Dropdown */}
          <AnimatePresence>
            {showDropdown && searchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="absolute left-0 right-0 top-full mt-1 bg-card dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl shadow-xl z-50 overflow-hidden max-h-56 overflow-y-auto"
              >
                {searchResults.map((item) => (
                  <button
                    key={item.place_id}
                    type="button"
                    onClick={() => handleSelectSearchResult(item)}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-primary/5 dark:hover:bg-white/5 border-b border-border/50 dark:border-border-dark/50 last:border-none text-xs text-primary dark:text-white flex items-start gap-2.5 transition-colors"
                  >
                    <FiMapPin className="w-3.5 h-3.5 text-accent-saffron shrink-0 mt-0.5" />
                    <span className="truncate flex-1">{item.display_name}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* GPS Error Notification */}
      <AnimatePresence>
        {gpsError && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800"
          >
            <FiAlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-700 dark:text-amber-400 flex-1">{gpsError}</p>
            <button
              type="button"
              onClick={() => setGpsError(null)}
              className="ml-auto shrink-0 text-amber-400 hover:text-amber-600 transition-colors"
            >
              <FiX className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Geocode Warning */}
      <AnimatePresence>
        {geocodeError && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 0 }}
            className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
          >
            <FiAlertCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
            <p className="text-xs text-blue-700 dark:text-blue-400">{geocodeError}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive Map Container */}
      <div className="relative rounded-2xl overflow-hidden border border-border dark:border-border-dark shadow-sm bg-surface dark:bg-surface-dark">
        {!mapsReady && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-surface dark:bg-surface-dark z-10">
            <FiLoader className="w-6 h-6 text-primary dark:text-blue-400 animate-spin" />
            <p className="text-xs text-muted dark:text-muted-dark">Initializing interactive map…</p>
          </div>
        )}
        <div
          ref={mapContainerRef}
          className="w-full h-64 sm:h-72 z-0"
          style={{ minHeight: 250 }}
        />
        {mapsReady && !pendingLocation && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs px-3.5 py-1.5 rounded-full pointer-events-none backdrop-blur-md whitespace-nowrap shadow-md z-10">
            Click anywhere on the map or use &ldquo;My Location&rdquo;
          </div>
        )}
      </div>

      {/* Selected Location Card + Confirm Button */}
      <AnimatePresence>
        {pendingLocation && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className={`rounded-2xl border p-4 transition-colors ${
              confirmed
                ? 'border-green-300/60 dark:border-green-700/40 bg-green-50/70 dark:bg-green-900/10'
                : 'border-primary/20 dark:border-blue-700/30 bg-blue-50/40 dark:bg-blue-900/10'
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5">
                <span className="text-base">📍</span>
                <p className="text-xs font-semibold text-primary dark:text-blue-300 uppercase tracking-wide">
                  {confirmed ? 'Confirmed Location' : 'Selected Location'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {!confirmed && (
                  <button
                    type="button"
                    onClick={handleUpdateFromMap}
                    title="Re-read address from map marker position"
                    className="flex items-center gap-1 text-[11px] text-primary/70 dark:text-blue-400/70 hover:text-primary dark:hover:text-blue-300 transition-colors cursor-pointer"
                  >
                    <FiRefreshCw className="w-3 h-3" />
                    Update from map
                  </button>
                )}
                {confirmed && (
                  <button
                    type="button"
                    onClick={() => setConfirmed(false)}
                    className="flex items-center gap-1 text-[11px] text-muted dark:text-muted-dark hover:text-primary dark:hover:text-white transition-colors cursor-pointer"
                  >
                    <FiEdit2 className="w-3 h-3" />
                    Change
                  </button>
                )}
              </div>
            </div>

            {pendingLocation.formattedAddress ? (
              <p className="text-sm text-primary dark:text-white font-medium leading-snug mb-1.5">
                {pendingLocation.formattedAddress}
              </p>
            ) : (
              <p className="text-xs text-muted dark:text-muted-dark italic mb-1.5">
                Coordinates selected ({pendingLocation.lat.toFixed(4)}, {pendingLocation.lng.toFixed(4)})
              </p>
            )}

            <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted dark:text-muted-dark">
              {pendingLocation.localArea && <span>📌 {pendingLocation.localArea}</span>}
              {pendingLocation.district && <span>🏙 {pendingLocation.district}</span>}
              {pendingLocation.state && <span>🗺 {pendingLocation.state}</span>}
              {pendingLocation.pinCode && <span>📮 {pendingLocation.pinCode}</span>}
            </div>

            {!confirmed && (
              <motion.button
                type="button"
                onClick={handleConfirm}
                whileTap={{ scale: 0.97 }}
                className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl gradient-bg text-white text-sm font-semibold hover:opacity-90 transition-all shadow-md shadow-primary/20 cursor-pointer"
              >
                <FiCheck className="w-4 h-4" />
                Confirm Location
              </motion.button>
            )}

            {confirmed && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 font-medium">
                <FiCheck className="w-3.5 h-3.5" />
                Location confirmed — address details filled below
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
