// ===================================================================
// MCQ Question Bank — MCQ-শূন্য চ্যাপ্টার পূরণ (সেট ৪)
// -------------------------------------------------------------------
// লাইভ DB অডিটে ধরা পড়ে ৮৯টা চ্যাপ্টারের মধ্যে **১৫টায় একটিও MCQ
// ছিল না**। এগুলোর কোনোটিতেই isImportant টপিক নেই (তাই আগের কভারেজ
// অডিটে ধরা পড়েনি), কিন্তু ছাত্র Practice এ ওই চ্যাপ্টার বেছে নিলে
// **খালি কুইজ** পেত — একটা বাস্তব UX গ্যাপ।
//
// এই স্ক্রিপ্ট সেই ১৫টা চ্যাপ্টারের ৩০টা টপিকে ৯০টা MCQ যোগ করে
// (প্রতি টপিকে ৩টা), ফলে প্রতিটা চ্যাপ্টারে অন্তত ৬টা প্রশ্ন হয়।
//
// ⚠️ `deleteMany` করা হয় **না** — text মিলিয়ে ডুপ্লিকেট ফিল্টার করে,
// তাই বারবার চালানো নিরাপদ। টপিক লুকআপে subject filter আছে
// (নাম-collision এড়াতে, established পাঠ)।
//
// রান: pnpm db:seed-questions-empty-chapters
// ===================================================================
import { PrismaClient, Difficulty } from "@prisma/client";

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
  subjectName: string;
  questions: QuestionSeed[];
}

