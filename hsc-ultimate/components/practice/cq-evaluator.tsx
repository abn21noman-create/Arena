"use client";

import { useState, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RotateCcw,
  BookOpen,
  Camera,
  Layers,
} from "lucide-react";
import { sfx } from "@/lib/sound-effects";
import { triggerConfetti } from "@/components/shared/confetti";
import { cn } from "@/lib/utils";

interface StepEvaluation {
  part: "ক" | "খ" | "গ" | "ঘ";
  title: string;
  totalMarks: number;
  awardedMarks: number;
  status: "perfect" | "partial" | "needs_work";
  feedback: string;
  keyStrengths: string[];
  missingElements: string[];
}

interface CQSample {
  id: string;
  subject: string;
  chapter: string;
  stem: string;
  questions: {
    ka: string;
    kha: string;
    ga: string;
    gha: string;
  };
  sampleAnswerImage?: string;
  evaluation: StepEvaluation[];
}

const SAMPLE_CQ_DATA: CQSample[] = [
  {
    id: "cq-phys-1",
    subject: "পদার্থবিজ্ঞান ১ম পত্র",
    chapter: "৪র্থ অধ্যায়: নিউটনিয়ান বলবিদ্যা",
    stem: "১০ কেজি ভরের একটি স্থির বস্তুর উপর ২০ নিউটন মানের একটি ধ্রুব বল ৫ সেকেন্ড যাবৎ অনুভূমিক মসৃণ তলে ক্রিয়া করল। এরপর বল অপসারণ করা হলে বস্তুটি আরও ১০ সেকেন্ড চলে একটি স্প্রিং-এ আঘাত করে থেমে গেল। স্প্রিং ধ্রুবক k = ২০০ N/m।",
    questions: {
      ka: "ক. জড়তার ভ্রামক কাকে বলে? (১)",
      kha: "খ. সাইকেল চালক বাঁক নেওয়ার সময় ভিতরের দিকে হেলে পড়ে কেন? ব্যাখ্যা কর। (২)",
      ga: "গ. বল অপসারণের মুহূর্তে বস্তুটির গতিশক্তি নির্ণয় কর। (৩)",
      gha: "ঘ. উদ্দীপকের স্প্রিংটির সংকোচন সর্বোচ্চ কত হবে? গাণিতিকভাবে বিশ্লেষণ কর। (৪)",
    },
    evaluation: [
      {
        part: "ক",
        title: "জ্ঞানমূলক (১ নম্বর)",
        totalMarks: 1,
        awardedMarks: 1,
        status: "perfect",
        feedback: "সঠিক ও নির্ভুল সংজ্ঞা উপস্থাপিত হয়েছে।",
        keyStrengths: ["ঘূর্ণন অক্ষের সাপেক্ষে ভরের বণ্টন ও দূরত্বের বর্গের গুণফলের সমষ্টি স্পষ্টভাবে উল্লেখিত।"],
        missingElements: [],
      },
      {
        part: "খ",
        title: "অনুধাবনমূলক (২ নম্বর)",
        totalMarks: 2,
        awardedMarks: 2,
        status: "perfect",
        feedback: "কেন্দ্রমুখী বল ও প্রতিক্রিয়া বলের উপাংশ সুন্দরভাবে চিত্র ও সমীকরণসহ ব্যাখ্যা করা হয়েছে।",
        keyStrengths: ["R sinθ = mv²/r এবং R cosθ = mg সমীকরণ দুটি নির্ভুল।"],
        missingElements: [],
      },
      {
        part: "গ",
        title: "প্রয়োগমূলক (৩ নম্বর)",
        totalMarks: 3,
        awardedMarks: 2.5,
        status: "partial",
        feedback: "চূড়ান্ত বেগ v = u + at এবং গতিশক্তি E_k = 1/2 mv² হিসাব সঠিক হলেও একক স্পষ্টভাবে লেখা হয়নি।",
        keyStrengths: ["ত্বরণ a = F/m = ২ m/s² এবং বেগ v = ১০ m/s নির্ভুল বের করা হয়েছে।"],
        missingElements: ["চূড়ান্ত ফলাফলে 'জুল (J)' একক স্পষ্টভাবে হাইলাইট করা প্রয়োজন।"],
      },
      {
        part: "ঘ",
        title: "উচ্চতর দক্ষতা (৪ নম্বর)",
        totalMarks: 4,
        awardedMarks: 3.5,
        status: "partial",
        feedback: "শক্তির নিত্যতা সূত্র (1/2 k x² = 1/2 m v²) প্রয়োগ নির্ভুল। কিন্তু ঘর্ষণহীন তলের কথা উল্লেখ করলে পূর্ণাঙ্গ মান পাওয়া যেত।",
        keyStrengths: ["স্প্রিং এর বিভবশক্তি সমীকরণে x = √(m v² / k) সঠিকভাবে সমাধান করা হয়েছে (x = ২.২৩৬ মি.)।"],
        missingElements: ["যান্ত্রিক শক্তির অপচয় নেই—এই শর্তটি বিবৃত করা হয়নি।"],
      },
    ],
  },
  {
    id: "cq-chem-1",
    subject: "রসায়ন ২য় পত্র",
    chapter: "২য় অধ্যায়: জৈব রসায়ন",
    stem: "যৌগ A হলো ইথাইল ক্লোরাইড (CH3CH2Cl)। যৌগ A-কে জলীয় KOH সহ উত্তপ্ত করলে যৌগ B তৈরি হয়। পক্ষান্তরে, অ্যালকোহলীয় KOH সহ উত্তপ্ত করলে যৌগ C তৈরি হয়।",
    questions: {
      ka: "ক. মার্কনিকভের নিয়মটি বিবৃত কর। (১)",
      kha: "খ. ইথিন এবং ইথাইনের মধ্যে কোনটি অধিক অম্লধর্মী এবং কেন? (২)",
      ga: "গ. A থেকে B তৈরির বিক্রিয়াটির কৌশল (Mechanism) প্রদর্শন কর। (৩)",
      gha: "ঘ. যৌগ C ও যৌগ B-এর মধ্যে কীভাবে রাসায়নিকভাবে পার্থক্য করবে? বিশ্লেষণ কর। (৪)",
    },
    evaluation: [
      {
        part: "ক",
        title: "জ্ঞানমূলক (১ নম্বর)",
        totalMarks: 1,
        awardedMarks: 1,
        status: "perfect",
        feedback: "অপ্রতিসম অ্যালকিনে অপ্রতিসম বিকারক সংযোজনের নিয়ম সঠিক।",
        keyStrengths: ["কার্বন-কার্বন দ্বিবন্ধনে কম হাইড্রোজেনযুক্ত কার্বনে ঋণাত্মক অংশ যুক্ত হওয়ার শর্ত সঠিক।"],
        missingElements: [],
      },
      {
        part: "খ",
        title: "অনুধাবনমূলক (২ নম্বর)",
        totalMarks: 2,
        awardedMarks: 2,
        status: "perfect",
        feedback: "sp বনাম sp² সংকরায়নে s-চরিত্রের শতকরা পরিমাণ (৫০% বনাম ৩৩.৩৩%) সুন্দরভাবে তুলে ধরা হয়েছে।",
        keyStrengths: ["ইথাইনের উচ্চ তড়িৎ-ঋণাত্মকতার কারণে H+ ত্যাগের প্রবণতা সঠিক ব্যাখ্যা।"],
        missingElements: [],
      },
      {
        part: "গ",
        title: "প্রয়োগমূলক (৩ নম্বর)",
        totalMarks: 3,
        awardedMarks: 3,
        status: "perfect",
        feedback: "SN2 দ্বি-আণবিক কেন্দ্রাকর্ষী প্রতিস্থাপন মেকানিজম ট্রানজিশন স্টেট সহ নিখুঁত অঙ্কন।",
        keyStrengths: ["নিউক্লিওফাইল OH⁻ এর পেছন দিক থেকে আক্রমণ এবং ইনভার্সন অব কনফিগারেশন দেখানো হয়েছে।"],
        missingElements: [],
      },
      {
        part: "ঘ",
        title: "উচ্চতর দক্ষতা (৪ নম্বর)",
        totalMarks: 4,
        awardedMarks: 3,
        status: "partial",
        feedback: "বেয়ার পরীক্ষা (ক্ষারীয় KMnO4 দ্রবণ দ্বারা গোলাপী বর্ণ বর্ণহীনকরণ) সঠিক, কিন্তু সোডিয়াম ধাতু পরীক্ষার সমীকরণ অসম্পূর্ণ ছিল।",
        keyStrengths: ["দ্বিবন্ধন সনাক্তকরণের ব্রোমিন দ্রবণ পরীক্ষা সঠিক।"],
        missingElements: ["অ্যালকোহলের সাথে Na ধাতুর বিক্রিয়ায় H₂ গ্যাস নিঃসরণের সমীকরণটি অস্পষ্ট।"],
      },
    ],
  },
];

