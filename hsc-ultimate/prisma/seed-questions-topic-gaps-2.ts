// ===================================================================
// MCQ Question Bank — বাকি সব MCQ-শূন্য টপিক পূরণ (রসায়ন, জীববিজ্ঞান,
// উচ্চতর গণিত, বাংলা)
// -------------------------------------------------------------------
// seed-questions-physics-topic-gaps.ts এর ধারাবাহিকতা। ঐ স্ক্রিপ্টে
// পদার্থবিজ্ঞানের ১৯টা টপিক পূরণ হয়েছে; এখানে বাকি ২৭টা:
//   রসায়ন ৩ · জীববিজ্ঞান ১০ · উচ্চতর গণিত ১২ · বাংলা ২
//
// এই স্ক্রিপ্টের পর DB এর ১৮৫/১৮৫ টপিকেই অন্তত ৩টা করে MCQ থাকবে।
//
// কেন টপিক-লেভেল গ্যাপ গুরুত্বপূর্ণ (কোড পড়ে যাচাই করা):
//   • `app/api/pretest/start/route.ts:39` — প্রশ্নহীন টপিক pretest
//     থেকে সম্পূর্ণ বাদ পড়ে
//   • `lib/adaptive-practice.ts` — weak-topic detection ও
//     "unpracticed_important" সাজেশন প্রশ্নের উপর নির্ভরশীল
//
// প্রতিটা প্রশ্ন ঐ টপিকের `notesMarkdown` এর সাথে সামঞ্জস্যপূর্ণ,
// অর্থাৎ ছাত্র নোট পড়ে এলে উত্তর দিতে পারবে।
//
// ⚠️ একাধিক সাবজেক্ট একই `code` শেয়ার করে (CHEMISTRY/BIOLOGY/
// HIGHER_MATH/BANGLA — সবারই FIRST ও SECOND পত্র আছে), তাই টপিক
// লুকআপে code+paper দুটোই ব্যবহার করা হয়েছে।
//
// ⚠️ `deleteMany` করা হয় **না** — text মিলিয়ে ডুপ্লিকেট ফিল্টার।
//
// রান: pnpm db:seed-questions-topic-gaps-2
// ===================================================================
import { PrismaClient, Difficulty, type SubjectCode, type PaperNumber } from "@prisma/client";

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
  code: SubjectCode;
  paper: PaperNumber;
  questions: QuestionSeed[];
}

