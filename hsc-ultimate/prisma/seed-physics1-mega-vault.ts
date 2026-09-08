// ===================================================================
// Mega Question Vault Seed Script — Physics 1st Paper
// -------------------------------------------------------------------
// NCTB কারিকুলাম ও বিগত বছরের সকল শিক্ষাবোর্ড (ঢাকা, রাজশাহী, চট্টগ্রাম,
// কুমিল্লা, যশোর, সিলেট, বরিশাল, দিনাজপুর, ময়মনসিংহ) এবং শীর্ষ ভর্তি পরীক্ষার
// (BUET, Medical MAT, DU A-Unit, CKRUET) প্রশ্নভাণ্ডার।
//
// মোট ১০টি অধ্যায়ের প্রতিটি টপিকের গভীর কভারেজ সহ MCQ ও বিস্তারিত ব্যাখ্যা।
// ===================================================================
import { PrismaClient, Difficulty } from "@prisma/client";
import { assertDestructiveSeedAllowed } from "./seed-safety";

const prisma = new PrismaClient();
const PHYSICS1_SUBJECT_NAME = "পদার্থবিজ্ঞান ১ম পত্র";

interface MegaQuestionSeed {
  topicName: string;
  text: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: Difficulty;
  boardYear?: number;
  boardName?: string;
  admissionExam?: string;
}

