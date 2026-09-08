"use client";

import { useState, useEffect, useCallback, useId } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calculator,
  Copy,
  Check,
  RotateCcw,
  Delete,
  Search,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { sfx } from "@/lib/sound-effects";

export const OPEN_CALCULATOR_EVENT = "hsc-ultimate:open-calculator";

export function openScientificCalculator() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(OPEN_CALCULATOR_EVENT));
  }
}

interface PhysicalConstant {
  symbol: string;
  nameBangla: string;
  nameEnglish: string;
  value: string;
  numericValue: number;
  unit: string;
  category: "Physics" | "Chemistry" | "Universal";
}

const HSC_CONSTANTS: PhysicalConstant[] = [
  {
    symbol: "c",
    nameBangla: "শূন্য মাধ্যমে আলোর বেগ",
    nameEnglish: "Speed of Light in Vacuum",
    value: "2.99792458e8",
    numericValue: 2.99792458e8,
    unit: "m/s",
    category: "Physics",
  },
  {
    symbol: "h",
    nameBangla: "প্লাঙ্কের ধ্রুবক",
    nameEnglish: "Planck's Constant",
    value: "6.62607e-34",
    numericValue: 6.62607015e-34,
    unit: "J·s",
    category: "Physics",
  },
  {
    symbol: "G",
    nameBangla: "মহাকর্ষীয় ধ্রুবক",
    nameEnglish: "Gravitational Constant",
    value: "6.6743e-11",
    numericValue: 6.6743e-11,
    unit: "N·m²/kg²",
    category: "Physics",
  },
  {
    symbol: "g",
    nameBangla: "আদর্শ অভিকর্ষজ ত্বরণ",
    nameEnglish: "Standard Acceleration of Gravity",
    value: "9.80665",
    numericValue: 9.80665,
    unit: "m/s²",
    category: "Physics",
  },
  {
    symbol: "R",
    nameBangla: "সার্বজনীন গ্যাস ধ্রুবক (SI)",
    nameEnglish: "Universal Gas Constant (SI)",
    value: "8.31446",
    numericValue: 8.31446,
    unit: "J/(mol·K)",
    category: "Chemistry",
  },
  {
    symbol: "R (L·atm)",
    nameBangla: "গ্যাস ধ্রুবক (L-atm একক)",
    nameEnglish: "Gas Constant (L·atm unit)",
    value: "0.082057",
    numericValue: 0.082057,
    unit: "L·atm/(mol·K)",
    category: "Chemistry",
  },
  {
    symbol: "Nₐ",
    nameBangla: "অ্যাভোগাড্রো ধ্রুবক",
    nameEnglish: "Avogadro Constant",
    value: "6.02214e23",
    numericValue: 6.02214076e23,
    unit: "mol⁻¹",
    category: "Chemistry",
  },
  {
    symbol: "e",
    nameBangla: "ইলেকট্রনের চার্জ",
    nameEnglish: "Elementary Charge",
    value: "1.6021766e-19",
    numericValue: 1.602176634e-19,
    unit: "C",
    category: "Physics",
  },
  {
    symbol: "mₑ",
    nameBangla: "ইলেকট্রনের নিশ্চল ভর",
    nameEnglish: "Electron Rest Mass",
    value: "9.10938e-31",
    numericValue: 9.1093837e-31,
    unit: "kg",
    category: "Physics",
  },
  {
    symbol: "mₚ",
    nameBangla: "প্রোটনের নিশ্চল ভর",
    nameEnglish: "Proton Rest Mass",
    value: "1.67262e-27",
    numericValue: 1.67262192e-27,
    unit: "kg",
    category: "Physics",
  },
  {
    symbol: "ε₀",
    nameBangla: "শূন্যস্থানের ভেদনযোগ্যতা",
    nameEnglish: "Permittivity of Free Space",
    value: "8.85418e-12",
    numericValue: 8.8541878128e-12,
    unit: "F/m (C²/N·m²)",
    category: "Physics",
  },
  {
    symbol: "μ₀",
    nameBangla: "শূন্যস্থানের প্রবেশ্যতা",
    nameEnglish: "Permeability of Free Space",
    value: "1.256637e-6",
    numericValue: 1.25663706212e-6,
    unit: "H/m (T·m/A)",
    category: "Physics",
  },
  {
    symbol: "F",
    nameBangla: "ফ্যারাডে ধ্রুবক",
    nameEnglish: "Faraday Constant",
    value: "96485.3",
    numericValue: 96485.33212,
    unit: "C/mol",
    category: "Chemistry",
  },
  {
    symbol: "k_B",
    nameBangla: "বোল্টজম্যান ধ্রুবক",
    nameEnglish: "Boltzmann Constant",
    value: "1.380649e-23",
    numericValue: 1.380649e-23,
    unit: "J/K",
    category: "Physics",
  },
  {
    symbol: "σ",
    nameBangla: "স্টিফান-বোল্টজম্যান ধ্রুবক",
    nameEnglish: "Stefan-Boltzmann Constant",
    value: "5.67037e-8",
    numericValue: 5.670374419e-8,
    unit: "W/(m²·K⁴)",
    category: "Physics",
  },
  {
    symbol: "R_H",
    nameBangla: "রিডবার্গ ধ্রুবক",
    nameEnglish: "Rydberg Constant",
    value: "1.097373e7",
    numericValue: 1.0973731568e7,
    unit: "m⁻¹",
    category: "Physics",
  },
  {
    symbol: "V_STP",
    nameBangla: "STP-তে ১ মোল গ্যাসের আয়তন",
    nameEnglish: "Molar Volume of Gas (STP)",
    value: "22.414",
    numericValue: 22.414,
    unit: "L (dm³)",
    category: "Chemistry",
  },
  {
    symbol: "V_SATP",
    nameBangla: "SATP-তে ১ মোল গ্যাসের আয়তন",
    nameEnglish: "Molar Volume of Gas (SATP)",
    value: "24.789",
    numericValue: 24.789,
    unit: "L (dm³)",
    category: "Chemistry",
  },
];

