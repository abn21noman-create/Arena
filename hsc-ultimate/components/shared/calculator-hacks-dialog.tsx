"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calculator, Sparkles, Search, BookOpen, Lightbulb, Zap } from "lucide-react";
import { CALCULATOR_HACKS, type CalculatorHackItem } from "@/lib/calculator-hacks-data";
import { cn } from "@/lib/utils";
import { sfx } from "@/lib/sound-effects";

export function CalculatorHacksDialog() {
  const [open, setOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredHacks = CALCULATOR_HACKS.filter((hack) => {
    const matchSubject =
      selectedSubject === "All" || hack.subject === selectedSubject;
    const matchSearch =
      searchQuery.trim().length === 0 ||
      hack.titleBangla.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hack.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hack.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSubject && matchSearch;
  });

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="h-8 gap-1.5 text-xs font-semibold"
        onClick={() => {
          sfx.play("click");
          setOpen(true);
        }}
        title="সায়েন্টিফিক ক্যালকুলেটর শর্টকাট ট্রিকস"
      >
        <Zap className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
        <span>ক্যালকুলেটর হ্যাকস</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[92dvh] w-full max-w-2xl overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="pb-3 border-b">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Calculator className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base sm:text-lg font-bold flex items-center gap-1.5">
                  <span>CASIO fx-991EX / 991ES মাস্টার হ্যাকস</span>
                  <Badge variant="secondary" className="text-xs">
                    HSC Science
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-xs">
                  জটিল সমীকরণ ও ম্যাথ ক্যালকুলেটরে ৫-১০ সেকেন্ডে সমাধান করার স্টেপ-বাই-স্টেপ গাইড
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Search & Subject Tabs */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-1">
                {[
                  { id: "All", label: "সকল বিষয়" },
                  { id: "Higher Math", label: "উচ্চতর গণিত" },
                  { id: "Physics", label: "পদার্থবিজ্ঞান" },
                  { id: "Chemistry", label: "রসায়ন" },
                  { id: "ICT", label: "আইসিটি" },
                ].map((tab) => (
                  <button
                    type="button"
                    key={tab.id}
                    onClick={() => {
                      sfx.play("click");
                      setSelectedSubject(tab.id);
                    }}
                    className={cn(
                      "rounded-lg px-2.5 py-1 text-xs font-medium transition",
                      selectedSubject === tab.id
                        ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                        : "bg-muted/40 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-48">
                <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="হ্যাকস খুঁজুন..."
                  className="w-full rounded-lg border bg-background py-1.5 pl-8 pr-2.5 text-xs outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* List of Hacks */}
            <div className="space-y-3 pt-1">
              {filteredHacks.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border bg-card p-3.5 shadow-2xs space-y-2.5 transition hover:border-primary/40"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="font-bold text-xs sm:text-sm text-foreground flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                      {item.titleBangla}
                    </h4>
                    <Badge variant="outline" className="text-xs">
                      {item.category}
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>

                  {/* Keystroke Sequence Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 rounded-lg bg-muted/40 p-2 text-xs">
                    <span className="font-semibold text-primary mr-1">কি-সিকোয়েন্স:</span>
                    {item.keySequence.map((key, idx) => (
                      <div key={idx} className="flex items-center gap-1">
                        <kbd className="inline-flex min-h-6 items-center justify-center rounded-md border bg-card px-2 font-mono text-xs font-bold text-foreground shadow-xs">
                          {key}
                        </kbd>
                        {idx < item.keySequence.length - 1 && (
                          <span className="text-muted-foreground font-bold">→</span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Example & Tip */}
                  <div className="space-y-1 text-xs border-t pt-2">
                    <p className="text-foreground">
                      <span className="font-semibold text-primary">উদাহরণ: </span>
                      {item.example}
                    </p>
                    <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
                      <Lightbulb className="h-3 w-3 text-amber-500 shrink-0" />
                      <span>{item.tip}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