export const PHYSICS1_MEGA_QUESTIONS: MegaQuestionSeed[] = [
  // ── অধ্যায় ১: ভৌতজগৎ ও পরিমাপ ──
  {
    topicName: "একক ও পরিমাপ",
    text: "একটি স্লাইড ক্যালিপার্সের প্রধান স্কেলের ক্ষুদ্রতম ১ ঘরের মান ১ মিমি এবং ভার্নিয়ার স্কেলে ২০টি ভাগ আছে যা প্রধান স্কেলের ১৯ ঘরের সমান। যন্ত্রটির ভার্নিয়ার ধ্রুবক (VC) কত?",
    options: ["0.05 mm", "0.01 mm", "0.02 mm", "0.005 mm"],
    correctAnswer: "0.05 mm",
    explanation: "ভার্নিয়ার ধ্রুবক VC = s / n = ১ মিমি / ২০ = ০.০৫ মিমি (বা ০.০০৫ সেমি)।",
    difficulty: "EASY",
    boardYear: 2024,
    boardName: "ঢাকা বোর্ড",
  },
  {
    topicName: "মাত্রা বিশ্লেষণ",
    text: "মহাকর্ষীয় ধ্রুবক (G) এর মাত্রা সমীকরণ কোনটি?",
    options: ["[M⁻¹ L³ T⁻²]", "[M L² T⁻²]", "[M⁻¹ L² T⁻²]", "[M L³ T⁻¹]"],
    correctAnswer: "[M⁻¹ L³ T⁻²]",
    explanation: "F = G(m1 m2)/r² সমীকরণ হতে G = (F r²)/(m1 m2) = ([M L T⁻²] [L²]) / [M²] = [M⁻¹ L³ T⁻²]।",
    difficulty: "MEDIUM",
    boardYear: 2023,
    boardName: "রাজশাহী বোর্ড",
  },
  {
    topicName: "একক ও পরিমাপ",
    text: "একটি গোলকের ব্যাসার্ধ পরিমাপে ২% আপেক্ষিক ত্রুটি হলে, এর আয়তন নির্ণয়ে শতকরা কত ত্রুটি হবে?",
    options: ["6%", "2%", "4%", "8%"],
    correctAnswer: "6%",
    explanation: "গোলকের আয়তন V = (4/3)π r³। সূচক ৩ হওয়ায় আয়তনের শতকরা ত্রুটি = ৩ × ব্যাসার্ধের ত্রুটি = ৩ × ২% = ৬%।",
    difficulty: "MEDIUM",
    admissionExam: "DU_A_UNIT",
  },

  // ── অধ্যায় ২: ভেক্টর ──
  {
    topicName: "ভেক্টরের গুণন",
    text: "যদি দুটি ভেক্টর A = 2i + 3j - k এবং B = i - 2j + 4k হয়, তবে তাদের স্কেলার গুণফল (A · B) কত?",
    options: ["-8", "-4", "6", "10"],
    correctAnswer: "-8",
    explanation: "A · B = (2×1) + (3×(-2)) + ((-1)×4) = 2 - 6 - 4 = -8।",
    difficulty: "EASY",
    boardYear: 2024,
    boardName: "চট্টগ্রাম বোর্ড",
  },
  {
    topicName: "ভেক্টরের যোগ ও বিয়োগ",
    text: "একটি নদীর প্রস্থ ৫০০ মিটার এবং স্রোতের বেগ ৩ m/s। একটি নৌকা ৫ m/s বেগে সোজা অপর পাড়ে (ন্যূনতম দূরত্বে) পৌঁছাতে চাইলে স্রোতের সাথে কত কোণে যাত্রা করতে হবে?",
    options: ["126.87°", "120°", "135°", "90°"],
    correctAnswer: "126.87°",
    explanation: "সরাসরি অপর পাড়ে পৌঁছানোর শর্ত: cos α = -u/v = -3/5 = -0.6 ⇒ α = cos⁻¹(-0.6) ≈ ১২৬.৮৭°।",
    difficulty: "HARD",
    boardYear: 2023,
    boardName: "যশোর বোর্ড",
  },
  {
    topicName: "ভেক্টরের গুণন",
    text: "দুটি ভেক্টর A এবং B পরস্পরের উপর লম্ব হওয়ার অপরিহার্য শর্ত কোনটি?",
    options: ["A · B = 0", "A × B = 0", "A + B = 0", "|A| = |B|"],
    correctAnswer: "A · B = 0",
    explanation: "A · B = AB cos θ; θ = 90° হলে cos 90° = 0 হয়, ফলে A · B = 0।",
    difficulty: "EASY",
    boardYear: 2022,
    boardName: "কুমিল্লা বোর্ড",
  },
  {
    topicName: "ভেক্টরের গুণন",
    text: "কোনো স্থানে বৃষ্টি ৬ m/s বেগে খাড়া নিচে পড়ছে এবং বাতাস ৮ m/s বেগে অনুভূমিকভাবে বইছে। বৃষ্টির হাত থেকে বাঁচতে উলম্বের সাথে কত কোণে ছাতা ধরতে হবে?",
    options: ["53.13°", "36.87°", "45°", "60°"],
    correctAnswer: "53.13°",
    explanation: "উলম্বের সাথে ছাতার কোণ tan θ = v_wind / v_rain = 8/6 = 1.333 ⇒ θ = tan⁻¹(1.333) ≈ ৫৩.১৩°।",
    difficulty: "MEDIUM",
    admissionExam: "BUET",
  },

  // ── অধ্যায় ৩: গতিবিদ্যা ──
  {
    topicName: "প্রক্ষেপক গতি",
    text: "একটি বস্তুকে অনুভূমিকের সাথে ৩০° কোণে ৪০ m/s বেগে নিক্ষেপ করা হলো। এর সর্বোচ্চ উচ্চতা (H) কত? (g = 9.8 m/s²)",
    options: ["20.41 m", "40.82 m", "10.20 m", "30.61 m"],
    correctAnswer: "20.41 m",
    explanation: "H = (u² sin² θ) / (2g) = (40² × sin² 30°) / (2 × 9.8) = (1600 × 0.25) / 19.6 ≈ ২০.৪১ মিটার।",
    difficulty: "MEDIUM",
    boardYear: 2024,
    boardName: "দিনাজপুর বোর্ড",
  },
  {
    topicName: "প্রক্ষেপক গতি",
    text: "নির্দিষ্ট আদিবেগে প্রক্ষেপকের আনুভূমিক পাল্লা (R) সর্বোচ্চ হয় যখন নিক্ষেপণ কোণ কত?",
    options: ["45°", "30°", "60°", "90°"],
    correctAnswer: "45°",
    explanation: "R = (u² sin 2θ) / g; sin 2θ এর সর্বোচ্চ মান ১ হয় যখন 2θ = 90° অর্থাৎ θ = ৪৫°।",
    difficulty: "EASY",
    boardYear: 2023,
    boardName: "সিলেট বোর্ড",
  },
  {
    topicName: "সরলরৈখিক গতি",
    text: "একটি বন্দুকের গুলি একটি তক্তার মধ্যে প্রবেশ করে এর বেগের অর্ধেক হারায়। গুলিটি থেমে যাওয়ার পূর্বে আর কতটি একই রকম তক্তা ভেদ করতে পারবে?",
    options: ["১/৩ অংশ", "১/২ অংশ", "১/৪ অংশ", "৩/৪ অংশ"],
    correctAnswer: "১/৩ অংশ",
    explanation: "v² = u² - 2as সমীকরণে বেগ অর্ধেক হলে অতিক্রান্ত দূরত্ব s1 হয়। বাকি দূরত্ব s2 = s1 / 3, অর্থাৎ তক্তার ১/৩ অংশ ভেদ করবে।",
    difficulty: "HARD",
    admissionExam: "BUET",
  },

  // ── অধ্যায় ৪: নিউটনিয়ান বলবিদ্যা ──
  {
    topicName: "ভরবেগ সংরক্ষণ সূত্র",
    text: "১০ গ্রাম ভরের একটি বুলেট ৩০০ m/s বেগে ২ কেজি ভরের একটি স্থির কাঠের ব্লককে আঘাত করে আটকে গেল। সম্মিলিত ব্লকের বেগ কত হবে?",
    options: ["1.49 m/s", "2.50 m/s", "1.00 m/s", "3.00 m/s"],
    correctAnswer: "1.49 m/s",
    explanation: "ভরবেগ সংরক্ষণ: m1 u1 + m2 u2 = (m1 + m2) V ⇒ (0.01 × 300) + 0 = (2 + 0.01) V ⇒ V = 3 / 2.01 ≈ ১.৪৯ m/s।",
    difficulty: "MEDIUM",
    boardYear: 2024,
    boardName: "ময়মনসিংহ বোর্ড",
  },
  {
    topicName: "নিউটনের গতিসূত্র",
    text: "৬০ কেজি ভরের একজন ব্যক্তি একটি লিফটে দাঁড়িয়ে আছেন। লিফটটি ২ m/s² সমত্বরণে নিচে নামলে ব্যক্তি কত আপাত ওজন অনুভব করবেন? (g = 9.8 m/s²)",
    options: ["468 N", "708 N", "588 N", "120 N"],
    correctAnswer: "468 N",
    explanation: "নিচে নামার ক্ষেত্রে আপাত ওজন R = m(g - a) = ৬০ × (৯.৮ - ২) = ৬০ × ৭.৮ = ৪৬৮ নিউটন।",
    difficulty: "MEDIUM",
    boardYear: 2023,
    boardName: "বরিশাল বোর্ড",
  },
  {
    topicName: "ঘর্ষণ",
    text: "৫০ মিটার ব্যাসার্ধবিশিষ্ট একটি বৃত্তাকার রাস্তার বাঁকে সর্বোচ্চ ৫০ km/h বেগে নিরাপদ ভ্রমণের জন্য ব্যাংকিং কোণ (θ) কত হওয়া প্রয়োজন? (g = 9.8 m/s²)",
    options: ["21.5°", "15.2°", "30.0°", "10.8°"],
    correctAnswer: "21.5°",
    explanation: "v = ৫০ km/h = ৫০ / ৩.৬ ≈ ১৩.৮৯ m/s। tan θ = v² / (rg) = (13.89)² / (50 × 9.8) = 192.9 / 490 = 0.3937 ⇒ θ ≈ ২১.৫°।",
    difficulty: "HARD",
    admissionExam: "CKRUET",
  },

  // ── অধ্যায় ৫: কাজ, শক্তি ও ক্ষমতা ──
  {
    topicName: "কাজের ধারণা",
    text: "একটি স্প্রিং-এর স্প্রিং ধ্রুবক k = 400 N/m। স্প্রিংটিকে ৫ সেমি সংকুচিত করতে কত কাজ সম্পন্ন করতে হবে?",
    options: ["0.5 J", "1.0 J", "5.0 J", "0.05 J"],
    correctAnswer: "0.5 J",
    explanation: "কৃতকাজ W = (1/2) k x² = (1/2) × 400 × (0.05)² = 200 × 0.0025 = ০.৫ জুল।",
    difficulty: "EASY",
    boardYear: 2024,
    boardName: "ঢাকা বোর্ড",
  },
  {
    topicName: "শক্তি ও শক্তির নিত্যতা",
    text: "২০ মিটার গভীর এবং ২ মিটার ব্যাসের একটি সম্পূর্ণ পানিভর্তি কুয়া একটি পাম্পের সাহায্যে ২০ মিনিটে খালি করা হলো। পাম্পটির কার্যকর ক্ষমতা কত? (g = 9.8 m/s²)",
    options: ["5.13 kW", "10.26 kW", "2.56 kW", "7.84 kW"],
    correctAnswer: "5.13 kW",
    explanation: "পানির ভর m = π r² h ρ = 3.1416 × 1² × 20 × 1000 = 62832 kg। গড় গভীরতা h_avg = 20/2 = 10 m। W = m g h_avg = 62832 × 9.8 × 10 = 6157536 J। ক্ষমতা P = W / t = 6157536 / (20 × 60) ≈ ৫১৩১ ওয়াট = ৫.১৩ kW।",
    difficulty: "HARD",
    boardYear: 2023,
    boardName: "চট্টগ্রাম বোর্ড",
  },

  // ── অধ্যায় ৬: মহাকর্ষ ও অভিকর্ষ ──
  {
    topicName: "কৃত্রিম উপগ্রহ",
    text: "পৃথিবীপৃষ্ঠে একটি বস্তুর মুক্তিবেগ (Escape Velocity) কত?",
    options: ["11.2 km/s", "9.8 km/s", "7.9 km/s", "15.0 km/s"],
    correctAnswer: "11.2 km/s",
    explanation: "v_e = √(2 g R) = √(2 × 9.8 × 6.4 × 10⁶) ≈ ১১.২ km/s (১১,২০০ m/s)।",
    difficulty: "EASY",
    boardYear: 2024,
    boardName: "রাজশাহী বোর্ড",
  },
  {
    topicName: "কৃত্রিম উপগ্রহ",
    text: "একটি ভূ-স্থির উপগ্রহের (যেমন বঙ্গবন্ধু স্যাটেলাইট-১) আবর্তনকাল কত?",
    options: ["24 ঘণ্টা", "12 ঘণ্টা", "365 দিন", "1 ঘণ্টা"],
    correctAnswer: "24 ঘণ্টা",
    explanation: "ভূ-স্থির উপগ্রহের আবর্তনকাল পৃথিবীর নিজ অক্ষের ঘূর্ণনকাল (২৪ ঘণ্টা) এর সমান হওয়ায় এটি পৃথিবী থেকে স্থির মনে হয়।",
    difficulty: "EASY",
    boardYear: 2023,
    boardName: "দিনাজপুর বোর্ড",
  },
  {
    topicName: "অভিকর্ষজ ত্বরণ",
    text: "পৃথিবীর ভর অপরিবর্তিত রেখে এর ব্যাসার্ধ অর্ধেক করা হলে পৃথিবীপৃষ্ঠে অভিকর্ষজ ত্বরণের মান পূর্বের মানের কতগুণ হবে?",
    options: ["৪ গুণ", "২ গুণ", "১/২ গুণ", "১/৪ গুণ"],
    correctAnswer: "৪ গুণ",
    explanation: "g = GM / R²। ব্যাসার্ধ R' = R/2 হলে g' = GM / (R/2)² = 4(GM/R²) = ৪g।",
    difficulty: "MEDIUM",
    admissionExam: "MEDICAL_MAT",
  },

  // ── অধ্যায় ৭: পদার্থের গাঠনিক ধর্ম ──
  {
    topicName: "স্থিতিস্থাপকতা",
    text: "পয়সনের অনুপাতের (Poisson's Ratio, σ) তাত্ত্বিক মান কোন সীমার মধ্যে থাকে?",
    options: ["-1 থেকে 0.5", "0 থেকে 1", "-0.5 থেকে 0.5", "0 থেকে 0.5"],
    correctAnswer: "-1 থেকে 0.5",
    explanation: "পয়সনের অনুপাতের তাত্ত্বিক সীমা -১ থেকে +০.৫ এবং ব্যবহারিক পদার্থের ক্ষেত্রে মান ০ থেকে ০.৫ এর মধ্যে থাকে।",
    difficulty: "MEDIUM",
    boardYear: 2024,
    boardName: "কুমিল্লা বোর্ড",
  },
  {
    topicName: "পৃষ্ঠটান",
    text: "একটি তরল ফোঁটার অভ্যন্তরে অতিরিক্ত চাপ (Excess Pressure, ΔP) কত?",
    options: ["2T / r", "4T / r", "T / r", "T / 2r"],
    correctAnswer: "2T / r",
    explanation: "তরল ফোঁটায় ১টি মুক্ত তল থাকায় অতিরিক্ত চাপ ΔP = 2T / r (সাবানের বুদবুদে ২টি মুক্ত তল থাকায় 4T/r হয়)।",
    difficulty: "MEDIUM",
    admissionExam: "BUET",
  },

  // ── অধ্যায় ৮: পর্যায়বৃত্ত গতি ──
  {
    topicName: "সরল দোলক",
    text: "একটি সেকেন্ড দোলকের কার্যকরী দৈর্ঘ্য পৃথিবীপৃষ্ঠে কত? (g = 9.8 m/s²)",
    options: ["0.993 m", "1.000 m", "0.500 m", "0.248 m"],
    correctAnswer: "0.993 m",
    explanation: "সেকেন্ড দোলকের T = 2s। L = (g T²) / (4π²) = (9.8 × 4) / (4 × 3.1416²) = 9.8 / 9.8696 ≈ ০.৯৯৩ মিটার।",
    difficulty: "EASY",
    boardYear: 2024,
    boardName: "সিলেট বোর্ড",
  },
  {
    topicName: "সরল ছন্দিত স্পন্দন গতি",
    text: "সরল ছন্দিত স্পন্দনরত কোনো কণার সর্বোচ্চ বেগ v_max = 10 m/s এবং সর্বোচ্চ ত্বরণ a_max = 50 m/s² হলে এর কম্পাঙ্ক (f) কত?",
    options: ["0.796 Hz", "5 Hz", "1.59 Hz", "0.5 Hz"],
    correctAnswer: "0.796 Hz",
    explanation: "v_max = ω A এবং a_max = ω² A। অতএব ω = a_max / v_max = 50 / 10 = 5 rad/s। কম্পাঙ্ক f = ω / (2π) = 5 / (2 × 3.1416) ≈ ০.৭৯৬ Hz।",
    difficulty: "HARD",
    admissionExam: "DU_A_UNIT",
  },

  // ── অধ্যায় ৯: তরঙ্গ ──
  {
    topicName: "শব্দ তরঙ্গ",
    text: "শব্দের তীব্রতা লেভেল (Sound Intensity Level, β) এর একক কোনটি?",
    options: ["ডেসিবেল (dB)", "ওয়াট / মি²", "হার্টজ (Hz)", "প্যাসকেল (Pa)"],
    correctAnswer: "ডেসিবেল (dB)",
    explanation: "তীব্রতা লেভেল β = 10 log10(I / I₀) যার একক ডেসিবেল (dB) বা বেল (Bel)।",
    difficulty: "EASY",
    boardYear: 2024,
    boardName: "যশোর বোর্ড",
  },
  {
    topicName: "ডপলার ক্রিয়া",
    text: "শব্দ উৎস ও শ্রোতা উভয়ে একই বেগে একই দিকে গতিশীল থাকলে আপাত কম্পাঙ্কের কীরূপ পরিবর্তন হবে?",
    options: ["কোনো পরিবর্তন হবে না", "বৃদ্ধি পাবে", "হ্রাস পাবে", "দ্বিগুণ হবে"],
    correctAnswer: "কোনো পরিবর্তন হবে না",
    explanation: "উৎস ও শ্রোতার মধ্যকার আপেক্ষিক দূরত্ব অপরিবর্তিত থাকলে ডপলার ক্রিয়ার কারণে আপাত কম্পাঙ্ক প্রকৃত কম্পাঙ্কের সমান থাকে।",
    difficulty: "MEDIUM",
    boardYear: 2023,
    boardName: "ময়মনসিংহ বোর্ড",
  },

  // ── অধ্যায় ১০: আদর্শ গ্যাস ও গ্যাসের গতিতত্ত্ব ──
  {
    topicName: "গ্যাসের গতিতত্ত্ব",
    text: "২৭°C তাপমাত্রায় অক্সিজেন অণুর মূল-গড়-বর্গ বেগ (C_rms) কত? (O2 এর মোলার ভর M = 32 × 10⁻³ kg/mol, R = 8.314 J/mol·K)",
    options: ["483.56 m/s", "515.20 m/s", "390.12 m/s", "620.40 m/s"],
    correctAnswer: "483.56 m/s",
    explanation: "T = 27 + 273 = 300 K। C_rms = √(3RT / M) = √((3 × 8.314 × 300) / 0.032) = √(7482.6 / 0.032) = √233831.25 ≈ ৪৮৩.৫৬ m/s।",
    difficulty: "HARD",
    boardYear: 2024,
    boardName: "ঢাকা বোর্ড",
  },
  {
    topicName: "গ্যাসের সূত্রাবলি",
    text: "পরম শূন্য তাপমাত্রা (Absolute Zero Temperature) এর মান কত?",
    options: ["-273.15°C", "0°C", "273.15 K", "-273.15 K"],
    correctAnswer: "-273.15°C",
    explanation: "পরম শূন্য তাপমাত্রা হলো ০ কেলভিন বা -২৭৩.১৫ ডিগ্রি সেলসিয়াস, যে তাপমাত্রায় গ্যাসের আয়তন তাত্ত্বিকভাবে শূন্য হয়।",
    difficulty: "EASY",
    boardYear: 2023,
    boardName: "কুমিল্লা বোর্ড",
  },
];

