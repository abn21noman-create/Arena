"use client";

import { useCallback, useEffect, useState } from "react";
import {
  RadioTower,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  TriangleAlert,
  WifiOff,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface NativeDiagnosticsData {
  runtime: {
    status: "unconfigured" | "partial" | "ready" | "degraded";
    configured: boolean;
    initialized: boolean;
    lastSuccessAt: string | null;
    lastFailureAt: string | null;
    lastErrorCode: string | null;
  };
  summary: { total: number; capable: number; disabled: number; stale: number };
  devices: Array<{
    id: string;
    tokenFingerprint: string;
    platform: string;
    appVersion: string | null;
    deviceModel: string | null;
    remoteFocusCapable: boolean;
    accessibilityEnabled: boolean;
    lastSeenAt: string;
    lastPushSuccessAt: string | null;
    lastPushFailureAt: string | null;
    lastPushErrorCode: string | null;
    lastReceiptAt: string | null;
    lastReceiptStatus: string | null;
    disabledAt: string | null;
    disabledReason: string | null;
    user: { id: string; name: string; email: string };
    latestDelivery: {
      commandId: string;
      type: string;
      status: string;
      issuedAt: string;
      sentAt: string | null;
      receiptAt: string | null;
      errorCode: string | null;
    } | null;
  }>;
}

function runtimeClasses(status: NativeDiagnosticsData["runtime"]["status"]) {
  if (status === "ready") return "border-emerald-500/30 bg-emerald-500/10 text-emerald-500";
  if (status === "unconfigured") return "border-amber-500/30 bg-amber-500/10 text-amber-500";
  return "border-rose-500/30 bg-rose-500/10 text-rose-500";
}

export function NativeDeliveryDiagnostics() {
  const [data, setData] = useState<NativeDiagnosticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/focus/native-devices", { cache: "no-store" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Native diagnostics লোড হয়নি");
      setData(body);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Native diagnostics লোড হয়নি");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), 30_000);
    return () => window.clearInterval(timer);
  }, [load]);

  return (
    <Card className="overflow-hidden border-cyan-500/20">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b bg-gradient-to-r from-cyan-500/10 via-violet-500/5 to-transparent p-5">
        <div>
          <h2 className="flex items-center gap-2 font-bold">
            <RadioTower className="h-5 w-5 text-cyan-500" /> Native Delivery Diagnostics
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            FCM readiness, Android capability, delivery ও native receipt audit
          </p>
        </div>
        <div className="flex items-center gap-2">
          {data && (
            <Badge variant="outline" className={runtimeClasses(data.runtime.status)}>
              {data.runtime.status}
            </Badge>
          )}
          <Button
            size="icon"
            variant="ghost"
            aria-label="Native diagnostics refresh"
            onClick={() => void load()}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      <div className="space-y-4 p-5">
        {loading && !data ? (
          <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Diagnostics sync হচ্ছে…
          </div>
        ) : data ? (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ["Registered", data.summary.total],
                ["Ready", data.summary.capable],
                ["Disabled", data.summary.disabled],
                ["Stale", data.summary.stale],
              ].map(([label, value]) => (
                <div key={String(label)} className="rounded-xl border bg-card/50 p-3">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
                  <p className="mt-1 text-xl font-bold">{value}</p>
                </div>
              ))}
            </div>

            {data.runtime.status !== "ready" && (
              <div className="flex gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
                {data.runtime.status === "unconfigured" ? (
                  <WifiOff className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                ) : (
                  <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                )}
                <div>
                  <p className="text-sm font-medium">
                    {data.runtime.status === "unconfigured"
                      ? "Closed-app FCM এখনো configure করা হয়নি"
                      : "Firebase configuration/delivery attention দরকার"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    App-open polling ও web overlay চলবে। Firebase credential এবং google-services.json যোগ হলে closed-app delivery সক্রিয় হবে।
                  </p>
                </div>
              </div>
            )}

            <div className="max-h-80 space-y-2 overflow-y-auto">
              {data.devices.length === 0 ? (
                <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                  কোনো Android device এখনো register করেনি।
                </p>
              ) : data.devices.map((device) => {
                const ready = device.remoteFocusCapable && device.accessibilityEnabled && !device.disabledAt;
                return (
                  <div key={device.id} className="rounded-xl border p-3.5">
                    <div className="flex items-start gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-500">
                        <Smartphone className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="truncate text-sm font-semibold">{device.user.name}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              {device.deviceModel || "Android device"} · app {device.appVersion || "?"} · #{device.tokenFingerprint}
                            </p>
                          </div>
                          <Badge variant={ready ? "default" : "outline"}>
                            {ready ? <ShieldCheck className="mr-1 h-3 w-3" /> : null}
                            {device.disabledAt ? "Disabled" : ready ? "Remote ready" : "Permission incomplete"}
                          </Badge>
                        </div>
                        <div className="mt-2 grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
                          <p>Seen: {new Date(device.lastSeenAt).toLocaleString("bn-BD")}</p>
                          <p>Receipt: {device.lastReceiptStatus || "none"}</p>
                          <p>Delivery: {device.latestDelivery?.status || "none"}</p>
                          <p>Error: {device.lastPushErrorCode || device.disabledReason || "none"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <p className="py-6 text-center text-sm text-muted-foreground">Diagnostics unavailable.</p>
        )}
      </div>
    </Card>
  );
}
