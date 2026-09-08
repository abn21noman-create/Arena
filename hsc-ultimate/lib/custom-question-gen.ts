// ===================================================================
// Custom Question Generation — বইয়ের পাতার ছবি থেকে AI দিয়ে MCQ/CQ তৈরি
// -------------------------------------------------------------------
// পাইপলাইন: ছবি → OCR (বিদ্যমান getVisionResponse, ocr-extract endpoint
// এর সিস্টেম প্রম্পট পুনর্ব্যবহার করে) → এক্সট্র্যাক্ট করা টেক্সট থেকে AI
// দিয়ে ৫-১০টা MCQ অথবা ২-৩টা CQ প্রশ্ন জেনারেট → DB তে সংরক্ষণ।
//
// দুই ধাপে ভাগ করা হয়েছে (OCR ফ্ল্যাশকার্ড ফিচারের মতোই): ধাপ ১ (এই ফাইলের
// generateQuestionsFromImage) ছবি → প্রশ্ন সরাসরি এক কলে করে, কারণ প্রশ্ন
// জেনারেশনে (ফ্ল্যাশকার্ডের বিপরীতে) মাঝপথে টেক্সট রিভিউয়ের প্রয়োজন কম —
// ভুল হলে পুরো সেট আবার জেনারেট করাই সহজ।
//
// ✨ ফিচার আপগ্রেড (ব্যবহারকারীর অনুরোধ — Live Exam এর ছবি-আপলোড ফ্লো আরও
// স্মার্ট করা): আগে এই মডিউল সবসময় "generate" মোডে চলত — ধরে নিত ছবিতে
// শুধু পড়ার কনটেন্ট (প্যারাগ্রাফ/নোট) আছে এবং সবসময় নতুন প্রশ্ন বানাতো।
// কিন্তু ছাত্ররা প্রায়ই ইতিমধ্যে তৈরি করা MCQ/CQ (বইয়ের প্রশ্নমালা,
// শিক্ষকের হাতে লেখা প্রশ্নপত্র, প্রশ্নব্যাংকের পাতা) এর ছবি তুলেও আপলোড
// করতে চায় — সেক্ষেত্রে AI এর উচিত নতুন প্রশ্ন *বানানো* না, বরং ছবিতে
// থাকা প্রশ্নগুলো হুবহু *বের করে আনা* (Kahoot এর "AI generator" এর দুই
// মোড — "generate from topic/content" বনাম "extract questions from PDF"
// থেকে অনুপ্রাণিত, established Deep Research এ যাচাই করা)।
//
// ফিক্স: MCQ_GEN_PROMPT/CQ_GEN_PROMPT কে upgrade করে একটাই প্রম্পটে AI কে
// প্রথমে নিজে থেকে detect করতে বলা হচ্ছে extractedText এ ইতিমধ্যে তৈরি
// প্রশ্ন (option/ক-খ-গ-ঘ প্যাটার্ন) আছে কিনা — থাকলে EXTRACT মোড (হুবহু
// প্রশ্ন/অপশন তুলে আনা, শুধু বানান/ফরম্যাট ঠিক করা, নতুন প্রশ্ন না বানানো),
// না থাকলে GENERATE মোড (established আগের আচরণ, কনটেন্ট থেকে নতুন প্রশ্ন
// বানানো) — কোনো নতুন API/UI পরিবর্তন লাগেনি, existing questionType
// (MCQ/CQ) selection অপরিবর্তিত থাকে, শুধু generation logic-টা স্মার্ট
// হয়েছে। এক ছবিতে দুই ধরনের প্রশ্নই মিশ্রিত থাকলে (কিছু already MCQ,
// কিছু প্লেইন টেক্সট) AI প্রতিটা প্রশ্ন আলাদাভাবে handle করে — already
// থাকা প্রশ্ন extract করে, বাকি কনটেন্ট থেকে নতুন প্রশ্ন generate করে।
// ===================================================================
import { prisma } from "@/lib/prisma";
import { getVisionResponse, getAIResponse, type ChatMessage } from "@/lib/ai-provider";

