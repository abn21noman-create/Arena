// ===================================================================
// Rate Limiting — local + optional distributed sliding window
// -------------------------------------------------------------------
// Default/local development: bounded in-memory sliding window.
// Multi-instance production: atomic Upstash Redis sliding window via Lua.
// If a configured Redis backend becomes unavailable, each instance keeps a
// bounded in-memory safety limit instead of silently disabling protection.
// Secret values, raw IP addresses and user IDs are never written to Redis keys.
// ===================================================================

import { createHash, randomUUID } from "node:crypto";
import { isIP } from "node:net";

export interface RateLimitConfig {
  /** Max requests in window. */
  maxRequests: number;
  /** Time window in milliseconds. */
  windowMs: number;
}

interface RateLimitEntry {
  timestamps: number[];
  expiresAt: number;
}

export type RateLimitResult =
  | { success: true; remaining: number }
  | { success: false; retryAfter: number };

export type RateLimitBackend =
  | "memory"
  | "upstash-redis"
  | "memory-fallback"
  | "memory-safety";

export type DistributedRateLimitResult = RateLimitResult & {
  backend: RateLimitBackend;
};

export interface RateLimitRuntimeState {
  consecutiveFailures: number;
  circuitOpenUntil: number;
  lastFailureAt: number | null;
  lastSuccessAt: number | null;
  lastFailureCode: string | null;
}

interface RateLimitEnvironment {
  RATE_LIMIT_BACKEND?: string;
  RATE_LIMIT_REDIS_TIMEOUT_MS?: string;
  RATE_LIMIT_REDIS_PREFIX?: string;
  UPSTASH_REDIS_REST_URL?: string;
  UPSTASH_REDIS_REST_TOKEN?: string;
}

interface DistributedCheckOptions {
  env?: RateLimitEnvironment;
  fetchImpl?: typeof fetch;
  state?: RateLimitRuntimeState;
  now?: () => number;
  nonce?: () => string;
}

interface ResolvedBackendConfig {
  mode: "auto" | "memory" | "upstash";
  useRedis: boolean;
  configured: boolean;
  url: string | null;
  token: string | null;
  timeoutMs: number;
  keyPrefix: string;
  configurationError: string | null;
}

export interface RateLimitRuntimeStatus {
  mode: "auto" | "memory" | "upstash";
  status: "local" | "ready" | "degraded" | "misconfigured";
  backend: "memory" | "upstash-redis" | "memory-fallback";
  configured: boolean;
  distributed: boolean;
  circuitOpen: boolean;
  consecutiveFailures: number;
  lastSuccessAt: string | null;
  lastFailureAt: string | null;
  fallbackReason: string | null;
}

// Pre-configured limits for different endpoint types.
export const RATE_LIMITS = {
  // Auth endpoints — strict (prevent brute force)
  auth: { maxRequests: 5, windowMs: 15 * 60 * 1000 },
  register: { maxRequests: 3, windowMs: 60 * 60 * 1000 },
  passwordReset: { maxRequests: 3, windowMs: 60 * 60 * 1000 },

  // AI endpoints — expensive (limit per user)
  aiChat: { maxRequests: 30, windowMs: 60 * 60 * 1000 },
  aiGenerate: { maxRequests: 10, windowMs: 60 * 60 * 1000 },

  // Write endpoints — moderate
  create: { maxRequests: 60, windowMs: 60 * 1000 },
  update: { maxRequests: 120, windowMs: 60 * 1000 },

  // Read endpoints — generous
  read: { maxRequests: 300, windowMs: 60 * 1000 },

  // Admin endpoints — privileged operations
  admin: { maxRequests: 200, windowMs: 60 * 1000 },

  // File upload — expensive
  upload: { maxRequests: 10, windowMs: 60 * 60 * 1000 },
} as const;

const MAX_MEMORY_KEYS = 50_000;
const CIRCUIT_FAILURE_THRESHOLD = 3;
const CIRCUIT_OPEN_MS = 30_000;
const DEFAULT_REDIS_TIMEOUT_MS = 800;
const DEFAULT_REDIS_PREFIX = "hsc-ultimate:rate-limit:v1";

const store = new Map<string, RateLimitEntry>();
const globalRuntimeState = createRateLimitRuntimeState();

const SLIDING_WINDOW_LUA = `
local now = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local limit = tonumber(ARGV[3])
local member = ARGV[4]
local cutoff = now - window
redis.call("ZREMRANGEBYSCORE", KEYS[1], "-inf", cutoff)
local count = redis.call("ZCARD", KEYS[1])
if count >= limit then
  local oldest = redis.call("ZRANGE", KEYS[1], 0, 0, "WITHSCORES")
  local retry = 1
  if oldest[2] then
    retry = math.max(1, math.ceil((tonumber(oldest[2]) + window - now) / 1000))
  end
  return {0, 0, retry}
end
redis.call("ZADD", KEYS[1], now, member)
redis.call("PEXPIRE", KEYS[1], window)
return {1, limit - count - 1, 0}
`.trim();