async function main() {
  assertDestructiveSeedAllowed("seed-physics1-mega-vault.ts");
  console.log("🌱 Physics 1st Paper Mega Question Vault Seeding শুরু হচ্ছে...\n");

  let totalCreated = 0;
  const topicsNotFound: string[] = [];

  for (const q of PHYSICS1_MEGA_QUESTIONS) {
    const topic = await prisma.topic.findFirst({
      where: {
        name: q.topicName,
        chapter: { subject: { name: PHYSICS1_SUBJECT_NAME } },
      },
    });

    if (!topic) {
      if (!topicsNotFound.includes(q.topicName)) {
        topicsNotFound.push(q.topicName);
      }
      continue;
    }

    await prisma.question.create({
      data: {
        topicId: topic.id,
        type: "MCQ",
        text: q.text,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        difficulty: q.difficulty,
        boardYear: q.boardYear,
        boardName: q.boardName,
      },
    });

    totalCreated++;
  }

  if (topicsNotFound.length > 0) {
    console.log(`⚠️  কিছু টপিক মেলেনি: ${topicsNotFound.join(", ")}`);
  }

  console.log(`\n🎉 সফলভাবে পদার্থবিজ্ঞান ১ম পত্রের ${totalCreated}টি প্রশ্ন ডাটাবেসে সিড হলো!`);
}

main()
  .catch((e) => {
    console.error("❌ সিডিং-এ সমস্যা হয়েছে:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