export const MAX_MCQ_COUNT = 10;
export const MAX_CQ_COUNT = 3;

const OCR_SYSTEM_PROMPT = `তুমি একজন OCR (Optical Character Recognition) বিশেষজ্ঞ।
ছবিতে থাকা সব লেখা (হাতের লেখা বা ছাপার অক্ষর, বাংলা বা ইংরেজি) হুবহু বের করে দাও।

নিয়মাবলী:
- শুধু ছবিতে যা লেখা আছে তা-ই লিখবে, নিজের থেকে কিছু যোগ করবে না বা ব্যাখ্যা করবে না
- বানান/ব্যাকরণ ভুল থাকলেও যেভাবে লেখা আছে সেভাবেই তুলবে (অনুমান করে ঠিক করবে না)
- অনুচ্ছেদ/লাইন ব্রেক যথাসম্ভব বজায় রাখবে
- গাণিতিক সূত্র/সমীকরণ থাকলে টেক্সট আকারে স্পষ্টভাবে লিখবে (যেমন: F = ma)
- যদি কোনো উত্তর গোল করে চিহ্নিত করা (circled), টিক দেওয়া, বোল্ড করা, অথবা
  উত্তরমালা/answer key আকারে আলাদাভাবে দেওয়া থাকে, সেটাও স্পষ্টভাবে উল্লেখ
  করবে (যেমন: "উত্তর: (গ)" বা "সঠিক উত্তর গোল করা: খ")
- কোনো ভূমিকা/উপসংহার লিখবে না — শুধু raw extracted text দেবে`;

// LaTeX নির্দেশনা (Deep Research এ চিহ্নিত future TODO পূরণ) — components/
// shared/math-text.tsx "$...$" (inline) ও "$$...$$" (block) সিনট্যাক্স
// দিয়ে সূত্র সুন্দরভাবে রেন্ডার করে (KaTeX)। AI কে এই সিনট্যাক্সেই
// গাণিতিক রাশি/সূত্র লিখতে বলা হচ্ছে, যাতে ইউনিকোড সুপারস্ক্রিপ্ট
// (যেমন x², ⁻¹) এর বদলে জটিল সমীকরণ (ভগ্নাংশ, ইন্টিগ্রাল ইত্যাদি)
// ঠিকভাবে রেন্ডার হয়।
const LATEX_INSTRUCTION = `গাণিতিক রাশি/সূত্র থাকলে LaTeX সিনট্যাক্স ব্যবহার করবে ("$...$" ইনলাইনের জন্য, "$$...$$" ব্লক ফরমুলার জন্য) — যেমন "$x^2 + 5x + 6 = 0$" অথবা "$$F = ma$$", ইউনিকোড সুপারস্ক্রিপ্ট (x², F⁻¹) ব্যবহার করবে না`;

