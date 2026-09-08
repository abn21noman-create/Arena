"use client";

// ===================================================================
// একটা Deck এ ম্যানুয়ালি নতুন Flashcard যোগ করার Dialog
// -------------------------------------------------------------------
// তিন ধরনের কার্ড বানানো যায়:
// ১. BASIC — সাধারণ প্রশ্ন-উত্তর
// ২. CLOZE — Anki-অনুপ্রাণিত ফাঁকা-পূরণ কার্ড, "{{উত্তর}}" সিনট্যাক্স দিয়ে
//    টেক্সটের মাঝে ফাঁকা তৈরি করা যায়
// ৩. IMAGE_OCCLUSION — ছবি আপলোড করে নির্দিষ্ট অংশ বক্স দিয়ে ঢেকে
//    মুখস্থ করার কার্ড (ডায়াগ্রাম/মানচিত্র/গ্রাফের লেবেল মুখস্থ করার জন্য)
// ===================================================================
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
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
import { toast } from "sonner";
import { Plus, Loader2, HelpCircle, ImagePlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { parseClozeText, isValidClozeText } from "@/lib/cloze";
import { OcclusionEditor } from "@/components/flashcards/occlusion-editor";
import type { OcclusionBox } from "@/lib/image-occlusion";

type CardMode = "BASIC" | "CLOZE" | "IMAGE_OCCLUSION";

export function AddCardDialog({ deckId }: { deckId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<CardMode>("BASIC");
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [clozeText, setClozeText] = useState("");
  const [occlusionImage, setOcclusionImage] = useState<string | null>(null);
  const [occlusionBoxes, setOcclusionBoxes] = useState<OcclusionBox[]>([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // ফিল্ড-লেভেল ভ্যালিডেশন এরর — কীবোর্ড/স্ক্রিন-রিডার ইউজারদের জন্য
  // aria-invalid+aria-describedby দিয়ে ইনলাইন ফিডব্যাক (আগে শুধু toast এ ছিল)
  const [fieldErrors, setFieldErrors] = useState<{ front?: string; back?: string; clozeText?: string }>(
    {}
  );

  const clozePreview = clozeText.trim() ? parseClozeText(clozeText) : null;

  function resetForm() {
    setFront("");
    setBack("");
    setClozeText("");
    setOcclusionImage(null);
    setOcclusionBoxes([]);
    setFieldErrors({});
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("ছবির সাইজ ৫MB এর কম হতে হবে");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setOcclusionImage(reader.result as string);
      setOcclusionBoxes([]);
    };
    reader.readAsDataURL(file);
  }

  function validate() {
    // Image Occlusion মোডে ফিল্ড-লেভেল UI নেই (ছবি আপলোড আলাদা flow),
    // তাই সেই মোডে toast ই যথেষ্ট (আগের মতোই), অন্য দুই মোডে ইনলাইন এরর
    if (mode === "IMAGE_OCCLUSION") {
      if (!occlusionImage) {
        toast.error("প্রথমে একটা ছবি আপলোড করো");
        return false;
      }
      if (occlusionBoxes.length === 0) {
        toast.error("ছবির উপর অন্তত একটা বক্স আঁকো");
        return false;
      }
      return true;
    }

    const errors: { front?: string; back?: string; clozeText?: string } = {};
    if (mode === "BASIC") {
      if (!front.trim()) errors.front = "প্রশ্ন আবশ্যক";
      if (!back.trim()) errors.back = "উত্তর আবশ্যক";
    } else {
      if (!isValidClozeText(clozeText))
        errors.clozeText = 'অন্তত একটা "{{উত্তর}}" ফাঁকা দাও, যেমন: "পানির সংকেত {{H2O}}"';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleAdd() {
    if (!validate()) return;

    setLoading(true);
    try {
      const body =
        mode === "BASIC"
          ? { front, back, cardType: "BASIC" }
          : mode === "CLOZE"
          ? { clozeText, cardType: "CLOZE" }
          : { imageUrl: occlusionImage, occlusionBoxes, cardType: "IMAGE_OCCLUSION" };

      const res = await fetch(`/api/flashcard-decks/${deckId}/cards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "কার্ড যোগ করা যায়নি");
        return;
      }

      toast.success("কার্ড যোগ হয়েছে!");
      resetForm();
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) resetForm();
      }}
    >
      <DialogTrigger
        render={
          <Button variant="outline" className="gap-1.5">
            <Plus className="h-4 w-4" />
            কার্ড যোগ করো
          </Button>
        }
      />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>নতুন Flashcard</DialogTitle>
        </DialogHeader>

        {/* কার্ডের ধরন টগল */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          <button
            type="button"
            onClick={() => setMode("BASIC")}
            className={cn(
              "rounded-lg border px-2 py-2 text-xs font-medium transition-colors",
              mode === "BASIC"
                ? "border-primary bg-primary/10 text-primary"
                : "border-input hover:bg-muted"
            )}
          >
            সাধারণ
          </button>
          <button
            type="button"
            onClick={() => setMode("CLOZE")}
            className={cn(
              "rounded-lg border px-2 py-2 text-xs font-medium transition-colors",
              mode === "CLOZE"
                ? "border-primary bg-primary/10 text-primary"
                : "border-input hover:bg-muted"
            )}
          >
            ফাঁকা-পূরণ
          </button>
          <button
            type="button"
            onClick={() => setMode("IMAGE_OCCLUSION")}
            className={cn(
              "rounded-lg border px-2 py-2 text-xs font-medium transition-colors",
              mode === "IMAGE_OCCLUSION"
                ? "border-primary bg-primary/10 text-primary"
                : "border-input hover:bg-muted"
            )}
          >
            ছবি-ঢাকা
          </button>
        </div>

        {mode === "BASIC" && (
          <div className="space-y-3 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="front">প্রশ্ন / সামনের দিক</Label>
              <Textarea
                id="front"
                placeholder="যেমন: নিউটনের ১ম সূত্র কী?"
                value={front}
                onChange={(e) => {
                  setFront(e.target.value);
                  if (fieldErrors.front) setFieldErrors({ ...fieldErrors, front: undefined });
                }}
                rows={3}
                aria-invalid={!!fieldErrors.front}
                aria-describedby={fieldErrors.front ? "front-error" : undefined}
              />
              {fieldErrors.front && (
                <p id="front-error" role="alert" className="text-xs text-destructive">
                  {fieldErrors.front}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="back">উত্তর / পেছনের দিক</Label>
              <Textarea
                id="back"
                placeholder="উত্তর লেখো..."
                value={back}
                onChange={(e) => {
                  setBack(e.target.value);
                  if (fieldErrors.back) setFieldErrors({ ...fieldErrors, back: undefined });
                }}
                rows={3}
                aria-invalid={!!fieldErrors.back}
                aria-describedby={fieldErrors.back ? "back-error" : undefined}
              />
              {fieldErrors.back && (
                <p id="back-error" role="alert" className="text-xs text-destructive">
                  {fieldErrors.back}
                </p>
              )}
            </div>
          </div>
        )}

        {mode === "CLOZE" && (
          <div className="space-y-3 pt-2">
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Label htmlFor="cloze-text">টেক্সট (ফাঁকা রাখতে চাওয়া অংশ দুই বন্ধনীতে লেখো)</Label>
              </div>
              <Textarea
                id="cloze-text"
                placeholder="যেমন: সালোকসংশ্লেষণে {{CO2}} ও {{পানি}} ব্যবহার করে উদ্ভিদ খাদ্য তৈরি করে"
                value={clozeText}
                onChange={(e) => {
                  setClozeText(e.target.value);
                  if (fieldErrors.clozeText) setFieldErrors({ ...fieldErrors, clozeText: undefined });
                }}
                rows={4}
                aria-invalid={!!fieldErrors.clozeText}
                aria-describedby={fieldErrors.clozeText ? "cloze-text-error" : undefined}
              />
              {fieldErrors.clozeText && (
                <p id="cloze-text-error" role="alert" className="text-xs text-destructive">
                  {fieldErrors.clozeText}
                </p>
              )}
              <p className="text-xs text-muted-foreground flex items-start gap-1.5 pt-0.5">
                <HelpCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                যা মুখস্থ করতে চাও তার চারপাশে <code className="px-1 rounded bg-muted">{"{{ }}"}</code> বসাও।
                একাধিক ফাঁকা রাখতে পারো, রিভিউ এর সময় সব একসাথে দেখানো হবে।
              </p>
            </div>
            {clozePreview && (
              <div className="rounded-lg border bg-muted/40 p-3">
                <p className="text-xs text-muted-foreground mb-1">প্রিভিউ (এভাবে দেখাবে):</p>
                <p className="text-sm">
                  {clozePreview.isValid
                    ? clozePreview.maskedText
                    : "⚠️ কমপক্ষে একটা ফাঁকা ভরাট রাখো (খালি {{}} চলবে না)"}
                </p>
              </div>
            )}
          </div>
        )}

        {mode === "IMAGE_OCCLUSION" && (
          <div className="space-y-3 pt-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageSelect}
            />
            {occlusionImage ? (
              <>
                <OcclusionEditor
                  imageUrl={occlusionImage}
                  boxes={occlusionBoxes}
                  onBoxesChange={setOcclusionBoxes}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  অন্য ছবি বেছে নাও
                </Button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-video rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
              >
                <ImagePlus className="h-8 w-8" />
                <span className="text-sm">ডায়াগ্রাম/মানচিত্র/গ্রাফের ছবি আপলোড করো</span>
              </button>
            )}
          </div>
        )}

        <Button onClick={handleAdd} className="w-full" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          যোগ করো
        </Button>
      </DialogContent>
    </Dialog>
  );
}
