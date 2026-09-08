// ===================================================================
// Database Seed Script
// -------------------------------------------------------------------
// NCTB HSC Science Group সিলেবাস অনুযায়ী Subject → Chapter → Topic
// ডেটা তৈরি করে। প্রতিটা Subject একটা মাত্র nested `create` কুয়েরি দিয়ে
// (Chapter ও Topic সহ) তৈরি করা হয় — এতে নেটওয়ার্ক round-trip অনেক কম
// লাগে (cloud DB তে লেটেন্সি কমানোর জন্য গুরুত্বপূর্ণ)।
//
// রান করার নিয়ম: pnpm db:seed
// ===================================================================
import { PrismaClient, SubjectCode, PaperNumber } from "@prisma/client";

import { assertDestructiveSeedAllowed } from "./seed-safety";
const prisma = new PrismaClient();

interface TopicSeed {
  name: string;
  nameEn: string;
  isImportant?: boolean;
}

interface ChapterSeed {
  name: string;
  nameEn: string;
  topics: TopicSeed[];
}

interface SubjectSeed {
  code: SubjectCode;
  paper: PaperNumber;
  name: string;
  nameEn: string;
  colorHex: string;
  order: number;
  chapters: ChapterSeed[];
}

const subjectsData: SubjectSeed[] = [
  // ------------------------- পদার্থবিজ্ঞান ১ম পত্র -------------------------
  {
    code: "PHYSICS",
    paper: "FIRST",
    name: "পদার্থবিজ্ঞান ১ম পত্র",
    nameEn: "Physics 1st Paper",
    colorHex: "#3b82f6",
    order: 1,
    chapters: [
      {
        name: "ভৌতজগৎ ও পরিমাপ",
        nameEn: "Physical World and Measurement",
        topics: [
          { name: "ভৌতজগৎ ও পদার্থবিজ্ঞান", nameEn: "Physical World and Physics" },
          { name: "একক ও পরিমাপ", nameEn: "Units and Measurement", isImportant: true },
          { name: "মাত্রা বিশ্লেষণ", nameEn: "Dimensional Analysis" },
        ],
      },
      {
        name: "ভেক্টর",
        nameEn: "Vector",
        topics: [
          { name: "স্কেলার ও ভেক্টর রাশি", nameEn: "Scalar and Vector Quantities" },
          { name: "ভেক্টরের যোগ ও বিয়োগ", nameEn: "Addition and Subtraction of Vectors", isImportant: true },
          { name: "ভেক্টরের গুণন", nameEn: "Product of Vectors" },
        ],
      },
      {
        name: "গতিবিদ্যা",
        nameEn: "Dynamics",
        topics: [
          { name: "সরলরৈখিক গতি", nameEn: "Linear Motion", isImportant: true },
          { name: "দ্বিমাত্রিক গতি", nameEn: "Two-dimensional Motion" },
          { name: "প্রক্ষেপক গতি", nameEn: "Projectile Motion", isImportant: true },
        ],
      },
      {
        name: "নিউটনিয়ান বলবিদ্যা",
        nameEn: "Newtonian Mechanics",
        topics: [
          { name: "নিউটনের গতিসূত্র", nameEn: "Newton's Laws of Motion", isImportant: true },
          { name: "ভরবেগ সংরক্ষণ সূত্র", nameEn: "Conservation of Momentum" },
          { name: "ঘর্ষণ", nameEn: "Friction" },
        ],
      },
      {
        name: "কাজ, শক্তি ও ক্ষমতা",
        nameEn: "Work, Energy and Power",
        topics: [
          { name: "কাজের ধারণা", nameEn: "Concept of Work" },
          { name: "শক্তি ও শক্তির নিত্যতা", nameEn: "Energy and Conservation of Energy", isImportant: true },
          { name: "ক্ষমতা", nameEn: "Power" },
        ],
      },
      {
        name: "মহাকর্ষ ও অভিকর্ষ",
        nameEn: "Gravitation and Gravity",
        topics: [
          { name: "নিউটনের মহাকর্ষ সূত্র", nameEn: "Newton's Law of Gravitation", isImportant: true },
          { name: "অভিকর্ষজ ত্বরণ", nameEn: "Acceleration due to Gravity" },
          { name: "কৃত্রিম উপগ্রহ", nameEn: "Artificial Satellites" },
        ],
      },
      {
        name: "পদার্থের গাঠনিক ধর্ম",
        nameEn: "Structural Properties of Matter",
        topics: [
          { name: "স্থিতিস্থাপকতা", nameEn: "Elasticity", isImportant: true },
          { name: "পৃষ্ঠটান", nameEn: "Surface Tension" },
          { name: "সান্দ্রতা", nameEn: "Viscosity" },
        ],
      },
      {
        name: "পর্যায়বৃত্ত গতি",
        nameEn: "Periodic Motion",
        topics: [
          { name: "সরল ছন্দিত স্পন্দন গতি", nameEn: "Simple Harmonic Motion", isImportant: true },
          { name: "সরল দোলক", nameEn: "Simple Pendulum" },
        ],
      },
      {
        name: "তরঙ্গ",
        nameEn: "Waves",
        topics: [
          { name: "তরঙ্গের প্রকারভেদ", nameEn: "Types of Waves" },
          { name: "শব্দ তরঙ্গ", nameEn: "Sound Waves", isImportant: true },
          { name: "ডপলার ক্রিয়া", nameEn: "Doppler Effect" },
        ],
      },
      {
        name: "আদর্শ গ্যাস ও গ্যাসের গতিতত্ত্ব",
        nameEn: "Ideal Gas and Kinetic Theory of Gases",
        topics: [
          { name: "গ্যাসের সূত্রাবলি", nameEn: "Gas Laws" },
          { name: "গ্যাসের গতিতত্ত্ব", nameEn: "Kinetic Theory of Gases", isImportant: true },
        ],
      },
    ],
  },

  // ------------------------- পদার্থবিজ্ঞান ২য় পত্র -------------------------
  {
    code: "PHYSICS",
    paper: "SECOND",
    name: "পদার্থবিজ্ঞান ২য় পত্র",
    nameEn: "Physics 2nd Paper",
    colorHex: "#2563eb",
    order: 2,
    chapters: [
      {
        name: "তাপগতিবিদ্যা",
        nameEn: "Thermodynamics",
        topics: [
          { name: "তাপগতিবিদ্যার সূত্রাবলি", nameEn: "Laws of Thermodynamics", isImportant: true },
          { name: "তাপ ইঞ্জিন", nameEn: "Heat Engine" },
        ],
      },
      {
        name: "স্থির তড়িৎ",
        nameEn: "Static Electricity",
        topics: [
          { name: "কুলম্বের সূত্র", nameEn: "Coulomb's Law", isImportant: true },
          { name: "তড়িৎ ক্ষেত্র ও বিভব", nameEn: "Electric Field and Potential" },
        ],
      },
      {
        name: "চল তড়িৎ",
        nameEn: "Current Electricity",
        topics: [
          { name: "ওহমের সূত্র", nameEn: "Ohm's Law", isImportant: true },
          { name: "কির্শফের সূত্র", nameEn: "Kirchhoff's Law" },
          { name: "হুইটস্টোন ব্রিজ", nameEn: "Wheatstone Bridge" },
        ],
      },
      {
        name: "তড়িৎ প্রবাহের চৌম্বক ক্রিয়া ও চুম্বকত্ব",
        nameEn: "Magnetic Effect of Electric Current and Magnetism",
        topics: [
          { name: "বিদ্যুৎ প্রবাহের চৌম্বক ক্রিয়া", nameEn: "Magnetic Effect of Current", isImportant: true },
          { name: "চৌম্বক পদার্থের শ্রেণিবিভাগ", nameEn: "Classification of Magnetic Materials" },
        ],
      },
      {
        name: "তড়িৎ চৌম্বক আবেশ ও পরিবর্তী প্রবাহ",
        nameEn: "Electromagnetic Induction and Alternating Current",
        topics: [
          { name: "ফ্যারাডের সূত্র", nameEn: "Faraday's Law", isImportant: true },
          { name: "ট্রান্সফরমার", nameEn: "Transformer" },
        ],
      },
      {
        name: "জ্যামিতিক আলোকবিজ্ঞান",
        nameEn: "Geometrical Optics",
        topics: [
          { name: "লেন্স ও দর্পণ", nameEn: "Lens and Mirror", isImportant: true },
          { name: "আলোর প্রতিসরণ", nameEn: "Refraction of Light" },
        ],
      },
      {
        name: "ভৌত আলোকবিজ্ঞান",
        nameEn: "Physical Optics",
        topics: [
          { name: "আলোর ব্যতিচার", nameEn: "Interference of Light" },
          { name: "আলোর অপবর্তন", nameEn: "Diffraction of Light" },
        ],
      },
      {
        name: "আধুনিক পদার্থবিজ্ঞানের সূচনা",
        nameEn: "Introduction to Modern Physics",
        topics: [
          { name: "আপেক্ষিক তত্ত্ব", nameEn: "Theory of Relativity" },
          { name: "ফোটন", nameEn: "Photon" },
        ],
      },
      {
        name: "পরমাণু মডেল ও নিউক্লিয় পদার্থবিজ্ঞান",
        nameEn: "Atom Model and Nuclear Physics",
        topics: [
          { name: "বোর পরমাণু মডেল", nameEn: "Bohr Atom Model", isImportant: true },
          { name: "তেজস্ক্রিয়তা", nameEn: "Radioactivity" },
        ],
      },
      {
        name: "সেমিকন্ডাক্টর ও ইলেকট্রনিক্স",
        nameEn: "Semiconductor and Electronics",
        topics: [
          { name: "অর্ধপরিবাহী", nameEn: "Semiconductor", isImportant: true },
          { name: "ডায়োড ও ট্রানজিস্টর", nameEn: "Diode and Transistor" },
        ],
      },
      {
        name: "জ্যোতির্বিজ্ঞান",
        nameEn: "Astronomy",
        topics: [
          { name: "সৌরজগৎ", nameEn: "Solar System" },
          { name: "নক্ষত্র ও গ্যালাক্সি", nameEn: "Stars and Galaxy" },
        ],
      },
    ],
  },

  // ------------------------- রসায়ন ১ম পত্র -------------------------
  {
    code: "CHEMISTRY",
    paper: "FIRST",
    name: "রসায়ন ১ম পত্র",
    nameEn: "Chemistry 1st Paper",
    colorHex: "#10b981",
    order: 3,
    chapters: [
      {
        name: "গুণগত রসায়ন",
        nameEn: "Qualitative Chemistry",
        topics: [
          { name: "রসায়নের ধারণা", nameEn: "Concept of Chemistry" },
          { name: "রাসায়নিক পরিবর্তন", nameEn: "Chemical Change", isImportant: true },
        ],
      },
      {
        name: "মৌলের পর্যায়বৃত্তীয় ধর্ম ও রাসায়নিক বন্ধন",
        nameEn: "Periodicity of Elements and Chemical Bonding",
        topics: [
          { name: "পর্যায় সারণি", nameEn: "Periodic Table", isImportant: true },
          { name: "আয়নিক ও সমযোজী বন্ধন", nameEn: "Ionic and Covalent Bond", isImportant: true },
        ],
      },
      {
        name: "রাসায়নিক পরিবর্তন",
        nameEn: "Chemical Change",
        topics: [
          { name: "রাসায়নিক বিক্রিয়ার হার", nameEn: "Rate of Chemical Reaction", isImportant: true },
          { name: "রাসায়নিক সাম্যাবস্থা", nameEn: "Chemical Equilibrium" },
          { name: "তড়িৎ রসায়ন", nameEn: "Electrochemistry" },
        ],
      },
      {
        name: "কর্মমুখী রসায়ন",
        nameEn: "Action-oriented Chemistry",
        topics: [
          { name: "জীবন রক্ষাকারী রসায়ন", nameEn: "Life-saving Chemistry" },
          { name: "শিল্পে রসায়ন", nameEn: "Chemistry in Industry" },
        ],
      },
      {
        name: "রসায়ন গবেষণাগারে নিরাপদ অবস্থান",
        nameEn: "Safe Use of Laboratory",
        topics: [
          { name: "গবেষণাগারের নিরাপত্তা", nameEn: "Laboratory Safety" },
          { name: "রাসায়নিক পদার্থের গুণগত মান", nameEn: "Quality of Chemical Substances" },
        ],
      },
    ],
  },

  // ------------------------- রসায়ন ২য় পত্র -------------------------
  {
    code: "CHEMISTRY",
    paper: "SECOND",
    name: "রসায়ন ২য় পত্র",
    nameEn: "Chemistry 2nd Paper",
    colorHex: "#059669",
    order: 4,
    chapters: [
      {
        name: "পরিবেশ রসায়ন",
        nameEn: "Environmental Chemistry",
        topics: [
          { name: "বায়ুমণ্ডল ও পরিবেশ দূষণ", nameEn: "Atmosphere and Environmental Pollution", isImportant: true },
          { name: "গ্রিনহাউস প্রভাব", nameEn: "Greenhouse Effect" },
        ],
      },
      {
        name: "জৈব রসায়ন",
        nameEn: "Organic Chemistry",
        topics: [
          { name: "হাইড্রোকার্বন", nameEn: "Hydrocarbon", isImportant: true },
          { name: "অ্যালকোহল ও কার্বক্সিলিক এসিড", nameEn: "Alcohol and Carboxylic Acid", isImportant: true },
          { name: "IUPAC নামকরণ", nameEn: "IUPAC Nomenclature" },
        ],
      },
      {
        name: "পরিমাণগত রসায়ন",
        nameEn: "Quantitative Chemistry",
        topics: [
          { name: "মোল ধারণা", nameEn: "Mole Concept", isImportant: true },
          { name: "স্টয়কিওমিতি", nameEn: "Stoichiometry" },
        ],
      },
      {
        name: "তড়িৎ রসায়ন",
        nameEn: "Electrochemistry",
        topics: [
          { name: "জারণ-বিজারণ", nameEn: "Oxidation-Reduction", isImportant: true },
          { name: "তড়িৎ বিশ্লেষণ", nameEn: "Electrolysis" },
        ],
      },
      {
        name: "অর্থনৈতিক রসায়ন",
        nameEn: "Economic Chemistry",
        topics: [
          { name: "খনিজ সম্পদ", nameEn: "Mineral Resources" },
          { name: "সার ও কীটনাশক", nameEn: "Fertilizer and Pesticide" },
        ],
      },
    ],
  },

  // ------------------------- জীববিজ্ঞান ১ম পত্র -------------------------
  {
    code: "BIOLOGY",
    paper: "FIRST",
    name: "জীববিজ্ঞান ১ম পত্র",
    nameEn: "Biology 1st Paper",
    colorHex: "#ec4899",
    order: 5,
    chapters: [
      {
        name: "কোষ ও এর গঠন",
        nameEn: "Cell and Its Structure",
        topics: [
          { name: "কোষের সংজ্ঞা ও প্রকারভেদ", nameEn: "Definition and Types of Cell", isImportant: true },
          { name: "কোষ অঙ্গাণু", nameEn: "Cell Organelles" },
        ],
      },
      {
        name: "কোষ বিভাজন",
        nameEn: "Cell Division",
        topics: [
          { name: "মাইটোসিস", nameEn: "Mitosis", isImportant: true },
          { name: "মিয়োসিস", nameEn: "Meiosis", isImportant: true },
        ],
      },
      {
        name: "কোষ রসায়ন",
        nameEn: "Cell Chemistry",
        topics: [
          { name: "কার্বোহাইড্রেট ও প্রোটিন", nameEn: "Carbohydrate and Protein" },
          { name: "এনজাইম", nameEn: "Enzyme", isImportant: true },
        ],
      },
      {
        name: "অণুজীব",
        nameEn: "Microorganisms",
        topics: [
          { name: "ভাইরাস", nameEn: "Virus", isImportant: true },
          { name: "ব্যাকটেরিয়া", nameEn: "Bacteria" },
        ],
      },
      {
        name: "শৈবাল ও ছত্রাক",
        nameEn: "Algae and Fungi",
        topics: [
          { name: "শৈবালের বৈশিষ্ট্য", nameEn: "Characteristics of Algae" },
          { name: "ছত্রাকের প্রজনন", nameEn: "Reproduction of Fungi" },
        ],
      },
      {
        name: "ব্রায়োফাইটা ও টেরিডোফাইটা",
        nameEn: "Bryophyta and Pteridophyta",
        topics: [
          { name: "ব্রায়োফাইটার বৈশিষ্ট্য", nameEn: "Characteristics of Bryophyta" },
          { name: "টেরিডোফাইটার জনুক্রম", nameEn: "Alternation of Generation in Pteridophyta" },
        ],
      },
      {
        name: "নগ্নবীজী ও আবৃতবীজী উদ্ভিদ",
        nameEn: "Gymnosperm and Angiosperm",
        topics: [
          { name: "নগ্নবীজী উদ্ভিদের বৈশিষ্ট্য", nameEn: "Characteristics of Gymnosperm" },
          { name: "শ্রেণিবিন্যাস", nameEn: "Classification", isImportant: true },
        ],
      },
      {
        name: "টিস্যু ও টিস্যুতন্ত্র",
        nameEn: "Tissue and Tissue System",
        topics: [
          { name: "ভাজক টিস্যু", nameEn: "Meristematic Tissue" },
          { name: "স্থায়ী টিস্যু", nameEn: "Permanent Tissue", isImportant: true },
        ],
      },
      {
        name: "উদ্ভিদ শারীরতত্ত্ব",
        nameEn: "Plant Physiology",
        topics: [
          { name: "সালোকসংশ্লেষণ", nameEn: "Photosynthesis", isImportant: true },
          { name: "শ্বসন", nameEn: "Respiration", isImportant: true },
        ],
      },
      {
        name: "উদ্ভিদ প্রজনন",
        nameEn: "Plant Reproduction",
        topics: [
          { name: "যৌন প্রজনন", nameEn: "Sexual Reproduction" },
          { name: "পরাগায়ন ও নিষেক", nameEn: "Pollination and Fertilization" },
        ],
      },
      {
        name: "জীবপ্রযুক্তি",
        nameEn: "Biotechnology",
        topics: [
          { name: "জিন প্রকৌশল", nameEn: "Genetic Engineering", isImportant: true },
          { name: "ক্লোনিং", nameEn: "Cloning" },
        ],
      },
      {
        name: "জীবের পরিবেশ, বিস্তার ও সংরক্ষণ",
        nameEn: "Environment, Distribution and Conservation",
        topics: [
          { name: "বাস্তুতন্ত্র", nameEn: "Ecosystem", isImportant: true },
          { name: "জীববৈচিত্র্য সংরক্ষণ", nameEn: "Biodiversity Conservation" },
        ],
      },
    ],
  },

  // ------------------------- জীববিজ্ঞান ২য় পত্র -------------------------
  {
    code: "BIOLOGY",
    paper: "SECOND",
    name: "জীববিজ্ঞান ২য় পত্র",
    nameEn: "Biology 2nd Paper",
    colorHex: "#db2777",
    order: 6,
    chapters: [
      {
        name: "প্রাণীর বিভিন্নতা ও শ্রেণিবিন্যাস",
        nameEn: "Animal Diversity and Classification",
        topics: [
          { name: "শ্রেণিবিন্যাসের নীতি", nameEn: "Principles of Classification", isImportant: true },
          { name: "প্রাণিজগতের পর্ব", nameEn: "Animal Phyla" },
        ],
      },
      {
        name: "প্রাণীর পরিচিতি",
        nameEn: "Introduction to Animals",
        topics: [
          { name: "হাইড্রার গঠন", nameEn: "Structure of Hydra" },
          { name: "ঘাসফড়িং এর গঠন", nameEn: "Structure of Grasshopper" },
        ],
      },
      {
        name: "মানব শারীরতত্ত্ব: পরিপাক ও শোষণ",
        nameEn: "Human Physiology: Digestion and Absorption",
        topics: [
          { name: "পরিপাকতন্ত্র", nameEn: "Digestive System", isImportant: true },
          { name: "খাদ্য শোষণ প্রক্রিয়া", nameEn: "Food Absorption Process" },
        ],
      },
      {
        name: "মানব শারীরতত্ত্ব: রক্ত ও সংবহন",
        nameEn: "Human Physiology: Blood and Circulation",
        topics: [
          { name: "রক্তের উপাদান", nameEn: "Components of Blood", isImportant: true },
          { name: "হৃৎপিণ্ড ও রক্তসংবহন", nameEn: "Heart and Blood Circulation", isImportant: true },
        ],
      },
      {
        name: "মানব শারীরতত্ত্ব: শ্বসন ও শ্বাসক্রিয়া",
        nameEn: "Human Physiology: Respiration and Breathing",
        topics: [
          { name: "শ্বসনতন্ত্র", nameEn: "Respiratory System" },
          { name: "গ্যাসীয় বিনিময়", nameEn: "Gaseous Exchange" },
        ],
      },
      {
        name: "মানব শারীরতত্ত্ব: বর্জ্য ও নিষ্কাশন",
        nameEn: "Human Physiology: Excretion",
        topics: [
          { name: "বৃক্কের গঠন", nameEn: "Structure of Kidney", isImportant: true },
          { name: "মূত্র উৎপাদন প্রক্রিয়া", nameEn: "Urine Formation Process" },
        ],
      },
      {
        name: "মানব শারীরতত্ত্ব: চলন ও অঙ্গচালনা",
        nameEn: "Human Physiology: Locomotion and Movement",
        topics: [
          { name: "কঙ্কালতন্ত্র", nameEn: "Skeletal System" },
          { name: "পেশির গঠন", nameEn: "Structure of Muscle" },
        ],
      },
      {
        name: "মানব শারীরতত্ত্ব: সমন্বয় ও নিয়ন্ত্রণ",
        nameEn: "Human Physiology: Coordination and Control",
        topics: [
          { name: "স্নায়ুতন্ত্র", nameEn: "Nervous System", isImportant: true },
          { name: "হরমোন", nameEn: "Hormone", isImportant: true },
        ],
      },
      {
        name: "মানব জীবনের ধারাবাহিকতা",
        nameEn: "Continuity of Human Life",
        topics: [
          { name: "প্রজনন তন্ত্র", nameEn: "Reproductive System" },
          { name: "ভ্রূণের গঠন", nameEn: "Formation of Embryo" },
        ],
      },
      {
        name: "মানবদেহের প্রতিরক্ষা",
        nameEn: "Defense System of Human Body",
        topics: [
          { name: "রোগ প্রতিরোধ ব্যবস্থা", nameEn: "Immune System", isImportant: true },
          { name: "ভ্যাকসিন", nameEn: "Vaccine" },
        ],
      },
      {
        name: "জিনতত্ত্ব ও বিবর্তন",
        nameEn: "Genetics and Evolution",
        topics: [
          { name: "মেন্ডেলের সূত্র", nameEn: "Mendel's Law", isImportant: true },
          { name: "ডারউইনবাদ", nameEn: "Darwinism" },
        ],
      },
      {
        name: "প্রাণীর আচরণ",
        nameEn: "Animal Behavior",
        topics: [
          { name: "সহজাত আচরণ", nameEn: "Innate Behavior" },
          { name: "শিখন আচরণ", nameEn: "Learned Behavior" },
        ],
      },
    ],
  },

  // ------------------------- উচ্চতর গণিত ১ম পত্র -------------------------
  {
    code: "HIGHER_MATH",
    paper: "FIRST",
    name: "উচ্চতর গণিত ১ম পত্র",
    nameEn: "Higher Mathematics 1st Paper",
    colorHex: "#f59e0b",
    order: 7,
    chapters: [
      {
        name: "ম্যাট্রিক্স ও নির্ণায়ক",
        nameEn: "Matrix and Determinant",
        topics: [
          { name: "ম্যাট্রিক্সের প্রকারভেদ", nameEn: "Types of Matrix" },
          { name: "নির্ণায়কের মান নির্ণয়", nameEn: "Evaluation of Determinant", isImportant: true },
        ],
      },
      {
        name: "ভেক্টর",
        nameEn: "Vector",
        topics: [
          { name: "ভেক্টরের প্রাথমিক ধারণা", nameEn: "Basic Concept of Vector" },
          { name: "স্কেলার ও ভেক্টর গুণন", nameEn: "Scalar and Vector Product", isImportant: true },
        ],
      },
      {
        name: "সরলরেখা",
        nameEn: "Straight Line",
        topics: [
          { name: "সরলরেখার সমীকরণ", nameEn: "Equation of Straight Line", isImportant: true },
          { name: "দুই সরলরেখার মধ্যবর্তী কোণ", nameEn: "Angle Between Two Lines" },
        ],
      },
      {
        name: "বৃত্ত",
        nameEn: "Circle",
        topics: [
          { name: "বৃত্তের সমীকরণ", nameEn: "Equation of Circle", isImportant: true },
          { name: "স্পর্শক", nameEn: "Tangent" },
        ],
      },
      {
        name: "বিন্যাস ও সমাবেশ",
        nameEn: "Permutation and Combination",
        topics: [
          { name: "বিন্যাস", nameEn: "Permutation", isImportant: true },
          { name: "সমাবেশ", nameEn: "Combination", isImportant: true },
        ],
      },
      {
        name: "ত্রিকোণমিতিক অনুপাত",
        nameEn: "Trigonometric Ratio",
        topics: [
          { name: "ত্রিকোণমিতিক অনুপাতের ধারণা", nameEn: "Concept of Trigonometric Ratio" },
          { name: "ত্রিকোণমিতিক অভেদ", nameEn: "Trigonometric Identity", isImportant: true },
        ],
      },
      {
        name: "সংযুক্ত কোণের ত্রিকোণমিতিক অনুপাত",
        nameEn: "Trigonometric Ratio of Compound Angle",
        topics: [
          { name: "যোগ ও বিয়োগ সূত্র", nameEn: "Addition and Subtraction Formula", isImportant: true },
        ],
      },
      {
        name: "ফাংশন ও ফাংশনের লেখচিত্র",
        nameEn: "Function and Graph of Function",
        topics: [
          { name: "ফাংশনের প্রকারভেদ", nameEn: "Types of Function" },
          { name: "লেখচিত্র অঙ্কন", nameEn: "Drawing Graph" },
        ],
      },
      {
        name: "অন্তরীকরণ",
        nameEn: "Differentiation",
        topics: [
          { name: "অন্তরীকরণের সূত্রাবলি", nameEn: "Rules of Differentiation", isImportant: true },
          { name: "উচ্চতর ক্রমের অন্তরজ", nameEn: "Higher Order Derivative" },
        ],
      },
      {
        name: "যোগজীকরণ",
        nameEn: "Integration",
        topics: [
          { name: "যোগজীকরণের সূত্রাবলি", nameEn: "Rules of Integration", isImportant: true },
          { name: "নির্দিষ্ট যোগজ", nameEn: "Definite Integral" },
        ],
      },
    ],
  },

  // ------------------------- উচ্চতর গণিত ২য় পত্র -------------------------
  {
    code: "HIGHER_MATH",
    paper: "SECOND",
    name: "উচ্চতর গণিত ২য় পত্র",
    nameEn: "Higher Mathematics 2nd Paper",
    colorHex: "#d97706",
    order: 8,
    chapters: [
      {
        name: "বাস্তব সংখ্যা ও অসমতা",
        nameEn: "Real Numbers and Inequality",
        topics: [
          { name: "বাস্তব সংখ্যার ধর্ম", nameEn: "Properties of Real Numbers" },
          { name: "অসমতার সমাধান", nameEn: "Solution of Inequality", isImportant: true },
        ],
      },
      {
        name: "যোগাশ্রয়ী প্রোগ্রাম",
        nameEn: "Linear Programming",
        topics: [
          { name: "সীমাবদ্ধতা ও উদ্দেশ্য ফাংশন", nameEn: "Constraints and Objective Function", isImportant: true },
        ],
      },
      {
        name: "জটিল সংখ্যা",
        nameEn: "Complex Numbers",
        topics: [
          { name: "জটিল সংখ্যার বীজগণিত", nameEn: "Algebra of Complex Numbers", isImportant: true },
          { name: "জটিল সংখ্যার সূচকীয় রূপ", nameEn: "Exponential Form" },
        ],
      },
      {
        name: "বহুপদী ও বহুপদী সমীকরণ",
        nameEn: "Polynomial and Polynomial Equation",
        topics: [
          { name: "বহুপদীর ভাগশেষ উপপাদ্য", nameEn: "Remainder Theorem", isImportant: true },
          { name: "সমীকরণের মূল নির্ণয়", nameEn: "Finding Roots of Equation" },
        ],
      },
      {
        name: "দ্বিপদী বিস্তৃতি",
        nameEn: "Binomial Expansion",
        topics: [
          { name: "দ্বিপদী উপপাদ্য", nameEn: "Binomial Theorem", isImportant: true },
        ],
      },
      {
        name: "কণিক",
        nameEn: "Conic Section",
        topics: [
          { name: "পরাবৃত্ত", nameEn: "Parabola", isImportant: true },
          { name: "উপবৃত্ত ও অধিবৃত্ত", nameEn: "Ellipse and Hyperbola" },
        ],
      },
      {
        name: "বিপরীত ত্রিকোণমিতিক ফাংশন ও ত্রিকোণমিতিক সমীকরণ",
        nameEn: "Inverse Trigonometric Function and Trigonometric Equation",
        topics: [
          { name: "বিপরীত ত্রিকোণমিতিক ফাংশন", nameEn: "Inverse Trigonometric Function" },
          { name: "ত্রিকোণমিতিক সমীকরণের সমাধান", nameEn: "Solution of Trigonometric Equation", isImportant: true },
        ],
      },
      {
        name: "স্থিতিবিদ্যা",
        nameEn: "Statics",
        topics: [
          { name: "বলের লব্ধি", nameEn: "Resultant of Forces", isImportant: true },
          { name: "ঘর্ষণ ও সাম্যাবস্থা", nameEn: "Friction and Equilibrium" },
        ],
      },
      {
        name: "সমতলে বস্তুকণার গতি",
        nameEn: "Motion of Particle in a Plane",
        topics: [
          { name: "প্রক্ষেপক গতি", nameEn: "Projectile Motion", isImportant: true },
        ],
      },
      {
        name: "বিস্তার পরিমাপ ও সম্ভাবনা",
        nameEn: "Measures of Dispersion and Probability",
        topics: [
          { name: "গড় ব্যবধান ও পরিমিত ব্যবধান", nameEn: "Mean Deviation and Standard Deviation" },
          { name: "সম্ভাবনা তত্ত্ব", nameEn: "Probability Theory", isImportant: true },
        ],
      },
    ],
  },

  // ------------------------- বাংলা -------------------------
  {
    code: "BANGLA",
    paper: "FIRST",
    name: "বাংলা ১ম পত্র",
    nameEn: "Bangla 1st Paper",
    colorHex: "#8b5cf6",
    order: 9,
    chapters: [
      {
        name: "গদ্য",
        nameEn: "Prose",
        topics: [
          { name: "আমার পথ", nameEn: "Amar Poth" },
          { name: "অপরিচিতা", nameEn: "Aparichita", isImportant: true },
        ],
      },
      {
        name: "কবিতা",
        nameEn: "Poetry",
        topics: [
          { name: "সোনার তরী", nameEn: "Sonar Tori", isImportant: true },
          { name: "আঠারো বছর বয়স", nameEn: "Atharo Bochor Boyosh" },
        ],
      },
    ],
  },
  {
    code: "BANGLA",
    paper: "SECOND",
    name: "বাংলা ২য় পত্র",
    nameEn: "Bangla 2nd Paper",
    colorHex: "#7c3aed",
    order: 10,
    chapters: [
      {
        name: "ব্যাকরণ",
        nameEn: "Grammar",
        topics: [
          { name: "ভাষা ও বাংলা ভাষা", nameEn: "Language and Bangla Language" },
          { name: "সমাস", nameEn: "Compound Words (Samas)", isImportant: true },
        ],
      },
      {
        name: "নির্মিতি",
        nameEn: "Composition",
        topics: [
          { name: "ভাবসম্প্রসারণ", nameEn: "Elaboration of Meaning" },
          { name: "প্রবন্ধ রচনা", nameEn: "Essay Writing", isImportant: true },
        ],
      },
    ],
  },

  // ------------------------- English -------------------------
  {
    code: "ENGLISH",
    paper: "FIRST",
    name: "English 1st Paper",
    nameEn: "English 1st Paper",
    colorHex: "#06b6d4",
    order: 11,
    chapters: [
      {
        name: "Seen Comprehension",
        nameEn: "Seen Comprehension",
        topics: [
          { name: "Unseen Passage Reading", nameEn: "Unseen Passage Reading", isImportant: true },
          { name: "Cloze Test", nameEn: "Cloze Test" },
        ],
      },
      {
        name: "Writing Skills",
        nameEn: "Writing Skills",
        topics: [
          { name: "Paragraph Writing", nameEn: "Paragraph Writing", isImportant: true },
          { name: "CV & Cover Letter", nameEn: "CV & Cover Letter" },
        ],
      },
    ],
  },
  {
    code: "ENGLISH",
    paper: "SECOND",
    name: "English 2nd Paper",
    nameEn: "English 2nd Paper",
    colorHex: "#0891b2",
    order: 12,
    chapters: [
      {
        name: "Grammar",
        nameEn: "Grammar",
        topics: [
          { name: "Right Forms of Verbs", nameEn: "Right Forms of Verbs", isImportant: true },
          { name: "Preposition", nameEn: "Preposition", isImportant: true },
        ],
      },
      {
        name: "Composition",
        nameEn: "Composition",
        topics: [
          { name: "Essay Writing", nameEn: "Essay Writing" },
          { name: "Letter Writing", nameEn: "Letter Writing" },
        ],
      },
    ],
  },

  // ------------------------- ICT -------------------------
  {
    code: "ICT",
    paper: "NONE",
    name: "তথ্য ও যোগাযোগ প্রযুক্তি",
    nameEn: "Information and Communication Technology",
    colorHex: "#6366f1",
    order: 13,
    chapters: [
      {
        name: "তথ্য ও যোগাযোগ প্রযুক্তি: বিশ্ব ও বাংলাদেশ প্রেক্ষিত",
        nameEn: "ICT: World and Bangladesh Perspective",
        topics: [
          { name: "ICT এর ধারণা", nameEn: "Concept of ICT" },
          { name: "ন্যানো টেকনোলজি", nameEn: "Nanotechnology" },
        ],
      },
      {
        name: "কমিউনিকেশন সিস্টেমস ও নেটওয়ার্কিং",
        nameEn: "Communication Systems and Networking",
        topics: [
          { name: "নেটওয়ার্কের প্রকারভেদ", nameEn: "Types of Network", isImportant: true },
          { name: "ডেটা ট্রান্সমিশন", nameEn: "Data Transmission" },
        ],
      },
      {
        name: "সংখ্যা পদ্ধতি ও ডিজিটাল ডিভাইস",
        nameEn: "Number System and Digital Devices",
        topics: [
          { name: "বাইনারি, অক্টাল, হেক্সাডেসিমেল", nameEn: "Binary, Octal, Hexadecimal", isImportant: true },
          { name: "বুলিয়ান অ্যালজেবরা", nameEn: "Boolean Algebra", isImportant: true },
        ],
      },
      {
        name: "ওয়েব ডিজাইন ও HTML",
        nameEn: "Web Design and HTML",
        topics: [
          { name: "HTML ট্যাগ পরিচিতি", nameEn: "Introduction to HTML Tags", isImportant: true },
          { name: "CSS বেসিক", nameEn: "CSS Basics" },
        ],
      },
      {
        name: "প্রোগ্রামিং ভাষা",
        nameEn: "Programming Language",
        topics: [
          { name: "প্রোগ্রামিং এর ধারণা", nameEn: "Concept of Programming" },
          { name: "C প্রোগ্রামিং বেসিক", nameEn: "C Programming Basics", isImportant: true },
        ],
      },
      {
        name: "ডেটাবেজ ম্যানেজমেন্ট সিস্টেম",
        nameEn: "Database Management System",
        topics: [
          { name: "ডেটাবেজের ধারণা", nameEn: "Concept of Database" },
          { name: "SQL কুয়েরি", nameEn: "SQL Query", isImportant: true },
        ],
      },
    ],
  },
];

