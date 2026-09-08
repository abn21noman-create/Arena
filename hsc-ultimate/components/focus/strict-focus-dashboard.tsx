"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { BarChart3, Clock3, LockKeyhole, ShieldCheck, Smartphone, UnlockKeyhole } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { FocusSchedulesCard } from "@/components/focus/focus-schedules-card";
import { pushNotifications } from "@/lib/capacitor";
import { VALID_SUBJECT_CODES } from "@/lib/enum-validation";
import { FOCUS_CONSENT_VERSION, hasCurrentFocusConsent } from "@/lib/focus-constants";
import { SUBJECT_NAMES } from "@/lib/study-plan-ui-constants";
import {
  getNativeStrictFocusStatus,
  isNativeStrictFocusAvailable,
  openNativeAccessibilitySettings,
  setNativeRemoteFocusConsent,
} from "@/lib/strict-focus-client";

interface FocusContract {
  allowAdminStart: boolean;
  maxAdminDurationMinutes: number;
  nativeEnforcementEnabled: boolean;
  shareAnalyticsWithAdmin: boolean;
  consentVersion: string;
  consentedAt: string | null;
  revokedAt: string | null;
}

interface FocusSession {
  id: string;
  source: "SELF" | "ADMIN";
  status: "ACTIVE" | "COMPLETED" | "CANCELLED" | "EMERGENCY_EXIT";
  durationMinutes: number;
  subjectCode: string | null;
  focusLabel: string | null;
  startedAt: string;
  endsAt: string;
  nativeEnforcementActive: boolean;
}

interface FocusState {
  contract: FocusContract | null;
  activeSession: FocusSession | null;
  recentSessions: FocusSession[];
}

const PRESETS = [20, 25, 30, 45, 60, 90, 120];