const MCQ_GEN_PROMPT = `তুমি একজন HSC শিক্ষক যিনি ছবি থেকে বের করা টেক্সট নিয়ে কাজ করো।

প্রথমে ঠিক করো টেক্সটটা কোন ধরনের:
(A) **ইতিমধ্যে তৈরি করা MCQ প্রশ্ন** — টেক্সটে যদি প্রশ্নের সাথে ৪টা অপশন
    (যেমন "ক) ... খ) ... গ) ... ঘ)", "(i) (ii) (iii) (iv)", "A) B) C) D)"
    ইত্যাদি প্যাটার্নে) দেখতে পাও, তাহলে এটা EXTRACT মোড।
(B) **সাধারণ পড়ার কনটেন্ট** (প্যারাগ্রাফ, নোট, সংজ্ঞা, তথ্য) — কোনো
    readymade প্রশ্ন-অপশন প্যাটার্ন নেই, তাহলে এটা GENERATE মোড।

টেক্সটে দুই ধরনের অংশ মিশ্রিত থাকতে পারে — প্রতিটা অংশ আলাদাভাবে বিচার করবে।

**EXTRACT মোডে যা করবে**:
- ইতিমধ্যে থাকা প্রশ্ন ও ৪টা অপশন **হুবহু** তুলে আনবে (নতুন প্রশ্ন বানাবে
  না, শুধু বানান/টাইপো সংশোধন করতে পারো যদি স্পষ্ট ভুল থাকে)
- সঠিক উত্তর নির্ধারণ: যদি ছবিতে উত্তর চিহ্নিত/circled/bold/answer-key
  আকারে দেওয়া থাকে সেটাই ব্যবহার করবে; না থাকলে তোমার নিজের HSC-স্তরের
  বিষয়জ্ঞান দিয়ে সবচেয়ে সম্ভাব্য সঠিক উত্তর নির্ধারণ করবে
- ছবিতে যতগুলো MCQ থাকুক সবগুলো তুলে আনার চেষ্টা করবে (সর্বোচ্চ ${MAX_MCQ_COUNT}টা পর্যন্ত)

**GENERATE মোডে যা করবে** (established আচরণ):
- টেক্সট পড়ে ৫ থেকে ১০টা নতুন MCQ তৈরি করো যা এই কন্টেন্টের গুরুত্বপূর্ণ
  বিষয়গুলো কভার করে

নিয়মাবলী (উভয় মোডেই প্রযোজ্য):
- শুধুমাত্র একটা valid JSON array রিটার্ন করবে, অন্য কোনো টেক্সট লিখবে না
- ফরম্যাট: [{"text": "প্রশ্ন", "options": ["ক এর মান", "খ এর মান", "গ এর মান", "ঘ এর মান"], "correctAnswer": "ক এর মান"}, ...]
- correctAnswer অবশ্যই options এর একটার হুবহু মিলতে হবে (exact string match)
- প্রতিটা প্রশ্নে ঠিক ৪টা option থাকবে, একটাই সঠিক উত্তর
- প্রশ্ন স্পষ্ট ও নির্ভুল হবে, টেক্সটে যা আছে তার বাইরে যাবে না (GENERATE মোডে)
- বাংলায় লিখবে (ইংরেজি টার্ম দরকার হলে রাখতে পারো)
- ${LATEX_INSTRUCTION}`;

