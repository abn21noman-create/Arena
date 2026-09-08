"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileEdit, CheckCircle2, AlertTriangle, Sparkles, BookOpen, ChevronRight, Layers } from "lucide-react";
import { sfx } from "@/lib/sound-effects";
import { cn } from "@/lib/utils";

interface CQStep {
  part: "ক" | "খ" | "গ" | "ঘ";
  title: string;
  marks: number;
  description: string;
  framework: string[];
  sampleQuestion: string;
  sampleAnswer: string;
  examinerWarning: string;
}

const CQ_GUIDES: CQStep[] = [
  {
    part: "ক",
    title: "জ্ঞানমূলক (Knowledge)",
    marks: 1,
    description: "১ বাক্যে সরাসরি টু-দ্য-পয়েন্ট সংজ্ঞা, সূত্র বা বৈজ্ঞানিক বিবৃতি লিখতে হবে। কোনো প্রকার ভূমিকা বা অপ্রয়োজনীয় কথা লেখা যাবে না।",
    framework: [
      "১ম ও একমাত্র লাইন: সরাসরি প্রমিত সংজ্ঞা বা রাশির পরিচয়।",
      "যদি কোনো ধ্রুবকের মান চাওয়া হয়, তবে প্রমিত এককসহ মান উল্লেখ করুন।",
    ],
    sampleQuestion: "প্রশ্ন: মহাকর্ষীয় ধ্রুবক (G) কাকে বলে?",
    sampleAnswer: "উত্তর: একক ভরের দুটি বস্তুকণা একক দূরত্বের ব্যবধানে থেকে পরস্পরের মধ্যে যে পরিমাণ আকর্ষণ বল অনুভব করে, তাকে মহাকর্ষীয় ধ্রুবক বলে। (মান: 6.673 × 10⁻¹¹ N m² kg⁻²)",
    examinerWarning: "সংজ্ঞায় 'একক ভর' বা 'একক দূরত্ব' শব্দগুলো বাদ পড়লে শিক্ষক ০ নম্বর দেন।",
  },
  {
    part: "খ",
    title: "অনুধাবনমূলক (Comprehension)",
    marks: 2,
    description: "ঠিক ২টি স্পষ্ট প্যারায় লিখতে হবে। ১ম প্যারায় মূল বৈজ্ঞানিক কারণ এবং ২য় প্যারায় তার যৌক্তিক ব্যাখ্যা।",
    framework: [
      "প্যারা ১ (জ্ঞান অংশ - ১ মার্ক): ঘটনার মূল কারণ ১-২ লাইনে লিখুন।",
      "প্যারা ২ (অনুধাবন অংশ - ১ মার্ক): বৈজ্ঞানিক সূত্র বা কার্যকারণ দিয়ে ব্যাখ্যা করুন।",
    ],
    sampleQuestion: "প্রশ্ন: পৃথিবী পৃষ্ঠের সর্বত্র 'g' এর মান সমান নয় কেন?",
    sampleAnswer: "উত্তর:\nপ্যারা ১: পৃথিবীর মেরু অঞ্চলে ব্যাসার্ধ কম এবং বিষুবীয় অঞ্চলে ব্যাসার্ধ বেশি হওয়ায় দূরত্বের তারতম্যের কারণে 'g' এর মান সর্বত্র সমান নয়।\n\nপ্যারা ২: আমরা জানি, g = GM/R²। অর্থাৎ g এর মান পৃথিবীর ব্যাসার্ধ R এর বর্গের ব্যস্তানুপাতিক। পৃথিবী সম্পূর্ণ গোলাকার নয়, বরং মেরু অঞ্চলে কিছুটা চাপা। ফলে মেরু অঞ্চলে R কম হওয়ায় g এর মান সর্বোচ্চ (9.83 ms⁻²) এবং বিষুবীয় অঞ্চলে R বেশি হওয়ায় g এর মান সর্বনিম্ন (9.78 ms⁻²) হয়।",
    examinerWarning: "এক ঢালাও একটি বড় প্যারাগ্রাফ লিখলে পরীক্ষক অনেক সময় ২ এর মধ্যে ১ নম্বর দিয়ে দেন। অবশ্যই ২ প্যারায় লিখবেন।",
  },
  {
    part: "গ",
    title: "প্রয়োগমূলক (Application)",
    marks: 3,
    description: "উদ্দীপকের তথ্য ব্যবহার করে সরাসরি ৩টি সুস্পষ্ট ধাপে গাণিতিক সমাধান করতে হবে।",
    framework: [
      "ধাপ ১ (ডানপাশে): 'দেওয়া আছে:' দিয়ে উদ্দীপকের সকল রাশির মান ও প্রতীক স্পষ্ট লিখুন।",
      "ধাপ ২: 'আমরা জানি:' দিয়ে মূল গাণিতিক সূত্রটি লিখুন।",
      "ধাপ ৩: সূত্রে মান বসিয়ে হিসাব সম্পন্ন করুন এবং সঠিক একক (Unit) সহ উত্তর হাইলাইট করুন।",
    ],
    sampleQuestion: "প্রশ্ন: উদ্দীপকের নিক্ষিপ্ত বস্তুর সর্বোচ্চ উচ্চতা (H) নির্ণয় করো।",
    sampleAnswer: "উত্তর:\nডানপাশে তথ্য:\nআদিবেগ, v₀ = 40 ms⁻¹\nনিক্ষেপণ কোণ, θ = 30°\nঅভিকর্ষজ ত্বরণ, g = 9.8 ms⁻²\nসর্বোচ্চ উচ্চতা, H = ?\n\nআমরা জানি,\nH = (v₀² sin² θ) / (2g)\n⇒ H = (40² × sin² 30°) / (2 × 9.8)\n⇒ H = (1600 × 0.25) / 19.6\n⇒ H = 400 / 19.6 ≈ 20.41 m\n\nঅতএব, নিক্ষিপ্ত বস্তুর সর্বোচ্চ উচ্চতা ২০.৪১ মিটার।",
    examinerWarning: "শেষে একক (যেমন: m, J, N, W) না লিখলে নিশ্চিত ১ নম্বর কাটা যাবে।",
  },
  {
    part: "ঘ",
    title: "উচ্চতর দক্ষতা (Higher Order Thinking)",
    marks: 4,
    description: "উচ্চতর তুলনামূলক গাণিতিক বিশ্লেষণ, দুটি ভিন্ন শর্তের তুলনা এবং পরিশেষে সুস্পষ্ট সিদ্ধান্তমূলক মন্তব্য।",
    framework: [
      "ধাপ ১: উদ্দীপকের ১ম ও ২য় পরিস্থিতির গাণিতিক সূত্র নির্ধারণ।",
      "ধাপ ২: ১ম ক্ষেত্রের মান বা শক্তি হিসাব।",
      "ধাপ ৩: ২য় ক্ষেত্রের পরিবর্তিত মান বা শক্তি হিসাব।",
      "ধাপ ৪: উভয় ফলাফলের তুলনা এবং চূড়ান্ত যৌক্তিক সিদ্ধান্ত (যেমন: 'হ্যাঁ, রানা বলটি ক্যাচ ধরতে পারবে' বা 'শক্তির সংরক্ষণশীলতা রক্ষিত হবে')।",
    ],
    sampleQuestion: "প্রশ্ন: উদ্দীপকের পরিস্থিতিতে গতিশক্তি ও স্থিতিশক্তির যোগফল সর্বদা ধ্রুব থাকবে কি না—গাণিতিকভাবে যাচাই করো।",
    sampleAnswer: "উত্তর:\nধাপ ১ (শীর্ষবিন্দু A-তে মোট শক্তি):\nএখানে গতিবেগ v = 0 ms⁻¹, তাই গতিশক্তি Ek = 0 J।\nস্থিতিশক্তি Ep = mgh = 2 × 9.8 × 50 = 980 J।\nমোট শক্তি E_A = Ek + Ep = 0 + 980 = 980 J।\n\nধাপ ২ (ভূমি স্পর্শের পূর্ব মুহূর্তে B-তে মোট শক্তি):\nএখানে উচ্চতা h = 0 m, তাই স্থিতিশক্তি Ep = 0 J।\nবেগ v² = 2gh = 2 × 9.8 × 50 = 980।\nগতিশক্তি Ek = 1/2 mv² = 1/2 × 2 × 980 = 980 J।\nমোট শক্তি E_B = Ek + Ep = 980 + 0 = 980 J।\n\nধাপ ৩ (সিদ্ধান্তমূলক মন্তব্য):\nযেহেতু শীর্ষবিন্দুতে মোট শক্তি (E_A) এবং ভূমি স্পর্শের মুহূর্তে মোট শক্তি (E_B) উভয়ের মানই ৯৮০ জুল, সুতরাং উদ্দীপকের বস্তুটির ক্ষেত্রে যান্ত্রিক শক্তির সংরক্ষণশীলতা নীতি যথাযথভাবে বজায় থাকবে।",
    examinerWarning: "গাণিতিক হিসাব ঠিক করার পরেও যদি শেষে ১-২ লাইনের স্পষ্ট যৌক্তিক মন্তব্য বা সিদ্ধান্ত না লেখা হয়, তবে ১ নম্বর কাটা যায়।",
  },
];

