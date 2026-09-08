"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Layers,
  CheckCircle2,
  Plus,
  RotateCcw,
  BookOpen,
  Zap,
} from "lucide-react";
import { sfx } from "@/lib/sound-effects";
import { triggerConfetti } from "@/components/shared/confetti";
import { cn } from "@/lib/utils";

interface GeneratedCard {
  id: string;
  type: "qa" | "cloze";
  front: string;
  back: string;
  category: "সংজ্ঞা" | "সূত্র" | "বিক্রিয়া" | "ব্যতিক্রম";
}

const SAMPLE_GENERATED_CARDS: GeneratedCard[] = [
  {
    id: "card-1",
    type: "qa",
    front: "কেপলারের ৩য় সূত্র (পর্যায়কালের সূত্র) কী?",
    back: "সূর্যকে প্রদক্ষিণকারী প্রতিটি গ্রহের আবর্তনকালের বর্গ সূর্য হতে গ্রহের গড় দূরত্বের ঘনের সমানুপাতিক (T² ∝ r³)।",
    category: "সূত্র",
  },
  {
    id: "card-2",
    type: "cloze",
    front: "হেবার-বশ পদ্ধতিতে অ্যামোনিয়া উৎপাদনে অনুকূল তাপমাত্রা [...] এবং চাপ [...]।",
    back: "৪৫০°C – ৫৫০°C এবং ২০০ atm (Fe প্রভাবক ও Mo প্রমোটর)।",
    category: "বিক্রিয়া",
  },
  {
    id: "card-3",
    type: "qa",
    front: "মেন্ডেলের ২য় সূত্রের সমপ্রকটতার (Codominance) ফিনোটাইপিক অনুপাত কত?",
    back: "১ : ২ : ১ (সাধারণ অনুপাত ৯:৩:৩:১ এর পরিবর্তে)।",
    category: "ব্যতিক্রম",
  },
  {
    id: "card-4",
    type: "qa",
    front: "জড়তার ভ্রামকের একক ও মাত্রা সমীকরণ কী?",
    back: "একক: kg·m² এবং মাত্রা: [M L²] ।",
    category: "সংজ্ঞা",
  },
];

export function AIFlashcardGenerator() {
  const [inputText, setInputText] = useState<string>(
    "কেপলারের ৩য় সূত্র অনুযায়ী T² ∝ r³। হেবার-বশ পদ্ধতিতে অ্যামোনিয়া সংশ্লেষণে ৪৫০-৫৫০ ডিগ্রি সেলসিয়াস ও ২০০ অ্যাটমোস্ফিয়ার চাপ ব্যবহৃত হয়। সমপ্রকটতায় ফিনোটাইপিক অনুপাত ১:২:১। জড়তার ভ্রামক I = mr² যার একক kg m²।"
  );
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [cards, setCards] = useState<GeneratedCard[]>(SAMPLE_GENERATED_CARDS);
  const [addedCount, setAddedCount] = useState<number>(0);

  const handleGenerate = () => {
    sfx.play("click");
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setCards(SAMPLE_GENERATED_CARDS);
      sfx.play("correct");
      triggerConfetti();
    }, 1200);
  };

  const handleAddAllToDeck = () => {
    sfx.play("streak");
    triggerConfetti();
    setAddedCount(cards.length);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border shadow-xs bg-linear-to-r from-emerald-500/10 via-card to-blue-500/10">
        <CardHeader className="p-4 sm:p-6 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                  <span>AI নোট-টু-ফ্ল্যাশকার্ড ও Anki ডেক জেনারেটর</span>
                  <Badge variant="secondary" className="text-xs">
                    FSRS-5 Auto Deck V3.0
                  </Badge>
                </CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  অধ্যায়ের নোট বা সারাংশ পেস্ট করে এক ক্লিকে সংজ্ঞা, সূত্র ও ক্লোজ ডিলিশন ফ্ল্যাশকার্ড তৈরি করুন
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border shadow-2xs p-5 space-y-3 bg-card">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="font-bold text-xs">লেকচার নোট বা টেক্সট পেস্ট করুন:</span>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-3xs"
                onClick={() => setInputText("")}
              >
                ক্লিয়ার
              </Button>
            </div>

            <textarea
              rows={8}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="এখানে ক্লাসের নোট বা বইয়ের গুরুত্বপূর্ণ অনুচ্ছেদ লিখুন..."
              className="w-full rounded-xl border bg-muted/20 p-3 text-xs leading-relaxed outline-none focus:border-primary resize-none"
            />

            <Button
              className="w-full font-bold gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
              onClick={handleGenerate}
              disabled={isGenerating || !inputText.trim()}
            >
              {isGenerating ? (
                <>
                  <Sparkles className="h-4 w-4 animate-spin" />
                  <span>AI কার্ড তৈরি করছে...</span>
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  <span>স্মার্ট ফ্ল্যাশকার্ড জেনারেট করুন</span>
                </>
              )}
            </Button>
          </Card>
        </div>

        {/* Generated Cards (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-muted-foreground">
              জেনারেট হওয়া ফ্ল্যাশকার্ড ({cards.length}টি)
            </span>
            <Button
              size="sm"
              variant="default"
              className="h-8 text-2xs gap-1.5 font-bold"
              onClick={handleAddAllToDeck}
            >
              <Plus className="h-3.5 w-3.5" />
              <span>FSRS রিভিউ ডেকে যুক্ত করুন</span>
            </Button>
          </div>

          {addedCount > 0 && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>{addedCount}টি ফ্ল্যাশকার্ড সফলভাবে স্পেসড রিপিটেশন ডেকে যুক্ত হয়েছে!</span>
            </div>
          )}

          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
            {cards.map((c, idx) => (
              <Card key={c.id} className="border shadow-2xs p-4 space-y-2 bg-card">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-3xs font-semibold">
                    {c.category}
                  </Badge>
                  <span className="font-mono text-3xs text-muted-foreground">কার্ড #{idx + 1}</span>
                </div>

                <div className="space-y-1">
                  <div className="text-xs font-bold text-foreground">
                    <span className="text-primary mr-1.5">Q:</span>
                    {c.front}
                  </div>
                  <div className="text-xs text-muted-foreground bg-muted/20 p-2 rounded-lg border font-medium">
                    <span className="text-emerald-500 font-bold mr-1.5">A:</span>
                    {c.back}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