const CQ_GEN_PROMPT = `তুমি একজন HSC শিক্ষক যিনি ছবি থেকে বের করা টেক্সট নিয়ে কাজ করো।

প্রথমে ঠিক করো টেক্সটটা কোন ধরনের:
(A) **ইতিমধ্যে তৈরি করা CQ (সৃজনশীল প্রশ্ন)** — টেক্সটে যদি একটা উদ্দীপক
    (stimulus/passage) এর সাথে "ক)", "খ)", "গ)", "ঘ)" চারটা সাব-প্রশ্ন
    (জ্ঞানমূলক/অনুধাবনমূলক/প্রয়োগ/উচ্চতর দক্ষতা প্যাটার্নে) দেখতে পাও,
    তাহলে এটা EXTRACT মোড।
(B) **সাধারণ পড়ার কনটেন্ট** (প্যারাগ্রাফ, নোট, সংজ্ঞা) — কোনো readymade
    উদ্দীপক+ক-খ-গ-ঘ প্যাটার্ন নেই, তাহলে এটা GENERATE মোড।

**EXTRACT মোডে যা করবে**:
- ইতিমধ্যে থাকা উদ্দীপক ও ক/খ/গ/ঘ প্রশ্ন **হুবহু** তুলে আনবে (নতুন
  উদ্দীপক/প্রশ্ন বানাবে না, শুধু বানান/টাইপো সংশোধন করতে পারো)
- মডেল উত্তর: যদি ছবিতে উত্তর/সমাধান দেওয়া থাকে সেটা ব্যবহার করে সংক্ষিপ্ত
  মডেল উত্তর বানাবে; না থাকলে তোমার নিজের HSC-স্তরের বিষয়জ্ঞান দিয়ে
  প্রতিটা প্রশ্নের সংক্ষিপ্ত মডেল উত্তর তৈরি করবে
- ছবিতে যতগুলো CQ থাকুক সবগুলো তুলে আনার চেষ্টা করবে (সর্বোচ্চ ${MAX_CQ_COUNT}টা পর্যন্ত)

**GENERATE মোডে যা করবে** (established আচরণ):
- টেক্সট পড়ে ২ থেকে ৩টা নতুন CQ তৈরি করো, প্রতিটাতে উদ্দীপক + ৪টা ধাপ
  থাকবে (ক-জ্ঞানমূলক, খ-অনুধাবনমূলক, গ-প্রয়োগ, ঘ-উচ্চতর দক্ষতা) —
  বাংলাদেশ বোর্ড ফরম্যাট অনুযায়ী, উদ্দীপক টেক্সটের প্রাসঙ্গিক বিষয়ের
  উপর ভিত্তি করে বাস্তবসম্মত একটা দৃশ্য/উদাহরণ হবে

নিয়মাবলী (উভয় মোডেই প্রযোজ্য):
- শুধুমাত্র একটা valid JSON array রিটার্ন করবে, অন্য কোনো টেক্সট লিখবে না
- ফরম্যাট: [{"stimulus": "উদ্দীপক", "questionA": "ক প্রশ্ন", "questionB": "খ প্রশ্ন", "questionC": "গ প্রশ্ন", "questionD": "ঘ প্রশ্ন", "modelAnswerA": "সংক্ষিপ্ত মডেল উত্তর", "modelAnswerB": "...", "modelAnswerC": "...", "modelAnswerD": "..."}, ...]
- ক প্রশ্ন সংজ্ঞা/তথ্যভিত্তিক (১ নম্বর), খ ব্যাখ্যামূলক (২ নম্বর), গ প্রয়োগমূলক (৩ নম্বর), ঘ বিশ্লেষণমূলক (৪ নম্বর)
- বাংলায় লিখবে
- ${LATEX_INSTRUCTION}`;

interface GeneratedMcq {
  text: string;
  options: string[];
  correctAnswer: string;
}

interface GeneratedCq {
  stimulus: string;
  questionA: string;
  questionB: string;
  questionC: string;
  questionD: string;
  modelAnswerA: string;
  modelAnswerB: string;
  modelAnswerC: string;
  modelAnswerD: string;
}

/** ছবি থেকে OCR দিয়ে টেক্সট বের করে (ব্যর্থ হলে throw করে) */
async function extractTextFromImage(imageUrl: string): Promise<string> {
  const visionMessages: ChatMessage[] = [
    { role: "system", content: OCR_SYSTEM_PROMPT },
    {
      role: "user",
      content: [
        { type: "text", text: "এই ছবি থেকে সব লেখা বের করে দাও।" },
        { type: "image_url", image_url: { url: imageUrl } },
      ],
    },
  ];

  const result = await getVisionResponse(visionMessages);
  const text = result.content.trim();

  if (!text || text.length < 10) {
    throw new Error("ছবি থেকে কোনো টেক্সট বের করা যায়নি, স্পষ্ট ছবি দিয়ে আবার চেষ্টা করো");
  }

  return text;
}

/** JSON array বের করে AI রেসপন্স থেকে (মাঝে মাঝে ```json ব্লক দিয়ে মোড়া থাকে) */
function extractJsonArray<T>(content: string): T[] {
  const match = content.match(/\[[\s\S]*\]/);
  if (!match) throw new Error("AI থেকে সঠিক ফরম্যাটে উত্তর পাওয়া যায়নি");
  return JSON.parse(match[0]) as T[];
}

