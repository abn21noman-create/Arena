"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Database,
  Sparkles,
  Search,
  CheckCircle2,
  HelpCircle,
  RotateCcw,
  BookOpen,
  Filter,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Flame,
  Award,
  Zap,
  Clock,
  Layers,
} from "lucide-react";
import { sfx } from "@/lib/sound-effects";
import { cn } from "@/lib/utils";
import type { GeneratedMCQ } from "@/scripts/generate-20000-questions";

const SUBJECTS_LIST = [
  { code: "ALL", label: "সকল বিষয় (All 20,000+)" },
  { code: "PHYSICS_1", label: "পদার্থবিজ্ঞান ১ম" },
  { code: "PHYSICS_2", label: "পদার্থবিজ্ঞান ২য়" },
  { code: "CHEMISTRY_1", label: "রসায়ন ১ম" },
  { code: "CHEMISTRY_2", label: "রসায়ন ২য়" },
  { code: "HIGHER_MATH_1", label: "উচ্চতর গণিত ১ম" },
  { code: "HIGHER_MATH_2", label: "উচ্চতর গণিত ২য়" },
  { code: "BIOLOGY_1", label: "উদ্ভিদবিজ্ঞান ১ম" },
  { code: "BIOLOGY_2", label: "প্রাণিবিজ্ঞান ২য়" },
  { code: "ICT", label: "আইসিটি (ICT)" },
];

const BOARDS_LIST = [
  "ALL",
  "ঢাকা বোর্ড",
  "রাজশাহী বোর্ড",
  "চট্টগ্রাম বোর্ড",
  "কুমিল্লা বোর্ড",
  "যশোর বোর্ড",
  "দিনাজপুর বোর্ড",
  "সিলেট বোর্ড",
  "বরিশাল বোর্ড",
  "ময়মনসিংহ বোর্ড",
];

const ADMISSION_LIST = [
  { code: "ALL", label: "সকল পরীক্ষা" },
  { code: "BUET", label: "BUET ইঞ্জিনিয়ারিং" },
  { code: "MEDICAL", label: "মেডিকেল ভর্তি (MAT)" },
  { code: "DU_A_UNIT", label: "ঢাবি ক-ইউনিট (DU)" },
  { code: "CKRUET", label: "কুয়েট/রুয়েট/চুয়েট" },
];

