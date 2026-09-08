/**
 * Offline Practice Storage & Cache Manager.
 * 
 * Allows students in low-connectivity areas to save question sets locally,
 * practice offline without internet, and sync submission attempts when online.
 */

export interface CachedQuestion {
  id: string;
  text: string;
  options: string[];
  difficulty: string;
  boardName?: string | null;
  boardYear?: number | null;
}

export interface CachedChapterSet {
  chapterId: string;
  chapterName: string;
  subjectId: string;
  subjectName: string;
  cachedAt: number;
  questions: CachedQuestion[];
}

const OFFLINE_PRACTICE_KEY = "hsc_offline_practice_sets";

export function getCachedPracticeSets(): Record<string, CachedChapterSet> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(OFFLINE_PRACTICE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function savePracticeSetOffline(set: CachedChapterSet): boolean {
  if (typeof window === "undefined") return false;
  try {
    const existing = getCachedPracticeSets();
    existing[set.chapterId] = set;
    localStorage.setItem(OFFLINE_PRACTICE_KEY, JSON.stringify(existing));
    return true;
  } catch {
    return false;
  }
}

export function removeOfflinePracticeSet(chapterId: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const existing = getCachedPracticeSets();
    delete existing[chapterId];
    localStorage.setItem(OFFLINE_PRACTICE_KEY, JSON.stringify(existing));
    return true;
  } catch {
    return false;
  }
}

export function getOfflinePracticeSet(chapterId: string): CachedChapterSet | null {
  const all = getCachedPracticeSets();
  return all[chapterId] || null;
}