class RateLimitBackendError extends Error {
  constructor(readonly code: string) {
    super(code);
    this.name = "RateLimitBackendError";
  }
}

export function createRateLimitRuntimeState(): RateLimitRuntimeState {
  return {
    consecutiveFailures: 0,
    circuitOpenUntil: 0,
    lastFailureAt: null,
    lastSuccessAt: null,
    lastFailureCode: null,
  };
}

function cleanupMemoryStore(now = Date.now()) {
  for (const [key, entry] of store) {
    if (entry.expiresAt <= now) store.delete(key);
  }
}

// Cleanup old entries every 5 minutes without keeping the process alive.
setInterval(() => cleanupMemoryStore(), 5 * 60 * 1000).unref?.();

function normalizedInternalKey(identifier: string, config: RateLimitConfig): string {
  const digest = createHash("sha256").update(identifier).digest("hex");
  return `${config.windowMs}:${config.maxRequests}:${digest}`;
}

function ensureMemoryCapacity(now: number) {
  if (store.size < MAX_MEMORY_KEYS) return;
  cleanupMemoryStore(now);
  if (store.size < MAX_MEMORY_KEYS) return;
  const oldestKey = store.keys().next().value as string | undefined;
  if (oldestKey) store.delete(oldestKey);
}

/** Synchronous in-memory limiter used locally and as a Redis outage fallback. */
export function checkRateLimit(identifier: string, config: RateLimitConfig): RateLimitResult {
  if (!Number.isFinite(config.maxRequests) || config.maxRequests < 1) {
    throw new Error("Rate limit maxRequests must be at least 1");
  }
  if (!Number.isFinite(config.windowMs) || config.windowMs < 1) {
    throw new Error("Rate limit windowMs must be at least 1");
  }

  const now = Date.now();
  const key = normalizedInternalKey(identifier, config);
  let entry = store.get(key);
  if (!entry) {
    ensureMemoryCapacity(now);
    entry = { timestamps: [], expiresAt: now + config.windowMs };
    store.set(key, entry);
  }

  entry.timestamps = entry.timestamps.filter((timestamp) => now - timestamp < config.windowMs);
  entry.expiresAt = now + config.windowMs;

  if (entry.timestamps.length >= config.maxRequests) {
    const oldestTimestamp = entry.timestamps[0];
    const retryAfter = Math.max(
      1,
      Math.ceil((oldestTimestamp + config.windowMs - now) / 1000)
    );
    return { success: false, retryAfter };
  }

  entry.timestamps.push(now);
  return {
    success: true,
    remaining: config.maxRequests - entry.timestamps.length,
  };
}

function parseTimeout(value: string | undefined): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return DEFAULT_REDIS_TIMEOUT_MS;
  return Math.min(5_000, Math.max(100, Math.round(parsed)));
}

function safePrefix(value: string | undefined): string {
  const normalized = value?.trim();
  if (!normalized || !/^[a-zA-Z0-9:_-]{1,80}$/.test(normalized)) {
    return DEFAULT_REDIS_PREFIX;
  }
  return normalized;
}

function resolveBackendConfig(env: RateLimitEnvironment): ResolvedBackendConfig {
  const rawMode = (env.RATE_LIMIT_BACKEND ?? "auto").trim().toLowerCase();
  const mode =
    rawMode === "memory" || rawMode === "upstash" || rawMode === "auto"
      ? rawMode
      : "auto";
  if (mode === "memory") {
    return {
      mode,
      useRedis: false,
      configured: false,
      url: null,
      token: null,
      timeoutMs: parseTimeout(env.RATE_LIMIT_REDIS_TIMEOUT_MS),
      keyPrefix: safePrefix(env.RATE_LIMIT_REDIS_PREFIX),
      configurationError: null,
    };
  }
  const rawUrl = env.UPSTASH_REDIS_REST_URL?.trim() ?? "";
  const token = env.UPSTASH_REDIS_REST_TOKEN?.trim() ?? "";
  const hasUrl = rawUrl.length > 0;
  const hasToken = token.length > 0;
  let configurationError: string | null =
    rawMode === mode ? null : "invalid_backend_mode";
  let url: string | null = null;

  if (hasUrl) {
    try {
      const parsed = new URL(rawUrl);
      if (parsed.protocol !== "https:") configurationError = "redis_url_must_use_https";
      else url = parsed.toString().replace(/\/$/, "");
    } catch {
      configurationError = "invalid_redis_url";
    }
  }

  if (hasUrl !== hasToken) configurationError = "partial_redis_credentials";
  if (mode === "upstash" && (!hasUrl || !hasToken)) {
    configurationError = "missing_redis_credentials";
  }

  const configured = Boolean(url && hasToken && !configurationError);
  return {
    mode,
    useRedis: configured,
    configured,
    url,
    token: hasToken ? token : null,
    timeoutMs: parseTimeout(env.RATE_LIMIT_REDIS_TIMEOUT_MS),
    keyPrefix: safePrefix(env.RATE_LIMIT_REDIS_PREFIX),
    configurationError,
  };
}

