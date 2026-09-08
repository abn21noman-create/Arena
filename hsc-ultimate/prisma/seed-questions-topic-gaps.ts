// ===================================================================
// MCQ Question Bank — isImportant টপিকের কভারেজ পূরণ (সেট ৩)
// -------------------------------------------------------------------
// অডিটে দেখা গেছে ৮১টা isImportant টপিকের মধ্যে:
//   • ২টায় **একটিও MCQ ছিল না** (অ্যালকোহল ও কার্বক্সিলিক এসিড,
//     প্রবন্ধ রচনা) — যদিও Notes ও CQ ছিল
//   • ২৯টায় মাত্র ২টা করে MCQ ছিল (একটা কুইজের জন্য খুব কম)
//
// এই স্ক্রিপ্ট সেই ৩১টা টপিকে ৯৭টা নতুন MCQ যোগ করে।
//
// ⚠️ গুরুত্বপূর্ণ পার্থক্য: established `seed-questions-*-gaps.ts`
// স্ক্রিপ্টগুলো প্রতি টপিকে `deleteMany` করে (idempotent)। এখানে
// সেটা করা হয় **না** — কারণ ২৯টা টপিকে আগে থেকেই ২টা করে ভালো
// প্রশ্ন আছে, deleteMany করলে সেগুলো মুছে যেত। বদলে text-ভিত্তিক
// ডুপ্লিকেট চেক করে শুধু নতুনগুলো যোগ করা হয়, তাই বারবার চালানো
// নিরাপদ।
//
// টপিক লুকআপে subject filter আছে — "প্রক্ষেপক গতি" এর মতো একই নামে
// একাধিক subject এ টপিক থাকার collision এড়াতে (established পাঠ)।
//
// রান: pnpm db:seed-questions-topic-gaps
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
    topicName: "C প্রোগ্রামিং বেসিক",
    subjectName: "তথ্য ও যোগাযোগ প্রযুক্তি",
    questions: [
      {
        text: "C ভাষায় একক লাইনের মন্তব্য (comment) লিখতে কী ব্যবহৃত হয়?",
        options: ["//", "/* */", "#", "--"],
        correctAnswer: "//",
        explanation: "C99 থেকে // দিয়ে একক লাইনের মন্তব্য লেখা যায়; /* */ একাধিক লাইনের জন্য।",
        difficulty: "EASY",
      },
      {
        text: "C ভাষায় printf() ফাংশন ব্যবহার করতে কোন হেডার ফাইল লাগে?",
        options: ["stdio.h", "conio.h", "math.h", "string.h"],
        correctAnswer: "stdio.h",
        explanation: "printf() ও scanf() স্ট্যান্ডার্ড ইনপুট-আউটপুট ফাংশন, যা stdio.h হেডার ফাইলে ঘোষিত।",
        difficulty: "EASY",
      },
      {
        text: "C ভাষায় একটি লুপ কমপক্ষে একবার চলবেই — এমন লুপ কোনটি?",
        options: ["do-while", "while", "for", "if"],
        correctAnswer: "do-while",
        explanation: "do-while লুপে শর্ত যাচাই হয় শরীর চালানোর পরে, তাই অন্তত একবার অবশ্যই চলে।",
        difficulty: "MEDIUM",
      },
    ],
  },
  {
    topicName: "অ্যালকোহল ও কার্বক্সিলিক এসিড",
    subjectName: "রসায়ন ২য় পত্র",
    questions: [
      {
        text: "ইথানলের আণবিক সংকেত কোনটি?",
        options: ["C₂H₅OH", "CH₃OH", "C₃H₇OH", "CH₃COOH"],
        correctAnswer: "C₂H₅OH",
        explanation: "ইথানল একটি প্রাইমারি অ্যালকোহল; সংকেত C₂H₅OH।",
        difficulty: "EASY",
      },
      {
        text: "কার্বক্সিলিক এসিডের কার্যকরী মূলক কোনটি?",
        options: ["−COOH", "−OH", "−CHO", "−CO−"],
        correctAnswer: "−COOH",
        explanation: "কার্বক্সিল মূলক −COOH; এতে কার্বনিল ও হাইড্রক্সিল উভয়ই আছে।",
        difficulty: "EASY",
      },
      {
        text: "অ্যালকোহলের সাথে কার্বক্সিলিক এসিডের বিক্রিয়ায় কী উৎপন্ন হয়?",
        options: ["এস্টার", "ইথার", "অ্যালডিহাইড", "কিটোন"],
        correctAnswer: "এস্টার",
        explanation: "এস্টারীকরণ বিক্রিয়ায় এস্টার ও পানি উৎপন্ন হয়।",
        difficulty: "MEDIUM",
      },
      {
        text: "ইথানলকে জারিত করলে প্রথমে কী পাওয়া যায়?",
        options: ["অ্যাসিটালডিহাইড", "অ্যাসিটিক এসিড", "ইথিলিন", "ইথেন"],
        correctAnswer: "অ্যাসিটালডিহাইড",
        explanation: "প্রাইমারি অ্যালকোহল জারণে প্রথমে অ্যালডিহাইড, পরে কার্বক্সিলিক এসিড দেয়।",
        difficulty: "MEDIUM",
      },
      {
        text: "ভিনেগারে কোন এসিড থাকে?",
        options: ["অ্যাসিটিক এসিড", "ফরমিক এসিড", "সাইট্রিক এসিড", "ল্যাকটিক এসিড"],
        correctAnswer: "অ্যাসিটিক এসিড",
        explanation: "ভিনেগার প্রায় ৫% অ্যাসিটিক এসিডের জলীয় দ্রবণ।",
        difficulty: "EASY",
      },
    ],
  },
  {
    topicName: "প্রবন্ধ রচনা",
    subjectName: "বাংলা ২য় পত্র",
    questions: [
      {
        text: "প্রবন্ধের সাধারণত কয়টি প্রধান অংশ থাকে?",
        options: ["তিনটি", "দুইটি", "চারটি", "পাঁচটি"],
        correctAnswer: "তিনটি",
        explanation: "ভূমিকা, মূল আলোচনা ও উপসংহার — এই তিন অংশে প্রবন্ধ সাজানো হয়।",
        difficulty: "EASY",
      },
      {
        text: "প্রবন্ধের কোন অংশে বিষয়বস্তুর সংক্ষিপ্ত পরিচয় দেওয়া হয়?",
        options: ["ভূমিকা", "উপসংহার", "মূল অংশ", "শিরোনাম"],
        correctAnswer: "ভূমিকা",
        explanation: "ভূমিকায় পাঠককে বিষয়ের সাথে পরিচয় করিয়ে আগ্রহ তৈরি করা হয়।",
        difficulty: "EASY",
      },
      {
        text: "'প্রবন্ধ' শব্দের আভিধানিক অর্থ কী?",
        options: ["বিশেষভাবে বন্ধন", "কবিতা", "গল্প", "নাটক"],
        correctAnswer: "বিশেষভাবে বন্ধন",
        explanation: "প্র (বিশেষ) + বন্ধ — অর্থাৎ চিন্তাকে সুশৃঙ্খলভাবে বাঁধা।",
        difficulty: "MEDIUM",
      },
      {
        text: "ভালো প্রবন্ধের প্রধান বৈশিষ্ট্য কোনটি?",
        options: ["তথ্যনিষ্ঠতা ও যুক্তিশৃঙ্খলা", "অলংকারবহুল ভাষা", "দীর্ঘ বাক্য", "কল্পনাপ্রবণতা"],
        correctAnswer: "তথ্যনিষ্ঠতা ও যুক্তিশৃঙ্খলা",
        explanation: "প্রবন্ধে তথ্য ও যুক্তির ধারাবাহিকতাই মূল; অতিরঞ্জন পরিহার্য।",
        difficulty: "MEDIUM",
      },
      {
        text: "প্রবন্ধের উপসংহারে কী থাকে?",
        options: ["সারসংক্ষেপ ও লেখকের অভিমত", "নতুন তথ্য", "শিরোনাম", "উদ্ধৃতির তালিকা"],
        correctAnswer: "সারসংক্ষেপ ও লেখকের অভিমত",
        explanation: "উপসংহারে আলোচনার সারসংক্ষেপ ও সিদ্ধান্ত দেওয়া হয়।",
        difficulty: "EASY",
      },
    ],
  },
  {
    topicName: "Paragraph Writing",
    subjectName: "English 1st Paper",
    questions: [
      {
        text: "A good paragraph must have —",
        options: ["a single main idea", "many unrelated ideas", "only dialogues", "no topic sentence"],
        correctAnswer: "a single main idea",
        explanation: "Unity means one controlling idea developed throughout the paragraph.",
        difficulty: "EASY",
      },
      {
        text: "The sentence that states the main idea of a paragraph is called the —",
        options: ["topic sentence", "concluding sentence", "supporting detail", "transition"],
        correctAnswer: "topic sentence",
        explanation: "The topic sentence introduces the controlling idea, usually at the beginning.",
        difficulty: "EASY",
      },
      {
        text: "Which of the following is a transition word showing contrast?",
        options: ["However", "Moreover", "Therefore", "Similarly"],
        correctAnswer: "However",
        explanation: "'However' signals contrast; 'moreover' adds, 'therefore' shows result.",
        difficulty: "MEDIUM",
      },
    ],
  },
  {
    topicName: "অর্ধপরিবাহী",
    subjectName: "পদার্থবিজ্ঞান ২য় পত্র",
    questions: [
      {
        text: "বিশুদ্ধ সিলিকনে ট্রাইভ্যালেন্ট অপদ্রব্য মেশালে কী পাওয়া যায়?",
        options: ["p-টাইপ অর্ধপরিবাহী", "n-টাইপ অর্ধপরিবাহী", "অন্তরক", "পরিবাহী"],
        correctAnswer: "p-টাইপ অর্ধপরিবাহী",
        explanation: "ত্রিযোজী অপদ্রব্য হোল তৈরি করে, ফলে p-টাইপ হয়।",
        difficulty: "MEDIUM",
      },
      {
        text: "n-টাইপ অর্ধপরিবাহীতে সংখ্যাগরিষ্ঠ আধান বাহক কী?",
        options: ["ইলেকট্রন", "হোল", "প্রোটন", "আয়ন"],
        correctAnswer: "ইলেকট্রন",
        explanation: "পঞ্চযোজী অপদ্রব্য অতিরিক্ত ইলেকট্রন দেয়।",
        difficulty: "MEDIUM",
      },
      {
        text: "তাপমাত্রা বাড়ালে অর্ধপরিবাহীর রোধ কেমন হয়?",
        options: ["কমে", "বাড়ে", "অপরিবর্তিত থাকে", "শূন্য হয়"],
        correctAnswer: "কমে",
        explanation: "তাপে আধান বাহক সংখ্যা বাড়ে, তাই রোধ কমে — ধাতুর বিপরীত।",
        difficulty: "MEDIUM",
      },
    ],
  },
  {
    topicName: "এনজাইম",
    subjectName: "জীববিজ্ঞান ১ম পত্র",
    questions: [
      {
        text: "এনজাইম বিক্রিয়ায় কী কমায়?",
        options: ["সক্রিয়করণ শক্তি", "তাপমাত্রা", "pH", "বিক্রিয়কের ঘনমাত্রা"],
        correctAnswer: "সক্রিয়করণ শক্তি",
        explanation: "এনজাইম সক্রিয়করণ শক্তি কমিয়ে বিক্রিয়ার হার বাড়ায়।",
        difficulty: "MEDIUM",
      },
      {
        text: "এনজাইমের যে অংশে সাবস্ট্রেট যুক্ত হয় তাকে কী বলে?",
        options: ["সক্রিয় স্থান", "কোফ্যাক্টর", "অ্যাপোএনজাইম", "প্রস্থেটিক গ্রুপ"],
        correctAnswer: "সক্রিয় স্থান",
        explanation: "সক্রিয় স্থানের (active site) নির্দিষ্ট আকৃতিই এনজাইমের বিশিষ্টতা দেয়।",
        difficulty: "MEDIUM",
      },
      {
        text: "অধিক তাপে এনজাইম নিষ্ক্রিয় হয় কেন?",
        options: ["প্রোটিন বিকৃত হয়", "pH বদলায়", "সাবস্ট্রেট শেষ হয়", "পানি শুকায়"],
        correctAnswer: "প্রোটিন বিকৃত হয়",
        explanation: "উচ্চ তাপে ত্রিমাত্রিক গঠন ভেঙে সক্রিয় স্থান নষ্ট হয় (denaturation)।",
        difficulty: "MEDIUM",
      },
    ],
  },
  {
    topicName: "কুলম্বের সূত্র",
    subjectName: "পদার্থবিজ্ঞান ২য় পত্র",
    questions: [
      {
        text: "কুলম্বের সূত্র অনুযায়ী বল দূরত্বের সাথে কীভাবে সম্পর্কিত?",
        options: ["দূরত্বের বর্গের ব্যস্তানুপাতিক", "দূরত্বের সমানুপাতিক", "দূরত্বের ব্যস্তানুপাতিক", "দূরত্বের বর্গের সমানুপাতিক"],
        correctAnswer: "দূরত্বের বর্গের ব্যস্তানুপাতিক",
        explanation: "F = kq₁q₂/r² — বিপরীত বর্গীয় সূত্র।",
        difficulty: "EASY",
      },
      {
        text: "দুটি আধানের দূরত্ব দ্বিগুণ করলে বল কত হবে?",
        options: ["এক-চতুর্থাংশ", "অর্ধেক", "দ্বিগুণ", "চারগুণ"],
        correctAnswer: "এক-চতুর্থাংশ",
        explanation: "F ∝ 1/r², r দ্বিগুণে F হবে 1/4 গুণ।",
        difficulty: "MEDIUM",
      },
      {
        text: "শূন্য মাধ্যমে কুলম্ব ধ্রুবক k এর মান প্রায় কত?",
        options: ["9 × 10⁹ N·m²/C²", "6.67 × 10⁻¹¹", "1.6 × 10⁻¹⁹", "3 × 10⁸"],
        correctAnswer: "9 × 10⁹ N·m²/C²",
        explanation: "k = 1/(4πε₀) ≈ 9 × 10⁹ N·m²/C²।",
        difficulty: "MEDIUM",
      },
    ],
  },
  {
    topicName: "জটিল সংখ্যার বীজগণিত",
    subjectName: "উচ্চতর গণিত ২য় পত্র",
    questions: [
      {
        text: "(2+3i) + (1−i) = ?",
        options: ["3+2i", "3+4i", "1+2i", "2+3i"],
        correctAnswer: "3+2i",
        explanation: "বাস্তব ও কাল্পনিক অংশ আলাদাভাবে যোগ: (2+1) + (3−1)i।",
        difficulty: "EASY",
      },
      {
        text: "জটিল সংখ্যা z = 3+4i এর মডুলাস কত?",
        options: ["5", "7", "25", "4"],
        correctAnswer: "5",
        explanation: "|z| = √(3²+4²) = 5।",
        difficulty: "MEDIUM",
      },
      {
        text: "i³ এর মান কত?",
        options: ["−i", "i", "1", "−1"],
        correctAnswer: "−i",
        explanation: "i³ = i²·i = (−1)i = −i।",
        difficulty: "MEDIUM",
      },
    ],
  },
  {
    topicName: "দ্বিপদী উপপাদ্য",
    subjectName: "উচ্চতর গণিত ২য় পত্র",
    questions: [
      {
        text: "(a+b)ⁿ বিস্তৃতিতে (r+1) তম পদ কোনটি?",
        options: ["C(n,r)·aⁿ⁻ʳ·bʳ", "C(n,r)·aʳ·bⁿ⁻ʳ", "n·aⁿ⁻ʳ·bʳ", "aⁿ·bʳ"],
        correctAnswer: "C(n,r)·aⁿ⁻ʳ·bʳ",
        explanation: "সাধারণ পদ T₍ᵣ₊₁₎ = C(n,r)aⁿ⁻ʳbʳ।",
        difficulty: "MEDIUM",
      },
      {
        text: "(1+x)⁴ বিস্তৃতিতে সব সহগের যোগফল কত?",
        options: ["16", "8", "4", "32"],
        correctAnswer: "16",
        explanation: "x=1 বসালে (1+1)⁴ = 16।",
        difficulty: "MEDIUM",
      },
      {
        text: "(x+y)⁶ বিস্তৃতিতে মধ্যপদ কোনটি?",
        options: ["৪র্থ পদ", "৩য় পদ", "৫ম পদ", "৭ম পদ"],
        correctAnswer: "৪র্থ পদ",
        explanation: "n জোড় হলে মধ্যপদ (n/2 + 1) = ৪র্থ পদ।",
        difficulty: "HARD",
      },
    ],
  },
  {
    topicName: "নিউটনের মহাকর্ষ সূত্র",
    subjectName: "পদার্থবিজ্ঞান ১ম পত্র",
    questions: [
      {
        text: "মহাকর্ষ বল দুটি বস্তুর ভরের সাথে কীভাবে সম্পর্কিত?",
        options: ["গুণফলের সমানুপাতিক", "যোগফলের সমানুপাতিক", "ব্যস্তানুপাতিক", "সম্পর্কহীন"],
        correctAnswer: "গুণফলের সমানুপাতিক",
        explanation:
          "নিউটনের মহাকর্ষ সূত্র: F = Gm₁m₂/r²। অর্থাৎ মহাকর্ষ বল দুই বস্তুর ভরের গুণফলের সমানুপাতিক এবং তাদের মধ্যবর্তী দূরত্বের বর্গের ব্যস্তানুপাতিক। তাই কোনো একটি বস্তুর ভর দ্বিগুণ করলে বল দ্বিগুণ হয়, কিন্তু দূরত্ব দ্বিগুণ করলে বল চার ভাগের এক ভাগ হয়ে যায়। G = 6.673×10⁻¹¹ Nm²kg⁻² একটি সার্বজনীন ধ্রুবক।",
        difficulty: "EASY",
      },
      {
        text: "সার্বজনীন মহাকর্ষ ধ্রুবক G এর মান কত?",
        options: ["6.67 × 10⁻¹¹ N·m²/kg²", "9.8 m/s²", "3 × 10⁸ m/s", "1.6 × 10⁻¹⁹ C"],
        correctAnswer: "6.67 × 10⁻¹¹ N·m²/kg²",
        explanation: "G একটি সার্বজনীন ধ্রুবক, সর্বত্র একই।",
        difficulty: "MEDIUM",
      },
      {
        text: "পৃথিবীর কেন্দ্রে কোনো বস্তুর ওজন কত?",
        options: ["শূন্য", "সর্বোচ্চ", "পৃষ্ঠের সমান", "দ্বিগুণ"],
        correctAnswer: "শূন্য",
        explanation: "কেন্দ্রে চারদিক থেকে সমান আকর্ষণে লব্ধি বল শূন্য হয়।",
        difficulty: "HARD",
      },
    ],
  },
  {
    topicName: "নির্ণায়কের মান নির্ণয়",
    subjectName: "উচ্চতর গণিত ১ম পত্র",
    questions: [
      {
        text: "|[[3,1],[2,4]]| এর মান কত?",
        options: ["10", "14", "12", "5"],
        correctAnswer: "10",
        explanation: "(3×4) − (1×2) = 12 − 2 = 10।",
        difficulty: "EASY",
      },
      {
        text: "কোনো নির্ণায়কের দুটি সারি অভিন্ন হলে তার মান কত?",
        options: ["0", "1", "−1", "অসংজ্ঞায়িত"],
        correctAnswer: "0",
        explanation: "অভিন্ন সারি/কলাম থাকলে নির্ণায়ক শূন্য।",
        difficulty: "MEDIUM",
      },
      {
        text: "একটি নির্ণায়কের সব সারি ও কলাম বিনিময় করলে মান কী হয়?",
        options: ["অপরিবর্তিত", "ঋণাত্মক", "শূন্য", "দ্বিগুণ"],
        correctAnswer: "অপরিবর্তিত",
        explanation: "ট্রান্সপোজে নির্ণায়কের মান বদলায় না: |Aᵀ| = |A|।",
        difficulty: "MEDIUM",
      },
    ],
  },
  {
    topicName: "পরাবৃত্ত",
    subjectName: "উচ্চতর গণিত ২য় পত্র",
    questions: [
      {
        text: "y² = 4ax পরাবৃত্তের নিয়ামক রেখার সমীকরণ কী?",
        options: ["x = −a", "x = a", "y = a", "y = −a"],
        correctAnswer: "x = −a",
        explanation: "উপকেন্দ্র (a,0), নিয়ামক x = −a।",
        difficulty: "MEDIUM",
      },
      {
        text: "y² = 4ax এর ল্যাটাস রেকটামের দৈর্ঘ্য কত?",
        options: ["4a", "2a", "a", "8a"],
        correctAnswer: "4a",
        explanation: "ল্যাটাস রেকটাম = 4a।",
        difficulty: "MEDIUM",
      },
      {
        text: "পরাবৃত্তের উৎকেন্দ্রিকতা (e) কত?",
        options: ["1", "0", "2", ">1"],
        correctAnswer: "1",
        explanation: "পরাবৃত্তের ক্ষেত্রে e = 1; উপবৃত্তে e<1, অধিবৃত্তে e>1।",
        difficulty: "HARD",
      },
    ],
  },
  {
    topicName: "পরিপাকতন্ত্র",
    subjectName: "জীববিজ্ঞান ২য় পত্র",
    questions: [
      {
        text: "প্রোটিন পরিপাক শুরু হয় কোথায়?",
        options: ["পাকস্থলীতে", "মুখগহ্বরে", "ক্ষুদ্রান্ত্রে", "বৃহদান্ত্রে"],
        correctAnswer: "পাকস্থলীতে",
        explanation: "পেপসিন এনজাইম পাকস্থলীতে প্রোটিনকে পেপটাইডে ভাঙে।",
        difficulty: "MEDIUM",
      },
      {
        text: "পিত্তরসের প্রধান কাজ কী?",
        options: ["চর্বি ইমালসিফিকেশন", "প্রোটিন ভাঙা", "স্টার্চ ভাঙা", "পানি শোষণ"],
        correctAnswer: "চর্বি ইমালসিফিকেশন",
        explanation: "পিত্তলবণ বড় চর্বিকণাকে ছোট করে লাইপেজের কাজ সহজ করে।",
        difficulty: "MEDIUM",
      },
      {
        text: "খাদ্যের শোষণ প্রধানত কোথায় ঘটে?",
        options: ["ক্ষুদ্রান্ত্রে", "পাকস্থলীতে", "বৃহদান্ত্রে", "অন্ননালিতে"],
        correctAnswer: "ক্ষুদ্রান্ত্রে",
        explanation: "ভিলাই ও মাইক্রোভিলাই ক্ষুদ্রান্ত্রের শোষণ ক্ষেত্রফল বহুগুণ বাড়ায়।",
        difficulty: "EASY",
      },
    ],
  },
  {
    topicName: "ফ্যারাডের সূত্র",
    subjectName: "পদার্থবিজ্ঞান ২য় পত্র",
    questions: [
      {
        text: "ফ্যারাডের তড়িৎচুম্বকীয় আবেশ সূত্র অনুযায়ী আবিষ্ট তড়িচ্চালক বল কীসের সমানুপাতিক?",
        options: ["চৌম্বক ফ্লাক্সের পরিবর্তনের হার", "ফ্লাক্সের মান", "কুণ্ডলীর রোধ", "তারের দৈর্ঘ্য"],
        correctAnswer: "চৌম্বক ফ্লাক্সের পরিবর্তনের হার",
        explanation:
          "ফ্যারাডের সূত্র: e = −N·dΦ/dt। আবিষ্ট তড়িচ্চালক বল চৌম্বক ফ্লাক্সের **পরিবর্তনের হারের** সমানুপাতিক — ফ্লাক্সের মানের নয়। তাই ফ্লাক্স যত বড়ই হোক, স্থির থাকলে কোনো EMF আবিষ্ট হয় না (এ কারণেই ট্রান্সফরমার DC তে কাজ করে না)। ঋণাত্মক চিহ্নটি লেঞ্জের সূত্র নির্দেশ করে: আবিষ্ট প্রবাহ সবসময় তার সৃষ্টির কারণকে বাধা দেয়, যা শক্তির সংরক্ষণ সূত্রেরই প্রকাশ।",
        difficulty: "MEDIUM",
      },
      {
        text: "ঋণাত্মক চিহ্নটি কোন সূত্র নির্দেশ করে?",
        options: ["লেন্জের সূত্র", "ওহমের সূত্র", "কুলম্বের সূত্র", "জুলের সূত্র"],
        correctAnswer: "লেন্জের সূত্র",
        explanation: "ঋণাত্মক চিহ্ন আবিষ্ট প্রবাহের বিরোধী দিক বোঝায়।",
        difficulty: "MEDIUM",
      },
      {
        text: "চৌম্বক ফ্লাক্সের একক কী?",
        options: ["ওয়েবার", "টেসলা", "হেনরি", "ফ্যারাড"],
        correctAnswer: "ওয়েবার",
        explanation: "Φ এর একক ওয়েবার (Wb) = T·m²।",
        difficulty: "EASY",
      },
    ],
  },
  {
    topicName: "বহুপদীর ভাগশেষ উপপাদ্য",
    subjectName: "উচ্চতর গণিত ২য় পত্র",
    questions: [
      {
        text: "f(x) কে (x−a) দিয়ে ভাগ করলে ভাগশেষ কত?",
        options: ["f(a)", "f(−a)", "0", "a"],
        correctAnswer: "f(a)",
        explanation: "ভাগশেষ উপপাদ্য অনুযায়ী ভাগশেষ = f(a)।",
        difficulty: "MEDIUM",
      },
      {
        text: "f(x) = x² − 3x + 2 কে (x−1) দিয়ে ভাগ করলে ভাগশেষ কত?",
        options: ["0", "1", "2", "−1"],
        correctAnswer: "0",
        explanation: "f(1) = 1 − 3 + 2 = 0, তাই (x−1) একটি উৎপাদক।",
        difficulty: "MEDIUM",
      },
      {
        text: "(x−a) যদি f(x) এর উৎপাদক হয় তবে —",
        options: ["f(a) = 0", "f(a) = 1", "f(0) = a", "f(a) = a"],
        correctAnswer: "f(a) = 0",
        explanation: "উৎপাদক উপপাদ্য — ভাগশেষ শূন্য হলেই উৎপাদক।",
        difficulty: "EASY",
      },
    ],
  },
  {
    topicName: "বায়ুমণ্ডল ও পরিবেশ দূষণ",
    subjectName: "রসায়ন ২য় পত্র",
    questions: [
      {
        text: "ওজোন স্তর ক্ষয়ের প্রধান কারণ কোনটি?",
        options: ["CFC", "CO₂", "N₂", "O₂"],
        correctAnswer: "CFC",
        explanation: "ক্লোরোফ্লুরোকার্বন থেকে মুক্ত ক্লোরিন পরমাণু ওজোন ভাঙে।",
        difficulty: "MEDIUM",
      },
      {
        text: "অ্যাসিড বৃষ্টির জন্য প্রধানত দায়ী গ্যাস কোনটি?",
        options: ["SO₂", "O₂", "N₂", "He"],
        correctAnswer: "SO₂",
        explanation: "SO₂ ও NOₓ বায়ুর জলীয় বাষ্পে দ্রবীভূত হয়ে অ্যাসিড তৈরি করে।",
        difficulty: "MEDIUM",
      },
      {
        text: "বায়ুমণ্ডলে সর্বাধিক পরিমাণে কোন গ্যাস আছে?",
        options: ["নাইট্রোজেন", "অক্সিজেন", "কার্বন ডাই-অক্সাইড", "আর্গন"],
        correctAnswer: "নাইট্রোজেন",
        explanation: "বায়ুমণ্ডলে প্রায় ৭৮% নাইট্রোজেন।",
        difficulty: "EASY",
      },
    ],
  },
  {
    topicName: "বিদ্যুৎ প্রবাহের চৌম্বক ক্রিয়া",
    subjectName: "পদার্থবিজ্ঞান ২য় পত্র",
    questions: [
      {
        text: "তড়িৎ প্রবাহের চারপাশে কী সৃষ্টি হয়?",
        options: ["চৌম্বক ক্ষেত্র", "তড়িৎ ক্ষেত্র", "মহাকর্ষ ক্ষেত্র", "তাপ ক্ষেত্র"],
        correctAnswer: "চৌম্বক ক্ষেত্র",
        explanation: "ওরস্টেডের আবিষ্কার — প্রবাহ চৌম্বক ক্ষেত্র তৈরি করে।",
        difficulty: "EASY",
      },
      {
        text: "সোলেনয়েডের ভেতরে চৌম্বক ক্ষেত্র কেমন?",
        options: ["প্রায় সুষম", "শূন্য", "অসমান", "বিপরীতমুখী"],
        correctAnswer: "প্রায় সুষম",
        explanation: "দীর্ঘ সোলেনয়েডের ভেতরে ক্ষেত্র সুষম ও অক্ষের সমান্তরাল।",
        difficulty: "MEDIUM",
      },
      {
        text: "চৌম্বক ক্ষেত্রে গতিশীল আধানের উপর বল কখন শূন্য হয়?",
        options: ["গতি ক্ষেত্রের সমান্তরাল হলে", "গতি লম্ব হলে", "আধান বেশি হলে", "ক্ষেত্র প্রবল হলে"],
        correctAnswer: "গতি ক্ষেত্রের সমান্তরাল হলে",
        explanation: "F = qvB sinθ; θ = 0° হলে বল শূন্য।",
        difficulty: "HARD",
      },
    ],
  },
  {
    topicName: "বিন্যাস",
    subjectName: "উচ্চতর গণিত ১ম পত্র",
    questions: [
      {
        text: "৫টি ভিন্ন বস্তু থেকে ৩টি সাজানোর উপায় কত?",
        options: ["60", "10", "15", "120"],
        correctAnswer: "60",
        explanation: "P(5,3) = 5!/2! = 60।",
        difficulty: "MEDIUM",
      },
      {
        text: "n টি ভিন্ন বস্তুর সব কটির বিন্যাস সংখ্যা কত?",
        options: ["n!", "n", "2ⁿ", "n²"],
        correctAnswer: "n!",
        explanation: "সব বস্তু নিয়ে বিন্যাস = n!।",
        difficulty: "EASY",
      },
      {
        text: "'BOOK' শব্দের অক্ষরগুলো দিয়ে কতভাবে সাজানো যায়?",
        options: ["12", "24", "4", "6"],
        correctAnswer: "12",
        explanation: "4!/2! = 12 (O দুবার আছে)।",
        difficulty: "MEDIUM",
      },
    ],
  },
  {
    topicName: "বৃত্তের সমীকরণ",
    subjectName: "উচ্চতর গণিত ১ম পত্র",
    questions: [
      {
        text: "কেন্দ্র (0,0) ও ব্যাসার্ধ r হলে বৃত্তের সমীকরণ কী?",
        options: ["x² + y² = r²", "x² − y² = r²", "x + y = r", "x²+y²=2r"],
        correctAnswer: "x² + y² = r²",
        explanation: "মূলবিন্দুকেন্দ্রিক বৃত্তের আদর্শ সমীকরণ।",
        difficulty: "EASY",
      },
      {
        text: "x² + y² − 4x − 6y + 9 = 0 বৃত্তের কেন্দ্র কোথায়?",
        options: ["(2, 3)", "(−2, −3)", "(4, 6)", "(0, 0)"],
        correctAnswer: "(2, 3)",
        explanation: "কেন্দ্র = (−g, −f) = (2, 3)।",
        difficulty: "MEDIUM",
      },
      {
        text: "কেন্দ্র (1,2), ব্যাসার্ধ 3 হলে সমীকরণ কী?",
        options: ["(x−1)² + (y−2)² = 9", "(x+1)² + (y+2)² = 9", "(x−1)² + (y−2)² = 3", "x² + y² = 9"],
        correctAnswer: "(x−1)² + (y−2)² = 9",
        explanation: "(x−h)² + (y−k)² = r²।",
        difficulty: "EASY",
      },
    ],
  },
  {
    topicName: "বোর পরমাণু মডেল",
    subjectName: "পদার্থবিজ্ঞান ২য় পত্র",
    questions: [
      {
        text: "বোর মডেল অনুযায়ী ইলেকট্রন কক্ষপথে থাকলে কী হয়?",
        options: ["শক্তি বিকিরণ করে না", "শক্তি বিকিরণ করে", "ভর হারায়", "আধান হারায়"],
        correctAnswer: "শক্তি বিকিরণ করে না",
        explanation: "স্থির কক্ষপথে ইলেকট্রন শক্তি বিকিরণ করে না — বোরের মূল স্বীকার্য।",
        difficulty: "MEDIUM",
      },
      {
        text: "হাইড্রোজেন পরমাণুর ভূমিস্তরের শক্তি কত?",
        options: ["−13.6 eV", "+13.6 eV", "0 eV", "−3.4 eV"],
        correctAnswer: "−13.6 eV",
        explanation: "n=1 এ E = −13.6 eV; ঋণাত্মক মানে বদ্ধ অবস্থা।",
        difficulty: "MEDIUM",
      },
      {
        text: "বোর মডেলে কৌণিক ভরবেগ কীসের গুণিতক?",
        options: ["h/2π", "h", "2πh", "h²"],
        correctAnswer: "h/2π",
        explanation: "mvr = nh/2π — কোয়ান্টায়ন শর্ত।",
        difficulty: "HARD",
      },
    ],
  },
  {
    topicName: "ভেক্টরের যোগ ও বিয়োগ",
    subjectName: "পদার্থবিজ্ঞান ১ম পত্র",
    questions: [
      {
        text: "দুটি সমান মানের ভেক্টর বিপরীত দিকে হলে লব্ধি কত?",
        options: ["শূন্য", "দ্বিগুণ", "সমান", "অর্ধেক"],
        correctAnswer: "শূন্য",
        explanation: "সমান মান ও বিপরীত দিকে হলে লব্ধি শূন্য।",
        difficulty: "EASY",
      },
      {
        text: "দুটি লম্ব ভেক্টর 3 ও 4 একক হলে লব্ধি কত?",
        options: ["5 একক", "7 একক", "1 একক", "12 একক"],
        correctAnswer: "5 একক",
        explanation: "R = √(3²+4²) = 5।",
        difficulty: "EASY",
      },
      {
        text: "ভেক্টর যোগে কোন সূত্র ব্যবহৃত হয়?",
        options: ["সামান্তরিক সূত্র", "ওহমের সূত্র", "কুলম্বের সূত্র", "বয়েলের সূত্র"],
        correctAnswer: "সামান্তরিক সূত্র",
        explanation: "দুটি ভেক্টরের লব্ধি সামান্তরিকের কর্ণ দিয়ে পাওয়া যায়।",
        difficulty: "MEDIUM",
      },
    ],
  },
  {
    topicName: "মেন্ডেলের সূত্র",
    subjectName: "জীববিজ্ঞান ২য় পত্র",
    questions: [
      {
        text: "মেন্ডেলের প্রথম সূত্রের নাম কী?",
        options: ["পৃথকীকরণ সূত্র", "স্বাধীন বিন্যাস সূত্র", "প্রকটতার সূত্র", "সংযোগ সূত্র"],
        correctAnswer: "পৃথকীকরণ সূত্র",
        explanation: "গ্যামেট গঠনের সময় অ্যালিল জোড়া পৃথক হয়।",
        difficulty: "MEDIUM",
      },
      {
        text: "একসংকর জননে F₂ প্রজন্মে ফিনোটাইপ অনুপাত কত?",
        options: ["3:1", "1:1", "9:3:3:1", "1:2:1"],
        correctAnswer: "3:1",
        explanation: "একসংকর ক্রসে F₂ তে প্রকট:প্রচ্ছন্ন = 3:1।",
        difficulty: "MEDIUM",
      },
      {
        text: "দ্বিসংকর জননে F₂ তে অনুপাত কত?",
        options: ["9:3:3:1", "3:1", "1:1", "1:2:1"],
        correctAnswer: "9:3:3:1",
        explanation: "স্বাধীন বিন্যাস সূত্রের ফল।",
        difficulty: "MEDIUM",
      },
    ],
  },
  {
    topicName: "রক্তের উপাদান",
    subjectName: "জীববিজ্ঞান ২য় পত্র",
    questions: [
      {
        text: "রক্তের তরল অংশকে কী বলে?",
        options: ["প্লাজমা", "সিরাম", "লিম্ফ", "হিমোগ্লোবিন"],
        correctAnswer: "প্লাজমা",
        explanation: "রক্তের প্রায় ৫৫% প্লাজমা।",
        difficulty: "EASY",
      },
      {
        text: "রক্ত জমাট বাঁধতে সাহায্য করে কোন উপাদান?",
        options: ["অণুচক্রিকা", "লোহিত কণিকা", "শ্বেত কণিকা", "প্লাজমা"],
        correctAnswer: "অণুচক্রিকা",
        explanation: "থ্রম্বোসাইট বা অণুচক্রিকা রক্ত তঞ্চনে ভূমিকা রাখে।",
        difficulty: "EASY",
      },
      {
        text: "সংক্রমণ প্রতিরোধে কোন কণিকা কাজ করে?",
        options: ["শ্বেত রক্তকণিকা", "লোহিত রক্তকণিকা", "অণুচক্রিকা", "প্লাজমা"],
        correctAnswer: "শ্বেত রক্তকণিকা",
        explanation: "WBC দেহের রোগ প্রতিরোধ ব্যবস্থার প্রধান অংশ।",
        difficulty: "EASY",
      },
    ],
  },
  {
    topicName: "রাসায়নিক পরিবর্তন",
    subjectName: "রসায়ন ১ম পত্র",
    questions: [
      {
        text: "কোনটি রাসায়নিক পরিবর্তন?",
        options: ["লোহায় মরিচা পড়া", "বরফ গলা", "পানি ফোটা", "চিনি দ্রবীভূত হওয়া"],
        correctAnswer: "লোহায় মরিচা পড়া",
        explanation: "মরিচায় নতুন যৌগ (আয়রন অক্সাইড) তৈরি হয়।",
        difficulty: "EASY",
      },
      {
        text: "রাসায়নিক পরিবর্তনের বৈশিষ্ট্য কোনটি?",
        options: ["নতুন পদার্থ তৈরি হয়", "শুধু অবস্থা বদলায়", "সহজে ফিরে যায়", "ভর বাড়ে"],
        correctAnswer: "নতুন পদার্থ তৈরি হয়",
        explanation: "রাসায়নিক পরিবর্তন সাধারণত অপরিবর্তনীয় ও নতুন যৌগ দেয়।",
        difficulty: "EASY",
      },
      {
        text: "ভরের নিত্যতা সূত্র অনুযায়ী বিক্রিয়ায় মোট ভর কেমন থাকে?",
        options: ["অপরিবর্তিত", "বাড়ে", "কমে", "শূন্য হয়"],
        correctAnswer: "অপরিবর্তিত",
        explanation: "বিক্রিয়ক ও উৎপাদের মোট ভর সমান থাকে।",
        difficulty: "MEDIUM",
      },
    ],
  },
  {
    topicName: "লেন্স ও দর্পণ",
    subjectName: "পদার্থবিজ্ঞান ২য় পত্র",
    questions: [
      {
        text: "উত্তল লেন্সের ফোকাস দূরত্ব কেমন ধরা হয়?",
        options: ["ধনাত্মক", "ঋণাত্মক", "শূন্য", "অসীম"],
        correctAnswer: "ধনাত্মক",
        explanation: "চিহ্ন রীতিতে অভিসারী (উত্তল) লেন্সের f ধনাত্মক।",
        difficulty: "MEDIUM",
      },
      {
        text: "সমতল দর্পণে গঠিত প্রতিবিম্ব কেমন?",
        options: ["অবাস্তব ও সোজা", "বাস্তব ও উল্টো", "বাস্তব ও সোজা", "অবাস্তব ও উল্টো"],
        correctAnswer: "অবাস্তব ও সোজা",
        explanation: "সমতল দর্পণে সর্বদা সমান আকারের অবাস্তব সোজা প্রতিবিম্ব হয়।",
        difficulty: "EASY",
      },
      {
        text: "লেন্সের সমীকরণ কোনটি?",
        options: ["1/f = 1/v − 1/u", "1/f = 1/v + 1/u", "f = v + u", "f = uv"],
        correctAnswer: "1/f = 1/v − 1/u",
        explanation: "লেন্সের ক্ষেত্রে চিহ্ন রীতি অনুযায়ী এই সমীকরণ প্রযোজ্য।",
        difficulty: "MEDIUM",
      },
    ],
  },
  {
    topicName: "শব্দ তরঙ্গ",
    subjectName: "পদার্থবিজ্ঞান ১ম পত্র",
    questions: [
      {
        text: "শব্দের বেগ কোন মাধ্যমে সবচেয়ে বেশি?",
        options: ["কঠিন", "তরল", "বায়বীয়", "শূন্যস্থান"],
        correctAnswer: "কঠিন",
        explanation: "কঠিনে কণাগুলো ঘন সন্নিবিষ্ট বলে কম্পন দ্রুত ছড়ায়।",
        difficulty: "EASY",
      },
      {
        text: "শব্দ শূন্যস্থানে চলতে পারে না কেন?",
        options: ["মাধ্যম প্রয়োজন", "আলো নেই", "তাপ নেই", "চাপ বেশি"],
        correctAnswer: "মাধ্যম প্রয়োজন",
        explanation: "শব্দ যান্ত্রিক তরঙ্গ, সঞ্চালনে বস্তুকণা লাগে।",
        difficulty: "EASY",
      },
      {
        text: "শ্রাব্যতার সীমা কত?",
        options: ["20 Hz – 20 kHz", "0 – 100 Hz", "1 – 10 Hz", "20 kHz – 200 kHz"],
        correctAnswer: "20 Hz – 20 kHz",
        explanation: "স্বাভাবিক মানুষের কান এই পাল্লার শব্দ শুনতে পায়।",
        difficulty: "MEDIUM",
      },
    ],
  },
  {
    topicName: "শ্বসন",
    subjectName: "জীববিজ্ঞান ১ম পত্র",
    questions: [
      {
        text: "সবাত শ্বসনে এক অণু গ্লুকোজ থেকে কত ATP পাওয়া যায়?",
        options: ["প্রায় ৩৮টি", "২টি", "৪টি", "১০০টি"],
        correctAnswer: "প্রায় ৩৮টি",
        explanation: "তাত্ত্বিকভাবে ৩৬-৩৮ ATP (কোষভেদে ভিন্ন)।",
        difficulty: "HARD",
      },
      {
        text: "গ্লাইকোলাইসিস কোথায় ঘটে?",
        options: ["সাইটোপ্লাজমে", "মাইটোকন্ড্রিয়ায়", "নিউক্লিয়াসে", "রাইবোজোমে"],
        correctAnswer: "সাইটোপ্লাজমে",
        explanation: "গ্লাইকোলাইসিস কোষরসে (সাইটোপ্লাজম) সম্পন্ন হয়।",
        difficulty: "MEDIUM",
      },
      {
        text: "অবাত শ্বসনে পেশিতে কী জমা হয়?",
        options: ["ল্যাকটিক এসিড", "ইথানল", "CO₂", "গ্লুকোজ"],
        correctAnswer: "ল্যাকটিক এসিড",
        explanation: "অক্সিজেনের অভাবে পেশিকোষে ল্যাকটিক এসিড জমে ক্লান্তি আসে।",
        difficulty: "MEDIUM",
      },
    ],
  },
  {
    topicName: "সমাবেশ",
    subjectName: "উচ্চতর গণিত ১ম পত্র",
    questions: [
      {
        text: "৬টি বস্তু থেকে ২টি বাছাইয়ের উপায় কত?",
        options: ["15", "30", "12", "36"],
        correctAnswer: "15",
        explanation:
          "সমাবেশে ক্রম গুরুত্বপূর্ণ নয় (কে আগে বাছাই হলো তা বিবেচ্য নয়), তাই সমাবেশ সূত্র প্রযোজ্য: C(n,r) = n! / [r!(n−r)!]। এখানে n = 6, r = 2, তাই C(6,2) = (6×5)/(2×1) = 15। লক্ষ করো — বিন্যাস হলে P(6,2) = 30 হতো, অর্থাৎ সমাবেশের ঠিক দ্বিগুণ।",
        difficulty: "EASY",
      },
      {
        text: "C(n,0) এর মান কত?",
        options: ["1", "0", "n", "n!"],
        correctAnswer: "1",
        explanation: "কিছুই না বাছাইয়ের একটিই উপায়।",
        difficulty: "EASY",
      },
      {
        text: "C(n,r) = C(n, n−r) — এটি কী নির্দেশ করে?",
        options: ["সমাবেশের প্রতিসাম্য ধর্ম", "বিন্যাস সূত্র", "দ্বিপদী উপপাদ্য", "ভাগশেষ উপপাদ্য"],
        correctAnswer: "সমাবেশের প্রতিসাম্য ধর্ম",
        explanation: "r টি বাছাই = (n−r) টি বাদ দেওয়া।",
        difficulty: "MEDIUM",
      },
    ],
  },
  {
    topicName: "সরলরেখার সমীকরণ",
    subjectName: "উচ্চতর গণিত ১ম পত্র",
    questions: [
      {
        text: "দুটি সমান্তরাল রেখার ঢাল সম্পর্ক কী?",
        options: ["m₁ = m₂", "m₁m₂ = −1", "m₁ + m₂ = 0", "m₁ = 1/m₂"],
        correctAnswer: "m₁ = m₂",
        explanation: "সমান্তরাল রেখার ঢাল সমান।",
        difficulty: "EASY",
      },
      {
        text: "দুটি লম্ব রেখার ঢালের গুণফল কত?",
        options: ["−1", "1", "0", "অসীম"],
        correctAnswer: "−1",
        explanation: "m₁·m₂ = −1 হলে রেখা দুটি পরস্পর লম্ব।",
        difficulty: "MEDIUM",
      },
      {
        text: "(x₁,y₁) ও (x₂,y₂) বিন্দুগামী রেখার ঢাল কত?",
        options: ["(y₂−y₁)/(x₂−x₁)", "(x₂−x₁)/(y₂−y₁)", "(y₂+y₁)/(x₂+x₁)", "x₂y₂ − x₁y₁"],
        correctAnswer: "(y₂−y₁)/(x₂−x₁)",
        explanation: "ঢাল = উল্লম্ব পরিবর্তন / অনুভূমিক পরিবর্তন।",
        difficulty: "EASY",
      },
    ],
  },
  {
    topicName: "স্থিতিস্থাপকতা",
    subjectName: "পদার্থবিজ্ঞান ১ম পত্র",
    questions: [
      {
        text: "হুকের সূত্র অনুযায়ী পীড়ন ও বিকৃতির সম্পর্ক কী?",
        options: ["পীড়ন ∝ বিকৃতি", "পীড়ন ∝ 1/বিকৃতি", "পীড়ন = বিকৃতি²", "সম্পর্কহীন"],
        correctAnswer: "পীড়ন ∝ বিকৃতি",
        explanation: "স্থিতিস্থাপক সীমার মধ্যে পীড়ন বিকৃতির সমানুপাতিক।",
        difficulty: "EASY",
      },
      {
        text: "ইয়ং এর গুণাঙ্ক কীসের অনুপাত?",
        options: ["দৈর্ঘ্য পীড়ন ও দৈর্ঘ্য বিকৃতির", "আয়তন পীড়ন ও বিকৃতির", "কৃন্তন পীড়ন ও বিকৃতির", "চাপ ও আয়তনের"],
        correctAnswer: "দৈর্ঘ্য পীড়ন ও দৈর্ঘ্য বিকৃতির",
        explanation: "Y = অনুদৈর্ঘ্য পীড়ন / অনুদৈর্ঘ্য বিকৃতি।",
        difficulty: "MEDIUM",
      },
      {
        text: "বিকৃতির একক কী?",
        options: ["একক নেই", "মিটার", "নিউটন", "প্যাসকেল"],
        correctAnswer: "একক নেই",
        explanation: "বিকৃতি দুটি দৈর্ঘ্যের অনুপাত, তাই মাত্রাহীন।",
        difficulty: "MEDIUM",
      },
    ],
  },
  {
    topicName: "স্নায়ুতন্ত্র",
    subjectName: "জীববিজ্ঞান ২য় পত্র",
    questions: [
      {
        text: "স্নায়ুতন্ত্রের গাঠনিক একক কী?",
        options: ["নিউরন", "নেফ্রন", "অ্যালভিওলাস", "ভিলাই"],
        correctAnswer: "নিউরন",
        explanation: "নিউরন স্নায়ুতন্ত্রের গঠন ও কার্যের একক।",
        difficulty: "EASY",
      },
      {
        text: "দুটি নিউরনের সংযোগস্থলকে কী বলে?",
        options: ["সাইন্যাপস", "অ্যাক্সন", "ডেনড্রাইট", "মায়েলিন"],
        correctAnswer: "সাইন্যাপস",
        explanation: "সাইন্যাপসে নিউরোট্রান্সমিটারের মাধ্যমে সংকেত যায়।",
        difficulty: "MEDIUM",
      },
      {
        text: "মানুষের কেন্দ্রীয় স্নায়ুতন্ত্র কী নিয়ে গঠিত?",
        options: ["মস্তিষ্ক ও সুষুম্নাকাণ্ড", "শুধু মস্তিষ্ক", "স্নায়ু ও পেশি", "হৃৎপিণ্ড ও মস্তিষ্ক"],
        correctAnswer: "মস্তিষ্ক ও সুষুম্নাকাণ্ড",
        explanation: "CNS = মস্তিষ্ক + সুষুম্নাকাণ্ড।",
        difficulty: "EASY",
      },
    ],
  },
  {
    topicName: "হৃৎপিণ্ড ও রক্তসংবহন",
    subjectName: "জীববিজ্ঞান ২য় পত্র",
    questions: [
      {
        text: "মানুষের হৃৎপিণ্ডে কয়টি প্রকোষ্ঠ আছে?",
        options: ["৪টি", "২টি", "৩টি", "৫টি"],
        correctAnswer: "৪টি",
        explanation: "দুটি অলিন্দ ও দুটি নিলয়।",
        difficulty: "EASY",
      },
      {
        text: "অক্সিজেনবিহীন রক্ত ফুসফুসে নিয়ে যায় কোন রক্তনালি?",
        options: ["পালমোনারি ধমনী", "পালমোনারি শিরা", "অ্যাওর্টা", "ভেনা কাভা"],
        correctAnswer: "পালমোনারি ধমনী",
        explanation: "এটিই একমাত্র ধমনী যা অক্সিজেনবিহীন রক্ত বহন করে।",
        difficulty: "MEDIUM",
      },
      {
        text: "হৃৎপিণ্ডের স্বাভাবিক স্পন্দন হার প্রতি মিনিটে কত?",
        options: ["৭২ বার", "১২০ বার", "৪০ বার", "২০০ বার"],
        correctAnswer: "৭২ বার",
        explanation: "প্রাপ্তবয়স্কে বিশ্রামকালীন গড় হার ৭২ bpm।",
        difficulty: "EASY",
      },
    ],
  },
];

