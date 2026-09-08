"use client";

// ===================================================================
// Handwritten Answer Button — হাতে লেখা CQ উত্তর ছবি তুলে টেক্সটে
// রূপান্তর করার বাটন (OCR দিয়ে)
// -------------------------------------------------------------------
// প্রেক্ষাপট: বাস্তব HSC পরীক্ষায় ছাত্ররা CQ (সৃজনশীল প্রশ্ন) এর উত্তর
// হাতে লেখে, কিন্তু আমাদের CQ Practice এ এতদিন শুধু টাইপ করে উত্তর
// দেওয়া যেত। Deep research এ দেখা গেছে ২০২৬ সালে "handwritten answer
// AI grading" একটা established global EdTech ট্রেন্ড (ExamAI, GradeLab,
// GradingPal, GradeX ইত্যাদি), এবং বাংলাদেশী competitor SATT Academy-ও
// CQ AI analysis অফার করে। এই কম্পোনেন্ট সেই gap পূরণ করে — ছাত্র
// খাতায় হাতে লিখে ছবি তুলবে, AI সেটা পড়ে টেক্সটে রূপান্তর করবে
// (review/edit করার সুযোগ সহ), তারপর সেই টেক্সট বিদ্যমান
// `evaluateCQAnswer()` দিয়ে মূল্যায়ন হবে — কোনো নতুন evaluation logic
// লাগেনি।
//
// Architecture সিদ্ধান্ত: সম্পূর্ণভাবে বিদ্যমান infrastructure পুনর্ব্যবহার
// করা হয়েছে (schema-free, নতুন dependency ছাড়া):
// - `POST /api/flashcard-decks/ocr-extract` endpoint (আগে থেকেই আছে,
//   OCR Pipeline ফিচারে বানানো হয়েছিল হাতের লেখা নোট থেকে ফ্ল্যাশকার্ড
//   বানানোর জন্য) — এখানে reuse করা হয়েছে, নতুন কোনো backend endpoint
//   লাগেনি।
// - `getVisionResponse()` (Mistral Pixtral → OpenRouter Gemini Vision
//   fallback chain) — একই vision AI যা AI Doubt Solver এ ছবি দেখে
//   অংক সমাধান করে।
// - `capture="environment"` file input প্যাটার্ন (OCR Generate Dialog
//   ও Live Exam Custom Question Set এ established) — মোবাইলে সরাসরি
//   ক্যামেরা খোলে।
//
// UX: VoiceInputButton এর ঠিক পাশে বসানো (একই আকারের icon button),
// কথা বলে লেখা vs ছবি তুলে লেখা — দুটোই ইনপুট পদ্ধতি, একই জায়গায়
// থাকা যুক্তিসঙ্গত। Extract করা টেক্সট বিদ্যমান answer এর সাথে append
// হয় (VoiceInputButton এর `onResult` callback এর মতোই আচরণ) — ইউজার
// একাধিকবার ছবি তুলে ধাপে ধাপে লম্বা উত্তর বানাতে পারবে।
// ===================================================================
import { useRef, useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { Camera, Loader2, ImagePlus, Check, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

type Step = "upload" | "review";

interface HandwrittenAnswerButtonProps {
  onResult: (extractedText: string) => void;
  disabled?: boolean;
  className?: string;
}

export function HandwrittenAnswerButton({
  onResult,
  disabled,
  className,
}: HandwrittenAnswerButtonProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("upload");
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState("");
  const [ocrLoading, setOcrLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function resetAll() {
    setStep("upload");
    setPendingImage(null);
    setExtractedText("");
  }

  function handleOpenChange(isOpen: boolean) {
    setOpen(isOpen);
    if (!isOpen) resetAll();
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("ছবির সাইজ ৫MB এর কম হতে হবে");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setPendingImage(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleExtractText() {
    if (!pendingImage || ocrLoading) return;
    setOcrLoading(true);
    try {
      const res = await fetch("/api/flashcard-decks/ocr-extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: pendingImage }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "ছবি থেকে টেক্সট বের করা যায়নি");
        return;
      }
      setExtractedText(data.extractedText);
      setStep("review");
      toast.success("📄 হাতের লেখা পড়া হয়েছে — দরকার হলে ঠিক করে নাও");
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setOcrLoading(false);
    }
  }

  function handleUseText() {
    if (!extractedText.trim()) {
      toast.error("কোনো টেক্সট নেই যোগ করার মতো");
      return;
    }
    onResult(extractedText.trim());
    setOpen(false);
    resetAll();
  }

  return (
    <>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setOpen(true)}
              disabled={disabled}
              className={cn(className)}
              aria-label="হাতে লিখে ছবি তুলে উত্তর দাও"
            >
              <Camera className="h-4 w-4" />
            </Button>
          }
        />
        <TooltipContent>হাতে লিখে ছবি তুলে উত্তর দাও</TooltipContent>
      </Tooltip>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>হাতে লেখা উত্তর ছবি তুলে দাও</DialogTitle>
          </DialogHeader>

          {step === "upload" && (
            <div className="space-y-3 pt-2">
              <p className="text-xs text-muted-foreground">
                খাতায় হাতে লিখে সেই উত্তরের ছবি তুলে/আপলোড করো — AI প্রথমে
                লেখাটা পড়বে, তারপর তুমি রিভিউ করে টেক্সট বক্সে যোগ করতে পারবে
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleImageSelect}
              />

              {pendingImage ? (
                <div className="relative w-full aspect-video rounded-lg overflow-hidden border">
                  <Image
                    src={pendingImage}
                    alt="আপলোড করা ছবি"
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full aspect-video rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                >
                  <ImagePlus className="h-8 w-8" />
                  <span className="text-sm">ছবি বেছে নাও বা তোলো</span>
                </button>
              )}

              <div className="flex gap-2">
                {pendingImage && (
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1"
                  >
                    অন্য ছবি বেছে নাও
                  </Button>
                )}
                <Button
                  onClick={handleExtractText}
                  disabled={!pendingImage || ocrLoading}
                  className="flex-1 gap-2"
                >
                  {ocrLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                  {ocrLoading ? "পড়া হচ্ছে..." : "লেখা পড়ো"}
                </Button>
              </div>
            </div>
          )}

          {step === "review" && (
            <div className="space-y-3 pt-2">
              <p className="text-xs text-muted-foreground">
                AI যা পড়েছে তা নিচে দেখাও হয়েছে — ভুল থাকলে ঠিক করে নাও, তারপর
                &quot;যোগ করো&quot; চাপো
              </p>
              <Textarea
                value={extractedText}
                onChange={(e) => setExtractedText(e.target.value)}
                aria-label="OCR দিয়ে বের করা টেক্সট"
                rows={8}
                className="font-mono text-sm"
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStep("upload")}
                  className="flex-1 gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  আবার ছবি তোলো
                </Button>
                <Button onClick={handleUseText} className="flex-1 gap-2">
                  <Check className="h-4 w-4" />
                  যোগ করো
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