export function CQEvaluatorStudio() {
  const [selectedSample, setSelectedSample] = useState<CQSample>(SAMPLE_CQ_DATA[0]);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [hasEvaluated, setHasEvaluated] = useState<boolean>(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleStartEvaluation = () => {
    sfx.play("click");
    setIsEvaluating(true);
    setHasEvaluated(false);

    setTimeout(() => {
      setIsEvaluating(false);
      setHasEvaluated(true);
      sfx.play("correct");
      triggerConfetti();
    }, 1400);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
        sfx.play("pop");
      };
      reader.readAsDataURL(file);
    }
  };

  const totalMarksEarned = selectedSample.evaluation.reduce(
    (acc, step) => acc + step.awardedMarks,
    0
  );
  const maxPossibleMarks = selectedSample.evaluation.reduce(
    (acc, step) => acc + step.totalMarks,
    0
  );
  const percentage = Math.round((totalMarksEarned / maxPossibleMarks) * 100);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <Card className="border shadow-xs bg-linear-to-r from-emerald-500/10 via-card to-blue-500/10">
        <CardHeader className="p-4 sm:p-6 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                  <span>AI লিখিত খাতা মূল্যায়ন স্টুডিও (CQ Step-Marker)</span>
                  <Badge variant="secondary" className="text-xs">
                    NCTB বোর্ড রুব্রিক্স ভি ৩.০
                  </Badge>
                </CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  হাতে লেখা সৃজনশীল খাতার ছবি আপলোড করে ক, খ, গ, ঘ অংশের তাৎক্ষণিক স্টেপ-বাই-স্টেপ মার্কিং ও ফিডব্যাক
                </p>
              </div>
            </div>

            {/* Sample Selector */}
            <div className="flex gap-1.5 bg-muted/40 p-1.5 rounded-xl border">
              {SAMPLE_CQ_DATA.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    sfx.play("click");
                    setSelectedSample(s);
                    setHasEvaluated(false);
                    setUploadedImage(null);
                  }}
                  className={cn(
                    "rounded-lg px-3 py-1 text-xs font-bold transition",
                    selectedSample.id === s.id
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {s.subject}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Grid: Left Stem & Script, Right Evaluation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Stem & Script Upload (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Question Stem Card */}
          <Card className="border shadow-2xs p-5 space-y-3 bg-card">
            <div className="flex items-center justify-between border-b pb-2">
              <Badge variant="outline" className="text-3xs font-semibold">
                {selectedSample.chapter}
              </Badge>
              <span className="text-2xs font-mono text-muted-foreground font-bold">
                পূর্ণমান: ১০
              </span>
            </div>

            <div className="rounded-xl bg-muted/30 p-3.5 text-xs sm:text-sm leading-relaxed border font-medium">
              <span className="font-bold text-primary">উদ্দীপক: </span>
              {selectedSample.stem}
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="p-2 rounded-lg bg-card border font-medium">
                {selectedSample.questions.ka}
              </div>
              <div className="p-2 rounded-lg bg-card border font-medium">
                {selectedSample.questions.kha}
              </div>
              <div className="p-2 rounded-lg bg-card border font-medium">
                {selectedSample.questions.ga}
              </div>
              <div className="p-2 rounded-lg bg-card border font-medium">
                {selectedSample.questions.gha}
              </div>
            </div>
          </Card>

          {/* Upload or Demo Script Canvas Card */}
          <Card className="border shadow-2xs p-5 space-y-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Camera className="h-4 w-4 text-emerald-500" />
                <span>উত্তরপত্রের পাণ্ডুলিপি (Handwritten Script)</span>
              </CardTitle>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-2xs gap-1.5 font-bold"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-3.5 w-3.5" />
                <span>খাতার ছবি তুলুন</span>
              </Button>
            </div>

            <div className="relative rounded-2xl border-2 border-dashed border-muted-foreground/20 bg-muted/10 p-4 min-h-[220px] flex flex-col items-center justify-center text-center">
              {uploadedImage ? (
                <div className="relative w-full h-56 rounded-xl overflow-hidden border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={uploadedImage}
                    alt="Uploaded Answer Script"
                    className="w-full h-full object-contain bg-slate-950"
                  />
                  <Badge className="absolute top-2 right-2 bg-emerald-600 text-white text-3xs font-bold">
                    ক্যামেরা স্ক্যান সক্রিয়
                  </Badge>
                </div>
              ) : (
                <div className="space-y-2 py-4">
                  <div className="flex justify-center">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                      <Layers className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="text-xs font-bold">নমুনা লিখিত উত্তরপত্র লোড করা আছে</div>
                  <p className="text-2xs text-muted-foreground max-w-xs">
                    নিজস্ব খাতার ছবি তুলতে উপরের বাটনে ক্লিক করুন অথবা ডেমো স্ক্রিপ্ট মূল্যায়ন করতে নিচে চাপুন।
                  </p>
                </div>
              )}
            </div>

            <Button
              className="w-full font-bold gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
              onClick={handleStartEvaluation}
              disabled={isEvaluating}
            >
              {isEvaluating ? (
                <>
                  <Sparkles className="h-4 w-4 animate-spin" />
                  <span>AI খাতা যাচাই করছে (OCR + রুব্রিক বিশ্লেষণ)...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>AI দিয়ে মূল্যায়ন করুন (Evaluate CQ Script)</span>
                </>
              )}
            </Button>
          </Card>
        </div>

        {/* Right Column: Detailed Rubric Evaluation (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          {hasEvaluated ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Overall Score Summary */}
              <Card className="border shadow-xs bg-linear-to-br from-card via-card to-emerald-500/10 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xs text-muted-foreground uppercase font-bold tracking-wider">
                      প্রাপ্ত নম্বর ও গ্রেড
                    </span>
                    <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono flex items-baseline gap-2">
                      <span>{totalMarksEarned} / {maxPossibleMarks}</span>
                      <span className="text-xs font-sans text-muted-foreground font-semibold">
                        ({percentage}%)
                      </span>
                    </div>
                  </div>
                  <Badge className="bg-emerald-600 text-white text-xs px-3 py-1 font-bold">
                    {percentage >= 80 ? "A+ মানসম্মত" : "উন্নয়ন প্রয়োজন"}
                  </Badge>
                </div>

                <div className="grid grid-cols-4 gap-2 pt-1 border-t">
                  {selectedSample.evaluation.map((step) => (
                    <div key={step.part} className="rounded-xl border bg-muted/20 p-2 text-center">
                      <div className="text-3xs text-muted-foreground font-bold">প্রশ্ন ({step.part})</div>
                      <div className="text-sm font-black font-mono text-primary">
                        {step.awardedMarks}/{step.totalMarks}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Step-by-Step Breakdown Cards */}
              <div className="space-y-3">
                {selectedSample.evaluation.map((step) => (
                  <Card key={step.part} className="border shadow-2xs p-4 space-y-2 bg-card">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={cn(
                            "font-mono font-bold text-2xs",
                            step.status === "perfect" && "border-emerald-500 text-emerald-600 bg-emerald-500/10",
                            step.status === "partial" && "border-amber-500 text-amber-600 bg-amber-500/10"
                          )}
                        >
                          প্রশ্ন ({step.part})
                        </Badge>
                        <span className="font-bold text-xs text-foreground">{step.title}</span>
                      </div>
                      <span className="font-mono font-bold text-xs text-primary">
                        {step.awardedMarks} / {step.totalMarks}
                      </span>
                    </div>

                    <p className="text-2xs text-muted-foreground font-medium">
                      {step.feedback}
                    </p>

                    {/* Key Strengths & Missing Elements */}
                    <div className="space-y-1 pt-1 text-2xs">
                      {step.keyStrengths.map((str, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                          <span>{str}</span>
                        </div>
                      ))}
                      {step.missingElements.map((miss, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 text-amber-600 dark:text-amber-400">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                          <span>{miss}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            /* Idle Placeholder Card */
            <Card className="border shadow-2xs p-8 flex flex-col items-center justify-center text-center space-y-4 min-h-[400px]">
              <div className="h-16 w-16 rounded-3xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Sparkles className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-base text-foreground">
                  খাতা মূল্যায়ন অপেক্ষমাণ
                </h3>
                <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
                  বাম পাশের প্যানেল থেকে খাতা নির্বাচন করে বা ছবি আপলোড করে &ldquo;AI দিয়ে মূল্যায়ন করুন&rdquo; বাটনে চাপুন।
                </p>
              </div>
              <div className="rounded-xl border bg-muted/20 p-3.5 text-2xs text-left space-y-1.5 max-w-sm">
                <div className="font-bold text-foreground">মূল্যায়নের মূল ভিত্তি:</div>
                <div>• NCTB বোর্ড কর্তৃক নির্ধারিত ৪টি অংশ (ক, খ, গ, ঘ)</div>
                <div>• সঠিক সূত্র প্রয়োগ ও গাণিতিক একক যাচাই</div>
                <div>• চিত্র ও মেকানিজমের নির্ভুলতা</div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
