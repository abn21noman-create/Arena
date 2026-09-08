// ===================================================================
// AI Flashcard Generation — কেন্দ্রীভূত হেল্পার
// -------------------------------------------------------------------
// আগে এই লজিক শুধু `app/api/flashcard-decks/generate-ai/route.ts` এ
// ছিল (ম্যানুয়াল টেক্সট পেস্ট করে ফ্ল্যাশকার্ড বানানোর জন্য)। এখন
// "নোট → ফ্ল্যাশকার্ড" ফিচারেও (Topic Note থেকে সরাসরি) একই লজিক
// লাগবে, তাই DRY রাখতে এখানে বের করে আনা হলো — দুটো endpoint একই
// prompt/parsing ব্যবহার করে, ভবিষ্যতে prompt টিউনিং একবারই করতে হবে।
// ===================================================================
import { getAIResponse } from "@/lib/ai-provider";

export interface GeneratedFlashcard {
  front: string;
  back: string;
}

export interface FlashcardGenResult {
  cards: GeneratedFlashcard[];
  provider: string;
}

const FLASHCARD_GEN_PROMPT = `তুমি একজন HSC শিক্ষক যিনি স্টাডি নোট থেকে ফ্ল্যাশকার্ড বানাও।
নিচের নোট পড়ে ৫ থেকে ৮টা ফ্ল্যাশকার্ড (প্রশ্ন-উত্তর জোড়া) তৈরি করো, যা মুখস্থ করার
জন্য উপযোগী (active recall স্টাইলে)।

নিয়মাবলী:
- শুধুমাত্র একটা valid JSON array রিটার্ন করবে, অন্য কোনো টেক্সট/ব্যাখ্যা লিখবে না
- ফরম্যাট: [{"front": "প্রশ্ন", "back": "সংক্ষিপ্ত সঠিক উত্তর"}, ...]
- প্রশ্ন ছোট ও স্পষ্ট হবে, উত্তর সংক্ষিপ্ত কিন্তু সম্পূর্ণ হবে
- বাংলায় লিখবে (ইংরেজি টার্ম দরকার হলে রাখতে পারো)`;

/** ন্যূনতম কতটুকু টেক্সট দিলে অর্থবহ ফ্ল্যাশকার্ড তৈরি করা সম্ভব (দুই জায়গায় একই থ্রেশহোল্ড) */
export const MIN_TEXT_LENGTH_FOR_GENERATION = 30;

/**
 * যেকোনো টেক্সট (পেস্ট করা নোট বা Topic Note) থেকে AI দিয়ে ৫-৮টা
 * front/back ফ্ল্যাশকার্ড জেনারেট করে। ব্যর্থ হলে/খালি হলে exception
 * throw করে (caller নিজের error message/status কোড ঠিক করে নেবে)।
 */
export async function generateFlashcardsFromText(
  rawText: string
): Promise<FlashcardGenResult> {
  const aiResult = await getAIResponse([
    { role: "system", content: FLASHCARD_GEN_PROMPT },
    { role: "user", content: rawText.trim().slice(0, 4000) },
  ]);

  // AI এর রেসপন্স থেকে JSON অংশ বের করা হচ্ছে (মাঝে মাঝে ```json ব্লক দিয়ে মুড়ে দেয়)
  const jsonMatch = aiResult.content.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error("AI থেকে সঠিক ফরম্যাটে উত্তর পাওয়া যায়নি, আবার চেষ্টা করো");
  }

  const rawCards: { front?: string; back?: string }[] = JSON.parse(jsonMatch[0]);
  const validCards: GeneratedFlashcard[] = rawCards
    .filter((c) => c.front?.trim() && c.back?.trim())
    .map((c) => ({ front: c.front!.trim(), back: c.back!.trim() }));

  if (validCards.length === 0) {
    throw new Error("কোনো ভ্যালিড ফ্ল্যাশকার্ড তৈরি হয়নি");
  }

  return { cards: validCards, provider: aiResult.provider };
}
