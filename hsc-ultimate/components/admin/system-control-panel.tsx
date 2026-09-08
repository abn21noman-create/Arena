"use client";

// ===================================================================
// Admin: System Control Panel — Maintenance Mode, Announcement
// Banner, Feature Flags
// -------------------------------------------------------------------
// Admin Panel Power-up ফিচার — কোনো নতুন ডিপ্লয় ছাড়াই সিস্টেম-লেভেলে
// দ্রুত সিদ্ধান্ত নেওয়ার টুল (যেমন কোনো মডিউলে বাগ পাওয়া গেলে সাথে
// সাথে বন্ধ করে দেওয়া, বা সবাইকে একটা জরুরি ঘোষণা দেখানো)।
// ===================================================================
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Settings2, Wrench, Megaphone, ToggleLeft, Loader2 } from "lucide-react";

const TOGGLEABLE_MODULES: { key: string; label: string }[] = [
  { key: "ai-tutor", label: "AI Doubt Solver" },
  { key: "forum", label: "Community/Forum" },
  { key: "study-group", label: "Study Group" },
  { key: "reading-room", label: "Reading Room" },
  { key: "duel", label: "Quiz Duel" },
  { key: "quiz-battle", label: "Quiz Battle" },
  { key: "pdf-chat", label: "PDF Chat" },
  { key: "live-exam", label: "Live Exam" },
  { key: "focus", label: "Strict Focus" },
];

interface SystemSettingsData {
  maintenanceMode: boolean;
  maintenanceMessage: string | null;
  announcementEnabled: boolean;
  announcementText: string | null;
  featureFlags: Record<string, boolean>;
  updatedAt: string;
  updatedBy: string | null;
}

export function SystemControlPanel() {
  const [settings, setSettings] = useState<SystemSettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState("");
  const [announcementEnabled, setAnnouncementEnabled] = useState(false);
  const [announcementText, setAnnouncementText] = useState("");
  const [featureFlags, setFeatureFlags] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/system-settings");
        const data = await res.json();
        if (res.ok) {
          const s: SystemSettingsData = data.settings;
          setSettings(s);
          setMaintenanceMode(s.maintenanceMode);
          setMaintenanceMessage(s.maintenanceMessage ?? "");
          setAnnouncementEnabled(s.announcementEnabled);
          setAnnouncementText(s.announcementText ?? "");
          setFeatureFlags(s.featureFlags ?? {});
        }
      } catch {
        toast.error("সেটিংস লোড করা যায়নি");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  async function saveSettings(payload: Record<string, unknown>) {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/system-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "সেভ করা যায়নি");
        return;
      }
      setSettings(data.settings);
      toast.success("সেভ হয়েছে!");
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setSaving(false);
    }
  }

  function toggleFeatureFlag(key: string, enabled: boolean) {
    const updated = { ...featureFlags, [key]: enabled };
    setFeatureFlags(updated);
    void saveSettings({ featureFlags: updated });
  }

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2 mb-1">
          <Settings2 className="h-6 w-6 text-primary" />
          System Control
        </h1>
        <p className="text-sm text-muted-foreground">
          কোনো কোড ডিপ্লয় ছাড়াই পুরো প্ল্যাটফর্মের behavior নিয়ন্ত্রণ করো
        </p>
        {settings?.updatedAt && (
          <p className="text-xs text-muted-foreground mt-1">
            সর্বশেষ আপডেট: {new Date(settings.updatedAt).toLocaleString("bn-BD")}
          </p>
        )}
      </div>

      {/* Maintenance Mode */}
      <Card className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Wrench className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold">Maintenance Mode</h2>
          </div>
          <Switch checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          চালু করলে সব ছাত্রের জন্য (Admin বাদে) পুরো অ্যাপ একটা
          &quot;রক্ষণাবেক্ষণ চলছে&quot; পেজে redirect হয়ে যাবে। বড় কোনো
          পরিবর্তনের সময় সাময়িকভাবে ব্যবহার করো।
        </p>
        <div className="space-y-1.5 mb-3">
          <Label htmlFor="maintenance-message">বার্তা (ঐচ্ছিক)</Label>
          <Textarea
            id="maintenance-message"
            placeholder="যেমন: আমরা নতুন ফিচার যোগ করছি, ৩০ মিনিটের মধ্যে ফিরে আসবো!"
            value={maintenanceMessage}
            onChange={(e) => setMaintenanceMessage(e.target.value)}
            rows={2}
          />
        </div>
        <Button
          size="sm"
          onClick={() =>
            void saveSettings({ maintenanceMode, maintenanceMessage: maintenanceMessage.trim() || null })
          }
          disabled={saving}
        >
          {saving && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
          সেভ করো
        </Button>
      </Card>

      {/* Announcement Banner */}
      <Card className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Megaphone className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold">Announcement Banner</h2>
          </div>
          <Switch checked={announcementEnabled} onCheckedChange={setAnnouncementEnabled} />
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          চালু করলে সব লগইন করা ইউজারের Dashboard এর উপরে এই ঘোষণা
          দেখাবে (ইউজার চাইলে বন্ধ করে দিতে পারবে)।
        </p>
        <div className="space-y-1.5 mb-3">
          <Label htmlFor="announcement-text">ঘোষণার টেক্সট</Label>
          <Textarea
            id="announcement-text"
            placeholder="যেমন: 🎉 নতুন মিস্টেক ভল্ট ফিচার এসেছে! এখনই ট্রাই করো।"
            value={announcementText}
            onChange={(e) => setAnnouncementText(e.target.value)}
            rows={2}
          />
        </div>
        <Button
          size="sm"
          onClick={() =>
            void saveSettings({
              announcementEnabled,
              announcementText: announcementText.trim() || null,
            })
          }
          disabled={saving}
        >
          {saving && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
          সেভ করো
        </Button>
      </Card>

      {/* Feature Flags */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-1">
          <ToggleLeft className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">Feature Flags</h2>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          কোনো মডিউলে সমস্যা পেলে দ্রুত বন্ধ করে দাও (কোনো ডিপ্লয়
          লাগবে না) — বন্ধ করা মডিউলে ছাত্ররা ঢুকতে পারবে না, একটা
          &quot;সাময়িকভাবে বন্ধ&quot; বার্তা দেখবে।
        </p>
        <div className="space-y-3">
          {TOGGLEABLE_MODULES.map((mod) => {
            const isEnabled = featureFlags[mod.key] !== false;
            return (
              <div key={mod.key} className="flex items-center justify-between">
                <span className="text-sm">{mod.label}</span>
                <Switch
                  checked={isEnabled}
                  onCheckedChange={(checked) => toggleFeatureFlag(mod.key, checked)}
                  disabled={saving}
                />
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
