"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  Sparkles,
  BookOpen,
  CheckCircle2,
  HelpCircle,
  RotateCcw,
  Stethoscope,
} from "lucide-react";
import { sfx } from "@/lib/sound-effects";
import { triggerConfetti } from "@/components/shared/confetti";
import { cn } from "@/lib/utils";

interface MnemonicItem {
  id: string;
  topic: string;
  paper: "১ম পত্র" | "২য় পত্র";
  chapter: string;
  mnemonicPhrase: string;
  decodedMeaning: { code: string; full: string; info: string }[];
  examSignificance: string;
}

const BIOLOGY_MNEMONICS: MnemonicItem[] = [
  {
    id: "cranial-nerves",
    topic: "১২ জোড়া করোটি স্নায়ুর নাম ও প্রকৃতি",
    paper: "২য় পত্র",
    chapter: "৮ম অধ্যায়: মানব শারীরতত্ত্ব (সমন্বয় ও নিয়ন্ত্রণ)",
    mnemonicPhrase: "অলিম্পিকে অপটিক্যাল অকুলোমোটর ট্রকলিয়ার ট্রাইজেমিনাল আবডুসেন্স ফেসিয়াল অডিটরি গ্লসোফ্যারিঞ্জিয়াল ভেগাস স্পাইনাল হাইপোগ্লোসাল",
    decodedMeaning: [
      { code: "I. অলফ্যাক্টরি", full: "Olfactory Nerve", info: "প্রকৃতি: সংবেদী (Sensory) — ঘ্রাণ অনুভূতি" },
      { code: "II. অপটিক", full: "Optic Nerve", info: "প্রকৃতি: সংবেদী (Sensory) — দৃষ্টি অনুভূতি" },
      { code: "III. অকুলোমোটর", full: "Oculomotor Nerve", info: "প্রকৃতি: মোটোর (Motor) — অক্ষিগোলক সঞ্চালন" },
      { code: "VIII. অডিটরি", full: "Auditory Nerve", info: "প্রকৃতি: সংবেদী (Sensory) — শ্রবণ ও ভারসাম্য" },
      { code: "X. ভেগাস", full: "Vagus Nerve", info: "প্রকৃতি: মিশ্র (Mixed) — হৃদস্পন্দন ও পরিপাক নিয়ন্ত্রণ" },
    ],
    examSignificance: "মেডিকেল ভর্তি পরীক্ষা ও বোর্ড পরীক্ষায় প্রতি বছর কোন স্নায়ুর প্রকৃতি সংবেদী বা চেষ্টীয় তা থেকে প্রশ্ন আসে।",
  },
  {
    id: "mendel-exceptions",
    topic: "মেন্ডেলের ২য় সূত্রের ফিনোটাইপিক অনুপাতের ব্যতিক্রমসমূহ",
    paper: "২য় পত্র",
    chapter: "১১শ অধ্যায়: জিনতত্ত্ব ও বিবর্তন",
    mnemonicPhrase: "পরিপূরক ৯:৭, প্রকট এপিস্ট্যাসিস ১৩:৩, দ্বৈত প্রচ্ছন্ন ৯:৭, ডুপ্লিকেট পলিমারিক ১৫:১",
    decodedMeaning: [
      { code: "পরিপূরক জিন (Complementary)", full: "৯ : ৭", info: "ল্যাথাইরাস ওডোরাটাস (মিষ্টি মটর) এর ফুল" },
      { code: "প্রকট এপিস্ট্যাসিস (Dominant)", full: "১৩ : ৩", info: "লেগহর্ন মুরগির পালকের রঙ" },
      { code: "দ্বৈত প্রচ্ছন্ন এপিস্ট্যাসিস", full: "৯ : ৭", info: "মানুষের জন্মগত মূক ও বধিরতা" },
      { code: "ডুপ্লিকেট প্রকট জিন", full: "১৫ : ১", info: "ক্যাপসেলা উদ্ভিদের ত্রিকোণাকার ফল" },
    ],
    examSignificance: "অনুপাতগুলো সরাসরি এমসিকিউতে আসে এবং উদাহরণগুলো জ্ঞানমূলক ও অনুধাবনে অত্যন্ত গুরুত্বপূর্ণ।",
  },
  {
    id: "virus-diseases",
    topic: "ভাইরাস ঘটিত মানবদেহের প্রধান রোগসমূহ",
    paper: "১ম পত্র",
    chapter: "৪র্থ অধ্যায়: অণুজীব",
    mnemonicPhrase: "হায় হায় দেশে বসন্ত এল পলির ইনফ্লুয়েঞ্জা ও র‍্যাবিস হলো",
    decodedMeaning: [
      { code: "হা", full: "হাম (Measles virus)", info: "বায়ুবাহিত প্যারামিক্সো ভাইরাস" },
      { code: "দে", full: "ডেঙ্গু (Flavivirus)", info: "এডিস মশা পরিবাহিত RNA ভাইরাস" },
      { code: "ব", full: "বসন্ত (Poxvirus)", info: "ভ্যারিওলা ও ভ্যারিসেলা ভাইরাস" },
      { code: "প", full: "পোলিও (Poliovirus)", info: "ক্ষুদ্রতম RNA এন্টেরোভাইরাস" },
      { code: "র্যা", full: "র‍্যাবিস (Rabies / জলাতঙ্ক)", info: "র‍্যাবডো ভাইরাস (বুলেট আকৃতির)" },
    ],
    examSignificance: "মেডিকেল ভর্তি পরীক্ষায় 'কোনটি ভাইরাসজনিত রোগ নয়?' ধরনের প্রশ্নে ১০০% কার্যকারী।",
  },
];

