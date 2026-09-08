/**
 * HSC Calculator Hacks & Key Sequence Guide.
 * 
 * Step-by-step keystroke guides for CASIO fx-991EX ClassWiz / fx-991ES Plus
 * tailored for HSC Science Physics, Chemistry, Math & ICT.
 */

export interface CalculatorHackItem {
  id: string;
  titleBangla: string;
  subject: "Higher Math" | "Physics" | "Chemistry" | "ICT";
  category: string;
  description: string;
  keySequence: string[];
  example: string;
  tip: string;
}

export const CALCULATOR_HACKS: CalculatorHackItem[] = [
  {
    id: "quad-eq",
    titleBangla: "দ্বিঘাত ও ত্রিঘাত সমীকরণ সমাধান",
    subject: "Higher Math",
    category: "বহুপদী ও সমীকরণ",
    description: "দ্বিঘাত ($ax^2 + bx + c = 0$) ও ত্রিঘাত সমীকরণের মূলগুলো এক ধাপে বের করা।",
    keySequence: ["MENU", "A ((-))", "2 (Polynomial)", "2 (Degree)"],
    example: "যেমন: 2x² - 5x + 2 = 0 এর জন্য a=2, b=-5, c=2 বসিয়ে [=] চাপলে x₁=2, x₂=0.5 পাওয়া যাবে।",
    tip: "সমীকরণের সর্বোচ্চ/সর্বনিম্ন মান (Vertex) দেখতে [=] চাপতে থাকুন।",
  },
  {
    id: "vector-cross",
    titleBangla: "ভেক্টর ক্রস ও ডট গুণন",
    subject: "Physics",
    category: "ভেক্টর",
    description: "দুটি ভেক্টরের স্কেলার ডট ও ভেক্টর ক্রস গুণন ক্যালকুলেটরে ৫ সেকেন্ডে বের করা।",
    keySequence: ["MENU", "5 (Vector)", "1 (Define VctA)", "3 (Dim)", "OPTN", "1 (VctB)"],
    example: "VctA ও VctB ইনপুট দিয়ে OPTN → 3(VctA) × OPTN → 4(VctB) = ক্রস গুণনের ভেক্টর।",
    tip: "ডট গুণনের জন্য: OPTN → 3(VctA) → OPTN → [Down] → 2(Dot) → OPTN → 4(VctB)।",
  },
  {
    id: "matrix-inv",
    titleBangla: "ম্যাট্রিক্সের বিপরীত (Inverse) ও নির্ণায়ক",
    subject: "Higher Math",
    category: "ম্যাট্রিক্স ও নির্ণায়ক",
    description: "3×3 বা 2×2 ম্যাট্রিক্সের নির্ণায়ক এবং বিপরীত ম্যাট্রিক্স দ্রুত নির্ণয়।",
    keySequence: ["MENU", "4 (Matrix)", "1 (MatA)", "3×3", "OPTN", "[Down]", "2 (Det)"],
    example: "MatA এর ইনভার্স বের করতে: OPTN → 3(MatA) চাপার পর [x⁻¹] চেপে [=] চাপুন।",
    tip: "Det(A) = 0 হলে ম্যাট্রিক্সটি ব্যতিক্রমী এবং এর বিপরীত ম্যাট্রিক্স নেই।",
  },
  {
    id: "complex-polar",
    titleBangla: "জটিল সংখ্যার মডুলাস ও আর্গুমেন্ট (Polar Form)",
    subject: "Higher Math",
    category: "জটিল সংখ্যা",
    description: "a + bi আকারের জটিল সংখ্যাকে সরাসরি r∠θ (মডুলাস ও আর্গুমেন্ট) ফরম্যাটে রূপান্তর।",
    keySequence: ["MENU", "2 (Complex)", "a + b [ENG(i)]", "OPTN", "[Down]", "1 (►r∠θ)"],
    example: "যেমন: 1 + √3i লিখে OPTN → Down → 1 চাপলে r=2 এবং θ=60° আসবে।",
    tip: "আর্গুমেন্ট সবসময় -180° থেকে +180° প্রধান মানে আসে।",
  },
  {
    id: "simultaneous-eq",
    titleBangla: "২ ও ৩ চলকের সরল সহসমীকরণ সমাধান",
    subject: "Physics",
    category: "সার্কিট ও বলবিদ্যা",
    description: "কার্শফের সূত্রের ৩টি লুপ সমীকরণ বা বলবিদ্যার ৩ চলক বিশিষ্ট সমীকরণ সমাধান।",
    keySequence: ["MENU", "A ((-))", "1 (Simul Eq)", "3 (Unknowns)"],
    example: "কার্শফের লুপের I₁, I₂, I₃ এর সহগগুলো বসিয়ে সরাসরি ৩টি তড়িৎপ্রবাহের মান বের করুন।",
    tip: "স্থানাঙ্ক জ্যামিতিতে দুটি সরলরেখার ছেদবিন্দু বের করতে 2 Unknowns ব্যবহার করুন।",
  },
  {
    id: "definite-integral",
    titleBangla: "নির্দিষ্ট যোগজীকরণ ও ঢাল নির্ণয়",
    subject: "Higher Math",
    category: "যোগজীকরণ ও অন্তরীকরণ",
    description: "সীমাবদ্ধ যোগজের মান এবং কোনো বিন্দুতে স্পর্শকের ঢাল সরাসরি ক্যালকুলেটরে যাচাই।",
    keySequence: ["∫dx (বাটন)", "ফাংশন f(x)", "লোয়ার লিমিট a", "আপার লিমিট b", "="],
    example: "অন্তরীকরণের জন্য: [SHIFT] + [∫dx] চেপে d/dx(x³)|x=2 বের করলে সরাসরি 12 আসবে।",
    tip: "ত্রিকোণমিতিক ইন্টিগ্রেশনে ক্যালকুলেটর অবশ্যই RADIAN মোডে (SHIFT → MENU → 2 → 2) থাকতে হবে।",
  },
  {
    id: "base-conversion",
    titleBangla: "সংখ্যা পদ্ধতির রূপান্তর (Binary, Hex, Octal)",
    subject: "ICT",
    category: "সংখ্যা পদ্ধতি",
    description: "ডেসিমাল, বাইনারি, হেক্সাডেসিমাল ও অক্টাল রূপান্তর ১ ক্লিকে করা।",
    keySequence: ["MENU", "3 (Base-N)", "[DEC] / [HEX] / [BIN] / [OCT]"],
    example: "DEC মোডে 255 লিখে [=] চাপুন, এরপর [BIN] চাপলে 11111111 এবং [HEX] চাপলে FF আসবে।",
    tip: "ICT বোর্ড পরীক্ষার বহু নির্বাচনী প্রশ্নের সময় বাঁচানোর জন্য অত্যন্ত কার্যকর।",
  },
  {
    id: "unit-conv",
    titleBangla: "বৈজ্ঞানিক একক রূপান্তর (Unit Conversion)",
    subject: "Physics",
    category: "ভৌত জগৎ ও পরিমাপ",
    description: "বায়ুমণ্ডলীয় চাপ atm থেকে Pa, ক্যালরি cal থেকে জুল J, km/h থেকে m/s ইত্যাদি।",
    keySequence: ["SHIFT", "8 (CONV)", "ক্যাটাগরি সিলেক্ট"],
    example: "Pressure: 1 atm = 101325 Pa, Energy: 1 cal = 4.184 J।",
    tip: "কেমিস্ট্রির PV=nRT ম্যাথে একক রূপান্তরে কোনো ভুল হওয়া রোধ করে।",
  },
];
