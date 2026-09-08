// ===================================================================
// AI Content Moderation — Forum পোস্ট/রিপ্লাই এ automated spam/আপত্তিকর
// ভাষা সনাক্তকরণ (FEATURE_RESEARCH_V3.md Tier ২, আইটেম ৮)
// -------------------------------------------------------------------
// বর্তমান Content Report সিস্টেম সম্পূর্ণ manual-flag ভিত্তিক (ইউজার
// রিপোর্ট করলেই admin দেখতে পায়)। এই ফিচার বিদ্যমান multi-AI provider
// chain (lib/ai-provider.ts) ব্যবহার করে পোস্ট/রিপ্লাই তৈরির **আগেই**
// স্বয়ংক্রিয়ভাবে স্ক্যান করে — স্পষ্টভাবে spam/আপত্তিকর/হয়রানিমূলক কন্টেন্ট
// হলে সেটা তৈরি হওয়ার আগেই আটকে দেওয়া হয় (moderation burden কমানোর
// সবচেয়ে কার্যকর উপায় — খারাপ কন্টেন্ট কখনো পোস্টই হবে না)।
//
// ডিজাইন সিদ্ধান্ত: কোনো নতুন DB টেবিল/কলাম লাগেনি (fail-open pattern):
// - AI provider ব্যর্থ হলে (সব ৪টা down) কন্টেন্ট block করা হয় না —
//   moderation কখনো legitimate ব্যবহারকারীর পোস্ট করার সুযোগ কেড়ে
//   নেবে না শুধু AI outage এর কারণে
// - শুধু "high confidence" এ flag হলে block করা হয় — false positive
//   কমাতে (medium/low confidence এ সন্দেহজনক কিন্তু নিশ্চিত না এমন
//   কন্টেন্ট পাস হয়ে যায়, ইউজাররা তখনও manual report করতে পারবে)
// ===================================================================
import { getAIResponse } from "@/lib/ai-provider";

export type ModerationCategory = "SPAM" | "OFFENSIVE" | "HARASSMENT" | "CLEAN";
export type ModerationConfidence = "high" | "medium" | "low";

export interface ModerationResult {
  category: ModerationCategory;
  confidence: ModerationConfidence;
  reason: string; // বাংলায় সংক্ষিপ্ত কারণ (ইউজারকে দেখানোর জন্য)
  shouldBlock: boolean; // category !== CLEAN && confidence === "high"
  aiFailed: boolean; // AI provider সব ব্যর্থ হলে true (fail-open, block হয়নি)
}

const MODERATION_SYSTEM_PROMPT = `তুমি একটা বাংলাদেশী HSC শিক্ষার্থীদের একাডেমিক আলোচনা ফোরামের কন্টেন্ট
মডারেটর। ব্যবহারকারীর লেখা টেক্সট বিশ্লেষণ করে নিচের ৪টা ক্যাটাগরির একটায়
শ্রেণীবদ্ধ করো:
- "SPAM": অপ্রাসঙ্গিক বিজ্ঞাপন, বারবার একই টেক্সট, ভুয়া লিংক/প্রোডাক্ট প্রচার
- "OFFENSIVE": অশ্লীল/অশ্রাব্য ভাষা, গালিগালাজ
- "HARASSMENT": নির্দিষ্ট কাউকে ব্যক্তিগত আক্রমণ/হুমকি/হয়রানি
- "CLEAN": স্বাভাবিক একাডেমিক আলোচনা/প্রশ্ন (এমনকি ভুল উত্তর বা দুর্বল লেখাও
  CLEAN — শুধু প্রকৃতপক্ষে ক্ষতিকর কন্টেন্ট flag করবে)

গুরুত্বপূর্ণ: HSC পড়াশোনা সংক্রান্ত যেকোনো প্রশ্ন/আলোচনা (এমনকি কঠোর ভাষায়
হতাশা প্রকাশ করলেও, যেমন "আমি এই অধ্যায়ে খুব বাজে করছি") সবসময় CLEAN।
শুধু স্পষ্ট spam/গালি/হয়রানি থাকলেই অন্য ক্যাটাগরি দেবে। সন্দেহ হলে CLEAN
এবং confidence "low" দাও (false positive এড়াতে রক্ষণশীল থাকো)।

শুধু এই JSON ফরম্যাটে উত্তর দাও, অন্য কিছু লিখবে না:
{"category": "SPAM|OFFENSIVE|HARASSMENT|CLEAN", "confidence": "high|medium|low", "reason": "বাংলায় এক লাইনে সংক্ষিপ্ত ব্যাখ্যা"}`;

