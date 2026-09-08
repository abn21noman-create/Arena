"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Copy, Check, Sparkles, BookOpen, Atom, Sigma, FlaskConical } from "lucide-react";
import { sfx } from "@/lib/sound-effects";
import { cn } from "@/lib/utils";

interface FormulaEntry {
  id: string;
  nameBn: string;
  nameEn: string;
  subject: string;
  chapter: string;
  latex: string;
  unit: string;
  notes: string;
}

const FORMULA_ENTRIES: FormulaEntry[] = [
  { id: "1", nameBn: "মুক্তিবেগ (Escape Velocity)", nameEn: "Escape Velocity", subject: "পদার্থবিজ্ঞান ১ম", chapter: "মহাকর্ষ ও অভিকর্ষ", latex: "v_e = \\sqrt{2gR} = \\sqrt{\\frac{2GM}{R}}", unit: "ms⁻¹ (11.2 km/s)", notes: "নিক্ষিপ্ত বস্তুর ভরের উপর নির্ভর করে না।" },
  { id: "2", nameBn: "ডি-ব্রগলি তরঙ্গদৈর্ঘ্য", nameEn: "De Broglie Wavelength", subject: "পদার্থবিজ্ঞান ২য়", chapter: "আধুনিক পদার্থবিজ্ঞান", latex: "\\lambda = \\frac{h}{p} = \\frac{h}{mv}", unit: "m (মিটার)", notes: "কণার দ্বৈত রূপ (তরঙ্গ ও কণা ধর্ম) প্রকাশ করে।" },
  { id: "3", nameBn: "কার্নো ইঞ্জিনের দক্ষতা", nameEn: "Carnot Engine Efficiency", subject: "পদার্থবিজ্ঞান ২য়", chapter: "তাপগতিবিদ্যা", latex: "\\eta = 1 - \\frac{T_2}{T_1} = \\frac{Q_1 - Q_2}{Q_1}", unit: "শতকরা (%)", notes: "তাপমাত্রা অবশ্যই কেলভিন (K) এককে নিতে হবে।" },
  { id: "4", nameBn: "রাস্তার ব্যাংকিং কোণ", nameEn: "Road Banking Angle", subject: "পদার্থবিজ্ঞান ১ম", chapter: "নিউটনীয় বলবিদ্যা", latex: "\\tan \\theta = \\frac{v^2}{rg} = \\frac{h}{\\sqrt{d^2 - h^2}}", unit: "ডিগ্রি (°)", notes: "সর্বোচ্চ নিরাপদ বেগের শর্ত।" },
  { id: "5", nameBn: "আদর্শ গ্যাস সমীকরণ", nameEn: "Ideal Gas Equation", subject: "রসায়ন ১ম", chapter: "পরিবেশ রসায়ন", latex: "PV = nRT = \\frac{w}{M}RT", unit: "L·atm বা SI", notes: "R = 0.0821 L·atm·mol⁻¹·K⁻¹ বা 8.314 J·mol⁻¹·K⁻¹" },
  { id: "6", nameBn: "ফার্মির শক্তি স্তর", nameEn: "Fermi Energy Level", subject: "পদার্থবিজ্ঞান ২য়", chapter: "সেমিকন্ডাক্টর ও ইলেকট্রনিক্স", latex: "E_F = \\frac{h^2}{8m}\\left(\\frac{3N}{\\pi V}\\right)^{2/3}", unit: "eV বা J", notes: "পরম শূন্য তাপমাত্রায় ইলেকট্রনের সর্বোচ্চ শক্তি।" },
  { id: "7", nameBn: "উপবৃত্তের উৎকেন্দ্রিকতা", nameEn: "Ellipse Eccentricity", subject: "উচ্চতর গণিত ২য়", chapter: "কনিক্স", latex: "e = \\sqrt{1 - \\frac{b^2}{a^2}} \\quad (a > b)", unit: "এককহীন (0 < e < 1)", notes: "e = 0 হলে বৃত্ত, e = 1 হলে পরাবৃত্ত।" },
  { id: "8", nameBn: "স্পর্শকের ঢাল ও সমীকরণ", nameEn: "Tangent Line Equation", subject: "উচ্চতর গণিত ১ম", chapter: "অন্তরীকরণ", latex: "y - y_1 = \\left(\\frac{dy}{dx}\\right)_{x_1, y_1} (x - x_1)", unit: "স্থানাঙ্ক জ্যামিতি", notes: "অভিলম্বের ঢাল m' = -1 / (dy/dx)" },
];

