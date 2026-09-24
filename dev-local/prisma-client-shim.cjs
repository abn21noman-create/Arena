// ===================================================================
// @prisma/client shim for the sandbox (local dev only)
// -------------------------------------------------------------------
// The generated client's Node entry point expects the native Query
// Engine binary, which can only be fetched from binaries.prisma.sh —
// blocked in this environment.
//
// The application itself never hits that path: lib/prisma.ts imports
// `@prisma/client/wasm.js` and passes a `PrismaPg` driver adapter. This
// shim gives the *scripts* (seeds, audits, ...) the same behaviour, so
// their `new PrismaClient()` calls keep working.
//
// Nothing in the repository and nothing in node_modules is modified.
// ===================================================================
"use strict";

const path = require("node:path");

const REPO = process.env.ARENA_REPO || "/home/user/Arena/hsc-ultimate";
const wasm = require(path.join(REPO, "node_modules/.prisma/client/wasm.js"));
const { PrismaPg } = require(path.join(REPO, "node_modules/@prisma/adapter-pg"));
const { Pool } = require(path.join(REPO, "node_modules/pg"));

const FALLBACK_URL = "postgresql://postgres:postgres@127.0.0.1:5432/hsc_ultimate";

function resolveConnectionString() {
  const raw = process.env.DATABASE_URL || process.env.DIRECT_URL || FALLBACK_URL;
  let host = "";
  try {
    host = new URL(raw).hostname;
  } catch {
    return FALLBACK_URL;
  }
  // Safety: never let a script reach a remote database by accident.
  if (!["localhost", "127.0.0.1", "::1"].includes(host)) {
    console.warn(
      `[local-db shim] DATABASE_URL points at "${host}" (remote/unreachable) — using local database instead.`
    );
    return FALLBACK_URL;
  }
  return raw;
}

const BasePrismaClient = wasm.PrismaClient;

class PrismaClient extends BasePrismaClient {
  constructor(options = {}) {
    const connectionString = resolveConnectionString();
    const pool = new Pool({
      connectionString,
      ssl: false,
      max: Number(process.env.LOCAL_DB_POOL_MAX || 10),
    });
    pool.on("error", (err) => {
      console.warn("[local-db shim] idle pg client error:", err.message);
    });

    super({ ...options, adapter: new PrismaPg(pool) });
    Object.defineProperty(this, "__localPool", { value: pool, enumerable: false });
  }

  async $disconnect() {
    try {
      await super.$disconnect();
    } finally {
      await this.__localPool.end().catch(() => {});
    }
  }
}

const out = {};
for (const key of Object.getOwnPropertyNames(wasm)) {
  if (key === "PrismaClient") continue;
  const descriptor = Object.getOwnPropertyDescriptor(wasm, key);
  if (descriptor) Object.defineProperty(out, key, descriptor);
}
out.PrismaClient = PrismaClient;
Object.defineProperty(out, "__esModule", { value: true });

module.exports = out;
