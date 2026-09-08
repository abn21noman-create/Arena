"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  GitCompare,
  Sparkles,
  Search,
  CheckCircle2,
  BookOpen,
} from "lucide-react";
import { sfx } from "@/lib/sound-effects";
import { cn } from "@/lib/utils";

interface PhylumData {
  phylum: string;
  banglaName: string;
  germLayers: "দ্বিস্তরী" | "ত্রিস্তরী" | "স্তরবিহীন";
  coelom: "অসিলোমেট" | "সিউডোসিলোমেট" | "ইউসিলোমেট";
  symmetry: "দ্বিপার্শ্বীয়" | "অরীয়" | "অপ্রতিসম";
  specialOrgan: string;
  example: string;
}

const PHYLA_MATRIX: PhylumData[] = [
  { phylum: "Porifera", banglaName: "পরিফেরা (ছিদ্রাল প্রাণী)", germLayers: "স্তরবিহীন", coelom: "অসিলোমেট", symmetry: "অপ্রতিসম", specialOrgan: "অস্টিয়া, অসকুলাম ও স্পিকিউল", example: "Spongilla (স্পঞ্জ)" },
  { phylum: "Cnidaria", banglaName: "নিডারিয়া", germLayers: "দ্বিস্তরী", coelom: "অসিলোমেট", symmetry: "অরীয়", specialOrgan: "নিডোসাইট ও নেমাটোসিস্ট", example: "Hydra (হাইড্রা)" },
  { phylum: "Platyhelminthes", banglaName: "প্লাটিহেলমিন্থিস (চ্যাপ্টাকৃমি)", germLayers: "ত্রিস্তরী", coelom: "অসিলোমেট", symmetry: "দ্বিপার্শ্বীয়", specialOrgan: "শিখা কোষ (Flame Cell - রেচন)", example: "Fasciola hepatica (যকৃৎকৃমি)" },
  { phylum: "Nematoda", banglaName: "নেমাটোডা (গোলকৃমি)", germLayers: "ত্রিস্তরী", coelom: "সিউডোসিলোমেট", symmetry: "দ্বিপার্শ্বীয়", specialOrgan: "নলাকার পৌষ্টিকনালি", example: "Ascaris lumbricoides" },
  { phylum: "Annelida", banglaName: "অ্যানিলিডা (অঙ্গুরীমাল)", germLayers: "ত্রিস্তরী", coelom: "ইউসিলোমেট", symmetry: "দ্বিপার্শ্বীয়", specialOrgan: "নেফ্রিডিয়া (রেচন) ও সিটি", example: "Metaphire posthuma (কেঁচো)" },
  { phylum: "Arthropoda", banglaName: "আর্থ্রোপোডা (সন্ধিপদী)", germLayers: "ত্রিস্তরী", coelom: "ইউসিলোমেট", symmetry: "দ্বিপার্শ্বীয়", specialOrgan: "হিমোসিল ও ম্যালপিজিয়ান নালিকা", example: "Periplaneta americana (তেলাপোকা)" },
  { phylum: "Mollusca", banglaName: "মলাস্কা (কম্বোজ)", germLayers: "ত্রিস্তরী", coelom: "ইউসিলোমেট", symmetry: "দ্বিপার্শ্বীয়", specialOrgan: "ম্যান্টল পর্দা ও রেডুলা (রেতিজিহ্বা)", example: "Pila globosa (আপেল শামুক)" },
  { phylum: "Echinodermata", banglaName: "একাইনোডার্মাটা (কণ্টকত্বকী)", germLayers: "ত্রিস্তরী", coelom: "ইউসিলোমেট", symmetry: "অরীয় (পূর্ণাঙ্গ)", specialOrgan: "পানি সংবহনতন্ত্র ও নালিকা পদ", example: "Asterias (তারা মাছ)" },
  { phylum: "Chordata", banglaName: "কর্ডাটা", germLayers: "ত্রিস্তরী", coelom: "ইউসিলোমেট", symmetry: "দ্বিপার্শ্বীয়", specialOrgan: "নটোকর্ড, নার্ভকর্ড ও গলবিলীয় ফুলকারন্ধ্র", example: "Homo sapiens (মানুষ)" },
];

export function ZoologyAnatomyMatrix() {
  const [filterCoelom, setFilterCoelom] = useState<string>("All");

  const filtered = filterCoelom === "All"
    ? PHYLA_MATRIX
    : PHYLA_MATRIX.filter((p) => p.coelom === filterCoelom);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border shadow-xs bg-linear-to-r from-emerald-500/10 via-card to-teal-500/10">
        <CardHeader className="p-4 sm:p-6 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <GitCompare className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                  <span>প্রাণিবিজ্ঞান ৯টি পর্বের তুলনামূলক অ্যানাটমি ম্যাট্রিক্স</span>
                  <Badge variant="secondary" className="text-xs">
                    জীববিজ্ঞান ২য় পত্র: ১ম অধ্যায়
                  </Badge>
                </CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  সিলোম, ভ্রূণস্তর, প্রতিসাম্য ও বিশেষ রেচন/সংবহন অঙ্গের তুলনামূলক সুপার-চার্ট
                </p>
              </div>
            </div>

            {/* Filter */}
            <div className="flex gap-1.5 bg-muted/40 p-1.5 rounded-xl border">
              {["All", "অসিলোমেট", "সিউডোসিলোমেট", "ইউসিলোমেট"].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    sfx.play("click");
                    setFilterCoelom(c);
                  }}
                  className={cn(
                    "rounded-lg px-2.5 py-1 text-xs font-bold transition",
                    filterCoelom === c ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground"
                  )}
                >
                  {c === "All" ? "সকল পর্ব" : c}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Table */}
      <Card className="border shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b bg-muted/40 font-bold text-muted-foreground">
                <th className="p-3 pl-4">পর্ব (Phylum)</th>
                <th className="p-3">ভ্রূণস্তর</th>
                <th className="p-3">সিলোম</th>
                <th className="p-3">প্রতিসাম্য</th>
                <th className="p-3">অনন্য বৈশিষ্ট্য / অঙ্গ</th>
                <th className="p-3 pr-4">উদাহরণ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filtered.map((item) => (
                <tr key={item.phylum} className="hover:bg-muted/10 transition">
                  <td className="p-3 pl-4 font-bold text-foreground">
                    <div>{item.phylum}</div>
                    <div className="text-3xs text-muted-foreground font-normal">{item.banglaName}</div>
                  </td>
                  <td className="p-3">
                    <Badge variant="outline" className="text-3xs">
                      {item.germLayers}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <Badge
                      className={cn(
                        "text-3xs font-bold",
                        item.coelom === "অসিলোমেট" && "bg-slate-700 text-white",
                        item.coelom === "সিউডোসিলোমেট" && "bg-amber-600 text-white",
                        item.coelom === "ইউসিলোমেট" && "bg-emerald-600 text-white"
                      )}
                    >
                      {item.coelom}
                    </Badge>
                  </td>
                  <td className="p-3 text-muted-foreground font-medium">
                    {item.symmetry}
                  </td>
                  <td className="p-3 font-semibold text-primary">
                    {item.specialOrgan}
                  </td>
                  <td className="p-3 pr-4 font-mono text-2xs italic text-muted-foreground">
                    {item.example}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