export function CQArchitect() {
  const [selectedPart, setSelectedPart] = useState<"ক" | "খ" | "গ" | "ঘ">("ক");
  const currentStep = CQ_GUIDES.find((g) => g.part === selectedPart) || CQ_GUIDES[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border shadow-xs bg-linear-to-r from-blue-500/10 via-card to-emerald-500/10">
        <CardHeader className="p-4 sm:p-6 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FileEdit className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                  <span>সৃজনশীল (CQ) আর্কিটেক্ট ও মার্কিং রুব্রিক</span>
                  <Badge variant="secondary" className="text-xs">
                    ১০/১০ সিক্রেট ফ্রেমওয়ার্ক
                  </Badge>
                </CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  বোর্ড পরীক্ষায় ক, খ, গ, ঘ কীভাবে লিখলে কোনো নম্বর কাটা যাবে না তার প্রমিত কাঠামো
                </p>
              </div>
            </div>

            {/* Part Switcher */}
            <div className="flex gap-1.5 bg-muted/40 p-1.5 rounded-xl border">
              {(["ক", "খ", "গ", "ঘ"] as const).map((part) => (
                <button
                  key={part}
                  type="button"
                  onClick={() => {
                    sfx.play("click");
                    setSelectedPart(part);
                  }}
                  className={cn(
                    "rounded-lg px-3.5 py-1.5 text-xs font-bold transition",
                    selectedPart === part
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {part} ({CQ_GUIDES.find((g) => g.part === part)?.marks} মার্ক)
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Framework & Sample Answer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Structure & Rules */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border shadow-2xs">
            <CardHeader className="p-4 sm:p-5 pb-2">
              <div className="flex items-center justify-between">
                <Badge className="font-bold text-xs bg-primary text-primary-foreground">
                  ({currentStep.part}) {currentStep.title} — {currentStep.marks} নম্বর
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-5 pt-2 space-y-4">
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {currentStep.description}
              </p>

              <div className="space-y-2 border-t pt-3">
                <div className="text-xs font-bold text-foreground">লেখার প্রমিত ধাপসমূহ:</div>
                {currentStep.framework.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{step}</span>
                  </div>
                ))}
              </div>

              {/* Examiner Warning */}
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 space-y-1">
                <div className="font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1.5 text-xs">
                  <AlertTriangle className="h-4 w-4" />
                  <span>পরীক্ষকের নম্বর কাটার ফাঁদ:</span>
                </div>
                <p className="text-xs text-rose-950 dark:text-rose-200 leading-relaxed font-medium">
                  {currentStep.examinerWarning}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Board Model Sample Answer */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="border shadow-2xs">
            <CardHeader className="p-4 sm:p-5 pb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <CardTitle className="text-sm sm:text-base font-bold">
                  বোর্ড আদর্শ নমুনা উত্তর (Model Answer)
                </CardTitle>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-5 pt-2 space-y-4">
              <div className="rounded-xl border bg-muted/30 p-3 text-xs sm:text-sm font-semibold text-foreground">
                {currentStep.sampleQuestion}
              </div>

              <div className="rounded-xl border bg-card p-4 text-xs sm:text-sm leading-relaxed whitespace-pre-line font-mono">
                {currentStep.sampleAnswer}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
