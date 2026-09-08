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
import { Printer, Download, Layers, Scissors } from "lucide-react";
import { sfx } from "@/lib/sound-effects";

export interface PrintableFlashcard {
  id: string;
  front: string;
  back: string;
}

interface PrintableFlashcardsDialogProps {
  deckTitle: string;
  cards: PrintableFlashcard[];
}

export function PrintableFlashcardsDialog({
  deckTitle,
  cards,
}: PrintableFlashcardsDialogProps) {
  const [open, setOpen] = useState(false);

  const handlePrint = () => {
    sfx.play("click");
    window.print();
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="h-8 gap-1.5 text-xs"
        onClick={() => {
          sfx.play("click");
          setOpen(true);
        }}
      >
        <Printer className="h-3.5 w-3.5 text-primary" />
        <span>প্রিন্টযোগ্য ফ্ল্যাশকার্ড শিট</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[92dvh] w-full max-w-3xl overflow-y-auto p-4 sm:p-6 print:p-0 print:border-none print:shadow-none">
          <DialogHeader className="print:hidden pb-3">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="flex items-center gap-2 text-base font-bold">
                  <Scissors className="h-4 w-4 text-primary" />
                  <span>{deckTitle} — প্রিন্টযোগ্য ফ্ল্যাশকার্ড শিট</span>
                </DialogTitle>
                <DialogDescription className="text-xs">
                  A4 সাইজে প্রিন্ট করে কাটার দাগ বরাবর কেটে পকেট রিভিশন কার্ড হিসেবে ব্যবহার করুন
                </DialogDescription>
              </div>
              <Button size="sm" onClick={handlePrint} className="gap-1.5">
                <Printer className="h-3.5 w-3.5" />
                প্রিন্ট করুন
              </Button>
            </div>
          </DialogHeader>

          {/* Printable Flashcards Grid */}
          <div className="space-y-4 print:space-y-2">
            <div className="border-b pb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-bold text-foreground">{deckTitle}</span>
              <span>মোট {cards.length}টি কার্ড (Front & Back)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 print:grid-cols-2 print:gap-2">
              {cards.map((c, i) => (
                <div
                  key={c.id || i}
                  className="rounded-xl border-2 border-dashed border-muted-foreground/30 p-3 bg-card print:border-black print:p-2.5 flex flex-col justify-between min-h-[140px]"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span className="font-bold font-mono text-primary">কার্ড #{i + 1}</span>
                      <span className="text-xs">প্রশ্ন (Front)</span>
                    </div>
                    <p className="text-xs font-semibold text-foreground whitespace-pre-wrap leading-relaxed">
                      {c.front}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-dashed">
                    <span className="text-xs text-muted-foreground block mb-0.5">উত্তর (Back):</span>
                    <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                      {c.back}
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
