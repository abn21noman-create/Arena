# 🧠 FSRS Algorithm Upgrade — Implementation-Ready Design Doc

> **স্ট্যাটাস**: ✅ **সম্পন্ন হয়েছে** (৮ জুলাই ২০২৬) — সম্পূর্ণ ইমপ্লিমেন্ট,
> build+lint+multi-user live test+DB verify সব সম্পন্ন। বিস্তারিত ফলাফল
> `docs/MASTER_PLAN.md` এর "Phase F — FSRS Algorithm Upgrade" সেকশনে আছে।
> নিচের ডকুমেন্টটা মূল ডিজাইন প্ল্যান হিসেবে রেফারেন্সের জন্য অক্ষত রাখা হলো।
>
> **কেন এই ফিচার**: `docs/FEATURE_RESEARCH.md` এর Tier 3 তালিকায় ছিল
> "FSRS algorithm upgrade (SM-2 থেকে)" — Flashcards মডিউলে (Phase 4) বর্তমানে

> SM-2 (1987 সালের অ্যালগরিদম, Anki-স্টাইল) ব্যবহার হচ্ছে। FSRS (Free Spaced
> Repetition Scheduler) এখন Anki-এর ডিফল্ট (v23.10+ থেকে), এবং SM-2-এর তুলনায়
> **২০-৩০% কম review** এ একই retention rate দেয়, prediction accuracy ৪% mean
> absolute error বনাম SM-2-এর ~১৪% (500M+ Anki review log এর উপর benchmark
> করা)।

---

## ১. Deep Research সারাংশ (web_search দিয়ে ভেরিফাই করা, ২০২৫-২৬ তথ্য)

### SM-2 এর সীমাবদ্ধতা ("Ease Hell")
- একটামাত্র variable (ease factor) দিয়ে সব হিসাব করে: `new_interval = old_interval × ease_factor`
- কার্ড কয়েকবার ভুল হলে ease factor অপরিবর্তনীয়ভাবে কমে যায় ("ease hell") —
  কার্ড প্রতিদিন ফেরত আসতে থাকে, কখনো বড় interval এ যায় না
- শুধু **সর্বশেষ রেটিং** ব্যবহার করে, পুরো review history আমলে নেয় না
- forgetting model নেই — literally `R = 0.9^(t/interval)` assume করে, ব্যক্তিভেদে ভিন্নতা ধরে না

### FSRS কীভাবে কাজ করে
FSRS প্রতিটা কার্ডে ৩টা variable রাখে (DSR মডেল — Difficulty, Stability, Retrievability):
- **Difficulty (D)**: ১-১০ স্কেল, কার্ডটা কতটা সহজাতভাবে কঠিন। **Mean-reversion**
  ব্যবহার করে — একটানা সঠিক উত্তরের পর ধীরে ধীরে baseline এ ফিরে আসে (SM-2 এর
  "ease hell" এর architectural সমাধান — permanently damaged হয় না)
- **Stability (S)**: দিন এককে, retrievability ১০০%→৯০% এ নামতে কত দিন লাগবে তার
  measure। S=30 মানে ৩০ দিন পর ৯০% সম্ভাবনা মনে থাকার
- **Retrievability (R)**: এই মুহূর্তে মনে থাকার সম্ভাব্যতা — forgetting curve
  ফর্মুলা দিয়ে হিসাব: `R(t, S) = (1 + t/(9×S))^(-0.5)` (FSRS ≤5) অথবা নতুন
  ভার্সনে `R = (1 + FACTOR × t/S)^DECAY` যেখানে trainable `DECAY` parameter
- ১৭-২১টা trainable weight parameter (default: কোটি কোটি real Anki review
  থেকে fit করা), ব্যবহারকারীর personal review history (~১০০০+ review) থাকলে
  ব্যক্তিগত optimize করা সম্ভব (কিন্তু আমাদের implementation এ শুরুতে **শুধু
  default parameters** ব্যবহার করব — per-user optimization ভবিষ্যতের জন্য
  রাখা হবে, complexity কম রাখতে)
- একটা `request_retention` টার্গেট থাকে (সাধারণত ০.৮-০.৯৭, ডিফল্ট ০.৯) — এর
  ভিত্তিতে পরের ঠিক কবে review করাতে হবে তা হিসাব হয়

