"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Keyboard, Zap } from "lucide-react";

export const OPEN_KEYBOARD_SHORTCUTS_EVENT = "hsc-ultimate:open-shortcuts-guide";

export function openKeyboardShortcutsGuide() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(OPEN_KEYBOARD_SHORTCUTS_EVENT));
  }
}

interface ShortcutItem {
  keys: string[];
  descriptionBangla: string;
  category: "MCQ / Exam" | "General";
}

const SHORTCUTS: ShortcutItem[] = [
  {
    keys: ["1", "2", "3", "4"],
    descriptionBangla: "MCQ অপশন নির্বাচন করুন (১ম, ২য়, ৩য় বা ৪র্থ)",
    category: "MCQ / Exam",
  },
  {
    keys: ["A", "B", "C", "D"],
    descriptionBangla: "MCQ অপশন ক, খ, গ, ঘ সিলেক্ট করুন",
    category: "MCQ / Exam",
  },
  {
    keys: ["Enter"],
    descriptionBangla: "উত্তর জমা দিন / নিশ্চিত করুন",
    category: "MCQ / Exam",
  },
  {
    keys: ["Space", "→"],
    descriptionBangla: "পরের প্রশ্নে যান (Next Question)",
    category: "MCQ / Exam",
  },
  {
    keys: ["←"],
    descriptionBangla: "আগের প্রশ্নে ফিরে যান (Previous Question)",
    category: "MCQ / Exam",
  },
  {
    keys: ["M"],
    descriptionBangla: "রিভিউর জন্য ফ্ল্যাগ/মার্ক করুন (Mark for Review)",
    category: "MCQ / Exam",
  },
  {
    keys: ["O"],
    descriptionBangla: "ভার্চুয়াল ওএমআর (OMR) শিট ভিউ চালু বা বন্ধ করুন",
    category: "MCQ / Exam",
  },
  {
    keys: ["Ctrl", "K"],
    descriptionBangla: "গ্লোবাল স্পটলাইট সার্চ ও কমান্ড প্যালেট খুলুন",
    category: "General",
  },
  {
    keys: ["?"],
    descriptionBangla: "এই কীবোর্ড শর্টকাট গাইড দেখুন",
    category: "General",
  },
];

export function KeyboardShortcutsDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handleOpen() {
      setOpen(true);
    }
    window.addEventListener(OPEN_KEYBOARD_SHORTCUTS_EVENT, handleOpen);
    return () => window.removeEventListener(OPEN_KEYBOARD_SHORTCUTS_EVENT, handleOpen);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md p-5">
        <DialogHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Keyboard className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">
                কীবোর্ড শর্টকাট গাইড
              </DialogTitle>
              <DialogDescription className="text-xs">
                দ্রুত ও দক্ষতার সাথে প্র্যাকটিস ও পরীক্ষা দেওয়ার শর্টকাট
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
            <Zap className="h-3.5 w-3.5" />
            <span>প্র্যাকটিস ও এক্সাম শর্টকাট</span>
          </div>

          <div className="divide-y divide-border/60 rounded-xl border bg-muted/20">
            {SHORTCUTS.map((s, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-3 px-3.5 py-2.5 text-xs"
              >
                <span className="text-foreground/90">{s.descriptionBangla}</span>
                <div className="flex items-center gap-1 shrink-0">
                  {s.keys.map((k, idx) => (
                    <kbd
                      key={idx}
                      className="inline-flex min-h-6 min-w-6 items-center justify-center rounded-md border bg-card px-1.5 font-mono text-xs font-semibold text-foreground shadow-xs"
                    >
                      {k}
                    </kbd>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-muted-foreground">
            টিপ: যেকোনো প্র্যাকটিসে সরাসরি 1, 2, 3, 4 চেপে অপশন বেছে নিতে পারেন
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
