// ===================================================================
// MCQ Question Bank Seed Script — Higher Math 1st+2nd Paper এর ১১টা
// isImportant টপিক যেখানে আগে কোনো MCQ ছিল না
// -------------------------------------------------------------------
// seed-questions-physics-gaps.ts এর প্রমাণিত প্যাটার্ন অনুসরণ করে —
// DB অডিটে দেখা গেছে Higher Math এর সবচেয়ে বড় MCQ gap আছে। এই
// স্ক্রিপ্টে Higher Math 1st Paper এর ৫টা টপিকে (স্কেলার ও ভেক্টর
// গুণন, ত্রিকোণমিতিক অভেদ, যোগ ও বিয়োগ সূত্র, অন্তরীকরণের সূত্রাবলি,
// যোগজীকরণের সূত্রাবলি) এবং Higher Math 2nd Paper এর ৬টা টপিকে
// (অসমতার সমাধান, সীমাবদ্ধতা ও উদ্দেশ্য ফাংশন, ত্রিকোণমিতিক
// সমীকরণের সমাধান, বলের লব্ধি, প্রক্ষেপক গতি, সম্ভাবনা তত্ত্ব) — মোট
// ১১টা টপিকে ৫টা করে বাস্তব MCQ প্রশ্ন যোগ করা হয়েছে।
//
// ⚠️ "প্রক্ষেপক গতি" নামে DB তে দুটো টপিক আছে (Physics 1st Paper ও
// Higher Math 2nd Paper এ) — CQ ও MCQ ফিচারে আবিষ্কৃত collision
// বাগের শিক্ষা অনুযায়ী এখানে subject-aware লুকআপ ব্যবহার করা হয়েছে।
//
// সব সংখ্যাগত হিসাব Python (sympy সহ) দিয়ে আগে থেকে ভেরিফাই করা
// হয়েছে — ভেক্টর ডট/ক্রস প্রোডাক্ট, ত্রিকোণমিতিক অভেদ প্রমাণ, যোগ
// সূত্র প্রয়োগ, ডেরিভেটিভ/ইন্টিগ্রাল গণনা, অসমতার সমাধান সেট, LP
// কৌণিক বিন্দু বিশ্লেষণ, ত্রিকোণমিতিক সমীকরণের সমাধান, সামান্তরিক
// সূত্রে লব্ধি বল, প্রক্ষেপক গতির H/T/R, সম্ভাবনার কম্বিনেটরিক্স।
//
// রান করার নিয়ম: pnpm exec tsx prisma/seed-questions-hmath-gaps.ts
// idempotent — টপিকের পুরনো MCQ মুছে নতুন করে বসাবে।
// ===================================================================
import { PrismaClient, Difficulty } from "@prisma/client";

import { assertDestructiveSeedAllowed } from "./seed-safety";
const prisma = new PrismaClient();

interface QuestionSeed {
  text: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: Difficulty;
}

interface TopicQuestionSeed {
  topicName: string;
  subjectName: string; // topic name collision এড়াতে subject filter
  questions: QuestionSeed[];
}

