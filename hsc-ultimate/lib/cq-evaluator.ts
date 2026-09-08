// ===================================================================
// CQ (সৃজনশীল প্রশ্ন) Answer Evaluation — AI দিয়ে
// -------------------------------------------------------------------
// ইউজারের লেখা ক/খ/গ/ঘ উত্তর AI কে দিয়ে model answer এর সাথে তুলনা করে
// নম্বর ও ফিডব্যাক জেনারেট করানো হয়। বোর্ড মার্কিং স্কিম অনুযায়ী:
// ক = ১, খ = ২, গ = ৩, ঘ = ৪ (মোট ১০)
// ===================================================================
import { getAIResponse } from "@/lib/ai-provider";

export interface CQEvaluationInput {
  stimulus: string;
  questionA: string;
  questionB: string;
  questionC: string;
  questionD: string;
  modelAnswerA?: string | null;
  modelAnswerB?: string | null;
  modelAnswerC?: string | null;
  modelAnswerD?: string | null;
  answerA: string;
  answerB: string;
  answerC: string;
  answerD: string;
}

export interface CQEvaluationResult {
  scoreA: number; // 0-1
  scoreB: number; // 0-2
  scoreC: number; // 0-3
  scoreD: number; // 0-4
  totalScore: number; // 0-10
  feedback: string;
  provider: string;
}

const EVALUATOR_SYSTEM_PROMPT = `তুমি একজন অভিজ্ঞ HSC পরীক্ষক যিনি সৃজনশীল প্রশ্নের (CQ) উত্তর
মূল্যায়ন করো বাংলাদেশ শিক্ষা বোর্ডের মার্কিং স্কিম অনুযায়ী।

মার্কিং নিয়ম:
- ক (জ্ঞানমূলক): সর্বোচ্চ ১ নম্বর — সংজ্ঞা/তথ্য সঠিক থাকলে পূর্ণ নম্বর
- খ (অনুধাবনমূলক): সর্বোচ্চ ২ নম্বর — ব্যাখ্যার স্পষ্টতা ও সঠিকতা দেখে নম্বর দাও
- গ (প্রয়োগ): সর্বোচ্চ ৩ নম্বর — সঠিক পদ্ধতি প্রয়োগ ও সঠিক উত্তরে পূর্ণ নম্বর, আংশিক
  সঠিক হলে আংশিক নম্বর
- ঘ (উচ্চতর দক্ষতা): সর্বোচ্চ ৪ নম্বর — বিশ্লেষণ, যুক্তি, গভীরতা দেখে নম্বর দাও

তুমি অবশ্যই শুধুমাত্র একটা valid JSON object রিটার্ন করবে, অন্য কোনো টেক্সট লিখবে না।
ফরম্যাট:
{
  "scoreA": <0-1 এর মধ্যে integer>,
  "scoreB": <0-2 এর মধ্যে integer>,
  "scoreC": <0-3 এর মধ্যে integer>,
  "scoreD": <0-4 এর মধ্যে integer>,
  "feedback": "<বাংলায় সামগ্রিক ফিডব্যাক, ২-৪ বাক্যে — কী ভালো হয়েছে, কী উন্নতি দরকার>"
}

ন্যায্য ও উৎসাহব্যঞ্জক হও, কিন্তু নম্বর দেওয়ার ক্ষেত্রে honest থাকো।`;

export async function evaluateCQAnswer(
  input: CQEvaluationInput
): Promise<CQEvaluationResult> {
  const userPrompt = `উদ্দীপক: ${input.stimulus}

প্রশ্ন ক: ${input.questionA}
${input.modelAnswerA ? `মডেল উত্তর: ${input.modelAnswerA}` : ""}
শিক্ষার্থীর উত্তর: ${input.answerA || "(উত্তর দেওয়া হয়নি)"}

প্রশ্ন খ: ${input.questionB}
${input.modelAnswerB ? `মডেল উত্তর: ${input.modelAnswerB}` : ""}
শিক্ষার্থীর উত্তর: ${input.answerB || "(উত্তর দেওয়া হয়নি)"}

প্রশ্ন গ: ${input.questionC}
${input.modelAnswerC ? `মডেল উত্তর: ${input.modelAnswerC}` : ""}
শিক্ষার্থীর উত্তর: ${input.answerC || "(উত্তর দেওয়া হয়নি)"}

প্রশ্ন ঘ: ${input.questionD}
${input.modelAnswerD ? `মডেল উত্তর: ${input.modelAnswerD}` : ""}
শিক্ষার্থীর উত্তর: ${input.answerD || "(উত্তর দেওয়া হয়নি)"}

উপরের প্রতিটা উত্তর মূল্যায়ন করে JSON ফরম্যাটে নম্বর ও ফিডব্যাক দাও।`;

  const result = await getAIResponse([
    { role: "system", content: EVALUATOR_SYSTEM_PROMPT },
    { role: "user", content: userPrompt },
  ]);

  const jsonMatch = result.content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("AI থেকে সঠিক ফরম্যাটে মূল্যায়ন পাওয়া যায়নি");
  }

  const parsed = JSON.parse(jsonMatch[0]);

  // স্কোর গুলো সীমার মধ্যে আছে কিনা নিশ্চিত করা হচ্ছে (AI ভুল করলেও ক্ল্যাম্প করে দেওয়া)
  const scoreA = clamp(Math.round(parsed.scoreA ?? 0), 0, 1);
  const scoreB = clamp(Math.round(parsed.scoreB ?? 0), 0, 2);
  const scoreC = clamp(Math.round(parsed.scoreC ?? 0), 0, 3);
  const scoreD = clamp(Math.round(parsed.scoreD ?? 0), 0, 4);

  return {
    scoreA,
    scoreB,
    scoreC,
    scoreD,
    totalScore: scoreA + scoreB + scoreC + scoreD,
    feedback: parsed.feedback ?? "ফিডব্যাক পাওয়া যায়নি",
    provider: result.provider,
  };
}

function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.min(Math.max(value, min), max);
}
