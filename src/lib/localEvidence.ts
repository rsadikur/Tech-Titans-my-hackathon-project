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
  status: 'pending' | 'approved' | 'rejected' | 'important' | 'resolved';
  likes?: number;
  dislikes?: number;
  resolvedBy?: string;
  resolutionReview?: string;
  resolutionEvidence?: string;
  resolvedAt?: number;
  resolutionNotes?: string;
}

export const LOCAL_EVIDENCE_KEY = 'submitted_evidence';
export const LOCAL_EVIDENCE_EVENT = 'local-evidence-updated';

export const DEFAULT_EVIDENCE: LocalEvidenceRecord[] = [];

export function getLocalEvidence(): LocalEvidenceRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_EVIDENCE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLocalEvidence(records: LocalEvidenceRecord[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_EVIDENCE_KEY, JSON.stringify(records));
  } catch (e) {
    try {
      const trimmed = records.slice(0, 25);
      localStorage.setItem(LOCAL_EVIDENCE_KEY, JSON.stringify(trimmed));
    } catch {
      try {
        const fallback = records.slice(0, 15).map((r) => ({
          ...r,
          url: r.url.length > 2000 ? 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=1000&auto=format&fit=crop&q=80' : r.url,
          resolutionEvidence: r.resolutionEvidence && r.resolutionEvidence.length > 2000 ? 'https://images.unsplash.com/photo-1578874691223-a49626e8517e?w=1000&auto=format&fit=crop&q=80' : r.resolutionEvidence,
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
