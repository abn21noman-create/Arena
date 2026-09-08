// ===================================================================
// Admission Prep Question Bank Seed Script
// -------------------------------------------------------------------
// Medical/DU 'ক' ইউনিট/BUET-স্তরের বাস্তব ও যাচাইকৃত MCQ প্রশ্ন।
// HSC মূল Question ব্যাংক থেকে সম্পূর্ণ স্বতন্ত্র (AdmissionQuestion মডেল)।
// এটা idempotent — বার বার চালালে আগের admission প্রশ্ন মুছে নতুন করে বসাবে।
//
// রান করার নিয়ম: pnpm db:seed-admission-questions
// ===================================================================
import { PrismaClient, Difficulty, AdmissionExamType, AdmissionSubject } from "@prisma/client";

import { assertDestructiveSeedAllowed } from "./seed-safety";
const prisma = new PrismaClient();

interface AdmissionQuestionSeed {
  examType: AdmissionExamType;
  subject: AdmissionSubject;
  text: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: Difficulty;
}

const questions: AdmissionQuestionSeed[] = [
  // ==================== MEDICAL — Biology ====================
  {
    examType: "MEDICAL",
    subject: "BIOLOGY",
    text: "মানবদেহের ক্ষুদ্রতম হাড় কোনটি?",
    options: ["স্টেপিস", "ফিমার", "হিউমেরাস", "ম্যালিয়াস"],
    correctAnswer: "স্টেপিস",
    explanation: "স্টেপিস (Stapes) মধ্যকর্ণে অবস্থিত মানবদেহের ক্ষুদ্রতম হাড়।",
    difficulty: "MEDIUM",
  },
  {
    examType: "MEDICAL",
    subject: "BIOLOGY",
    text: "মাইটোকন্ড্রিয়াকে কোষের কী বলা হয়?",
    options: ["মস্তিষ্ক", "পাওয়ার হাউজ", "প্রাচীর", "কারখানা"],
    correctAnswer: "পাওয়ার হাউজ",
    explanation: "মাইটোকন্ড্রিয়া কোষীয় শ্বসনের মাধ্যমে ATP উৎপন্ন করে, তাই একে কোষের 'পাওয়ার হাউজ' বলা হয়।",
    difficulty: "EASY",
  },
  {
    examType: "MEDICAL",
    subject: "BIOLOGY",
    text: "রক্তে অক্সিজেন পরিবহনকারী প্রোটিন কোনটি?",
    options: ["মায়োগ্লোবিন", "হিমোগ্লোবিন", "অ্যালবুমিন", "কেরাটিন"],
    correctAnswer: "হিমোগ্লোবিন",
    explanation: "লোহিত রক্তকণিকায় থাকা হিমোগ্লোবিন অক্সিজেনের সাথে আবদ্ধ হয়ে সারা দেহে অক্সিজেন পরিবহন করে।",
    difficulty: "EASY",
  },
  {
    examType: "MEDICAL",
    subject: "BIOLOGY",
    text: "মানুষের ক্রোমোজোম সংখ্যা কত?",
    options: ["44", "46", "48", "23"],
    correctAnswer: "46",
    explanation: "মানুষের দেহকোষে ৪৬টি (২৩ জোড়া) ক্রোমোজোম থাকে।",
    difficulty: "EASY",
  },
  {
    examType: "MEDICAL",
    subject: "BIOLOGY",
    text: "কোন গ্রন্থি ইনসুলিন হরমোন ক্ষরণ করে?",
    options: ["থাইরয়েড", "পিটুইটারি", "অগ্ন্যাশয়", "অ্যাড্রিনাল"],
    correctAnswer: "অগ্ন্যাশয়",
    explanation: "অগ্ন্যাশয়ের আইলেটস অব ল্যাঙ্গারহ্যান্সের বিটা কোষ ইনসুলিন হরমোন ক্ষরণ করে।",
    difficulty: "MEDIUM",
  },
  {
    examType: "MEDICAL",
    subject: "BIOLOGY",
    text: "DNA এর গঠন আবিষ্কার করেন কারা?",
    options: [
      "ওয়াটসন ও ক্রিক",
      "মেন্ডেল ও ডারউইন",
      "পাস্তুর ও কচ",
      "ফ্লেমিং ও চেইন",
    ],
    correctAnswer: "ওয়াটসন ও ক্রিক",
    explanation: "১৯৫৩ সালে জেমস ওয়াটসন ও ফ্রান্সিস ক্রিক DNA এর দ্বি-হেলিক্স গঠন আবিষ্কার করেন।",
    difficulty: "MEDIUM",
  },
  {
    examType: "MEDICAL",
    subject: "BIOLOGY",
    text: "নিচের কোনটি অগ্ন্যাশয় থেকে ক্ষরিত এনজাইম?",
    options: ["পেপসিন", "ট্রিপসিন", "টায়ালিন", "রেনিন"],
    correctAnswer: "ট্রিপসিন",
    explanation: "ট্রিপসিন অগ্ন্যাশয় রস থেকে ক্ষরিত হয় এবং প্রোটিন পরিপাকে সাহায্য করে।",
    difficulty: "HARD",
  },
  {
    examType: "MEDICAL",
    subject: "BIOLOGY",
    text: "মানবদেহে সবচেয়ে বড় অন্তঃক্ষরা গ্রন্থি কোনটি?",
    options: ["পিটুইটারি", "থাইরয়েড", "যকৃত", "অগ্ন্যাশয়"],
    correctAnswer: "থাইরয়েড",
    explanation: "থাইরয়েড মানবদেহের সবচেয়ে বড় অন্তঃক্ষরা (endocrine) গ্রন্থি।",
    difficulty: "MEDIUM",
  },

  // ==================== MEDICAL — Chemistry ====================
  {
    examType: "MEDICAL",
    subject: "CHEMISTRY",
    text: "পানির আণবিক সংকেত কী?",
    options: ["H₂O", "HO₂", "H₃O", "H₂O₂"],
    correctAnswer: "H₂O",
    explanation: "পানির একটি অণুতে ২টি হাইড্রোজেন ও ১টি অক্সিজেন পরমাণু থাকে — H₂O।",
    difficulty: "EASY",
  },
  {
    examType: "MEDICAL",
    subject: "CHEMISTRY",
    text: "পর্যায় সারণির কোন গ্রুপকে হ্যালোজেন বলা হয়?",
    options: ["গ্রুপ 1", "গ্রুপ 17", "গ্রুপ 18", "গ্রুপ 2"],
    correctAnswer: "গ্রুপ 17",
    explanation: "পর্যায় সারণির ১৭তম গ্রুপের মৌলগুলো (F, Cl, Br, I...) হ্যালোজেন নামে পরিচিত।",
    difficulty: "MEDIUM",
  },
  {
    examType: "MEDICAL",
    subject: "CHEMISTRY",
    text: "কার্বনের আইসোটোপ কোনটি তেজস্ক্রিয়?",
    options: ["C-12", "C-13", "C-14", "C-11"],
    correctAnswer: "C-14",
    explanation: "কার্বন-১৪ একটি তেজস্ক্রিয় আইসোটোপ, যা কার্বন ডেটিং এ ব্যবহৃত হয়।",
    difficulty: "MEDIUM",
  },
  {
    examType: "MEDICAL",
    subject: "CHEMISTRY",
    text: "সোডিয়াম ক্লোরাইডে বন্ধনের প্রকৃতি কী?",
    options: ["সমযোজী", "আয়নিক", "ধাতব", "হাইড্রোজেন"],
    correctAnswer: "আয়নিক",
    explanation: "Na থেকে Cl এ ইলেকট্রন স্থানান্তরের মাধ্যমে NaCl গঠিত হয়, যা আয়নিক বন্ধন।",
    difficulty: "EASY",
  },
  {
    examType: "MEDICAL",
    subject: "CHEMISTRY",
    text: "নিচের কোনটি জৈব যৌগ?",
    options: ["NaCl", "CO₂", "CH₄", "H₂SO₄"],
    correctAnswer: "CH₄",
    explanation: "মিথেন (CH₄) একটি হাইড্রোকার্বন, যা জৈব যৌগের অন্তর্ভুক্ত।",
    difficulty: "EASY",
  },
  {
    examType: "MEDICAL",
    subject: "CHEMISTRY",
    text: "pH স্কেলে নিরপেক্ষ (neutral) মান কত?",
    options: ["0", "7", "14", "10"],
    correctAnswer: "7",
    explanation: "pH স্কেলে ৭ মান নিরপেক্ষ (বিশুদ্ধ পানির pH), এর নিচে অম্লীয় ও উপরে ক্ষারীয়।",
    difficulty: "EASY",
  },
  {
    examType: "MEDICAL",
    subject: "CHEMISTRY",
    text: "অ্যামোনিয়া (NH₃) এর জ্যামিতিক আকৃতি কী?",
    options: ["রৈখিক", "ত্রিকোণীয় পিরামিডাল", "চতুস্তলকীয়", "সমতলীয়"],
    correctAnswer: "ত্রিকোণীয় পিরামিডাল",
    explanation: "NH₃ অণুতে নাইট্রোজেনের একটি একক জোড় ইলেকট্রন থাকায় এটি ত্রিকোণীয় পিরামিডাল আকৃতি ধারণ করে।",
    difficulty: "HARD",
  },

  // ==================== MEDICAL — Physics ====================
  {
    examType: "MEDICAL",
    subject: "PHYSICS",
    text: "আলোর গতিবেগ শূন্য মাধ্যমে প্রায় কত?",
    options: ["3×10⁵ m/s", "3×10⁶ m/s", "3×10⁸ m/s", "3×10¹⁰ m/s"],
    correctAnswer: "3×10⁸ m/s",
    explanation: "শূন্য মাধ্যমে আলোর গতিবেগ প্রায় ৩×১০⁸ মিটার/সেকেন্ড।",
    difficulty: "EASY",
  },
  {
    examType: "MEDICAL",
    subject: "PHYSICS",
    text: "নিউটনের দ্বিতীয় সূত্র অনুযায়ী বল F = ?",
    options: ["ma", "mv", "m/a", "m+a"],
    correctAnswer: "ma",
    explanation: "নিউটনের দ্বিতীয় সূত্র অনুযায়ী, বল = ভর × ত্বরণ (F = ma)।",
    difficulty: "EASY",
  },
  {
    examType: "MEDICAL",
    subject: "PHYSICS",
    text: "শব্দের বেগ সবচেয়ে বেশি কোন মাধ্যমে?",
    options: ["বায়ু", "পানি", "কঠিন পদার্থ", "শূন্য মাধ্যম"],
    correctAnswer: "কঠিন পদার্থ",
    explanation: "কঠিন পদার্থে আণবিক ঘনত্ব বেশি থাকায় শব্দ সবচেয়ে দ্রুত ভ্রমণ করে।",
    difficulty: "MEDIUM",
  },
  {
    examType: "MEDICAL",
    subject: "PHYSICS",
    text: "তড়িৎ প্রবাহের SI একক কী?",
    options: ["ভোল্ট", "অ্যাম্পিয়ার", "ওহম", "ওয়াট"],
    correctAnswer: "অ্যাম্পিয়ার",
    explanation: "তড়িৎ প্রবাহের SI একক অ্যাম্পিয়ার (A)।",
    difficulty: "EASY",
  },
  {
    examType: "MEDICAL",
    subject: "PHYSICS",
    text: "একটি বস্তুর ওজন শূন্য হয় কোথায়?",
    options: ["পৃথিবীর কেন্দ্রে", "মহাশূন্যে (শূন্য অভিকর্ষে)", "সমুদ্রপৃষ্ঠে", "পাহাড়ের চূড়ায়"],
    correctAnswer: "মহাশূন্যে (শূন্য অভিকর্ষে)",
    explanation: "অভিকর্ষজ ত্বরণ শূন্য হলে বস্তুর ওজন (mg) ও শূন্য হয়ে যায়, যদিও ভর অপরিবর্তিত থাকে।",
    difficulty: "MEDIUM",
  },

  // ==================== MEDICAL — English ====================
  {
    examType: "MEDICAL",
    subject: "ENGLISH",
    text: "Choose the correct synonym of 'Benevolent':",
    options: ["Cruel", "Kind", "Angry", "Selfish"],
    correctAnswer: "Kind",
    explanation: "'Benevolent' means kind and generous, so 'Kind' is the correct synonym.",
    difficulty: "EASY",
  },
  {
    examType: "MEDICAL",
    subject: "ENGLISH",
    text: "Choose the correct antonym of 'Scarce':",
    options: ["Rare", "Abundant", "Limited", "Few"],
    correctAnswer: "Abundant",
    explanation: "'Scarce' means insufficient/rare; 'Abundant' means plentiful, which is the opposite.",
    difficulty: "MEDIUM",
  },
  {
    examType: "MEDICAL",
    subject: "ENGLISH",
    text: "Fill in the blank: He is good ___ Mathematics.",
    options: ["in", "at", "on", "with"],
    correctAnswer: "at",
    explanation: "The correct preposition idiom is 'good at' something.",
    difficulty: "EASY",
  },
  {
    examType: "MEDICAL",
    subject: "ENGLISH",
    text: "The plural form of 'Analysis' is:",
    options: ["Analysises", "Analyses", "Analysis's", "Analysis"],
    correctAnswer: "Analyses",
    explanation: "Words ending in '-is' (Greek origin) form plurals with '-es', e.g., analysis → analyses.",
    difficulty: "MEDIUM",
  },

  // ==================== MEDICAL — General Knowledge ====================
  {
    examType: "MEDICAL",
    subject: "GENERAL_KNOWLEDGE",
    text: "বাংলাদেশের জাতীয় সংসদ ভবনের স্থপতি কে?",
    options: ["লুই আই কান", "এফ আর খান", "মাজহারুল ইসলাম", "বশিরুল হক"],
    correctAnswer: "লুই আই কান",
    explanation: "আমেরিকান স্থপতি লুই আই কান জাতীয় সংসদ ভবন (জাতীয় সংসদ) ডিজাইন করেন।",
    difficulty: "MEDIUM",
  },
  {
    examType: "MEDICAL",
    subject: "GENERAL_KNOWLEDGE",
    text: "বাংলাদেশ জাতিসংঘে সদস্যপদ লাভ করে কোন সালে?",
    options: ["1971", "1972", "1974", "1975"],
    correctAnswer: "1974",
    explanation: "বাংলাদেশ ১৯৭৪ সালের ১৭ সেপ্টেম্বর জাতিসংঘের সদস্যপদ লাভ করে।",
    difficulty: "MEDIUM",
  },
  {
    examType: "MEDICAL",
    subject: "GENERAL_KNOWLEDGE",
    text: "বিশ্ব স্বাস্থ্য সংস্থা (WHO) এর সদর দপ্তর কোথায়?",
    options: ["নিউইয়র্ক", "জেনেভা", "প্যারিস", "লন্ডন"],
    correctAnswer: "জেনেভা",
    explanation: "WHO এর সদর দপ্তর সুইজারল্যান্ডের জেনেভায় অবস্থিত।",
    difficulty: "EASY",
  },
  {
    examType: "MEDICAL",
    subject: "GENERAL_KNOWLEDGE",
    text: "মুক্তিযুদ্ধে বাংলাদেশ কতটি সেক্টরে বিভক্ত ছিল?",
    options: ["৯টি", "১০টি", "১১টি", "১২টি"],
    correctAnswer: "১১টি",
    explanation: "মুক্তিযুদ্ধ পরিচালনার সুবিধার্থে বাংলাদেশকে ১১টি সেক্টরে বিভক্ত করা হয়েছিল।",
    difficulty: "MEDIUM",
  },

  // ==================== DU 'A' UNIT — Physics ====================
  {
    examType: "DU_A_UNIT",
    subject: "PHYSICS",
    text: "কোনো বস্তুর সরলরৈখিক গতিতে সমত্বরণ থাকলে বেগ-সময় লেখচিত্র কেমন হয়?",
    options: ["সরলরেখা", "পরাবৃত্ত", "উপবৃত্ত", "অধিবৃত্ত"],
    correctAnswer: "সরলরেখা",
    explanation: "সমত্বরণে বেগ সময়ের সাথে সমহারে পরিবর্তিত হয়, তাই v-t লেখচিত্র সরলরেখা হয়।",
    difficulty: "MEDIUM",
  },
  {
    examType: "DU_A_UNIT",
    subject: "PHYSICS",
    text: "একটি স্প্রিং এর বল ধ্রুবক k হলে, স্থিতিস্থাপক বিভব শক্তি কোনটি?",
    options: ["kx", "½kx²", "kx²", "½kx"],
    correctAnswer: "½kx²",
    explanation: "স্প্রিং এর স্থিতিস্থাপক বিভব শক্তি U = ½kx², যেখানে x হলো সরণ।",
    difficulty: "HARD",
  },
  {
    examType: "DU_A_UNIT",
    subject: "PHYSICS",
    text: "একটি ক্যাপাসিটরের ধারকত্বের একক কী?",
    options: ["ওহম", "ফ্যারাড", "হেনরি", "টেসলা"],
    correctAnswer: "ফ্যারাড",
    explanation: "ধারকত্বের SI একক ফ্যারাড (F)।",
    difficulty: "EASY",
  },
  {
    examType: "DU_A_UNIT",
    subject: "PHYSICS",
    text: "ডপলার ক্রিয়া কোন রাশির পরিবর্তনের সাথে সম্পর্কিত?",
    options: ["তীব্রতা", "কম্পাঙ্ক", "বিস্তার", "বেগ"],
    correctAnswer: "কম্পাঙ্ক",
    explanation: "উৎস ও পর্যবেক্ষকের আপেক্ষিক গতির কারণে শব্দ/আলোর আপাত কম্পাঙ্ক পরিবর্তনকে ডপলার ক্রিয়া বলে।",
    difficulty: "MEDIUM",
  },

  // ==================== DU 'A' UNIT — Chemistry ====================
  {
    examType: "DU_A_UNIT",
    subject: "CHEMISTRY",
    text: "নিচের কোনটি একটি সন্ধিগত মৌল (transition element)?",
    options: ["Na", "Fe", "Ca", "K"],
    correctAnswer: "Fe",
    explanation: "আয়রন (Fe) d-ব্লকের মৌল, যা সন্ধিগত মৌলের বৈশিষ্ট্য প্রদর্শন করে।",
    difficulty: "MEDIUM",
  },
  {
    examType: "DU_A_UNIT",
    subject: "CHEMISTRY",
    text: "একটি প্রথম ক্রম বিক্রিয়ায় অর্ধায়ু কীসের উপর নির্ভর করে না?",
    options: ["বিক্রিয়ক ঘনমাত্রা", "তাপমাত্রা", "প্রভাবক", "উভয়ই তাপমাত্রা ও প্রভাবক"],
    correctAnswer: "বিক্রিয়ক ঘনমাত্রা",
    explanation: "প্রথম ক্রম বিক্রিয়ায় অর্ধায়ু (t½ = 0.693/k) বিক্রিয়ক ঘনমাত্রা থেকে স্বাধীন।",
    difficulty: "HARD",
  },
  {
    examType: "DU_A_UNIT",
    subject: "CHEMISTRY",
    text: "বেনজিনের আণবিক সংকেত কী?",
    options: ["C₆H₆", "C₆H₁₂", "C₆H₁₄", "C₆H₁₀"],
    correctAnswer: "C₆H₆",
    explanation: "বেনজিন একটি অ্যারোমেটিক হাইড্রোকার্বন যার আণবিক সংকেত C₆H₆।",
    difficulty: "EASY",
  },
  {
    examType: "DU_A_UNIT",
    subject: "CHEMISTRY",
    text: "নিচের কোনটি লা শাতেলিয়ার নীতির সাথে সম্পর্কিত?",
    options: ["পারমাণবিক গঠন", "রাসায়নিক সাম্যাবস্থা", "তেজস্ক্রিয়তা", "জারণ-বিজারণ"],
    correctAnswer: "রাসায়নিক সাম্যাবস্থা",
    explanation: "লা শাতেলিয়ার নীতি বলে, সাম্যাবস্থায় থাকা কোনো তন্ত্রে বাহ্যিক পরিবর্তন ঘটালে তন্ত্র সেই পরিবর্তনের বিরুদ্ধে সাড়া দেয়।",
    difficulty: "MEDIUM",
  },

  // ==================== DU 'A' UNIT — Math ====================
  {
    examType: "DU_A_UNIT",
    subject: "MATH",
    text: "∫x dx এর মান কত?",
    options: ["x²/2 + C", "x² + C", "2x + C", "x + C"],
    correctAnswer: "x²/2 + C",
    explanation: "সাধারণ ইন্টিগ্রেশন নিয়ম অনুযায়ী ∫xⁿdx = xⁿ⁺¹/(n+1) + C, তাই ∫x dx = x²/2 + C।",
    difficulty: "MEDIUM",
  },
  {
    examType: "DU_A_UNIT",
    subject: "MATH",
    text: "sin²θ + cos²θ = কত?",
    options: ["0", "1", "2", "θ"],
    correctAnswer: "1",
    explanation: "এটি ত্রিকোণমিতির মৌলিক অভেদ — sin²θ + cos²θ = 1 সব θ এর জন্য সত্য।",
    difficulty: "EASY",
  },
  {
    examType: "DU_A_UNIT",
    subject: "MATH",
    text: "একটি ম্যাট্রিক্সের নির্ণায়ক শূন্য হলে তাকে কী বলে?",
    options: ["Identity ম্যাট্রিক্স", "Singular ম্যাট্রিক্স", "Symmetric ম্যাট্রিক্স", "Diagonal ম্যাট্রিক্স"],
    correctAnswer: "Singular ম্যাট্রিক্স",
    explanation: "যে ম্যাট্রিক্সের নির্ণায়ক (determinant) শূন্য হয়, তাকে Singular ম্যাট্রিক্স বলে (এর inverse থাকে না)।",
    difficulty: "HARD",
  },
  {
    examType: "DU_A_UNIT",
    subject: "MATH",
    text: "একটি বৃত্তের সমীকরণ x² + y² = r² হলে বৃত্তের কেন্দ্র কোথায়?",
    options: ["(r, r)", "(0, 0)", "(1, 1)", "(-r, -r)"],
    correctAnswer: "(0, 0)",
    explanation: "x² + y² = r² একটি মূলবিন্দুকেন্দ্রিক বৃত্তের সমীকরণ, তাই কেন্দ্র (0, 0)।",
    difficulty: "EASY",
  },

  // ==================== DU 'A' UNIT — Biology ====================
  {
    examType: "DU_A_UNIT",
    subject: "BIOLOGY",
    text: "উদ্ভিদ কোষের কোষপ্রাচীরের প্রধান উপাদান কী?",
    options: ["কাইটিন", "সেলুলোজ", "পেকটিন", "লিগনিন"],
    correctAnswer: "সেলুলোজ",
    explanation: "উদ্ভিদ কোষপ্রাচীরের প্রধান গঠনগত উপাদান সেলুলোজ, একটি পলিস্যাকারাইড।",
    difficulty: "EASY",
  },
  {
    examType: "DU_A_UNIT",
    subject: "BIOLOGY",
    text: "সালোকসংশ্লেষণের আলোক বিক্রিয়া ক্লোরোপ্লাস্টের কোথায় ঘটে?",
    options: ["স্ট্রোমা", "থাইলাকয়েড", "মাইটোকন্ড্রিয়া", "নিউক্লিয়াস"],
    correctAnswer: "থাইলাকয়েড",
    explanation: "সালোকসংশ্লেষণের আলোক-নির্ভর বিক্রিয়া থাইলাকয়েড ঝিল্লিতে সংঘটিত হয়।",
    difficulty: "MEDIUM",
  },
  {
    examType: "DU_A_UNIT",
    subject: "BIOLOGY",
    text: "মেন্ডেলের সূত্র অনুযায়ী মনোহাইব্রিড ক্রসে F₂ জনুতে ফিনোটাইপিক অনুপাত কত?",
    options: ["1:1", "3:1", "9:3:3:1", "1:2:1"],
    correctAnswer: "3:1",
    explanation: "মনোহাইব্রিড ক্রসে F₂ জনুতে প্রকট ও প্রচ্ছন্ন বৈশিষ্ট্যের ফিনোটাইপিক অনুপাত 3:1।",
    difficulty: "MEDIUM",
  },
  {
    examType: "DU_A_UNIT",
    subject: "BIOLOGY",
    text: "রক্তের কোন উপাদান জমাট বাঁধতে সাহায্য করে?",
    options: ["লোহিত রক্তকণিকা", "শ্বেত রক্তকণিকা", "অণুচক্রিকা (Platelets)", "প্লাজমা"],
    correctAnswer: "অণুচক্রিকা (Platelets)",
    explanation: "অণুচক্রিকা (থ্রম্বোসাইট) রক্ত জমাট বাঁধার প্রক্রিয়ায় গুরুত্বপূর্ণ ভূমিকা পালন করে।",
    difficulty: "EASY",
  },

  // ==================== BUET — Math (concept-heavy) ====================
  {
    examType: "BUET",
    subject: "MATH",
    text: "যদি f(x) = x³ - 3x হয়, তাহলে f'(x) = 0 এর সমাধান কয়টি বাস্তব মূল দেয়?",
    options: ["0", "1", "2", "3"],
    correctAnswer: "2",
    explanation: "f'(x) = 3x² - 3 = 0 থেকে x² = 1, অর্থাৎ x = ±1 — দুটি বাস্তব মূল।",
    difficulty: "HARD",
  },
  {
    examType: "BUET",
    subject: "MATH",
    text: "একটি জ্যামিতিক ধারার সাধারণ অনুপাত r হলে, অসীম ধারার সমষ্টি সসীম হবে কখন?",
    options: ["r > 1", "r < -1", "|r| < 1", "r = 1"],
    correctAnswer: "|r| < 1",
    explanation: "অসীম জ্যামিতিক ধারা S = a/(1-r) শুধুমাত্র |r| < 1 হলে অভিসারী (সসীম মান দেয়)।",
    difficulty: "HARD",
  },
  {
    examType: "BUET",
    subject: "MATH",
    text: "দুটি ভেক্টরের ডট প্রোডাক্ট শূন্য হলে ভেক্টরদ্বয়ের মধ্যবর্তী কোণ কত?",
    options: ["0°", "45°", "90°", "180°"],
    correctAnswer: "90°",
    explanation: "A·B = |A||B|cosθ, ডট প্রোডাক্ট শূন্য হলে cosθ = 0, তাই θ = 90° (ভেক্টরদ্বয় লম্ব)।",
    difficulty: "MEDIUM",
  },
  {
    examType: "BUET",
    subject: "MATH",
    text: "লিমিট lim(x→0) (sin x)/x এর মান কত?",
    options: ["0", "1", "∞", "অসংজ্ঞায়িত"],
    correctAnswer: "1",
    explanation: "এটি ক্যালকুলাসের একটি গুরুত্বপূর্ণ স্ট্যান্ডার্ড লিমিট — lim(x→0) sin(x)/x = 1।",
    difficulty: "HARD",
  },

  // ==================== BUET — Physics (concept-heavy) ====================
  {
    examType: "BUET",
    subject: "PHYSICS",
    text: "একটি কণা সরল ছন্দিত স্পন্দনে (SHM) সর্বোচ্চ বেগ পায় কোথায়?",
    options: ["সাম্যাবস্থানে", "সর্বোচ্চ বিস্তারে", "প্রান্তবিন্দুতে", "কখনোই না"],
    correctAnswer: "সাম্যাবস্থানে",
    explanation: "SHM এ গতিশক্তি সাম্যাবস্থানে সর্বোচ্চ হয় (বিভব শক্তি শূন্য), তাই বেগও সর্বোচ্চ হয় এখানে।",
    difficulty: "HARD",
  },
  {
    examType: "BUET",
    subject: "PHYSICS",
    text: "একটি ক্যাপাসিটরকে ব্যাটারি থেকে বিচ্ছিন্ন করে প্লেট দুটির দূরত্ব বাড়ালে ধারকত্বের কী পরিবর্তন হয়?",
    options: ["বৃদ্ধি পায়", "হ্রাস পায়", "অপরিবর্তিত থাকে", "শূন্য হয়ে যায়"],
    correctAnswer: "হ্রাস পায়",
    explanation: "C = ε₀A/d সূত্র অনুযায়ী দূরত্ব (d) বাড়লে ধারকত্ব (C) ব্যস্তানুপাতিক হারে হ্রাস পায়।",
    difficulty: "HARD",
  },
  {
    examType: "BUET",
    subject: "PHYSICS",
    text: "কৌণিক ভরবেগ সংরক্ষণের সূত্র কোন ক্ষেত্রে প্রযোজ্য?",
    options: ["বাহ্যিক টর্ক শূন্য হলে", "বাহ্যিক বল শূন্য হলে", "সবসময়", "শুধু ঘূর্ণন গতিতে"],
    correctAnswer: "বাহ্যিক টর্ক শূন্য হলে",
    explanation: "নেট বাহ্যিক টর্ক শূন্য হলে কৌণিক ভরবেগ সংরক্ষিত থাকে (L = Iω = ধ্রুবক)।",
    difficulty: "HARD",
  },

  // ==================== BUET — Chemistry (concept-heavy) ====================
  {
    examType: "BUET",
    subject: "CHEMISTRY",
    text: "একটি বিক্রিয়ার সক্রিয়ণ শক্তি (Activation Energy) কমালে বিক্রিয়ার হারের কী পরিবর্তন হয়?",
    options: ["হ্রাস পায়", "বৃদ্ধি পায়", "অপরিবর্তিত থাকে", "শূন্য হয়ে যায়"],
    correctAnswer: "বৃদ্ধি পায়",
    explanation: "সক্রিয়ণ শক্তি কমলে বেশি সংখ্যক অণু বিক্রিয়ার জন্য প্রয়োজনীয় শক্তি অতিক্রম করতে পারে, ফলে বিক্রিয়ার হার বৃদ্ধি পায় (প্রভাবকের কাজ)।",
    difficulty: "HARD",
  },
  {
    examType: "BUET",
    subject: "CHEMISTRY",
    text: "হাইড্রোজেন পরমাণুর বোর মডেলে ইলেকট্রনের শক্তিস্তর n বাড়ার সাথে সাথে শক্তির মান কীভাবে পরিবর্তিত হয়?",
    options: [
      "ঋণাত্মক থেকে শূন্যের দিকে বাড়ে",
      "ধনাত্মক থেকে ঋণাত্মক হয়",
      "সবসময় ধ্রুবক থাকে",
      "হ্রাস পায়",
    ],
    correctAnswer: "ঋণাত্মক থেকে শূন্যের দিকে বাড়ে",
    explanation: "En = -13.6/n² eV সূত্র অনুযায়ী n বাড়লে শক্তি ঋণাত্মক থেকে শূন্যের দিকে অগ্রসর হয় (ইলেকট্রন নিউক্লিয়াস থেকে দূরে সরে)।",
    difficulty: "HARD",
  },
];

async function main() {
  assertDestructiveSeedAllowed("seed-admission-questions.ts");
  console.log("🌱 Admission Prep প্রশ্ন সিড করা শুরু হচ্ছে...");

  // idempotent — আগের সব admission প্রশ্ন মুছে নতুন করে বসানো হচ্ছে
  await prisma.admissionQuestion.deleteMany({});
  console.log("🗑️  পুরনো admission প্রশ্ন মুছে ফেলা হয়েছে");

  await prisma.admissionQuestion.createMany({
    data: questions.map((q) => ({
      examType: q.examType,
      subject: q.subject,
      text: q.text,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      difficulty: q.difficulty,
    })),
  });

  console.log(`✅ ${questions.length}টা admission প্রশ্ন সিড করা হয়েছে`);

  // সারসংক্ষেপ
  const byExam = await prisma.admissionQuestion.groupBy({
    by: ["examType", "subject"],
    _count: true,
  });
  console.log("\n📊 সারসংক্ষেপ:");
  for (const row of byExam) {
    console.log(`  ${row.examType} / ${row.subject}: ${row._count}টা প্রশ্ন`);
  }
}

main()
  .catch((e) => {
    console.error("❌ Seed ব্যর্থ হয়েছে:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
