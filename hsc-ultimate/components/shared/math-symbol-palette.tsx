"use client";

import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, Sparkles, Atom, Pi, Plus } from "lucide-react";
import { sfx } from "@/lib/sound-effects";
import { toast } from "sonner";

interface MathSymbolPaletteProps {
  onInsert: (symbol: string) => void;
  className?: string;
  triggerLabel?: string;
}

interface SymbolGroup {
  category: string;
  symbols: Array<{ display: string; insert: string; name: string }>;
}

const SYMBOL_GROUPS: SymbolGroup[] = [
  {
    category: "ম্যাথ ও ক্যালকুলাস",
    symbols: [
      { display: "√x", insert: "\\sqrt{x}", name: "বর্গমূল (Square root)" },
      { display: "∫", insert: "\\int ", name: "যোগজীকরণ (Integral)" },
      { display: "∑", insert: "\\sum ", name: "সামেশন (Summation)" },
      { display: "lim", insert: "\\lim_{x \\to 0} ", name: "সীমা (Limit)" },
      { display: "d/dx", insert: "\\frac{d}{dx} ", name: "অন্তরীকরণ (Derivative)" },
      { display: "a/b", insert: "\\frac{a}{b}", name: "ভগ্নাংশ (Fraction)" },
      { display: "x²", insert: "^2", name: "বর্গ (Square)" },
      { display: "xⁿ", insert: "^{n}", name: "ঘাত (Power)" },
      { display: "xᵢ", insert: "_{i}", name: "সাবস্ক্রিপ্ট (Subscript)" },
      { display: "∞", insert: "\\infty ", name: "অসীম (Infinity)" },
      { display: "±", insert: "\\pm ", name: "প্লাস-মাইনাস" },
      { display: "≠", insert: "\\neq ", name: "অসমান (Not equal)" },
      { display: "≈", insert: "\\approx ", name: "প্রায় সমান (Approx)" },
      { display: "≤", insert: "\\leq ", name: "ছোট বা সমান" },
      { display: "≥", insert: "\\geq ", name: "বড় বা সমান" },
      { display: "×", insert: "\\times ", name: "গুণ চিহ্ন" },
      { display: "÷", insert: "\\div ", name: "ভাগ চিহ্ন" },
    ],
  },
  {
    category: "গ্রিক অক্ষর",
    symbols: [
      { display: "α", insert: "\\alpha ", name: "আলফা (Alpha)" },
      { display: "β", insert: "\\beta ", name: "বিটা (Beta)" },
      { display: "γ", insert: "\\gamma ", name: "গামা (Gamma)" },
      { display: "θ", insert: "\\theta ", name: "থিটা (Theta)" },
      { display: "λ", insert: "\\lambda ", name: "তরঙ্গদৈর্ঘ্য ল্যাম্বডা" },
      { display: "μ", insert: "\\mu ", name: "ঘর্ষণ গুণাঙ্ক মিউ" },
      { display: "π", insert: "\\pi ", name: "পাই (Pi)" },
      { display: "ρ", insert: "\\rho ", name: "ঘনত্ব রো (Rho)" },
      { display: "σ", insert: "\\sigma ", name: "সিগমা (Sigma)" },
      { display: "ω", insert: "\\omega ", name: "কৌণিক বেগ ওমেগা" },
      { display: "Δ", insert: "\\Delta ", name: "পরিবর্তন ডেল্টা" },
      { display: "Ω", insert: "\\Omega ", name: "রোধ ওহম (Ohm)" },
      { display: "ϕ", insert: "\\phi ", name: "দশা কোণ ফাই" },
      { display: "τ", insert: "\\tau ", name: "টর্ক টাউ (Tau)" },
      { display: "η", insert: "\\eta ", name: "দক্ষতা ইটা (Eta)" },
    ],
  },
  {
    category: "রসায়ন ও বিক্রিয়া",
    symbols: [
      { display: "→", insert: " \\rightarrow ", name: "একমুখী তীরচিহ্ন" },
      { display: "⇌", insert: " \\rightleftharpoons ", name: "উভমুখী সাম্যাবস্থা" },
      { display: "↑", insert: "\\uparrow ", name: "গ্যাস নিঃসরণ" },
      { display: "↓", insert: "\\downarrow ", name: "অধঃক্ষেপণ (Precipitate)" },
      { display: "ΔH", insert: "\\Delta H", name: "বিক্রিয়া তাপ" },
      { display: "mol/L", insert: "\\text{ mol/L}", name: "মোলারিটি একক" },
      { display: "pH", insert: "\\text{pH}", name: "পিএইচ" },
      { display: "Ksp", insert: "K_{\\text{sp}}", name: "দ্রাব্যতা গুণফল" },
      { display: "Ka", insert: "K_{\\text{a}}", name: "অম্লের বিয়োজন ধ্রুবক" },
      { display: "Kb", insert: "K_{\\text{b}}", name: "ক্ষারের বিয়োজন ধ্রুবক" },
      { display: "e⁻", insert: "e^-", name: "ইলেকট্রন" },
      { display: "atm", insert: "\\text{ atm}", name: "বায়ুমণ্ডলীয় চাপ" },
    ],
  },
  {
    category: "পদার্থবিজ্ঞান একক",
    symbols: [
      { display: "m/s²", insert: "\\text{ m/s}^2", name: "ত্বরণ একক" },
      { display: "J·s", insert: "\\text{ J}\\cdot\\text{s}", name: "প্লাঙ্ক ধ্রুবক একক" },
      { display: "N·m", insert: "\\text{ N}\\cdot\\text{m}", name: "কাজ/টর্ক একক" },
      { display: "kg·m/s", insert: "\\text{ kg}\\cdot\\text{m/s}", name: "ভরবেগ একক" },
      { display: "W/m²", insert: "\\text{ W/m}^2", name: "তীব্রতা একক" },
      { display: "C/mol", insert: "\\text{ C/mol}", name: "ফ্যারাডে একক" },
      { display: "kg/m³", insert: "\\text{ kg/m}^3", name: "ঘনত্ব একক" },
      { display: "F/m", insert: "\\text{ F/m}", name: "ভেদনযোগ্যতা একক" },
    ],
  },
];

