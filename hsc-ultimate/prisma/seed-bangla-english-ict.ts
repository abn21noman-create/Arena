// ===================================================================
// Bangla, English, ICT Question Bank Seed Script
// -------------------------------------------------------------------
// আগের অডিটে চিহ্নিত সবচেয়ে বড় কনটেন্ট গ্যাপ: Bangla/English/ICT
// বিষয়ে কোনো MCQ প্রশ্ন ছিল না (শুধু Physics/Chemistry/Biology/Higher
// Math এ ছিল)। এই স্ক্রিপ্ট Deep Research (web_search) দিয়ে যাচাই করা
// বাস্তব HSC সিলেবাস কনটেন্ট (গল্প/কবিতা/ব্যাকরণ/ICT টপিক) থেকে MCQ
// প্রশ্ন তৈরি করে।
//
// তথ্যসূত্র (web_search দিয়ে verify করা, ২০২৬ জুলাই):
// - "আমার পথ" — কাজী নজরুল ইসলাম (প্রবন্ধ, ধূমকেতু পত্রিকার উদ্বোধনী বাণী)
// - "অপরিচিতা" — রবীন্দ্রনাথ ঠাকুর (গল্প, সবুজপত্র পত্রিকা ১৩২১ বঙ্গাব্দ
//   প্রথম প্রকাশ, চরিত্র: অনুপম/কল্যাণী/শম্ভুনাথ/মামা/বিনু/হরিশ)
// - "সোনার তরী" — রবীন্দ্রনাথ ঠাকুর (কবিতা, সোনার তরী কাব্যগ্রন্থ থেকে)
// - "আঠারো বছর বয়স" — সুকান্ত ভট্টাচার্য (কবিতা, ছাড়পত্র কাব্যগ্রন্থ
//   ১৯৪৮, ৮টি স্তবক, প্রতি স্তবকে ৪টি পঙক্তি, মোট ৩২ চরণ)
// - সমাস: ৬ প্রকার (দ্বন্দ্ব, দ্বিগু, কর্মধারয়, তৎপুরুষ, বহুব্রীহি,
//   অব্যয়ীভাব) — পূর্বপদের প্রাধান্য অব্যয়ীভাবে, পরপদের প্রাধান্য
//   কর্মধারয়+তৎপুরুষে, উভয়পদের প্রাধান্য দ্বন্দ্বে, কোনো পদের প্রাধান্য
//   নেই বহুব্রীহিতে
// - সংখ্যা পদ্ধতি: বাইনারি(base 2)/অক্টাল(base 8)/ডেসিমেল(base 10)/
//   হেক্সাডেসিমেল(base 16), অক্টাল↔বাইনারি রূপান্তরে ৩-বিট গ্রুপ,
//   হেক্সাডেসিমেল↔বাইনারি রূপান্তরে ৪-বিট গ্রুপ
//
// রান করার নিয়ম: pnpm exec tsx prisma/seed-bangla-english-ict.ts
// idempotent — বার বার চালালে আগের প্রশ্ন মুছে নতুন করে বসাবে।
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

