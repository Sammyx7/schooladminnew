export type SchoolSettings = {
  schoolName: string;
  // Legacy numeric range + shared sections
  classMin?: number;
  classMax?: number;
  sections?: string[];
  // New flexible structure
  classes?: string[]; // Ordered list of class names (e.g., ["Nursery","LKG","UKG","Class 1",...])
  classSections?: Record<string, string[]>; // Per-class sections
  // Subjects catalog used across app
  subjects?: string[];
  // Optional per-class subject overrides
  classSubjects?: Record<string, string[]>;
  address?: string;
  phone?: string;
  email?: string;
  logoUrl?: string;
  updatedAt?: string;
};

function getBaseUrl(): string {
  // Client: use relative URLs
  if (typeof window !== 'undefined') return '';
  // Server: prefer explicit app URL envs
  const envUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || process.env.VERCEL_URL;
  if (envUrl) {
    return envUrl.startsWith('http') ? envUrl : `https://${envUrl}`;
  }
  const port = process.env.PORT || '3000';
  return `http://localhost:${port}`;
}

/**
 * Return subjects for a given class from settings.
 * Falls back to per-app global subjects, then to a sensible default list.
 */
export function subjectsForClass(settings: SchoolSettings | null | undefined, className?: string): string[] {
  const defaultSubjects = ['english','hindi','urdu','sanskrit','arabic','maths','science','social science','general knowledge'];
  if (!settings) return defaultSubjects;
  const global = Array.isArray(settings.subjects) && settings.subjects.length > 0 ? settings.subjects : defaultSubjects;
  if (!className) return global;
  const perClass = settings.classSubjects || {};
  const list = perClass[className];
  if (Array.isArray(list) && list.length > 0) return list;
  return global;
}

export async function getSchoolSettings(): Promise<SchoolSettings | null> {
  const res = await fetch(`${getBaseUrl()}/api/settings/get`, { method: 'GET', cache: 'no-store' });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(payload.error || `Get settings failed with status ${res.status}`);
  }
  return payload as SchoolSettings;
}

export async function updateSchoolSettings(settings: SchoolSettings): Promise<SchoolSettings> {
  const res = await fetch(`${getBaseUrl()}/api/settings/update`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(payload.error || `Update settings failed with status ${res.status}`);
  }
  return payload as SchoolSettings;
}