const seedData: TopicQuestionSeed[] = [
  {
    topicName: "স্কেলার ও ভেক্টর গুণন",
    subjectName: "উচ্চতর গণিত ১ম পত্র",
    questions: [
      {
        text: "দুটি ভেক্টরের ডট প্রোডাক্ট শূন্য হলে ভেক্টর দুটি পরস্পর কী হয়?",
        options: ["সমান্তরাল", "লম্ব", "বিপরীতমুখী", "অসংজ্ঞায়িত"],
        correctAnswer: "লম্ব",
        explanation:
          "A·B = |A||B|cosθ সূত্রে A·B=0 হলে cosθ=0, অর্থাৎ θ=90° — অর্থাৎ ভেক্টর দুটি পরস্পর লম্ব।",
        difficulty: "EASY",
      },
      {
        text: "দুটি ভেক্টরের ক্রস প্রোডাক্টের ফলাফল কী ধরনের রাশি?",
        options: ["স্কেলার রাশি", "ভেক্টর রাশি", "জটিল রাশি", "মাত্রাহীন রাশি"],
        correctAnswer: "ভেক্টর রাশি",
        explanation:
          "দুটি ভেক্টরের ক্রস প্রোডাক্ট (A×B) একটি ভেক্টর রাশি, যা মূল দুটি ভেক্টরের সমতলে লম্ব এবং ডানহাতি স্ক্রু নিয়মে দিক নির্ণীত হয়।",
        difficulty: "EASY",
      },
      {
        text: "A = i+2j+2k এবং B = 2i-j+2k হলে A·B এর মান কত?",
        options: ["২", "৪", "৬", "৮"],
        correctAnswer: "৪",
        explanation: "A·B = (1)(2)+(2)(-1)+(2)(2) = 2-2+4 = 4।",
        difficulty: "MEDIUM",
      },
      {
        text: "দুটি ভেক্টর সমান্তরাল হলে তাদের ক্রস প্রোডাক্টের মান কত হয়?",
        options: ["সর্বোচ্চ", "শূন্য", "|A||B|", "অসংজ্ঞায়িত"],
        correctAnswer: "শূন্য",
        explanation:
          "|A×B| = |A||B|sinθ সূত্রে সমান্তরাল ভেক্টরের ক্ষেত্রে θ=0° বা 180°, তাই sinθ=0 এবং ক্রস প্রোডাক্টের মান শূন্য হয়।",
        difficulty: "MEDIUM",
      },
      {
        text: "দুটি ভেক্টরকে সন্নিহিত বাহু ধরে গঠিত ত্রিভুজের ক্ষেত্রফল নির্ণয়ের সূত্র কোনটি?",
        options: ["|a×b|", "(1/2)|a×b|", "|a·b|", "(1/2)|a·b|"],
        correctAnswer: "(1/2)|a×b|",
        explanation:
          "দুটি ভেক্টরকে সন্নিহিত বাহু ধরে গঠিত ত্রিভুজের ক্ষেত্রফল = (1/2)|a×b|, যেখানে সামান্তরিকের ক্ষেত্রফল হয় |a×b| (ত্রিভুজ সামান্তরিকের অর্ধেক)।",
        difficulty: "HARD",
      },
    ],
  },
  {
    topicName: "ত্রিকোণমিতিক অভেদ",
    subjectName: "উচ্চতর গণিত ১ম পত্র",
    questions: [
      {
        text: "sin²θ + cos²θ এর মান কত?",
        options: ["০", "১", "২", "θ এর উপর নির্ভরশীল"],
        correctAnswer: "১",
        explanation:
          "মৌলিক ত্রিকোণমিতিক অভেদ অনুযায়ী sin²θ+cos²θ=1, যা যেকোনো θ এর জন্য সত্য (পিথাগোরাসের উপপাদ্য থেকে প্রতিষ্ঠিত)।",
        difficulty: "EASY",
      },
      {
        text: "1+tan²θ এর মান কোন রাশির সমান?",
        options: ["sin²θ", "cos²θ", "sec²θ", "cosec²θ"],
        correctAnswer: "sec²θ",
        explanation:
          "sin²θ+cos²θ=1 কে cos²θ দিয়ে ভাগ করলে 1+tan²θ=sec²θ পাওয়া যায়।",
        difficulty: "EASY",
      },
      {
        text: "θ=60° হলে 1+tan²θ এর মান কত?",
        options: ["২", "৩", "৪", "৫"],
        correctAnswer: "৪",
        explanation:
          "tan60°=√3, তাই 1+tan²60°=1+3=4। এটি sec²60°=(1/cos60°)²=(1/0.5)²=4 এর সাথেও মিলে যায়।",
        difficulty: "MEDIUM",
      },
      {
        text: "sin(90°-θ) এর মান কোনটির সমান?",
        options: ["sinθ", "cosθ", "tanθ", "cotθ"],
        correctAnswer: "cosθ",
        explanation:
          "কো-ফাংশন অভেদ অনুযায়ী sin(90°-θ)=cosθ, কারণ পরস্পর পূরক কোণের সাইন ও কোসাইন মান পরস্পর সমান।",
        difficulty: "MEDIUM",
      },
      {
        text: "1+cot²θ কোন রাশির সমান?",
        options: ["sec²θ", "cosec²θ", "tan²θ", "sin²θ"],
        correctAnswer: "cosec²θ",
        explanation:
          "sin²θ+cos²θ=1 কে sin²θ দিয়ে ভাগ করলে 1+cot²θ=cosec²θ পাওয়া যায়।",
        difficulty: "HARD",
      },
    ],
  },
  {
    topicName: "যোগ ও বিয়োগ সূত্র",
    subjectName: "উচ্চতর গণিত ১ম পত্র",
    questions: [
      {
        text: "sin(A+B) এর সূত্র কোনটি?",
        options: [
          "sinAcosB+cosAsinB",
          "sinAcosB-cosAsinB",
          "cosAcosB-sinAsinB",
          "cosAcosB+sinAsinB",
        ],
        correctAnswer: "sinAcosB+cosAsinB",
        explanation: "যৌগিক কোণের সাইন সূত্র: sin(A+B) = sinAcosB + cosAsinB।",
        difficulty: "EASY",
      },
      {
        text: "cos(A-B) এর সূত্র কোনটি?",
        options: [
          "cosAcosB-sinAsinB",
          "cosAcosB+sinAsinB",
          "sinAcosB-cosAsinB",
          "sinAsinB-cosAcosB",
        ],
        correctAnswer: "cosAcosB+sinAsinB",
        explanation: "যৌগিক কোণের কোসাইন সূত্র: cos(A-B) = cosAcosB + sinAsinB।",
        difficulty: "EASY",
      },
      {
        text: "sin(A+B) সূত্র ব্যবহার করে sin90° এর মান কত পাওয়া যায় (A=60°, B=30° ধরে)?",
        options: ["০", "০.৫", "১", "√3/2"],
        correctAnswer: "১",
        explanation:
          "sin(60°+30°) = sin60°cos30°+cos60°sin30° = (√3/2)(√3/2)+(1/2)(1/2) = 3/4+1/4 = 1, যা sin90°=1 এর সাথে মিলে যায়।",
        difficulty: "MEDIUM",
      },
      {
        text: "দ্বিগুণ কোণের সূত্র sin2A এর সঠিক রূপ কোনটি?",
        options: ["2sinA", "2sinAcosA", "sin²A", "2cosA"],
        correctAnswer: "2sinAcosA",
        explanation:
          "যোগ সূত্রে A=B বসিয়ে: sin(A+A)=sinAcosA+cosAsinA=2sinAcosA, তাই sin2A=2sinAcosA।",
        difficulty: "MEDIUM",
      },
      {
        text: "tan(A+B) এর সূত্র কোনটি?",
        options: [
          "(tanA+tanB)/(1-tanAtanB)",
          "(tanA-tanB)/(1+tanAtanB)",
          "(tanA+tanB)/(1+tanAtanB)",
          "tanA×tanB",
        ],
        correctAnswer: "(tanA+tanB)/(1-tanAtanB)",
        explanation:
          "tan(A+B) = (tanA+tanB)/(1-tanAtanB) — sin(A+B) কে cos(A+B) দিয়ে ভাগ করে প্রতিষ্ঠিত হয়।",
        difficulty: "HARD",
      },
    ],
  },
  {
    topicName: "অন্তরীকরণের সূত্রাবলি",
    subjectName: "উচ্চতর গণিত ১ম পত্র",
    questions: [
      {
        text: "d/dx(xⁿ) এর মান কত?",
        options: ["xⁿ⁻¹", "nxⁿ⁻¹", "nxⁿ", "xⁿ/n"],
        correctAnswer: "nxⁿ⁻¹",
        explanation: "ঘাত নিয়ম (Power Rule) অনুযায়ী d/dx(xⁿ) = nxⁿ⁻¹।",
        difficulty: "EASY",
      },
      {
        text: "d/dx(sinx) এর মান কত?",
        options: ["cosx", "-cosx", "-sinx", "sinx"],
        correctAnswer: "cosx",
        explanation: "d/dx(sinx) = cosx — এটি একটি মৌলিক ত্রিকোণমিতিক অন্তরজ সূত্র।",
        difficulty: "EASY",
      },
      {
        text: "f(x) = x³+2x²-5x+3 হলে f'(2) এর মান কত?",
        options: ["৭", "১১", "১৫", "১৯"],
        correctAnswer: "১৫",
        explanation: "f'(x)=3x²+4x-5। f'(2)=3(4)+4(2)-5=12+8-5=15।",
        difficulty: "MEDIUM",
      },
      {
        text: "গুণফল নিয়ম (Product Rule) অনুযায়ী d/dx(uv) এর সঠিক রূপ কোনটি?",
        options: [
          "u'v'",
          "u'v+uv'",
          "u'v-uv'",
          "(u'v-uv')/v²",
        ],
        correctAnswer: "u'v+uv'",
        explanation:
          "গুণফল নিয়ম: d/dx(uv) = v(du/dx)+u(dv/dx) = u'v+uv'।",
        difficulty: "MEDIUM",
      },
      {
        text: "g(x) = sinx·cosx হলে g'(x) এর সরলীকৃত রূপ কোনটি?",
        options: ["cos2x", "sin2x", "-cos2x", "2sinxcosx"],
        correctAnswer: "cos2x",
        explanation:
          "গুণফল নিয়মে g'(x)=cosx·cosx+sinx·(-sinx)=cos²x-sin²x=cos2x (দ্বিগুণ কোণের সূত্র প্রয়োগে)।",
        difficulty: "HARD",
      },
    ],
  },
  {
    topicName: "যোগজীকরণের সূত্রাবলি",
    subjectName: "উচ্চতর গণিত ১ম পত্র",
    questions: [
      {
        text: "∫xⁿdx এর মান কত (n≠-1)?",
        options: ["xⁿ⁺¹/(n+1)+C", "xⁿ⁻¹/(n-1)+C", "nxⁿ⁻¹+C", "xⁿ+C"],
        correctAnswer: "xⁿ⁺¹/(n+1)+C",
        explanation: "যোগজীকরণের মৌলিক সূত্র: ∫xⁿdx = xⁿ⁺¹/(n+1)+C (n≠-1)।",
        difficulty: "EASY",
      },
      {
        text: "∫sinx dx এর মান কত?",
        options: ["cosx+C", "-cosx+C", "sinx+C", "-sinx+C"],
        correctAnswer: "-cosx+C",
        explanation: "∫sinx dx = -cosx+C — যেহেতু d/dx(-cosx)=sinx।",
        difficulty: "EASY",
      },
      {
        text: "∫(4x³-6x)dx এর মান কত?",
        options: ["x⁴-3x²+C", "4x⁴-6x²+C", "x⁴-6x²+C", "x³-3x+C"],
        correctAnswer: "x⁴-3x²+C",
        explanation: "∫4x³dx=x⁴, ∫6xdx=3x²। সুতরাং ∫(4x³-6x)dx = x⁴-3x²+C।",
        difficulty: "MEDIUM",
      },
      {
        text: "∫₁²(4x³-6x)dx এর নির্দিষ্ট যোগজের মান কত?",
        options: ["৩", "৪", "৫", "৬"],
        correctAnswer: "৬",
        explanation:
          "F(x)=x⁴-3x²। F(2)-F(1) = (16-12)-(1-3) = 4-(-2) = 6।",
        difficulty: "HARD",
      },
      {
        text: "নির্দিষ্ট যোগজ ∫ₐᵇf(x)dx এর জ্যামিতিক অর্থ কী?",
        options: [
          "বক্ররেখার ঢাল",
          "বক্ররেখা ও x-অক্ষের মধ্যবর্তী ক্ষেত্রফল",
          "বক্ররেখার দৈর্ঘ্য",
          "বক্ররেখার সর্বোচ্চ বিন্দু",
        ],
        correctAnswer: "বক্ররেখা ও x-অক্ষের মধ্যবর্তী ক্ষেত্রফল",
        explanation:
          "নির্দিষ্ট যোগজ ∫ₐᵇf(x)dx বক্ররেখা y=f(x), x-অক্ষ এবং x=a, x=b রেখা দ্বারা আবদ্ধ ক্ষেত্রফল নির্দেশ করে।",
        difficulty: "MEDIUM",
      },
    ],
  },
  {
    topicName: "অসমতার সমাধান",
    subjectName: "উচ্চতর গণিত ২য় পত্র",
    questions: [
      {
        text: "2x-5>3 অসমতার সমাধান কোনটি?",
        options: ["x>4", "x<4", "x>1", "x<1"],
        correctAnswer: "x>4",
        explanation: "2x-5>3 ⇒ 2x>8 ⇒ x>4।",
        difficulty: "EASY",
      },
      {
        text: "x²-4<0 অসমতার সমাধান সেট কোনটি?",
        options: ["x>2", "x<-2 অথবা x>2", "-2<x<2", "x=2"],
        correctAnswer: "-2<x<2",
        explanation:
          "x²-4=(x-2)(x+2)<0। মূলদ্বয় -2 ও 2 এর মধ্যবর্তী অঞ্চলে রাশিটি ঋণাত্মক হয়, তাই সমাধান -2<x<2।",
        difficulty: "MEDIUM",
      },
      {
        text: "অসমতার উভয়পক্ষকে একটি ঋণাত্মক সংখ্যা দ্বারা গুণ করলে কী ঘটে?",
        options: [
          "অসমতার দিক অপরিবর্তিত থাকে",
          "অসমতার দিক পরিবর্তিত হয়",
          "অসমতা সমীকরণে পরিণত হয়",
          "কোনো প্রভাব পড়ে না",
        ],
        correctAnswer: "অসমতার দিক পরিবর্তিত হয়",
        explanation:
          "অসমতার উভয়পক্ষকে ঋণাত্মক সংখ্যা দিয়ে গুণ/ভাগ করলে অসমতার দিক (< থেকে > বা উল্টো) পরিবর্তিত হয়ে যায়।",
        difficulty: "EASY",
      },
      {
        text: "|x-3|≤2 অসমতার সমাধান সেট কোনটি?",
        options: ["1≤x≤5", "x≤5", "x≥1", "x=5"],
        correctAnswer: "1≤x≤5",
        explanation: "|x-3|≤2 ⇒ -2≤x-3≤2 ⇒ 1≤x≤5।",
        difficulty: "MEDIUM",
      },
      {
        text: "দ্বিঘাত অসমতা (x-x₁)(x-x₂)≥0 এর সমাধান কোন অঞ্চলে থাকে (x₁<x₂ ধরে)?",
        options: [
          "শুধু মূলদ্বয়ের মধ্যবর্তী অঞ্চলে",
          "মূলদ্বয়ের বাইরের অঞ্চলে (মূলদ্বয়সহ)",
          "শুধু x₁ বিন্দুতে",
          "কোনো সমাধান নেই",
        ],
        correctAnswer: "মূলদ্বয়ের বাইরের অঞ্চলে (মূলদ্বয়সহ)",
        explanation:
          "(x-x₁)(x-x₂)≥0 (≥ চিহ্ন) হলে সমাধান মূলদ্বয়ের বাইরের অঞ্চলে (x≤x₁ অথবা x≥x₂) থাকে, কারণ পরাবৃত্ত-আকৃতির রাশিটি মূলদ্বয়ের বাইরে ধনাত্মক হয়।",
        difficulty: "HARD",
      },
    ],
  },
  {
    topicName: "সীমাবদ্ধতা ও উদ্দেশ্য ফাংশন",
    subjectName: "উচ্চতর গণিত ২য় পত্র",
    questions: [
      {
        text: "যোগাশ্রয়ী প্রোগ্রামে যে রাশিকে সর্বাধিক/সর্বনিম্ন করতে হয় তাকে কী বলে?",
        options: ["সীমাবদ্ধতা", "উদ্দেশ্য ফাংশন", "সিদ্ধান্ত চলক", "সম্ভাব্যতা ক্ষেত্র"],
        correctAnswer: "উদ্দেশ্য ফাংশন",
        explanation:
          "উদ্দেশ্য ফাংশন (Objective Function) হলো সেই রাশি যাকে সর্বাধিক (maximize) বা সর্বনিম্ন (minimize) করার লক্ষ্যে সমস্যাটি গঠন করা হয়।",
        difficulty: "EASY",
      },
      {
        text: "যোগাশ্রয়ী প্রোগ্রামে অ-ঋণাত্মকতা শর্ত কী নির্দেশ করে?",
        options: [
          "x এবং y ধনাত্মক পূর্ণসংখ্যা হতে হবে",
          "x≥0, y≥0",
          "উদ্দেশ্য ফাংশন ধনাত্মক হবে",
          "সীমাবদ্ধতা রৈখিক হবে",
        ],
        correctAnswer: "x≥0, y≥0",
        explanation:
          "অ-ঋণাত্মকতা শর্ত অনুযায়ী চলকের মান ঋণাত্মক হতে পারবে না (x≥0, y≥0), কারণ বাস্তব সমস্যায় (উৎপাদন পরিমাণ ইত্যাদি) ঋণাত্মক মান অর্থহীন।",
        difficulty: "EASY",
      },
      {
        text: "Z=5x+4y উদ্দেশ্য ফাংশনের জন্য কৌণিক বিন্দু (2,2) এ Z এর মান কত?",
        options: ["১৪", "১৬", "১৮", "২০"],
        correctAnswer: "১৮",
        explanation: "Z = 5(2)+4(2) = 10+8 = 18।",
        difficulty: "MEDIUM",
      },
      {
        text: "যোগাশ্রয়ী প্রোগ্রামের সমাধান পদ্ধতিতে সর্বোচ্চ/সর্বনিম্ন মান কোথায় পাওয়া যায়?",
        options: [
          "সম্ভাব্যতা ক্ষেত্রের কেন্দ্রে",
          "সম্ভাব্যতা ক্ষেত্রের কৌণিক বিন্দুতে",
          "মূলবিন্দুতে সবসময়",
          "সীমাবদ্ধতা রেখার মধ্যবিন্দুতে",
        ],
        correctAnswer: "সম্ভাব্যতা ক্ষেত্রের কৌণিক বিন্দুতে",
        explanation:
          "যোগাশ্রয়ী প্রোগ্রামের একটি মৌলিক উপপাদ্য অনুযায়ী উদ্দেশ্য ফাংশনের সর্বোচ্চ/সর্বনিম্ন মান সম্ভাব্যতা ক্ষেত্রের কোনো একটি কৌণিক বিন্দুতেই পাওয়া যায়।",
        difficulty: "MEDIUM",
      },
      {
        text: "যোগাশ্রয়ী প্রোগ্রামের জন্য উদ্দেশ্য ফাংশন ও সীমাবদ্ধতা কী প্রকৃতির হতে হবে?",
        options: ["দ্বিঘাত", "রৈখিক", "ত্রিকোণমিতিক", "সূচকীয়"],
        correctAnswer: "রৈখিক",
        explanation:
          "যোগাশ্রয়ী প্রোগ্রামের (Linear Programming) মূল শর্ত হলো উদ্দেশ্য ফাংশন ও সব সীমাবদ্ধতা অবশ্যই রৈখিক (linear) হতে হবে।",
        difficulty: "HARD",
      },
    ],
  },
  {
    topicName: "ত্রিকোণমিতিক সমীকরণের সমাধান",
    subjectName: "উচ্চতর গণিত ২য় পত্র",
    questions: [
      {
        text: "sinθ=sinα হলে θ এর সাধারণ সমাধান কোনটি?",
        options: [
          "θ=2nπ±α",
          "θ=nπ+(-1)ⁿα",
          "θ=nπ+α",
          "θ=nπ-α",
        ],
        correctAnswer: "θ=nπ+(-1)ⁿα",
        explanation: "sinθ=sinα এর সাধারণ সমাধান θ=nπ+(-1)ⁿα, যেখানে n যেকোনো পূর্ণসংখ্যা।",
        difficulty: "EASY",
      },
      {
        text: "cosθ=cosα হলে θ এর সাধারণ সমাধান কোনটি?",
        options: [
          "θ=nπ+(-1)ⁿα",
          "θ=2nπ±α",
          "θ=nπ+α",
          "θ=(2n+1)π±α",
        ],
        correctAnswer: "θ=2nπ±α",
        explanation: "cosθ=cosα এর সাধারণ সমাধান θ=2nπ±α, যেখানে n যেকোনো পূর্ণসংখ্যা।",
        difficulty: "EASY",
      },
      {
        text: "cosθ=1/2 এর সমাধান 0≤θ<2π পরিসরে কোনগুলো?",
        options: ["π/3, 5π/3", "π/6, 5π/6", "π/4, 7π/4", "π/2, 3π/2"],
        correctAnswer: "π/3, 5π/3",
        explanation:
          "cos(π/3)=1/2, তাই সাধারণ সমাধান θ=2nπ±π/3। 0≤θ<2π পরিসরে θ=π/3 এবং θ=2π-π/3=5π/3।",
        difficulty: "MEDIUM",
      },
      {
        text: "sinθ=0 এর সাধারণ সমাধান কোনটি?",
        options: ["θ=nπ", "θ=(2n+1)π/2", "θ=2nπ", "θ=nπ/2"],
        correctAnswer: "θ=nπ",
        explanation: "sinθ=0 হয় যখন θ=0,π,2π,... — অর্থাৎ সাধারণ সমাধান θ=nπ (n∈ℤ)।",
        difficulty: "MEDIUM",
      },
      {
        text: "tanθ=1 এর সাধারণ সমাধান কোনটি?",
        options: ["θ=nπ+π/4", "θ=2nπ+π/4", "θ=nπ+π/2", "θ=nπ-π/4"],
        correctAnswer: "θ=nπ+π/4",
        explanation:
          "tan(π/4)=1, tanθ=tanα এর সাধারণ সমাধান θ=nπ+α অনুযায়ী θ=nπ+π/4।",
        difficulty: "HARD",
      },
    ],
  },
  {
    topicName: "বলের লব্ধি",
    subjectName: "উচ্চতর গণিত ২য় পত্র",
    questions: [
      {
        text: "সামান্তরিক সূত্র অনুযায়ী দুটি বল P ও Q এর মধ্যবর্তী কোণ α হলে লব্ধি R এর সূত্র কোনটি?",
        options: [
          "R=P+Q",
          "R=√(P²+Q²+2PQcosα)",
          "R=√(P²+Q²-2PQcosα)",
          "R=PQsinα",
        ],
        correctAnswer: "R=√(P²+Q²+2PQcosα)",
        explanation: "সামান্তরিক সূত্র অনুযায়ী লব্ধি R = √(P²+Q²+2PQcosα)।",
        difficulty: "EASY",
      },
      {
        text: "দুটি সমান মানের বল (P=Q) পরস্পর লম্বভাবে (90° কোণে) ক্রিয়া করলে লব্ধি কত হবে?",
        options: ["P", "P√2", "2P", "P/√2"],
        correctAnswer: "P√2",
        explanation:
          "R=√(P²+P²+2P·P·cos90°)=√(2P²+0)=√2P²=P√2 (যেহেতু cos90°=0)।",
        difficulty: "MEDIUM",
      },
      {
        text: "দুটি বল P=10N এবং Q=10N যদি 60° কোণে ক্রিয়া করে, তাহলে লব্ধি R এর মান কত (নিকটতম মানে)?",
        options: ["১০ N", "১৩ N", "১৭.৩২ N", "২০ N"],
        correctAnswer: "১৭.৩২ N",
        explanation:
          "R=√(10²+10²+2×10×10×cos60°)=√(100+100+100)=√300≈17.32 N (cos60°=0.5)।",
        difficulty: "HARD",
      },
      {
        text: "লামির সূত্র কোন পরিস্থিতিতে প্রযোজ্য?",
        options: [
          "দুটি বল সাম্যাবস্থায় থাকলে",
          "তিনটি সমবিন্দু বল সাম্যাবস্থায় থাকলে",
          "যেকোনো সংখ্যক বলের ক্ষেত্রে সবসময়",
          "শুধু সমান বলের ক্ষেত্রে",
        ],
        correctAnswer: "তিনটি সমবিন্দু বল সাম্যাবস্থায় থাকলে",
        explanation:
          "লামির সূত্র তিনটি সমবিন্দু (একই বিন্দুতে ক্রিয়াশীল) বল সাম্যাবস্থায় থাকলে প্রযোজ্য — প্রতিটি বল অপর দুটির অন্তর্ভুক্ত কোণের সাইনের সমানুপাতিক হয়।",
        difficulty: "MEDIUM",
      },
      {
        text: "কোনো বস্তুকণা সাম্যাবস্থায় থাকলে তার উপর ক্রিয়ারত সব বলের লব্ধি কত হবে?",
        options: ["সর্বোচ্চ", "শূন্য", "ধ্রুব কিন্তু শূন্য নয়", "অসংজ্ঞায়িত"],
        correctAnswer: "শূন্য",
        explanation:
          "সাম্যাবস্থার শর্ত অনুযায়ী কোনো বস্তুকণা সাম্যাবস্থায় থাকলে তার উপর ক্রিয়ারত সব বলের লব্ধি অবশ্যই শূন্য হবে (ΣFₓ=0, ΣFᵧ=0)।",
        difficulty: "EASY",
      },
    ],
  },
  {
    topicName: "প্রক্ষেপক গতি",
    subjectName: "উচ্চতর গণিত ২য় পত্র",
    questions: [
      {
        text: "প্রক্ষেপক গতিতে গতিপথের সমীকরণ কোন ধরনের বক্ররেখা নির্দেশ করে?",
        options: ["বৃত্ত", "উপবৃত্ত", "পরাবৃত্ত (প্যারাবোলা)", "অধিবৃত্ত"],
        correctAnswer: "পরাবৃত্ত (প্যারাবোলা)",
        explanation:
          "প্রক্ষেপক গতির সমীকরণ y=xtanα-(gx²)/(2u²cos²α) — এটি একটি পরাবৃত্তের (parabola) সমীকরণের রূপ।",
        difficulty: "EASY",
      },
      {
        text: "সর্বাধিক আনুভূমিক পাল্লার জন্য নিক্ষেপণ কোণ কত হওয়া উচিত?",
        options: ["৩০°", "৪৫°", "৬০°", "৯০°"],
        correctAnswer: "৪৫°",
        explanation:
          "R=u²sin2α/g সূত্রে sin2α সর্বোচ্চ (=1) হয় যখন 2α=90° অর্থাৎ α=45°।",
        difficulty: "EASY",
      },
      {
        text: "একটি বস্তুকে u=30 একক আদিবেগে ৪৫° কোণে নিক্ষেপ করা হলে (g=10), সর্বাধিক উচ্চতা কত হবে?",
        options: ["১৫", "২২.৫", "৩০", "৪৫"],
        correctAnswer: "২২.৫",
        explanation:
          "H=u²sin²α/2g=(30)²×(sin45°)²/(2×10)=900×0.5/20=22.5।",
        difficulty: "MEDIUM",
      },
      {
        text: "প্রক্ষেপক গতির বিচরণকাল (Time of Flight) নির্ণয়ের সূত্র কোনটি?",
        options: ["u sinα/g", "2u sinα/g", "u²sin2α/g", "u²sin²α/2g"],
        correctAnswer: "2u sinα/g",
        explanation:
          "বিচরণকাল T=2u sinα/g — এটি বস্তুর উত্থান ও পতনের মোট সময় নির্দেশ করে।",
        difficulty: "MEDIUM",
      },
      {
        text: "প্রক্ষেপক গতিতে সর্বোচ্চ বিন্দুতে বেগের মান কত হয়?",
        options: [
          "শূন্য",
          "শুধু আনুভূমিক উপাংশ (u cosα)",
          "শুধু উল্লম্ব উপাংশ (u sinα)",
          "আদিবেগের সমান",
        ],
        correctAnswer: "শুধু আনুভূমিক উপাংশ (u cosα)",
        explanation:
          "সর্বোচ্চ বিন্দুতে উল্লম্ব বেগ শূন্য হয়ে যায় (উর্ধ্বগতি থেমে যায়), কিন্তু আনুভূমিক বেগ (u cosα) অপরিবর্তিত থাকে — তাই মোট বেগ শুধু আনুভূমিক উপাংশের সমান।",
        difficulty: "HARD",
      },
    ],
  },
  {
    topicName: "সম্ভাবনা তত্ত্ব",
    subjectName: "উচ্চতর গণিত ২য় পত্র",
    questions: [
      {
        text: "সম্ভাবনার সংজ্ঞা অনুযায়ী P(E) এর সূত্র কোনটি?",
        options: [
          "n(S)/n(E)",
          "n(E)/n(S)",
          "n(E)×n(S)",
          "n(E)+n(S)",
        ],
        correctAnswer: "n(E)/n(S)",
        explanation:
          "কোনো ঘটনা E এর সম্ভাবনা P(E) = n(E)/n(S), যেখানে n(E) অনুকূল ফলাফল সংখ্যা ও n(S) মোট ফলাফল সংখ্যা (নমুনাক্ষেত্র)।",
        difficulty: "EASY",
      },
      {
        text: "P(E) এর মান কোন সীমার মধ্যে থাকে?",
        options: ["0 থেকে ∞", "0 থেকে 1", "-1 থেকে 1", "1 থেকে 100"],
        correctAnswer: "0 থেকে 1",
        explanation: "সম্ভাবনার মৌলিক ধর্ম অনুযায়ী 0≤P(E)≤1 — কোনো সম্ভাবনা ঋণাত্মক বা ১ এর বেশি হতে পারে না।",
        difficulty: "EASY",
      },
      {
        text: "দুটি ছক্কা একসাথে নিক্ষেপ করলে দুটি সংখ্যার সমষ্টি ৭ হওয়ার সম্ভাবনা কত?",
        options: ["1/6", "1/9", "5/36", "1/12"],
        correctAnswer: "1/6",
        explanation:
          "মোট ফলাফল n(S)=36। সমষ্টি ৭ হওয়ার অনুকূল ফলাফল: (1,6),(2,5),(3,4),(4,3),(5,2),(6,1) = ৬টি। P=6/36=1/6।",
        difficulty: "MEDIUM",
      },
      {
        text: "দুটি ঘটনা A ও B পরস্পর বর্জনশীল (mutually exclusive) হলে P(A∪B) এর সূত্র কোনটি?",
        options: [
          "P(A)+P(B)-P(A∩B)",
          "P(A)+P(B)",
          "P(A)×P(B)",
          "P(A)-P(B)",
        ],
        correctAnswer: "P(A)+P(B)",
        explanation:
          "পরস্পর বর্জনশীল ঘটনার ক্ষেত্রে P(A∩B)=0, তাই সাধারণ যোগ সূত্র P(A∪B)=P(A)+P(B)-P(A∩B) সরল হয়ে P(A∪B)=P(A)+P(B) হয়।",
        difficulty: "MEDIUM",
      },
      {
        text: "কোনো ঘটনা E না ঘটার সম্ভাবনা P(না-E) কীভাবে নির্ণয় করা হয়?",
        options: ["P(E)", "1-P(E)", "1+P(E)", "P(E)²"],
        correctAnswer: "1-P(E)",
        explanation:
          "কোনো ঘটনা E এবং তার পরিপূরক ঘটনা (না-E) এর সম্ভাবনার সমষ্টি সর্বদা ১, তাই P(না-E)=1-P(E)।",
        difficulty: "HARD",
      },
    ],
  },
];

