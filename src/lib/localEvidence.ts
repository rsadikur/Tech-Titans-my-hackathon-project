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

export function getLocalEvidence(): LocalEvidenceRecord[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_EVIDENCE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveLocalEvidence(records: LocalEvidenceRecord[]) {
  localStorage.setItem(LOCAL_EVIDENCE_KEY, JSON.stringify(records));
  window.dispatchEvent(new Event(LOCAL_EVIDENCE_EVENT));
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
