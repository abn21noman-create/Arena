"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AlarmClock, LockKeyhole, Phone, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotificationStream } from "@/hooks/use-notification-stream";
import { PROTECTED_PREFIXES } from "@/lib/protected-routes";
import {
  getNativeStrictFocusStatus,
  openNativeAllowedApp,
  startNativeStrictFocus,
  stopNativeStrictFocus,
  syncNativeFocusReceipts,
} from "@/lib/strict-focus-client";

interface ActiveFocusSession {
  id: string;
  source: "SELF" | "ADMIN";
  status: "ACTIVE";
  durationMinutes: number;
  startedAt: string;
  endsAt: string;
  nativeEnforcementRequested: boolean;
}

export function FocusEnforcer() {
  const pathname = usePathname();
  const shouldCheck =
    pathname.startsWith("/admin") ||
    PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const [session, setSession] = useState<ActiveFocusSession | null>(null);
  const [remainingMs, setRemainingMs] = useState(0);
  const [emergencyOpen, setEmergencyOpen] = useState(false);
  const [emergencyReason, setEmergencyReason] = useState("");
  const [exitDelay, setExitDelay] = useState(5);
  const nativeActiveRef = useRef(false);
  const nativeSessionRef = useRef<string | null>(null);
  const completingRef = useRef(false);

  const stopSessionLocally = useCallback(async (sessionId: string, reason: string) => {
    if (nativeSessionRef.current === sessionId) {
      await stopNativeStrictFocus(sessionId, reason);
      nativeSessionRef.current = null;
      nativeActiveRef.current = false;
    }
  }, []);

  const refresh = useCallback(async () => {
    if (!shouldCheck) return;
    try {
      const response = await fetch("/api/focus/session", { cache: "no-store" });
      if (!response.ok) return;
      const data = await response.json();
      const next = (data.activeSession ?? null) as ActiveFocusSession | null;
      setSession((previous) => {
        if (previous && !next) void stopSessionLocally(previous.id, "server-ended");
        return next;
      });
    } catch {
      // Offline: an already active local timer continues from its stored end time.
    }
  }, [shouldCheck, stopSessionLocally]);

  const handleFocusNotification = useCallback(
    (notification: { link: string | null }) => {
      if (notification.link === "/focus") void refresh();
    },
    [refresh]
  );

  useNotificationStream({
    enabled: shouldCheck,
    onNotification: handleFocusNotification,
    showToasts: false,
  });

  useEffect(() => {
    if (!shouldCheck) return;
    void refresh();
    void syncNativeFocusReceipts();
    const poll = window.setInterval(() => void refresh(), 10_000);
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        void refresh();
        void syncNativeFocusReceipts();
      }
    };
    const onSessionChanged = () => void refresh();
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus-session-changed", onSessionChanged);
    return () => {
      window.clearInterval(poll);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus-session-changed", onSessionChanged);
    };
  }, [refresh, shouldCheck]);

  const activeSessionId = session?.id ?? null;
  const activeEndsAt = session?.endsAt ?? null;
  const activeNativeRequested = session?.nativeEnforcementRequested ?? false;

  useEffect(() => {
    if (!activeSessionId || !activeEndsAt) return;
    document.body.style.overflow = "hidden";
    setEmergencyOpen(false);
    setEmergencyReason("");
    setExitDelay(5);

    if (nativeSessionRef.current !== activeSessionId) {
      void (async () => {
        const status = await getNativeStrictFocusStatus();
        if (activeNativeRequested && status.accessibilityEnabled) {
          nativeActiveRef.current = await startNativeStrictFocus({
            sessionId: activeSessionId,
            endsAt: activeEndsAt,
          });
          if (nativeActiveRef.current) nativeSessionRef.current = activeSessionId;
        }
      })();
    }

    const beforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("beforeunload", beforeUnload);
    };
  }, [activeSessionId, activeEndsAt, activeNativeRequested]);

  useEffect(() => {
    if (!session) return;
    const update = () => {
      const remaining = Math.max(0, new Date(session.endsAt).getTime() - Date.now());
      setRemainingMs(remaining);
      if (remaining === 0 && !completingRef.current) {
        completingRef.current = true;
        void fetch(`/api/focus/session/${session.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "COMPLETE" }),
        })
          .then(async (response) => {
            if (response.ok) {
              await stopSessionLocally(session.id, "timer-complete");
              setSession(null);
            } else {
              await refresh();
            }
          })
          .catch(() => {
            // Offline: keep the local/native enforcement until server confirms.
          })
          .finally(() => {
            completingRef.current = false;
          });
      }
    };
    update();
    const tick = window.setInterval(update, 1_000);
    const heartbeat = window.setInterval(() => {
      void fetch(`/api/focus/session/${session.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "HEARTBEAT",
          nativeEnforcementActive: nativeActiveRef.current,
        }),
      });
    }, 25_000);
    return () => {
      window.clearInterval(tick);
      window.clearInterval(heartbeat);
    };
  }, [refresh, session, stopSessionLocally]);

  useEffect(() => {
    if (!emergencyOpen) return;
    setExitDelay(5);
    const timer = window.setInterval(() => {
      setExitDelay((value) => {
        if (value <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return value - 1;
      });
    }, 1_000);
    return () => window.clearInterval(timer);
  }, [emergencyOpen]);

  async function emergencyExit() {
    if (!session || exitDelay > 0 || emergencyReason.trim().length < 3) return;
    const response = await fetch(`/api/focus/session/${session.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "EMERGENCY_EXIT", reason: emergencyReason }),
    });
    if (!response.ok) return;
    await stopSessionLocally(session.id, "emergency-exit");
    setSession(null);
  }

  if (!session) return null;

  const totalSeconds = Math.ceil(remainingMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const timerText = hours > 0
    ? `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
    : `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Strict Focus চলছে"
      className="fixed inset-0 z-[9999] overflow-y-auto bg-[#07070c] text-white"
    >
      <div className="mx-auto flex min-h-full max-w-2xl flex-col items-center justify-center px-5 py-10 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-violet-500/15 ring-1 ring-violet-400/30">
          <LockKeyhole className="h-10 w-10 text-violet-300" />
        </div>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-violet-300">
          {session.source === "ADMIN" ? "Admin Focus Contract" : "Self Deep Focus"}
        </p>
        <h1 className="text-3xl font-black sm:text-5xl">Strict Focus চলছে</h1>
        <p className="mt-3 max-w-lg text-sm text-muted-foreground">
          HSC Ultimate-এ পড়াশোনা চালিয়ে যাও। Android enforcement active থাকলে Phone/Emergency ও Clock/Alarm ছাড়া অন্য app খুলবে না।
        </p>

        <div className="my-10 font-mono text-6xl font-black tabular-nums tracking-tight sm:text-8xl">
          {timerText}
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <Button variant="outline" onClick={() => void openNativeAllowedApp("PHONE")}>
            <Phone className="mr-2 h-4 w-4" /> Phone / Emergency
          </Button>
          <Button variant="outline" onClick={() => void openNativeAllowedApp("CLOCK")}>
            <AlarmClock className="mr-2 h-4 w-4" /> Clock / Alarm
          </Button>
        </div>

        {!emergencyOpen ? (
          <button
            type="button"
            onClick={() => setEmergencyOpen(true)}
            className="mt-12 text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            জরুরি প্রয়োজনে session থেকে বের হও
          </button>
        ) : (
          <div className="mt-10 w-full max-w-md rounded-2xl border border-red-500/30 bg-red-500/5 p-4 text-left">
            <div className="mb-2 flex items-center gap-2 font-semibold text-red-300">
              <ShieldAlert className="h-4 w-4" /> Emergency exit
            </div>
            <p className="mb-3 text-xs text-muted-foreground">
              এটি audit log-এ সংরক্ষিত হবে। নিরাপত্তার জন্য exit সবসময় সম্ভব।
            </p>
            <textarea
              value={emergencyReason}
              onChange={(event) => setEmergencyReason(event.target.value)}
              maxLength={500}
              placeholder="কেন এখন বের হওয়া জরুরি?"
              className="min-h-20 w-full rounded-xl border border-white/10 bg-black/30 p-3 text-sm outline-none focus:border-red-400"
            />
            <div className="mt-3 flex gap-2">
              <Button
                variant="destructive"
                disabled={exitDelay > 0 || emergencyReason.trim().length < 3}
                onClick={emergencyExit}
              >
                {exitDelay > 0 ? `${exitDelay} সেকেন্ড অপেক্ষা করুন` : "Emergency exit নিশ্চিত করুন"}
              </Button>
              <Button variant="ghost" onClick={() => setEmergencyOpen(false)}>ফিরে যাও</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