### লাইব্রেরি: `ts-fsrs` (npm)
- অফিসিয়াল TypeScript ইমপ্লিমেন্টেশন (open-spaced-repetition org দ্বারা
  maintained, MIT license)
- `npm install ts-fsrs` (Node.js ≥20 দরকার — আমাদের প্রজেক্টে ইতিমধ্যে আছে)
- মূল API:
  ```ts
  import { createEmptyCard, fsrs, generatorParameters, Rating } from "ts-fsrs";

  const params = generatorParameters({ request_retention: 0.9, maximum_interval: 36500 });
  const scheduler = fsrs(params);
  const card = createEmptyCard(new Date()); // নতুন কার্ডের জন্য initial state

  // preview সব সম্ভাব্য outcome (again/hard/good/easy চারটাই)
  const preview = scheduler.repeat(card, new Date());
  console.log(preview[Rating.Good].card); // Good রেটিং দিলে card এর নতুন state

  // অথবা সরাসরি নির্দিষ্ট রেটিং দিয়ে next state বের করা (আমাদের API pattern এর জন্য এটাই সুবিধাজনক)
  const result = scheduler.next(card, new Date(), Rating.Good);
  // result.card = নতুন state, result.log = review log entry
  ```
- `Card` টাইপে থাকে: `due` (পরের review date), `stability`, `difficulty`,
  `elapsed_days`, `scheduled_days`, `reps`, `lapses`, `state` (New/Learning/
  Review/Relearning), `last_review`

---

## ২. আমাদের Implementation Strategy

### সিদ্ধান্ত: নতুন ফিল্ড যোগ + Migration (in-place upgrade, নতুন মডেল না)

**কেন নতুন Flashcard মডেল বানানো হবে না**: বিদ্যমান `Flashcard` মডেলে ইতিমধ্যে
৫০০+ কার্ড থাকতে পারে (deck সহ), সব due date/review history সহ। নতুন মডেল
বানালে migration script লিখে পুরনো ডেটা ট্রান্সফার করতে হবে যেটা অপ্রয়োজনীয়
জটিলতা — বরং বিদ্যমান মডেলে নতুন column যোগ করে দুটো algorithm-ই সাপোর্ট করব।

### Schema পরিবর্তন (`prisma/schema.prisma`)

```prisma
enum SrsAlgorithm {
  SM2 // পুরনো Anki-স্টাইল অ্যালগরিদম (ব্যাকওয়ার্ড কম্প্যাটিবিলিটির জন্য রাখা)
  FSRS // নতুন ডিফল্ট
}

enum FsrsCardState {
  NEW
  LEARNING
  REVIEW
  RELEARNING
}

model Flashcard {
  id     String        @id @default(cuid())
  deckId String
  deck   FlashcardDeck @relation(fields: [deckId], references: [id], onDelete: Cascade)

  front    String  @db.Text
  back     String  @db.Text
  imageUrl String?

  // পুরনো SM-2 ফিল্ড (অপরিবর্তিত রাখা হচ্ছে, নতুন কার্ডে ব্যবহার হবে না
  // কিন্তু বিদ্যমান কার্ডের ঐতিহাসিক ডেটা হিসেবে সংরক্ষিত থাকবে)
  easeFactor   Float     @default(2.5)
  intervalDays Int       @default(0)
  repetitions  Int       @default(0)
  dueDate      DateTime  @default(now())
  lastReviewed DateTime?

  // নতুন: কোন algorithm ব্যবহার হচ্ছে এই কার্ডে (per-card, migration flexible রাখতে)
  srsAlgorithm SrsAlgorithm @default(FSRS) // নতুন কার্ড ডিফল্টে FSRS পাবে

  // নতুন FSRS-specific ফিল্ড (nullable, কারণ SM2 কার্ডে এগুলো ব্যবহার হয় না)
  fsrsStability     Float?
  fsrsDifficulty    Float?
  fsrsElapsedDays   Int?          @default(0)
  fsrsScheduledDays Int?          @default(0)
  fsrsReps          Int?          @default(0)
  fsrsLapses        Int?          @default(0)
  fsrsState         FsrsCardState? @default(NEW)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([deckId])
  @@index([deckId, dueDate])
  @@map("flashcards")
}
```

