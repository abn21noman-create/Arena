#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const checks = [];
const add = (name, ok, detail, required = true) => checks.push({ name, ok, detail, required });

const nodeMajor = Number(process.versions.node.split(".")[0]);
add("Node.js", nodeMajor >= 22, `v${process.versions.node} (required: 22+)`);

let npmVersion = "not found";
try {
  npmVersion = execFileSync("npm", ["--version"], { encoding: "utf8" }).trim();
} catch {}
add("npm", npmVersion !== "not found", npmVersion);

const requiredFiles = [
  "package.json",
  "package-lock.json",
  "prisma/schema.prisma",
  "prisma.config.ts",
  "next.config.ts",
];
for (const file of requiredFiles) {
  add(file, fs.existsSync(path.join(root, file)), fs.existsSync(path.join(root, file)) ? "present" : "missing");
}

const modulesReady = fs.existsSync(path.join(root, "node_modules/.bin/next"));
add("Dependencies", modulesReady, modulesReady ? "installed" : "run: npm run setup", false);
const prismaReady = fs.existsSync(path.join(root, "node_modules/.prisma/client"));
add("Prisma Client", prismaReady, prismaReady ? "generated" : "generated automatically by setup", false);

const envFiles = [".env", ".env.local"].filter((file) => fs.existsSync(path.join(root, file)));
const envNames = new Set();
for (const file of envFiles) {
  const content = fs.readFileSync(path.join(root, file), "utf8");
  for (const line of content.split(/\r?\n/)) {
    const match = /^\s*([A-Z][A-Z0-9_]*)\s*=/.exec(line);
    if (match) envNames.add(match[1]);
  }
}
const requiredEnv = ["DATABASE_URL", "NEXTAUTH_SECRET", "NEXTAUTH_URL"];
const missingEnv = requiredEnv.filter((name) => !envNames.has(name));
add("Core environment", missingEnv.length === 0, missingEnv.length ? `missing names: ${missingEnv.join(", ")}` : `${envFiles.length} file(s), required names present`);
const aiCount = ["GROQ_API_KEY", "MISTRAL_API_KEY", "CEREBRAS_API_KEY", "OPENROUTER_API_KEY"]
  .filter((name) => envNames.has(name)).length;
add("AI fallback keys", aiCount > 0, `${aiCount}/4 configured`, false);
const firebaseCount = ["FIREBASE_PROJECT_ID", "FIREBASE_CLIENT_EMAIL", "FIREBASE_PRIVATE_KEY"]
  .filter((name) => envNames.has(name)).length;
add("Native FCM", firebaseCount === 3, firebaseCount === 3 ? "configured" : "optional; required only for closed-app remote focus", false);
const cronConfigured = envNames.has("CRON_SECRET");
add(
  "Focus scheduler",
  true,
  cronConfigured
    ? "cron secret present; heartbeat visible after external/manual run"
    : "lazy mode available; external production cron not configured",
  false
);
const redisCount = ["UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN"]
  .filter((name) => envNames.has(name)).length;
add(
  "Rate limiter",
  redisCount !== 1,
  redisCount === 2
    ? "distributed Upstash REST configured"
    : redisCount === 1
      ? "partial Upstash configuration; both URL and token are required"
      : "bounded local memory; optional Upstash for multi-instance",
  false
);

const totalMb = Math.round(os.totalmem() / 1024 / 1024);
let swapMb = 0;
try {
  const meminfo = fs.readFileSync("/proc/meminfo", "utf8");
  swapMb = Math.round(Number(/SwapTotal:\s+(\d+)/.exec(meminfo)?.[1] ?? 0) / 1024);
} catch {}
add("Memory", totalMb >= 3000 || swapMb >= 1000, `${totalMb} MiB RAM, ${swapMb} MiB swap; safe-build can add temporary swap`, false);

console.log("\nHSC Ultimate Doctor\n" + "─".repeat(52));
for (const check of checks) {
  const mark = check.ok ? "✅" : check.required ? "❌" : "⚠️";
  console.log(`${mark} ${check.name.padEnd(22)} ${check.detail}`);
}
console.log("─".repeat(52));
const failures = checks.filter((check) => check.required && !check.ok);
if (failures.length) {
  console.log(`❌ ${failures.length}টি required check ব্যর্থ।`);
  process.exit(1);
}
console.log("✅ Core development environment প্রস্তুত।\n");
