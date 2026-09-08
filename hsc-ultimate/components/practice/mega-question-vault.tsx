"use client";

import { useState } from "react";
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
} from "lucide-react";
import { sfx } from "@/lib/sound-effects";
import { cn } from "@/lib/utils";
import { PHYSICS1_MEGA_QUESTIONS } from "@/prisma/seed-physics1-mega-vault";

export function MegaQuestionVaultStudio() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");
  const [revealedAnswers, setRevealedAnswers] = useState<{ [id: number]: boolean }>({});
  const [userAnswers, setUserAnswers] = useState<{ [id: number]: string }>({});

  const toggleReveal = (idx: number) => {
    sfx.play("pop");
    setRevealedAnswers((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleSelectOption = (idx: number, opt: string) => {
    sfx.play("click");
    setUserAnswers((prev) => ({ ...prev, [idx]: opt }));
    setRevealedAnswers((prev) => ({ ...prev, [idx]: true }));
  };

  const filteredQuestions = PHYSICS1_MEGA_QUESTIONS.filter((q) => {
    const matchesSearch =
      q.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.topicName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (q.boardName && q.boardName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDiff =
      selectedDifficulty === "All" || q.difficulty === selectedDifficulty;

    return matchesSearch && matchesDiff;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border shadow-xs bg-linear-to-r from-blue-500/10 via-card to-emerald-500/10">
        <CardHeader className="p-4 sm:p-6 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Database className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                  <span>HSC সায়েন্স প্রশ্নভাণ্ডার ও বোর্ড প্রশ্ন আর্কাইভ</span>
                  <Badge variant="secondary" className="text-xs">
                    Physics 1st Paper Vault
                  </Badge>
                </CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  সকল শিক্ষা বোর্ড (২০২২-২০২৪) ও ভর্তি পরীক্ষার (BUET, Medical, DU) অধ্যায়ভিত্তিক প্রশ্ন ও সমাধান
                </p>
              </div>
            </div>

            {/* Difficulty Filter */}
            <div className="flex gap-1.5 bg-muted/40 p-1.5 rounded-xl border">
              {["All", "EASY", "MEDIUM", "HARD"].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => {
                    sfx.play("click");
                    setSelectedDifficulty(d);
                  }}
                  className={cn(
                    "rounded-lg px-2.5 py-1 text-xs font-bold transition",
                    selectedDifficulty === d
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground"
                  )}
                >
                  {d === "All" ? "সকল মান" : d === "EASY" ? "সহজ" : d === "MEDIUM" ? "মধ্যম" : "কঠিন"}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="অধ্যায়, টপিক বা বোর্ডের নাম দিয়ে খুঁজুন (যেমন: ভেক্টর, ঢাকা বোর্ড, BUET, স্প্রিং)..."
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl border bg-card text-xs font-medium outline-none focus:border-primary shadow-2xs"
        />
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center text-xs font-bold text-muted-foreground px-1">
          <span>মোট প্রশ্ন: {filteredQuestions.length}টি</span>
          <span>পদার্থবিজ্ঞান ১ম পত্র (সকল অধ্যায়)</span>
        </div>

        {filteredQuestions.map((q, idx) => {
          const isRevealed = revealedAnswers[idx];
          const userAns = userAnswers[idx];

          return (
            <Card key={idx} className="border shadow-2xs p-5 space-y-4 bg-card">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2.5">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-3xs font-semibold">
                    {q.topicName}
                  </Badge>
                  {q.boardName && (
                    <Badge className="bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-3xs font-bold">
                      {q.boardName} {q.boardYear}
                    </Badge>
                  )}
                  {q.admissionExam && (
                    <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-3xs font-bold">
                      {q.admissionExam === "BUET" ? "BUET ভর্তি পরীক্ষা" : q.admissionExam === "DU_A_UNIT" ? "ঢাবি ক-ইউনিট" : "মেডিকেল ভর্তি (MAT)"}
                    </Badge>
                  )}
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 text-3xs gap-1 font-bold text-muted-foreground"
                  onClick={() => toggleReveal(idx)}
                >
                  {isRevealed ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  <span>{isRevealed ? "ব্যাখ্যা লুকান" : "উত্তর দেখুন"}</span>
                </Button>
              </div>

              {/* Question Text */}
              <h3 className="font-bold text-sm sm:text-base text-foreground leading-relaxed">
                <span className="font-mono text-primary mr-2">Q{idx + 1}.</span>
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
                      onClick={() => handleSelectOption(idx, opt)}
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

              {/* Explanation */}
              {isRevealed && (
                <div className="rounded-xl border bg-muted/20 p-3.5 text-2xs space-y-1 animate-in fade-in duration-200">
                  <div className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>সঠিক উত্তর: {q.correctAnswer}</span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed font-medium">
                    <strong className="text-foreground">ব্যাখ্যা: </strong>
                    {q.explanation}
                  </p>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