export function BiologyMnemonicsVault() {
  const [selectedMnemonic, setSelectedMnemonic] = useState<MnemonicItem>(BIOLOGY_MNEMONICS[0]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border shadow-xs bg-linear-to-r from-emerald-500/10 via-card to-rose-500/10">
        <CardHeader className="p-4 sm:p-6 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Stethoscope className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                  <span>মেডিকেল ও বায়োলজি হাই-ইল্ড নেমোনিক ভল্ট</span>
                  <Badge variant="secondary" className="text-xs">
                    Biology Fast-Memory V3.0
                  </Badge>
                </CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  মুখস্থ জটিল অনুপাত, ক্র্যানিয়াল নার্ভ ও রোগের তালিকা সহজ ছন্দে দীর্ঘমেয়াদে স্মরণে রাখুন
                </p>
              </div>
            </div>

            {/* Selector */}
            <div className="flex gap-1.5 bg-muted/40 p-1.5 rounded-xl border">
              {BIOLOGY_MNEMONICS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    sfx.play("click");
                    setSelectedMnemonic(m);
                  }}
                  className={cn(
                    "rounded-lg px-2.5 py-1 text-xs font-bold transition",
                    selectedMnemonic.id === m.id
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground"
                  )}
                >
                  {m.topic.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Mnemonic Details (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <Card className="border shadow-2xs p-5 space-y-4 bg-card">
            <div className="flex items-center justify-between border-b pb-2">
              <Badge variant="outline" className="text-3xs font-semibold">
                {selectedMnemonic.paper} • {selectedMnemonic.chapter}
              </Badge>
              <span className="font-bold text-xs text-primary">{selectedMnemonic.topic}</span>
            </div>

            {/* Mnemonic Rhyme Banner */}
            <div className="rounded-2xl border-2 border-emerald-500/30 bg-emerald-500/10 p-4 space-y-1 text-center">
              <div className="text-3xs uppercase font-bold text-emerald-600 dark:text-emerald-400">
                স্মরণ রাখার ছন্দ (Mnemonic Phrase):
              </div>
              <div className="text-base sm:text-lg font-bold text-foreground leading-relaxed font-sans">
                &ldquo;{selectedMnemonic.mnemonicPhrase}&rdquo;
              </div>
            </div>

            {/* Decoded Table */}
            <div className="space-y-2">
              <div className="font-bold text-xs text-muted-foreground uppercase tracking-wider">
                ছন্দের অর্থ ও ব্যাখ্যামূলক ডিকোড:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedMnemonic.decodedMeaning.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl border bg-muted/20 space-y-1 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-primary">{item.code}</span>
                      <span className="font-mono text-3xs text-muted-foreground">{item.full}</span>
                    </div>
                    <div className="text-2xs text-muted-foreground">{item.info}</div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Exam Importance & Board Insights (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="border shadow-2xs p-5 space-y-3 bg-card">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-500" />
              <span>মেডিকেল ও বোর্ড পরীক্ষার গুরুত্ব</span>
            </CardTitle>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {selectedMnemonic.examSignificance}
            </p>
            <div className="rounded-xl border bg-primary/5 p-3 text-2xs space-y-1">
              <div className="font-bold text-foreground">রিভিশন টিপস:</div>
              <div>• এই ছন্দটি ফ্ল্যাশকার্ডে যুক্ত করে ৩ দিন পর পর রিভিশন দিন।</div>
              <div>• পরীক্ষার খাতায় লেখার সময় সঠিক বৈজ্ঞানিক বানান নিশ্চিত করুন।</div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
