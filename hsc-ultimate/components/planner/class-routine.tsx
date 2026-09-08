"use client";

// ===================================================================
// Class Routine — সাপ্তাহিক ক্লাস/পড়াশোনার রুটিন
// -------------------------------------------------------------------
// প্রতিটা বারে (রবি-শনি) নির্দিষ্ট সময়ে একটা করে স্লট যোগ করা যায়
// (সাবজেক্ট বা কাস্টম লেবেল সহ)। তালিকা আকারে বার-ভিত্তিক দেখানো হয়।
// ===================================================================
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Trash2, Loader2, CalendarClock } from "lucide-react";

const DAYS = [
  { value: 0, label: "রবিবার" },
  { value: 1, label: "সোমবার" },
  { value: 2, label: "মঙ্গলবার" },
  { value: 3, label: "বুধবার" },
  { value: 4, label: "বৃহস্পতিবার" },
  { value: 5, label: "শুক্রবার" },
  { value: 6, label: "শনিবার" },
];

const SUBJECTS = [
  { code: "BANGLA", name: "বাংলা", color: "#ef4444" },
  { code: "ENGLISH", name: "English", color: "#3b82f6" },
  { code: "ICT", name: "ICT", color: "#8b5cf6" },
  { code: "PHYSICS", name: "পদার্থবিজ্ঞান", color: "#f59e0b" },
  { code: "CHEMISTRY", name: "রসায়ন", color: "#8b5cf6" },
  { code: "BIOLOGY", name: "জীববিজ্ঞান", color: "#14b8a6" },
  { code: "HIGHER_MATH", name: "উচ্চতর গণিত", color: "#6366f1" },
];

interface RoutineSlot {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  subjectCode: string | null;
  label: string;
  colorHex: string;
}