function redisKey(identifier: string, config: RateLimitConfig, prefix: string): string {
  const digest = createHash("sha256")
    .update(`${config.windowMs}:${config.maxRequests}:${identifier}`)
    .digest("hex");
  return `${prefix}:${digest}`;
}

function recordBackendSuccess(state: RateLimitRuntimeState, now: number) {
  state.consecutiveFailures = 0;
  state.circuitOpenUntil = 0;
  state.lastFailureCode = null;
  state.lastSuccessAt = now;
}

function recordBackendFailure(state: RateLimitRuntimeState, now: number, code: string) {
  state.consecutiveFailures += 1;
  state.lastFailureAt = now;
  state.lastFailureCode = code;
  if (state.consecutiveFailures >= CIRCUIT_FAILURE_THRESHOLD) {
    state.circuitOpenUntil = now + CIRCUIT_OPEN_MS;
  }
}

function backendErrorCode(error: unknown): string {
  if (error instanceof RateLimitBackendError) return error.code;
  if (error instanceof DOMException && error.name === "AbortError") return "redis_timeout";
  return "redis_network_error";
}

async function runRedisSlidingWindow(
  identifier: string,
  config: RateLimitConfig,
  backend: ResolvedBackendConfig,
  options: DistributedCheckOptions
): Promise<RateLimitResult> {
  if (!backend.url || !backend.token) {
    throw new RateLimitBackendError("missing_redis_credentials");
  }

  const now = (options.now ?? Date.now)();
  const nonce = (options.nonce ?? randomUUID)();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), backend.timeoutMs);
  try {
    const fetchImpl = options.fetchImpl ?? fetch;
    const response = await fetchImpl(backend.url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${backend.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        "EVAL",
        SLIDING_WINDOW_LUA,
        "1",
        redisKey(identifier, config, backend.keyPrefix),
        String(now),
        String(config.windowMs),
        String(config.maxRequests),
        `${now}:${nonce}`,
      ]),
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new RateLimitBackendError(`redis_http_${response.status}`);
    }
    const payload = (await response.json()) as unknown;
    if (typeof payload !== "object" || payload === null || !("result" in payload)) {
      throw new RateLimitBackendError("invalid_redis_response");
    }
    const result = (payload as { result: unknown }).result;
    if (!Array.isArray(result) || result.length < 3) {
      throw new RateLimitBackendError("invalid_redis_result");
    }
    const allowed = Number(result[0]);
    const remaining = Number(result[1]);
    const retryAfter = Number(result[2]);
    if (![allowed, remaining, retryAfter].every(Number.isFinite)) {
      throw new RateLimitBackendError("invalid_redis_numbers");
    }
    if (allowed === 1) {
      return { success: true, remaining: Math.max(0, Math.floor(remaining)) };
    }
    if (allowed === 0) {
      return { success: false, retryAfter: Math.max(1, Math.ceil(retryAfter)) };
    }
    throw new RateLimitBackendError("invalid_redis_decision");
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Uses Redis when configured, otherwise memory. Redis errors never disable the
 * limiter: the request is checked against the bounded per-instance fallback.
 */
export async function checkDistributedRateLimit(
  identifier: string,
  config: RateLimitConfig,
  options: DistributedCheckOptions = {}
): Promise<DistributedRateLimitResult> {
  const env: RateLimitEnvironment =
    options.env ?? (process.env as RateLimitEnvironment);
  const state = options.state ?? globalRuntimeState;
  const now = (options.now ?? Date.now)();
  const backend = resolveBackendConfig(env);

  if (!backend.useRedis) {
    const result = checkRateLimit(identifier, config);
    return {
      ...result,
      backend: backend.configurationError ? "memory-fallback" : "memory",
    };
  }

  if (state.circuitOpenUntil > now) {
    return {
      ...checkRateLimit(identifier, config),
      backend: "memory-fallback",
    };
  }

  try {
    const result = await runRedisSlidingWindow(identifier, config, backend, options);
    recordBackendSuccess(state, now);

    if (!result.success) return { ...result, backend: "upstash-redis" };

    // Mirror successful distributed decisions locally so an outage does not
    // start with an empty safety bucket on this instance.
    const localSafety = checkRateLimit(identifier, config);
    if (!localSafety.success) return { ...localSafety, backend: "memory-safety" };
    return { ...result, backend: "upstash-redis" };
  } catch (error) {
    recordBackendFailure(state, now, backendErrorCode(error));
    return {
      ...checkRateLimit(identifier, config),
      backend: "memory-fallback",
    };
  }
}

