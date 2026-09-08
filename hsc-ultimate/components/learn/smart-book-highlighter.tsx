"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Highlighter, Sparkles, Bookmark, StickyNote, Plus, Trash2, CheckCircle2 } from "lucide-react";
import { sfx } from "@/lib/sound-effects";
import { triggerConfetti } from "@/components/shared/confetti";
import { cn } from "@/lib/utils";

interface HighlightItem {
  id: string;
  text: string;
  type: "yellow" | "green" | "pink";
  label: string;
  note?: string;
}

const CHAPTER_TEXT = [
  {
    id: "p1",
    title: "১.১ মহাকর্ষ বল ও মহাকর্ষীয় ধ্রুবক",
    content: "এই মহাবিশ্বের প্রতিটি বস্তু কণা একে অপরকে নিজের দিকে আকর্ষণ করে। এই আকর্ষণ বলকে মহাকর্ষ বল বলে। স্যার আইজ্যাক নিউটনের মতে, দুটি বস্তুকণার মধ্যকার আকর্ষণ বলের মান তাদের ভরের গুণফলের সমানুপাতিক এবং তাদের মধ্যবর্তী দূরত্বের বর্গের ব্যস্তানুপাতিক।",
    defaultHighlight: "মহাকর্ষ বলের মান তাদের ভরের গুণফলের সমানুপাতিক এবং তাদের মধ্যবর্তী দূরত্বের বর্গের ব্যস্তানুপাতিক।",
    highlightType: "yellow" as const,
    highlightLabel: "মৌলিক সূত্র",
  },
  {
    id: "p2",
    title: "১.২ মহাকর্ষীয় প্রাবল্য ও বিভব",
    content: "মহাকর্ষীয় ক্ষেত্রের কোনো বিন্দুতে একক ভরের একটি বস্তু স্থাপন করলে সেটি যে বল অনুভব করে, তাকে ঐ বিন্দুর মহাকর্ষীয় প্রাবল্য (E) বলে। মহাকর্ষীয় বিভব V = -GM/r। অসীমে মহাকর্ষীয় বিভবের মান শূন্য (০) ধরা হয় এবং মহাকর্ষীয় ক্ষেত্রে বিভবের মান সর্বদা ঋণাত্মক হয়।",
    defaultHighlight: "অসীমে মহাকর্ষীয় বিভবের মান শূন্য (০) ধরা হয় এবং মহাকর্ষীয় ক্ষেত্রে বিভবের মান সর্বদা ঋণাত্মক হয়।",
    highlightType: "pink" as const,
    highlightLabel: "এডমিশন ট্র্যাপ",
  },
  {
    id: "p3",
    title: "১.৩ মুক্তিবেগ (Escape Velocity)",
    content: "যে সর্বনিম্ন বেগে কোনো বস্তুকে খাড়া উপরের দিকে নিক্ষেপ করলে তা আর পৃথিবী পৃষ্ঠে ফিরে আসে না, তাকে মুক্তিবেগ বলে। পৃথিবী পৃষ্ঠে মুক্তিবেগ ve = √(2gR) = 11.2 km/s। মুক্তিবেগের মান নিক্ষিপ্ত বস্তুর ভরের উপর নির্ভর করে না, তবে গ্রহের ভর ও ব্যাসার্ধের উপর নির্ভর করে।",
    defaultHighlight: "মুক্তিবেগের মান নিক্ষিপ্ত বস্তুর ভরের উপর নির্ভর করে না (ve = 11.2 km/s)।",
    highlightType: "green" as const,
    highlightLabel: "বোর্ড পরীক্ষায় বারবার আসা",
  },
];