export function ClassRoutine() {
  const [slots, setSlots] = useState<RoutineSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    dayOfWeek: 1,
    startTime: "16:00",
    endTime: "17:00",
    subjectCode: "",
    label: "",
  });
  // ফিল্ড-লেভেল ভ্যালিডেশন এরর — কীবোর্ড/স্ক্রিন-রিডার ইউজারদের জন্য
  // aria-invalid+aria-describedby দিয়ে ইনলাইন ফিডব্যাক (আগে শুধু toast এ ছিল)
  const [labelError, setLabelError] = useState<string | undefined>();

  async function loadSlots() {
    setLoading(true);
    try {
      const res = await fetch("/api/routine");
      const data = await res.json();
      setSlots(data.slots ?? []);
    } catch {
      toast.error("রুটিন লোড করা যায়নি");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadSlots();
  }, []);

  function selectSubject(code: string | null) {
    if (!code) return;
    const subject = SUBJECTS.find((s) => s.code === code);
    setForm((prev) => ({
      ...prev,
      subjectCode: code,
      label: subject ? subject.name : prev.label,
    }));
  }

  async function handleAdd() {
    if (!form.label.trim()) {
      setLabelError("লেবেল দাও (যেমন সাবজেক্টের নাম)");
      return;
    }
    setSaving(true);
    try {
      const subject = SUBJECTS.find((s) => s.code === form.subjectCode);
      const res = await fetch("/api/routine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          subjectCode: form.subjectCode || null,
          colorHex: subject?.color ?? "#6d28d9",
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "স্লট যোগ করা যায়নি");
        return;
      }

      setSlots((prev) =>
        [...prev, data.slot].sort(
          (a, b) => a.dayOfWeek - b.dayOfWeek || a.startTime.localeCompare(b.startTime)
        )
      );
      setDialogOpen(false);
      setForm({ dayOfWeek: 1, startTime: "16:00", endTime: "17:00", subjectCode: "", label: "" });
      setLabelError(undefined);
      toast.success("রুটিনে যোগ হয়েছে!");
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setSlots((prev) => prev.filter((s) => s.id !== id));
    try {
      await fetch(`/api/routine/${id}`, { method: "DELETE" });
    } catch {
      toast.error("মুছে ফেলতে সমস্যা হয়েছে, রিফ্রেশ করো");
    }
  }

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-primary" />
          সাপ্তাহিক ক্লাস রুটিন
        </h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={
              <Button size="sm" variant="outline" className="gap-1.5">
                <Plus className="h-3.5 w-3.5" />
                স্লট যোগ করো
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>নতুন রুটিন স্লট</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label>বার</Label>
                {/* ⚠️ base-ui Select ডিফল্টভাবে trigger এ raw value দেখায়
                    (label না) — `items` prop দিয়ে ম্যাপিং দেওয়া হয়েছে */}
                <Select
                  value={String(form.dayOfWeek)}
                  onValueChange={(v) =>
                    setForm((prev) => ({ ...prev, dayOfWeek: Number(v) }))
                  }
                  items={DAYS.map((d) => ({ value: String(d.value), label: d.label }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS.map((d) => (
                      <SelectItem key={d.value} value={String(d.value)}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="routine-start-time">শুরুর সময়</Label>
                  <Input
                    id="routine-start-time"
                    type="time"
                    value={form.startTime}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, startTime: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="routine-end-time">শেষ সময়</Label>
                  <Input
                    id="routine-end-time"
                    type="time"
                    value={form.endTime}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, endTime: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>সাবজেক্ট (ঐচ্ছিক)</Label>
                {/* ⚠️ base-ui Select ডিফল্টভাবে trigger এ raw value (code)
                    দেখায়, নাম না — `items` prop দিয়ে ম্যাপিং দেওয়া হয়েছে */}
                <Select
                  value={form.subjectCode}
                  onValueChange={selectSubject}
                  items={SUBJECTS.map((s) => ({ value: s.code, label: s.name }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="সাবজেক্ট বেছে নাও অথবা কাস্টম লেবেল দাও" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUBJECTS.map((s) => (
                      <SelectItem key={s.code} value={s.code}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="routine-label">লেবেল</Label>
                <Input
                  id="routine-label"
                  placeholder="যেমন: পদার্থবিজ্ঞান, কোচিং, বিশ্রাম"
                  value={form.label}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, label: e.target.value }));
                    if (labelError) setLabelError(undefined);
                  }}
                  aria-invalid={!!labelError}
                  aria-describedby={labelError ? "routine-label-error" : undefined}
                />
                {labelError && (
                  <p id="routine-label-error" role="alert" className="text-xs text-destructive">
                    {labelError}
                  </p>
                )}
              </div>

              <Button
                className="w-full gap-2"
                disabled={saving}
                onClick={handleAdd}
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                যোগ করো
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : slots.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          এখনো কোনো রুটিন স্লট যোগ করা হয়নি। উপরে &quot;স্লট যোগ করো&quot; চাপো।
        </p>
      ) : (
        <div className="space-y-4">
          {DAYS.map((day) => {
            const daySlots = slots.filter((s) => s.dayOfWeek === day.value);
            if (daySlots.length === 0) return null;
            return (
              <div key={day.value}>
                <p className="text-xs font-semibold text-muted-foreground mb-2">
                  {day.label}
                </p>
                <div className="space-y-1.5">
                  {daySlots.map((slot) => (
                    <div
                      key={slot.id}
                      className="flex items-center gap-3 rounded-lg border px-3 py-2 group"
                    >
                      <span
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: slot.colorHex }}
                      />
                      <span className="text-xs text-muted-foreground shrink-0 w-24">
                        {slot.startTime} - {slot.endTime}
                      </span>
                      <span className="text-sm flex-1 truncate">{slot.label}</span>
                      <button
                        onClick={() => handleDelete(slot.id)}
                        className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity p-1 rounded hover:bg-muted shrink-0"
                        aria-label="মুছে ফেলো"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