const seedData: TopicQuestionSeed[] = [
  // ==================== রসায়ন ====================
  {
    topicName: "তড়িৎ রসায়ন",
    code: "CHEMISTRY",
    paper: "FIRST",
    questions: [
      {
        text: "গ্যালভানিক কোষে অ্যানোড কোন চিহ্নের প্রান্ত?",
        options: ["ঋণাত্মক", "ধনাত্মক", "নিরপেক্ষ", "পরিবর্তনশীল"],
        correctAnswer: "ঋণাত্মক",
        explanation:
          "গ্যালভানিক কোষে অ্যানোডে জারণ ঘটে ও ইলেকট্রন নির্গত হয়, তাই এটি ঋণাত্মক প্রান্ত। তড়িৎ বিশ্লেষ্য কোষে ঠিক উল্টো।",
        difficulty: "MEDIUM",
      },
      {
        text: "১ ফ্যারাডে কত কুলম্বের সমান?",
        options: ["96500 C", "9650 C", "1000 C", "6.023×10²³ C"],
        correctAnswer: "96500 C",
        explanation: "১ ফ্যারাডে = ৯৬৫০০ কুলম্ব = ১ মোল ইলেকট্রনের আধান।",
        difficulty: "EASY",
      },
      {
        text: "OIL RIG সংক্ষিপ্ত রূপে জারণ বলতে কী বোঝায়?",
        options: [
          "ইলেকট্রন বর্জন",
          "ইলেকট্রন গ্রহণ",
          "প্রোটন বর্জন",
          "জারণ সংখ্যা হ্রাস",
        ],
        correctAnswer: "ইলেকট্রন বর্জন",
        explanation:
          "OIL RIG = Oxidation Is Loss (জারণে ইলেকট্রন বর্জন), Reduction Is Gain (বিজারণে গ্রহণ)।",
        difficulty: "EASY",
      },
    ],
  },
  {
    topicName: "গ্রিনহাউস প্রভাব",
    code: "CHEMISTRY",
    paper: "SECOND",
    questions: [
      {
        text: "গ্রিনহাউস প্রভাব না থাকলে পৃথিবীর গড় তাপমাত্রা কত হতো?",
        options: ["−18°C", "0°C", "15°C", "100°C"],
        correctAnswer: "−18°C",
        explanation:
          "প্রাকৃতিক গ্রিনহাউস প্রভাব ছাড়া পৃথিবীর গড় তাপমাত্রা হতো −18°C; বর্তমানে তা প্রায় 15°C — অর্থাৎ প্রাণের জন্য এটি অপরিহার্য।",
        difficulty: "MEDIUM",
      },
      {
        text: "অণুপ্রতি সবচেয়ে বেশি গ্রিনহাউস সক্ষমতা কোন গ্যাসের?",
        options: ["N₂O", "CO₂", "CH₄", "জলীয় বাষ্প"],
        correctAnswer: "N₂O",
        explanation:
          "N₂O এর সক্ষমতা CO₂ এর প্রায় ৩০০ গুণ, CH₄ এর ~২৫ গুণ। তবে পরিমাণ বেশি হওয়ায় মোট অবদানে CO₂ ই প্রধান।",
        difficulty: "HARD",
      },
      {
        text: "ওজোন স্তর ক্ষয়ের জন্য প্রধানত দায়ী কোনটি?",
        options: ["CFC", "CO₂", "SO₂", "N₂"],
        correctAnswer: "CFC",
        explanation:
          "CFC থেকে UV এর প্রভাবে মুক্ত ক্লোরিন র‍্যাডিকেল তৈরি হয়, যা ওজোন ভেঙে ফেলে। মন্ট্রিল প্রোটোকলে (১৯৮৭) CFC নিয়ন্ত্রিত হয়।",
        difficulty: "MEDIUM",
      },
    ],
  },
  {
    topicName: "তড়িৎ বিশ্লেষণ",
    code: "CHEMISTRY",
    paper: "SECOND",
    questions: [
      {
        text: "NaCl এর জলীয় দ্রবণ তড়িৎ বিশ্লেষণে ক্যাথোডে কী পাওয়া যায়?",
        options: ["হাইড্রোজেন গ্যাস", "সোডিয়াম ধাতু", "ক্লোরিন গ্যাস", "অক্সিজেন গ্যাস"],
        correctAnswer: "হাইড্রোজেন গ্যাস",
        explanation:
          "জলীয় দ্রবণে পানির বিজারণ সোডিয়ামের চেয়ে সহজ, তাই ক্যাথোডে H₂ পাওয়া যায় (গলিত NaCl এ কিন্তু Na ধাতু পাওয়া যেত)।",
        difficulty: "HARD",
      },
      {
        text: "তড়িৎ প্রলেপন করার সময় যে বস্তুতে প্রলেপ দেওয়া হবে সেটি কোথায় রাখতে হয়?",
        options: ["ক্যাথোডে", "অ্যানোডে", "দ্রবণে ভাসিয়ে", "যেকোনো জায়গায়"],
        correctAnswer: "ক্যাথোডে",
        explanation:
          "ক্যাথোডে বিজারণ ঘটে, অর্থাৎ ধাতব আয়ন ইলেকট্রন নিয়ে ধাতুতে পরিণত হয়ে জমা হয় — তাই বস্তুটি ক্যাথোডে রাখতে হয়।",
        difficulty: "MEDIUM",
      },
      {
        text: "ফ্যারাডের প্রথম সূত্র অনুযায়ী সঞ্চিত পদার্থের ভর কীসের সমানুপাতিক?",
        options: ["প্রবাহিত আধান", "সময়ের বর্গ", "ভোল্টেজ", "রোধ"],
        correctAnswer: "প্রবাহিত আধান",
        explanation: "m ∝ Q, অর্থাৎ m = ZIt — ভর প্রবাহিত আধানের সমানুপাতিক।",
        difficulty: "EASY",
      },
    ],
  },

  // ==================== জীববিজ্ঞান ১ম পত্র ====================
  {
    topicName: "ব্যাকটেরিয়া",
    code: "BIOLOGY",
    paper: "FIRST",
    questions: [
      {
        text: "ব্যাকটেরিয়ার কোষপ্রাচীর কী দিয়ে গঠিত?",
        options: ["পেপটাইডোগ্লাইক্যান", "সেলুলোজ", "কাইটিন", "লিগনিন"],
        correctAnswer: "পেপটাইডোগ্লাইক্যান",
        explanation:
          "ব্যাকটেরিয়ার কোষপ্রাচীর পেপটাইডোগ্লাইক্যান (মিউরিন) দিয়ে গঠিত — উদ্ভিদের সেলুলোজ বা ছত্রাকের কাইটিন নয়।",
        difficulty: "MEDIUM",
      },
      {
        text: "কোন ব্যাকটেরিয়া শিমজাতীয় উদ্ভিদের মূলে নাইট্রোজেন সংবন্ধন করে?",
        options: ["রাইজোবিয়াম", "ল্যাক্টোব্যাসিলাস", "ই. কোলাই", "স্ট্রেপ্টোকক্কাস"],
        correctAnswer: "রাইজোবিয়াম",
        explanation:
          "রাইজোবিয়াম শিমজাতীয় উদ্ভিদের মূলগুটিকায় মিথোজীবীভাবে বাস করে বায়ুমণ্ডলের N₂ কে সংবন্ধন করে।",
        difficulty: "EASY",
      },
      {
        text: "প্লাজমিড কী?",
        options: [
          "অতিরিক্ত বৃত্তাকার DNA",
          "কোষপ্রাচীরের অংশ",
          "একধরনের রাইবোসোম",
          "চলনাঙ্গ",
        ],
        correctAnswer: "অতিরিক্ত বৃত্তাকার DNA",
        explanation:
          "প্লাজমিড মূল DNA এর বাইরে ছোট বৃত্তাকার DNA; অ্যান্টিবায়োটিক রেজিস্ট্যান্স জিন প্রায়ই এখানে থাকে এবং জিন ক্লোনিংয়ে ভেক্টর হিসেবে ব্যবহৃত হয়।",
        difficulty: "MEDIUM",
      },
    ],
  },
  {
    topicName: "নগ্নবীজী উদ্ভিদের বৈশিষ্ট্য",
    code: "BIOLOGY",
    paper: "FIRST",
    questions: [
      {
        text: "নগ্নবীজী উদ্ভিদে সস্য (endosperm) কেমন?",
        options: [
          "হ্যাপ্লয়েড (n), নিষেকের আগে তৈরি",
          "ট্রিপ্লয়েড (3n), নিষেকের পরে",
          "ডিপ্লয়েড (2n)",
          "সস্য থাকে না",
        ],
        correctAnswer: "হ্যাপ্লয়েড (n), নিষেকের আগে তৈরি",
        explanation:
          "নগ্নবীজীতে দ্বি-নিষেক হয় না, তাই সস্য নিষেকের আগেই তৈরি হয় ও হ্যাপ্লয়েড থাকে। আবৃতবীজীতে তা নিষেকের পরে ও ট্রিপ্লয়েড।",
        difficulty: "HARD",
      },
      {
        text: "Cycas এর প্রবাল মূলে কোন জীব মিথোজীবীভাবে থাকে?",
        options: ["Anabaena", "Rhizobium", "Mucor", "Chlorella"],
        correctAnswer: "Anabaena",
        explanation:
          "Cycas এর প্রবাল মূলে (coralloid root) নীলাভ সবুজ শৈবাল Anabaena থাকে, যা নাইট্রোজেন সংবন্ধন করে।",
        difficulty: "MEDIUM",
      },
      {
        text: "নগ্নবীজী উদ্ভিদের বিবর্তনগত সবচেয়ে বড় অগ্রগতি কোনটি?",
        options: [
          "পরাগনালিকা — নিষেকে পানি লাগে না",
          "ফুল সৃষ্টি",
          "ফল সৃষ্টি",
          "সংবহনতন্ত্র সৃষ্টি",
        ],
        correctAnswer: "পরাগনালিকা — নিষেকে পানি লাগে না",
        explanation:
          "পরাগনালিকা তৈরি হওয়ায় শুক্রাণুকে আর সাঁতরাতে হয় না; এ কারণেই নগ্নবীজী শুষ্ক ও পার্বত্য অঞ্চলে বিস্তার লাভ করতে পেরেছে।",
        difficulty: "MEDIUM",
      },
    ],
  },
  {
    topicName: "ভাজক টিস্যু",
    code: "BIOLOGY",
    paper: "FIRST",
    questions: [
      {
        text: "ঘাস কেটে ফেলার পরও দ্রুত বাড়ে কোন ভাজক টিস্যুর কারণে?",
        options: ["ইন্টারক্যালারি", "অগ্রস্থ", "পার্শ্বীয়", "গৌণ"],
        correctAnswer: "ইন্টারক্যালারি",
        explanation:
          "অগ্রভাগ কেটে গেলেও পর্বমধ্যের গোড়ায় থাকা ইন্টারক্যালারি ভাজক টিস্যু অক্ষত থাকে, তাই ঘাস-বাঁশ আবার দ্রুত বাড়ে।",
        difficulty: "MEDIUM",
      },
      {
        text: "উদ্ভিদের ব্যাসিক (মোটা হওয়া) বৃদ্ধি কোন ভাজক টিস্যু ঘটায়?",
        options: ["পার্শ্বীয়", "অগ্রস্থ", "ইন্টারক্যালারি", "প্রোমেরিস্টেম"],
        correctAnswer: "পার্শ্বীয়",
        explanation:
          "পার্শ্বীয় ভাজক টিস্যু (ভাস্কুলার ক্যাম্বিয়াম, কর্ক ক্যাম্বিয়াম) গৌণ বৃদ্ধি ঘটায়, ফলে গাছ মোটা হয়।",
        difficulty: "MEDIUM",
      },
      {
        text: "ভাজক টিস্যুর কোষে কোষগহ্বর ছোট বা অনুপস্থিত থাকে কেন?",
        options: [
          "যাতে কোষ বিভাজন সহজ হয়",
          "খাদ্য সঞ্চয়ের জন্য",
          "পানি ধরে রাখতে",
          "কোষপ্রাচীর মজবুত করতে",
        ],
        correctAnswer: "যাতে কোষ বিভাজন সহজ হয়",
        explanation:
          "বড় কোষগহ্বর থাকলে বিভাজন কঠিন হতো; ভাজক কোষে সব শক্তি ও উপাদান বিভাজনেই ব্যয় হয়।",
        difficulty: "HARD",
      },
    ],
  },
  {
    topicName: "ক্লোনিং",
    code: "BIOLOGY",
    paper: "FIRST",
    questions: [
      {
        text: "প্রথম সফলভাবে ক্লোন করা স্তন্যপায়ী প্রাণী কোনটি?",
        options: ["ডলি ভেড়া", "ডলি গরু", "একটি ইঁদুর", "একটি বিড়াল"],
        correctAnswer: "ডলি ভেড়া",
        explanation:
          "১৯৯৬ সালে স্কটল্যান্ডের রোজলিন ইনস্টিটিউটে ইয়ান উইলমুটের নেতৃত্বে ডলি ভেড়া ক্লোন করা হয় — ২৭৭ বার চেষ্টার পর।",
        difficulty: "EASY",
      },
      {
        text: "জিন ক্লোনিংয়ে DNA কাটার জন্য কোন এনজাইম ব্যবহৃত হয়?",
        options: ["রেস্ট্রিকশন এনজাইম", "DNA লাইগেজ", "DNA পলিমারেজ", "হেলিকেজ"],
        correctAnswer: "রেস্ট্রিকশন এনজাইম",
        explanation:
          "রেস্ট্রিকশন এনজাইম 'আণবিক কাঁচি' হিসেবে DNA কাটে, আর DNA লাইগেজ জোড়া লাগায়।",
        difficulty: "MEDIUM",
      },
      {
        text: "উদ্ভিদের একটি কোষ থেকে সম্পূর্ণ উদ্ভিদ জন্মানোর ক্ষমতাকে কী বলে?",
        options: ["টোটিপোটেন্সি", "প্লুরিপোটেন্সি", "অ্যাপোমিক্সিস", "পার্থেনোকার্পি"],
        correctAnswer: "টোটিপোটেন্সি",
        explanation:
          "টোটিপোটেন্সির কারণেই টিস্যু কালচার সম্ভব — ক্যালাস থেকে রোগমুক্ত অভিন্ন চারা উৎপাদন করা যায়।",
        difficulty: "MEDIUM",
      },
    ],
  },
  {
    topicName: "জীববৈচিত্র্য সংরক্ষণ",
    code: "BIOLOGY",
    paper: "FIRST",
    questions: [
      {
        text: "জীববৈচিত্র্যের সবচেয়ে বড় হুমকি কোনটি?",
        options: ["আবাসস্থল ধ্বংস", "অতিরিক্ত শিকার", "দূষণ", "জলবায়ু পরিবর্তন"],
        correctAnswer: "আবাসস্থল ধ্বংস",
        explanation:
          "বন উজাড় ও নগরায়নের ফলে আবাসস্থল ধ্বংসই বিশ্বব্যাপী জীববৈচিত্র্য হ্রাসের প্রধান কারণ।",
        difficulty: "MEDIUM",
      },
      {
        text: "ইন-সিটু সংরক্ষণ বলতে কী বোঝায়?",
        options: [
          "প্রাকৃতিক আবাসেই সংরক্ষণ",
          "চিড়িয়াখানায় সংরক্ষণ",
          "জিন ব্যাংকে সংরক্ষণ",
          "টিস্যু কালচার",
        ],
        correctAnswer: "প্রাকৃতিক আবাসেই সংরক্ষণ",
        explanation:
          "ইন-সিটু (জাতীয় উদ্যান, অভয়ারণ্য) সর্বোত্তম পদ্ধতি, কারণ জীব তার নিজস্ব পরিবেশে বিবর্তিত হতে থাকে।",
        difficulty: "EASY",
      },
      {
        text: "সুন্দরবন কোন ধরনের বন?",
        options: ["ম্যানগ্রোভ", "চিরসবুজ", "পর্ণমোচী", "শালবন"],
        correctAnswer: "ম্যানগ্রোভ",
        explanation:
          "সুন্দরবন বিশ্বের বৃহত্তম ম্যানগ্রোভ বন এবং UNESCO বিশ্ব ঐতিহ্য; এটি রয়েল বেঙ্গল টাইগারের আবাস।",
        difficulty: "EASY",
      },
    ],
  },

  // ==================== জীববিজ্ঞান ২য় পত্র ====================
  {
    topicName: "প্রাণিজগতের পর্ব",
    code: "BIOLOGY",
    paper: "SECOND",
    questions: [
      {
        text: "প্রাণিজগতের বৃহত্তম পর্ব কোনটি?",
        options: ["আর্থ্রোপোডা", "মলাস্কা", "কর্ডাটা", "নিডারিয়া"],
        correctAnswer: "আর্থ্রোপোডা",
        explanation:
          "আর্থ্রোপোডা প্রাণিজগতের বৃহত্তম পর্ব — মোট প্রজাতির প্রায় ৮০%। দ্বিতীয় বৃহত্তম মলাস্কা।",
        difficulty: "EASY",
      },
      {
        text: "নিডারিয়া পর্বের স্বকীয় বৈশিষ্ট্য কোন কোষ?",
        options: ["নিডোব্লাস্ট", "কোয়ানোসাইট", "শিখা কোষ", "নেফ্রিডিয়া"],
        correctAnswer: "নিডোব্লাস্ট",
        explanation:
          "নিডোব্লাস্ট কোষে নেমাটোসিস্ট থাকে, যা শিকার ধরা ও আত্মরক্ষায় ব্যবহৃত হয় — এটি শুধু নিডারিয়াতেই পাওয়া যায়।",
        difficulty: "MEDIUM",
      },
      {
        text: "কর্ডাটা পর্বের একটি মৌলিক বৈশিষ্ট্য কোনটি?",
        options: [
          "পৃষ্ঠীয় ফাঁপা স্নায়ুরজ্জু",
          "অঙ্কীয় নিরেট স্নায়ুরজ্জু",
          "বহিঃকঙ্কাল",
          "খোলক",
        ],
        correctAnswer: "পৃষ্ঠীয় ফাঁপা স্নায়ুরজ্জু",
        explanation:
          "কর্ডাটার চারটি বৈশিষ্ট্য: নটোকর্ড, পৃষ্ঠীয় ফাঁপা স্নায়ুরজ্জু, গলবিলীয় ফুলকা রন্ধ্র ও পায়ু-পরবর্তী লেজ।",
        difficulty: "MEDIUM",
      },
    ],
  },
  {
    topicName: "খাদ্য শোষণ প্রক্রিয়া",
    code: "BIOLOGY",
    paper: "SECOND",
    questions: [
      {
        text: "খাদ্য শোষণের প্রধান স্থান কোনটি?",
        options: ["ক্ষুদ্রান্ত্র", "পাকস্থলী", "বৃহদন্ত্র", "মুখগহ্বর"],
        correctAnswer: "ক্ষুদ্রান্ত্র",
        explanation:
          "প্রায় ৯০% শোষণ ক্ষুদ্রান্ত্রে ঘটে — ভিলাই ও মাইক্রোভিলাইয়ের কারণে এর শোষণ পৃষ্ঠ প্রায় ২০০ বর্গমিটার।",
        difficulty: "EASY",
      },
      {
        text: "শোষিত চর্বি প্রথমে কোথায় প্রবেশ করে?",
        options: ["ল্যাক্টিয়াল (লসিকা)", "রক্তজালিকা", "যকৃৎ", "পাকস্থলী"],
        correctAnswer: "ল্যাক্টিয়াল (লসিকা)",
        explanation:
          "চর্বি কাইলোমাইক্রন আকারে ভিলাসের ল্যাক্টিয়ালে প্রবেশ করে লসিকাতন্ত্র দিয়ে পরে রক্তে মেশে — সরাসরি রক্তে যায় না।",
        difficulty: "HARD",
      },
      {
        text: "বৃহদন্ত্রে প্রধানত কী শোষিত হয়?",
        options: ["পানি ও খনিজ লবণ", "প্রোটিন", "চর্বি", "গ্লুকোজ"],
        correctAnswer: "পানি ও খনিজ লবণ",
        explanation:
          "বৃহদন্ত্রে পানি ও খনিজ শোষিত হয়; এখানে শোষণ কম হলে ডায়রিয়া, বেশি হলে কোষ্ঠকাঠিন্য হয়।",
        difficulty: "MEDIUM",
      },
    ],
  },
  {
    topicName: "মূত্র উৎপাদন প্রক্রিয়া",
    code: "BIOLOGY",
    paper: "SECOND",
    questions: [
      {
        text: "বৃক্কের গাঠনিক ও কার্যিক একক কোনটি?",
        options: ["নেফ্রন", "নিউরন", "অ্যালভিওলাস", "ভিলাস"],
        correctAnswer: "নেফ্রন",
        explanation: "প্রতিটি বৃক্কে প্রায় ১০ লক্ষ নেফ্রন থাকে।",
        difficulty: "EASY",
      },
      {
        text: "গ্লোমেরুলাসে উচ্চ চাপ সৃষ্টি হয় কেন?",
        options: [
          "অ্যাফারেন্ট ধমনিকা এফারেন্টের চেয়ে চওড়া",
          "রক্তের ঘনত্ব বেশি",
          "বাওম্যানস ক্যাপসুল ছোট",
          "হৃৎপিণ্ড কাছে",
        ],
        correctAnswer: "অ্যাফারেন্ট ধমনিকা এফারেন্টের চেয়ে চওড়া",
        explanation:
          "চওড়া নালি দিয়ে ঢুকে সরু নালি দিয়ে বের হওয়ায় গ্লোমেরুলাসে ~৫৫ mm Hg চাপ তৈরি হয়, যা পরিস্রাবণের চালিকাশক্তি।",
        difficulty: "HARD",
      },
      {
        text: "ADH হরমোনের কাজ কী?",
        options: [
          "পানি পুনঃশোষণ বাড়িয়ে ঘন মূত্র তৈরি",
          "Na⁺ পুনঃশোষণ বাড়ানো",
          "রক্তচাপ কমানো",
          "গ্লুকোজ শোষণ",
        ],
        correctAnswer: "পানি পুনঃশোষণ বাড়িয়ে ঘন মূত্র তৈরি",
        explanation:
          "ADH (ভ্যাসোপ্রেসিন) DCT ও সংগ্রাহী নালিকার পানিভেদ্যতা বাড়ায়। এর অভাবে ডায়াবেটিস ইনসিপিডাস হয়।",
        difficulty: "MEDIUM",
      },
    ],
  },
  {
    topicName: "ভ্যাকসিন",
    code: "BIOLOGY",
    paper: "SECOND",
    questions: [
      {
        text: "ভ্যাকসিন কোন ধরনের অনাক্রম্যতা তৈরি করে?",
        options: [
          "সক্রিয় কৃত্রিম",
          "নিষ্ক্রিয় কৃত্রিম",
          "সক্রিয় প্রাকৃতিক",
          "নিষ্ক্রিয় প্রাকৃতিক",
        ],
        correctAnswer: "সক্রিয় কৃত্রিম",
        explanation:
          "ভ্যাকসিনে দেহ নিজে অ্যান্টিবডি ও স্মৃতি কোষ তৈরি করে (সক্রিয়), আর এটি কৃত্রিমভাবে দেওয়া হয়।",
        difficulty: "MEDIUM",
      },
      {
        text: "ভ্যাকসিনের দীর্ঘস্থায়ী সুরক্ষার মূল কারণ কী?",
        options: ["স্মৃতি কোষ তৈরি হওয়া", "অ্যান্টিবডি জমে থাকা", "জীবাণু মরে যাওয়া", "রক্ত পরিশোধন"],
        correctAnswer: "স্মৃতি কোষ তৈরি হওয়া",
        explanation:
          "স্মৃতি কোষ ভবিষ্যতে আসল জীবাণু এলে তাৎক্ষণিকভাবে বিপুল অ্যান্টিবডি তৈরি করে (গৌণ সাড়া) — এটাই দীর্ঘস্থায়ী সুরক্ষার ভিত্তি।",
        difficulty: "MEDIUM",
      },
      {
        text: "গুটিবসন্তের প্রথম টিকা কে আবিষ্কার করেন?",
        options: ["এডওয়ার্ড জেনার", "লুই পাস্তুর", "আলেকজান্ডার ফ্লেমিং", "রবার্ট কক"],
        correctAnswer: "এডওয়ার্ড জেনার",
        explanation:
          "১৭৯৬ সালে এডওয়ার্ড জেনার গোবসন্ত ব্যবহার করে গুটিবসন্তের টিকা আবিষ্কার করেন; ১৯৮০ সালে রোগটি সম্পূর্ণ নির্মূল ঘোষিত হয়।",
        difficulty: "EASY",
      },
    ],
  },
  {
    topicName: "ডারউইনবাদ",
    code: "BIOLOGY",
    paper: "SECOND",
    questions: [
      {
        text: "ডারউইনের বিখ্যাত গ্রন্থ কোনটি?",
        options: [
          "On the Origin of Species",
          "Philosophie Zoologique",
          "Principia Mathematica",
          "The Selfish Gene",
        ],
        correctAnswer: "On the Origin of Species",
        explanation: "১৮৫৯ সালে প্রকাশিত এই গ্রন্থেই প্রাকৃতিক নির্বাচন তত্ত্ব উপস্থাপিত হয়।",
        difficulty: "EASY",
      },
      {
        text: "মানুষের হাত ও তিমির ফ্লিপার কোন ধরনের অঙ্গ?",
        options: ["সমসংস্থ", "সমবৃত্তীয়", "লুপ্তপ্রায়", "অভিন্ন"],
        correctAnswer: "সমসংস্থ",
        explanation:
          "উৎপত্তি এক কিন্তু কাজ ভিন্ন — এগুলো সমসংস্থ অঙ্গ, যা অপসারী বিবর্তনের প্রমাণ। (পাখি ও পতঙ্গের ডানা সমবৃত্তীয়।)",
        difficulty: "MEDIUM",
      },
      {
        text: "ডারউইনবাদের প্রধান সীমাবদ্ধতা কী ছিল?",
        options: [
          "প্রকরণের উৎস ব্যাখ্যা করতে পারেননি",
          "জীবাশ্মের প্রমাণ ছিল না",
          "প্রাকৃতিক নির্বাচন ভুল ছিল",
          "অস্তিত্বের সংগ্রাম অস্বীকার করেছিলেন",
        ],
        correctAnswer: "প্রকরণের উৎস ব্যাখ্যা করতে পারেননি",
        explanation:
          "তখনো জিন ও DNA আবিষ্কৃত হয়নি, তাই প্রকরণ কীভাবে সৃষ্টি ও সঞ্চারিত হয় তা ব্যাখ্যা করা যায়নি — পরে নব্য-ডারউইনবাদ এটি পূরণ করে।",
        difficulty: "HARD",
      },
    ],
  },

  // ==================== উচ্চতর গণিত ১ম পত্র ====================
  {
    topicName: "ভেক্টরের প্রাথমিক ধারণা",
    code: "HIGHER_MATH",
    paper: "FIRST",
    questions: [
      {
        text: "দুটি ভেক্টর একই দিকে হলে তাদের লব্ধির মান কত?",
        options: ["P + Q", "P − Q", "√(P²+Q²)", "শূন্য"],
        correctAnswer: "P + Q",
        explanation:
          "R = √(P²+Q²+2PQcosθ); θ = 0° হলে cos0° = 1, তাই R = P + Q — এটাই সর্বোচ্চ মান।",
        difficulty: "EASY",
      },
      {
        text: "একক ভেক্টরের মান কত?",
        options: ["১", "০", "যেকোনো মান", "অসীম"],
        correctAnswer: "১",
        explanation: "একক ভেক্টর  = A/|A|, এর মান সবসময় ১; শুধু দিক নির্দেশ করে।",
        difficulty: "EASY",
      },
      {
        text: "A ও B বিন্দুর অবস্থান ভেক্টর a ও b হলে মধ্যবিন্দুর অবস্থান ভেক্টর কত?",
        options: ["(a+b)/2", "(a−b)/2", "a+b", "ab/2"],
        correctAnswer: "(a+b)/2",
        explanation:
          "বিভাজন সূত্রে m = n = 1 বসালে r = (a+b)/2 পাওয়া যায়।",
        difficulty: "MEDIUM",
      },
    ],
  },
  {
    topicName: "দুই সরলরেখার মধ্যবর্তী কোণ",
    code: "HIGHER_MATH",
    paper: "FIRST",
    questions: [
      {
        text: "দুটি সরলরেখা পরস্পর লম্ব হওয়ার শর্ত কোনটি?",
        options: ["m₁m₂ = −1", "m₁ = m₂", "m₁m₂ = 1", "m₁ + m₂ = 0"],
        correctAnswer: "m₁m₂ = −1",
        explanation:
          "লম্ব হলে θ = 90°, তাই tanθ অসংজ্ঞায়িত — অর্থাৎ হর 1 + m₁m₂ = 0, ফলে m₁m₂ = −1।",
        difficulty: "EASY",
      },
      {
        text: "ax + by + c = 0 রেখার ঢাল কত?",
        options: ["−a/b", "a/b", "−b/a", "b/a"],
        correctAnswer: "−a/b",
        explanation: "y = −(a/b)x − c/b আকারে লিখলে ঢাল m = −a/b পাওয়া যায়।",
        difficulty: "MEDIUM",
      },
      {
        text: "বিন্দু (x₁,y₁) থেকে ax+by+c=0 রেখার লম্ব দূরত্ব কোনটি?",
        options: [
          "|ax₁+by₁+c|/√(a²+b²)",
          "(ax₁+by₁+c)/(a+b)",
          "|ax₁+by₁+c|/(a²+b²)",
          "√(a²+b²)/|ax₁+by₁+c|",
        ],
        correctAnswer: "|ax₁+by₁+c|/√(a²+b²)",
        explanation: "এটাই বিন্দু থেকে সরলরেখার লম্ব দূরত্বের প্রমাণ সূত্র।",
        difficulty: "MEDIUM",
      },
    ],
  },
  {
    topicName: "স্পর্শক",
    code: "HIGHER_MATH",
    paper: "FIRST",
    questions: [
      {
        text: "কোনো সরলরেখা বৃত্তের স্পর্শক হওয়ার শর্ত কী?",
        options: [
          "কেন্দ্র থেকে দূরত্ব = ব্যাসার্ধ",
          "কেন্দ্র থেকে দূরত্ব > ব্যাসার্ধ",
          "কেন্দ্র থেকে দূরত্ব < ব্যাসার্ধ",
          "রেখাটি কেন্দ্র দিয়ে যায়",
        ],
        correctAnswer: "কেন্দ্র থেকে দূরত্ব = ব্যাসার্ধ",
        explanation:
          "d = r হলে স্পর্শক; d > r হলে ছেদ করে না, d < r হলে দুই বিন্দুতে ছেদ করে (ছেদক)।",
        difficulty: "EASY",
      },
      {
        text: "x² + y² = a² বৃত্তের (x₁,y₁) বিন্দুতে স্পর্শকের সমীকরণ কোনটি?",
        options: ["xx₁ + yy₁ = a²", "x₁ + y₁ = a", "xx₁ − yy₁ = a²", "x² + y² = a"],
        correctAnswer: "xx₁ + yy₁ = a²",
        explanation:
          "মূল সমীকরণে x² → xx₁ এবং y² → yy₁ বসিয়ে দিলেই স্পর্শকের সমীকরণ পাওয়া যায়।",
        difficulty: "MEDIUM",
      },
      {
        text: "বৃত্তে স্পর্শবিন্দুতে অঙ্কিত ব্যাসার্ধ স্পর্শকের সাথে কত কোণ করে?",
        options: ["90°", "45°", "60°", "0°"],
        correctAnswer: "90°",
        explanation:
          "স্পর্শবিন্দুতে ব্যাসার্ধ ও স্পর্শক পরস্পর লম্ব — এটাই বৃত্তের স্পর্শক সংক্রান্ত সব সমস্যার ভিত্তি।",
        difficulty: "EASY",
      },
    ],
  },
  {
    topicName: "ত্রিকোণমিতিক অনুপাতের ধারণা",
    code: "HIGHER_MATH",
    paper: "FIRST",
    questions: [
      {
        text: "π রেডিয়ান কত ডিগ্রির সমান?",
        options: ["180°", "90°", "360°", "270°"],
        correctAnswer: "180°",
        explanation: "π রেডিয়ান = 180°, তাই ১ রেডিয়ান ≈ 57°17′45″।",
        difficulty: "EASY",
      },
      {
        text: "দ্বিতীয় চতুর্ভাগে কোন ত্রিকোণমিতিক অনুপাত ধনাত্মক?",
        options: ["sin", "cos", "tan", "সবগুলো"],
        correctAnswer: "sin",
        explanation:
          "ASTC নিয়ম: ১ম চতুর্ভাগে All, ২য়ে Sin, ৩য়ে Tan, ৪র্থে Cos ধনাত্মক।",
        difficulty: "MEDIUM",
      },
      {
        text: "sin²θ + cos²θ এর মান কত?",
        options: ["১", "০", "2", "sin2θ"],
        correctAnswer: "১",
        explanation:
          "এটি মৌলিক ত্রিকোণমিতিক অভেদ, যা পিথাগোরাসের উপপাদ্য থেকেই আসে।",
        difficulty: "EASY",
      },
    ],
  },
  {
    topicName: "উচ্চতর ক্রমের অন্তরজ",
    code: "HIGHER_MATH",
    paper: "FIRST",
    questions: [
      {
        text: "সরণ s(t) এর দ্বিতীয় অন্তরজ কী নির্দেশ করে?",
        options: ["ত্বরণ", "বেগ", "দূরত্ব", "ভরবেগ"],
        correctAnswer: "ত্বরণ",
        explanation: "ds/dt = বেগ, আর d²s/dt² = ত্বরণ।",
        difficulty: "EASY",
      },
      {
        text: "সংকট বিন্দুতে f″(x) > 0 হলে সেখানে কী পাওয়া যায়?",
        options: ["অবম মান", "চরম মান", "নতিপরিবর্তন বিন্দু", "কিছুই নয়"],
        correctAnswer: "অবম মান",
        explanation:
          "f″ > 0 মানে বক্ররেখা উপরের দিকে অবতল (∪ আকৃতি) — বাটির তলাই সর্বনিম্ন বিন্দু, তাই অবম মান।",
        difficulty: "MEDIUM",
      },
      {
        text: "eˣ এর n-তম অন্তরজ কত?",
        options: ["eˣ", "n·eˣ", "n!·eˣ", "0"],
        correctAnswer: "eˣ",
        explanation:
          "eˣ এর সব অন্তরজই eˣ — এটিই এই ফাংশনের অনন্য বৈশিষ্ট্য।",
        difficulty: "MEDIUM",
      },
    ],
  },
  {
    topicName: "নির্দিষ্ট যোগজ",
    code: "HIGHER_MATH",
    paper: "FIRST",
    questions: [
      {
        text: "নির্দিষ্ট যোগজে সমাকল ধ্রুবক C থাকে না কেন?",
        options: [
          "উভয় সীমায় C কেটে যায়",
          "C সবসময় শূন্য",
          "C ভুল ধারণা",
          "সীমা নেই তাই",
        ],
        correctAnswer: "উভয় সীমায় C কেটে যায়",
        explanation: "[F(x)+C]ᵃᵇ = (F(b)+C) − (F(a)+C) = F(b) − F(a) — C কেটে যায়।",
        difficulty: "MEDIUM",
      },
      {
        text: "f(x) বিজোড় ফাংশন হলে −a থেকে a পর্যন্ত যোগজের মান কত?",
        options: ["০", "2∫₀ᵃf(x)dx", "a²", "অনির্ণেয়"],
        correctAnswer: "০",
        explanation:
          "বিজোড় ফাংশনে ধনাত্মক ও ঋণাত্মক অংশ ঠিক সমান হয়ে বাতিল হয়ে যায়, তাই যোগজ শূন্য।",
        difficulty: "HARD",
      },
      {
        text: "∫ₐᵇ f(x)dx এর জ্যামিতিক অর্থ কী?",
        options: [
          "বক্ররেখা ও x-অক্ষের মধ্যবর্তী ক্ষেত্রফল",
          "বক্ররেখার দৈর্ঘ্য",
          "স্পর্শকের ঢাল",
          "বক্রতার ব্যাসার্ধ",
        ],
        correctAnswer: "বক্ররেখা ও x-অক্ষের মধ্যবর্তী ক্ষেত্রফল",
        explanation:
          "নির্দিষ্ট যোগজ ঐ সীমার মধ্যে বক্ররেখা ও x-অক্ষ দ্বারা আবদ্ধ ক্ষেত্রফল নির্দেশ করে (নিচের অংশ ঋণাত্মক)।",
        difficulty: "MEDIUM",
      },
    ],
  },

  // ==================== উচ্চতর গণিত ২য় পত্র ====================
  {
    topicName: "জটিল সংখ্যার সূচকীয় রূপ",
    code: "HIGHER_MATH",
    paper: "SECOND",
    questions: [
      {
        text: "অয়লারের সূত্র কোনটি?",
        options: [
          "e^(iθ) = cosθ + i sinθ",
          "e^(iθ) = cosθ − i sinθ",
          "e^θ = cosθ + sinθ",
          "e^(iθ) = sinθ + i cosθ",
        ],
        correctAnswer: "e^(iθ) = cosθ + i sinθ",
        explanation:
          "এটাই অয়লারের সূত্র; θ = π বসালে বিখ্যাত অয়লার অভেদ e^(iπ) + 1 = 0 পাওয়া যায়।",
        difficulty: "MEDIUM",
      },
      {
        text: "1 + ω + ω² এর মান কত (ω = এককের ঘনমূল)?",
        options: ["০", "১", "ω", "৩"],
        correctAnswer: "০",
        explanation:
          "এককের ঘনমূলের দুটি মূল ধর্ম: ω³ = 1 এবং 1 + ω + ω² = 0।",
        difficulty: "MEDIUM",
      },
      {
        text: "দুটি জটিল সংখ্যা গুণ করলে তাদের আর্গুমেন্টের কী হয়?",
        options: ["যোগ হয়", "বিয়োগ হয়", "গুণ হয়", "অপরিবর্তিত থাকে"],
        correctAnswer: "যোগ হয়",
        explanation:
          "z₁z₂ = r₁r₂e^(i(θ₁+θ₂)) — মডুলাস গুণ হয় কিন্তু আর্গুমেন্ট যোগ হয়।",
        difficulty: "HARD",
      },
    ],
  },
  {
    topicName: "সমীকরণের মূল নির্ণয়",
    code: "HIGHER_MATH",
    paper: "SECOND",
    questions: [
      {
        text: "ax² + bx + c = 0 এর নিরূপক D < 0 হলে মূল কেমন?",
        options: ["দুটি জটিল মূল", "দুটি ভিন্ন বাস্তব মূল", "দুটি সমান মূল", "কোনো মূল নেই"],
        correctAnswer: "দুটি জটিল মূল",
        explanation:
          "D < 0 হলে √D কাল্পনিক হয়, তাই দুটি অনুবন্ধী জটিল মূল পাওয়া যায়।",
        difficulty: "EASY",
      },
      {
        text: "দ্বিঘাত সমীকরণে মূলদ্বয়ের গুণফল কত?",
        options: ["c/a", "−b/a", "b/a", "−c/a"],
        correctAnswer: "c/a",
        explanation: "αβ = c/a এবং α + β = −b/a।",
        difficulty: "EASY",
      },
      {
        text: "উৎপাদক উপপাদ্য অনুযায়ী f(a) = 0 হলে কী বলা যায়?",
        options: ["(x−a) একটি উৎপাদক", "(x+a) একটি উৎপাদক", "a একটি সহগ", "f(x) ধ্রুবক"],
        correctAnswer: "(x−a) একটি উৎপাদক",
        explanation:
          "অবশিষ্ট উপপাদ্য অনুযায়ী (x−a) দিয়ে ভাগে অবশিষ্ট f(a); f(a)=0 হলে ভাগশেষ শূন্য, তাই (x−a) উৎপাদক।",
        difficulty: "MEDIUM",
      },
    ],
  },
  {
    topicName: "উপবৃত্ত ও অধিবৃত্ত",
    code: "HIGHER_MATH",
    paper: "SECOND",
    questions: [
      {
        text: "উপবৃত্তের উৎকেন্দ্রিকতা e এর মান কোন সীমায়?",
        options: ["0 < e < 1", "e = 1", "e > 1", "e = 0"],
        correctAnswer: "0 < e < 1",
        explanation:
          "বৃত্তে e = 0, উপবৃত্তে 0 < e < 1, পরাবৃত্তে e = 1, অধিবৃত্তে e > 1।",
        difficulty: "EASY",
      },
      {
        text: "উপবৃত্তের যেকোনো বিন্দু থেকে দুই ফোকাসের দূরত্বের যোগফল কত?",
        options: ["2a (ধ্রুবক)", "2b", "a + b", "পরিবর্তনশীল"],
        correctAnswer: "2a (ধ্রুবক)",
        explanation:
          "PS₁ + PS₂ = 2a — এই ধর্ম থেকেই দড়ি ও দুই পিন দিয়ে উপবৃত্ত আঁকার কৌশল আসে। (অধিবৃত্তে পার্থক্য ধ্রুব।)",
        difficulty: "MEDIUM",
      },
      {
        text: "অধিবৃত্ত x²/a² − y²/b² = 1 এর অসীমতট কোনটি?",
        options: ["y = ±(b/a)x", "y = ±(a/b)x", "y = ±ax", "x = ±by"],
        correctAnswer: "y = ±(b/a)x",
        explanation:
          "অধিবৃত্তের দুটি অসীমতট y = ±(b/a)x; বক্ররেখা এদের যত কাছে ইচ্ছা আসে কিন্তু কখনো স্পর্শ করে না।",
        difficulty: "HARD",
      },
    ],
  },
  {
    topicName: "বিপরীত ত্রিকোণমিতিক ফাংশন",
    code: "HIGHER_MATH",
    paper: "SECOND",
    questions: [
      {
        text: "sin⁻¹x + cos⁻¹x এর মান কত?",
        options: ["π/2", "π", "0", "1"],
        correctAnswer: "π/2",
        explanation: "এটি একটি প্রমাণ অভেদ; একইভাবে tan⁻¹x + cot⁻¹x = π/2।",
        difficulty: "MEDIUM",
      },
      {
        text: "sin⁻¹x এর মুখ্য মানের রেঞ্জ কোনটি?",
        options: ["[−π/2, π/2]", "[0, π]", "(−π/2, π/2)", "[0, 2π]"],
        correctAnswer: "[−π/2, π/2]",
        explanation:
          "ফাংশন হতে হলে একটিমাত্র আউটপুট দরকার, তাই ডোমেন সীমিত করে মুখ্য মান নেওয়া হয়। cos⁻¹x এর রেঞ্জ [0, π]।",
        difficulty: "MEDIUM",
      },
      {
        text: "d/dx(tan⁻¹x) কত?",
        options: ["1/(1+x²)", "1/√(1−x²)", "−1/(1+x²)", "1/x"],
        correctAnswer: "1/(1+x²)",
        explanation:
          "d/dx(tan⁻¹x) = 1/(1+x²); আর d/dx(sin⁻¹x) = 1/√(1−x²)।",
        difficulty: "MEDIUM",
      },
    ],
  },
  {
    topicName: "ঘর্ষণ ও সাম্যাবস্থা",
    code: "HIGHER_MATH",
    paper: "SECOND",
    questions: [
      {
        text: "ল্যামির উপপাদ্য কয়টি বলের ক্ষেত্রে প্রযোজ্য?",
        options: ["তিনটি", "দুটি", "চারটি", "যেকোনো সংখ্যক"],
        correctAnswer: "তিনটি",
        explanation:
          "ল্যামির উপপাদ্য: তিনটি বল সাম্যাবস্থায় থাকলে P/sinα = Q/sinβ = R/sinγ।",
        difficulty: "EASY",
      },
      {
        text: "সাম্যাবস্থার শর্ত কোনগুলো?",
        options: [
          "ΣF = 0 এবং Στ = 0",
          "শুধু ΣF = 0",
          "শুধু Στ = 0",
          "ΣF = ধ্রুবক",
        ],
        correctAnswer: "ΣF = 0 এবং Στ = 0",
        explanation:
          "শুধু বলের লব্ধি শূন্য হলে বস্তু স্থির থাকলেও ঘুরতে পারে; তাই টর্কের সমষ্টিও শূন্য হতে হবে।",
        difficulty: "MEDIUM",
      },
      {
        text: "ঘর্ষণ কোণ λ ও ঘর্ষণ গুণাঙ্ক μ এর সম্পর্ক কোনটি?",
        options: ["tanλ = μ", "sinλ = μ", "cosλ = μ", "λ = μ"],
        correctAnswer: "tanλ = μ",
        explanation: "ঘর্ষণ কোণ λ এর ক্ষেত্রে tanλ = μ, এবং নতি কোণও এর সমান।",
        difficulty: "MEDIUM",
      },
    ],
  },
  {
    topicName: "গড় ব্যবধান ও পরিমিত ব্যবধান",
    code: "HIGHER_MATH",
    paper: "SECOND",
    questions: [
      {
        text: "গড় ব্যবধানে পরম মান নেওয়া হয় কেন?",
        options: [
          "নইলে বিচ্যুতির যোগফল শূন্য হয়ে যায়",
          "গণনা সহজ হয়",
          "ফল বড় হয়",
          "নিয়ম তাই",
        ],
        correctAnswer: "নইলে বিচ্যুতির যোগফল শূন্য হয়ে যায়",
        explanation:
          "Σ(xᵢ − x̄) সবসময় ঠিক শূন্য হয় — ধনাত্মক ও ঋণাত্মক বিচ্যুতি পরস্পরকে বাতিল করে, তাই পরম মান নিতেই হয়।",
        difficulty: "MEDIUM",
      },
      {
        text: "ভেদাঙ্ক (variance) কী?",
        options: [
          "পরিমিত ব্যবধানের বর্গ",
          "পরিমিত ব্যবধানের বর্গমূল",
          "গড় ব্যবধানের দ্বিগুণ",
          "পরিসরের অর্ধেক",
        ],
        correctAnswer: "পরিমিত ব্যবধানের বর্গ",
        explanation: "ভেদাঙ্ক = σ², আর পরিমিত ব্যবধান = σ।",
        difficulty: "EASY",
      },
      {
        text: "প্রতিটি মানের সাথে একটি ধ্রুবক যোগ করলে পরিমিত ব্যবধানের কী হয়?",
        options: ["অপরিবর্তিত থাকে", "ধ্রুবক পরিমাণ বাড়ে", "দ্বিগুণ হয়", "শূন্য হয়"],
        correctAnswer: "অপরিবর্তিত থাকে",
        explanation:
          "ধ্রুবক যোগে সব মান একই পরিমাণ সরে যায়, কিন্তু তাদের পারস্পরিক বিস্তার বদলায় না — তাই σ অপরিবর্তিত।",
        difficulty: "HARD",
      },
    ],
  },

  // ==================== বাংলা ২য় পত্র ====================
  {
    topicName: "ভাষা ও বাংলা ভাষা",
    code: "BANGLA",
    paper: "SECOND",
    questions: [
      {
        text: "বাংলা ভাষার প্রাচীনতম নিদর্শন কোনটি?",
        options: ["চর্যাপদ", "শ্রীকৃষ্ণকীর্তন", "মঙ্গলকাব্য", "বৈষ্ণব পদাবলি"],
        correctAnswer: "চর্যাপদ",
        explanation:
          "চর্যাপদ বাংলা ভাষার প্রাচীনতম নিদর্শন; হরপ্রসাদ শাস্ত্রী ১৯০৭ সালে নেপালের রাজদরবার থেকে এটি আবিষ্কার করেন।",
        difficulty: "EASY",
      },
      {
        text: "ভাষার মূল উপকরণগুলোর সঠিক ক্রম কোনটি?",
        options: [
          "ধ্বনি → বর্ণ → শব্দ → পদ → বাক্য",
          "বর্ণ → ধ্বনি → শব্দ → বাক্য → পদ",
          "শব্দ → ধ্বনি → বর্ণ → পদ → বাক্য",
          "পদ → শব্দ → বর্ণ → ধ্বনি → বাক্য",
        ],
        correctAnswer: "ধ্বনি → বর্ণ → শব্দ → পদ → বাক্য",
        explanation:
          "ধ্বনি ভাষার ক্ষুদ্রতম একক; তার লিখিত রূপ বর্ণ, অর্থবোধক ধ্বনিসমষ্টি শব্দ, বাক্যে ব্যবহৃত শব্দ পদ।",
        difficulty: "MEDIUM",
      },
      {
        text: "এক রচনায় সাধু ও চলিত ভাষা মেশানোকে কী বলে?",
        options: ["গুরুচণ্ডালী দোষ", "বাহুল্য দোষ", "উপমা দোষ", "শব্দদোষ"],
        correctAnswer: "গুরুচণ্ডালী দোষ",
        explanation:
          "সাধু ও চলিত রীতি একই রচনায় মেশালে গুরুচণ্ডালী দোষ হয়; একটি রচনায় যেকোনো একটি রীতি অনুসরণ করতে হয়।",
        difficulty: "MEDIUM",
      },
    ],
  },
  {
    topicName: "ভাবসম্প্রসারণ",
    code: "BANGLA",
    paper: "SECOND",
    questions: [
      {
        text: "ভাবসম্প্রসারণ সাধারণত কয়টি অনুচ্ছেদে লেখা হয়?",
        options: ["তিনটি", "একটি", "পাঁচটি", "সাতটি"],
        correctAnswer: "তিনটি",
        explanation:
          "মূলভাব, সম্প্রসারিত ভাব ও মন্তব্য — এই তিনটি অনুচ্ছেদে ভাবসম্প্রসারণ লেখা হয়।",
        difficulty: "EASY",
      },
      {
        text: "ভাবসম্প্রসারণে প্রদত্ত বাক্যটি কীভাবে ব্যবহার করতে হয়?",
        options: [
          "হুবহু উদ্ধৃত না করে ব্যাখ্যা করতে হয়",
          "হুবহু লিখে দিতে হয়",
          "বাদ দিতে হয়",
          "শেষে লিখতে হয়",
        ],
        correctAnswer: "হুবহু উদ্ধৃত না করে ব্যাখ্যা করতে হয়",
        explanation:
          "মূল বাক্য হুবহু লিখে দিলে নম্বর কাটা যায়; নিজের ভাষায় ভাব ব্যাখ্যা করতে হয়।",
        difficulty: "MEDIUM",
      },
      {
        text: "\"পরিশ্রম সৌভাগ্যের প্রসূতি\" — এখানে \"প্রসূতি\" শব্দের অর্থ কী?",
        options: ["জন্মদাত্রী", "ধ্বংসকারী", "সহযোগী", "প্রতিবন্ধক"],
        correctAnswer: "জন্মদাত্রী",
        explanation:
          "\"প্রসূতি\" অর্থ জন্মদাত্রী মা; অর্থাৎ পরিশ্রমই সৌভাগ্যের জননী।",
        difficulty: "MEDIUM",
      },
    ],
  },
];