async function main() {
  console.log("🌱 isImportant টপিকের MCQ কভারেজ পূরণ শুরু...");

  let added = 0;
  let skipped = 0;
  const notFound: string[] = [];

  for (const entry of seedData) {
    const topic = await prisma.topic.findFirst({
      where: {
        name: entry.topicName,
        chapter: { subject: { name: entry.subjectName } },
      },
    });

    if (!topic) {
      notFound.push(`${entry.topicName} (${entry.subjectName})`);
      continue;
    }

    // ⚠️ deleteMany করা হচ্ছে না — বিদ্যমান প্রশ্ন অক্ষত রাখতে।
    // শুধু text মিলিয়ে নতুনগুলো যোগ করা হচ্ছে।
    const existing = await prisma.question.findMany({
      where: { topicId: topic.id },
      select: { text: true },
    });
    const existingTexts = new Set(existing.map((q) => q.text.trim()));

    const fresh = entry.questions.filter((q) => !existingTexts.has(q.text.trim()));
    skipped += entry.questions.length - fresh.length;

    if (fresh.length === 0) {
      console.log(`⏭️  ${entry.topicName} — সব প্রশ্ন আগে থেকেই আছে`);
      continue;
    }

    await prisma.question.createMany({
      data: fresh.map((q) => ({
        topicId: topic.id,
        type: "MCQ" as const,
        text: q.text,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        difficulty: q.difficulty,
      })),
    });

    added += fresh.length;
    console.log(
      `✅ ${entry.topicName} (${entry.subjectName}) — ${fresh.length}টা যোগ, মোট ${existing.length + fresh.length}টা`
    );
  }

  if (notFound.length > 0) {
    console.log(`\n⚠️  পাওয়া যায়নি: ${notFound.join(", ")}`);
  }

  console.log(`\n🎉 মোট ${added}টা নতুন MCQ যোগ করা হয়েছে` + (skipped ? ` (${skipped}টা আগে থেকেই ছিল)` : ""));

  // isImportant টপিকের সামগ্রিক কভারেজ
  const impTopics = await prisma.topic.findMany({
    where: { isImportant: true },
    select: { id: true, name: true, _count: { select: { questions: true } } },
  });
  const zero = impTopics.filter((t) => t._count.questions === 0);
  const thin = impTopics.filter((t) => t._count.questions > 0 && t._count.questions < 3);
  console.log(`\n📊 isImportant টপিক: ${impTopics.length}`);
  console.log(`   MCQ নেই        : ${zero.length}`);
  console.log(`   ৩টার কম MCQ    : ${thin.length}`);
  if (zero.length) console.log(`   → ${zero.map((t) => t.name).join(", ")}`);
}

main()
  .catch((e) => {
    console.error("❌ Seed ব্যর্থ:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
