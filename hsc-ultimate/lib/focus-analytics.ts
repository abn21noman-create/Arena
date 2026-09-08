import type { FocusSessionSource, FocusSessionStatus, SubjectCode } from "@prisma/client";

export const FOCUS_ANALYTICS_TIME_ZONE = "Asia/Dhaka";
export const FOCUS_RANGE_OPTIONS = [7, 30, 90] as const;
export type FocusRangeDays = (typeof FOCUS_RANGE_OPTIONS)[number];

export const FOCUS_SUBJECT_LABELS: Record<string, string> = {
  PHYSICS: "পদার্থবিজ্ঞান",
  CHEMISTRY: "রসায়ন",
  BIOLOGY: "জীববিজ্ঞান",
  HIGHER_MATH: "উচ্চতর গণিত",
  BANGLA: "বাংলা",
  ENGLISH: "English",
  ICT: "ICT",
  GENERAL: "General Focus",
};

export interface FocusAnalyticsSession {
  id: string;
  userId?: string;
  source: FocusSessionSource;
  status: FocusSessionStatus;
  durationMinutes: number;
  subjectCode: SubjectCode | null;
  focusLabel: string | null;
  startedAt: Date;
  endsAt: Date;
  completedAt: Date | null;
  emergencyExitedAt: Date | null;
  cancelledAt: Date | null;
  nativeEnforcementActive?: boolean;
}

export interface FocusAnalyticsSummary {
  rangeDays: number;
  totalMinutes: number;
  scheduledMinutes: number;
  sessionCount: number;
  completedCount: number;
  emergencyExitCount: number;
  cancelledCount: number;
  activeCount: number;
  completionRate: number;
  averageMinutes: number;
  currentStreak: number;
  longestStreak: number;
  sourceBreakdown: { source: FocusSessionSource; minutes: number; count: number }[];
  subjectBreakdown: { code: string; label: string; minutes: number; count: number; percentage: number }[];
  daily: { date: string; minutes: number; sessions: number; completed: number; emergencyExits: number }[];
  recentSessions: {
    id: string;
    source: FocusSessionSource;
    status: FocusSessionStatus;
    durationMinutes: number;
    effectiveMinutes: number;
    subjectCode: string | null;
    subjectLabel: string;
    focusLabel: string | null;
    startedAt: string;
    endsAt: string;
  }[];
}