export function MathSymbolPalette({
  onInsert,
  className,
  triggerLabel = "চিহ্ন (LaTeX)",
}: MathSymbolPaletteProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (symbol: { insert: string; name: string }) => {
    sfx.play("click");
    onInsert(symbol.insert);
    toast.success(`${symbol.name} যুক্ত করা হয়েছে`);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={className || "h-7 gap-1 text-xs"}
          title="ম্যাথ ও কেমিস্ট্রি চিহ্ন যুক্ত করুন"
        >
          <Pi className="h-3.5 w-3.5 text-primary" />
          <span>{triggerLabel}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-80 max-w-[95vw] p-3 text-xs shadow-xl"
      >
        <div className="flex items-center justify-between pb-2 border-b mb-2">
          <span className="font-bold text-xs flex items-center gap-1.5 text-primary">
            <Atom className="h-4 w-4" />
            গাণিতিক ও রাসায়নিক চিহ্ন
          </span>
          <span className="text-muted-foreground text-xs">ক্লিক করে পেস্ট করুন</span>
        </div>

        <Tabs defaultValue="math" className="w-full">
          <TabsList className="grid grid-cols-4 w-full h-7 mb-2">
            <TabsTrigger value="math" className="text-xs px-1">ম্যাথ</TabsTrigger>
            <TabsTrigger value="greek" className="text-xs px-1">গ্রিক</TabsTrigger>
            <TabsTrigger value="chem" className="text-xs px-1">রসায়ন</TabsTrigger>
            <TabsTrigger value="physics" className="text-xs px-1">একক</TabsTrigger>
          </TabsList>

          <TabsContent value="math" className="space-y-1 mt-0">
            <div className="grid grid-cols-4 gap-1 max-h-48 overflow-y-auto pr-1">
              {SYMBOL_GROUPS[0].symbols.map((s, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => handleSelect(s)}
                  className="flex h-8 items-center justify-center rounded-lg border bg-card font-mono text-xs hover:border-primary/60 hover:bg-primary/5 transition active:scale-95"
                  title={s.name}
                >
                  {s.display}
                </button>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="greek" className="space-y-1 mt-0">
            <div className="grid grid-cols-5 gap-1 max-h-48 overflow-y-auto pr-1">
              {SYMBOL_GROUPS[1].symbols.map((s, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => handleSelect(s)}
                  className="flex h-8 items-center justify-center rounded-lg border bg-card font-mono text-xs font-semibold hover:border-primary/60 hover:bg-primary/5 transition active:scale-95"
                  title={s.name}
                >
                  {s.display}
                </button>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="chem" className="space-y-1 mt-0">
            <div className="grid grid-cols-3 gap-1 max-h-48 overflow-y-auto pr-1">
              {SYMBOL_GROUPS[2].symbols.map((s, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => handleSelect(s)}
                  className="flex h-8 items-center justify-center rounded-lg border bg-card font-mono text-xs hover:border-primary/60 hover:bg-primary/5 transition active:scale-95"
                  title={s.name}
                >
                  {s.display}
                </button>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="physics" className="space-y-1 mt-0">
            <div className="grid grid-cols-2 gap-1 max-h-48 overflow-y-auto pr-1">
              {SYMBOL_GROUPS[3].symbols.map((s, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => handleSelect(s)}
                  className="flex h-8 items-center justify-center rounded-lg border bg-card font-mono text-xs hover:border-primary/60 hover:bg-primary/5 transition active:scale-95"
                  title={s.name}
                >
                  {s.display}
                </button>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}
