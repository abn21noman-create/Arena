// ===================================================================
// AI প্রোভাইডার লাইভ হেলথ-চেক — pnpm test:ai
// -------------------------------------------------------------------
// কেন দরকার: lib/ai-provider.ts এ ৪-স্তরের fallback চেইন আছে। কোনো
// প্রোভাইডার মডেলের নাম বদলালে/free tier তুলে নিলে চেইনের ওই ধাপটা
// নীরবে মৃত হয়ে যায় — অ্যাপ তখনো "কাজ করে" মনে হয় (আগের ধাপ সামলে
// নেয়), কিন্তু আসলে সুরক্ষার স্তর কমে যায়। ২০২৬-০৭-৩০ এর লাইভ চেকে
// ঠিক এটাই ধরা পড়েছিল: OpenRouter এর দুটো মডেলই 404 দিচ্ছিল।
//
// এই স্ক্রিপ্ট lib/ai-provider.ts এর আসল কনফিগ import করে (হার্ডকোড
// করে না, তাই drift অসম্ভব) এবং প্রতিটা প্রোভাইডারে সত্যিকারের ছোট
// রিকোয়েস্ট পাঠায়। API key কখনো print হয় না।
//
// text চেইনের অন্তত একটা ধাপ কাজ না করলে exit code ১।
// ===================================================================
import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { PROVIDERS, VISION_PROVIDERS, type ProviderConfig } from "../lib/ai-provider";

// ৮×৮ নীল PNG (vision মডেল সত্যিই ছবি "দেখছে" কিনা যাচাই করতে —
// শুধু ২০০ OK নয়, উত্তরে "blue" আছে কিনা তাও মেলানো হয়)
const BLUE_PNG_B64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAIAAABLbSncAAAAEElEQVR4nGNgYPiPAw0pCQCpcD/BFMrqcwAAAABJRU5ErkJggg==";

interface Outcome {
  label: string;
  ok: boolean;
  note: string;
}

async function callOne(p: ProviderConfig, vision: boolean): Promise<Outcome> {
  const label = `${p.name}${vision ? " (vision)" : ""} [${p.model}]`;
  const key = process.env[p.apiKeyEnv];
  if (!key) return { label, ok: false, note: `${p.apiKeyEnv} সেট নেই` };

  const messages = vision
    ? [
        {
          role: "user",
          content: [
            { type: "text", text: "What color is this image? Answer with one word." },
            { type: "image_url", image_url: { url: `data:image/png;base64,${BLUE_PNG_B64}` } },
          ],
        },
      ]
    : [{ role: "user", content: "Reply with exactly one word: OK" }];

  const t0 = Date.now();
  try {
    const res = await fetch(p.baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      // max_tokens উদারভাবে দেওয়া — reasoning মডেলগুলো ছোট বাজেটে
      // পুরো টোকেন reasoning এ খরচ করে খালি content ফেরত দেয়
      body: JSON.stringify({ model: p.model, messages, max_tokens: 300, temperature: 0.4 }),
      signal: AbortSignal.timeout(60_000),
    });
    const raw = await res.text();
    const ms = Date.now() - t0;
    if (!res.ok) return { label, ok: false, note: `HTTP ${res.status} · ${raw.slice(0, 150)}` };

    const data = JSON.parse(raw);
    const content: string = data?.choices?.[0]?.message?.content ?? "";
    const served: string = data?.model ?? "?";

    if (!content.trim()) {
      return { label, ok: false, note: `${ms}ms · খালি content (মডেল সাড়া দিলেও ব্যবহারযোগ্য নয়)` };
    }
    // প্রোভাইডার নীরবে অন্য মডেলে রুট করছে কিনা (pixtral-12b-2409 এ
    // ঠিক এটাই হচ্ছিল) — চাওয়া আর পাওয়া মডেল মিলিয়ে দেখা হয়
    const drift = served && !served.includes(p.model.split("/").pop()!.split(":")[0])
      ? ` ⚠️ চাওয়া "${p.model}" কিন্তু পেয়েছি "${served}"`
      : "";
    if (vision && !/blue|নীল/i.test(content)) {
      return { label, ok: false, note: `${ms}ms · ছবি চিনতে পারেনি: ${JSON.stringify(content.slice(0, 60))}${drift}` };
    }
    return { label, ok: true, note: `${ms}ms · ${JSON.stringify(content.trim().slice(0, 50))}${drift}` };
  } catch (e) {
    return { label, ok: false, note: `${(e as Error).name}: ${String(e).slice(0, 100)}` };
  }
}

async function main() {
  console.log("=== AI প্রোভাইডার লাইভ হেলথ-চেক ===\n");

  console.log(`টেক্সট চেইন (${PROVIDERS.length} ধাপ, ক্রমানুসারে fallback):`);
  const textResults: Outcome[] = [];
  for (const p of PROVIDERS) {
    const r = await callOne(p, false);
    textResults.push(r);
    console.log(`  ${r.ok ? "✅" : "❌"} ${r.label} — ${r.note}`);
  }

  console.log(`\nভিশন চেইন (${VISION_PROVIDERS.length} ধাপ):`);
  const visionResults: Outcome[] = [];
  for (const p of VISION_PROVIDERS) {
    const r = await callOne(p, true);
    visionResults.push(r);
    console.log(`  ${r.ok ? "✅" : "❌"} ${r.label} — ${r.note}`);
  }

  const tOk = textResults.filter((r) => r.ok).length;
  const vOk = visionResults.filter((r) => r.ok).length;
  console.log(`\n=== টেক্সট: ${tOk}/${textResults.length} · ভিশন: ${vOk}/${visionResults.length} ===`);

  if (tOk === 0) {
    console.log("❌ টেক্সট চেইনের একটাও ধাপ কাজ করছে না — AI ফিচার সম্পূর্ণ বন্ধ থাকবে");
    process.exit(1);
  }
  if (vOk === 0) {
    console.log("❌ ভিশন চেইনের একটাও ধাপ কাজ করছে না — ছবি আপলোড করে প্রশ্ন করা যাবে না");
    process.exit(1);
  }
  if (tOk < textResults.length || vOk < visionResults.length) {
    console.log("⚠️  কিছু ধাপ মৃত — অ্যাপ চলবে, কিন্তু fallback সুরক্ষা কমে গেছে");
    process.exit(1);
  }
  console.log("✅ সব ধাপ সক্রিয়");
}

main();
