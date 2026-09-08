// ===================================================================
// HSC ULTIMATE — 20,000+ Question Vault Query & Service Engine
// -------------------------------------------------------------------
// In-memory indexing and fast querying for the massive question bank.
// ===================================================================

import * as fs from "fs";
import * as path from "path";
import type { GeneratedMCQ } from "@/scripts/generate-20000-questions";

let cachedVault: GeneratedMCQ[] | null = null;

export function loadVault(): GeneratedMCQ[] {
  if (cachedVault) return cachedVault;

  const vaultDir = path.join(process.cwd(), "data/vault");
  if (!fs.existsSync(vaultDir)) return [];

  const files = fs.readdirSync(vaultDir).filter((f) => f.startsWith("vault-chunk-") && f.endsWith(".json"));
  const all: GeneratedMCQ[] = [];

  for (const f of files) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(vaultDir, f), "utf8"));
      if (Array.isArray(data)) {
        all.push(...data);
      }
    } catch (err) {
      console.error(`Error loading vault chunk ${f}:`, err);
    }
  }

  cachedVault = all;
  return all;
}

export interface VaultQueryParams {
  subject?: string;
  board?: string;
  admissionExam?: string;
  difficulty?: string;
  query?: string;
  page?: number;
  limit?: number;
}

export interface VaultQueryResult {
  questions: GeneratedMCQ[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  subjectsSummary: Record<string, number>;
}

export function queryVault(params: VaultQueryParams): VaultQueryResult {
  const all = loadVault();
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(100, Math.max(1, params.limit || 20));

  let filtered = all;

  // Filter by Subject
  if (params.subject && params.subject !== "ALL") {
    filtered = filtered.filter(
      (q) => q.subjectCode === params.subject || q.subjectName.includes(params.subject || "")
    );
  }

  // Filter by Board
  if (params.board && params.board !== "ALL") {
    filtered = filtered.filter((q) => q.boardName?.includes(params.board || ""));
  }

  // Filter by Admission Exam
  if (params.admissionExam && params.admissionExam !== "ALL") {
    filtered = filtered.filter((q) => q.admissionExam === params.admissionExam);
  }

  // Filter by Difficulty
  if (params.difficulty && params.difficulty !== "ALL") {
    filtered = filtered.filter((q) => q.difficulty === params.difficulty);
  }

  // Search Query
  if (params.query && params.query.trim()) {
    const qLower = params.query.toLowerCase().trim();
    filtered = filtered.filter(
      (q) =>
        q.text.toLowerCase().includes(qLower) ||
        q.topicName.toLowerCase().includes(qLower) ||
        q.chapterName.toLowerCase().includes(qLower) ||
        q.explanation.toLowerCase().includes(qLower)
    );
  }

  const totalCount = filtered.length;
  const totalPages = Math.ceil(totalCount / limit);
  const offset = (page - 1) * limit;
  const questions = filtered.slice(offset, offset + limit);

  // Summary counts
  const subjectsSummary: Record<string, number> = {};
  all.forEach((q) => {
    subjectsSummary[q.subjectName] = (subjectsSummary[q.subjectName] || 0) + 1;
  });

  return {
    questions,
    totalCount,
    totalPages,
    currentPage: page,
    subjectsSummary,
  };
}

/**
 * Generates a random standard 25-question test from the vault.
 */
export function generateRandomVaultMock(subject?: string): GeneratedMCQ[] {
  const all = loadVault();
  let pool = all;
  if (subject && subject !== "ALL") {
    pool = all.filter((q) => q.subjectCode === subject || q.subjectName.includes(subject));
  }

  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 25);
}
