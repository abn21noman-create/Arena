# Fast Development Workflow

এই workflow-এর উদ্দেশ্য হলো প্রতিটি ছোট পরিবর্তনের পরে ২–৩ মিনিটের production build না চালিয়ে দ্রুত এবং নির্ভরযোগ্যভাবে কাজ করা।

## একবারের setup

Node.js 22 LTS ব্যবহার করুন।

```bash
npm run setup
```

এটি:

1. `package-lock.json` বদলেছে কিনা দেখে; unchanged হলে dependency install skip করে
2. Prisma Client generate করে
3. Environment doctor চালায়

Database status-সহ:

```bash
npm run setup -- --check-db
```

Migration apply করতে স্পষ্টভাবে:

```bash
npm run setup -- --migrate
```

Android sync-সহ:

```bash
npm run setup -- --android
```

## প্রতিদিন development

```bash
npm run dev
```

Next.js Turbopack শুধু যে page পরিবর্তন হয়েছে সেটাই compile করবে। Development-এর সময় production build চালানোর দরকার নেই।

## Code change-এর পরে quick check

```bash
npm run verify
```

এটি sequential ও low-memory-safe ভাবে চালায়:

- Incremental TypeScript
- Cached ESLint
- Unit tests

প্রথম run cache তৈরি করে; পরের unchanged run এই project-এ প্রায় ১৪ সেকেন্ডে শেষ হয়েছে:

- TypeScript: ~৭ সেকেন্ড
- ESLint: ~২ সেকেন্ড
- Unit tests: ~৩ সেকেন্ড

## বড় feature/commit-এর আগে

```bash
npm run verify:full
```

Quick checks-এর সঙ্গে আরও চালায়:

- ১৬২ pure-logic assertion
- ৬৮৮ core MCQ + ২২০ admission MCQ = ৯০৮ source entry/৬৪ CQ seed integrity
- Prisma validation
- Production dependency audit
- Secret shape validation

## Release-এর আগে production build

```bash
npm run build
```

Smart build wrapper:

- Webpack memory optimization ব্যবহার করে
- প্রতি ১০ সেকেন্ডে progress দেখায়
- ৩ GB-এর কম RAM ও swap না থাকলে temporary 2 GB swap তৈরির চেষ্টা করে
- build শেষে temporary swap নিজে বন্ধ ও delete করে
- `HSC_BUILD_HEAP_MB` দিয়ে heap override করা যায়

```bash
HSC_BUILD_HEAP_MB=1800 npm run build
```

প্রতিটি code change-এর পরে এটি চালাবেন না। Release/major checkpoint-এ চালাবেন।

## Android check আলাদা

Web কাজের সময় Android Gradle build চালানোর দরকার নেই। Native code পরিবর্তনের পরে:

```bash
npm run android:check
```

প্রয়োজন:

- JDK 21
- Android SDK 36
- `ANDROID_HOME` বা `ANDROID_SDK_ROOT`

এটি `testDebugUnitTest`, `assembleDebug` ও `lintDebug` চালায়। Low-RAM machine-এ temporary swap + single worker ব্যবহার করে এবং শেষে swap পরিষ্কার করে।

## Diagnostics

```bash
npm run doctor
```

এটি secret value print না করে Node/npm, project files, dependencies, Prisma Client, required environment-variable names, AI fallback count, optional FCM, Focus scheduler readiness, local/distributed rate-limiter configuration এবং RAM/swap status দেখায়।

## Cache সমস্যা হলে

```bash
npm run clean
npm run setup
npm run verify
```

## কেন cloud workspace-এ প্রথমবার সময় লাগে

`node_modules`, `.next`, Android `build` এবং অন্যান্য generated cache project source-এর অংশ নয়। নতুন clean/cloud environment-এ প্রথমবার `npm ci` ও compile লাগবে। নিজের PC-তে এগুলো থেকে যায়, তাই দ্বিতীয় ও পরের run অনেক দ্রুত হবে। Lockfile unchanged থাকলে smart setup reinstall করবে না।

## Command summary

| কাজ | Command |
|---|---|
| প্রথম setup | `npm run setup` |
| Dev server | `npm run dev` |
| দ্রুত যাচাই | `npm run verify` |
| পূর্ণ যাচাই | `npm run verify:full` |
| Production build | `npm run build` |
| Environment diagnosis | `npm run doctor` |
| Android compile/lint | `npm run android:check` |
| MCQ read-only reconciliation | `npm run audit:mcq` |
| MCQ incremental dry-run | `npm run db:import-mcq` |
| Reviewed MCQ apply | `npm run db:import-mcq -- --apply` |
| Academic content snapshot | `npm run snapshot:content` |
| Offline snapshot verify | `npm run snapshot:verify -- backups/file.json` |
| Live release preflight | `npm run release:preflight` |
| Strict deployment gate | `npm run release:preflight:strict` |
| Performance audit | `npm run audit:performance` |
| Strict performance gate | `npm run audit:performance:strict` |
| API security audit | `npm run audit:security` |
| Strict security gate | `npm run audit:security:strict` |
| Privacy compliance audit | `npm run audit:privacy` |
| Strict privacy gate | `npm run audit:privacy:strict` |
| Runtime truth/integrity gate | `npm run audit:integrity:strict` |
| Privacy live E2E (writes + exact cleanup) | `npm run test:privacy-e2e` |
| Academic report live E2E | `npm run test:academic-report-e2e` |
| Multi-AI review dry run | `npm run review:ai -- --limit 3 --target-type CORE_MCQ` |
| Multi-AI review apply | `npm run review:ai:apply -- --limit 3 --target-type CORE_MCQ` |
| Clean generated cache | `npm run clean` |