// টপিকের নাম দিয়ে ম্যাচ করে প্রশ্ন বসানো হবে (seed-questions.ts এর একই প্যাটার্ন)
const questionsByTopic: Record<string, QuestionSeed[]> = {
  // ================= বাংলা ১ম পত্র: গদ্য =================
  "আমার পথ": [
    {
      text: "'আমার পথ' প্রবন্ধটি কার লেখা?",
      options: ["রবীন্দ্রনাথ ঠাকুর", "কাজী নজরুল ইসলাম", "শরৎচন্দ্র চট্টোপাধ্যায়", "বঙ্কিমচন্দ্র চট্টোপাধ্যায়"],
      correctAnswer: "কাজী নজরুল ইসলাম",
      explanation: "'আমার পথ' প্রবন্ধটি কাজী নজরুল ইসলামের লেখা, যা তাঁর সম্পাদিত 'ধূমকেতু' পত্রিকার উদ্বোধনী বাণী হিসেবে প্রকাশিত হয়েছিল।",
      difficulty: "EASY",
    },
    {
      text: "'আমার পথ' প্রবন্ধের মূল বিষয়বস্তু কী?",
      options: ["দেশপ্রেম", "সত্যের স্বরূপ ও আত্মনির্ভরতা", "প্রকৃতি প্রেম", "বিরহ বেদনা"],
      correctAnswer: "সত্যের স্বরূপ ও আত্মনির্ভরতা",
      explanation: "প্রবন্ধে নজরুল ইসলাম নিজের সত্যবোধকে পথপ্রদর্শক হিসেবে গ্রহণ করার এবং ভণ্ডামি-মিথ্যা বর্জন করে আত্মনির্ভরতার আহ্বান জানিয়েছেন।",
      difficulty: "MEDIUM",
    },
    {
      text: "নজরুলের মতে, কে মিথ্যাকে ভয় পায়?",
      options: ["যার মনে সাহস নেই", "যার মনে মিথ্যা আছে", "যে দরিদ্র", "যে অশিক্ষিত"],
      correctAnswer: "যার মনে মিথ্যা আছে",
      explanation: "প্রবন্ধে বলা হয়েছে, 'যার মনে মিথ্যা সে-ই বাইরের মিথ্যাকে ভয় পায়' — অর্থাৎ যার অন্তরে সততা নেই সে-ই ভয়ে থাকে।",
      difficulty: "MEDIUM",
    },
    {
      text: "'আমার পথ' প্রবন্ধ অনুযায়ী, লেখকের কর্ণধার কে?",
      options: ["তাঁর গুরু", "তিনি নিজে", "তাঁর দেশ", "তাঁর ধর্ম"],
      correctAnswer: "তিনি নিজে",
      explanation: "লেখক বলেছেন 'আমার কর্ণধার আমি। আমায় পথ দেখাবে আমার সত্য' — অর্থাৎ তিনি নিজের সত্যবোধকেই পথপ্রদর্শক মনে করেন, কারো ওপর নির্ভরশীল নন।",
      difficulty: "EASY",
    },
    {
      text: "প্রবন্ধে নজরুল কোন বিষয়ে দাসত্বকে সবচেয়ে বড় বলেছেন?",
      options: ["রাজনৈতিক দাসত্ব", "পরাবলম্বন (অন্যের উপর নির্ভরতা)", "অর্থনৈতিক দাসত্ব", "সামাজিক দাসত্ব"],
      correctAnswer: "পরাবলম্বন (অন্যের উপর নির্ভরতা)",
      explanation: "নজরুল মনে করেন 'পরাবলম্বনই আমাদের সবচেয়ে বড় দাসত্ব' — অন্যের উপর নির্ভরতা মানুষকে মানসিকভাবে পরাধীন করে তোলে।",
      difficulty: "HARD",
    },
  ],

  "অপরিচিতা": [
    {
      text: "'অপরিচিতা' গল্পের রচয়িতা কে?",
      options: ["কাজী নজরুল ইসলাম", "রবীন্দ্রনাথ ঠাকুর", "শরৎচন্দ্র চট্টোপাধ্যায়", "মানিক বন্দ্যোপাধ্যায়"],
      correctAnswer: "রবীন্দ্রনাথ ঠাকুর",
      explanation: "'অপরিচিতা' গল্পটি রবীন্দ্রনাথ ঠাকুরের লেখা, যা প্রথম প্রকাশিত হয় প্রমথ চৌধুরী সম্পাদিত 'সবুজপত্র' পত্রিকায় (১৩২১ বঙ্গাব্দ)।",
      difficulty: "EASY",
    },
    {
      text: "'অপরিচিতা' গল্পের কথক তথা কেন্দ্রীয় চরিত্রের নাম কী?",
      options: ["হরিশ", "বিনু", "অনুপম", "শম্ভুনাথ"],
      correctAnswer: "অনুপম",
      explanation: "গল্পের কথক ও কেন্দ্রীয় চরিত্র অনুপম, যে ব্যক্তিত্বহীন ও মামার উপর নির্ভরশীল এক যুবক হিসেবে চিত্রিত।",
      difficulty: "EASY",
    },
    {
      text: "অনুপমের বিয়ে ভাঙার প্রধান কারণ কী ছিল?",
      options: [
        "কল্যাণীর অসম্মতি",
        "মামার যৌতুকের গহনা যাচাই করানো",
        "শম্ভুনাথের আর্থিক অসচ্ছলতা",
        "অনুপমের অসম্মতি",
      ],
      correctAnswer: "মামার যৌতুকের গহনা যাচাই করানো",
      explanation: "বিয়ের দিন মামা কন্যাপক্ষের দেওয়া গহনা সেকরা দিয়ে যাচাই করাতে চাইলে শম্ভুনাথবাবু অপমানিত বোধ করে বিয়ে ভেঙে দেন।",
      difficulty: "MEDIUM",
    },
    {
      text: "কল্যাণী পরবর্তীতে জীবনে কোন ব্রত গ্রহণ করে?",
      options: ["সমাজসেবা", "মেয়েদের শিক্ষার ব্রত", "চিকিৎসাসেবা", "ধর্মপ্রচার"],
      correctAnswer: "মেয়েদের শিক্ষার ব্রত",
      explanation: "বিয়ে ভাঙার পর কল্যাণী আত্মমর্যাদাবোধ থেকে বিয়ে না করার সিদ্ধান্ত নিয়ে মেয়েদের শিক্ষার ব্রত গ্রহণ করে।",
      difficulty: "MEDIUM",
    },
    {
      text: "'অপরিচিতা' গল্পে ব্যক্তিত্বের দৃঢ়তার উৎকৃষ্ট উদাহরণ কোন চরিত্র?",
      options: ["অনুপম", "হরিশ", "শম্ভুনাথ", "মামা"],
      correctAnswer: "শম্ভুনাথ",
      explanation: "শম্ভুনাথ আত্মমর্যাদাবোধসম্পন্ন চরিত্র — অপমান সহ্য না করে মেয়ের বিয়ে ভেঙে দিয়ে ব্যক্তিত্বের দৃঢ়তা দেখিয়েছেন।",
      difficulty: "HARD",
    },
  ],

  // ================= বাংলা ১ম পত্র: কবিতা =================
  "সোনার তরী": [
    {
      text: "'সোনার তরী' কবিতাটি কার রচনা?",
      options: ["কাজী নজরুল ইসলাম", "রবীন্দ্রনাথ ঠাকুর", "জীবনানন্দ দাশ", "সুকান্ত ভট্টাচার্য"],
      correctAnswer: "রবীন্দ্রনাথ ঠাকুর",
      explanation: "'সোনার তরী' কবিতাটি রবীন্দ্রনাথ ঠাকুরের 'সোনার তরী' কাব্যগ্রন্থের নামকরণকারী বিখ্যাত কবিতা।",
      difficulty: "EASY",
    },
    {
      text: "'সোনার তরী' কবিতায় 'সোনার তরী' প্রতীকীভাবে কী বোঝায়?",
      options: ["একটি প্রকৃত নৌকা", "মহাকাল", "কৃষকের সম্পদ", "নদীর স্রোত"],
      correctAnswer: "মহাকাল",
      explanation: "কবিতায় সোনার তরী প্রতীকীভাবে মহাকালকে বোঝায় — মানুষের মহৎ সৃষ্টিকর্ম মহাকালে ঠাঁই পায়, কিন্তু ব্যক্তি মানুষের সেখানে স্থান হয় না।",
      difficulty: "HARD",
    },
    {
      text: "কবিতায় মাঝি কৃষকের ধান নিলেও কাকে তরীতে তোলেনি?",
      options: ["কৃষকের পরিবার", "কৃষক নিজেকে", "কৃষকের গরু", "কৃষকের প্রতিবেশী"],
      correctAnswer: "কৃষক নিজেকে",
      explanation: "মাঝি কৃষকের সোনার ধান (ফসল/সৃষ্টিকর্ম) তরীতে তুলে নিলেও কৃষককে (ব্যক্তি মানুষকে) তরীতে জায়গা দেয়নি — এটাই কবিতার মূল ভাবের প্রতীক।",
      difficulty: "MEDIUM",
    },
    {
      text: "'সোনার তরী' কবিতায় ঋতু হিসেবে কোনটি বর্ণিত হয়েছে?",
      options: ["গ্রীষ্মকাল", "বর্ষাকাল", "শীতকাল", "বসন্তকাল"],
      correctAnswer: "বর্ষাকাল",
      explanation: "কবিতায় বর্ষাকালের পটভূমি বর্ণিত — চারিদিকে বাঁকা জল, শ্রাবণগগন ঘিরে ঘন মেঘের বর্ণনা আছে।",
      difficulty: "EASY",
    },
  ],

  "আঠারো বছর বয়স": [
    {
      text: "'আঠারো বছর বয়স' কবিতাটি কোন কবির রচনা?",
      options: ["কাজী নজরুল ইসলাম", "রবীন্দ্রনাথ ঠাকুর", "সুকান্ত ভট্টাচার্য", "জসীমউদ্দীন"],
      correctAnswer: "সুকান্ত ভট্টাচার্য",
      explanation: "'আঠারো বছর বয়স' কবিতাটি কিশোর কবি সুকান্ত ভট্টাচার্যের রচনা, যা তাঁর 'ছাড়পত্র' (১৯৪৮) কাব্যগ্রন্থ থেকে সংকলিত।",
      difficulty: "EASY",
    },
    {
      text: "'আঠারো বছর বয়স' কবিতাটি কোন কাব্যগ্রন্থ থেকে সংকলিত?",
      options: ["ছাড়পত্র", "ঘুম নেই", "পূর্বাভাস", "অভিযান"],
      correctAnswer: "ছাড়পত্র",
      explanation: "কবিতাটি সুকান্ত ভট্টাচার্যের প্রথম কাব্যগ্রন্থ 'ছাড়পত্র' (১৯৪৮) থেকে সংকলিত।",
      difficulty: "MEDIUM",
    },
    {
      text: "কবিতা অনুযায়ী আঠারো বছর বয়সের বৈশিষ্ট্য কোনটি?",
      options: ["ভীরুতা ও দুর্বলতা", "দুঃসাহস ও আত্মপ্রত্যয়", "নিষ্ক্রিয়তা", "হতাশা"],
      correctAnswer: "দুঃসাহস ও আত্মপ্রত্যয়",
      explanation: "কবি বলেছেন 'আঠারো বছর বয়স জানে না কাঁদা' — এই বয়স দুঃসাহস, আত্মপ্রত্যয় ও আত্মনির্ভরশীলতার প্রতীক।",
      difficulty: "MEDIUM",
    },
    {
      text: "'আঠারো বছর বয়স' কবিতাটি কয়টি স্তবকে বিভক্ত?",
      options: ["৬টি", "৭টি", "৮টি", "৯টি"],
      correctAnswer: "৮টি",
      explanation: "কবিতাটি ৮টি স্তবকে বিভক্ত, প্রতি স্তবকে ৪টি করে পঙক্তি রয়েছে (মোট ৩২ চরণ)।",
      difficulty: "HARD",
    },
  ],

  // ================= বাংলা ২য় পত্র: ব্যাকরণ =================
  "সমাস": [
    {
      text: "যে সমাসে উভয় পদের অর্থের প্রাধান্য থাকে তাকে কী সমাস বলে?",
      options: ["তৎপুরুষ", "দ্বন্দ্ব", "কর্মধারয়", "বহুব্রীহি"],
      correctAnswer: "দ্বন্দ্ব",
      explanation: "দ্বন্দ্ব সমাসে সমস্যমান উভয় পদের অর্থের সমান প্রাধান্য থাকে, যেমন: 'মা-বাবা' (মা ও বাবা)।",
      difficulty: "MEDIUM",
    },
    {
      text: "যে সমাসে কোনো পদের অর্থের প্রাধান্য না থেকে সম্পূর্ণ ভিন্ন অর্থ প্রকাশ পায় তাকে কী সমাস বলে?",
      options: ["দ্বন্দ্ব", "কর্মধারয়", "বহুব্রীহি", "অব্যয়ীভাব"],
      correctAnswer: "বহুব্রীহি",
      explanation: "বহুব্রীহি সমাসে সমস্যমান পদগুলোর অর্থ প্রাধান্য না পেয়ে একটি তৃতীয় (ইঙ্গিতিত) অর্থ প্রকাশ পায়, যেমন: 'বহুব্রীহি' (বহু ব্রীহি যার)।",
      difficulty: "MEDIUM",
    },
    {
      text: "কোন সমাসে পূর্বপদের অর্থের প্রাধান্য থাকে?",
      options: ["তৎপুরুষ", "কর্মধারয়", "অব্যয়ীভাব", "দ্বন্দ্ব"],
      correctAnswer: "অব্যয়ীভাব",
      explanation: "অব্যয়ীভাব সমাসে পূর্বপদের (সাধারণত অব্যয় পদের) অর্থের প্রাধান্য থাকে, যেমন: 'আজীবন' (জীবন ব্যাপিয়া)।",
      difficulty: "MEDIUM",
    },
    {
      text: "'মধ্যপদলোপী কর্মধারয়' সমাসের উদাহরণ কোনটি?",
      options: ["মা-বাবা", "সিংহাসন", "নীলকমল", "বীণাপাণি"],
      correctAnswer: "সিংহাসন",
      explanation: "'সিংহাসন' = সিংহ চিহ্নিত আসন — মাঝের পদ লোপ পেয়ে মধ্যপদলোপী কর্মধারয় সমাস গঠিত হয়েছে।",
      difficulty: "HARD",
    },
    {
      text: "সমাস ও সন্ধির মধ্যে মূল পার্থক্য কী?",
      options: [
        "সমাসে বর্ণের মিলন, সন্ধিতে পদের মিলন",
        "সমাসে পদের মিলন, সন্ধিতে বর্ণের মিলন",
        "দুটোই একই জিনিস",
        "সমাস শুধু সংস্কৃত ভাষায় হয়",
      ],
      correctAnswer: "সমাসে পদের মিলন, সন্ধিতে বর্ণের মিলন",
      explanation: "সন্ধিতে বর্ণের সঙ্গে বর্ণের মিলন ঘটে, আর সমাসে পদের সঙ্গে পদের মিলন ঘটে (একাধিক পদ মিলে একটি নতুন পদ তৈরি হয়)।",
      difficulty: "MEDIUM",
    },
  ],

  // ================= English 1st Paper =================
  "Unseen Passage Reading": [
    {
      text: "What is the primary purpose of reading an unseen passage in the HSC exam?",
      options: [
        "To memorize the passage",
        "To test comprehension and analytical skills",
        "To test vocabulary only",
        "To write a summary only",
      ],
      correctAnswer: "To test comprehension and analytical skills",
      explanation: "Unseen passage questions are designed to assess a student's ability to understand, analyze, and interpret a text they have not read before.",
      difficulty: "EASY",
    },
    {
      text: "Which strategy is most effective when answering unseen passage questions?",
      options: [
        "Reading only the questions first",
        "Skimming the passage first, then reading questions carefully",
        "Memorizing every word",
        "Guessing answers without reading",
      ],
      correctAnswer: "Skimming the passage first, then reading questions carefully",
      explanation: "Skimming for the main idea first, then reading the questions and scanning for specific answers, is the most efficient strategy for unseen passages.",
      difficulty: "MEDIUM",
    },
    {
      text: "In a summary of an unseen passage, what should be avoided?",
      options: [
        "The main idea",
        "Personal opinions not present in the text",
        "Key supporting points",
        "A concise conclusion",
      ],
      correctAnswer: "Personal opinions not present in the text",
      explanation: "A summary should objectively reflect the content of the original passage without adding the writer's own opinions or unrelated information.",
      difficulty: "MEDIUM",
    },
  ],

  "Cloze Test": [
    {
      text: "A cloze test primarily assesses a student's —",
      options: ["Handwriting", "Vocabulary and grammatical accuracy", "Drawing skill", "Memorization of dates"],
      correctAnswer: "Vocabulary and grammatical accuracy",
      explanation: "Cloze tests require filling in blanks with appropriate words, testing vocabulary, grammar, and contextual understanding.",
      difficulty: "EASY",
    },
    {
      text: "In a 'cloze test without clues', students must —",
      options: [
        "Choose from given options",
        "Supply the missing word entirely on their own",
        "Copy from the passage",
        "Translate the sentence",
      ],
      correctAnswer: "Supply the missing word entirely on their own",
      explanation: "Unlike cloze tests with word clues/options, a cloze test without clues requires students to determine and write the appropriate word themselves based on context.",
      difficulty: "MEDIUM",
    },
    {
      text: "Which part of speech is most commonly tested in a preposition-based cloze test?",
      options: ["Nouns", "Prepositions", "Interjections", "Conjunctions only"],
      correctAnswer: "Prepositions",
      explanation: "A preposition-focused cloze test specifically tests the correct usage of prepositions (in, on, at, by, etc.) in context.",
      difficulty: "MEDIUM",
    },
  ],

  "Right Forms of Verbs": [
    {
      text: "Choose the correct sentence:",
      options: [
        "She (go) to school every day.",
        "She goes to school every day.",
        "She going to school every day.",
        "She gone to school every day.",
      ],
      correctAnswer: "She goes to school every day.",
      explanation: "For third person singular subject in the present simple tense, the verb takes 's/es' — 'goes' is the correct form.",
      difficulty: "EASY",
    },
    {
      text: "Fill in the blank: 'By the time we arrived, the movie ___ (start).'",
      options: ["has started", "had started", "starts", "will start"],
      correctAnswer: "had started",
      explanation: "Past Perfect Tense ('had + past participle') is used to describe an action completed before another past action — the movie started before 'we arrived'.",
      difficulty: "HARD",
    },
    {
      text: "Which sentence correctly uses the gerund form?",
      options: [
        "I enjoy to read books.",
        "I enjoy reading books.",
        "I enjoy read books.",
        "I enjoy reads books.",
      ],
      correctAnswer: "I enjoy reading books.",
      explanation: "The verb 'enjoy' is followed by a gerund (verb + -ing) form, not an infinitive — 'enjoy reading' is grammatically correct.",
      difficulty: "MEDIUM",
    },
    {
      text: "Choose the correct passive voice of: 'They are building a bridge.'",
      options: [
        "A bridge is built by them.",
        "A bridge is being built by them.",
        "A bridge was being built by them.",
        "A bridge has been built by them.",
      ],
      correctAnswer: "A bridge is being built by them.",
      explanation: "Present Continuous Tense in passive voice uses 'is/am/are + being + past participle' — matching the active form 'are building'.",
      difficulty: "HARD",
    },
  ],

  "Preposition": [
    {
      text: "Fill in the blank: 'She is good ___ mathematics.'",
      options: ["in", "at", "on", "with"],
      correctAnswer: "at",
      explanation: "The adjective 'good' is followed by the preposition 'at' when referring to a skill or subject: 'good at mathematics'.",
      difficulty: "EASY",
    },
    {
      text: "Choose the correct preposition: 'He divided the cake ___ four parts.'",
      options: ["in", "into", "with", "by"],
      correctAnswer: "into",
      explanation: "'Divide into' is the correct collocation used when something is separated into distinct parts or portions.",
      difficulty: "MEDIUM",
    },
    {
      text: "Fill in the blank: 'The train arrived ___ time.'",
      options: ["in", "on", "at", "by"],
      correctAnswer: "on",
      explanation: "'On time' is the idiomatic expression meaning punctual/not late, commonly used with arrival times.",
      difficulty: "MEDIUM",
    },
  ],

  // ================= English 2nd Paper =================
  "Paragraph Writing": [
    {
      text: "A good paragraph should have —",
      options: [
        "Multiple unrelated topics",
        "A single unified topic with a topic sentence",
        "No topic sentence",
        "Only questions",
      ],
      correctAnswer: "A single unified topic with a topic sentence",
      explanation: "An effective paragraph focuses on one central idea, introduced by a topic sentence, followed by supporting details and a concluding thought.",
      difficulty: "EASY",
    },
    {
      text: "What is the ideal structure of a paragraph in HSC English?",
      options: [
        "Only introduction",
        "Topic sentence, supporting sentences, concluding sentence",
        "Random sentences",
        "Only examples",
      ],
      correctAnswer: "Topic sentence, supporting sentences, concluding sentence",
      explanation: "A well-structured paragraph follows: topic sentence (main idea) → supporting sentences (details/examples) → concluding sentence (summary/closing thought).",
      difficulty: "MEDIUM",
    },
  ],

  "CV & Cover Letter": [
    {
      text: "A CV (Curriculum Vitae) primarily includes —",
      options: [
        "Only personal hobbies",
        "Educational qualifications, skills, and experience",
        "Only a photograph",
        "Random personal opinions",
      ],
      correctAnswer: "Educational qualifications, skills, and experience",
      explanation: "A CV is a structured document summarizing a person's educational background, skills, work experience, and achievements relevant to a job application.",
      difficulty: "EASY",
    },
    {
      text: "The main purpose of a cover letter is to —",
      options: [
        "Repeat the entire CV",
        "Introduce yourself and explain why you're suitable for the position",
        "List unrelated personal information",
        "Replace the CV entirely",
      ],
      correctAnswer: "Introduce yourself and explain why you're suitable for the position",
      explanation: "A cover letter complements the CV by introducing the applicant and highlighting specific qualifications relevant to the job being applied for.",
      difficulty: "MEDIUM",
    },
  ],

  "Essay Writing": [
    {
      text: "An essay typically consists of —",
      options: [
        "Only one paragraph",
        "Introduction, body paragraphs, and conclusion",
        "Only a conclusion",
        "Random unstructured text",
      ],
      correctAnswer: "Introduction, body paragraphs, and conclusion",
      explanation: "A well-organized essay has three main parts: an introduction (thesis), body paragraphs (arguments/evidence), and a conclusion (summary).",
      difficulty: "EASY",
    },
    {
      text: "What should a thesis statement do in an essay?",
      options: [
        "Summarize unrelated topics",
        "Present the main argument or purpose of the essay",
        "List random facts",
        "Ask questions only",
      ],
      correctAnswer: "Present the main argument or purpose of the essay",
      explanation: "The thesis statement, usually at the end of the introduction, clearly states the main point or argument the essay will develop.",
      difficulty: "MEDIUM",
    },
  ],

  "Letter Writing": [
    {
      text: "A formal letter should begin with —",
      options: ["Hi there!", "A proper salutation like 'Dear Sir/Madam'", "No greeting at all", "Slang expressions"],
      correctAnswer: "A proper salutation like 'Dear Sir/Madam'",
      explanation: "Formal letters require a respectful and appropriate salutation, unlike informal letters which may use casual greetings.",
      difficulty: "EASY",
    },
    {
      text: "Which of the following is an example of a formal letter?",
      options: [
        "A letter to your best friend about a vacation",
        "An application letter to a school principal",
        "A birthday message to a cousin",
        "A casual note to a sibling",
      ],
      correctAnswer: "An application letter to a school principal",
      explanation: "An application letter to an authority figure (like a principal) requires formal language and structure, unlike personal letters to friends/family.",
      difficulty: "EASY",
    },
  ],

  // ================= ICT =================
  "ICT এর ধারণা": [
    {
      text: "ICT এর পূর্ণরূপ কী?",
      options: [
        "Information and Communication Technology",
        "Internal Computer Technology",
        "Information Coding Technique",
        "International Computing Terminal",
      ],
      correctAnswer: "Information and Communication Technology",
      explanation: "ICT এর পূর্ণরূপ Information and Communication Technology, যার মাধ্যমে তথ্য আদান-প্রদান ও যোগাযোগ প্রযুক্তি বোঝানো হয়।",
      difficulty: "EASY",
    },
    {
      text: "বাংলাদেশে 'ডিজিটাল বাংলাদেশ' রূপকল্পের লক্ষ্য বছর কোনটি ছিল?",
      options: ["২০১৫", "২০২১", "২০৩০", "২০৪১"],
      correctAnswer: "২০২১",
      explanation: "২০০৮ সালে ঘোষিত 'ডিজিটাল বাংলাদেশ' রূপকল্পের প্রাথমিক লক্ষ্যমাত্রা ছিল ২০২১ সাল (স্বাধীনতার সুবর্ণজয়ন্তী), পরবর্তীতে 'স্মার্ট বাংলাদেশ ২০৪১' যোগ হয়েছে।",
      difficulty: "MEDIUM",
    },
    {
      text: "ICT এর ব্যবহার প্রধানত কোন কোন ক্ষেত্রে হয়?",
      options: [
        "শুধু শিক্ষাক্ষেত্রে",
        "শিক্ষা, স্বাস্থ্য, কৃষি, ব্যবসা-বাণিজ্য সব ক্ষেত্রে",
        "শুধু বিনোদনে",
        "শুধু সামরিক ক্ষেত্রে",
      ],
      correctAnswer: "শিক্ষা, স্বাস্থ্য, কৃষি, ব্যবসা-বাণিজ্য সব ক্ষেত্রে",
      explanation: "ICT আধুনিক জীবনের প্রায় সব ক্ষেত্রে ব্যবহৃত হয় — শিক্ষা (ই-লার্নিং), স্বাস্থ্য (টেলিমেডিসিন), কৃষি (ই-কৃষি), ব্যবসা (ই-কমার্স) ইত্যাদি।",
      difficulty: "EASY",
    },
  ],

  "নেটওয়ার্কের প্রকারভেদ": [
    {
      text: "একটি বাসা বা অফিসের মধ্যে সীমাবদ্ধ নেটওয়ার্ককে কী বলে?",
      options: ["WAN", "LAN", "MAN", "PAN"],
      correctAnswer: "LAN",
      explanation: "LAN (Local Area Network) হলো সীমিত এলাকা (যেমন একটি ভবন/অফিস) জুড়ে বিস্তৃত নেটওয়ার্ক।",
      difficulty: "EASY",
    },
    {
      text: "একটি শহর জুড়ে বিস্তৃত নেটওয়ার্ককে কী বলা হয়?",
      options: ["LAN", "PAN", "MAN", "WAN"],
      correctAnswer: "MAN",
      explanation: "MAN (Metropolitan Area Network) একটি শহর বা মহানগরীর মধ্যে বিস্তৃত নেটওয়ার্ককে বোঝায়, যা LAN এর চেয়ে বড় কিন্তু WAN এর চেয়ে ছোট পরিসরের।",
      difficulty: "MEDIUM",
    },
    {
      text: "ইন্টারনেট কোন ধরনের নেটওয়ার্কের উদাহরণ?",
      options: ["LAN", "PAN", "MAN", "WAN"],
      correctAnswer: "WAN",
      explanation: "ইন্টারনেট হলো WAN (Wide Area Network) এর সবচেয়ে বড় উদাহরণ, যা সারা বিশ্বব্যাপী বিস্তৃত।",
      difficulty: "EASY",
    },
  ],

  "ডেটা ট্রান্সমিশন": [
    {
      text: "ডেটা ট্রান্সমিশনে ব্যান্ডউইথ কী নির্দেশ করে?",
      options: [
        "ডেটা সংরক্ষণের ক্ষমতা",
        "প্রতি একক সময়ে ডেটা প্রেরণের হার/ক্ষমতা",
        "কম্পিউটারের গতি",
        "মনিটরের রেজোলিউশন",
      ],
      correctAnswer: "প্রতি একক সময়ে ডেটা প্রেরণের হার/ক্ষমতা",
      explanation: "ব্যান্ডউইথ বলতে একটি নেটওয়ার্ক চ্যানেলে প্রতি সেকেন্ডে সর্বোচ্চ কতটুকু ডেটা প্রেরণ করা যায় তা বোঝায়, সাধারণত bps (bits per second) এককে পরিমাপ করা হয়।",
      difficulty: "MEDIUM",
    },
    {
      text: "একই সাথে দুই দিকে ডেটা আদান-প্রদান করা যায় এমন ট্রান্সমিশন মোডকে কী বলে?",
      options: ["Simplex", "Half Duplex", "Full Duplex", "None of these"],
      correctAnswer: "Full Duplex",
      explanation: "Full Duplex মোডে একই সময়ে দুই দিক থেকেই ডেটা পাঠানো ও গ্রহণ করা যায়, যেমন টেলিফোন কথোপকথন।",
      difficulty: "MEDIUM",
    },
  ],

  "বাইনারি, অক্টাল, হেক্সাডেসিমেল": [
    {
      text: "বাইনারি সংখ্যা পদ্ধতির ভিত্তি (base) কত?",
      options: ["২", "৮", "১০", "১৬"],
      correctAnswer: "২",
      explanation: "বাইনারি সংখ্যা পদ্ধতিতে মাত্র দুটি অঙ্ক ব্যবহৃত হয় (০ এবং ১), তাই এর ভিত্তি ২।",
      difficulty: "EASY",
    },
    {
      text: "হেক্সাডেসিমেল সংখ্যা পদ্ধতির ভিত্তি কত?",
      options: ["৮", "১০", "১৬", "৩২"],
      correctAnswer: "১৬",
      explanation: "হেক্সাডেসিমেল সংখ্যা পদ্ধতিতে ০-৯ এবং A-F (১৬টি প্রতীক) ব্যবহৃত হয়, তাই এর ভিত্তি ১৬।",
      difficulty: "EASY",
    },
    {
      text: "অক্টাল থেকে বাইনারিতে রূপান্তরের সময় প্রতিটি অক্টাল অঙ্ককে কত বিটের বাইনারিতে রূপান্তর করতে হয়?",
      options: ["২ বিট", "৩ বিট", "৪ বিট", "৫ বিট"],
      correctAnswer: "৩ বিট",
      explanation: "যেহেতু অক্টালের ভিত্তি ৮ = ২³, তাই প্রতিটি অক্টাল অঙ্ককে ৩ বিটের সমতুল্য বাইনারিতে রূপান্তর করতে হয়।",
      difficulty: "MEDIUM",
    },
    {
      text: "হেক্সাডেসিমেল থেকে বাইনারিতে রূপান্তরের সময় প্রতিটি হেক্সাডেসিমেল অঙ্ককে কত বিটের বাইনারিতে রূপান্তর করতে হয়?",
      options: ["৩ বিট", "৪ বিট", "৫ বিট", "৮ বিট"],
      correctAnswer: "৪ বিট",
      explanation: "যেহেতু হেক্সাডেসিমেলের ভিত্তি ১৬ = ২⁴, তাই প্রতিটি হেক্সাডেসিমেল অঙ্ককে ৪ বিটের সমতুল্য বাইনারিতে রূপান্তর করতে হয়।",
      difficulty: "MEDIUM",
    },
    {
      text: "দশমিক সংখ্যা ১০ কে বাইনারিতে রূপান্তর করলে কত হবে?",
      options: ["1010", "1001", "1100", "1110"],
      correctAnswer: "1010",
      explanation: "১০ = ৮+২ = ২³+২¹, তাই বাইনারি রূপ 1010 (৮এর ঘর ১, ৪এর ঘর ০, ২এর ঘর ১, ১এর ঘর ০)।",
      difficulty: "HARD",
    },
  ],

  "বুলিয়ান অ্যালজেবরা": [
    {
      text: "বুলিয়ান অ্যালজেবরায় কতটি মৌলিক অপারেশন আছে?",
      options: ["২টি", "৩টি", "৪টি", "৫টি"],
      correctAnswer: "৩টি",
      explanation: "বুলিয়ান অ্যালজেবরার তিনটি মৌলিক অপারেশন হলো AND (.), OR (+), এবং NOT (')।",
      difficulty: "MEDIUM",
    },
    {
      text: "A AND 0 = ?",
      options: ["A", "0", "1", "NOT A"],
      correctAnswer: "0",
      explanation: "বুলিয়ান অ্যালজেবরার নিয়ম অনুযায়ী, যেকোনো ভেরিয়েবল AND 0 সবসময় 0 হয় (Null Law)।",
      difficulty: "MEDIUM",
    },
    {
      text: "A OR 1 = ?",
      options: ["A", "0", "1", "NOT A"],
      correctAnswer: "1",
      explanation: "বুলিয়ান অ্যালজেবরার নিয়ম অনুযায়ী, যেকোনো ভেরিয়েবল OR 1 সবসময় 1 হয় (Identity Law এর একটি রূপ)।",
      difficulty: "MEDIUM",
    },
  ],

  "HTML ট্যাগ পরিচিতি": [
    {
      text: "HTML এর পূর্ণরূপ কী?",
      options: [
        "Hyper Text Markup Language",
        "High Transfer Machine Language",
        "Home Tool Markup Language",
        "Hyperlink Text Manage Language",
      ],
      correctAnswer: "Hyper Text Markup Language",
      explanation: "HTML এর পূর্ণরূপ Hyper Text Markup Language, যা ওয়েব পেজের গঠন তৈরিতে ব্যবহৃত হয়।",
      difficulty: "EASY",
    },
    {
      text: "একটি HTML ডকুমেন্টের সবচেয়ে বড় হেডিং ট্যাগ কোনটি?",
      options: ["<h6>", "<h1>", "<head>", "<title>"],
      correctAnswer: "<h1>",
      explanation: "HTML এ <h1> থেকে <h6> পর্যন্ত হেডিং ট্যাগ আছে, যেখানে <h1> সবচেয়ে বড় এবং গুরুত্বপূর্ণ হেডিং নির্দেশ করে।",
      difficulty: "EASY",
    },
    {
      text: "একটি ওয়েব পেজে হাইপারলিংক তৈরি করতে কোন ট্যাগ ব্যবহৃত হয়?",
      options: ["<link>", "<a>", "<href>", "<url>"],
      correctAnswer: "<a>",
      explanation: "<a> (anchor) ট্যাগ ব্যবহার করে href অ্যাট্রিবিউটের মাধ্যমে হাইপারলিংক তৈরি করা হয়, যেমন <a href=\"...\">লিংক</a>।",
      difficulty: "MEDIUM",
    },
  ],

  "CSS বেসিক": [
    {
      text: "CSS এর পূর্ণরূপ কী?",
      options: [
        "Cascading Style Sheets",
        "Computer Style Sheets",
        "Creative Style System",
        "Colorful Style Sheets",
      ],
      correctAnswer: "Cascading Style Sheets",
      explanation: "CSS এর পূর্ণরূপ Cascading Style Sheets, যা HTML ডকুমেন্টের স্টাইল (রং, ফন্ট, লেআউট) নিয়ন্ত্রণ করে।",
      difficulty: "EASY",
    },
    {
      text: "একটি HTML এলিমেন্টের ব্যাকগ্রাউন্ড কালার পরিবর্তন করতে কোন CSS প্রপার্টি ব্যবহৃত হয়?",
      options: ["color", "background-color", "font-color", "bg-color"],
      correctAnswer: "background-color",
      explanation: "'background-color' প্রপার্টি ব্যবহার করে কোনো এলিমেন্টের পটভূমির রং নির্ধারণ করা হয়।",
      difficulty: "EASY",
    },
  ],

  "প্রোগ্রামিং এর ধারণা": [
    {
      text: "প্রোগ্রামিং ভাষায় লেখা নির্দেশনার ধারাবাহিক সেটকে কী বলে?",
      options: ["অ্যালগরিদম", "প্রোগ্রাম", "কম্পাইলার", "ডেটাবেজ"],
      correctAnswer: "প্রোগ্রাম",
      explanation: "কম্পিউটারকে কোনো কাজ সম্পাদনের জন্য প্রোগ্রামিং ভাষায় লেখা নির্দেশনার সেটকে প্রোগ্রাম বলে।",
      difficulty: "EASY",
    },
    {
      text: "উচ্চস্তরের প্রোগ্রামিং ভাষায় লেখা কোডকে মেশিন ভাষায় রূপান্তর করে কোনটি?",
      options: ["কম্পাইলার", "মনিটর", "কীবোর্ড", "প্রিন্টার"],
      correctAnswer: "কম্পাইলার",
      explanation: "কম্পাইলার সোর্স কোডকে (উচ্চস্তরের ভাষা) সম্পূর্ণভাবে মেশিন ভাষায় (বাইনারি) রূপান্তর করে, যা কম্পিউটার সরাসরি বুঝতে পারে।",
      difficulty: "MEDIUM",
    },
    {
      text: "একটি সমস্যা সমাধানের ধাপগুলোর যৌক্তিক ক্রমকে কী বলে?",
      options: ["সিনট্যাক্স", "অ্যালগরিদম", "ভ্যারিয়েবল", "লুপ"],
      correctAnswer: "অ্যালগরিদম",
      explanation: "অ্যালগরিদম হলো কোনো সমস্যা সমাধানের জন্য ধাপে ধাপে সাজানো যৌক্তিক নির্দেশনার সেট, যা প্রোগ্রাম লেখার পূর্বশর্ত।",
      difficulty: "EASY",
    },
  ],

  "C প্রোগ্রামিং বেসিক": [
    {
      text: "C প্রোগ্রামের execution কোন ফাংশন থেকে শুরু হয়?",
      options: ["start()", "main()", "begin()", "init()"],
      correctAnswer: "main()",
      explanation: "প্রতিটি C প্রোগ্রামে main() ফাংশন থাকা আবশ্যক — প্রোগ্রামের execution এই ফাংশন থেকেই শুরু হয়।",
      difficulty: "EASY",
    },
    {
      text: "C ভাষায় একটি পূর্ণসংখ্যা (integer) ভেরিয়েবল ঘোষণা করতে কোন কীওয়ার্ড ব্যবহৃত হয়?",
      options: ["float", "int", "char", "string"],
      correctAnswer: "int",
      explanation: "'int' কীওয়ার্ড ব্যবহার করে C ভাষায় পূর্ণসংখ্যা (integer) টাইপের ভেরিয়েবল ঘোষণা করা হয়, যেমন int x;",
      difficulty: "EASY",
    },
  ],

  "ডেটাবেজের ধারণা": [
    {
      text: "ডেটাবেজ ব্যবস্থাপনার সফটওয়্যারকে সংক্ষেপে কী বলা হয়?",
      options: ["DBMS", "DBMA", "DMS", "DBS"],
      correctAnswer: "DBMS",
      explanation: "DBMS (Database Management System) হলো এমন সফটওয়্যার যা ডেটাবেজ তৈরি, সংরক্ষণ ও পরিচালনা করতে ব্যবহৃত হয়, যেমন MySQL, Oracle।",
      difficulty: "EASY",
    },
    {
      text: "ডেটাবেজের একটি টেবিলে প্রতিটি সারিকে (row) কী বলা হয়?",
      options: ["ফিল্ড", "রেকর্ড", "কলাম", "কী"],
      correctAnswer: "রেকর্ড",
      explanation: "একটি ডেটাবেজ টেবিলে প্রতিটি সারি (row) একটি রেকর্ড হিসেবে বিবেচিত হয়, যা সম্পর্কিত ডেটার একটি সম্পূর্ণ সেট নির্দেশ করে।",
      difficulty: "MEDIUM",
    },
  ],

  "SQL কুয়েরি": [
    {
      text: "SQL এর পূর্ণরূপ কী?",
      options: [
        "Structured Query Language",
        "Simple Query Language",
        "Sequential Query Language",
        "System Query Language",
      ],
      correctAnswer: "Structured Query Language",
      explanation: "SQL এর পূর্ণরূপ Structured Query Language, যা রিলেশনাল ডেটাবেজে ডেটা যোগ, সম্পাদনা, ও অনুসন্ধানের জন্য ব্যবহৃত হয়।",
      difficulty: "EASY",
    },
    {
      text: "একটি টেবিল থেকে ডেটা পুনরুদ্ধার করতে কোন SQL কমান্ড ব্যবহৃত হয়?",
      options: ["INSERT", "SELECT", "DELETE", "UPDATE"],
      correctAnswer: "SELECT",
      explanation: "SELECT কমান্ড ব্যবহার করে ডেটাবেজের টেবিল থেকে নির্দিষ্ট শর্ত অনুযায়ী ডেটা পুনরুদ্ধার/দেখা যায়।",
      difficulty: "EASY",
    },
    {
      text: "একটি টেবিলে নতুন ডেটা যোগ করতে কোন SQL কমান্ড ব্যবহৃত হয়?",
      options: ["SELECT", "INSERT INTO", "DELETE FROM", "DROP TABLE"],
      correctAnswer: "INSERT INTO",
      explanation: "INSERT INTO কমান্ড ব্যবহার করে একটি ডেটাবেজ টেবিলে নতুন রেকর্ড (সারি) যোগ করা হয়।",
      difficulty: "MEDIUM",
    },
  ],

  "ন্যানো টেকনোলজি": [
    {
      text: "ন্যানো টেকনোলজি কোন স্কেলে কাজ করে?",
      options: ["মিলিমিটার", "সেন্টিমিটার", "ন্যানোমিটার", "মিটার"],
      correctAnswer: "ন্যানোমিটার",
      explanation: "ন্যানো টেকনোলজি অতি ক্ষুদ্র স্কেলে (১ ন্যানোমিটার = ১০⁻⁹ মিটার) পদার্থ নিয়ন্ত্রণ ও তৈরির প্রযুক্তি।",
      difficulty: "MEDIUM",
    },
    {
      text: "ন্যানো টেকনোলজি কোন ক্ষেত্রে ব্যবহৃত হয়?",
      options: ["শুধু চিকিৎসা", "চিকিৎসা, ইলেকট্রনিক্স, কৃষি সহ বিভিন্ন ক্ষেত্রে", "শুধু কৃষি", "শুধু নির্মাণ"],
      correctAnswer: "চিকিৎসা, ইলেকট্রনিক্স, কৃষি সহ বিভিন্ন ক্ষেত্রে",
      explanation: "ন্যানো টেকনোলজি চিকিৎসা (টার্গেটেড ড্রাগ ডেলিভারি), ইলেকট্রনিক্স (মাইক্রোচিপ), কৃষি ও পরিবেশ সহ বহু ক্ষেত্রে ব্যবহৃত হয়।",
      difficulty: "MEDIUM",
    },
  ],
};

async function main() {
  assertDestructiveSeedAllowed("seed-bangla-english-ict.ts");
  console.log("🌱 Bangla/English/ICT Question Bank Seeding শুরু হচ্ছে...\n");

  let totalCreated = 0;
  const topicsNotFound: string[] = [];

  for (const [topicName, questions] of Object.entries(questionsByTopic)) {
    const topic = await prisma.topic.findFirst({
      where: { name: topicName },
    });

    if (!topic) {
      topicsNotFound.push(topicName);
      continue;
    }

    // আগের প্রশ্ন মুছে ফেলা হচ্ছে (idempotent রাখার জন্য)
    await prisma.question.deleteMany({ where: { topicId: topic.id } });

    await prisma.question.createMany({
      data: questions.map((q) => ({
        topicId: topic.id,
        type: "MCQ" as const,
        text: q.text,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        difficulty: q.difficulty,
      })),
    });

    console.log(`✅ ${topicName} — ${questions.length}টি প্রশ্ন যোগ হলো`);
    totalCreated += questions.length;
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