/**
 * একটা টেক্সট (forum post/reply এর title+content) AI দিয়ে moderate করে।
 * fail-open: AI ব্যর্থ হলে shouldBlock=false, aiFailed=true রিটার্ন করে —
 * কখনো exception throw করে না (moderation নিজে কখনো মূল flow ভাঙবে না)।
 */
export async function moderateText(text: string): Promise<ModerationResult> {
  const trimmed = text.trim();

  // খুব ছোট টেক্সট (যেমন "ok", "thanks") moderate করার দরকার নেই — AI
  // call বাঁচানো, পারফরম্যান্স অপ্টিমাইজেশন
  if (trimmed.length < 10) {
    return { category: "CLEAN", confidence: "high", reason: "", shouldBlock: false, aiFailed: false };
  }

  try {
    const result = await getAIResponse([
      { role: "system", content: MODERATION_SYSTEM_PROMPT },
      { role: "user", content: trimmed.slice(0, 3000) }, // খুব বড় টেক্সট ট্রাংকেট করা (টোকেন বাঁচাতে)
    ]);

    const jsonMatch = result.content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      // AI অপ্রত্যাশিত ফরম্যাটে উত্তর দিলে fail-open
      return { category: "CLEAN", confidence: "low", reason: "", shouldBlock: false, aiFailed: false };
    }

    const parsed = JSON.parse(jsonMatch[0]) as {
      category?: string;
      confidence?: string;
      reason?: string;
    };

    const category: ModerationCategory = ["SPAM", "OFFENSIVE", "HARASSMENT", "CLEAN"].includes(
      parsed.category ?? ""
    )
      ? (parsed.category as ModerationCategory)
      : "CLEAN";
    const confidence: ModerationConfidence = ["high", "medium", "low"].includes(parsed.confidence ?? "")
      ? (parsed.confidence as ModerationConfidence)
      : "low";

    return {
      category,
      confidence,
      reason: parsed.reason ?? "",
      shouldBlock: category !== "CLEAN" && confidence === "high",
      aiFailed: false,
    };
  } catch (err) {
    console.error("Content moderation AI call ব্যর্থ হয়েছে (fail-open, block করা হয়নি):", err);
    return { category: "CLEAN", confidence: "low", reason: "", shouldBlock: false, aiFailed: true };
  }
}

/** ক্যাটাগরি অনুযায়ী ইউজারকে দেখানোর বাংলা এরর মেসেজ */
export function getModerationBlockMessage(result: ModerationResult): string {
  const labels: Record<ModerationCategory, string> = {
    SPAM: "স্প্যাম/বিজ্ঞাপনমূলক কন্টেন্ট",
    OFFENSIVE: "অশ্লীল/আপত্তিকর ভাষা",
    HARASSMENT: "হয়রানিমূলক কন্টেন্ট",
    CLEAN: "",
  };
  const label = labels[result.category] || "অনুপযুক্ত কন্টেন্ট";
  return `তোমার লেখায় ${label} সনাক্ত হয়েছে (${result.reason || "নিয়ম লঙ্ঘন"}) — অনুগ্রহ করে ঠিক করে আবার চেষ্টা করো।`;
}