**নোট**: `dueDate` কলাম **দুটো algorithm এই শেয়ার** করবে (একই query দিয়ে due
card বের করা সহজ থাকবে) — FSRS হিসাব করার পর `dueDate` ফিল্ডে সেই নতুন due
date বসিয়ে দেওয়া হবে (FSRS এর নিজস্ব `card.due` ভ্যালু থেকে)।

**Migration চালানোর পরে অবশ্যই**:
```bash
pnpm exec tsx scripts/fix-vector-index.ts   # pgvector HNSW ইনডেক্স পুনরুদ্ধার
                                              # (Prisma migrate dev প্রতিবার ড্রপ করে দেয়,
                                              # documented recurring bug, ইতিমধ্যে ৫ বার ঘটেছে)
```
(অথবা `pnpm db:migrate` ব্যবহার করা, যা এই দুটো chain করে)

### নতুন লাইব্রেরি ফাইল: `lib/fsrs.ts`

```ts
// ts-fsrs wrapper — আমাদের DB schema এর সাথে map করার জন্য
import { fsrs, generatorParameters, Rating, State, createEmptyCard, type Card as FsrsCard } from "ts-fsrs";

// আমাদের প্রজেক্টের রেটিং নাম (again/hard/good/easy) কে ts-fsrs এর Rating enum এ ম্যাপ করা
const RATING_MAP = {
  again: Rating.Again,
  hard: Rating.Hard,
  good: Rating.Good,
  easy: Rating.Easy,
} as const;

const params = generatorParameters({ request_retention: 0.9, maximum_interval: 36500 });
const scheduler = fsrs(params);

export interface FsrsDbState {
  stability: number | null;
  difficulty: number | null;
  elapsedDays: number;
  scheduledDays: number;
  reps: number;
  lapses: number;
  state: "NEW" | "LEARNING" | "REVIEW" | "RELEARNING";
  lastReviewed: Date | null;
}

export function calculateNextFsrsReview(current: FsrsDbState, rating: ReviewRating) {
  // DB state কে ts-fsrs Card অবজেক্টে কনভার্ট
  const card: FsrsCard = current.stability === null
    ? createEmptyCard(current.lastReviewed ?? new Date())
    : {
        due: new Date(), // ব্যবহার হয় না next() কলে, placeholder
        stability: current.stability,
        difficulty: current.difficulty!,
        elapsed_days: current.elapsedDays,
        scheduled_days: current.scheduledDays,
        reps: current.reps,
        lapses: current.lapses,
        state: STATE_MAP[current.state],
        last_review: current.lastReviewed ?? undefined,
      };

  const result = scheduler.next(card, new Date(), RATING_MAP[rating]);
  return {
    dueDate: result.card.due,
    stability: result.card.stability,
    difficulty: result.card.difficulty,
    elapsedDays: result.card.elapsed_days,
    scheduledDays: result.card.scheduled_days,
    reps: result.card.reps,
    lapses: result.card.lapses,
    state: STATE_MAP_REVERSE[result.card.state],
  };
}
```

### Review API পরিবর্তন (`app/api/flashcards/[cardId]/review/route.ts`)

লজিক: `card.srsAlgorithm` চেক করে হয় `calculateNextReview()` (পুরনো SM-2,
`lib/spaced-repetition.ts`) নয়তো `calculateNextFsrsReview()` (নতুন, `lib/fsrs.ts`)
কল করা হবে — conditional branching, দুটো ফাংশনই কোডে থাকবে (কোনোটা delete
করা হবে না, ব্যাকওয়ার্ড কম্প্যাটিবিলিটির জন্য)।

```ts
const nextReview = card.srsAlgorithm === "FSRS"
  ? calculateNextFsrsReview({ stability: card.fsrsStability, difficulty: card.fsrsDifficulty, ... }, rating)
  : calculateNextReview({ easeFactor: card.easeFactor, intervalDays: card.intervalDays, repetitions: card.repetitions }, rating);
```

