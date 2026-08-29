'use client';

export interface LocalEvidenceRecord {
  _id: string;
  issueId?: number;
  reportId?: string;
  title: string;
  description?: string;
  category?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  urgency?: string;
  type: 'photo' | 'video';
  url: string;
  userName?: string;
  createdAt: number;
  status: 'pending' | 'approved' | 'rejected' | 'important';
}

export const LOCAL_EVIDENCE_KEY = 'submitted_evidence';
export const LOCAL_EVIDENCE_EVENT = 'local-evidence-updated';

export const DEFAULT_EVIDENCE: LocalEvidenceRecord[] = [
  {
    _id: 'ev-seed-1',
    reportId: 'CP-849102',
    title: 'Severe Deep Potholes on Law Gate Road',
    description: 'Multiple deep potholes after recent monsoon rain causing heavy traffic jams and vehicle damage near Block 18.',
    category: 'roads',
    location: 'Block 18, LPU, Chiheru Khusropur Link Road, Law gate, Phagwara',
    latitude: 31.2536,
    longitude: 75.7037,
    urgency: 'High',
    type: 'photo',
    url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=1000&auto=format&fit=crop&q=80',
    userName: 'Priya Sharma',
    createdAt: Date.now() - 3600000 * 3,
    status: 'approved',
  },
  {
    _id: 'ev-seed-2',
    reportId: 'CP-849103',
    title: 'Overflowing Sewage Drain near Market Entrance',
    description: 'Open sewage overflow posing health and hygiene hazards for local residents and shopkeepers.',
    category: 'water',
    location: 'Main Market, Phagwara, Punjab',
    latitude: 31.224,
    longitude: 75.7708,
    urgency: 'Critical',
    type: 'photo',
    url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=1000&auto=format&fit=crop&q=80',
    userName: 'Rajesh Kumar',
    createdAt: Date.now() - 86400000 * 1,
    status: 'approved',
  },
  {
    _id: 'ev-seed-3',
    reportId: 'CP-849104',
    title: 'Non-Functional Streetlights on Highway Link',
    description: 'Complete blackout along the 500-meter stretch making nighttime commuting dangerous.',
    category: 'electricity',
    location: 'Chiheru Bypass Road, Kapurthala',
    latitude: 31.248,
    longitude: 75.712,
    urgency: 'Medium',
    type: 'photo',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1000&auto=format&fit=crop&q=80',
    userName: 'Sneha Patel',
    createdAt: Date.now() - 86400000 * 2,
    status: 'important',
  },
  {
    _id: 'ev-seed-4',
    reportId: 'CP-849105',
    title: 'Garbage Dumping on Public Walkway',
    description: 'Accumulation of plastic and household waste blocking pedestrian footpath.',
    category: 'environment',
    location: 'Sector 3 Park Lane, Jalandhar',
    latitude: 31.326,
    longitude: 75.5762,
    urgency: 'High',
    type: 'photo',
    url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=1000&auto=format&fit=crop&q=80',
    userName: 'Amit Verma',
    createdAt: Date.now() - 86400000 * 2,
    status: 'approved',
  },
  {
    _id: 'ev-seed-5',
    reportId: 'CP-849106',
    title: 'Broken Water Supply Pipe Leaking Clean Water',
    description: 'Major drinking water pipeline breach wasting hundreds of liters daily.',
    category: 'water',
    location: 'Model Town, Phagwara',
    latitude: 31.229,
    longitude: 75.765,
    urgency: 'Critical',
    type: 'photo',
    url: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=1000&auto=format&fit=crop&q=80',
    userName: 'Vikram Singh',
    createdAt: Date.now() - 3600000 * 5,
    status: 'pending',
  },
  {
    _id: 'ev-seed-6',
    reportId: 'CP-849107',
    title: 'Damaged Guard Rails along Canal Bridge',
    description: 'Accident barrier broken and hanging into the canal, immediate repair required.',
    category: 'roads',
    location: 'GT Road Canal Bridge, Kapurthala',
    latitude: 31.38,
    longitude: 75.38,
    urgency: 'High',
    type: 'photo',
    url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=1000&auto=format&fit=crop&q=80',
    userName: 'Demo Citizen',
    createdAt: Date.now() - 3600000 * 1,
    status: 'pending',
  },
];

export function getLocalEvidence(): LocalEvidenceRecord[] {
  if (typeof window === 'undefined') return DEFAULT_EVIDENCE;
  try {
    const raw = localStorage.getItem(LOCAL_EVIDENCE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_EVIDENCE_KEY, JSON.stringify(DEFAULT_EVIDENCE));
      return DEFAULT_EVIDENCE;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_EVIDENCE;
  } catch {
    return DEFAULT_EVIDENCE;
  }
}

export function saveLocalEvidence(records: LocalEvidenceRecord[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_EVIDENCE_KEY, JSON.stringify(records));
  } catch (e) {
    // If quota exceeded, trim older items and retry safely
    try {
      const trimmed = records.slice(0, 20);
      localStorage.setItem(LOCAL_EVIDENCE_KEY, JSON.stringify(trimmed));
    } catch {
      try {
        const fallback = records.slice(0, 10).map((r) => ({
          ...r,
          url: r.url.length > 2000 ? 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=1000&auto=format&fit=crop&q=80' : r.url,
        }));
        localStorage.setItem(LOCAL_EVIDENCE_KEY, JSON.stringify(fallback));
      } catch (err) {
        console.warn('Could not persist full evidence record in localStorage quota:', err);
      }
    }
  }
  window.dispatchEvent(new Event(LOCAL_EVIDENCE_EVENT));
}

/**
 * Compresses an image file down to a lightweight web JPEG DataURL (<100KB)
 * to avoid localStorage QuotaExceededError while maintaining crisp visual quality.
 */
export function fileToCompressedDataUrl(file: File, maxDimension = 960, quality = 0.72): Promise<string> {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => resolve('https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=1000&auto=format&fit=crop&q=80');
      reader.readAsDataURL(file);
      return;
    }

    try {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () => resolve('');
          reader.readAsDataURL(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => resolve('');
        reader.readAsDataURL(file);
      };

      img.src = objectUrl;
    } catch {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    }
  });
}

export function fileToDataUrl(file: File): Promise<string> {
  return fileToCompressedDataUrl(file);
}
