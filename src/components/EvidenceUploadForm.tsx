'use client';

import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiMapPin,
  FiSearch,
  FiUploadCloud,
  FiFileText,
  FiCheckCircle,
  FiArrowLeft,
  FiArrowRight,
  FiX,
  FiImage,
  FiVideo,
  FiThumbsUp,
  FiAlertTriangle,
  FiPlus,
  FiLayers,
  FiInfo,
  FiEdit2,
  FiEye,
  FiCompass,
  FiCalendar,
  FiShield,
  FiMaximize2,
  FiUser,
} from 'react-icons/fi';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useIssues, Issue } from '@/hooks/useIssues';
import LocationPicker, { LocationData } from '@/components/LocationPicker';
import { fileToDataUrl, getLocalEvidence, saveLocalEvidence, LocalEvidenceRecord } from '@/lib/localEvidence';

// ─── Supported Categories ─────────────────────────────────────────────────────
const ISSUE_CATEGORIES = [
  { id: 'pothole', label: 'Pothole', icon: '🕳️' },
  { id: 'road_damage', label: 'Road Damage', icon: '🛣️' },
  { id: 'garbage', label: 'Garbage & Waste', icon: '🗑️' },
  { id: 'broken_streetlight', label: 'Broken Streetlight', icon: '💡' },
  { id: 'water_drainage', label: 'Water / Drainage', icon: '🚰' },
  { id: 'public_infrastructure', label: 'Public Infrastructure', icon: '🏛️' },
  { id: 'other', label: 'Other', icon: '⚠️' },
];

// Default verified civic proof photos by category
const CATEGORY_DEFAULT_PHOTOS: Record<string, string[]> = {
  roads: [
    'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1000&auto=format&fit=crop&q=80',
  ],
  pothole: [
    'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=1000&auto=format&fit=crop&q=80',
  ],
  healthcare: [
    'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=1000&auto=format&fit=crop&q=80',
  ],
  environment: [
    'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=1000&auto=format&fit=crop&q=80',
  ],
  water: [
    'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=1000&auto=format&fit=crop&q=80',
  ],
  technology: [
    'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1000&auto=format&fit=crop&q=80',
  ],
  corruption: [
    'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=1000&auto=format&fit=crop&q=80',
  ],
};

// ─── Coordinate lookup helper for distance calculations ──────────────────────
const LOCATION_COORDS_MAP: Record<string, [number, number]> = {
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
  'Jalandhar, Punjab': [31.326, 75.5762],
  'Ludhiana, Punjab': [30.901, 75.8573],
  'Amritsar, Punjab': [31.634, 74.8723],
};

function getIssueCoords(issue: Issue, index = 0): [number, number] {
  if (typeof issue.latitude === 'number' && typeof issue.longitude === 'number' && !isNaN(issue.latitude) && !isNaN(issue.longitude)) {
    return [issue.latitude, issue.longitude];
  }
  if (LOCATION_COORDS_MAP[issue.location]) {
    return LOCATION_COORDS_MAP[issue.location];
  }
  for (const [key, coords] of Object.entries(LOCATION_COORDS_MAP)) {
    if (issue.location.toLowerCase().includes(key.toLowerCase().split(',')[0])) {
      return coords;
    }
  }
  // Scatter realistically near base region
  return [31.224 + ((index * 37) % 30) * 0.03 - 0.45, 75.7708 + ((index * 53) % 30) * 0.03 - 0.45];
}

// ─── Haversine Distance Calculation (in Kilometers) ───────────────────────────
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatDistance(distanceKm: number): string {
  if (distanceKm < 0.05) return 'Exact Spot (<50 m)';
  if (distanceKm < 1.0) return `${Math.round(distanceKm * 1000)} m away`;
  return `${distanceKm.toFixed(2)} km away`;
}

// ─── Media File Item ─────────────────────────────────────────────────────────
interface MediaItem {
  id: string;
  file: File;
  name: string;
  sizeFormatted: string;
  type: 'photo' | 'video';
  previewUrl: string;
}

type EvidenceRecord = LocalEvidenceRecord;

// ─── Steps in Reporting Flow ──────────────────────────────────────────────────
type StepId = 'location' | 'nearby' | 'evidence' | 'details' | 'review' | 'success';