### Backward Compatibility (গুরুত্বপূর্ণ সিদ্ধান্ত)
- **বিদ্যমান কার্ড** (migration এর আগে তৈরি হওয়া) `srsAlgorithm` কলাম যোগ
  হওয়ার সময় Prisma migration এ `@default(FSRS)` বসাবে — কিন্তু তাদের FSRS
  fields (`fsrsStability` ইত্যাদি) সব `null` থাকবে (নতুন কলাম, ডিফল্ট null)।
  এই ক্ষেত্রে review API কে detect করতে হবে "FSRS marked কিন্তু fsrsStability
  null" মানে "এটা আসলে এখনো SM-2 state এ আছে, প্রথমবার review করলে FSRS এ
  migrate করো" — **অথবা সহজ সমাধান**: migration script এ সব বিদ্যমান কার্ডে
  explicit `srsAlgorithm = SM2` সেট করে দেওয়া (নতুন কার্ডই শুধু FSRS পাবে)।
  **এটাই বেছে নেওয়া হবে** — কম জটিল, স্পষ্ট বিভাজন।
- migration.sql এ যোগ করতে হবে (Prisma auto-generate করবে না এই data
  backfill part, ম্যানুয়ালি `UPDATE "flashcards" SET "srsAlgorithm" = 'SM2';`
  যোগ করতে হবে migration file এ, অথবা migration এর পরে আলাদা script/psql
  কমান্ড দিয়ে backfill করতে হবে)
- এভাবে: পুরনো কার্ড চিরকাল SM-2 এ থেকে যাবে (কাজ করতে থাকবে, কিছু ভাঙবে না),
  নতুন কার্ড (এবং চাইলে ভবিষ্যতে "convert to FSRS" বাটন দিয়ে ইউজার নিজে
  পুরনো কার্ড আপগ্রেড করতে পারবে — Phase 2 হিসেবে বিবেচনা করা যায়, প্রথম
  ভার্সনে লাগবে না)

### UI পরিবর্তন
- `components/flashcards/review-runner.tsx` — কোনো পরিবর্তন লাগবে না আসলে!
  Rating বাটন (again/hard/good/easy) একই থাকবে, API endpoint একই থাকবে,
  শুধু ভেতরের হিসাব বদলাবে। **এটা একটা বড় সুবিধা** — UI backward compatible,
  শুধু backend algorithm পরিবর্তন।
- ঐচ্ছিক নতুন UI: Deck Detail পেজে প্রতিটা কার্ডের পাশে ছোট badge
  ("SM-2" বা "FSRS") দেখানো যায় (transparency, debugging সুবিধা) — নিচু
  priority, প্রথম ভার্সনে নাও থাকতে পারে
- ঐচ্ছিক (ভবিষ্যতের জন্য): Settings এ "Desired Retention" স্লাইডার
  (০.৮-০.৯৭) — এখন hardcoded ০.৯ রাখা হবে, per-user customization পরে

### `prisma/seed.ts` ও অন্য কোথাও Flashcard তৈরি হচ্ছে কিনা চেক করা দরকার
- Manual card add (`app/api/flashcard-decks/[deckId]/cards/route.ts`), AI
  generate (`generate-ai/route.ts`), OCR generate — এই ৩ জায়গায় নতুন
  Flashcard তৈরি হয়, সবগুলোতে ডিফল্ট `srsAlgorithm: "FSRS"` (schema default
  দিয়ে auto হয়ে যাবে, আলাদা কোড পরিবর্তন লাগার কথা না) — তবে verify করে
  দেখতে হবে explicit `easeFactor`/`intervalDays` পাস করছে কিনা কোথাও (যদি
  করে, সেটা অপ্রাসঙ্গিক হয়ে যাবে নতুন কার্ডে, কিন্তু ক্ষতি নেই কারণ FSRS
  fields আলাদা)

---

## ৩. Live Test Plan (sandbox ফিরে এলে চালানো হবে)

1. `pnpm add ts-fsrs` — dependency ইনস্টল, `package.json`/`pnpm-lock.yaml` আপডেট ভেরিফাই
2. Schema পরিবর্তন করে `pnpm exec prisma migrate dev --name add_fsrs_algorithm`
   — migration.sql রিভিউ করে backfill statement (পুরনো কার্ডে SM2 সেট) ম্যানুয়ালি
   যোগ করা প্রয়োজনে
3. **সবসময়ের মতো**: migration এর পরপরই `pnpm exec tsx scripts/fix-vector-index.ts`
   চালিয়ে HNSW ইনডেক্স ভেরিফাই/পুনরুদ্ধার করা (documented recurring bug)