const seedData: TopicQuestionSeed[] = [
  {
    topicName: "ফাংশনের প্রকারভেদ",
    subjectName: "উচ্চতর গণিত ১ম পত্র",
    questions: [
      {
        text: "f(x) = x² ফাংশনটি কোন ধরনের?",
        options: ["জোড় ফাংশন", "বিজোড় ফাংশন", "এক-এক ফাংশন", "ধ্রুবক ফাংশন"],
        correctAnswer: "জোড় ফাংশন",
        explanation: "f(−x) = (−x)² = x² = f(x), তাই এটি জোড় ফাংশন।",
        difficulty: "MEDIUM",
      },
      {
        text: "এক-এক (one-one) ফাংশনের বৈশিষ্ট্য কী?",
        options: ["ভিন্ন ইনপুটে ভিন্ন আউটপুট", "সব ইনপুটে একই আউটপুট", "আউটপুট সবসময় শূন্য", "ডোমেন খালি"],
        correctAnswer: "ভিন্ন ইনপুটে ভিন্ন আউটপুট",
        explanation: "x₁ ≠ x₂ হলে f(x₁) ≠ f(x₂) — এটাই এক-এক ফাংশনের সংজ্ঞা।",
        difficulty: "MEDIUM",
      },
      {
        text: "f(x) = 5 কোন ধরনের ফাংশন?",
        options: ["ধ্রুবক ফাংশন", "সর্বজনীন ফাংশন", "বিজোড় ফাংশন", "অভেদ ফাংশন"],
        correctAnswer: "ধ্রুবক ফাংশন",
        explanation: "সব x এর জন্য মান একই (৫), তাই ধ্রুবক ফাংশন।",
        difficulty: "EASY",
      },
    ],
  },
  {
    topicName: "লেখচিত্র অঙ্কন",
    subjectName: "উচ্চতর গণিত ১ম পত্র",
    questions: [
      {
        text: "y = x সরলরেখাটি কোন কোণে অক্ষের সাথে হেলানো?",
        options: ["45°", "30°", "60°", "90°"],
        correctAnswer: "45°",
        explanation: "ঢাল m = 1, tan θ = 1 → θ = 45°।",
        difficulty: "EASY",
      },
      {
        text: "y = x² এর লেখচিত্র কেমন?",
        options: ["ঊর্ধ্বমুখী প্যারাবোলা", "সরলরেখা", "বৃত্ত", "অধিবৃত্ত"],
        correctAnswer: "ঊর্ধ্বমুখী প্যারাবোলা",
        explanation: "a > 0 হলে প্যারাবোলা উপরের দিকে খোলে।",
        difficulty: "EASY",
      },
      {
        text: "y = |x| এর লেখচিত্র কোন বিন্দুতে শীর্ষ?",
        options: ["(0, 0)", "(1, 1)", "(0, 1)", "(−1, 0)"],
        correctAnswer: "(0, 0)",
        explanation: "মডুলাস ফাংশনের V-আকৃতির শীর্ষ মূলবিন্দুতে।",
        difficulty: "MEDIUM",
      },
    ],
  },
  {
    topicName: "ব্রায়োফাইটার বৈশিষ্ট্য",
    subjectName: "জীববিজ্ঞান ১ম পত্র",
    questions: [
      {
        text: "ব্রায়োফাইটাকে উদ্ভিদজগতের কী বলা হয়?",
        options: ["উভচর", "জলজ", "মরুজ", "পরজীবী"],
        correctAnswer: "উভচর",
        explanation: "জলে ও স্থলে উভয় পরিবেশে বাঁচে, নিষেকে পানি লাগে — তাই উদ্ভিদজগতের উভচর।",
        difficulty: "MEDIUM",
      },
      {
        text: "ব্রায়োফাইটায় কী অনুপস্থিত?",
        options: ["পরিবহন কলা", "ক্লোরোফিল", "রাইজয়েড", "স্পোর"],
        correctAnswer: "পরিবহন কলা",
        explanation: "জাইলেম-ফ্লোয়েম নেই, তাই আকারে ছোট থাকে।",
        difficulty: "MEDIUM",
      },
      {
        text: "মস উদ্ভিদের প্রধান দশা কোনটি?",
        options: ["গ্যামিটোফাইট", "স্পোরোফাইট", "জাইগোট", "ভ্রূণ"],
        correctAnswer: "গ্যামিটোফাইট",
        explanation: "ব্রায়োফাইটায় হ্যাপ্লয়েড গ্যামিটোফাইট প্রধান ও স্বাধীন দশা।",
        difficulty: "HARD",
      },
    ],
  },
  {
    topicName: "টেরিডোফাইটার জনুক্রম",
    subjectName: "জীববিজ্ঞান ১ম পত্র",
    questions: [
      {
        text: "ফার্নের প্রধান দশা কোনটি?",
        options: ["স্পোরোফাইট", "গ্যামিটোফাইট", "জাইগোট", "স্পোর"],
        correctAnswer: "স্পোরোফাইট",
        explanation: "টেরিডোফাইটায় ডিপ্লয়েড স্পোরোফাইট প্রধান ও স্বাধীন।",
        difficulty: "MEDIUM",
      },
      {
        text: "জনুক্রম বলতে কী বোঝায়?",
        options: ["হ্যাপ্লয়েড ও ডিপ্লয়েড দশার পর্যায়ক্রম", "শুধু যৌন প্রজনন", "শুধু অযৌন প্রজনন", "কোষ বিভাজন"],
        correctAnswer: "হ্যাপ্লয়েড ও ডিপ্লয়েড দশার পর্যায়ক্রম",
        explanation: "জীবনচক্রে গ্যামিটোফাইট ও স্পোরোফাইট দশা পালাক্রমে আসে।",
        difficulty: "MEDIUM",
      },
      {
        text: "টেরিডোফাইটায় কোনটি উপস্থিত যা ব্রায়োফাইটায় নেই?",
        options: ["পরিবহন কলা", "ক্লোরোফিল", "স্পোর", "রাইজয়েড"],
        correctAnswer: "পরিবহন কলা",
        explanation: "জাইলেম-ফ্লোয়েম থাকায় ফার্ন বড় আকার পায়।",
        difficulty: "MEDIUM",
      },
    ],
  },
  {
    topicName: "যৌন প্রজনন",
    subjectName: "জীববিজ্ঞান ১ম পত্র",
    questions: [
      {
        text: "সপুষ্পক উদ্ভিদে পুংজননকোষ কোথায় তৈরি হয়?",
        options: ["পরাগধানীতে", "গর্ভাশয়ে", "ডিম্বকে", "বৃতিতে"],
        correctAnswer: "পরাগধানীতে",
        explanation: "পরাগধানীর ভেতরে মিয়োসিসে পরাগরেণু তৈরি হয়।",
        difficulty: "MEDIUM",
      },
      {
        text: "দ্বিনিষেক কোন উদ্ভিদগোষ্ঠীর বৈশিষ্ট্য?",
        options: ["আবৃতবীজী", "নগ্নবীজী", "ব্রায়োফাইটা", "শৈবাল"],
        correctAnswer: "আবৃতবীজী",
        explanation: "একটি শুক্রাণু ডিম্বাণুর সাথে, অন্যটি সেকেন্ডারি নিউক্লিয়াসের সাথে মিলিত হয়।",
        difficulty: "HARD",
      },
      {
        text: "ভ্রূণথলিতে সাধারণত কয়টি নিউক্লিয়াস থাকে?",
        options: ["৮টি", "৪টি", "২টি", "১৬টি"],
        correctAnswer: "৮টি",
        explanation: "পরিণত ভ্রূণথলিতে ৮টি নিউক্লিয়াস ও ৭টি কোষ থাকে।",
        difficulty: "HARD",
      },
    ],
  },
  {
    topicName: "পরাগায়ন ও নিষেক",
    subjectName: "জীববিজ্ঞান ১ম পত্র",
    questions: [
      {
        text: "একই ফুলের পরাগরেণু একই ফুলের গর্ভমুণ্ডে পড়াকে কী বলে?",
        options: ["স্ব-পরাগায়ন", "পর-পরাগায়ন", "নিষেক", "অঙ্কুরোদগম"],
        correctAnswer: "স্ব-পরাগায়ন",
        explanation: "একই ফুলে ঘটলে স্ব-পরাগায়ন, ভিন্ন ফুলে পর-পরাগায়ন।",
        difficulty: "EASY",
      },
      {
        text: "বায়ুপরাগী ফুলের বৈশিষ্ট্য কোনটি?",
        options: ["হালকা ও শুষ্ক পরাগরেণু", "উজ্জ্বল রঙ", "মধুগ্রন্থি", "তীব্র গন্ধ"],
        correctAnswer: "হালকা ও শুষ্ক পরাগরেণু",
        explanation: "বাতাসে সহজে ভেসে যাওয়ার জন্য পরাগরেণু হালকা হয়।",
        difficulty: "MEDIUM",
      },
      {
        text: "নিষেকের ফলে ডিম্বক কীসে পরিণত হয়?",
        options: ["বীজে", "ফলে", "ফুলে", "কাণ্ডে"],
        correctAnswer: "বীজে",
        explanation: "নিষেকের পর ডিম্বক → বীজ, গর্ভাশয় → ফল।",
        difficulty: "EASY",
      },
    ],
  },
  {
    topicName: "শৈবালের বৈশিষ্ট্য",
    subjectName: "জীববিজ্ঞান ১ম পত্র",
    questions: [
      {
        text: "শৈবাল কোন প্রক্রিয়ায় খাদ্য তৈরি করে?",
        options: ["সালোকসংশ্লেষণ", "শোষণ", "পরজীবিতা", "শ্বসন"],
        correctAnswer: "সালোকসংশ্লেষণ",
        explanation: "ক্লোরোফিল থাকায় শৈবাল স্বভোজী।",
        difficulty: "EASY",
      },
      {
        text: "ক্ল্যামাইডোমোনাস কোন ধরনের শৈবাল?",
        options: ["এককোষী", "বহুকোষী", "তন্তুময়", "ঔপনিবেশিক"],
        correctAnswer: "এককোষী",
        explanation: "ক্ল্যামাইডোমোনাস একটি এককোষী চলনক্ষম সবুজ শৈবাল।",
        difficulty: "MEDIUM",
      },
      {
        text: "স্পাইরোগাইরার ক্লোরোপ্লাস্ট কেমন?",
        options: ["সর্পিলাকার", "গোলাকার", "তারকাকার", "চ্যাপ্টা"],
        correctAnswer: "সর্পিলাকার",
        explanation: "স্পাইরোগাইরার নামই এসেছে সর্পিল ক্লোরোপ্লাস্ট থেকে।",
        difficulty: "MEDIUM",
      },
    ],
  },
  {
    topicName: "ছত্রাকের প্রজনন",
    subjectName: "জীববিজ্ঞান ১ম পত্র",
    questions: [
      {
        text: "ছত্রাকের কোষপ্রাচীর কী দিয়ে গঠিত?",
        options: ["কাইটিন", "সেলুলোজ", "পেপটাইডোগ্লাইক্যান", "লিগনিন"],
        correctAnswer: "কাইটিন",
        explanation: "উদ্ভিদের সেলুলোজের বিপরীতে ছত্রাকে কাইটিন থাকে।",
        difficulty: "MEDIUM",
      },
      {
        text: "ছত্রাক কোন ধরনের পুষ্টি গ্রহণ করে?",
        options: ["পরভোজী", "স্বভোজী", "মিশ্রভোজী", "রাসায়নভোজী"],
        correctAnswer: "পরভোজী",
        explanation: "ক্লোরোফিল না থাকায় ছত্রাক শোষণের মাধ্যমে খাদ্য নেয়।",
        difficulty: "EASY",
      },
      {
        text: "ইস্ট কোন প্রক্রিয়ায় অযৌন প্রজনন করে?",
        options: ["মুকুলোদগম", "দ্বিবিভাজন", "স্পোর গঠন", "খণ্ডীভবন"],
        correctAnswer: "মুকুলোদগম",
        explanation: "ইস্টে মাতৃকোষ থেকে ছোট মুকুল তৈরি হয়ে আলাদা হয়।",
        difficulty: "MEDIUM",
      },
    ],
  },
  {
    topicName: "শ্বসনতন্ত্র",
    subjectName: "জীববিজ্ঞান ২য় পত্র",
    questions: [
      {
        text: "মানুষের ফুসফুসে বায়ুথলির নাম কী?",
        options: ["অ্যালভিওলাস", "ব্রঙ্কাস", "ট্রাকিয়া", "ল্যারিংক্স"],
        correctAnswer: "অ্যালভিওলাস",
        explanation: "অ্যালভিওলাসে গ্যাসীয় বিনিময় ঘটে; সংখ্যায় প্রায় ৩০ কোটি।",
        difficulty: "EASY",
      },
      {
        text: "শ্বাসক্রিয়ায় প্রধান পেশি কোনটি?",
        options: ["মধ্যচ্ছদা", "হৃৎপেশি", "পাকস্থলীর পেশি", "বাইসেপস"],
        correctAnswer: "মধ্যচ্ছদা",
        explanation: "ডায়াফ্রাম সংকুচিত হলে বক্ষগহ্বর বড় হয়ে বাতাস ঢোকে।",
        difficulty: "MEDIUM",
      },
      {
        text: "শ্বাসনালীতে কার্টিলেজের বলয় থাকে কেন?",
        options: ["নালি খোলা রাখতে", "বাতাস গরম করতে", "শব্দ তৈরি করতে", "জীবাণু আটকাতে"],
        correctAnswer: "নালি খোলা রাখতে",
        explanation: "C-আকৃতির কার্টিলেজ ট্রাকিয়াকে চুপসে যাওয়া থেকে রক্ষা করে।",
        difficulty: "MEDIUM",
      },
    ],
  },
  {
    topicName: "গ্যাসীয় বিনিময়",
    subjectName: "জীববিজ্ঞান ২য় পত্র",
    questions: [
      {
        text: "অ্যালভিওলাসে গ্যাস বিনিময় কোন প্রক্রিয়ায় হয়?",
        options: ["ব্যাপন", "অভিস্রবণ", "সক্রিয় পরিবহন", "পিনোসাইটোসিস"],
        correctAnswer: "ব্যাপন",
        explanation: "আংশিক চাপের পার্থক্যে O₂ ও CO₂ ব্যাপিত হয়।",
        difficulty: "MEDIUM",
      },
      {
        text: "রক্তে CO₂ প্রধানত কী রূপে পরিবাহিত হয়?",
        options: ["বাইকার্বনেট আয়ন", "দ্রবীভূত গ্যাস", "কার্বনিক এসিড", "কার্বক্সিহিমোগ্লোবিন"],
        correctAnswer: "বাইকার্বনেট আয়ন",
        explanation: "প্রায় ৭০% CO₂ HCO₃⁻ রূপে প্লাজমায় পরিবাহিত হয়।",
        difficulty: "HARD",
      },
      {
        text: "অ্যালভিওলাসের প্রাচীর কত কোষ পুরু?",
        options: ["এক কোষ", "দুই কোষ", "তিন কোষ", "চার কোষ"],
        correctAnswer: "এক কোষ",
        explanation: "এক কোষ পুরু হওয়ায় ব্যাপন দ্রুত হয়।",
        difficulty: "MEDIUM",
      },
    ],
  },
  {
    topicName: "সহজাত আচরণ",
    subjectName: "জীববিজ্ঞান ২য় পত্র",
    questions: [
      {
        text: "সহজাত আচরণ কী?",
        options: ["জন্মগত ও শিখতে হয় না", "অভিজ্ঞতা থেকে শেখা", "শুধু মানুষে দেখা যায়", "পরিবেশে বদলায়"],
        correctAnswer: "জন্মগত ও শিখতে হয় না",
        explanation: "সহজাত আচরণ জিনগতভাবে নির্ধারিত।",
        difficulty: "EASY",
      },
      {
        text: "মৌমাছির নৃত্য কোন ধরনের আচরণ?",
        options: ["সহজাত", "শেখা", "অনুকরণমূলক", "প্রতিবর্ত"],
        correctAnswer: "সহজাত",
        explanation: "খাদ্যের অবস্থান জানাতে মৌমাছির waggle dance জন্মগত আচরণ।",
        difficulty: "MEDIUM",
      },
      {
        text: "প্রতিবর্ত ক্রিয়া নিয়ন্ত্রণ করে কোন অঙ্গ?",
        options: ["সুষুম্নাকাণ্ড", "গুরুমস্তিষ্ক", "লঘুমস্তিষ্ক", "হাইপোথ্যালামাস"],
        correctAnswer: "সুষুম্নাকাণ্ড",
        explanation: "প্রতিবর্ত চাপে মস্তিষ্কে না গিয়েই সুষুম্নাকাণ্ডে সাড়া তৈরি হয়।",
        difficulty: "MEDIUM",
      },
    ],
  },
  {
    topicName: "শিখন আচরণ",
    subjectName: "জীববিজ্ঞান ২য় পত্র",
    questions: [
      {
        text: "প্যাভলভের কুকুরের পরীক্ষা কোন শিখন প্রমাণ করে?",
        options: ["সাপেক্ষ প্রতিবর্ত", "অভ্যাসগতকরণ", "অনুকরণ", "অন্তর্দৃষ্টি"],
        correctAnswer: "সাপেক্ষ প্রতিবর্ত",
        explanation: "ঘণ্টার শব্দের সাথে খাদ্য যুক্ত করে লালা নিঃসরণ — classical conditioning।",
        difficulty: "MEDIUM",
      },
      {
        text: "একই উদ্দীপকে বারবার সাড়া কমে যাওয়াকে কী বলে?",
        options: ["অভ্যাসগতকরণ", "সংবেদনশীলতা", "ছাপায়ন", "অন্তর্দৃষ্টি"],
        correctAnswer: "অভ্যাসগতকরণ",
        explanation: "Habituation — অপ্রয়োজনীয় উদ্দীপক উপেক্ষা করা।",
        difficulty: "HARD",
      },
      {
        text: "ছাপায়ন (imprinting) কখন ঘটে?",
        options: ["জীবনের নির্দিষ্ট সংকট সময়ে", "যেকোনো বয়সে", "শুধু বৃদ্ধ বয়সে", "প্রজননকালে"],
        correctAnswer: "জীবনের নির্দিষ্ট সংকট সময়ে",
        explanation: "জন্মের পর নির্দিষ্ট critical period এ ছাপায়ন ঘটে।",
        difficulty: "HARD",
      },
    ],
  },
  {
    topicName: "প্রজনন তন্ত্র",
    subjectName: "জীববিজ্ঞান ২য় পত্র",
    questions: [
      {
        text: "মানুষের নিষেক কোথায় ঘটে?",
        options: ["ডিম্বনালিতে", "জরায়ুতে", "ডিম্বাশয়ে", "যোনিতে"],
        correctAnswer: "ডিম্বনালিতে",
        explanation: "ফ্যালোপিয়ান টিউবের অ্যাম্পুলা অংশে নিষেক হয়।",
        difficulty: "MEDIUM",
      },
      {
        text: "শুক্রাণু তৈরি হয় কোথায়?",
        options: ["শুক্রাশয়ে", "প্রোস্টেটে", "মূত্রথলিতে", "এপিডিডাইমিসে"],
        correctAnswer: "শুক্রাশয়ে",
        explanation: "টেস্টিসের সেমিনিফেরাস নালিকায় স্পার্মাটোজেনেসিস হয়।",
        difficulty: "EASY",
      },
      {
        text: "কোন হরমোন গর্ভাবস্থা বজায় রাখে?",
        options: ["প্রোজেস্টেরন", "ইনসুলিন", "থাইরক্সিন", "অ্যাড্রেনালিন"],
        correctAnswer: "প্রোজেস্টেরন",
        explanation: "প্রোজেস্টেরন জরায়ুর আস্তরণ বজায় রেখে গর্ভ রক্ষা করে।",
        difficulty: "MEDIUM",
      },
    ],
  },
  {
    topicName: "ভ্রূণের গঠন",
    subjectName: "জীববিজ্ঞান ২য় পত্র",
    questions: [
      {
        text: "নিষিক্ত ডিম্বাণুকে কী বলে?",
        options: ["জাইগোট", "গ্যামেট", "ব্লাস্টুলা", "মরুলা"],
        correctAnswer: "জাইগোট",
        explanation: "শুক্রাণু ও ডিম্বাণুর মিলনে ডিপ্লয়েড জাইগোট তৈরি হয়।",
        difficulty: "EASY",
      },
      {
        text: "ভ্রূণের পুষ্টি সরবরাহ করে কোন অঙ্গ?",
        options: ["অমরা", "যকৃত", "বৃক্ক", "ফুসফুস"],
        correctAnswer: "অমরা",
        explanation: "প্লাসেন্টা মাতৃরক্ত থেকে পুষ্টি ও O₂ ভ্রূণে পৌঁছায়।",
        difficulty: "EASY",
      },
      {
        text: "গ্যাস্ট্রুলেশনে কয়টি জীবাণুস্তর তৈরি হয়?",
        options: ["৩টি", "২টি", "৪টি", "১টি"],
        correctAnswer: "৩টি",
        explanation: "এক্টোডার্ম, মেসোডার্ম ও এন্ডোডার্ম।",
        difficulty: "MEDIUM",
      },
    ],
  },
  {
    topicName: "কঙ্কালতন্ত্র",
    subjectName: "জীববিজ্ঞান ২য় পত্র",
    questions: [
      {
        text: "প্রাপ্তবয়স্ক মানুষের দেহে কতটি হাড় থাকে?",
        options: ["২০৬টি", "৩০০টি", "১৮০টি", "২৫০টি"],
        correctAnswer: "২০৬টি",
        explanation: "শিশুর প্রায় ৩০০, বড় হলে কিছু জোড়া লেগে ২০৬ হয়।",
        difficulty: "EASY",
      },
      {
        text: "অস্থিসন্ধিতে ঘর্ষণ কমায় কোনটি?",
        options: ["সাইনোভিয়াল তরল", "রক্ত", "লিম্ফ", "পিত্তরস"],
        correctAnswer: "সাইনোভিয়াল তরল",
        explanation: "সন্ধিগহ্বরের এই তরল লুব্রিকেন্ট হিসেবে কাজ করে।",
        difficulty: "MEDIUM",
      },
      {
        text: "হাড়কে পেশির সাথে যুক্ত করে কোনটি?",
        options: ["টেনডন", "লিগামেন্ট", "কার্টিলেজ", "সাইনোভিয়াম"],
        correctAnswer: "টেনডন",
        explanation: "টেনডন পেশি-হাড় যোগ করে; লিগামেন্ট হাড়-হাড় যোগ করে।",
        difficulty: "MEDIUM",
      },
    ],
  },
  {
    topicName: "পেশির গঠন",
    subjectName: "জীববিজ্ঞান ২য় পত্র",
    questions: [
      {
        text: "হৃৎপেশি কোন ধরনের?",
        options: ["অনৈচ্ছিক ও রেখাযুক্ত", "ঐচ্ছিক ও রেখাযুক্ত", "অনৈচ্ছিক ও মসৃণ", "ঐচ্ছিক ও মসৃণ"],
        correctAnswer: "অনৈচ্ছিক ও রেখাযুক্ত",
        explanation: "কার্ডিয়াক পেশি রেখাযুক্ত কিন্তু ইচ্ছার বাইরে চলে।",
        difficulty: "HARD",
      },
      {
        text: "পেশি সংকোচনে প্রধান প্রোটিন কোনগুলো?",
        options: ["অ্যাক্টিন ও মায়োসিন", "কেরাটিন ও কোলাজেন", "হিমোগ্লোবিন", "অ্যালবুমিন"],
        correctAnswer: "অ্যাক্টিন ও মায়োসিন",
        explanation: "স্লাইডিং ফিলামেন্ট তত্ত্ব অনুযায়ী এরা পরস্পর পিছলে সংকোচন ঘটায়।",
        difficulty: "MEDIUM",
      },
      {
        text: "পেশি সংকোচনে কোন আয়ন অপরিহার্য?",
        options: ["ক্যালসিয়াম", "সোডিয়াম", "পটাশিয়াম", "ম্যাগনেসিয়াম"],
        correctAnswer: "ক্যালসিয়াম",
        explanation: "Ca²⁺ ট্রোপোনিনে যুক্ত হয়ে অ্যাক্টিনের বাইন্ডিং সাইট খোলে।",
        difficulty: "HARD",
      },
    ],
  },
  {
    topicName: "হাইড্রার গঠন",
    subjectName: "জীববিজ্ঞান ২য় পত্র",
    questions: [
      {
        text: "হাইড্রা কোন পর্বের প্রাণী?",
        options: ["নিডারিয়া", "পরিফেরা", "অ্যানেলিডা", "মলাস্কা"],
        correctAnswer: "নিডারিয়া",
        explanation: "হাইড্রা নিডারিয়া পর্বের মিঠাপানির প্রাণী।",
        difficulty: "EASY",
      },
      {
        text: "হাইড্রার দংশক কোষের নাম কী?",
        options: ["নিডোব্লাস্ট", "অস্টিয়া", "কোয়ানোসাইট", "নেফ্রিডিয়া"],
        correctAnswer: "নিডোব্লাস্ট",
        explanation: "নিডোব্লাস্টের ভেতরে নেমাটোসিস্ট শিকার ধরতে সাহায্য করে।",
        difficulty: "MEDIUM",
      },
      {
        text: "হাইড্রার অযৌন প্রজনন পদ্ধতি কী?",
        options: ["মুকুলোদগম", "দ্বিবিভাজন", "স্পোর গঠন", "পুনরুৎপাদন"],
        correctAnswer: "মুকুলোদগম",
        explanation: "দেহ থেকে মুকুল বের হয়ে নতুন হাইড্রা তৈরি হয়।",
        difficulty: "EASY",
      },
    ],
  },
  {
    topicName: "ঘাসফড়িং এর গঠন",
    subjectName: "জীববিজ্ঞান ২য় পত্র",
    questions: [
      {
        text: "ঘাসফড়িং এর শ্বসন অঙ্গ কী?",
        options: ["ট্রাকিয়া", "ফুলকা", "ফুসফুস", "ত্বক"],
        correctAnswer: "ট্রাকিয়া",
        explanation: "পোকামাকড়ে ট্রাকিয়া নালিকা সরাসরি কোষে বাতাস পৌঁছায়।",
        difficulty: "MEDIUM",
      },
      {
        text: "ঘাসফড়িং এর রক্ত সংবহন কেমন?",
        options: ["মুক্ত", "বদ্ধ", "অনুপস্থিত", "আংশিক বদ্ধ"],
        correctAnswer: "মুক্ত",
        explanation: "হিমোলিম্ফ দেহগহ্বরে (হিমোসিল) মুক্তভাবে প্রবাহিত হয়।",
        difficulty: "MEDIUM",
      },
      {
        text: "ঘাসফড়িং এর রেচন অঙ্গ কোনটি?",
        options: ["ম্যালপিজিয়ান নালিকা", "নেফ্রিডিয়া", "বৃক্ক", "শিখা কোষ"],
        correctAnswer: "ম্যালপিজিয়ান নালিকা",
        explanation: "পোকামাকড়ে ম্যালপিজিয়ান নালিকা ইউরিক এসিড নিষ্কাশন করে।",
        difficulty: "HARD",
      },
    ],
  },
  {
    topicName: "সৌরজগৎ",
    subjectName: "পদার্থবিজ্ঞান ২য় পত্র",
    questions: [
      {
        text: "সৌরজগতের বৃহত্তম গ্রহ কোনটি?",
        options: ["বৃহস্পতি", "শনি", "পৃথিবী", "নেপচুন"],
        correctAnswer: "বৃহস্পতি",
        explanation: "বৃহস্পতির ভর অন্য সব গ্রহের মোট ভরের চেয়ে বেশি।",
        difficulty: "EASY",
      },
      {
        text: "সূর্যের শক্তির উৎস কী?",
        options: ["নিউক্লিয়ার ফিউশন", "নিউক্লিয়ার ফিশন", "দহন", "রাসায়নিক বিক্রিয়া"],
        correctAnswer: "নিউক্লিয়ার ফিউশন",
        explanation: "হাইড্রোজেন জুড়ে হিলিয়াম তৈরিতে বিপুল শক্তি নির্গত হয়।",
        difficulty: "MEDIUM",
      },
      {
        text: "আলোকবর্ষ কীসের একক?",
        options: ["দূরত্ব", "সময়", "আলোর তীব্রতা", "ভর"],
        correctAnswer: "দূরত্ব",
        explanation: "আলো এক বছরে যে দূরত্ব যায় (~৯.৪৬ × ১০¹⁵ মিটার)।",
        difficulty: "MEDIUM",
      },
    ],
  },
  {
    topicName: "নক্ষত্র ও গ্যালাক্সি",
    subjectName: "পদার্থবিজ্ঞান ২য় পত্র",
    questions: [
      {
        text: "আমাদের গ্যালাক্সির নাম কী?",
        options: ["আকাশগঙ্গা", "অ্যান্ড্রোমিডা", "ম্যাগেলানিক ক্লাউড", "ওরিয়ন"],
        correctAnswer: "আকাশগঙ্গা",
        explanation: "Milky Way একটি সর্পিলাকার গ্যালাক্সি।",
        difficulty: "EASY",
      },
      {
        text: "নক্ষত্রের জীবনের শেষ পর্যায়ে অতি ভারী নক্ষত্র কীসে পরিণত হয়?",
        options: ["কৃষ্ণগহ্বর", "শ্বেত বামন", "গ্রহ", "ধূমকেতু"],
        correctAnswer: "কৃষ্ণগহ্বর",
        explanation: "পর্যাপ্ত ভরের নক্ষত্র সুপারনোভার পর কৃষ্ণগহ্বরে পরিণত হয়।",
        difficulty: "MEDIUM",
      },
      {
        text: "সূর্যের নিকটতম নক্ষত্র কোনটি?",
        options: ["প্রক্সিমা সেন্টাউরি", "সিরিয়াস", "পোলারিস", "বেটেলজুস"],
        correctAnswer: "প্রক্সিমা সেন্টাউরি",
        explanation: "প্রায় ৪.২৪ আলোকবর্ষ দূরে।",
        difficulty: "MEDIUM",
      },
    ],
  },
  {
    topicName: "আপেক্ষিক তত্ত্ব",
    subjectName: "পদার্থবিজ্ঞান ২য় পত্র",
    questions: [
      {
        text: "E = mc² সমীকরণে c কী নির্দেশ করে?",
        options: ["শূন্যে আলোর বেগ", "ধ্রুবক ভর", "শক্তি", "কম্পাঙ্ক"],
        correctAnswer: "শূন্যে আলোর বেগ",
        explanation: "c ≈ ৩ × ১০⁸ m/s।",
        difficulty: "EASY",
      },
      {
        text: "বিশেষ আপেক্ষিকতা অনুযায়ী দ্রুতগামী বস্তুর সময় কেমন হয়?",
        options: ["ধীরে চলে", "দ্রুত চলে", "অপরিবর্তিত", "থেমে যায়"],
        correctAnswer: "ধীরে চলে",
        explanation: "টাইম ডাইলেশন — পর্যবেক্ষকের সাপেক্ষে চলমান ঘড়ি ধীর চলে।",
        difficulty: "HARD",
      },
      {
        text: "বস্তুর বেগ বাড়লে তার আপেক্ষিক ভর কেমন হয়?",
        options: ["বাড়ে", "কমে", "অপরিবর্তিত", "শূন্য হয়"],
        correctAnswer: "বাড়ে",
        explanation: "m = m₀/√(1−v²/c²) — বেগ বাড়লে ভর বাড়ে।",
        difficulty: "HARD",
      },
    ],
  },
  {
    topicName: "ফোটন",
    subjectName: "পদার্থবিজ্ঞান ২য় পত্র",
    questions: [
      {
        text: "ফোটনের স্থির ভর কত?",
        options: ["শূন্য", "1 amu", "9.1×10⁻³¹ kg", "1.6×10⁻¹⁹ kg"],
        correctAnswer: "শূন্য",
        explanation: "ফোটনের বিশ্রাম ভর শূন্য, তাই আলোর বেগে চলে।",
        difficulty: "MEDIUM",
      },
      {
        text: "E = hf সমীকরণে h কী?",
        options: ["প্ল্যাঙ্ক ধ্রুবক", "আলোর বেগ", "তরঙ্গদৈর্ঘ্য", "ভর"],
        correctAnswer: "প্ল্যাঙ্ক ধ্রুবক",
        explanation: "h ≈ ৬.৬৩ × ১০⁻³⁴ J·s।",
        difficulty: "EASY",
      },
      {
        text: "আলোক-তড়িৎ ক্রিয়া আলোর কোন ধর্ম প্রমাণ করে?",
        options: ["কণা ধর্ম", "তরঙ্গ ধর্ম", "ব্যতিচার", "অপবর্তন"],
        correctAnswer: "কণা ধর্ম",
        explanation: "আইনস্টাইনের ব্যাখ্যায় আলো ফোটন কণা হিসেবে আচরণ করে।",
        difficulty: "MEDIUM",
      },
    ],
  },
  {
    topicName: "আলোর ব্যতিচার",
    subjectName: "পদার্থবিজ্ঞান ২য় পত্র",
    questions: [
      {
        text: "ব্যতিচার ঘটতে হলে উৎস দুটি কেমন হতে হবে?",
        options: ["কোহেরেন্ট", "ভিন্ন কম্পাঙ্কের", "অসংলগ্ন", "একটিই"],
        correctAnswer: "কোহেরেন্ট",
        explanation: "স্থির দশা-পার্থক্যযুক্ত (কোহেরেন্ট) উৎস লাগে।",
        difficulty: "MEDIUM",
      },
      {
        text: "গঠনমূলক ব্যতিচারে পথ পার্থক্য কত হয়?",
        options: ["তরঙ্গদৈর্ঘ্যের পূর্ণ গুণিতক", "অর্ধ তরঙ্গদৈর্ঘ্য", "এক-চতুর্থাংশ", "শূন্য নয়"],
        correctAnswer: "তরঙ্গদৈর্ঘ্যের পূর্ণ গুণিতক",
        explanation: "পথ পার্থক্য nλ হলে উজ্জ্বল ডোরা তৈরি হয়।",
        difficulty: "HARD",
      },
      {
        text: "ইয়ংয়ের দ্বি-চিড় পরীক্ষা কী প্রমাণ করেছিল?",
        options: ["আলোর তরঙ্গ প্রকৃতি", "আলোর কণা প্রকৃতি", "আলোর বেগ", "আলোর রঙ"],
        correctAnswer: "আলোর তরঙ্গ প্রকৃতি",
        explanation: "ব্যতিচার ডোরা তরঙ্গ ছাড়া ব্যাখ্যা করা যায় না।",
        difficulty: "MEDIUM",
      },
    ],
  },
  {
    topicName: "আলোর অপবর্তন",
    subjectName: "পদার্থবিজ্ঞান ২য় পত্র",
    questions: [
      {
        text: "অপবর্তন কখন স্পষ্ট হয়?",
        options: ["বাধার আকার তরঙ্গদৈর্ঘ্যের কাছাকাছি হলে", "বাধা অনেক বড় হলে", "আলো তীব্র হলে", "মাধ্যম ঘন হলে"],
        correctAnswer: "বাধার আকার তরঙ্গদৈর্ঘ্যের কাছাকাছি হলে",
        explanation: "ছিদ্র/বাধা λ এর তুলনীয় হলে অপবর্তন লক্ষণীয় হয়।",
        difficulty: "MEDIUM",
      },
      {
        text: "অপবর্তন কী প্রমাণ করে?",
        options: ["আলোর তরঙ্গ ধর্ম", "আলোর কণা ধর্ম", "আলোর সরলরৈখিক গতি", "আলোর প্রতিফলন"],
        correctAnswer: "আলোর তরঙ্গ ধর্ম",
        explanation: "বাধার প্রান্তে আলোর বেঁকে যাওয়া তরঙ্গ আচরণ।",
        difficulty: "MEDIUM",
      },
      {
        text: "কোন রঙের অপবর্তন সবচেয়ে বেশি?",
        options: ["লাল", "বেগুনি", "নীল", "সবুজ"],
        correctAnswer: "লাল",
        explanation: "তরঙ্গদৈর্ঘ্য সবচেয়ে বড় বলে লাল আলো বেশি বাঁকে।",
        difficulty: "HARD",
      },
    ],
  },
  {
    topicName: "গবেষণাগারের নিরাপত্তা",
    subjectName: "রসায়ন ১ম পত্র",
    questions: [
      {
        text: "গাঢ় অ্যাসিড পাতলা করার সঠিক নিয়ম কী?",
        options: ["পানিতে ধীরে অ্যাসিড ঢালা", "অ্যাসিডে পানি ঢালা", "একসাথে মেশানো", "গরম করে মেশানো"],
        correctAnswer: "পানিতে ধীরে অ্যাসিড ঢালা",
        explanation: "বিপরীত করলে তীব্র তাপে ছিটকে দুর্ঘটনা ঘটতে পারে।",
        difficulty: "MEDIUM",
      },
      {
        text: "গবেষণাগারে চোখ রক্ষায় কী ব্যবহার করা হয়?",
        options: ["সেফটি গগলস", "হাতমোজা", "অ্যাপ্রন", "মাস্ক"],
        correctAnswer: "সেফটি গগলস",
        explanation: "রাসায়নিক ছিটকে পড়া থেকে চোখ বাঁচাতে গগলস অপরিহার্য।",
        difficulty: "EASY",
      },
      {
        text: "MSDS বলতে কী বোঝায়?",
        options: ["Material Safety Data Sheet", "Molecular Structure Data Sheet", "Mass Solution Density Scale", "Metal Salt Detection System"],
        correctAnswer: "Material Safety Data Sheet",
        explanation: "প্রতিটি রাসায়নিকের ঝুঁকি ও ব্যবস্থাপনার তথ্যপত্র।",
        difficulty: "MEDIUM",
      },
    ],
  },
  {
    topicName: "রাসায়নিক পদার্থের গুণগত মান",
    subjectName: "রসায়ন ১ম পত্র",
    questions: [
      {
        text: "AR গ্রেড রাসায়নিক বলতে কী বোঝায়?",
        options: ["Analytical Reagent — উচ্চ বিশুদ্ধতা", "শিল্পগ্রেড", "অপরিশোধিত", "বাণিজ্যিক গ্রেড"],
        correctAnswer: "Analytical Reagent — উচ্চ বিশুদ্ধতা",
        explanation: "AR গ্রেড বিশ্লেষণী কাজে ব্যবহৃত সবচেয়ে বিশুদ্ধ শ্রেণি।",
        difficulty: "MEDIUM",
      },
      {
        text: "রাসায়নিক দ্রব্য সংরক্ষণে লেবেলে কী থাকা জরুরি?",
        options: ["নাম, ঘনমাত্রা ও ঝুঁকি চিহ্ন", "শুধু দাম", "শুধু রঙ", "শুধু ওজন"],
        correctAnswer: "নাম, ঘনমাত্রা ও ঝুঁকি চিহ্ন",
        explanation: "সঠিক লেবেলিং দুর্ঘটনা প্রতিরোধের প্রথম ধাপ।",
        difficulty: "EASY",
      },
      {
        text: "আলোক-সংবেদনশীল রাসায়নিক কোন পাত্রে রাখা হয়?",
        options: ["বাদামি রঙের বোতলে", "স্বচ্ছ বোতলে", "খোলা পাত্রে", "প্লাস্টিক ব্যাগে"],
        correctAnswer: "বাদামি রঙের বোতলে",
        explanation: "অ্যাম্বার বোতল আলো আটকে বিয়োজন রোধ করে।",
        difficulty: "MEDIUM",
      },
    ],
  },
  {
    topicName: "জীবন রক্ষাকারী রসায়ন",
    subjectName: "রসায়ন ১ম পত্র",
    questions: [
      {
        text: "অ্যান্টিবায়োটিক কী কাজে ব্যবহৃত হয়?",
        options: ["ব্যাকটেরিয়া সংক্রমণ প্রতিরোধে", "ভাইরাস ধ্বংসে", "ব্যথা কমাতে", "জ্বর কমাতে"],
        correctAnswer: "ব্যাকটেরিয়া সংক্রমণ প্রতিরোধে",
        explanation: "অ্যান্টিবায়োটিক ভাইরাসে কাজ করে না।",
        difficulty: "EASY",
      },
      {
        text: "প্যারাসিটামল কোন শ্রেণির ওষুধ?",
        options: ["জ্বরনাশক ও ব্যথানাশক", "অ্যান্টিবায়োটিক", "অ্যান্টাসিড", "ভিটামিন"],
        correctAnswer: "জ্বরনাশক ও ব্যথানাশক",
        explanation: "অ্যান্টিপাইরেটিক ও অ্যানালজেসিক হিসেবে কাজ করে।",
        difficulty: "EASY",
      },
      {
        text: "অ্যান্টাসিড কী প্রশমিত করে?",
        options: ["পাকস্থলীর অতিরিক্ত অ্যাসিড", "রক্তের ক্ষার", "রক্তচাপ", "শর্করা"],
        correctAnswer: "পাকস্থলীর অতিরিক্ত অ্যাসিড",
        explanation: "Mg(OH)₂ বা NaHCO₃ HCl প্রশমিত করে।",
        difficulty: "MEDIUM",
      },
    ],
  },
  {
    topicName: "শিল্পে রসায়ন",
    subjectName: "রসায়ন ১ম পত্র",
    questions: [
      {
        text: "সাবান তৈরির প্রক্রিয়াকে কী বলে?",
        options: ["সাপোনিফিকেশন", "পলিমারাইজেশন", "হাইড্রোজিনেশন", "নিউট্রালাইজেশন"],
        correctAnswer: "সাপোনিফিকেশন",
        explanation: "তেল/চর্বি ক্ষারের সাথে বিক্রিয়ায় সাবান ও গ্লিসারল দেয়।",
        difficulty: "MEDIUM",
      },
      {
        text: "সিমেন্টের প্রধান কাঁচামাল কোনটি?",
        options: ["চুনাপাথর", "বালি", "লোহা", "কাঠ"],
        correctAnswer: "চুনাপাথর",
        explanation: "চুনাপাথর ও কাদামাটি পুড়িয়ে ক্লিংকার তৈরি হয়।",
        difficulty: "EASY",
      },
      {
        text: "কাচ তৈরির প্রধান উপাদান কী?",
        options: ["সিলিকা", "অ্যালুমিনা", "কার্বন", "জিপসাম"],
        correctAnswer: "সিলিকা",
        explanation: "SiO₂ (বালি) কাচের মূল উপাদান।",
        difficulty: "EASY",
      },
    ],
  },
  {
    topicName: "খনিজ সম্পদ",
    subjectName: "রসায়ন ২য় পত্র",
    questions: [
      {
        text: "বাংলাদেশের প্রধান খনিজ সম্পদ কোনটি?",
        options: ["প্রাকৃতিক গ্যাস", "সোনা", "তামা", "ইউরেনিয়াম"],
        correctAnswer: "প্রাকৃতিক গ্যাস",
        explanation: "বাংলাদেশের বৃহত্তম খনিজ সম্পদ প্রাকৃতিক গ্যাস।",
        difficulty: "EASY",
      },
      {
        text: "প্রাকৃতিক গ্যাসের প্রধান উপাদান কী?",
        options: ["মিথেন", "ইথেন", "প্রোপেন", "বিউটেন"],
        correctAnswer: "মিথেন",
        explanation: "প্রাকৃতিক গ্যাসের ৮৫-৯০% মিথেন।",
        difficulty: "EASY",
      },
      {
        text: "আকরিক থেকে ধাতু নিষ্কাশনের বিজ্ঞানকে কী বলে?",
        options: ["ধাতুবিদ্যা", "জৈব রসায়ন", "ভৌত রসায়ন", "বিশ্লেষণী রসায়ন"],
        correctAnswer: "ধাতুবিদ্যা",
        explanation: "Metallurgy — আকরিক থেকে বিশুদ্ধ ধাতু পাওয়ার প্রক্রিয়া।",
        difficulty: "MEDIUM",
      },
    ],
  },
  {
    topicName: "সার ও কীটনাশক",
    subjectName: "রসায়ন ২য় পত্র",
    questions: [
      {
        text: "ইউরিয়া সারে প্রধান পুষ্টি উপাদান কী?",
        options: ["নাইট্রোজেন", "ফসফরাস", "পটাশিয়াম", "ক্যালসিয়াম"],
        correctAnswer: "নাইট্রোজেন",
        explanation: "ইউরিয়া CO(NH₂)₂ এ প্রায় ৪৬% নাইট্রোজেন থাকে।",
        difficulty: "EASY",
      },
      {
        text: "TSP সারে প্রধান উপাদান কী?",
        options: ["ফসফরাস", "নাইট্রোজেন", "পটাশিয়াম", "সালফার"],
        correctAnswer: "ফসফরাস",
        explanation: "Triple Super Phosphate ফসফরাসের প্রধান উৎস।",
        difficulty: "MEDIUM",
      },
      {
        text: "অতিরিক্ত কীটনাশক ব্যবহারের প্রধান ক্ষতি কী?",
        options: ["পরিবেশ ও স্বাস্থ্য দূষণ", "ফলন বৃদ্ধি", "মাটি উর্বর হওয়া", "পানি বিশুদ্ধ হওয়া"],
        correctAnswer: "পরিবেশ ও স্বাস্থ্য দূষণ",
        explanation: "কীটনাশক খাদ্যশৃঙ্খলে জমে (biomagnification) ক্ষতি করে।",
        difficulty: "MEDIUM",
      },
    ],
  },
];