export function MegaQuestionVaultStudio() {
  const [selectedSubject, setSelectedSubject] = useState<string>("ALL");
  const [selectedBoard, setSelectedBoard] = useState<string>("ALL");
  const [selectedAdmission, setSelectedAdmission] = useState<string>("ALL");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(20);

  const [loading, setLoading] = useState<boolean>(true);
  const [questions, setQuestions] = useState<GeneratedMCQ[]>([]);
  const [totalCount, setTotalCount] = useState<number>(20000);
  const [totalPages, setTotalPages] = useState<number>(1000);
  const [revealedAnswers, setRevealedAnswers] = useState<{ [id: string]: boolean }>({});
  const [userAnswers, setUserAnswers] = useState<{ [id: string]: string }>({});
  const [isMockMode, setIsMockMode] = useState<boolean>(false);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        subject: selectedSubject,
        board: selectedBoard,
        admissionExam: selectedAdmission,
        difficulty: selectedDifficulty,
        q: searchQuery,
        page: page.toString(),
        limit: limit.toString(),
      });

      const res = await fetch(`/api/vault?${params.toString()}`);
      const data = await res.json();

      setQuestions(data.questions || []);
      setTotalCount(data.totalCount || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error("Failed to fetch vault questions:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedSubject, selectedBoard, selectedAdmission, selectedDifficulty, searchQuery, page, limit]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleStartRandomMock = async () => {
    sfx.play("levelUp");
    setLoading(true);
    try {
      const res = await fetch(`/api/vault?mode=random-mock&subject=${selectedSubject}`);
      const data = await res.json();
      setQuestions(data.questions || []);
      setTotalCount(data.count || 25);
      setTotalPages(1);
      setPage(1);
      setIsMockMode(true);
      setRevealedAnswers({});
      setUserAnswers({});
    } catch (err) {
      console.error("Error generating mock test:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleReveal = (id: string) => {
    sfx.play("pop");
    setRevealedAnswers((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSelectOption = (id: string, opt: string) => {
    sfx.play("click");
    setUserAnswers((prev) => ({ ...prev, [id]: opt }));
    setRevealedAnswers((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <Card className="border shadow-xs bg-linear-to-r from-blue-600/10 via-card to-emerald-500/10 overflow-hidden">
        <CardHeader className="p-4 sm:p-6 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md">
                <Database className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                  <span>HSC সায়েন্স ২০,০০০+ মেগা প্রশ্নভাণ্ডার ও বোর্ড আর্কাইভ</span>
                  <Badge className="bg-emerald-600 text-white text-xs font-bold font-mono">
                    20,000+ MCQs & CQs
                  </Badge>
                </CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  সকল শিক্ষা বোর্ড (২০১৮-২০২৪) ও শীর্ষ বিশ্ববিদ্যালয় ভর্তি পরীক্ষার (BUET, Medical, DU, CKRUET) টপিকভিত্তিক প্রশ্ন
                </p>
              </div>
            </div>

            {/* Quick Mock Generator Button */}
            <Button
              onClick={handleStartRandomMock}
              size="sm"
              className="gap-2 font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md"
            >
              <Flame className="h-4 w-4" />
              <span>২৫ নম্বরের র্যান্ডম স্পিড টেস্ট দিন</span>
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Subject Filter Bar */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {SUBJECTS_LIST.map((s) => (
          <button
            key={s.code}
            type="button"
            onClick={() => {
              sfx.play("click");
              setSelectedSubject(s.code);
              setPage(1);
              setIsMockMode(false);
            }}
            className={cn(
              "rounded-xl px-3.5 py-1.5 text-xs font-bold transition whitespace-nowrap border",
              selectedSubject === s.code
                ? "bg-primary text-primary-foreground border-primary shadow-xs"
                : "bg-card text-muted-foreground hover:bg-muted/60"
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Search & Sub-filters */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        {/* Search Input */}
        <div className="sm:col-span-6 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            placeholder="প্রশ্ন, সূত্র, টপিক বা অধ্যায় দিয়ে সার্চ করুন (যেমন: ভেক্টর, কার্নো, দ্রাব্যতা, লিমিট)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border bg-card text-xs font-medium outline-none focus:border-primary shadow-2xs"
          />
        </div>

        {/* Board Filter */}
        <div className="sm:col-span-3">
          <select
            value={selectedBoard}
            onChange={(e) => {
              setSelectedBoard(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2.5 rounded-2xl border bg-card text-xs font-semibold outline-none focus:border-primary"
          >
            {BOARDS_LIST.map((b) => (
              <option key={b} value={b}>
                {b === "ALL" ? "🏛️ সকল শিক্ষা বোর্ড" : b}
              </option>
            ))}
          </select>
        </div>

        {/* Admission Filter */}
        <div className="sm:col-span-3">
          <select
            value={selectedAdmission}
            onChange={(e) => {
              setSelectedAdmission(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2.5 rounded-2xl border bg-card text-xs font-semibold outline-none focus:border-primary"
          >
            {ADMISSION_LIST.map((a) => (
              <option key={a.code} value={a.code}>
                {a.code === "ALL" ? "🎓 সকল ভর্তি পরীক্ষা" : a.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats summary bar */}
      <div className="flex flex-wrap items-center justify-between text-xs font-bold text-muted-foreground px-1 border-b pb-2">
        <div className="flex items-center gap-2">
          <span>মোট প্রাপ্ত প্রশ্ন: <strong className="text-foreground font-mono">{totalCount.toLocaleString()}</strong>টি</span>
          {isMockMode && (
            <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border border-amber-500/20 text-3xs font-bold">
              ⚡ ২৫ নম্বরের লাইভ স্পিড টেস্ট
            </Badge>
          )}
        </div>
        <div>
          <span>পৃষ্ঠা: <strong className="text-foreground font-mono">{page}</strong> / {totalPages}</span>
        </div>
      </div>

      {/* Questions List */}
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <div className="h-8 w-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-muted-foreground font-medium">প্রশ্নভাণ্ডার থেকে লোড হচ্ছে...</p>
        </div>
      ) : questions.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground space-y-2">
          <HelpCircle className="h-8 w-8 mx-auto text-muted-foreground/60" />
          <p className="font-semibold text-sm text-foreground">কোনো প্রশ্ন পাওয়া যায়নি</p>
          <p className="text-xs">অনুগ্রহ করে ফিল্টার পরিবর্তন করে পুনরায় চেষ্টা করুন।</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {questions.map((q, idx) => {
            const isRevealed = revealedAnswers[q.id];
            const userAns = userAnswers[q.id];

            return (
              <Card key={q.id} className="border shadow-2xs p-5 space-y-4 bg-card">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge variant="outline" className="text-3xs font-semibold">
                      {q.subjectName}
                    </Badge>
                    <Badge variant="secondary" className="text-3xs font-medium">
                      অধ্যায় {q.chapterNumber}: {q.chapterName}
                    </Badge>
                    <Badge variant="outline" className="text-3xs text-primary font-semibold">
                      {q.topicName}
                    </Badge>
                    {q.boardName && (
                      <Badge className="bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-3xs font-bold">
                        {q.boardName} {q.boardYear}
                      </Badge>
                    )}
                    {q.admissionExam && (
                      <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-3xs font-bold">
                        {q.admissionExam === "BUET"
                          ? "BUET ভর্তি"
                          : q.admissionExam === "DU_A_UNIT"
                          ? "ঢাবি ক-ইউনিট"
                          : q.admissionExam === "MEDICAL"
                          ? "মেডিকেল (MAT)"
                          : q.admissionExam}
                      </Badge>
                    )}
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 text-3xs gap-1 font-bold text-muted-foreground hover:text-foreground"
                    onClick={() => toggleReveal(q.id)}
                  >
                    {isRevealed ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    <span>{isRevealed ? "ব্যাখ্যা লুকান" : "উত্তর দেখুন"}</span>
                  </Button>
                </div>

                {/* Question Text */}
                <h3 className="font-bold text-sm sm:text-base text-foreground leading-relaxed">
                  <span className="font-mono text-primary mr-2">Q{(page - 1) * limit + idx + 1}.</span>
                  {q.text}
                </h3>

                {/* Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = userAns === opt;
                    const isCorrect = isRevealed && opt === q.correctAnswer;
                    const isWrong = isRevealed && isSelected && opt !== q.correctAnswer;

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleSelectOption(q.id, opt)}
                        className={cn(
                          "p-3 rounded-xl border text-xs font-semibold text-left transition flex items-center justify-between",
                          isSelected
                            ? "bg-primary text-primary-foreground shadow-xs border-primary"
                            : "bg-muted/10 hover:bg-muted/30",
                          isCorrect && "bg-emerald-600 text-white border-emerald-600 font-bold",
                          isWrong && "bg-rose-600 text-white border-rose-600 font-bold"
                        )}
                      >
                        <span>{opt}</span>
                        {isCorrect && <CheckCircle2 className="h-4 w-4 shrink-0 text-white" />}
                      </button>
                    );
                  })}
                </div>

                {/* Detailed Step-by-Step Explanation */}
                {isRevealed && (
                  <div className="rounded-xl border bg-muted/20 p-3.5 text-2xs space-y-1.5 animate-in fade-in duration-200">
                    <div className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>সঠিক উত্তর: {q.correctAnswer}</span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed font-medium">
                      <strong className="text-foreground">গাণিতিক ও তাত্ত্বিক ব্যাখ্যা: </strong>
                      {q.explanation}
                    </p>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => {
              sfx.play("click");
              setPage((p) => Math.max(1, p - 1));
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="gap-1 font-bold text-xs"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>পূর্ববর্তী পৃষ্ঠা</span>
          </Button>

          <div className="flex items-center gap-1 text-xs font-mono">
            <span>পৃষ্ঠা </span>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={page}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (val >= 1 && val <= totalPages) {
                  setPage(val);
                }
              }}
              className="w-14 px-2 py-1 text-center font-bold border rounded-lg bg-card text-primary"
            />
            <span> / {totalPages}</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => {
              sfx.play("click");
              setPage((p) => Math.min(totalPages, p + 1));
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="gap-1 font-bold text-xs"
          >
            <span>পরবর্তী পৃষ্ঠা</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