async function main() {
  assertDestructiveSeedAllowed("seed.ts");
  console.log("🌱 Seeding শুরু হচ্ছে (nested writes দিয়ে, কম round-trip এ)...\n");

  // আগের সব ডেটা মুছে ফেলা হচ্ছে (cascade delete এ chapter/topic ও মুছে যাবে)
  await prisma.subject.deleteMany({});

  for (const subj of subjectsData) {
    // একটাই nested create কুয়েরি — Subject + সব Chapter + সব Topic একসাথে তৈরি হবে
    const subject = await prisma.subject.create({
      data: {
        code: subj.code,
        paper: subj.paper,
        name: subj.name,
        nameEn: subj.nameEn,
        colorHex: subj.colorHex,
        order: subj.order,
        chapters: {
          create: subj.chapters.map((ch, ci) => ({
            name: ch.name,
            nameEn: ch.nameEn,
            order: ci + 1,
            topics: {
              create: ch.topics.map((t, ti) => ({
                name: t.name,
                nameEn: t.nameEn,
                order: ti + 1,
                isImportant: t.isImportant ?? false,
              })),
            },
          })),
        },
      },
    });

    console.log(`📘 ${subject.name} (${subj.chapters.length} chapters)`);
  }

  const subjectCount = await prisma.subject.count();
  const chapterCount = await prisma.chapter.count();
  const topicCount = await prisma.topic.count();

  console.log("\n✅ Seeding সম্পন্ন!");
  console.log(`   মোট Subject: ${subjectCount}`);
  console.log(`   মোট Chapter: ${chapterCount}`);
  console.log(`   মোট Topic: ${topicCount}`);
}

main()
  .catch((e) => {
    console.error("❌ Seeding এ সমস্যা হয়েছে:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
