// ===================================================================
// AI দিয়ে ব্যক্তিগত ভুল-ব্যাখ্যা (Explain My Mistake)
// -------------------------------------------------------------------
// Deep Research (web_search): Duolingo এর ২০২৬ সালের "Explain My
// Answer" ফিচার থেকে অনুপ্রাণিত — আগে static/generic grammar
// feedback ছিল, এখন AI দিয়ে প্রতিটা ইউজারের নির্দিষ্ট ভুল উত্তর
// analyze করে personalized ব্যাখ্যা দেওয়া হয় ("কেন তুমি এই ভুলটা
// করলে" ধরনের insight, শুধু "সঠিক উত্তর এইটা" বলার বদলে)।
//
// আমাদের প্ল্যাটফর্মে Question.explanation একটা static, সবার জন্য
// একই টেক্সট (admin-written) — এটা "সঠিক ধারণা" ব্যাখ্যা করে কিন্তু
// ইউজার *কেন* ভুল উত্তরটা বেছে নিয়েছিল তা address করে না। এই ফিচার
// AI কে ইউজারের নির্দিষ্ট ভুল উত্তর + সঠিক উত্তর + বিদ্যমান static
// explanation একসাথে দিয়ে একটা targeted, personalized ব্যাখ্যা
// জেনারেট করায় — কেন এই ভুল উত্তরটা ভুল, সাধারণত কোন misconception
// এর কারণে এই ভুল হয়, এবং সঠিক ধারণা কীভাবে মনে রাখতে হবে।
//
// ডিজাইন সিদ্ধান্ত (schema-free, on-demand):
// - কোনো নতুন DB কলাম/মডেল লাগেনি — ব্যাখ্যা প্রতিবার on-demand
//   জেনারেট হয় (cache করা হয়নি, কারণ প্রতিটা ইউজারের ভুল উত্তর ভিন্ন
//   হতে পারে এবং এই ফিচার ব্যবহারের ফ্রিকোয়েন্সি কম — প্রতিটা ভুল
//   MCQ এর জন্য একবারই সাধারণত ক্লিক করা হবে)
// - শুধুমাত্র ভুল উত্তরের জন্যই প্রযোজ্য (isCorrect=false), সঠিক
//   উত্তরে "ব্যাখ্যা বুঝি" বাটন দেখানোর দরকার নেই
// - বিদ্যমান multi-provider AI fallback chain পুনর্ব্যবহার
//   (lib/ai-provider.ts এর getAIResponse(), কোনো নতুন provider/cost
//   কাঠামো লাগেনি)
// ===================================================================
import { getAIResponse } from "@/lib/ai-provider";

export interface MistakeExplainerInput {
  questionText: string;
  options: string[] | null;
  correctAnswer: string;
  userAnswer: string;
  existingExplanation: string | null;
}

const MISTAKE_EXPLAINER_SYSTEM_PROMPT = `তুমি "HSC Ultimate" প্ল্যাটফর্মের একজন সহানুভূতিশীল AI শিক্ষক।
একজন HSC Science শিক্ষার্থী একটা MCQ প্রশ্নে ভুল উত্তর দিয়েছে। তোমার কাজ:
১. সংক্ষেপে ব্যাখ্যা করো কেন তার দেওয়া উত্তরটা ভুল (তার নির্দিষ্ট ভুল
   উত্তর ধরে, শুধু সাধারণভাবে সঠিক উত্তর কেন সঠিক তা না)
২. এই ধরনের ভুল সাধারণত কোন misconception/ভুল ধারণার কারণে হয় তা
   সংক্ষেপে বলো
৩. সঠিক ধারণাটা মনে রাখার একটা সহজ টিপস দাও

উত্তর অবশ্যই বাংলায়, সংক্ষিপ্ত (৩-৪ বাক্যের মধ্যে), বন্ধুত্বপূর্ণ ও
motivating টোনে হতে হবে (ছাত্রকে হতাশ না করে)। কোনো markdown/heading
ব্যবহার না করে সরল প্যারাগ্রাফ আকারে লিখবে।`;

/**
 * একটা নির্দিষ্ট ভুল MCQ উত্তরের জন্য AI দিয়ে personalized ব্যাখ্যা
 * জেনারেট করে।
 */
export async function explainMistake(input: MistakeExplainerInput): Promise<{
  explanation: string;
  provider: string;
}> {
  const optionsText = input.options ? input.options.join(", ") : "N/A";

  const userPrompt = `প্রশ্ন: ${input.questionText}
অপশনসমূহ: ${optionsText}
সঠিক উত্তর: ${input.correctAnswer}
শিক্ষার্থীর দেওয়া (ভুল) উত্তর: ${input.userAnswer}
${input.existingExplanation ? `বিদ্যমান ব্যাখ্যা (রেফারেন্সের জন্য): ${input.existingExplanation}` : ""}

উপরের নির্দেশনা অনুযায়ী শিক্ষার্থীর এই নির্দিষ্ট ভুলটা ব্যাখ্যা করো।`;

  const result = await getAIResponse([
    { role: "system", content: MISTAKE_EXPLAINER_SYSTEM_PROMPT },
    { role: "user", content: userPrompt },
  ]);

  return { explanation: result.content.trim(), provider: result.provider };
}