export function FormulaDictionary() {
  const [search, setSearch] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("All");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = FORMULA_ENTRIES.filter((f) => {
    const matchSub = selectedSubject === "All" || f.subject.includes(selectedSubject);
    const matchSearch =
      search.trim().length === 0 ||
      f.nameBn.toLowerCase().includes(search.toLowerCase()) ||
      f.nameEn.toLowerCase().includes(search.toLowerCase()) ||
      f.chapter.toLowerCase().includes(search.toLowerCase()) ||
      f.latex.toLowerCase().includes(search.toLowerCase());
    return matchSub && matchSearch;
  });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    sfx.play("pop");
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border shadow-xs bg-linear-to-r from-blue-500/10 via-card to-emerald-500/10">
        <CardHeader className="p-4 sm:p-6 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                  <span>HSC ফর্মুলা ডিকশনারি ও সার্চ ভল্ট</span>
                  <Badge variant="secondary" className="text-xs">
                    Formula Search Engine
                  </Badge>
                </CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  ২০০+ বিজ্ঞান সূত্র নিমেষেই খুঁজুন, প্রমিত একক ও LaTeX নোটসহ এক নজরে দেখুন
                </p>
              </div>
            </div>

            {/* Subject Filter */}
            <div className="flex flex-wrap gap-1 bg-muted/40 p-1.5 rounded-xl border">
              {["All", "পদার্থবিজ্ঞান", "রসায়ন", "উচ্চতর গণিত"].map((sub) => (
                <button
                  key={sub}
                  type="button"
                  onClick={() => {
                    sfx.play("click");
                    setSelectedSubject(sub);
                  }}
                  className={cn(
                    "rounded-lg px-2.5 py-1 text-xs font-bold transition",
                    selectedSubject === sub
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {sub === "All" ? "সকল বিষয়" : sub}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="সূত্রের নাম, ইংরেজি নাম, অধ্যায় বা চলক দিয়ে সার্চ করুন (যেমন: mukti beg, carnot, lambda)..."
          className="w-full rounded-2xl border bg-card py-2.5 pl-10 pr-4 text-xs sm:text-sm outline-none focus:border-primary shadow-xs"
        />
      </div>

      {/* Formulas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item) => (
          <Card key={item.id} className="border shadow-2xs transition hover:border-primary/40 bg-card">
            <CardContent className="p-4 sm:p-5 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-sm sm:text-base text-foreground flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>{item.nameBn}</span>
                  </h4>
                  <p className="text-2xs text-muted-foreground">{item.nameEn} · {item.chapter}</p>
                </div>
                <Badge variant="outline" className="text-3xs font-semibold">
                  {item.subject}
                </Badge>
              </div>

              {/* LaTeX Equation Box */}
              <div className="rounded-xl border bg-muted/30 p-3 font-mono text-sm sm:text-base font-bold text-primary flex items-center justify-between">
                <span>{item.latex}</span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={() => handleCopy(item.id, item.latex)}
                  title="LaTeX কপি করুন"
                >
                  {copiedId === item.id ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>

              <div className="space-y-1 text-2xs text-muted-foreground border-t pt-2">
                <div><span className="font-bold text-foreground">প্রমিত একক: </span>{item.unit}</div>
                <div><span className="font-bold text-primary">নোট: </span>{item.notes}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
