'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import type { UserLocation } from '@/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUser,
  FiAtSign,
  FiLock,
  FiEye,
  FiEyeOff,
  FiArrowRight,
  FiPhone,
  FiMapPin,
  FiHome,
  FiMap,
} from 'react-icons/fi';
import CockroachLogo from '@/components/CockroachLogo';
import LocationPicker, { LocationData } from '@/components/LocationPicker';

// ─── Input field wrapper ──────────────────────────────────────────────────────

const inputClass =
  'w-full pl-10 pr-4 py-3 rounded-xl bg-white/50 dark:bg-white/5 border border-border dark:border-border-dark text-sm text-primary dark:text-white placeholder:text-muted dark:placeholder:text-muted-dark focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-blue-500/20 focus:border-primary dark:focus:border-blue-500 transition-all';

const labelClass = 'block text-sm font-medium text-primary dark:text-white mb-1.5';

// ─── Component ────────────────────────────────────────────────────────────────

export default function SignUp() {
  const router = useRouter();
  const { signup } = useAuth();

  // ── Personal info ──────────────────────────────────────────────────────

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [contactNumber, setContactNumber] = useState('');

  // ── Address fields (auto-populated + editable) ─────────────────────────

  const [fullAddress, setFullAddress] = useState('');
  const [localArea, setLocalArea] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('');
  const [pinCode, setPinCode] = useState('');

  // ── Location / map state ───────────────────────────────────────────────

  const [confirmedLocation, setConfirmedLocation] = useState<LocationData | null>(null);

  // ── Form state ─────────────────────────────────────────────────────────

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // ── Location confirmed callback ────────────────────────────────────────

  const handleLocationConfirmed = useCallback((data: LocationData) => {
    setConfirmedLocation(data);
    // Auto-populate address fields — user can still edit them freely after
    if (data.formattedAddress) setFullAddress(data.formattedAddress);
    if (data.localArea) setLocalArea(data.localArea);
    if (data.district) setDistrict(data.district);
    if (data.state) setState(data.state);
    if (data.pinCode) setPinCode(data.pinCode);
    setError('');
  }, []);

  // ── Submit ─────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic field validation
    if (!name.trim()) { setError('Full name is required.'); return; }
    if (!username.trim()) { setError('Username is required.'); return; }
    if (username.length < 3) { setError('Username must be at least 3 characters.'); return; }
    if (!password.trim()) { setError('Password is required.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }

    // Phone validation
    if (!contactNumber.trim()) { setError('Contact number is required.'); return; }
    const phoneDigits = contactNumber.replace(/\D/g, '');
    if (phoneDigits.length < 10 || phoneDigits.length > 13) {
      setError('Enter a valid phone number (10–13 digits).');
      return;
    }

    // Location validation
    if (!confirmedLocation) {
      setError('Please select and confirm your location on the map before registering.');
      return;
    }
    if (!fullAddress.trim()) { setError('Full address is required.'); return; }
    if (!district.trim()) { setError('District is required.'); return; }
    if (!state.trim()) { setError('State is required.'); return; }
    if (pinCode && !/^\d{6}$/.test(pinCode.trim())) {
      setError('PIN code must be 6 digits.');
      return;
    }

    // Build location payload — use confirmed GPS coords, but user-edited address text
    const locationPayload: UserLocation = {
      lat: confirmedLocation.lat,
      lng: confirmedLocation.lng,
      formattedAddress: fullAddress.trim(),
      localArea: localArea.trim(),
      district: district.trim(),
      state: state.trim(),
      pinCode: pinCode.trim(),
      country: confirmedLocation.country,
    };

    setLoading(true);
    const result = await signup(
      name.trim(),
      username.trim(),
      password,
      contactNumber.trim(),
      locationPayload
    );
    setLoading(false);

    if (result.ok) {
      router.push('/');
    } else {
      setError(result.error || 'Sign up failed');
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex items-start justify-center py-20 px-4">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 dark:bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent-saffron/5 dark:bg-amber-500/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-2xl"
      >
        <div className="p-8 rounded-3xl glass border border-border dark:border-border-dark shadow-xl shadow-black/5">

          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-5">
              <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
                <CockroachLogo className="w-6 h-6" variant="light" />
              </div>
            </Link>
            <h1 className="text-2xl font-bold text-primary dark:text-white">Create Account</h1>
            <p className="text-sm text-muted dark:text-muted-dark mt-1">
              Join the community and make your voice heard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* ── Section 1: Personal Info ─────────────────────────────── */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-lg gradient-bg flex items-center justify-center shrink-0">
                  <FiUser className="w-3 h-3 text-white" />
                </div>
                <p className="text-sm font-semibold text-primary dark:text-white">Personal Information</p>
              </div>

              <div className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className={labelClass}>Full Name</label>
                  <div className="relative">
                    <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted dark:text-muted-dark" />
                    <input
                      id="signup-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Username */}
                <div>
                  <label className={labelClass}>Username</label>
                  <div className="relative">
                    <FiAtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted dark:text-muted-dark" />
                    <input
                      id="signup-username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Choose a unique username"
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className={labelClass}>Password</label>
                  <div className="relative">
                    <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted dark:text-muted-dark" />
                    <input
                      id="signup-password"
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a strong password (min 6 chars)"
                      className="w-full pl-10 pr-12 py-3 rounded-xl bg-white/50 dark:bg-white/5 border border-border dark:border-border-dark text-sm text-primary dark:text-white placeholder:text-muted dark:placeholder:text-muted-dark focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-blue-500/20 focus:border-primary dark:focus:border-blue-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted dark:text-muted-dark hover:text-primary dark:hover:text-white transition-colors"
                    >
                      {showPw ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Contact Number */}
                <div>
                  <label className={labelClass}>Contact Number</label>
                  <div className="relative">
                    <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted dark:text-muted-dark" />
                    <input
                      id="signup-phone"
                      type="tel"
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      placeholder="+91 9876543210"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border dark:border-border-dark" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-transparent text-xs text-muted dark:text-muted-dark font-medium">
                  Location Details
                </span>
              </div>
            </div>

            {/* ── Section 2: Location Map ──────────────────────────────── */}
            <div>
              <LocationPicker onLocationConfirmed={handleLocationConfirmed} />
            </div>

            {/* ── Section 3: Address Fields (auto-populated + editable) ── */}
            <AnimatePresence>
              {confirmedLocation && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded-lg gradient-bg flex items-center justify-center shrink-0">
                      <FiHome className="w-3 h-3 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-primary dark:text-white">Address Details</p>
                      <p className="text-xs text-muted dark:text-muted-dark">
                        Auto-filled from map — feel free to edit
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Full Address */}
                    <div>
                      <label className={labelClass}>
                        Full Address
                      </label>
                      <div className="relative">
                        <FiMapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-muted dark:text-muted-dark shrink-0" />
                        <textarea
                          id="signup-full-address"
                          value={fullAddress}
                          onChange={(e) => setFullAddress(e.target.value)}
                          placeholder="Full address"
                          rows={2}
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/50 dark:bg-white/5 border border-border dark:border-border-dark text-sm text-primary dark:text-white placeholder:text-muted dark:placeholder:text-muted-dark focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-blue-500/20 focus:border-primary dark:focus:border-blue-500 transition-all resize-none"
                        />
                      </div>
                    </div>

                    {/* Local Area + District in a grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Local Area</label>
                        <div className="relative">
                          <FiMapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted dark:text-muted-dark" />
                          <input
                            id="signup-local-area"
                            type="text"
                            value={localArea}
                            onChange={(e) => setLocalArea(e.target.value)}
                            placeholder="Locality / Neighbourhood"
                            className={inputClass}
                          />
                        </div>
                      </div>
                      <div>
                        <label className={labelClass}>District</label>
                        <div className="relative">
                          <FiMap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted dark:text-muted-dark" />
                          <input
                            id="signup-district"
                            type="text"
                            value={district}
                            onChange={(e) => setDistrict(e.target.value)}
                            placeholder="District"
                            className={inputClass}
                          />
                        </div>
                      </div>
                    </div>

                    {/* State + PIN in a grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>State</label>
                        <div className="relative">
                          <FiMap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted dark:text-muted-dark" />
                          <input
                            id="signup-state"
                            type="text"
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                            placeholder="State"
                            className={inputClass}
                          />
                        </div>
                      </div>
                      <div>
                        <label className={labelClass}>PIN Code</label>
                        <div className="relative">
                          <FiHome className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted dark:text-muted-dark" />
                          <input
                            id="signup-pincode"
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            value={pinCode}
                            onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
                            placeholder="6-digit PIN"
                            className={inputClass}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Note about location required */}
            {!confirmedLocation && (
              <p className="text-xs text-muted dark:text-muted-dark text-center">
                📍 Please select and confirm your location above to fill address details
              </p>
            )}

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-sm text-red-500 bg-red-500/10 px-4 py-2.5 rounded-xl"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl gradient-bg text-white font-semibold text-sm hover:opacity-90 transition-all duration-200 shadow-lg shadow-primary/25 disabled:opacity-50"
            >
              {loading ? 'Creating Account…' : 'Create Account'}
              <FiArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-center text-sm text-muted dark:text-muted-dark mt-6">
            Already have an account?{' '}
            <Link href="/signin" className="text-primary dark:text-blue-400 font-medium hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