4. `lib/fsrs.ts` লিখে standalone script (`test-fsrs.mjs`, root এ temporarily,
   পরে delete) দিয়ে ts-fsrs এর raw output verify করা (createEmptyCard →
   Again/Hard/Good/Easy চারটা রেটিং এর জন্য প্রত্যাশিত interval range মিলছে
   কিনা — যেমন প্রথম "Good" রেটিং এ ~১ দিন পরে due, বারবার "Good" দিলে
   ধীরে ধীরে interval বাড়া উচিত)
5. Review API আপডেট করে পুরনো SM-2 টেস্ট ইউজার (`srsAlgorithm=SM2` সেট করা
   কার্ড) দিয়ে verify — এখনো আগের মতো SM-2 ফর্মুলা কাজ করছে (regression test)
6. নতুন কার্ড তৈরি করে (`srsAlgorithm=FSRS` ডিফল্ট) — একই কার্ডে বার বার
   "again"→"good"→"good"→"easy" রেটিং সিকোয়েন্স দিয়ে:
   - stability/difficulty প্রতিবার sensible ভাবে বদলাচ্ছে কিনা (again এ
     stability কমা/lapses বাড়া উচিত, ধারাবাহিক good/easy এ stability বাড়া
     উচিত)
   - dueDate প্রতিবার যুক্তিসঙ্গতভাবে ভবিষ্যতে সরে যাচ্ছে কিনা
   - `fsrsState` NEW→LEARNING→REVIEW ট্রানজিশন সঠিক কিনা
7. একই ডেকে SM-2 ও FSRS কার্ড মিশ্রিত রেখে `/due` endpoint কল করে verify —
   দুই ধরনের কার্ডই একসাথে সঠিকভাবে (dueDate অনুযায়ী) ফেরত আসছে কিনা, review
   API উভয়ের জন্য সঠিক branch এ যাচ্ছে কিনা (isCorrect algorithm ব্যবহার
   হচ্ছে ভেরিফাই করতে DB তে সরাসরি query করে fsrsStability != null vs null
   চেক করা)
8. Edge case: প্রথমবার review করা (state=NEW, stability=null) — crash না
   করে ঠিকভাবে initial state তৈরি হচ্ছে কিনা
9. `pnpm build` + `pnpm lint` — clean থাকা নিশ্চিত করা
10. cascade delete ভেরিফাই — নতুন কলাম যোগ হওয়ায় কোনো constraint ভাঙছে না,
    টেস্ট ইউজার+deck+flashcard delete করলে সব ঠিকভাবে মুছে যাচ্ছে
11. টেস্ট ডেটা ক্লিন করা, `docs/MASTER_PLAN.md`/`README.md` বিস্তারিত আপডেট

---

## ৪. সীমাবদ্ধতা/ভবিষ্যতের কাজ (আগে থেকেই স্বচ্ছভাবে জানানো)

- **Per-user parameter optimization** এখন করা হবে না — ts-fsrs এর default
  weight ব্যবহার হবে (millions of real Anki review থেকে fit করা, generic
  কিন্তু ভালো starting point)। ভবিষ্যতে একজন ইউজারের ১০০০+ review হয়ে গেলে
  `ts-fsrs` এর optimizer (`fsrs-rs`/Python ব্যাকএন্ড লাগে সাধারণত, সেটা এই
  প্রজেক্টের scope এর বাইরে — শুধু default parameter দিয়েই যথেষ্ট উন্নতি হবে)
- **পুরনো কার্ড auto-migrate হবে না** — ইচ্ছাকৃতভাবে SM2 এ থেকে যাবে, শুধু
  নতুন কার্ড FSRS পাবে (নিরাপদ, non-breaking approach)। ভবিষ্যতে ইউজার চাইলে
  "সব পুরনো কার্ড FSRS এ কনভার্ট করো" বাটন যোগ করা যায় (কনভার্সন লজিক: পুরনো
  SM-2 interval/repetitions থেকে approximate FSRS stability/difficulty
  estimate করা — RemNote/Anki এর নিজস্ব migration হিউরিস্টিক থেকে শেখা যায়)
- **Desired Retention কাস্টমাইজেশন UI** প্রথম ভার্সনে থাকবে না, hardcoded ০.৯

---

**এই ডকুমেন্ট ready — sandbox ফিরে এলে সরাসরি এখান থেকে implementation
শুরু করা হবে, ধাপ ১ (schema পরিবর্তন) থেকে।**
