# Distributed Rate Limiting — Production Hardening

**তারিখ:** ৪ আগস্ট ২০২৬  
**Status:** Implemented; Upstash credentials optional/external

## কেন এই পরিবর্তন

আগের limiter শুধু process-local `Map` ব্যবহার করত। একটি server instance-এ এটি ঠিকভাবে কাজ করলেও serverless/multi-instance deployment-এ প্রতিটি instance-এর counter আলাদা হতো। ফলে ৫টি login attempt-এর limit দুইটি instance-এ কার্যত ১০টি হয়ে যেতে পারত।

এখন একই API তিনটি mode সমর্থন করে:

| Mode | আচরণ |
|---|---|
| `auto` (default) | URL+token দুটো থাকলে Upstash Redis; না থাকলে bounded local memory |
| `memory` | সবসময় local memory; development/single-instance-এর জন্য |
| `upstash` | Redis ব্যবহারের explicit production intent; config/error health-এ degraded দেখায় |

## Architecture

### Distributed path

প্রতিটি request-এ Redis-এর একটি atomic Lua script চালায়:

1. current sliding window-এর আগের sorted-set member সরায়;
2. window-এর বর্তমান request count পড়ে;
3. limit পূর্ণ হলে oldest request থেকে `Retry-After` হিসাব করে;
4. allowed হলে unique member atomically যোগ করে;
5. key-তে window-সমান expiry বসায়।

এটি read-then-write race ছাড়া সব instance-এ একই global counter ব্যবহার করে। Fixed window boundary burst নয়; প্রকৃত sliding-window semantics থাকে।

### Privacy-preserving key

Redis key-তে raw IP, user ID বা endpoint identifier লেখা হয় না। Key তৈরি হয়:

```text
SHA-256(window + limit + scoped identifier)
```

ফলে Redis dashboard/log থেকে সরাসরি user ID/IP পড়া যায় না। Token বা Redis URL কোনো status/API response-এ ফেরত যায় না।

### Safe fallback

Configured Redis ব্যর্থ হলে rate limit বন্ধ হয়ে যায় না:

- request per-instance bounded memory limiter দিয়ে check হয়;
- successful Redis decision local memory-তেও mirror হয়, যাতে outage শুরু হলে bucket একদম খালি না থাকে;
- পরপর ৩টি Redis failure হলে ৩০ সেকেন্ড circuit breaker খোলে;
- circuit চলাকালে slow backend call না করে memory fallback ব্যবহৃত হয়;
- recovery-র প্রথম successful Redis call failure state reset করে।

Fallback availability বজায় রাখে, তবে Redis outage-এর সময় global multi-instance guarantee সাময়িকভাবে per-instance guarantee-তে নেমে যায়। `/api/health` এটি `degraded` হিসেবে প্রকাশ করে।

## Memory safety

Local limiter-ও harden করা হয়েছে:

- সর্বোচ্চ ৫০,০০০ bucket;
- expired bucket periodic cleanup;
- capacity পূর্ণ হলে expired/oldest bucket eviction;
- identifier আগে SHA-256 hash;
- config window/limit key-এর অংশ, তাই ভিন্ন policy counter collide করে না;
- invalid/অতিরিক্ত বড় proxy IP header গ্রহণ করা হয় না;
- `Retry-After`, `X-RateLimit-Limit`, `X-RateLimit-Remaining` standard response headers।

## Environment setup

### Local/single-instance

কোনো নতুন credential লাগে না:

```env
RATE_LIMIT_BACKEND="auto"
```

Credential না থাকলে local memory mode চলবে।

### Multi-instance production

Upstash Redis REST database তৈরি করে server-only environment variables বসাতে হবে:

```env
RATE_LIMIT_BACKEND="upstash"
RATE_LIMIT_REDIS_TIMEOUT_MS="800"
RATE_LIMIT_REDIS_PREFIX="hsc-ultimate:rate-limit:v1"
UPSTASH_REDIS_REST_URL="https://YOUR-DATABASE.upstash.io"
UPSTASH_REDIS_REST_TOKEN="YOUR_SERVER_ONLY_TOKEN"
```

নিরাপত্তা:

- token কখনো `NEXT_PUBLIC_*` variable-এ রাখা যাবে না;
- browser/mobile bundle-এ token যাবে না;
- production secret manager ব্যবহার করতে হবে;
- reverse proxy অবশ্যই client-supplied forwarding header overwrite করবে;
- সরাসরি internet-facing Node server হলে trusted proxy configuration আলাদাভাবে নিশ্চিত করতে হবে।

## Runtime visibility

`GET /api/health` এখন secret-free rate-limit status দেয়:

```json
{
  "checks": {
    "rateLimit": {
      "mode": "upstash",
      "status": "ready",
      "backend": "upstash-redis",
      "configured": true,
      "distributed": true,
      "circuitOpen": false,
      "consecutiveFailures": 0,
      "lastSuccessAt": "...",
      "lastFailureAt": null,
      "fallbackReason": null
    }
  }
}
```

সম্ভাব্য status:

- `local` — intentional/default memory mode;
- `ready` — distributed config ready এবং recent failure নেই;
- `degraded` — Redis failure/circuit open, memory fallback active;
- `misconfigured` — partial credential, invalid URL বা explicit `upstash` mode-এ credential নেই।

`npm run doctor` secret value না দেখিয়ে local/distributed/partial configuration জানায়। `npm run check:secrets` partial pair, non-HTTPS URL এবং invalid mode block করে।

## Protected call sites

Async distributed enforcement এখন ব্যবহার করে:

- Credentials login
- Registration
- Forgot/reset password
- AI Chat
- Admin Focus, scheduling ও analytics/export
- Shared `protectApiRoute`-এর সব Focus/Native Device/Singularity route

Backup/Content/System/Scheduler/Native guardsসহ direct/shared strict call site **57** (direct 16 + shared 41)। এর বাইরে proxy-level baseline এখন সব **240/240 API route** rate-limit করে; endpoint-specific limits অপরিবর্তিত।

## Test coverage

Unit tests যাচাই করে:

- local allow/block এবং identifier isolation;
- validated IPv4/IPv6 extraction;
- unconfigured `auto` → memory;
- mocked atomic Redis allow;
- mocked Redis block + `Retry-After`;
- raw identifier Redis payload-এ অনুপস্থিত;
- network failure → memory fallback;
- ৩ failure-এর পর circuit breaker;
- status response-এ token অনুপস্থিত;
- partial config detection;
- explicit memory override।

Real Upstash network test credential না থাকায় চালানো হয়নি; implementation native REST/fetch ব্যবহার করে, নতুন npm dependency যোগ করেনি।

## Verification result

- Current environment: `auto` → `memory` (Upstash credential absent; expected)
- Direct health integration: HTTP 200, database up, limiter `local`, secret-free status
- TypeScript: 0 error
- ESLint: 0 warning
- Current project unit tests: **93/93** pass (rate-limit tests 9/9 + API baseline tests 7/7)
- Pure logic: 162/162
- Seed integrity: 688 core + 220 admission + 64 CQ
- Production dependency audit: 0 vulnerability
- Current production build: compile + TypeScript + **206/206** static generation, exit 0
- Preview/dev server: চালু করা হয়নি

## Relevant files

- `lib/rate-limit.ts`
- `lib/api-security.ts`
- `app/api/health/route.ts`
- `tests/unit/rate-limit.test.ts`
- `.env.example`
- `.env.local.example`
- `scripts/doctor.mjs`
- `scripts/check-secrets.ts`
