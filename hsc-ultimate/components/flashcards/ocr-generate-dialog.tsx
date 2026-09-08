"use client";

// ===================================================================
// OCR দিয়ে ছবি থেকে ফ্ল্যাশকার্ড তৈরি করার Dialog
// -------------------------------------------------------------------
// ৩-ধাপের ফ্লো (Deep Research এ চিহ্নিত RemNote/Quizlet Magic Notes প্যাটার্ন
// অনুসরণ করে, কিন্তু ভুল OCR ঠেকাতে মাঝে রিভিউ ধাপ যোগ করা হয়েছে):
//   ১. ছবি আপলোড (হাতের লেখা নোট/বইয়ের পাতা/ছবি তোলা)
//   ২. OCR দিয়ে টেক্সট এক্সট্র্যাক্ট — ইউজার রিভিউ/এডিট করতে পারবে
//   ৩. এক্সট্র্যাক্ট করা (ও এডিট করা) টেক্সট দিয়ে AI ফ্ল্যাশকার্ড জেনারেট
// ===================================================================
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ScanText, Loader2, ImagePlus, ArrowRight, Sparkles, RotateCcw } from "lucide-react";

type Step = "upload" | "review" | "done";

export function OcrGenerateDialog({ deckId }: { deckId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("upload");
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState("");
  const [ocrProvider, setOcrProvider] = useState<string | null>(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function resetAll() {
    setStep("upload");
    setPendingImage(null);
    setExtractedText("");
    setOcrProvider(null);
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
      setOcrProvider(data.provider);
      setStep("review");
      toast.success("📄 ছবি থেকে টেক্সট বের করা হয়েছে — দরকার হলে এডিট করো");
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setOcrLoading(false);
    }
  }

  async function handleGenerateFlashcards() {
    if (!extractedText.trim() || generating) return;
    if (extractedText.trim().length < 30) {
      toast.error("অন্তত ৩০ অক্ষরের টেক্সট দরকার ভালো ফ্ল্যাশকার্ড বানাতে");
      return;
    }
    setGenerating(true);
    try {
      const res = await fetch("/api/flashcard-decks/generate-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deckId, notes: extractedText }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "ফ্ল্যাশকার্ড তৈরি করা যায়নি");
        return;
      }
      toast.success(`🎉 ছবি থেকে ${data.count}টি ফ্ল্যাশকার্ড তৈরি হয়েছে!`);
      setStep("done");
      router.refresh();
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) resetAll();
      }}
    >
      <DialogTrigger
        render={
          <Button variant="outline" className="gap-1.5">
            <ScanText className="h-4 w-4" />
            ছবি থেকে বানাও
          </Button>
        }
      />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ScanText className="h-5 w-5 text-primary" />
            ছবি থেকে ফ্ল্যাশকার্ড তৈরি করো
          </DialogTitle>
        </DialogHeader>

        {/* ধাপ ১: ছবি আপলোড */}
        {step === "upload" && (
          <div className="space-y-3 pt-2">
            <p className="text-xs text-muted-foreground">
              হাতের লেখা নোট, বইয়ের পাতা, বা প্রিন্ট করা টেক্সটের ছবি তুলে/আপলোড করো —
              AI প্রথমে টেক্সট পড়বে, তারপর ফ্ল্যাশকার্ড বানাবে
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
                <Image src={pendingImage} alt="আপলোড করা ছবি" fill className="object-contain" unoptimized />
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
                  <ArrowRight className="h-4 w-4" />
                )}
                {ocrLoading ? "পড়া হচ্ছে..." : "টেক্সট বের করো"}
              </Button>
            </div>
          </div>
        )}

        {/* ধাপ ২: টেক্সট রিভিউ/এডিট */}
        {step === "review" && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="extracted-text">বের করা টেক্সট (দরকার হলে ঠিক করো)</Label>
              {ocrProvider && (
                <Badge variant="outline" className="text-xs">
                  {ocrProvider}
                </Badge>
              )}
            </div>
            <Textarea
              id="extracted-text"
              value={extractedText}
              onChange={(e) => setExtractedText(e.target.value)}
              rows={8}
              className="text-sm"
            />
            <p className="text-xs text-muted-foreground">
              ⚠️ OCR মাঝে মাঝে ভুল পড়তে পারে (বিশেষত হাতের লেখায়) — জমা দেওয়ার আগে
              একবার চেক করে নাও
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep("upload")} className="gap-1.5">
                <RotateCcw className="h-3.5 w-3.5" />
                আবার চেষ্টা
              </Button>
              <Button
                onClick={handleGenerateFlashcards}
                disabled={generating || !extractedText.trim()}
                className="flex-1 gap-2"
              >
                {generating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {generating ? "তৈরি হচ্ছে..." : "ফ্ল্যাশকার্ড তৈরি করো"}
              </Button>
            </div>
          </div>
        )}

        {/* ধাপ ৩: সম্পন্ন */}
        {step === "done" && (
          <div className="py-6 text-center space-y-3">
            <Sparkles className="h-10 w-10 text-primary mx-auto" />
            <p className="font-medium">ফ্ল্যাশকার্ড তৈরি হয়ে গেছে!</p>
            <Button onClick={() => setOpen(false)} className="w-full">
              বন্ধ করো
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