async function main() {
  console.log("🌱 MCQ-শূন্য চ্যাপ্টার পূরণ শুরু...");
  let added = 0, skipped = 0;
  const notFound: string[] = [];

  for (const entry of seedData) {
    const topic = await prisma.topic.findFirst({
      where: { name: entry.topicName, chapter: { subject: { name: entry.subjectName } } },
    });
    if (!topic) { notFound.push(`${entry.topicName} (${entry.subjectName})`); continue; }

    const existing = await prisma.question.findMany({
      where: { topicId: topic.id }, select: { text: true },
    });
    const seen = new Set(existing.map((q) => q.text.trim()));
    const fresh = entry.questions.filter((q) => !seen.has(q.text.trim()));
    skipped += entry.questions.length - fresh.length;
    if (fresh.length === 0) { console.log(`⏭️  ${entry.topicName} — আগে থেকেই আছে`); continue; }

    await prisma.question.createMany({
      data: fresh.map((q) => ({
        topicId: topic.id, type: "MCQ" as const, text: q.text, options: q.options,
        correctAnswer: q.correctAnswer, explanation: q.explanation, difficulty: q.difficulty,
      })),
    });
    added += fresh.length;
    console.log(`✅ ${entry.topicName} — ${fresh.length}টা যোগ`);
  }

  if (notFound.length) console.log(`\n⚠️  পাওয়া যায়নি: ${notFound.join(", ")}`);
  console.log(`\n🎉 মোট ${added}টা নতুন MCQ` + (skipped ? ` (${skipped}টা আগে থেকেই ছিল)` : ""));

  // চ্যাপ্টার-স্তরের কভারেজ রিপোর্ট
  const chapters = await prisma.chapter.findMany({
    select: { name: true, topics: { select: { _count: { select: { questions: true } } } } },
  });
  const empty = chapters.filter((c) => c.topics.reduce((a, t) => a + t._count.questions, 0) === 0);
  console.log(`\n📊 চ্যাপ্টার: ${chapters.length} | MCQ-শূন্য: ${empty.length}`);
  if (empty.length) console.log(`   → ${empty.map((c) => c.name).join(", ")}`);
}

main()
  .catch((e) => { console.error("❌ Seed ব্যর্থ:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