function isoTimestamp(value: number | null): string | null {
  return value === null ? null : new Date(value).toISOString();
}

/** Runtime metadata only; never returns URLs, tokens, raw identifiers or keys. */
export function getRateLimitRuntimeStatus(
  options: Pick<DistributedCheckOptions, "env" | "state" | "now"> = {}
): RateLimitRuntimeStatus {
  const env: RateLimitEnvironment =
    options.env ?? (process.env as RateLimitEnvironment);
  const state = options.state ?? globalRuntimeState;
  const now = (options.now ?? Date.now)();
  const config = resolveBackendConfig(env);
  const circuitOpen = state.circuitOpenUntil > now;

  if (config.configurationError) {
    return {
      mode: config.mode,
      status: "misconfigured",
      backend: "memory-fallback",
      configured: config.configured,
      distributed: false,
      circuitOpen,
      consecutiveFailures: state.consecutiveFailures,
      lastSuccessAt: isoTimestamp(state.lastSuccessAt),
      lastFailureAt: isoTimestamp(state.lastFailureAt),
      fallbackReason: config.configurationError,
    };
  }

  if (!config.useRedis) {
    return {
      mode: config.mode,
      status: "local",
      backend: "memory",
      configured: false,
      distributed: false,
      circuitOpen: false,
      consecutiveFailures: 0,
      lastSuccessAt: null,
      lastFailureAt: null,
      fallbackReason: null,
    };
  }

  const degraded = circuitOpen || state.consecutiveFailures > 0;
  return {
    mode: config.mode,
    status: degraded ? "degraded" : "ready",
    backend: degraded ? "memory-fallback" : "upstash-redis",
    configured: true,
    distributed: !degraded,
    circuitOpen,
    consecutiveFailures: state.consecutiveFailures,
    lastSuccessAt: isoTimestamp(state.lastSuccessAt),
    lastFailureAt: isoTimestamp(state.lastFailureAt),
    fallbackReason: circuitOpen ? "redis_circuit_open" : state.lastFailureCode,
  };
}

function normalizeIpCandidate(value: string): string | null {
  let candidate = value.trim();
  if (!candidate || candidate.length > 80) return null;
  if (candidate.startsWith("[") && candidate.includes("]")) {
    candidate = candidate.slice(1, candidate.indexOf("]"));
  } else if (/^\d{1,3}(?:\.\d{1,3}){3}:\d+$/.test(candidate)) {
    candidate = candidate.slice(0, candidate.lastIndexOf(":"));
  }
  return isIP(candidate) ? candidate : null;
}

/** Extracts a validated client address from proxy headers. */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const candidates = [
    req.headers.get("cf-connecting-ip"),
    req.headers.get("x-real-ip"),
    forwarded?.split(",")[0],
  ];
  for (const candidate of candidates) {
    if (!candidate) continue;
    const normalized = normalizeIpCandidate(candidate);
    if (normalized) return normalized;
  }
  return "unknown";
}

/** Builds a scoped key; hashing happens before memory/Redis storage. */
export function makeRateLimitKey(req: Request, prefix: string, userId?: string): string {
  const safePrefix = prefix.trim().slice(0, 160) || "api";
  if (userId) return `${safePrefix}:user:${userId.trim().slice(0, 160)}`;
  return `${safePrefix}:ip:${getClientIp(req)}`;
}

export function rateLimitResponse(retryAfter: number, limit?: number): Response {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
    "Retry-After": String(retryAfter),
    "X-RateLimit-Remaining": "0",
  };
  if (limit !== undefined) headers["X-RateLimit-Limit"] = String(limit);

  return new Response(
    JSON.stringify({
      error: "অনুরোধ সীমা অতিক্রম করেছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।",
      errorEn: "Rate limit exceeded. Please try again later.",
      retryAfter,
    }),
    { status: 429, headers }
  );
}

/** Async because distributed production checks require a Redis round-trip. */
export async function enforceRateLimit(
  _req: Request,
  configKey: keyof typeof RATE_LIMITS,
  identifier: string
): Promise<Response | null> {
  const config = RATE_LIMITS[configKey];
  const result = await checkDistributedRateLimit(identifier, config);
  if (result.success) return null;
  return rateLimitResponse(result.retryAfter, config.maxRequests);
}
