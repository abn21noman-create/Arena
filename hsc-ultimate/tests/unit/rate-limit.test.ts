import { describe, expect, it, vi } from "vitest";
import {
  checkDistributedRateLimit,
  checkRateLimit,
  createRateLimitRuntimeState,
  getClientIp,
  getRateLimitRuntimeStatus,
  makeRateLimitKey,
} from "@/lib/rate-limit";

describe("API rate limiting", () => {
  it("allows requests up to the configured in-memory limit and then blocks", () => {
    const key = `unit:${crypto.randomUUID()}`;
    const config = { maxRequests: 2, windowMs: 60_000 };
    expect(checkRateLimit(key, config)).toEqual({ success: true, remaining: 1 });
    expect(checkRateLimit(key, config)).toEqual({ success: true, remaining: 0 });
    const blocked = checkRateLimit(key, config);
    expect(blocked.success).toBe(false);
    if (!blocked.success) expect(blocked.retryAfter).toBeGreaterThan(0);
  });

  it("isolates counters by identifier", () => {
    const suffix = crypto.randomUUID();
    const config = { maxRequests: 1, windowMs: 60_000 };
    expect(checkRateLimit(`a:${suffix}`, config).success).toBe(true);
    expect(checkRateLimit(`b:${suffix}`, config).success).toBe(true);
  });

  it("extracts only a validated first forwarded IP", () => {
    const request = new Request("https://example.test", {
      headers: { "x-forwarded-for": "203.0.113.10, 10.0.0.1" },
    });
    expect(getClientIp(request)).toBe("203.0.113.10");
    expect(makeRateLimitKey(request, "auth")).toBe("auth:ip:203.0.113.10");

    const invalidForwarded = new Request("https://example.test", {
      headers: {
        "x-forwarded-for": "attacker-controlled-value",
        "cf-connecting-ip": "2001:db8::1",
      },
    });
    expect(getClientIp(invalidForwarded)).toBe("2001:db8::1");
  });

  it("uses a user ID for authenticated scoped keys", () => {
    const request = new Request("https://example.test");
    expect(makeRateLimitKey(request, "ai", "user-1")).toBe("ai:user:user-1");
  });

  it("uses local memory in auto mode when Redis is not configured", async () => {
    const fetchMock = vi.fn(async () => new Response()) as unknown as typeof fetch;
    const result = await checkDistributedRateLimit(
      `auto-memory:${crypto.randomUUID()}`,
      { maxRequests: 2, windowMs: 60_000 },
      { env: {}, fetchImpl: fetchMock }
    );
    expect(result).toMatchObject({ success: true, backend: "memory" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("uses an atomic Redis decision and hashes the raw identifier", async () => {
    const rawIdentifier = `user-sensitive:${crypto.randomUUID()}`;
    const fetchMock = vi.fn<typeof fetch>();
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ result: [1, 4, 0] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );
    const state = createRateLimitRuntimeState();
    const result = await checkDistributedRateLimit(
      rawIdentifier,
      { maxRequests: 5, windowMs: 60_000 },
      {
        env: {
          RATE_LIMIT_BACKEND: "upstash",
          UPSTASH_REDIS_REST_URL: "https://example.upstash.io",
          UPSTASH_REDIS_REST_TOKEN: "test-token-not-a-real-secret",
        },
        fetchImpl: fetchMock as unknown as typeof fetch,
        state,
        now: () => 1_700_000_000_000,
        nonce: () => "nonce",
      }
    );

    expect(result).toEqual({ success: true, remaining: 4, backend: "upstash-redis" });
    expect(state.consecutiveFailures).toBe(0);
    const requestInit = fetchMock.mock.calls[0]?.[1];
    expect(requestInit).toBeDefined();
    expect(String(requestInit?.body)).not.toContain(rawIdentifier);
    expect(JSON.parse(String(requestInit?.body))[0]).toBe("EVAL");
  });

  it("returns the Redis retry decision without consuming a local fallback slot", async () => {
    const fetchMock = vi.fn(async () =>
      new Response(JSON.stringify({ result: [0, 0, 17] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );
    const result = await checkDistributedRateLimit(
      `redis-block:${crypto.randomUUID()}`,
      { maxRequests: 1, windowMs: 60_000 },
      {
        env: {
          RATE_LIMIT_BACKEND: "auto",
          UPSTASH_REDIS_REST_URL: "https://example.upstash.io",
          UPSTASH_REDIS_REST_TOKEN: "test-token-not-a-real-secret",
        },
        fetchImpl: fetchMock as unknown as typeof fetch,
        state: createRateLimitRuntimeState(),
      }
    );
    expect(result).toEqual({ success: false, retryAfter: 17, backend: "upstash-redis" });
  });

  it("falls back to memory and opens a circuit after repeated Redis failures", async () => {
    const failingFetch = vi.fn(async () => {
      throw new Error("offline");
    });
    const state = createRateLimitRuntimeState();
    const env = {
      RATE_LIMIT_BACKEND: "upstash",
      UPSTASH_REDIS_REST_URL: "https://example.upstash.io",
      UPSTASH_REDIS_REST_TOKEN: "test-token-not-a-real-secret",
    };
    const config = { maxRequests: 10, windowMs: 60_000 };
    const identifier = `fallback:${crypto.randomUUID()}`;
    const options = {
      env,
      fetchImpl: failingFetch as unknown as typeof fetch,
      state,
      now: () => 10_000,
    };

    for (let attempt = 0; attempt < 3; attempt += 1) {
      const result = await checkDistributedRateLimit(identifier, config, options);
      expect(result.backend).toBe("memory-fallback");
    }
    const circuitResult = await checkDistributedRateLimit(identifier, config, options);
    expect(circuitResult.backend).toBe("memory-fallback");
    expect(failingFetch).toHaveBeenCalledTimes(3);

    const status = getRateLimitRuntimeStatus({ env, state, now: () => 10_000 });
    expect(status).toMatchObject({
      status: "degraded",
      backend: "memory-fallback",
      circuitOpen: true,
      distributed: false,
    });
    expect(JSON.stringify(status)).not.toContain("test-token-not-a-real-secret");
  });

  it("surfaces partial configuration but allows an explicit memory override", () => {
    const partial = getRateLimitRuntimeStatus({
      env: {
        RATE_LIMIT_BACKEND: "upstash",
        UPSTASH_REDIS_REST_URL: "https://example.upstash.io",
      },
    });
    expect(partial).toMatchObject({
      status: "misconfigured",
      backend: "memory-fallback",
      distributed: false,
    });

    const forcedMemory = getRateLimitRuntimeStatus({
      env: {
        RATE_LIMIT_BACKEND: "memory",
        UPSTASH_REDIS_REST_URL: "not-a-url",
      },
    });
    expect(forcedMemory).toMatchObject({
      status: "local",
      backend: "memory",
      distributed: false,
    });
  });
});