export function SmartBookHighlighter() {
  const [activeColor, setActiveColor] = useState<"yellow" | "green" | "pink">("yellow");
  const [highlights, setHighlights] = useState<HighlightItem[]>([
    {
      id: "h1",
      text: "মহাকর্ষ বলের মান তাদের ভরের গুণফলের সমানুপাতিক এবং দূরত্বের বর্গের ব্যস্তানুপাতিক।",
      type: "yellow",
      label: "মৌলিক সূত্র",
      note: "নিউটনের ৩য় সূত্রের সাথে সামঞ্জস্যপূর্ণ।",
    },
    {
      id: "h2",
      text: "মহাকর্ষীয় বিভব সর্বদা ঋণাত্মক এবং অসীমে সর্বোচ্চ (শূন্য)।",
      type: "pink",
      label: "এডমিশন ট্র্যাপ",
      note: "বুয়েট ও ঢাবি ভর্তি পরীক্ষায় অপশনে ঋণাত্মক চিহ্ন দিয়ে প্রায়ই ভুল করানো হয়।",
    },
    {
      id: "h3",
      text: "পৃথিবী পৃষ্ঠে মুক্তিবেগ ve = 11.2 km/s (ভরের উপর নির্ভরশীল নয়)।",
      type: "green",
      label: "বোর্ড হট-টপিক",
      note: "ঢাকা বোর্ড ২৩ ও রাজশাহী বোর্ড ২২ এ এসেছে।",
    },
  ]);

  const [newNoteText, setNewNoteText] = useState("");
  const [selectedHighlightId, setSelectedHighlightId] = useState<string | null>(null);

  const handleAddNote = () => {
    if (!newNoteText.trim() || !selectedHighlightId) return;
    sfx.play("correct");
    setHighlights((prev) =>
      prev.map((h) => (h.id === selectedHighlightId ? { ...h, note: newNoteText } : h))
    );
    setNewNoteText("");
    setSelectedHighlightId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border shadow-xs bg-linear-to-r from-primary/5 via-card to-emerald-500/5">
        <CardHeader className="p-4 sm:p-6 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                  <span>স্মার্ট বুক ও হাইলাইটার (Smart Interactive Book)</span>
                  <Badge variant="secondary" className="text-xs">
                    পদার্থবিজ্ঞান ১ম পত্র: মহাকর্ষ ও অভিকর্ষ
                  </Badge>
                </CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  বই পড়ার সময় গুরুত্বপূর্ণ লাইন হাইলাইট করুন ও পার্সোনাল সেলফ-নোট যুক্ত করুন
                </p>
              </div>
            </div>

            {/* Color Switcher */}
            <div className="flex items-center gap-2 bg-muted/40 p-1.5 rounded-xl border">
              <span className="text-xs font-semibold px-1 text-muted-foreground">হাইলাইটার কালার:</span>
              <button
                type="button"
                onClick={() => {
                  sfx.play("click");
                  setActiveColor("yellow");
                }}
                className={cn(
                  "flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition",
                  activeColor === "yellow"
                    ? "bg-amber-400/30 text-amber-900 dark:text-amber-200 ring-2 ring-amber-400"
                    : "hover:bg-muted"
                )}
              >
                <div className="h-3 w-3 rounded-full bg-amber-400" />
                <span>মৌলিক তথ্য</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sfx.play("click");
                  setActiveColor("green");
                }}
                className={cn(
                  "flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition",
                  activeColor === "green"
                    ? "bg-emerald-400/30 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-400"
                    : "hover:bg-muted"
                )}
              >
                <div className="h-3 w-3 rounded-full bg-emerald-400" />
                <span>বোর্ড স্পেশাল</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sfx.play("click");
                  setActiveColor("pink");
                }}
                className={cn(
                  "flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition",
                  activeColor === "pink"
                    ? "bg-rose-400/30 text-rose-900 dark:text-rose-200 ring-2 ring-rose-400"
                    : "hover:bg-muted"
                )}
              >
                <div className="h-3 w-3 rounded-full bg-rose-400" />
                <span>এডমিশন ট্র্যাপ</span>
              </button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content & Note Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Textbook Section (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          {CHAPTER_TEXT.map((section) => (
            <Card key={section.id} className="border shadow-2xs hover:border-primary/40 transition">
              <CardHeader className="p-4 sm:p-5 pb-2">
                <CardTitle className="text-base sm:text-lg font-bold text-foreground">
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-5 pt-1 space-y-3">
                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                  {section.content}
                </p>

                {/* Highlighted Callout */}
                <div
                  className={cn(
                    "rounded-xl border p-3 sm:p-4 text-xs sm:text-sm font-medium transition",
                    section.highlightType === "yellow" && "bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-200",
                    section.highlightType === "green" && "bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-200",
                    section.highlightType === "pink" && "bg-rose-500/10 border-rose-500/30 text-rose-950 dark:text-rose-200"
                  )}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <Badge variant="outline" className="text-2xs font-bold bg-background/50">
                      ⚡ {section.highlightLabel}
                    </Badge>
                  </div>
                  <p className="italic font-semibold">
                    &quot;{section.defaultHighlight}&quot;
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Sticky Notes & Revision Panel (1 col) */}
        <div className="space-y-4">
          <Card className="border shadow-xs">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <StickyNote className="h-4 w-4 text-primary" />
                  <span>আমার রিভিশন নোটবুক</span>
                </div>
                <Badge variant="secondary" className="text-2xs">
                  {highlights.length} টি সংরক্ষিত
                </Badge>
              </CardTitle>
            </CardHeader>

            <CardContent className="p-4 pt-2 space-y-3">
              {highlights.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border bg-muted/20 p-3 space-y-2 text-xs transition hover:border-primary/40"
                >
                  <div className="flex items-center justify-between">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-2xs font-bold",
                        item.type === "yellow" && "border-amber-400 text-amber-600 dark:text-amber-400",
                        item.type === "green" && "border-emerald-400 text-emerald-600 dark:text-emerald-400",
                        item.type === "pink" && "border-rose-400 text-rose-600 dark:text-rose-400"
                      )}
                    >
                      {item.label}
                    </Badge>
                  </div>

                  <p className="font-semibold text-foreground text-xs leading-snug">
                    {item.text}
                  </p>

                  {item.note && (
                    <div className="rounded-lg bg-card p-2 border text-2xs text-muted-foreground border-dashed">
                      <span className="font-bold text-primary">নোট: </span>
                      {item.note}
                    </div>
                  )}

                  {!item.note && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-2xs w-full justify-start text-primary"
                      onClick={() => setSelectedHighlightId(item.id)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      পার্সোনাল নোট যোগ করুন
                    </Button>
                  )}
                </div>
              ))}

              {/* Add Note Box */}
              {selectedHighlightId && (
                <div className="rounded-xl border bg-card p-3 space-y-2 shadow-xs">
                  <div className="text-2xs font-bold text-primary">নোট লিখুন:</div>
                  <textarea
                    rows={2}
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder="আপনার নিজস্ব শর্টকাট বা মনে রাখার কৌশল লিখুন..."
                    className="w-full rounded-lg border bg-background p-2 text-xs outline-none focus:border-primary"
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() => setSelectedHighlightId(null)}
                    >
                      বাতিল
                    </Button>
                    <Button
                      size="sm"
                      className="h-7 text-xs font-bold"
                      onClick={handleAddNote}
                    >
                      সংরক্ষণ
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
