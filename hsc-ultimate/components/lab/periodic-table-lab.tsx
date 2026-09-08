"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Atom, Sparkles, Search, Layers, Zap, Info, Flame } from "lucide-react";
import { PERIODIC_ELEMENTS, type PeriodicElement } from "@/lib/periodic-table-data";
import { sfx } from "@/lib/sound-effects";
import { cn } from "@/lib/utils";

const BLOCK_COLORS: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  s: { bg: "bg-rose-500/15 dark:bg-rose-500/25", text: "text-rose-600 dark:text-rose-400", border: "border-rose-500/40", glow: "hover:border-rose-500" },
  p: { bg: "bg-amber-500/15 dark:bg-amber-500/25", text: "text-amber-600 dark:text-amber-400", border: "border-amber-500/40", glow: "hover:border-amber-500" },
  d: { bg: "bg-blue-500/15 dark:bg-blue-500/25", text: "text-blue-600 dark:text-blue-400", border: "border-blue-500/40", glow: "hover:border-blue-500" },
  f: { bg: "bg-emerald-500/15 dark:bg-emerald-500/25", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-500/40", glow: "hover:border-emerald-500" },
};

export function PeriodicTableLab() {
  const [selectedBlock, setSelectedBlock] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeElement, setActiveElement] = useState<PeriodicElement | null>(null);

  const filteredElements = PERIODIC_ELEMENTS.filter((el) => {
    const matchBlock = selectedBlock === "All" || el.block === selectedBlock;
    const matchSearch =
      searchQuery.trim().length === 0 ||
      el.nameBn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      el.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      el.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      el.number.toString() === searchQuery.trim();
    return matchBlock && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <Card className="border shadow-xs bg-linear-to-r from-emerald-500/10 via-card to-blue-500/10">
        <CardHeader className="p-4 sm:p-6 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Atom className="h-6 w-6 animate-spin-slow" />
              </div>
              <div>
                <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                  <span>ইন্টারঅ্যাক্টিভ পর্যায় সারণি ও কেমিস্ট্রি ল্যাব</span>
                  <Badge variant="secondary" className="text-xs">
                    রসায়ন ১ম পত্র: ৩য় অধ্যায়
                  </Badge>
                </CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  ইলেকট্রন বিন্যাস, আয়নীকরণ শক্তি, তড়িৎ ঋণাত্মকতা ও HSC স্পেশাল তথ্য এক নজরে
                </p>
              </div>
            </div>

            {/* Block Filter Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 bg-muted/40 p-1.5 rounded-xl border">
              {["All", "s", "p", "d"].map((blk) => (
                <button
                  type="button"
                  key={blk}
                  onClick={() => {
                    sfx.play("click");
                    setSelectedBlock(blk);
                  }}
                  className={cn(
                    "rounded-lg px-3 py-1 text-xs font-bold transition",
                    selectedBlock === blk
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {blk === "All" ? "সকল ব্লক" : `${blk}-ব্লক`}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Search Bar & Stats */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="মৌলের নাম, প্রতীক বা পারমাণবিক সংখ্যা..."
            className="w-full rounded-xl border bg-card py-2 pl-9 pr-3 text-xs sm:text-sm outline-none focus:border-primary shadow-2xs"
          />
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-rose-500/40 border border-rose-500" />
            <span>s-ব্লক</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-amber-500/40 border border-amber-500" />
            <span>p-ব্লক</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-blue-500/40 border border-blue-500" />
            <span>d-ব্লক</span>
          </div>
        </div>
      </div>

      {/* Element Interactive Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
        {filteredElements.map((el) => {
          const styling = BLOCK_COLORS[el.block] || BLOCK_COLORS.s;

          return (
            <button
              key={el.number}
              type="button"
              onClick={() => {
                sfx.play("pop");
                setActiveElement(el);
              }}
              className={cn(
                "group relative rounded-2xl border p-3.5 text-left transition-all duration-200 hover:scale-[1.03] shadow-xs cursor-pointer",
                styling.bg,
                styling.border,
                styling.glow
              )}
            >
              <div className="flex items-start justify-between">
                <span className="font-mono text-2xs font-bold text-muted-foreground">
                  {el.number}
                </span>
                <Badge variant="outline" className={cn("text-3xs px-1.5 py-0 font-bold", styling.text)}>
                  {el.block}-block
                </Badge>
              </div>

              <div className="my-1.5 text-center">
                <div className={cn("text-2xl sm:text-3xl font-black tracking-tight", styling.text)}>
                  {el.symbol}
                </div>
                <div className="text-xs font-bold text-foreground truncate mt-0.5">
                  {el.nameBn}
                </div>
                <div className="text-2xs text-muted-foreground font-mono truncate">
                  {el.mass.toFixed(2)}
                </div>
              </div>

              <div className="mt-2 text-center">
                <span className="inline-block rounded-md bg-background/60 px-1.5 py-0.5 font-mono text-3xs font-semibold text-muted-foreground">
                  {el.electronConfig}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Deep Element Detail Modal */}
      <Dialog open={!!activeElement} onOpenChange={(open) => !open && setActiveElement(null)}>
        {activeElement && (
          <DialogContent className="max-w-lg p-5 sm:p-6">
            <DialogHeader className="pb-3 border-b">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "flex h-14 w-14 items-center justify-center rounded-2xl border text-2xl font-black shadow-sm",
                  BLOCK_COLORS[activeElement.block]?.bg,
                  BLOCK_COLORS[activeElement.block]?.text,
                  BLOCK_COLORS[activeElement.block]?.border
                )}>
                  {activeElement.symbol}
                </div>
                <div>
                  <DialogTitle className="text-lg sm:text-xl font-bold flex items-center gap-2">
                    <span>{activeElement.nameBn} ({activeElement.nameEn})</span>
                    <Badge variant="secondary" className="text-xs font-mono">
                      #{activeElement.number}
                    </Badge>
                  </DialogTitle>
                  <p className="text-xs text-muted-foreground font-mono">
                    পর্যায়: {activeElement.period} · গ্রুপ: {activeElement.group} · {activeElement.block}-ব্লক
                  </p>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4 pt-3 text-xs sm:text-sm">
              {/* Properties Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="rounded-xl border bg-muted/20 p-2.5">
                  <div className="text-2xs text-muted-foreground">পারমাণবিক ভর</div>
                  <div className="font-mono font-bold text-foreground text-sm">{activeElement.mass} u</div>
                </div>
                <div className="rounded-xl border bg-muted/20 p-2.5">
                  <div className="text-2xs text-muted-foreground">ইলেকট্রন বিন্যাস</div>
                  <div className="font-mono font-bold text-foreground text-sm">{activeElement.electronConfig}</div>
                </div>
                {activeElement.electronegativity && (
                  <div className="rounded-xl border bg-muted/20 p-2.5">
                    <div className="text-2xs text-muted-foreground">তড়িৎ ঋণাত্মকতা (Pauling)</div>
                    <div className="font-mono font-bold text-foreground text-sm">{activeElement.electronegativity}</div>
                  </div>
                )}
                {activeElement.ionizationEnergy && (
                  <div className="rounded-xl border bg-muted/20 p-2.5">
                    <div className="text-2xs text-muted-foreground">১ম আয়নীকরণ শক্তি</div>
                    <div className="font-mono font-bold text-foreground text-sm">{activeElement.ionizationEnergy} kJ/mol</div>
                  </div>
                )}
                {activeElement.oxidationStates && (
                  <div className="rounded-xl border bg-muted/20 p-2.5 col-span-2">
                    <div className="text-2xs text-muted-foreground">সাধারণ জারণ অবস্থা</div>
                    <div className="font-mono font-bold text-foreground text-sm">{activeElement.oxidationStates}</div>
                  </div>
                )}
              </div>

              {/* HSC Special Fact / Board Trap */}
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 space-y-1">
                <div className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5 text-xs">
                  <Sparkles className="h-4 w-4 fill-current" />
                  <span>HSC ও এডমিশন স্পেশাল ফ্যাক্ট:</span>
                </div>
                <p className="text-xs text-foreground/90 leading-relaxed font-medium">
                  {activeElement.hscFact}
                </p>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