export function StrictFocusDashboard() {
  const [state, setState] = useState<FocusState | null>(null);
  const [duration, setDuration] = useState(25);
  const [subjectCode, setSubjectCode] = useState<string>("");
  const [focusLabel, setFocusLabel] = useState("");
  const [allowAdmin, setAllowAdmin] = useState(false);
  const [maxAdminDuration, setMaxAdminDuration] = useState(120);
  const [shareAnalytics, setShareAnalytics] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [nativeAvailable, setNativeAvailable] = useState(false);
  const [accessibilityEnabled, setAccessibilityEnabled] = useState(false);
  const [accessibilityDisclosureAccepted, setAccessibilityDisclosureAccepted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [starting, setStarting] = useState(false);

  const loadState = useCallback(async () => {
    const response = await fetch("/api/focus/session", { cache: "no-store" });
    if (!response.ok) return;
    const data = (await response.json()) as FocusState;
    setState(data);
    setAllowAdmin(data.contract?.allowAdminStart ?? false);
    setMaxAdminDuration(data.contract?.maxAdminDurationMinutes ?? 120);
    setShareAnalytics(data.contract?.shareAnalyticsWithAdmin ?? false);
  }, []);

  const refreshNativeStatus = useCallback(async () => {
    const status = await getNativeStrictFocusStatus();
    setNativeAvailable(status.available);
    setAccessibilityEnabled(status.accessibilityEnabled);
  }, []);

  useEffect(() => {
    void loadState();
    void refreshNativeStatus();
    const timer = window.setInterval(() => void loadState(), 10_000);
    return () => window.clearInterval(timer);
  }, [loadState, refreshNativeStatus]);

  async function updateRegisteredDevice(remoteEnabled: boolean) {
    if (!isNativeStrictFocusAvailable()) return;
    const registration = await pushNotifications.register();
    const token = registration?.token || localStorage.getItem("hsc-native-push-token");
    const nativeStatus = await getNativeStrictFocusStatus();
    if (!token) return;
    await fetch("/api/native-devices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        platform: "android",
        remoteFocusCapable: remoteEnabled,
        accessibilityEnabled: nativeStatus.accessibilityEnabled,
      }),
    });
  }

  async function saveContract() {
    const currentRemoteConsent = hasCurrentFocusConsent(state?.contract);
    if (allowAdmin && !consentChecked && !currentRemoteConsent) {
      toast.error("Current consent disclosure-এর checkbox-এ টিক দিন");
      return;
    }
    setSaving(true);
    try {
      const nativeEnabled = nativeAvailable && accessibilityEnabled;
      const response = await fetch("/api/focus/contract", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          allowAdminStart: allowAdmin,
          maxAdminDurationMinutes: maxAdminDuration,
          nativeEnforcementEnabled: nativeEnabled,
          shareAnalyticsWithAdmin: shareAnalytics,
          confirmed: allowAdmin
            ? consentChecked || hasCurrentFocusConsent(state?.contract)
            : true,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Contract save করা যায়নি");
      await setNativeRemoteFocusConsent(allowAdmin);
      await updateRegisteredDevice(allowAdmin && nativeEnabled);
      toast.success(allowAdmin ? "Remote Strict Focus অনুমতি চালু হয়েছে" : "Remote অনুমতি বন্ধ হয়েছে");
      setConsentChecked(false);
      await loadState();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "সমস্যা হয়েছে");
    } finally {
      setSaving(false);
    }
  }

  async function startSelfFocus() {
    setStarting(true);
    try {
      const response = await fetch("/api/focus/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          durationMinutes: duration,
          subjectCode: subjectCode || null,
          focusLabel: focusLabel.trim() || null,
          nativeEnforcementRequested: nativeAvailable && accessibilityEnabled,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Focus শুরু করা যায়নি");
      toast.success(`${duration} মিনিটের Strict Focus শুরু হয়েছে`);
      window.dispatchEvent(new Event("focus-session-changed"));
      await loadState();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "সমস্যা হয়েছে");
    } finally {
      setStarting(false);
    }
  }

  const active = state?.activeSession;

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden border-violet-500/30 p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-xl">
            <div className="mb-2 flex items-center gap-2">
              <LockKeyhole className="h-5 w-5 text-violet-500" />
              <h2 className="text-xl font-bold">নিজের Strict Focus</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              ২০ মিনিট থেকে ২ ঘণ্টা। Timer চলাকালে pause/reset থাকবে না। Android permission চালু থাকলে অনুমোদিত app ছাড়া বাকি app block হবে।
            </p>
          </div>
          {active && <Badge className="w-fit">এখন {active.durationMinutes} মিনিটের session চলছে</Badge>}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {PRESETS.map((minutes) => (
            <Button
              key={minutes}
              type="button"
              size="sm"
              variant={duration === minutes ? "default" : "outline"}
              onClick={() => setDuration(minutes)}
              disabled={!!active}
            >
              {minutes < 60 ? `${minutes} মিনিট` : `${minutes / 60} ঘণ্টা`}
            </Button>
          ))}
        </div>
        <div className="mt-4 grid max-w-sm gap-2">
          <Label htmlFor="focus-duration">Custom duration: {duration} মিনিট</Label>
          <Input
            id="focus-duration"
            type="range"
            min={20}
            max={120}
            step={5}
            value={duration}
            onChange={(event) => setDuration(Number(event.target.value))}
            disabled={!!active}
          />
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="focus-subject">Subject (analytics-এর জন্য)</Label>
            <select
              id="focus-subject"
              value={subjectCode}
              disabled={!!active}
              onChange={(event) => setSubjectCode(event.target.value)}
              className="h-9 rounded-lg border bg-background px-3 text-sm"
            >
              <option value="">General focus</option>
              {VALID_SUBJECT_CODES.map((code) => (
                <option key={code} value={code}>{SUBJECT_NAMES[code] ?? code}</option>
              ))}
            </select>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="focus-label">Session label (optional)</Label>
            <Input
              id="focus-label"
              value={focusLabel}
              disabled={!!active}
              maxLength={120}
              onChange={(event) => setFocusLabel(event.target.value)}
              placeholder="যেমন: Vector revision"
            />
          </div>
        </div>
        <Button className="mt-5 gap-2" onClick={startSelfFocus} disabled={starting || !!active}>
          <Clock3 className="h-4 w-4" />
          {starting ? "শুরু হচ্ছে…" : "Strict Focus শুরু করো"}
        </Button>
      </Card>

      <Card className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-cyan-500" />
              <h2 className="font-bold">Android enforcement</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              HSC Ultimate, Phone/Emergency এবং Clock/Alarm allowlisted থাকবে। Screen content server-এ পাঠানো হবে না।
            </p>
          </div>
          <Badge variant={accessibilityEnabled ? "default" : "outline"}>
            {!nativeAvailable ? "Web/PWA" : accessibilityEnabled ? "Permission active" : "Permission needed"}
          </Badge>
        </div>
        {nativeAvailable && !accessibilityEnabled && (
          <div className="mt-4 rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-4">
            <p className="text-sm font-semibold">Accessibility permission disclosure</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-muted-foreground">
              <li>Strict Focus শুধু বর্তমানে সামনে খোলা app-এর package name শনাক্ত করবে।</li>
              <li>Screen text, message, password, image বা browsing content পড়বে/পাঠাবে না।</li>
              <li>Service শুধু active focus timer চলাকালে block enforce করবে।</li>
              <li>Phone, emergency dialer, keyboard এবং Clock/Alarm allowlisted থাকবে।</li>
            </ul>
            <Link
              href="/privacy#strict-focus"
              className="mt-2 inline-flex text-xs font-medium text-primary hover:underline"
            >
              সম্পূর্ণ Accessibility ও data-use disclosure পড়ো
            </Link>
            <label className="mt-3 flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                className="mt-1"
                checked={accessibilityDisclosureAccepted}
                onChange={(event) => setAccessibilityDisclosureAccepted(event.target.checked)}
              />
              <span>আমি উপরের তথ্য বুঝেছি এবং Strict Focus-এর জন্য Accessibility Settings খুলতে সম্মত।</span>
            </label>
            <Button
              className="mt-3"
              variant="outline"
              disabled={!accessibilityDisclosureAccepted}
              onClick={async () => {
                await openNativeAccessibilitySettings();
                window.setTimeout(() => void refreshNativeStatus(), 1500);
              }}
            >
              Accessibility Settings খোলো
            </Button>
          </div>
        )}
        {!nativeAvailable && (
          <p className="mt-3 text-xs text-amber-600 dark:text-amber-400">
            Browser/PWA timer app-এর ভেতর enforce হবে; অন্য Android app block করতে native APK দরকার।
          </p>
        )}
      </Card>

      <Card className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
              <h2 className="font-bold">Focus Contract</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              চালু করলে Admin আপনার নির্ধারিত সীমার মধ্যে Accept ছাড়াই session শুরু করতে পারবেন। যেকোনো সময় contract বন্ধ করা যাবে; active session-এর জন্য emergency exit থাকবে।
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Disclosure v{FOCUS_CONSENT_VERSION} · {hasCurrentFocusConsent(state?.contract) ? "current consent" : "নতুন/updated consent প্রয়োজন"}
            </p>
          </div>
          <Switch checked={allowAdmin} onCheckedChange={setAllowAdmin} />
        </div>

        <div className="mt-4 grid max-w-sm gap-2">
          <Label htmlFor="admin-duration">Admin-এর সর্বোচ্চ সময়</Label>
          <select
            id="admin-duration"
            value={maxAdminDuration}
            onChange={(event) => setMaxAdminDuration(Number(event.target.value))}
            className="h-9 rounded-lg border bg-background px-3 text-sm"
          >
            {PRESETS.map((minutes) => (
              <option key={minutes} value={minutes}>{minutes} মিনিট</option>
            ))}
          </select>
        </div>

        <div className="mt-4 flex items-start justify-between gap-4 rounded-xl border border-violet-500/20 bg-violet-500/5 p-3.5">
          <div>
            <p className="text-sm font-semibold">Admin-এর সঙ্গে historical analytics share</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Off থাকলে Admin active session safely stop করতে পারবেন, কিন্তু আপনার পুরোনো focus time, streak ও subject breakdown দেখতে পারবেন না।
            </p>
          </div>
          <Switch checked={shareAnalytics} onCheckedChange={setShareAnalytics} />
        </div>

        {allowAdmin && !hasCurrentFocusConsent(state?.contract) && (
          <label className="mt-4 flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-sm">
            <input
              type="checkbox"
              className="mt-1"
              checked={consentChecked}
              onChange={(event) => setConsentChecked(event.target.checked)}
            />
            <span>
              আমি Focus disclosure v{FOCUS_CONSENT_VERSION} বুঝেছি: permission চালু থাকলে Admin আমার বেছে দেওয়া সময়সীমার মধ্যে real-time Strict Focus শুরু করতে পারবেন। Phone/Emergency/Alarm ও emergency exit সবসময় থাকবে।
            </span>
          </label>
        )}

        <Button className="mt-4" onClick={saveContract} disabled={saving}>
          {saving ? "Save হচ্ছে…" : "Focus Contract সংরক্ষণ করো"}
        </Button>
      </Card>

      <FocusSchedulesCard />

      <Card className="p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <UnlockKeyhole className="h-5 w-5 text-muted-foreground" />
            <h2 className="font-bold">সাম্প্রতিক session</h2>
          </div>
          <Button render={<Link href="/focus/analytics" />} size="sm" variant="outline">
            <BarChart3 className="mr-1.5 h-3.5 w-3.5" /> Analytics
          </Button>
        </div>
        {!state || state.recentSessions.length === 0 ? (
          <p className="text-sm text-muted-foreground">এখনো কোনো Strict Focus session নেই।</p>
        ) : (
          <div className="space-y-2">
            {state.recentSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between gap-3 rounded-lg border p-3 text-sm">
                <div>
                  <p className="font-medium">
                    {session.durationMinutes} মিনিট · {session.source === "ADMIN" ? "Admin" : "নিজে"}
                    {session.subjectCode ? ` · ${SUBJECT_NAMES[session.subjectCode] ?? session.subjectCode}` : ""}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {session.focusLabel ? `${session.focusLabel} · ` : ""}{new Date(session.startedAt).toLocaleString("bn-BD")}
                  </p>
                </div>
                <Badge variant="outline">{session.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