/**
 * ব্যাকগ্রাউন্ডে ছবি প্রসেস করে প্রশ্ন সেট জেনারেট করে (fire-and-forget প্যাটার্ন,
 * PDF Chat এর processUploadedPdf() এর মতো — status PROCESSING→READY/FAILED)
 */
export async function processImageToQuestions(
  setId: string,
  imageUrl: string,
  questionType: "MCQ" | "CQ"
): Promise<void> {
  try {
    const extractedText = await extractTextFromImage(imageUrl);

    if (questionType === "MCQ") {
      // ১০টা পর্যন্ত MCQ (প্রতিটায় ৪টা option) বাংলা UTF-8 টেক্সটে ডিফল্ট
      // ১০২৪ টোকেনে আটবে না — JSON মাঝপথে কেটে গিয়ে parse এরর হচ্ছিল
      // (লাইভ টেস্টে ধরা পড়েছে), তাই maxTokens বাড়িয়ে ২৫৬০ করা হলো
      const aiResult = await getAIResponse(
        [
          { role: "system", content: MCQ_GEN_PROMPT },
          { role: "user", content: extractedText.slice(0, 4000) },
        ],
        2560
      );
      const questions = extractJsonArray<GeneratedMcq>(aiResult.content).filter(
        (q) => q.text?.trim() && Array.isArray(q.options) && q.options.length === 4 && q.correctAnswer?.trim()
      );

      if (questions.length === 0) {
        throw new Error("কোনো ভ্যালিড MCQ তৈরি হয়নি, স্পষ্ট ছবি দিয়ে আবার চেষ্টা করো");
      }

      const limited = questions.slice(0, MAX_MCQ_COUNT);
      await prisma.customQuestion.createMany({
        data: limited.map((q, idx) => ({
          setId,
          text: q.text.trim(),
          options: q.options,
          correctAnswer: q.correctAnswer.trim(),
          order: idx,
        })),
      });
    } else {
      // CQ তে stimulus+৪টা প্রশ্ন+৪টা মডেল উত্তর প্রতিটা প্রশ্নে থাকে (MCQ থেকে
      // ভারী), তাই আরও বেশি টোকেন দরকার
      const aiResult = await getAIResponse(
        [
          { role: "system", content: CQ_GEN_PROMPT },
          { role: "user", content: extractedText.slice(0, 4000) },
        ],
        3000
      );
      const questions = extractJsonArray<GeneratedCq>(aiResult.content).filter(
        (q) => q.stimulus?.trim() && q.questionA?.trim() && q.questionB?.trim() && q.questionC?.trim() && q.questionD?.trim()
      );

      if (questions.length === 0) {
        throw new Error("কোনো ভ্যালিড CQ তৈরি হয়নি, স্পষ্ট ছবি দিয়ে আবার চেষ্টা করো");
      }

      const limited = questions.slice(0, MAX_CQ_COUNT);
      await prisma.customQuestion.createMany({
        data: limited.map((q, idx) => ({
          setId,
          stimulus: q.stimulus.trim(),
          questionA: q.questionA.trim(),
          questionB: q.questionB.trim(),
          questionC: q.questionC.trim(),
          questionD: q.questionD.trim(),
          modelAnswerA: q.modelAnswerA?.trim() || null,
          modelAnswerB: q.modelAnswerB?.trim() || null,
          modelAnswerC: q.modelAnswerC?.trim() || null,
          modelAnswerD: q.modelAnswerD?.trim() || null,
          order: idx,
        })),
      });
    }

    await prisma.customQuestionSet.update({
      where: { id: setId },
      data: { status: "READY" },
    });
  } catch (err) {
    console.error("Custom Question Generation এরর:", err);
    const message = err instanceof Error ? err.message : "প্রশ্ন তৈরি করতে সমস্যা হয়েছে";
    await prisma.customQuestionSet
      .update({ where: { id: setId }, data: { status: "FAILED", errorMessage: message } })
      .catch(() => {});
  }
}