export function ScientificCalculatorDialog() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"calc" | "constants">("calc");
  const [display, setDisplay] = useState("0");
  const [expression, setExpression] = useState("");
  const [history, setHistory] = useState<Array<{ expr: string; res: string }>>([]);
  const [isRad, setIsRad] = useState(false);
  const [constantFilter, setConstantFilter] = useState("");
  const [copiedSymbol, setCopiedSymbol] = useState<string | null>(null);
  const searchInputId = useId();

  useEffect(() => {
    function handleOpen() {
      setOpen(true);
    }
    window.addEventListener(OPEN_CALCULATOR_EVENT, handleOpen);
    return () => window.removeEventListener(OPEN_CALCULATOR_EVENT, handleOpen);
  }, []);

  const handleClear = useCallback(() => {
    sfx.play("click");
    setDisplay("0");
    setExpression("");
  }, []);

  const handleDelete = useCallback(() => {
    sfx.play("click");
    setDisplay((prev) => {
      if (prev.length <= 1 || prev === "Error" || prev === "Infinity" || prev === "NaN") {
        return "0";
      }
      return prev.slice(0, -1);
    });
  }, []);

  const handleAppend = useCallback((char: string) => {
    sfx.play("click");
    setDisplay((prev) => {
      if (prev === "0" || prev === "Error" || prev === "Infinity" || prev === "NaN") {
        return char;
      }
      return prev + char;
    });
  }, []);

  const evaluateMath = useCallback(
    (exprStr: string): number => {
      let sanitized = exprStr
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/π/g, `${Math.PI}`)
        .replace(/\be\b/g, `${Math.E}`);

      // Trigonometry conversions (degree vs radian)
      if (!isRad) {
        sanitized = sanitized
          .replace(/sin\(([^)]+)\)/g, "Math.sin(($1) * Math.PI / 180)")
          .replace(/cos\(([^)]+)\)/g, "Math.cos(($1) * Math.PI / 180)")
          .replace(/tan\(([^)]+)\)/g, "Math.tan(($1) * Math.PI / 180)")
          .replace(/asin\(([^)]+)\)/g, "(Math.asin($1) * 180 / Math.PI)")
          .replace(/acos\(([^)]+)\)/g, "(Math.acos($1) * 180 / Math.PI)")
          .replace(/atan\(([^)]+)\)/g, "(Math.atan($1) * 180 / Math.PI)");
      } else {
        sanitized = sanitized
          .replace(/sin\(/g, "Math.sin(")
          .replace(/cos\(/g, "Math.cos(")
          .replace(/tan\(/g, "Math.tan(")
          .replace(/asin\(/g, "Math.asin(")
          .replace(/acos\(/g, "Math.acos(")
          .replace(/atan\(/g, "Math.atan(");
      }

      sanitized = sanitized
        .replace(/log\(([^)]+)\)/g, "Math.log10($1)")
        .replace(/ln\(([^)]+)\)/g, "Math.log($1)")
        .replace(/sqrt\(([^)]+)\)/g, "Math.sqrt($1)")
        .replace(/\^/g, "**");

      // Validate expression only contains safe mathematical characters
      if (/[^0-9+\-*/().,%*\sMathPIEsincoaglrtedxb]/.test(sanitized)) {
        throw new Error("Invalid characters");
      }

      // eslint-disable-next-line no-new-func
      const result = new Function(`return (${sanitized});`)() as number;
      if (typeof result !== "number" || isNaN(result)) {
        throw new Error("Invalid result");
      }
      return result;
    },
    [isRad]
  );

  const handleCalculate = useCallback(() => {
    sfx.play("click");
    try {
      const raw = display;
      const resNum = evaluateMath(raw);
      // Format number nicely
      let formatted = "";
      if (Math.abs(resNum) > 1e9 || (Math.abs(resNum) < 1e-4 && resNum !== 0)) {
        formatted = resNum.toExponential(6).replace(/\.?0+e/, "e");
      } else {
        formatted = String(Number(resNum.toFixed(8)));
      }
      setExpression(raw + " =");
      setDisplay(formatted);
      setHistory((prev) => [{ expr: raw, res: formatted }, ...prev.slice(0, 8)]);
    } catch {
      setDisplay("Error");
    }
  }, [display, evaluateMath]);

  const handleInsertConstant = useCallback((constant: PhysicalConstant) => {
    sfx.play("click");
    setDisplay((prev) => {
      if (prev === "0" || prev === "Error") return constant.value;
      return prev + constant.value;
    });
    setActiveTab("calc");
    toast.success(`${constant.symbol} ক্যালকুলেটরে যুক্ত করা হয়েছে`);
  }, []);

  const handleCopyConstant = useCallback((val: string, sym: string) => {
    sfx.play("click");
    navigator.clipboard.writeText(val);
    setCopiedSymbol(sym);
    toast.success(`${sym} কপি করা হয়েছে (${val})`);
    setTimeout(() => setCopiedSymbol(null), 2000);
  }, []);

  const filteredConstants = HSC_CONSTANTS.filter(
    (c) =>
      c.symbol.toLowerCase().includes(constantFilter.toLowerCase()) ||
      c.nameBangla.toLowerCase().includes(constantFilter.toLowerCase()) ||
      c.nameEnglish.toLowerCase().includes(constantFilter.toLowerCase()) ||
      c.category.toLowerCase().includes(constantFilter.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[92dvh] w-full max-w-lg overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Calculator className="h-4 w-4" />
              </div>
              <DialogTitle className="text-base font-bold sm:text-lg">
                HSC সায়েন্টিফিক ক্যালকুলেটর ও ধ্রুবক
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as "calc" | "constants")}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="calc" className="gap-2">
              <Calculator className="h-3.5 w-3.5" />
              ক্যালকুলেটর
            </TabsTrigger>
            <TabsTrigger value="constants" className="gap-2">
              <Sparkles className="h-3.5 w-3.5" />
              এইচএসসি ধ্রুবক শিট
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calc" className="mt-3 space-y-3">
            {/* Display screen */}
            <div className="rounded-2xl border bg-muted/40 p-3 shadow-inner">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-mono">{expression || "\u00A0"}</span>
                <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-semibold text-primary">
                  {isRad ? "RAD" : "DEG"}
                </span>
              </div>
              <div className="mt-1 overflow-x-auto text-right font-mono text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {display}
              </div>
            </div>

            {/* Scientific Function Grid */}
            <div className="grid grid-cols-5 gap-1.5 text-xs">
              <Button
                variant={isRad ? "default" : "outline"}
                size="sm"
                className="h-9 px-1 text-xs"
                onClick={() => {
                  sfx.play("click");
                  setIsRad(!isRad);
                }}
              >
                {isRad ? "RAD" : "DEG"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-1 text-xs"
                onClick={() => handleAppend("sin(")}
              >
                sin
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-1 text-xs"
                onClick={() => handleAppend("cos(")}
              >
                cos
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-1 text-xs"
                onClick={() => handleAppend("tan(")}
              >
                tan
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-1 text-xs"
                onClick={() => handleAppend("log(")}
              >
                log
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="h-9 px-1 text-xs"
                onClick={() => handleAppend("ln(")}
              >
                ln
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-1 text-xs"
                onClick={() => handleAppend("sqrt(")}
              >
                √
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-1 text-xs"
                onClick={() => handleAppend("^")}
              >
                xʸ
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-1 text-xs"
                onClick={() => handleAppend("π")}
              >
                π
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-1 text-xs"
                onClick={() => handleAppend("e")}
              >
                e
              </Button>
            </div>

            {/* Standard Keypad */}
            <div className="grid grid-cols-4 gap-1.5">
              <Button
                variant="destructive"
                size="sm"
                className="h-10 text-sm font-semibold"
                onClick={handleClear}
              >
                AC
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-10 text-sm"
                onClick={handleDelete}
              >
                <Delete className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-10 text-sm"
                onClick={() => handleAppend("(")}
              >
                (
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-10 text-sm"
                onClick={() => handleAppend(")")}
              >
                )
              </Button>

              <Button
                variant="secondary"
                size="sm"
                className="h-10 font-mono text-base font-semibold"
                onClick={() => handleAppend("7")}
              >
                7
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="h-10 font-mono text-base font-semibold"
                onClick={() => handleAppend("8")}
              >
                8
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="h-10 font-mono text-base font-semibold"
                onClick={() => handleAppend("9")}
              >
                9
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-10 text-base font-semibold text-primary"
                onClick={() => handleAppend("÷")}
              >
                ÷
              </Button>

              <Button
                variant="secondary"
                size="sm"
                className="h-10 font-mono text-base font-semibold"
                onClick={() => handleAppend("4")}
              >
                4
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="h-10 font-mono text-base font-semibold"
                onClick={() => handleAppend("5")}
              >
                5
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="h-10 font-mono text-base font-semibold"
                onClick={() => handleAppend("6")}
              >
                6
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-10 text-base font-semibold text-primary"
                onClick={() => handleAppend("×")}
              >
                ×
              </Button>

              <Button
                variant="secondary"
                size="sm"
                className="h-10 font-mono text-base font-semibold"
                onClick={() => handleAppend("1")}
              >
                1
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="h-10 font-mono text-base font-semibold"
                onClick={() => handleAppend("2")}
              >
                2
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="h-10 font-mono text-base font-semibold"
                onClick={() => handleAppend("3")}
              >
                3
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-10 text-base font-semibold text-primary"
                onClick={() => handleAppend("-")}
              >
                -
              </Button>

              <Button
                variant="secondary"
                size="sm"
                className="h-10 font-mono text-base font-semibold"
                onClick={() => handleAppend("0")}
              >
                0
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="h-10 font-mono text-base font-semibold"
                onClick={() => handleAppend(".")}
              >
                .
              </Button>
              <Button
                variant="default"
                size="sm"
                className="h-10 text-lg font-bold"
                onClick={handleCalculate}
              >
                =
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-10 text-base font-semibold text-primary"
                onClick={() => handleAppend("+")}
              >
                +
              </Button>
            </div>

            {/* History snippet */}
            {history.length > 0 && (
              <div className="mt-2 rounded-xl border bg-muted/20 p-2 text-xs">
                <div className="flex items-center justify-between pb-1 text-muted-foreground">
                  <span className="font-semibold">পূর্ববর্তী হিসাব:</span>
                  <button
                    onClick={() => setHistory([])}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <RotateCcw className="h-3 w-3" /> হিস্ট্রি মুছুন
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {history.slice(0, 4).map((h, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        sfx.play("click");
                        setDisplay(h.res);
                      }}
                      className="rounded-lg border bg-background px-2 py-1 font-mono text-xs hover:border-primary/50"
                    >
                      {h.expr} = <span className="font-bold text-primary">{h.res}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="constants" className="mt-3 space-y-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                id={searchInputId}
                aria-label="ধ্রুবক বা সূত্র খুঁজুন"
                value={constantFilter}
                onChange={(e) => setConstantFilter(e.target.value)}
                placeholder="ধ্রুবক বা সূত্রের নাম খুঁজুন (যেমন: c, h, gas, light)..."
                className="w-full rounded-xl border bg-background py-2 pl-9 pr-3 text-xs outline-none focus:border-primary"
              />
            </div>

            <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
              {filteredConstants.map((item) => (
                <div
                  key={item.symbol}
                  className="flex items-center justify-between gap-2 rounded-xl border bg-card p-2.5 shadow-sm transition hover:border-primary/40"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-primary">
                        {item.symbol}
                      </span>
                      <span className="truncate text-xs font-semibold">{item.nameBangla}</span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 font-mono text-xs text-muted-foreground">
                      <span>{item.value}</span>
                      <span className="text-xs text-primary/80">{item.unit}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1 px-2 text-xs"
                      onClick={() => handleInsertConstant(item)}
                    >
                      <Calculator className="h-3.5 w-3.5" />
                      ক্যালকুলেটরে নাও
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleCopyConstant(item.value, item.symbol)}
                      aria-label={`${item.symbol} মান কপি করো`}
                    >
                      {copiedSymbol === item.symbol ? (
                        <Check className="h-3.5 w-3.5 text-green-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
              {filteredConstants.length === 0 && (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  কোনো ধ্রুবক পাওয়া যায়নি
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
