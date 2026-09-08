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
import { Printer, CheckCircle2, Bookmark, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { sfx } from "@/lib/sound-effects";

export interface OMRQuestionState {
  index: number;
  selectedIndex?: number | null;
  isFlagged?: boolean;
}

interface OMRBubbleSheetProps {
  totalQuestions: number;
  currentIndex?: number;
  answers: Record<number, number | null | undefined>;
  flaggedQuestions?: Set<number>;
  onSelectOption: (questionIndex: number, optionIndex: number) => void;
  onNavigateToQuestion?: (questionIndex: number) => void;
  optionsCount?: number;
}

const BUBBLE_LABELS = ["ক", "খ", "গ", "ঘ"];
const BUBBLE_LABELS_EN = ["A", "B", "C", "D"];

export function OMRBubbleSheetGrid({
  totalQuestions,
  currentIndex,
  answers,
  flaggedQuestions,
  onSelectOption,
  onNavigateToQuestion,
  optionsCount = 4,
}: OMRBubbleSheetProps) {
  const answeredCount = Object.values(answers).filter((v) => v !== null && v !== undefined).length;
  const flaggedCount = flaggedQuestions ? flaggedQuestions.size : 0;
  const remainingCount = totalQuestions - answeredCount;

  return (
    <div className="space-y-4">
      {/* Header status bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border bg-muted/30 p-2.5 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-primary" />
            <span className="font-semibold">{answeredCount} উত্তর দেওয়া</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full border border-dashed border-amber-500 bg-amber-500/20" />
            <span>{flaggedCount} ফ্ল্যাগ করা</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full border border-muted-foreground/30 bg-muted" />
            <span className="text-muted-foreground">{remainingCount} বাকি</span>
          </div>
        </div>
        <Badge variant="outline" className="font-mono text-xs">
          মোট: {totalQuestions}
        </Badge>
      </div>

      {/* Grid of OMR questions */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: totalQuestions }).map((_, qIdx) => {
          const isCurrent = currentIndex === qIdx;
          const selectedOption = answers[qIdx];
          const isFlagged = flaggedQuestions?.has(qIdx);

          return (
            <div
              key={qIdx}
              className={cn(
                "flex items-center justify-between rounded-xl border p-2 text-xs transition-all",
                isCurrent
                  ? "border-primary bg-primary/5 shadow-xs ring-1 ring-primary"
                  : "border-border bg-card hover:border-primary/40",
                isFlagged && "border-amber-500/50 bg-amber-500/5"
              )}
            >
              {/* Question Number */}
              <button
                type="button"
                onClick={() => onNavigateToQuestion?.(qIdx)}
                className="flex items-center gap-1.5 font-semibold text-foreground/80 hover:text-primary"
              >
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-lg font-mono text-xs",
                    isCurrent
                      ? "bg-primary text-primary-foreground font-bold"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {qIdx + 1}
                </span>
                {isFlagged && <Bookmark className="h-3 w-3 fill-amber-500 text-amber-500" />}
              </button>

              {/* Bubbles A, B, C, D */}
              <div className="flex items-center gap-1.5">
                {Array.from({ length: optionsCount }).map((_, optIdx) => {
                  const isSelected = selectedOption === optIdx;

                  return (
                    <button
                      type="button"
                      key={optIdx}
                      onClick={() => {
                        sfx.play("click");
                        onSelectOption(qIdx, optIdx);
                      }}
                      className={cn(
                        "relative flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold transition-all duration-150 select-none",
                        isSelected
                          ? "border-primary bg-primary font-bold text-primary-foreground shadow-xs scale-105"
                          : "border-muted-foreground/30 bg-background text-muted-foreground hover:border-primary/60 hover:text-foreground"
                      )}
                      aria-label={`প্রশ্ন ${qIdx + 1}, অপশন ${BUBBLE_LABELS[optIdx]}`}
                    >
                      {BUBBLE_LABELS[optIdx]}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function OMRSheetDialog({
  open,
  onOpenChange,
  totalQuestions,
  currentIndex,
  answers,
  flaggedQuestions,
  onSelectOption,
  onNavigateToQuestion,
  optionsCount = 4,
}: OMRBubbleSheetProps & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] w-full max-w-2xl overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2 text-base font-bold sm:text-lg">
                <span>📝 ভার্চুয়াল ওএমআর (OMR) শিট</span>
              </DialogTitle>
              <DialogDescription className="text-xs">
                বাস্তব বোর্ড পরীক্ষার মতো বৃত্ত ভরাট করে অনুশীলন করুন
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <OMRBubbleSheetGrid
          totalQuestions={totalQuestions}
          currentIndex={currentIndex}
          answers={answers}
          flaggedQuestions={flaggedQuestions}
          onSelectOption={onSelectOption}
          onNavigateToQuestion={(idx) => {
            onNavigateToQuestion?.(idx);
            onOpenChange(false);
          }}
          optionsCount={optionsCount}
        />

        <div className="mt-4 flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
          <span>কীবোর্ড শর্টকাট: অপশন নির্বাচন করতে 1, 2, 3, 4 চাপুন</span>
          <Button
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            সম্পন্ন
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
