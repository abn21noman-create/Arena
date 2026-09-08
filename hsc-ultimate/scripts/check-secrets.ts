/**
 * Secret স্বাস্থ্য পরীক্ষা — কোনো গোপন মান ছাপে না, শুধু বৈধতা যাচাই করে।
 *
 * চালাতে: npm run check:secrets
 *
 * কেন দরকার: `.env` একবার পাবলিক Drive লিংকে শেয়ার হয়েছিল, তাই সব key
 * rotate করা জরুরি। এই স্ক্রিপ্ট নিশ্চিত করে —
 *   • সব প্রয়োজনীয় ভেরিয়েবল আছে ও placeholder নয়
 *   • VAPID কী-জোড়া প্রকৃতপক্ষে বৈধ (web-push লাইব্রেরি দিয়ে যাচাই)
 *   • NEXTAUTH_SECRET যথেষ্ট শক্তিশালী (≥৩২ অক্ষর)
 *   • DATABASE_URL ও NEXTAUTH_URL এর গঠন সঠিক
 *
 * ⚠️ এটি কখনো secret এর মান print করে না — শুধু দৈর্ঘ্য ও অবস্থা।
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import webpush from "web-push";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const problems: string[] = [];
const warnings: string[] = [];
let ok = 0;

const REQUIRED = [
  "DATABASE_URL",
  "DIRECT_URL",
  "NEXTAUTH_SECRET",
  "NEXTAUTH_URL",
  "GROQ_API_KEY",
  "NEXT_PUBLIC_VAPID_PUBLIC_KEY",
  "VAPID_PRIVATE_KEY",
  "VAPID_SUBJECT",
];

const OPTIONAL = [
  "MISTRAL_API_KEY",
  "CEREBRAS_API_KEY",
  "OPENROUTER_API_KEY",
  "RESEND_API_KEY",
];

// placeholder ধরার প্যাটার্ন — এগুলো থাকলে key আসলে সেট করা হয়নি
const PLACEHOLDER = /^(your[_-]|xxx|placeholder|changeme|<.*>|example|todo)/i;

console.log("🔐 Secret স্বাস্থ্য পরীক্ষা\n");

for (const k of REQUIRED) {
  const v = process.env[k];
  if (!v) {
    problems.push(`${k} অনুপস্থিত`);
    continue;
  }
  if (PLACEHOLDER.test(v)) {
    problems.push(`${k} এ placeholder মান আছে`);
    continue;
  }
  ok++;
}

for (const k of OPTIONAL) {
  const v = process.env[k];
  if (!v) warnings.push(`${k} সেট নেই — সংশ্লিষ্ট ফিচার নিষ্ক্রিয় থাকবে`);
  else if (PLACEHOLDER.test(v)) warnings.push(`${k} এ placeholder মান`);
  else ok++;
}

// Optional Upstash pair — partial configuration must never look production-ready.
const rateLimitMode = (process.env.RATE_LIMIT_BACKEND ?? "auto").toLowerCase();
const redisUrl = process.env.UPSTASH_REDIS_REST_URL ?? "";
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN ?? "";
if (!["auto", "memory", "upstash"].includes(rateLimitMode)) {
  problems.push("RATE_LIMIT_BACKEND শুধু auto, memory বা upstash হতে পারে");
}
if (Boolean(redisUrl) !== Boolean(redisToken)) {
  problems.push("Upstash rate limiter-এর URL/token pair অসম্পূর্ণ");
}
if (rateLimitMode === "upstash" && (!redisUrl || !redisToken)) {
  problems.push("RATE_LIMIT_BACKEND=upstash কিন্তু REST URL/token অনুপস্থিত");
}
if (redisUrl && !/^https:\/\//.test(redisUrl)) {
  problems.push("UPSTASH_REDIS_REST_URL অবশ্যই https:// দিয়ে শুরু হতে হবে");
}
if (redisToken && PLACEHOLDER.test(redisToken)) {
  problems.push("UPSTASH_REDIS_REST_TOKEN এ placeholder মান আছে");
}
if (redisUrl && redisToken && /^https:\/\//.test(redisUrl) && !PLACEHOLDER.test(redisToken)) {
  ok++;
}

// Focus scheduler secret/mode — value কখনো print করা হয় না।
const schedulerMode = (process.env.FOCUS_SCHEDULER_MODE ?? "").toLowerCase();
const cronSecret = process.env.CRON_SECRET ?? "";
if (schedulerMode && !["lazy", "external"].includes(schedulerMode)) {
  problems.push("FOCUS_SCHEDULER_MODE শুধু lazy বা external হতে পারে");
}
if (schedulerMode === "external" && !cronSecret) {
  problems.push("FOCUS_SCHEDULER_MODE=external কিন্তু CRON_SECRET অনুপস্থিত");
}
if (cronSecret && cronSecret.length < 32) {
  problems.push("CRON_SECRET ন্যূনতম ৩২ অক্ষরের হতে হবে");
} else if (cronSecret) {
  ok++;
}

// Optional Firebase Admin triplet — partial/malformed setup must be visible.
const firebaseProjectId = process.env.FIREBASE_PROJECT_ID ?? "";
const firebaseClientEmail = process.env.FIREBASE_CLIENT_EMAIL ?? "";
const firebasePrivateKey = (process.env.FIREBASE_PRIVATE_KEY ?? "").replace(/\\n/g, "\n");
const firebasePresent = [firebaseProjectId, firebaseClientEmail, firebasePrivateKey]
  .filter(Boolean).length;
if (firebasePresent > 0 && firebasePresent < 3) {
  problems.push("Firebase Admin credential triplet অসম্পূর্ণ");
}
if (firebaseClientEmail && !firebaseClientEmail.includes("@")) {
  problems.push("FIREBASE_CLIENT_EMAIL এর গঠন সঠিক নয়");
}
if (firebasePrivateKey && !firebasePrivateKey.includes("BEGIN PRIVATE KEY")) {
  problems.push("FIREBASE_PRIVATE_KEY PEM format-এ নেই");
}
if (firebasePresent === 3 && firebaseClientEmail.includes("@") && firebasePrivateKey.includes("BEGIN PRIVATE KEY")) {
  ok++;
}

// NEXTAUTH_SECRET শক্তি যাচাই
const secret = process.env.NEXTAUTH_SECRET ?? "";
if (secret && secret.length < 32) {
  problems.push(
    `NEXTAUTH_SECRET খুব ছোট (${secret.length} অক্ষর, ন্যূনতম ৩২ দরকার)`
  );
} else if (secret) {
  ok++;
}

// VAPID কী-জোড়া প্রকৃত যাচাই — web-push নিজেই গঠন পরীক্ষা করে
if (
  process.env.VAPID_SUBJECT &&
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY &&
  process.env.VAPID_PRIVATE_KEY
) {
  try {
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT,
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );
    ok++;
  } catch (e) {
    problems.push(`VAPID কী-জোড়া অবৈধ: ${(e as Error).message}`);
  }
}

// DATABASE_URL গঠন
const db = process.env.DATABASE_URL ?? "";
if (db && !/^postgres(ql)?:\/\//.test(db)) {
  problems.push("DATABASE_URL postgres:// দিয়ে শুরু হয় না");
} else if (db) {
  ok++;
}

// NEXTAUTH_URL গঠন
const url = process.env.NEXTAUTH_URL ?? "";
if (url && !/^https?:\/\//.test(url)) {
  problems.push("NEXTAUTH_URL এ http(s):// নেই");
} else if (url) {
  ok++;
}

// Reusable privileged credentials must never have a source-code fallback.
const privilegedFallback = /ADMIN_(?:EMAIL|PASS)\s*=\s*os\.environ\.get\([^,]+,\s*["'][^"']+["']\)/;
const credentialFiles = readdirSync("scripts")
  .filter((name) => name.endsWith(".py"))
  .filter((name) => privilegedFallback.test(readFileSync(path.join("scripts", name), "utf8")));
if (credentialFiles.length > 0) {
  problems.push(`${credentialFiles.length}টি test script-এ privileged credential fallback আছে`);
} else {
  ok++;
}

console.log("═".repeat(52));
if (problems.length === 0) {
  console.log(`✅ সব ${ok}টা secret চেক পাস`);
} else {
  console.log(`❌ ${problems.length}টা সমস্যা:`);
  problems.forEach((p) => console.log("   •", p));
}
if (warnings.length) {
  console.log(`\n⚠️  ${warnings.length}টা সতর্কতা:`);
  warnings.forEach((w) => console.log("   •", w));
}
console.log("═".repeat(52));

process.exit(problems.length ? 1 : 0);