export function toDhakaDateKey(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: FOCUS_ANALYTICS_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function dateKeyToEpoch(key: string) {
  return Date.parse(`${key}T00:00:00Z`);
}

function addDaysToKey(key: string, days: number) {
  return new Date(dateKeyToEpoch(key) + days * 86_400_000).toISOString().slice(0, 10);
}

export function getEffectiveFocusMinutes(session: FocusAnalyticsSession, now = new Date()): number {
  let effectiveEnd: Date;
  if (session.status === "COMPLETED") {
    effectiveEnd = session.completedAt ?? session.endsAt;
  } else if (session.status === "EMERGENCY_EXIT") {
    effectiveEnd = session.emergencyExitedAt ?? now;
  } else if (session.status === "CANCELLED") {
    effectiveEnd = session.cancelledAt ?? now;
  } else {
    effectiveEnd = now < session.endsAt ? now : session.endsAt;
  }
  const elapsed = Math.max(0, (effectiveEnd.getTime() - session.startedAt.getTime()) / 60_000);
  return Math.max(0, Math.min(session.durationMinutes, Math.round(elapsed)));
}

export function calculateFocusStreak(dayKeys: string[], today = new Date()) {
  const unique = Array.from(new Set(dayKeys)).sort();
  if (unique.length === 0) return { current: 0, longest: 0 };

  let longest = 1;
  let running = 1;
  for (let index = 1; index < unique.length; index += 1) {
    const gap = Math.round((dateKeyToEpoch(unique[index]) - dateKeyToEpoch(unique[index - 1])) / 86_400_000);
    running = gap === 1 ? running + 1 : 1;
    longest = Math.max(longest, running);
  }

  const todayKey = toDhakaDateKey(today);
  const yesterdayKey = addDaysToKey(todayKey, -1);
  const latest = unique[unique.length - 1];
  if (latest !== todayKey && latest !== yesterdayKey) return { current: 0, longest };

  let current = 1;
  for (let index = unique.length - 1; index > 0; index -= 1) {
    const gap = Math.round((dateKeyToEpoch(unique[index]) - dateKeyToEpoch(unique[index - 1])) / 86_400_000);
    if (gap !== 1) break;
    current += 1;
  }
  return { current, longest };
}

export function buildFocusAnalytics(
  sessions: FocusAnalyticsSession[],
  rangeDays: FocusRangeDays,
  now = new Date()
): FocusAnalyticsSummary {
  const todayKey = toDhakaDateKey(now);
  const firstKey = addDaysToKey(todayKey, -(rangeDays - 1));
  const inRange = sessions.filter((session) => toDhakaDateKey(session.startedAt) >= firstKey);
  const effective = inRange.map((session) => ({
    session,
    minutes: getEffectiveFocusMinutes(session, now),
    dayKey: toDhakaDateKey(session.startedAt),
  }));

  const totalMinutes = effective.reduce((sum, item) => sum + item.minutes, 0);
  const scheduledMinutes = inRange.reduce((sum, session) => sum + session.durationMinutes, 0);
  const completedCount = inRange.filter((session) => session.status === "COMPLETED").length;
  const emergencyExitCount = inRange.filter((session) => session.status === "EMERGENCY_EXIT").length;
  const cancelledCount = inRange.filter((session) => session.status === "CANCELLED").length;
  const activeCount = inRange.filter((session) => session.status === "ACTIVE").length;
  const endedCount = completedCount + emergencyExitCount + cancelledCount;
  const completionRate = endedCount > 0 ? Math.round((completedCount / endedCount) * 100) : 0;

  const dailyMap = new Map<string, FocusAnalyticsSummary["daily"][number]>();
  for (let index = 0; index < rangeDays; index += 1) {
    const date = addDaysToKey(firstKey, index);
    dailyMap.set(date, { date, minutes: 0, sessions: 0, completed: 0, emergencyExits: 0 });
  }
  for (const item of effective) {
    const row = dailyMap.get(item.dayKey);
    if (!row) continue;
    row.minutes += item.minutes;
    row.sessions += 1;
    if (item.session.status === "COMPLETED") row.completed += 1;
    if (item.session.status === "EMERGENCY_EXIT") row.emergencyExits += 1;
  }

  const sourceMap = new Map<FocusSessionSource, { minutes: number; count: number }>();
  const subjectMap = new Map<string, { minutes: number; count: number }>();
  for (const item of effective) {
    const source = sourceMap.get(item.session.source) ?? { minutes: 0, count: 0 };
    source.minutes += item.minutes;
    source.count += 1;
    sourceMap.set(item.session.source, source);

    const code = item.session.subjectCode ?? "GENERAL";
    const subject = subjectMap.get(code) ?? { minutes: 0, count: 0 };
    subject.minutes += item.minutes;
    subject.count += 1;
    subjectMap.set(code, subject);
  }

  const activeDayKeys = effective.filter((item) => item.minutes > 0).map((item) => item.dayKey);
  const streak = calculateFocusStreak(activeDayKeys, now);

  return {
    rangeDays,
    totalMinutes,
    scheduledMinutes,
    sessionCount: inRange.length,
    completedCount,
    emergencyExitCount,
    cancelledCount,
    activeCount,
    completionRate,
    averageMinutes: inRange.length > 0 ? Math.round(totalMinutes / inRange.length) : 0,
    currentStreak: streak.current,
    longestStreak: streak.longest,
    sourceBreakdown: Array.from(sourceMap.entries()).map(([source, value]) => ({ source, ...value })),
    subjectBreakdown: Array.from(subjectMap.entries())
      .map(([code, value]) => ({
        code,
        label: FOCUS_SUBJECT_LABELS[code] ?? code,
        minutes: value.minutes,
        count: value.count,
        percentage: totalMinutes > 0 ? Math.round((value.minutes / totalMinutes) * 100) : 0,
      }))
      .sort((a, b) => b.minutes - a.minutes),
    daily: Array.from(dailyMap.values()),
    recentSessions: [...inRange]
      .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())
      .slice(0, 20)
      .map((session) => ({
        id: session.id,
        source: session.source,
        status: session.status,
        durationMinutes: session.durationMinutes,
        effectiveMinutes: getEffectiveFocusMinutes(session, now),
        subjectCode: session.subjectCode,
        subjectLabel: FOCUS_SUBJECT_LABELS[session.subjectCode ?? "GENERAL"] ?? "General Focus",
        focusLabel: session.focusLabel,
        startedAt: session.startedAt.toISOString(),
        endsAt: session.endsAt.toISOString(),
      })),
  };
}

export function parseFocusRange(value: string | null): FocusRangeDays {
  const parsed = Number(value);
  return FOCUS_RANGE_OPTIONS.includes(parsed as FocusRangeDays)
    ? (parsed as FocusRangeDays)
    : 7;
}