async function main() {
  console.log("🔍 বাকি MCQ-শূন্য টপিকে প্রশ্ন যোগ করা হচ্ছে...\n");

  const subjects = await prisma.subject.findMany({
    select: { id: true, name: true, code: true, paper: true },
  });
  const key = (c: SubjectCode, p: PaperNumber) => `${c}:${p}`;
  const byKey = new Map(subjects.map((s) => [key(s.code, s.paper), s]));

  let added = 0;
  let skipped = 0;
  const notFound: string[] = [];

  for (const entry of seedData) {
    const subject = byKey.get(key(entry.code, entry.paper));
    if (!subject) {
      notFound.push(`${entry.topicName} (সাবজেক্ট নেই: ${entry.code}/${entry.paper})`);
      continue;
    }

    const topic = await prisma.topic.findFirst({
      where: { name: entry.topicName, chapter: { subjectId: subject.id } },
      select: { id: true },
    });

    if (!topic) {
      notFound.push(`${entry.topicName} (${subject.name})`);
      continue;
    }

    const existing = await prisma.question.findMany({
      where: { topicId: topic.id },
      select: { text: true },
    });
    const existingTexts = new Set(existing.map((q) => q.text));

    const fresh = entry.questions.filter((q) => !existingTexts.has(q.text));
    skipped += entry.questions.length - fresh.length;

    if (fresh.length > 0) {
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
    }

    console.log(
      `✅ [${subject.name}] ${entry.topicName} — ${fresh.length} টা নতুন` +
        (fresh.length < entry.questions.length
          ? ` (${entry.questions.length - fresh.length} টা আগেই ছিল)`
          : "")
    );
  }

  if (notFound.length > 0) {
    console.log(`\n⚠️  পাওয়া যায়নি: ${notFound.join(", ")}`);
  }

  console.log(`\n📊 ফলাফল: নতুন ${added} · ডুপ্লিকেট বাদ ${skipped}`);

  // ---------- সামগ্রিক যাচাই ----------
  const allTopics = await prisma.topic.findMany({
    select: {
      name: true,
      _count: { select: { questions: true } },
      chapter: { select: { subject: { select: { name: true } } } },
    },
  });
  const empty = allTopics.filter((t) => t._count.questions === 0);

  console.log(`\n🎯 সামগ্রিক: MCQ-শূন্য টপিক ${empty.length}/${allTopics.length}`);
  for (const e of empty) {
    console.log(`   • [${e.chapter.subject.name}] ${e.name}`);
  }

  const totalQ = await prisma.question.count();
  console.log(`   DB তে মোট MCQ: ${totalQ}`);
}

main()
  .catch((e) => {
    console.error("❌ সমস্যা হয়েছে:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
