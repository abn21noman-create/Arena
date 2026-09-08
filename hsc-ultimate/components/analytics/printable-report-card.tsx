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
import { Printer, Download, Award, CheckCircle2, FileText } from "lucide-react";
import { sfx } from "@/lib/sound-effects";

interface PrintableReportCardProps {
  userName?: string;
  userEmail?: string;
  examBatch?: string;
  predictedGpa?: string;
  totalSolved?: number;
  overallAccuracy?: number;
}

export function PrintableReportCardDialog({
  userName = "HSC পরীক্ষার্থী",
  userEmail = "student@hsc-ultimate.app",
  examBatch = "HSC 2026",
  predictedGpa = "5.00",
  totalSolved = 840,
  overallAccuracy = 86,
}: PrintableReportCardProps) {
  const [open, setOpen] = useState(false);

  const handlePrint = () => {
    sfx.play("click");
    window.print();
  };

  const currentDate = new Date().toLocaleDateString("bn-BD", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-2 text-xs"
        onClick={() => {
          sfx.play("click");
          setOpen(true);
        }}
      >
        <Printer className="h-3.5 w-3.5" />
        <span>রিপোর্ট কার্ড প্রিন্ট / PDF</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[92dvh] w-full max-w-2xl overflow-y-auto p-4 sm:p-6 print:p-0 print:border-none print:shadow-none">
          <DialogHeader className="print:hidden pb-2">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-base font-bold">
                  HSC একাডেমিক প্রগ্রেস রিপোর্ট কার্ড
                </DialogTitle>
                <DialogDescription className="text-xs">
                  অভিভাবক বা শিক্ষকের মূল্যায়নের জন্য প্রিন্ট অথবা PDF ফরম্যাটে সংরক্ষণ করুন
                </DialogDescription>
              </div>
              <Button size="sm" onClick={handlePrint} className="gap-1.5">
                <Printer className="h-3.5 w-3.5" />
                প্রিন্ট করুন
              </Button>
            </div>
          </DialogHeader>

          {/* Actual Printable Document Container */}
          <div className="rounded-2xl border bg-card p-6 shadow-xs print:border-none print:shadow-none print:p-2">
            {/* Header / Seal */}
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h2 className="text-xl font-extrabold tracking-tight text-primary">
                  HSC ULTIMATE ACADEMIC RECORD
                </h2>
                <p className="text-xs text-muted-foreground">
                  ন্যাশনাল কারিকুলাম ও পাঠ্যপুস্তক বোর্ড (NCTB) ভিত্তিক সার্বিক মূল্যায়ন
                </p>
              </div>
              <div className="text-right">
                <Badge variant="outline" className="font-mono text-xs font-bold text-primary">
                  {examBatch}
                </Badge>
                <p className="mt-1 text-xs text-muted-foreground">{currentDate}</p>
              </div>
            </div>

            {/* Student Info Box */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-xl bg-muted/30 p-3 text-xs">
              <div>
                <span className="text-muted-foreground block text-xs">শিক্ষার্থীর নাম</span>
                <span className="font-bold text-foreground">{userName}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">ইমেইল / আইডি</span>
                <span className="font-mono text-foreground truncate block">{userEmail}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">অনুশীলিত প্রশ্ন</span>
                <span className="font-mono font-bold text-foreground">{totalSolved} টি</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">অনুমিত GPA</span>
                <span className="font-mono font-extrabold text-primary text-sm">{predictedGpa}</span>
              </div>
            </div>

            {/* Subject Breakdown Table */}
            <div className="mt-5 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                বিষয়ভিত্তিক পারফরম্যান্স মেট্রিক্স
              </h3>
              <div className="overflow-hidden rounded-xl border">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/50 text-muted-foreground font-semibold border-b">
                    <tr>
                      <th className="p-2.5">বিষয়</th>
                      <th className="p-2.5">সমাধানকৃত</th>
                      <th className="p-2.5">সঠিকতার হার</th>
                      <th className="p-2.5">গ্রেড স্ট্যাটাস</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    <tr>
                      <td className="p-2.5 font-medium">পদার্থবিজ্ঞান (১ম ও ২য়)</td>
                      <td className="p-2.5 font-mono">২৫৫ টি</td>
                      <td className="p-2.5 font-mono">৭৬%</td>
                      <td className="p-2.5 text-emerald-600 font-bold">A+ (প্রত্যাশিত)</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium">রসায়ন (১ম ও ২য়)</td>
                      <td className="p-2.5 font-mono">৩০৫ টি</td>
                      <td className="p-2.5 font-mono">৮৪%</td>
                      <td className="p-2.5 text-emerald-600 font-bold">A+ (প্রত্যাশিত)</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium">উচ্চতর গণিত (১ম ও ২য়)</td>
                      <td className="p-2.5 font-mono">৩২০ টি</td>
                      <td className="p-2.5 font-mono">৭৮%</td>
                      <td className="p-2.5 text-emerald-600 font-bold">A+ (প্রত্যাশিত)</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium">জীববিজ্ঞান ও আইসিটি</td>
                      <td className="p-2.5 font-mono">৩৪০ টি</td>
                      <td className="p-2.5 font-mono">৮৬%</td>
                      <td className="p-2.5 text-emerald-600 font-bold">A+ (প্রত্যাশিত)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recommendation & Remarks */}
            <div className="mt-5 rounded-xl border border-primary/20 bg-primary/5 p-3.5 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-primary">
                <Award className="h-4 w-4" />
                <span>এআই অ্যাকাডেমিক সুপারিশ ও পর্যালোচনা</span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                শিক্ষার্থী পদার্থবিজ্ঞান ও গণিতে ধারাবাহিক উন্নতি প্রদর্শন করেছে। রসায়ন ২য় পত্রের
                জৈব রসায়ন এবং ফিজিক্সের তাপগতিবিদ্যা অধ্যায়ে অতিরিক্ত মডেল টেস্ট অনুশীলনের
                পরামর্শ প্রদান করা হচ্ছে।
              </p>
            </div>

            {/* Verification Footer */}
            <div className="mt-6 pt-4 border-t flex items-center justify-between text-xs text-muted-foreground">
              <span>HSC Ultimate Digital Certificate System</span>
              <span>Generated on: {new Date().toISOString().split("T")[0]}</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
