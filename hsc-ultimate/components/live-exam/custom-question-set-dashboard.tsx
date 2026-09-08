"use client";

// ===================================================================
// Custom Question Set Dashboard — বইয়ের পাতার ছবি আপলোড → MCQ/CQ জেনারেট
// -------------------------------------------------------------------
// PDF Chat Dashboard এর প্যাটার্ন অনুসরণ করে: PROCESSING স্ট্যাটাসে থাকা
// সেটের জন্য পোলিং (৩ সেকেন্ড interval), READY হলে সেট দিয়ে Live Exam
// (solo) অথবা Quiz Battle (multi-person) শুরু করা যায়।
// ===================================================================
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  ArrowLeft,
  ImagePlus,
  Upload,
  Loader2,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  PlayCircle,
  Swords,
  ScanText,
  Users,
} from "lucide-react";

type SetStatus = "PROCESSING" | "READY" | "FAILED";
type QType = "MCQ" | "CQ";

interface QuestionSet {
  id: string;
  title: string;
  questionType: QType;
  status: SetStatus;
  errorMessage: string | null;
  createdAt: string;
  _count: { questions: number };
}

const STATUS_INFO: Record<SetStatus, { label: string; icon: typeof Clock; className: string }> = {
  PROCESSING: { label: "প্রশ্ন তৈরি হচ্ছে...", icon: Clock, className: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-500/30" },
  READY: { label: "প্রস্তুত", icon: CheckCircle2, className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-500/30" },
  FAILED: { label: "ব্যর্থ হয়েছে", icon: XCircle, className: "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 dark:border-red-500/30" },
};

export function CustomQuestionSetDashboard() {
  const confirmAction = useConfirmDialog();
  const [sets, setSets] = useState<QuestionSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [questionType, setQuestionType] = useState<QType>("MCQ");
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadSets = useCallback(async () => {
    try {
      const res = await fetch("/api/custom-question-sets");
      const data = await res.json();
      if (res.ok) setSets(data.sets);
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSets();
  }, [loadSets]);

  useEffect(() => {
    const hasProcessing = sets.some((s) => s.status === "PROCESSING");
    if (hasProcessing && !pollRef.current) {
      pollRef.current = setInterval(() => {
        void loadSets();
      }, 3000);
    } else if (!hasProcessing && pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [sets, loadSets]);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("শুধু ছবি ফাইল আপলোড করা যাবে");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("ছবির সাইজ ৫ MB এর বেশি হতে পারবে না");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPendingImage(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleUpload() {
    if (!pendingImage || uploading) return;
    setUploading(true);
    try {
      const res = await fetch("/api/custom-question-sets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: pendingImage, questionType, title }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "আপলোড ব্যর্থ হয়েছে");
        return;
      }
      toast.success("📸 ছবি আপলোড হয়েছে! প্রশ্ন তৈরি শুরু হয়েছে...");
      setPendingImage(null);
      setTitle("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      void loadSets();
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(setId: string) {
    if (
      !(await confirmAction({ description: "এই সেট ডিলিট হয়ে যাবে, নিশ্চিত?", confirmLabel: "ডিলিট করো" }))
    )
      return;
    try {
      const res = await fetch(`/api/custom-question-sets/${setId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "ডিলিট করা যায়নি");
        return;
      }
      toast.success("ডিলিট হয়েছে");
      setSets((prev) => prev.filter((s) => s.id !== setId));
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="mb-6 flex items-center gap-3">
        <Button render={<Link href="/dashboard" />} variant="ghost" size="icon" aria-label="পিছনে যাও">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        <div>
          <h1 className="text-2xl font-bold">📚 Live Exam — নিজের প্রশ্ন তৈরি করো</h1>
          <p className="text-sm text-muted-foreground">
            বইয়ের পাতা বা নোটের ছবি আপলোড করো, AI সেখান থেকে MCQ/CQ বানিয়ে দেবে —
            তারপর একা Live Exam, ১ বন্ধুর সাথে Duel, অথবা সবাইকে নিয়ে Quiz
            Battle দাও
          </p>
        </div>
      </div>

      {/* glassmorphism hero banner — established প্যাটার্ন (nav-modules.ts এর
          Live Exam আইটেম গ্রেডিয়েন্ট) */}
      <div className="glass-hero glass-hero-card relative overflow-hidden rounded-2xl bg-linear-to-br from-fuchsia-700 to-fuchsia-900 p-5 mb-6 text-white">
        <div
          aria-hidden
          className="glass-hero-orb h-32 w-32 bg-white/20"
          style={{ top: "-2rem", right: "-1.5rem" }}
        />
        <div className="relative z-10 flex items-center gap-3">
          <ScanText className="h-7 w-7 opacity-90" />
          <div>
            <p className="font-bold">নিজের বইয়ের পাতা দিয়ে AI প্রশ্ন তৈরি করো</p>
            <p className="text-sm opacity-90">ছবি আপলোড করো, AI MCQ/CQ বানিয়ে দেবে</p>
          </div>
        </div>
      </div>

      {/* Upload Card */}
      <Card className="mb-6 p-5">
        <h2 className="mb-3 flex items-center gap-2 font-semibold">
          <ScanText className="h-5 w-5 text-violet-600" />
          বইয়ের পাতার ছবি দিয়ে প্রশ্ন তৈরি করো
        </h2>
        <div className="space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileSelect}
          />

          {pendingImage ? (
            <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
              <Image src={pendingImage} alt="আপলোড করা ছবি" fill className="object-contain" unoptimized />
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <ImagePlus className="h-8 w-8" />
              <span className="text-sm">বইয়ের পাতার ছবি বেছে নাও বা তোলো</span>
            </button>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="q-type">প্রশ্নের ধরন</Label>
              {/* ⚠️ base-ui Select ডিফল্টভাবে trigger এ raw value দেখায়
                  (label না) — `items` prop দিয়ে ম্যাপিং দেওয়া হয়েছে */}
              <Select
                value={questionType}
                onValueChange={(v) => v && setQuestionType(v as QType)}
                items={[
                  { value: "MCQ", label: "MCQ (বহুনির্বাচনী)" },
                  { value: "CQ", label: "CQ (সৃজনশীল)" },
                ]}
              >
                <SelectTrigger id="q-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MCQ">MCQ (বহুনির্বাচনী)</SelectItem>
                  <SelectItem value="CQ">CQ (সৃজনশীল)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="set-title">টাইটেল (ঐচ্ছিক)</Label>
              <Input
                id="set-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="যেমন: রসায়ন অধ্যায় ৩"
                disabled={uploading}
              />
            </div>
          </div>

          <Button onClick={handleUpload} disabled={!pendingImage || uploading} className="w-full sm:w-auto">
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> আপলোড হচ্ছে...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" /> আপলোড করো
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Sets List */}
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : sets.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          <ScanText className="mx-auto mb-3 h-10 w-10 opacity-40" />
          <p>এখনো কোনো প্রশ্ন সেট তৈরি করোনি। উপরের ফর্ম দিয়ে শুরু করো!</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {sets.map((set) => {
            const statusInfo = STATUS_INFO[set.status];
            const StatusIcon = statusInfo.icon;
            return (
              <Card key={set.id} className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{set.title}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="secondary">{set.questionType}</Badge>
                    <Badge variant="secondary" className={statusInfo.className}>
                      <StatusIcon className="mr-1 h-3 w-3" />
                      {statusInfo.label}
                    </Badge>
                    {set.status === "READY" && <span>{set._count.questions}টা প্রশ্ন</span>}
                    {set.status === "FAILED" && set.errorMessage && (
                      <span className="text-red-600">{set.errorMessage}</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap shrink-0 items-center gap-2">
                  {set.status === "READY" && set.questionType === "MCQ" && (
                    <>
                      <Button render={<Link href={`/live-exam/start?customSetId=${set.id}`} />} size="sm" variant="outline">
                          <PlayCircle className="mr-1.5 h-4 w-4" /> একা দাও
                        </Button>
                      <Button render={<Link href={`/duel?customSetId=${set.id}`} />} size="sm" variant="outline">
                          <Users className="mr-1.5 h-4 w-4" /> ১ বন্ধুকে চ্যালেঞ্জ
                        </Button>
                      <Button render={<Link href={`/quiz-battle/create?customSetId=${set.id}`} />} size="sm">
                          <Swords className="mr-1.5 h-4 w-4" /> সবাইকে নিয়ে Battle
                        </Button>
                    </>
                  )}
                  {/* 🔧 সম্প্রসারণ (এই সেশনে, Live Exam CQ সাপোর্ট): CQ সেট
                      দিয়ে Duel/Battle বানানো যায় না (established সীমাবদ্ধতা
                      অক্ষত, AI-evaluate scoring জটিল), কিন্তু একা (Solo)
                      Live Exam এখন CQ সেট দিয়েও দেওয়া যায় */}
                  {set.status === "READY" && set.questionType === "CQ" && (
                    <Button render={<Link href={`/live-exam/start?customSetId=${set.id}`} />} size="sm" variant="outline">
                        <PlayCircle className="mr-1.5 h-4 w-4" /> একা দাও
                      </Button>
                  )}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-red-500 hover:bg-red-50 hover:text-red-600"
                    onClick={() => handleDelete(set.id)}
                    aria-label="সেট মুছে ফেলো"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