async function main() {
  assertDestructiveSeedAllowed("seed-questions-hmath-gaps.ts");
  console.log("🌱 Higher Math MCQ Gap Seeding শুরু হচ্ছে...\n");

  let totalCreated = 0;
  const topicsNotFound: string[] = [];

  for (const entry of seedData) {
    // ⚠️ subject filter সহ খোঁজা হচ্ছে যাতে "প্রক্ষেপক গতি" এর মতো
    // ডুপ্লিকেট টপিক নামের কারণে ভুল subject এর টপিক ম্যাচ না হয়
    const topic = await prisma.topic.findFirst({
      where: {
        name: entry.topicName,
        chapter: { subject: { name: entry.subjectName } },
      },
    });

    if (!topic) {
      topicsNotFound.push(`${entry.topicName} (${entry.subjectName})`);
      continue;
    }

    // আগের প্রশ্ন মুছে ফেলা হচ্ছে (idempotent রাখার জন্য)
    await prisma.question.deleteMany({ where: { topicId: topic.id } });

    await prisma.question.createMany({
      data: entry.questions.map((q) => ({
        topicId: topic.id,
        type: "MCQ" as const,
        text: q.text,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        difficulty: q.difficulty,
      })),
    });

    console.log(`✅ ${entry.topicName} (${entry.subjectName}) — ${entry.questions.length}টি প্রশ্ন যোগ হলো`);
    totalCreated += entry.questions.length;
  }

  if (topicsNotFound.length > 0) {
    console.log(`\n⚠️  এই টপিকগুলো পাওয়া যায়নি: ${topicsNotFound.join(", ")}`);
  }

  console.log(`\n✅ মোট ${totalCreated}টি প্রশ্ন সিড করা হলো!`);
}

main()
  .catch((e) => {
    console.error("❌ সমস্যা হয়েছে:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
