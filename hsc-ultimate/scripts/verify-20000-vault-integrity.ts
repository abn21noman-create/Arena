/**
 * ===================================================================
 * HSC ULTIMATE — 20,000 MCQ Exhaustive Data Integrity & Sanity Test
 * ===================================================================
 * Verifies every single question in the 20,000 MCQ vault for:
 *   1. Non-empty text and non-empty explanation
 *   2. Exactly 4 non-empty distinct options
 *   3. correctAnswer strictly matching one of the 4 options
 *   4. Valid subjectCode, chapterNumber, and topicName
 *   5. No NaN, undefined, or malformed strings in text or options
 * ===================================================================
 */

import * as fs from "fs";
import * as path from "path";
import { loadVault } from "../lib/vault-service";

let totalChecked = 0;
let errors: string[] = [];

console.log("═══════════════════════════════════════════════════════════════");
console.log("🔬 20,000 MCQ VAULT EXHAUSTIVE DEEP AUDIT & SANITY TEST");
console.log("═══════════════════════════════════════════════════════════════\n");

const questions = loadVault();
console.log(`Loaded ${questions.length} questions from storage.\n`);

if (questions.length !== 20000) {
  errors.push(`Expected exactly 20,000 questions, but found ${questions.length}`);
}

const subjectCounts: Record<string, number> = {};
const difficultyCounts: Record<string, number> = {};

for (let i = 0; i < questions.length; i++) {
  const q = questions[i];
  totalChecked++;

  // 1. Text check
  if (!q.text || q.text.trim().length === 0) {
    errors.push(`[${q.id}] Empty question text`);
  }
  if (q.text.includes("NaN") || q.text.includes("undefined") || q.text.includes("null")) {
    errors.push(`[${q.id}] Malformed string in question text: ${q.text}`);
  }

  // 2. Options check
  if (!Array.isArray(q.options) || q.options.length !== 4) {
    errors.push(`[${q.id}] Question must have exactly 4 options, found ${q.options?.length}`);
  } else {
    // Check distinct options
    const uniqueOptions = new Set(q.options.map((o) => o.trim()));
    if (uniqueOptions.size !== 4) {
      errors.push(`[${q.id}] Question has duplicate options: ${JSON.stringify(q.options)}`);
    }

    // Check for NaN or empty options
    q.options.forEach((opt, optIdx) => {
      if (!opt || opt.trim().length === 0) {
        errors.push(`[${q.id}] Option ${optIdx + 1} is empty`);
      }
      if (opt.includes("NaN") || opt.includes("undefined")) {
        errors.push(`[${q.id}] Option ${optIdx + 1} contains malformed data: ${opt}`);
      }
    });

    // 3. Correct answer match
    if (!q.options.includes(q.correctAnswer)) {
      errors.push(`[${q.id}] correctAnswer "${q.correctAnswer}" not found in options: ${JSON.stringify(q.options)}`);
    }
  }

  // 4. Explanation check
  if (!q.explanation || q.explanation.trim().length === 0) {
    errors.push(`[${q.id}] Missing explanation`);
  }

  // 5. Categorization metadata
  if (!q.subjectCode || !q.subjectName) {
    errors.push(`[${q.id}] Missing subject metadata`);
  }
  if (!q.chapterNumber || !q.chapterName) {
    errors.push(`[${q.id}] Missing chapter metadata`);
  }
  if (!q.topicName) {
    errors.push(`[${q.id}] Missing topic metadata`);
  }

  // Aggregate stats
  subjectCounts[q.subjectName] = (subjectCounts[q.subjectName] || 0) + 1;
  difficultyCounts[q.difficulty] = (difficultyCounts[q.difficulty] || 0) + 1;
}

console.log("📊 Subject Distribution:");
Object.entries(subjectCounts).forEach(([subj, count]) => {
  console.log(`  • ${subj}: ${count} questions`);
});

console.log("\n🎯 Difficulty Distribution:");
Object.entries(difficultyCounts).forEach(([diff, count]) => {
  console.log(`  • ${diff}: ${count} questions`);
});

console.log("\n═══════════════════════════════════════════════════════════════");
if (errors.length === 0) {
  console.log(`🎉 ALL ${totalChecked.toLocaleString()} MCQs PASSED 100% QUALITY & SANITY VALIDATION WITH 0 ERRORS!`);
} else {
  console.error(`❌ FOUND ${errors.length} ERROR(S):`);
  errors.slice(0, 10).forEach((err) => console.error(`  - ${err}`));
  if (errors.length > 10) console.error(`  ... and ${errors.length - 10} more`);
  process.exit(1);
}
console.log("═══════════════════════════════════════════════════════════════\n");
