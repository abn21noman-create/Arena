"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Grid, Sparkles, RotateCcw, CheckCircle2 } from "lucide-react";
import { sfx } from "@/lib/sound-effects";
import { cn } from "@/lib/utils";

export function MatrixSolverLab() {
  // 3x3 Matrix A
  const [matrix, setMatrix] = useState<number[][]>([
    [1, 2, 3],
    [0, 1, 4],
    [5, 6, 0],
  ]);

  const handleChange = (r: number, c: number, val: string) => {
    const num = Number(val) || 0;
    setMatrix((prev) => {
      const next = prev.map((row) => [...row]);
      next[r][c] = num;
      return next;
    });
  };

  // Determinant calculation of 3x3
  const [
    [a, b, c],
    [d, e, f],
    [g, h, i],
  ] = matrix;

  const det = a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
  const isSingular = Math.abs(det) < 0.0001;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border shadow-xs bg-linear-to-r from-purple-500/10 via-card to-blue-500/10">
        <CardHeader className="p-4 sm:p-6 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <Grid className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                  <span>ম্যাট্রিক্স ও নির্ণায়ক সলভার স্টুডিও</span>
                  <Badge variant="secondary" className="text-xs">
                    উচ্চতর গণিত ১ম পত্র: ১ম অধ্যায়
                  </Badge>
                </CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  ৩×৩ ম্যাট্রিক্সের নির্ণায়ক, ইনভার্স ও ক্র্যামারের সূত্রের স্টেপ-বাই-স্টেপ সমাধান
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Matrix Grid Input (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <Card className="border shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="font-bold text-sm">৩×৩ ম্যাট্রিক্স A এর ভুক্তি ইনপুট:</span>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                onClick={() => {
                  sfx.play("click");
                  setMatrix([
                    [1, 2, 3],
                    [0, 1, 4],
                    [5, 6, 0],
                  ]);
                }}
              >
                রিসেট
              </Button>
            </div>

            {/* Visual 3x3 Grid */}
            <div className="p-4 bg-muted/20 rounded-2xl border flex flex-col items-center justify-center">
              <div className="text-2xs font-mono font-bold text-muted-foreground mb-3">
                Matrix A [3×3]:
              </div>
              <div className="grid grid-cols-3 gap-2.5 max-w-xs">
                {matrix.map((row, rIdx) =>
                  row.map((val, cIdx) => (
                    <input
                      key={`${rIdx}-${cIdx}`}
                      type="number"
                      value={val}
                      onChange={(e) => handleChange(rIdx, cIdx, e.target.value)}
                      className="w-16 h-12 text-center font-mono font-bold text-base rounded-xl border bg-card focus:border-primary outline-none shadow-xs"
                    />
                  ))
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Step-by-Step Determinant Expansion (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <Card className="border shadow-xs p-5 space-y-4">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-500" />
              <span>নির্ণায়ক মান ও বিস্তার (Cofactor Expansion)</span>
            </CardTitle>

            <div className="space-y-3 font-mono text-xs">
              <div className="rounded-xl border bg-primary/5 p-4 text-center space-y-1">
                <div className="text-2xs text-muted-foreground uppercase font-bold">নির্ণায়কের মান det(A) বা |A|</div>
                <div className="text-4xl font-black text-primary">{det}</div>
                <Badge variant="outline" className={cn("text-3xs font-sans mt-1", isSingular ? "text-rose-500" : "text-emerald-500")}>
                  {isSingular ? "ব্যতিক্রমী ম্যাট্রিক্স (Inverse নেই)" : "অব্যতিক্রমী ম্যাট্রিক্স (Inverse বিদ্যমান)"}
                </Badge>
              </div>

              {/* Step-by-step row 1 expansion */}
              <div className="rounded-xl border bg-card p-3.5 space-y-2 text-2xs">
                <div className="font-bold font-sans text-foreground">১ম সারির সাপেক্ষে বিস্তার:</div>
                <div className="text-muted-foreground">
                  |A| = {a}({e}×{i} - {f}×{h}) - {b}({d}×{i} - {f}×{g}) + {c}({d}×{h} - {e}×{g})
                </div>
                <div className="text-muted-foreground">
                  |A| = {a}({e * i - f * h}) - {b}({d * i - f * g}) + {c}({d * h - e * g})
                </div>
                <div className="font-bold text-primary">
                  |A| = {a * (e * i - f * h)} - {b * (d * i - f * g)} + {c * (d * h - e * g)} = {det}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