export default function EvidenceUploadForm() {
  const { user } = useAuth();
  const { issues, addIssue, toggleLike } = useIssues();

  // Wizard Step State
  const [currentStep, setCurrentStep] = useState<StepId>('location');

  // Mode: 'new_issue' | 'support_existing'
  const [reportMode, setReportMode] = useState<'new_issue' | 'support_existing'>('new_issue');
  const [targetExistingIssue, setTargetExistingIssue] = useState<Issue | null>(null);

  // Photo & Video Lightbox Modal for Existing Issues
  const [viewEvidenceModalIssue, setViewEvidenceModalIssue] = useState<Issue | null>(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  // Step 1: Location State
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [manualAddress, setManualAddress] = useState('');

  // Step 4: Media Upload State
  const [mediaFiles, setMediaFiles] = useState<MediaItem[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 6: Issue Details State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('pothole');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState('Medium');

  // Form Validation & Submission
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittedReportId, setSubmittedReportId] = useState<string | null>(null);
  const [supportedIssueIds, setSupportedIssueIds] = useState<number[]>([]);

  // User submitted evidence cache from localStorage
  const [storedEvidence, setStoredEvidence] = useState<EvidenceRecord[]>([]);

  const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB max

  useEffect(() => {
    try {
      const stored = localStorage.getItem('submitted_evidence');
      if (stored) {
        setStoredEvidence(JSON.parse(stored));
      }
    } catch {}
  }, []);

  // Helper to fetch all evidence items attached to an issue
  const getEvidenceForIssue = useCallback(
    (issue: Issue): { type: 'photo' | 'video'; url: string; userName?: string; timeText: string }[] => {
      // 1. Check user uploaded evidence for this issue
      const userItems = storedEvidence
        .filter((e) => e.issueId === issue.id || (e.title && e.title.includes(issue.title.slice(0, 20))))
        .map((e) => ({
          type: e.type,
          url: e.url,
          userName: e.userName || 'Citizen Reporter',
          timeText: 'Recently uploaded',
        }));

      // 2. Default verified category photos
      const catKey = issue.category.toLowerCase();
      const defaultUrls = CATEGORY_DEFAULT_PHOTOS[catKey] || CATEGORY_DEFAULT_PHOTOS['roads'] || [];
      const defaultItems = defaultUrls.map((url, i) => ({
        type: 'photo' as const,
        url,
        userName: i === 0 ? 'Verified On-ground Inspector' : 'Citizen Reporter',
        timeText: issue.time || '2d ago',
      }));

      return [...userItems, ...defaultItems];
    },
    [storedEvidence]
  );

  // ── 1. Calculate Nearby Issues within 1 km ─────────────────────────────────
  const nearbyIssuesWithDistance = useMemo(() => {
    if (!selectedLocation) return [];

    const results: { issue: Issue; distanceKm: number }[] = [];

    issues.forEach((issue, idx) => {
      const [issueLat, issueLng] = getIssueCoords(issue, idx);
      const dist = calculateDistanceKm(
        selectedLocation.lat,
        selectedLocation.lng,
        issueLat,
        issueLng
      );

      // Check within 1.0 km radius
      if (dist <= 1.0) {
        results.push({ issue, distanceKm: dist });
      }
    });

    // Sort by nearest distance first, then most voted
    return results.sort((a, b) => a.distanceKm - b.distanceKm || (b.issue.upvotes || 0) - (a.issue.upvotes || 0));
  }, [selectedLocation, issues]);

  // ── 2. Handle Location Confirmed (Step 1 -> Step 2) ────────────────────────
  const handleLocationConfirmed = useCallback((loc: LocationData) => {
    setSelectedLocation(loc);
    setManualAddress(loc.formattedAddress || `${loc.localArea}, ${loc.district}`);
    setFormError(null);
  }, []);

  const proceedToNearbyCheck = () => {
    if (!selectedLocation) {
      setFormError('Please select and confirm a location on the map first.');
      return;
    }
    setFormError(null);
    setCurrentStep('nearby');
  };

  // ── 3. Handle Support Existing Issue ───────────────────────────────────────
  const handleSupportExistingIssue = (issue: Issue) => {
    toggleLike(issue.id);
    if (!supportedIssueIds.includes(issue.id)) {
      setSupportedIssueIds((prev) => [...prev, issue.id]);
    }
  };

  const handleAddEvidenceToExisting = (issue: Issue) => {
    setTargetExistingIssue(issue);
    setReportMode('support_existing');
    setViewEvidenceModalIssue(null);
    setCurrentStep('evidence');
  };

  const handleReportNewIssue = () => {
    setTargetExistingIssue(null);
    setReportMode('new_issue');
    setCurrentStep('evidence');
  };

  // ── 4. File Upload & Validation (Step 3) ───────────────────────────────────
  const validateAndAddFiles = useCallback((incoming: FileList | File[]) => {
    setFileError(null);
    const valid: MediaItem[] = [];

    for (let i = 0; i < incoming.length; i++) {
      const f = incoming[i];
      if (f.size > MAX_FILE_SIZE) {
        setFileError(`"${f.name}" exceeds the 100 MB maximum size limit.`);
        continue;
      }
      const isVideo = f.type.startsWith('video');
      const isImage = f.type.startsWith('image');

      if (!isImage && !isVideo) {
        setFileError(`"${f.name}" is not a supported image or video format.`);
        continue;
      }

      valid.push({
        id: `media-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        file: f,
        name: f.name,
        sizeFormatted: (f.size / (1024 * 1024)).toFixed(1) + ' MB',
        type: isVideo ? 'video' : 'photo',
        previewUrl: URL.createObjectURL(f),
      });
    }

    if (valid.length > 0) {
      setMediaFiles((prev) => [...prev, ...valid]);
    }
  }, []);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndAddFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveMedia = (id: string) => {
    setMediaFiles((prev) => {
      const target = prev.find((m) => m.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((m) => m.id !== id);
    });
  };

  const proceedFromEvidence = () => {
    if (mediaFiles.length === 0) {
      setFileError('Please attach at least one photo or video evidence before proceeding.');
      return;
    }
    setFileError(null);
    if (reportMode === 'support_existing') {
      setCurrentStep('review');
    } else {
      setCurrentStep('details');
    }
  };

  // ── 5. Proceed from Details to Review (Step 4 -> Step 5) ──────────────────
  const proceedToReview = () => {
    if (!title.trim()) {
      setFormError('Please enter a clear title describing the civic problem.');
      return;
    }
    if (!description.trim()) {
      setFormError('Please enter a description providing context or location details.');
      return;
    }
    setFormError(null);
    setCurrentStep('review');
  };

  // ── 6. Final Submit Action (Step 5 -> Success) ────────────────────────────
  const handleSubmitReport = async () => {
    setSubmitting(true);
    setFormError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      const reportId = `CP-${Date.now().toString().slice(-6)}`;
      setSubmittedReportId(reportId);

      if (reportMode === 'new_issue') {
        const fullLocationText = manualAddress.trim() || selectedLocation?.formattedAddress || 'Nearby Area';
        addIssue({
          title: title.trim(),
          category,
          location: fullLocationText,
          urgency,
        });

        // Store evidence record in localStorage
          const stored = getLocalEvidence();
          const mediaUrls = await Promise.all(mediaFiles.map((m) => fileToDataUrl(m.file)));
          const newEvidenceRecords: EvidenceRecord[] = mediaFiles.map((m, idx) => ({
          _id: `ev-${reportId}-${idx}`,
          reportId,
          title: title.trim(),
          description: description.trim(),
          category,
          location: fullLocationText,
          latitude: selectedLocation?.lat,
          longitude: selectedLocation?.lng,
          type: m.type,
          url: mediaUrls[idx],
          userName: user?.name || 'Verified Citizen',
          createdAt: Date.now(),
          status: 'pending',
        }));
        saveLocalEvidence([...newEvidenceRecords, ...stored]);
        setStoredEvidence([...newEvidenceRecords, ...stored]);
      } else if (targetExistingIssue) {
        toggleLike(targetExistingIssue.id);
        const stored = getLocalEvidence();
        const mediaUrls = await Promise.all(mediaFiles.map((m) => fileToDataUrl(m.file)));
        const newEvidenceRecords: EvidenceRecord[] = mediaFiles.map((m, idx) => ({
          _id: `ev-support-${targetExistingIssue.id}-${Date.now()}-${idx}`,
          issueId: targetExistingIssue.id,
          title: `Supporting Evidence: ${targetExistingIssue.title}`,
          category: targetExistingIssue.category,
          location: targetExistingIssue.location,
          latitude: selectedLocation?.lat,
          longitude: selectedLocation?.lng,
          type: m.type,
          url: mediaUrls[idx],
          userName: user?.name || 'Verified Citizen',
          createdAt: Date.now(),
          status: 'pending',
        }));
        saveLocalEvidence([...newEvidenceRecords, ...stored]);
        setStoredEvidence([...newEvidenceRecords, ...stored]);
      }

      setCurrentStep('success');
    } catch (err: unknown) {
      console.error('Submission error:', err);
      setFormError(err instanceof Error ? err.message : 'Submission could not be completed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetFlow = () => {
    setSelectedLocation(null);
    setManualAddress('');
    setMediaFiles([]);
    setTitle('');
    setDescription('');
    setReportMode('new_issue');
    setTargetExistingIssue(null);
    setCurrentStep('location');
    setSubmittedReportId(null);
    setFormError(null);
  };

  // ── Step Indicator Definition ──────────────────────────────────────────────
  const STEPS = [
    { id: 'location', label: '1. Location', icon: FiMapPin },
    { id: 'nearby', label: '2. Check Nearby', icon: FiSearch },
    { id: 'evidence', label: '3. Evidence', icon: FiUploadCloud },
    { id: 'details', label: '4. Details', icon: FiFileText },
    { id: 'review', label: '5. Review', icon: FiCheckCircle },
  ];

  const getStepIndex = (step: StepId): number => {
    switch (step) {
      case 'location': return 0;
      case 'nearby': return 1;
      case 'evidence': return 2;
      case 'details': return 3;
      case 'review': return 4;
      case 'success': return 5;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      
      {/* ── Top Header & Philosophy Banner ───────────────────────────────── */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 dark:bg-blue-500/10 text-primary dark:text-blue-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <FiShield className="w-3.5 h-3.5" />
          <span>Civic Verification & Evidence Portal</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-primary dark:text-white mb-2">
          Report a Civic Problem
        </h1>
        <p className="text-sm text-muted dark:text-muted-dark max-w-xl mx-auto">
          &ldquo;Check before you report.&rdquo; One problem = one report. Multiple citizens = united votes and verifiable photo/video proof.
        </p>
      </div>

      {/* ── Multi-Step Progress Tracker ───────────────────────────────────── */}
      {currentStep !== 'success' && (
        <div className="mb-8 p-3.5 rounded-2xl glass border border-border dark:border-border-dark shadow-sm">
          <div className="flex items-center justify-between overflow-x-auto scrollbar-hide py-1">
            {STEPS.map((s, idx) => {
              const currentIdx = getStepIndex(currentStep);
              const isPassed = currentIdx > idx;
              const isCurrent = currentIdx === idx;
              const Icon = s.icon;

              return (
                <div key={s.id} className="flex items-center shrink-0">
                  <div
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      isCurrent
                        ? 'gradient-bg text-white shadow-md shadow-primary/20'
                        : isPassed
                        ? 'text-accent-green dark:text-green-400 bg-green-500/10'
                        : 'text-muted dark:text-muted-dark opacity-60'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{s.label}</span>
                    {isPassed && <FiCheckCircle className="w-3 h-3 text-green-500" />}
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div
                      className={`w-6 sm:w-10 h-0.5 mx-1 transition-colors ${
                        isPassed ? 'bg-green-500/50' : 'bg-border dark:bg-border-dark'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Main Step Content Card ────────────────────────────────────────── */}
      <div className="rounded-3xl glass border border-border dark:border-border-dark p-6 sm:p-8 shadow-xl shadow-black/5 relative">

        {/* Global Error Banner */}
        <AnimatePresence>
          {formError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start gap-3"
            >
              <FiAlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-red-600 dark:text-red-400">{formError}</p>
              </div>
              <button
                type="button"
                onClick={() => setFormError(null)}
                className="text-red-400 hover:text-red-600"
              >
                <FiX className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═════════════════════════════════════════════════════════════════════
            STEP 1: LOCATION SELECTION FIRST
        ═════════════════════════════════════════════ */}
        {currentStep === 'location' && (
          <motion.div
            key="step-location"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-6"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-lg gradient-bg flex items-center justify-center text-white">
                  <FiMapPin className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-bold text-primary dark:text-white">
                  Step 1: Select Problem Location
                </h2>
              </div>
              <p className="text-xs text-muted dark:text-muted-dark">
                First, pinpoint where the problem exists using GPS, address search, or by tapping on the map.
              </p>
            </div>

            {/* Embedded Interactive Map Picker */}
            <div className="rounded-2xl border border-border dark:border-border-dark p-4 bg-card/60 dark:bg-card-dark/60">
              <LocationPicker
                initialLocation={selectedLocation}
                onLocationConfirmed={handleLocationConfirmed}
              />
            </div>

            {/* Next Action Button */}
            <div className="flex items-center justify-between pt-4 border-t border-border dark:border-border-dark">
              <div className="text-xs text-muted dark:text-muted-dark">
                {selectedLocation ? (
                  <span className="text-green-600 dark:text-green-400 font-medium flex items-center gap-1.5">
                    <FiCheckCircle className="w-4 h-4" />
                    Location selected: {selectedLocation.localArea || selectedLocation.district}
                  </span>
                ) : (
                  <span>⚠️ Confirm your location marker above to continue</span>
                )}
              </div>

              <motion.button
                type="button"
                onClick={proceedToNearbyCheck}
                disabled={!selectedLocation}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-bg text-white text-sm font-semibold hover:opacity-90 transition-all shadow-lg shadow-primary/25 disabled:opacity-50 cursor-pointer"
              >
                <span>Check Nearby Reports</span>
                <FiArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════
            STEP 2: CHECK NEARBY ISSUES & DUPLICATE PREVENTION
        ═════════════════════════════════════════════ */}
        {currentStep === 'nearby' && (
          <motion.div
            key="step-nearby"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-6"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg gradient-bg flex items-center justify-center text-white">
                    <FiSearch className="w-4 h-4" />
                  </div>
                  <h2 className="text-lg font-bold text-primary dark:text-white">
                    Step 2: Problems Already Reported Near Here
                  </h2>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-primary/10 dark:bg-blue-500/10 text-primary dark:text-blue-400">
                  Radius: 1 km
                </span>
              </div>
              <p className="text-xs text-muted dark:text-muted-dark mt-1">
                Showing existing civic issues reported within 1 km of <b>{selectedLocation?.formattedAddress}</b>.
              </p>
            </div>

            {/* Duplicate Notice */}
            {nearbyIssuesWithDistance.length > 0 && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                <FiAlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs font-bold text-amber-700 dark:text-amber-400">
                    This problem may already have been reported!
                  </h3>
                  <p className="text-xs text-amber-600 dark:text-amber-300 mt-0.5 leading-relaxed">
                    Check the list below and view attached photos. If your issue is already listed, support it or add your own photos/videos to strengthen it instead of creating a duplicate report.
                  </p>
                </div>
              </div>
            )}

            {/* List of Nearby Issues */}
            <div className="space-y-3">
              {nearbyIssuesWithDistance.length === 0 ? (
                <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-border dark:border-border-dark">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 dark:bg-blue-500/10 flex items-center justify-center text-primary dark:text-blue-400 mb-3">
                    <FiCheckCircle className="w-7 h-7" />
                  </div>
                  <h4 className="text-sm font-bold text-primary dark:text-white mb-1">
                    No existing reports found within 1 km
                  </h4>
                  <p className="text-xs text-muted dark:text-muted-dark max-w-md mx-auto mb-6">
                    You are the first citizen to report a problem at this exact location! Proceed to upload your evidence and details.
                  </p>
                  <motion.button
                    type="button"
                    onClick={handleReportNewIssue}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-bg text-white text-xs font-semibold shadow-lg shadow-primary/25 hover:opacity-90 transition-all cursor-pointer"
                  >
                    <FiPlus className="w-4 h-4" />
                    <span>Report a New Issue Here</span>
                  </motion.button>
                </div>
              ) : (
                nearbyIssuesWithDistance.map(({ issue, distanceKm }) => {
                  const isSupported = supportedIssueIds.includes(issue.id);
                  const evidenceItems = getEvidenceForIssue(issue);
                  const firstPhotoUrl = evidenceItems[0]?.url;

                  return (
                    <div
                      key={issue.id}
                      className="p-4 rounded-2xl border border-border dark:border-border-dark bg-card/80 dark:bg-card-dark/80 hover:border-primary/40 dark:hover:border-blue-500/40 transition-all space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row items-start gap-4">
                        {/* Evidence Thumbnail with Click to View Photo */}
                        <div
                          onClick={() => {
                            setViewEvidenceModalIssue(issue);
                            setSelectedPhotoIndex(0);
                          }}
                          className="relative w-full sm:w-28 h-24 sm:h-24 rounded-xl overflow-hidden bg-black/10 shrink-0 border border-border/60 group cursor-pointer"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={firstPhotoUrl}
                            alt={issue.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end justify-between p-1.5 text-white">
                            <span className="text-[10px] font-semibold flex items-center gap-1">
                              <FiImage className="w-3 h-3" />
                              {evidenceItems.length} {evidenceItems.length === 1 ? 'Photo' : 'Photos'}
                            </span>
                            <span className="p-1 rounded-md bg-white/20 backdrop-blur-sm group-hover:bg-primary transition-colors">
                              <FiEye className="w-3 h-3 text-white" />
                            </span>
                          </div>
                        </div>

                        {/* Issue Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-primary/10 text-primary dark:bg-blue-500/15 dark:text-blue-400">
                              {issue.category}
                            </span>
                            <span className="text-[11px] font-semibold text-accent-saffron">
                              📍 {distanceKm < 0.1 ? 'Exact Spot' : `${distanceKm.toFixed(2)} km away`}
                              📍 {formatDistance(distanceKm)}
                            </span>
                            <span className="text-[11px] text-muted dark:text-muted-dark">
                              ⏱️ {issue.time || 'Recent'}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ml-auto ${issue.statusColor || 'text-amber-500 bg-amber-500/10'}`}>
                              {issue.status}
                            </span>
                          </div>

                          <h4 className="text-sm font-bold text-primary dark:text-white leading-snug">
                            {issue.title}
                          </h4>
                          <p className="text-xs text-muted dark:text-muted-dark mt-1 flex items-center gap-1">
                            <FiMapPin className="w-3 h-3 text-red-400 shrink-0" />
                            <span className="truncate">{issue.location}</span>
                          </p>
                        </div>
                      </div>

                      {/* Stats & Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/60 dark:border-border-dark/60">
                        <div className="flex items-center gap-3 text-xs text-muted dark:text-muted-dark">
                          <span>👍 <b>{issue.upvotes || 0}</b> citizen votes</span>
                          <span>💬 <b>{issue.comments || 0}</b> notes</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {/* VIEW PHOTO BUTTON */}
                          <button
                            type="button"
                            onClick={() => {
                              setViewEvidenceModalIssue(issue);
                              setSelectedPhotoIndex(0);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/70 dark:bg-white/10 text-primary dark:text-white border border-border dark:border-border-dark hover:bg-black/5 dark:hover:bg-white/15 transition-all cursor-pointer"
                          >
                            <FiImage className="w-3.5 h-3.5 text-accent-saffron" />
                            <span>View Photos ({evidenceItems.length})</span>
                          </button>

                          {/* SUPPORT BUTTON */}
                          <button
                            type="button"
                            onClick={() => handleSupportExistingIssue(issue)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                              isSupported
                                ? 'bg-green-500 text-white shadow-md'
                                : 'bg-primary/10 dark:bg-white/10 text-primary dark:text-white hover:bg-primary/20'
                            }`}
                          >
                            <FiThumbsUp className="w-3.5 h-3.5" />
                            <span>{isSupported ? 'Supported' : 'Support Issue'}</span>
                          </button>

                          {/* ADD EVIDENCE BUTTON */}
                          <button
                            type="button"
                            onClick={() => handleAddEvidenceToExisting(issue)}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold gradient-bg text-white hover:opacity-90 transition-all shadow-md shadow-primary/20 cursor-pointer"
                          >
                            <FiUploadCloud className="w-3.5 h-3.5" />
                            <span>Add Photo / Video</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-border dark:border-border-dark">
              <button
                type="button"
                onClick={() => setCurrentStep('location')}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-muted dark:text-muted-dark hover:text-primary dark:hover:text-white transition-colors cursor-pointer"
              >
                <FiArrowLeft className="w-4 h-4" />
                <span>Change Location</span>
              </button>

              {nearbyIssuesWithDistance.length > 0 && (
                <motion.button
                  type="button"
                  onClick={handleReportNewIssue}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-bg text-white text-xs font-semibold shadow-lg shadow-primary/20 hover:opacity-90 transition-all cursor-pointer"
                >
                  <FiPlus className="w-4 h-4" />
                  <span>None of these represents my problem — Report New</span>
                </motion.button>
              )}
            </div>
          </motion.div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════
            STEP 3: PHOTO & VIDEO EVIDENCE UPLOAD
        ═════════════════════════════════════════════ */}
        {currentStep === 'evidence' && (
          <motion.div
            key="step-evidence"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-6"
          >
            <div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg gradient-bg flex items-center justify-center text-white">
                  <FiUploadCloud className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-bold text-primary dark:text-white">
                  {reportMode === 'support_existing'
                    ? `Add Evidence to: ${targetExistingIssue?.title}`
                    : 'Step 3: Add Photo or Video Evidence'}
                </h2>
              </div>
              <p className="text-xs text-muted dark:text-muted-dark mt-1">
                Upload clear photos or video footage of the civic issue. Maximum 100 MB per file.
              </p>
            </div>

            {/* Target Issue Callout if Supporting */}
            {reportMode === 'support_existing' && targetExistingIssue && (
              <div className="p-3.5 rounded-2xl bg-primary/5 dark:bg-blue-900/20 border border-primary/20 text-xs">
                <div className="flex items-center justify-between font-semibold text-primary dark:text-blue-300 mb-1">
                  <span>Target Issue: {targetExistingIssue.title}</span>
                  <span className="uppercase text-[10px]">{targetExistingIssue.category}</span>
                </div>
                <p className="text-muted dark:text-muted-dark">
                  📍 {targetExistingIssue.location} • 👍 {targetExistingIssue.upvotes} votes
                </p>
              </div>
            )}

            {/* Drag & Drop Upload Zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-8 sm:p-10 rounded-3xl border-2 border-dashed transition-all text-center cursor-pointer ${
                dragOver
                  ? 'border-primary dark:border-blue-400 bg-primary/10 dark:bg-blue-500/10 scale-[1.01]'
                  : 'border-border dark:border-border-dark bg-card/40 dark:bg-card-dark/40 hover:border-primary/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={(e) => e.target.files && validateAndAddFiles(e.target.files)}
                className="hidden"
              />

              <div className="w-14 h-14 mx-auto rounded-2xl gradient-bg flex items-center justify-center text-white mb-3 shadow-lg shadow-primary/20">
                <FiUploadCloud className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-primary dark:text-white mb-1">
                Drag & Drop photos/videos or <span className="text-primary dark:text-blue-400 underline">Browse files</span>
              </h3>
              <p className="text-xs text-muted dark:text-muted-dark">
                Supports JPG, PNG, WEBP, MP4, MOV (Max 100 MB each). Mobile camera supported.
              </p>
            </div>

            {/* File Error */}
            <AnimatePresence>
              {fileError && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="text-xs text-red-500 bg-red-500/10 p-3 rounded-xl"
                >
                  {fileError}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Uploaded Media Previews */}
            {mediaFiles.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-primary dark:text-white">
                  Attached Evidence ({mediaFiles.length} file{mediaFiles.length > 1 ? 's' : ''})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {mediaFiles.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-2xl border border-border dark:border-border-dark bg-card/80 dark:bg-card-dark/80 flex items-center gap-3 relative group"
                    >
                      {item.type === 'photo' ? (
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-black/5 shrink-0 border border-border/50">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.previewUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-black/10 shrink-0 border border-border/50 flex items-center justify-center relative">
                          <video
                            src={item.previewUrl}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white">
                            <FiVideo className="w-5 h-5" />
                          </div>
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-primary dark:text-white truncate">
                          {item.name}
                        </p>
                        <p className="text-[11px] text-muted dark:text-muted-dark">
                          {item.type === 'video' ? '🎬 Video' : '📷 Image'} • {item.sizeFormatted}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveMedia(item.id)}
                        className="p-1.5 rounded-lg text-muted dark:text-muted-dark hover:text-red-500 hover:bg-red-500/10 transition-colors"
                        title="Remove file"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-border dark:border-border-dark">
              <button
                type="button"
                onClick={() => setCurrentStep('nearby')}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-muted dark:text-muted-dark hover:text-primary dark:hover:text-white transition-colors cursor-pointer"
              >
                <FiArrowLeft className="w-4 h-4" />
                <span>Back to Nearby</span>
              </button>

              <motion.button
                type="button"
                onClick={proceedFromEvidence}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-bg text-white text-xs font-semibold shadow-lg shadow-primary/25 hover:opacity-90 transition-all cursor-pointer"
              >
                <span>{reportMode === 'support_existing' ? 'Review & Submit Evidence' : 'Continue to Details'}</span>
                <FiArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════
            STEP 4: ISSUE DETAILS (For New Issues)
        ═════════════════════════════════════════════ */}
        {currentStep === 'details' && (
          <motion.div
            key="step-details"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-6"
          >
            <div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg gradient-bg flex items-center justify-center text-white">
                  <FiFileText className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-bold text-primary dark:text-white">
                  Step 4: Enter Issue Details
                </h2>
              </div>
              <p className="text-xs text-muted dark:text-muted-dark mt-1">
                Provide accurate information so local civic authorities and fellow citizens can verify and take action.
              </p>
            </div>

            <div className="space-y-4">
              {/* Category Selection */}
              <div>
                <label className="block text-xs font-bold text-primary dark:text-white mb-2">
                  Category *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {ISSUE_CATEGORIES.map((cat) => {
                    const isSelected = category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        className={`p-3 rounded-xl border text-left transition-all flex items-center gap-2 cursor-pointer ${
                          isSelected
                            ? 'border-primary dark:border-blue-500 bg-primary/10 dark:bg-blue-500/15 text-primary dark:text-white shadow-sm font-semibold'
                            : 'border-border dark:border-border-dark bg-card/50 dark:bg-card-dark/50 text-muted dark:text-muted-dark hover:border-primary/40'
                        }`}
                      >
                        <span className="text-base">{cat.icon}</span>
                        <span className="text-xs">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-primary dark:text-white mb-1.5">
                  Issue Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Deep crater potholes causing severe vehicle damage on Main Road"
                  className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-white/5 border border-border dark:border-border-dark text-sm text-primary dark:text-white placeholder:text-muted dark:placeholder:text-muted-dark focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-blue-500/20"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-primary dark:text-white mb-1.5">
                  Description *
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the severity, how long it has been broken, and any safety hazards..."
                  className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-white/5 border border-border dark:border-border-dark text-sm text-primary dark:text-white placeholder:text-muted dark:placeholder:text-muted-dark focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-blue-500/20 resize-none"
                />
              </div>

              {/* Location Summary (Pre-filled from Step 1) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-primary dark:text-white">
                    Verified Location (from Step 1)
                  </label>
                  <button
                    type="button"
                    onClick={() => setCurrentStep('location')}
                    className="text-[11px] text-primary dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <FiEdit2 className="w-3 h-3" />
                    Edit on map
                  </button>
                </div>
                <input
                  type="text"
                  value={manualAddress}
                  onChange={(e) => setManualAddress(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/30 dark:bg-white/5 border border-border dark:border-border-dark text-xs text-primary dark:text-white"
                />
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-border dark:border-border-dark">
              <button
                type="button"
                onClick={() => setCurrentStep('evidence')}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-muted dark:text-muted-dark hover:text-primary dark:hover:text-white transition-colors cursor-pointer"
              >
                <FiArrowLeft className="w-4 h-4" />
                <span>Back to Evidence</span>
              </button>

              <motion.button
                type="button"
                onClick={proceedToReview}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-bg text-white text-xs font-semibold shadow-lg shadow-primary/25 hover:opacity-90 transition-all cursor-pointer"
              >
                <span>Review Report</span>
                <FiArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════
            STEP 5: REVIEW & SUBMIT
        ═════════════════════════════════════════════ */}
        {currentStep === 'review' && (
          <motion.div
            key="step-review"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-6"
          >
            <div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg gradient-bg flex items-center justify-center text-white">
                  <FiCheckCircle className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-bold text-primary dark:text-white">
                  Step 5: Review Before Submission
                </h2>
              </div>
              <p className="text-xs text-muted dark:text-muted-dark mt-1">
                Please double-check your report information before publishing.
              </p>
            </div>

            <div className="space-y-4">
              {/* Report Summary Card */}
              <div className="p-5 rounded-2xl border border-border dark:border-border-dark bg-card/80 dark:bg-card-dark/80 space-y-4">
                {reportMode === 'new_issue' ? (
                  <>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-primary/10 text-primary dark:bg-blue-500/15 dark:text-blue-400">
                          {category}
                        </span>
                        <h3 className="text-base font-bold text-primary dark:text-white mt-1.5">
                          {title}
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCurrentStep('details')}
                        className="text-xs text-primary dark:text-blue-400 flex items-center gap-1 hover:underline"
                      >
                        <FiEdit2 className="w-3 h-3" />
                        Edit
                      </button>
                    </div>

                    <p className="text-xs text-muted dark:text-muted-dark leading-relaxed">
                      {description}
                    </p>
                  </>
                ) : (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-green-500/15 text-green-600 dark:text-green-400">
                      Adding Supporting Evidence
                    </span>
                    <h3 className="text-sm font-bold text-primary dark:text-white mt-1">
                      Target: {targetExistingIssue?.title}
                    </h3>
                  </div>
                )}

                {/* Location Box */}
                <div className="p-3 rounded-xl bg-surface dark:bg-surface-dark border border-border/60 dark:border-border-dark/60 text-xs">
                  <p className="font-semibold text-primary dark:text-white flex items-center gap-1.5 mb-0.5">
                    <FiMapPin className="w-3.5 h-3.5 text-accent-saffron" />
                    <span>Location & Coordinates</span>
                  </p>
                  <p className="text-muted dark:text-muted-dark">
                    {manualAddress || selectedLocation?.formattedAddress}
                  </p>
                  {selectedLocation && (
                    <p className="text-[10px] text-muted dark:text-muted-dark font-mono mt-1">
                      GPS: {selectedLocation.lat.toFixed(5)}, {selectedLocation.lng.toFixed(5)}
                    </p>
                  )}
                </div>

                {/* Attached Media Grid */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-primary dark:text-white">
                      Attached Media ({mediaFiles.length})
                    </p>
                    <button
                      type="button"
                      onClick={() => setCurrentStep('evidence')}
                      className="text-xs text-primary dark:text-blue-400 flex items-center gap-1 hover:underline"
                    >
                      <FiEdit2 className="w-3 h-3" />
                      Manage
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {mediaFiles.map((m) => (
                      <div
                        key={m.id}
                        className="relative rounded-xl overflow-hidden border border-border dark:border-border-dark aspect-video bg-black/10 flex items-center justify-center"
                      >
                        {m.type === 'photo' ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={m.previewUrl}
                            alt={m.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full relative flex items-center justify-center bg-black/30">
                            <video src={m.previewUrl} className="w-full h-full object-cover" />
                            <FiVideo className="w-6 h-6 text-white absolute" />
                          </div>
                        )}
                        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[9px] bg-black/60 text-white font-mono">
                          {m.sizeFormatted}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-border dark:border-border-dark">
              <button
                type="button"
                onClick={() => (reportMode === 'support_existing' ? setCurrentStep('evidence') : setCurrentStep('details'))}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-muted dark:text-muted-dark hover:text-primary dark:hover:text-white transition-colors cursor-pointer"
              >
                <FiArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <motion.button
                type="button"
                onClick={handleSubmitReport}
                disabled={submitting}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-xl gradient-bg text-white text-sm font-semibold shadow-lg shadow-primary/25 hover:opacity-90 transition-all disabled:opacity-50 cursor-pointer"
              >
                {submitting ? (
                  <span>Publishing Evidence…</span>
                ) : (
                  <>
                    <FiCheckCircle className="w-4 h-4" />
                    <span>{reportMode === 'support_existing' ? 'Submit Supporting Evidence' : 'Publish Civic Report'}</span>
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════
            SUCCESS STATE
        ═════════════════════════════════════════════ */}
        {currentStep === 'success' && (
          <motion.div
            key="step-success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8 space-y-6"
          >
            <div className="w-16 h-16 mx-auto rounded-3xl bg-green-500/10 text-green-500 flex items-center justify-center shadow-lg shadow-green-500/10">
              <FiCheckCircle className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-primary dark:text-white">
                {reportMode === 'support_existing'
                  ? 'Supporting Evidence Submitted!'
                  : 'Report Successfully Registered!'}
              </h2>
              <p className="text-xs text-muted dark:text-muted-dark">
                Report Tracking ID: <b className="font-mono text-primary dark:text-white">{submittedReportId}</b>
              </p>
            </div>

            <div className="max-w-md mx-auto p-4 rounded-2xl bg-surface dark:bg-surface-dark border border-border dark:border-border-dark text-xs text-left space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted dark:text-muted-dark">Verified Location:</span>
                <span className="font-semibold text-primary dark:text-white truncate max-w-[200px]">
                  {manualAddress || selectedLocation?.formattedAddress}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted dark:text-muted-dark">Status:</span>
                <span className="font-bold text-accent-green">Published & Live on Map</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted dark:text-muted-dark">Evidence Files:</span>
                <span className="font-semibold text-primary dark:text-white">{mediaFiles.length} item(s)</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              <Link
                href="/map"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-bg text-white text-xs font-semibold shadow-lg shadow-primary/25 hover:opacity-90 transition-all cursor-pointer"
              >
                <FiCompass className="w-4 h-4" />
                <span>View on Civic Map</span>
              </Link>

              <button
                type="button"
                onClick={handleResetFlow}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border dark:border-border-dark glass text-xs font-semibold text-primary dark:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
              >
                <FiPlus className="w-4 h-4" />
                <span>Report Another Issue</span>
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* ═════════════════════════════════════════════════════════════════════
          PHOTO & VIDEO EVIDENCE VIEWER MODAL / LIGHTBOX
      ═════════════════════════════════════════════ */}
      <AnimatePresence>
        {viewEvidenceModalIssue && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-3xl max-h-[90vh] bg-card dark:bg-slate-900 border border-border dark:border-border-dark rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-4 sm:p-5 border-b border-border dark:border-border-dark flex items-start justify-between gap-3 bg-surface/50 dark:bg-surface-dark/50">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-primary/10 text-primary dark:bg-blue-500/15 dark:text-blue-400">
                      {viewEvidenceModalIssue.category}
                    </span>
                    <span className="text-xs text-muted dark:text-muted-dark flex items-center gap-1">
                      <FiMapPin className="w-3 h-3 text-red-400" />
                      {viewEvidenceModalIssue.location}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-primary dark:text-white leading-snug">
                    {viewEvidenceModalIssue.title}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setViewEvidenceModalIssue(null)}
                  className="p-2 rounded-xl text-muted dark:text-muted-dark hover:text-primary dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Main Photo & Gallery Area */}
              {(() => {
                const items = getEvidenceForIssue(viewEvidenceModalIssue);
                const activeItem = items[selectedPhotoIndex] || items[0];

                return (
                  <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                    {/* Active Large Media Display */}
                    <div className="relative rounded-2xl overflow-hidden bg-black/90 aspect-video flex items-center justify-center max-h-[380px] shadow-inner">
                      {activeItem?.type === 'photo' ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={activeItem.url}
                          alt={viewEvidenceModalIssue.title}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <video
                          src={activeItem?.url}
                          controls
                          className="w-full h-full object-contain"
                        />
                      )}

                      {/* Photo Badge */}
                      <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs text-white flex items-center gap-2">
                        <FiUser className="w-3.5 h-3.5 text-accent-saffron" />
                        <span>{activeItem?.userName}</span>
                        <span className="text-white/60">• {activeItem?.timeText}</span>
                      </div>
                    </div>

                    {/* Thumbnail Strip (if multiple photos) */}
                    {items.length > 1 && (
                      <div className="space-y-1.5">
                        <p className="text-xs font-semibold text-muted dark:text-muted-dark">
                          All Uploaded Evidence ({items.length} files)
                        </p>
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                          {items.map((item, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setSelectedPhotoIndex(idx)}
                              className={`relative w-20 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                                selectedPhotoIndex === idx
                                  ? 'border-primary dark:border-blue-400 scale-105 shadow-md'
                                  : 'border-transparent opacity-70 hover:opacity-100'
                              }`}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={item.url}
                                alt="Thumbnail"
                                className="w-full h-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Issue Context Summary */}
                    <div className="p-4 rounded-2xl bg-surface dark:bg-surface-dark border border-border dark:border-border-dark flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div>
                        <p className="font-bold text-primary dark:text-white">
                          Citizen Support & Evidence Verification
                        </p>
                        <p className="text-muted dark:text-muted-dark mt-0.5">
                          👍 {viewEvidenceModalIssue.upvotes || 0} votes recorded • Status: <b className="text-amber-500">{viewEvidenceModalIssue.status}</b>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Support Inside Modal */}
                        <button
                          type="button"
                          onClick={() => handleSupportExistingIssue(viewEvidenceModalIssue)}
                          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-semibold transition-all cursor-pointer ${
                            supportedIssueIds.includes(viewEvidenceModalIssue.id)
                              ? 'bg-green-500 text-white shadow-md'
                              : 'bg-primary/10 dark:bg-white/10 text-primary dark:text-white hover:bg-primary/20'
                          }`}
                        >
                          <FiThumbsUp className="w-4 h-4" />
                          <span>{supportedIssueIds.includes(viewEvidenceModalIssue.id) ? 'Supported' : 'Support Issue'}</span>
                        </button>

                        {/* Add Evidence Inside Modal */}
                        <button
                          type="button"
                          onClick={() => handleAddEvidenceToExisting(viewEvidenceModalIssue)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl gradient-bg text-white font-semibold shadow-md shadow-primary/25 hover:opacity-90 transition-all cursor-pointer"
                        >
                          <FiUploadCloud className="w-4 h-4" />
                          <span>Add My Evidence</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
