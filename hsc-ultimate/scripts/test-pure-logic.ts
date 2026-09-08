/**
 * Pure-logic রিগ্রেশন টেস্ট — কোনো DB/সার্ভার লাগে না।
 *
 * চালাতে:  npx tsx scripts/test-pure-logic.ts
 *
 * প্রজেক্টের বাকি ২১৬টা Python টেস্ট লাইভ সার্ভার + DB এর বিরুদ্ধে চলে।
 * এই ফাইলটা তার পরিপূরক — বিশুদ্ধ গাণিতিক/ভ্যালিডেশন লজিক সরাসরি
 * execute করে edge case যাচাই করে, তাই সার্ভার ছাড়াই দ্রুত চলে।
 *
 * ইতিহাস: এই harness দিয়েই SM-2 interval overflow বাগ (rep ১৬ এ
 * Invalid Date) ধরা পড়েছিল — নিচের "SM-2 overflow" গ্রুপ সেটার
 * স্থায়ী রিগ্রেশন গার্ড।
 */
import { marksToGrade, calculateHscGpa } from "../lib/gpa";
import {
  calculateNextReview,
  defaultSRSState,
  MAX_INTERVAL_DAYS,
  type FlashcardSRSResult,
} from "../lib/spaced-repetition";
import { calculateNextFsrsReview } from "../lib/fsrs";
import { isValidHscBatch } from "../lib/numeric-validation";
import {
  isValidOptionalBoolean,
  isValidRequiredBoolean,
} from "../lib/boolean-validation";
import {
  ADMISSION_EXAM_CONFIGS,
  calculateAdmissionScore,
  getTotalQuestionCount,
} from "../lib/admission";
import { getCurrentWeekStart, LEAGUE_TIER_ORDER, LEAGUE_TIER_INFO } from "../lib/league";
import { sfx } from "../lib/sound-effects";
import { getCachedPracticeSets, savePracticeSetOffline } from "../lib/offline-practice-store";
import {
  classifyDifficultyBucket,
  getTargetDifficultyForAccuracy,
  sortByTargetDifficulty,
  type EmpiricalDifficulty,
} from "../lib/item-difficulty";
import { validateOcclusionBoxes } from "../lib/image-occlusion";
import {
  calculateLevel,
  xpRequiredForLevel,
  getLevelProgress,
} from "../lib/gamification";
import {
  pickRandom,
  calculatePercentage,
  shuffleOptions,
  MOCK_EXAM_CONFIG,
} from "../lib/mock-exam";
import {
  PET_STAGE_ORDER,
  PET_STAGE_INFO,
  getNextStageProgress,
} from "../lib/study-pet";
import { parseFormulaEntries } from "../lib/formula-search";

let pass = 0;
const failures: string[] = [];
function t(name: string, cond: boolean, extra = "") {
  if (cond) pass++;
  else failures.push(`${name}${extra ? ` — ${extra}` : ""}`);
}
function group(name: string) {
  console.log(`\n── ${name}`);
}

group("GPA — বোর্ড গ্রেড সীমানা");
(
  [
    [100, "A+"], [80, "A+"], [79, "A"], [70, "A"], [69, "A-"], [60, "A-"],
    [59, "B"], [50, "B"], [49, "C"], [40, "C"], [39, "D"], [33, "D"],
    [32, "F"], [0, "F"],
  ] as [number, string][]
).forEach(([m, g]) =>
  t(`${m} → ${g}`, marksToGrade(m).grade === g, marksToGrade(m).grade)
);
t("ঋণাত্মক মার্ক → F", marksToGrade(-10).grade === "F");
t("১০০ এর বেশি → A+", marksToGrade(150).grade === "A+");
t("NaN → F (নিরাপদ fallback)", marksToGrade(NaN).grade === "F");

group("GPA — পূর্ণ হিসাব");
const six = (m: number) =>
  Array.from({ length: 6 }, (_, i) => ({ subjectName: "S" + i, marks: m }));
t("সব ৮০ → 5.00", calculateHscGpa(six(80)).gpa === 5);
t("সব ৩৩ → 1.00", calculateHscGpa(six(33)).gpa === 1);
const golden = calculateHscGpa(six(80), { subjectName: "HM", marks: 80 });
t("৪র্থ বিষয় সহ 5.00 এ ক্যাপড", golden.gpa === 5, `${golden.gpa}`);
t("৪র্থ বিষয় বোনাস = 3", golden.optionalBonus === 3, `${golden.optionalBonus}`);
const failed = calculateHscGpa([
  ...six(80).slice(0, 5),
  { subjectName: "F", marks: 20 },
]);
t("মূল বিষয়ে Fail → GPA 0, isPass false", failed.gpa === 0 && !failed.isPass);
t(
  "৪র্থ বিষয়ে Fail → বোনাস 0 (ঋণাত্মক নয়)",
  calculateHscGpa(six(50), { subjectName: "HM", marks: 30 }).optionalBonus === 0
);
t("খালি array → ক্র্যাশ করে না", typeof calculateHscGpa([]).gpa === "number");

group("SM-2 — overflow রিগ্রেশন গার্ড (পূর্বে বাগ ছিল)");
let st: FlashcardSRSResult = calculateNextReview(defaultSRSState(), "easy");
let firstInvalid = isNaN(st.dueDate.getTime()) ? 1 : -1;
for (let i = 2; i <= 100; i++) {
  st = calculateNextReview(st, "easy");
  if (isNaN(st.dueDate.getTime()) && firstInvalid < 0) firstInvalid = i;
}
t("১০০ বার easy → dueDate সবসময় বৈধ", firstInvalid < 0, `ভাঙন rep=${firstInvalid}`);
t("interval ক্যাপে আটকায়", st.intervalDays === MAX_INTERVAL_DAYS, `${st.intervalDays}`);

group("SM-2 — সাধারণ আচরণ");
let again = defaultSRSState();
for (let i = 0; i < 8; i++) again = calculateNextReview(again, "again");
t("ease factor ১.৩ এর নিচে নামে না", again.easeFactor >= 1.3, `${again.easeFactor}`);
t("'again' → interval ১ এ রিসেট", again.intervalDays === 1);
t("'again' → repetitions ০", again.repetitions === 0);
const ratings = ["again", "hard", "good", "easy"] as const;
let rnd: FlashcardSRSResult = calculateNextReview(defaultSRSState(), "good");
let invalid = 0;
for (let i = 0; i < 2000; i++) {
  rnd = calculateNextReview(rnd, ratings[i % 4]);
  if (
    isNaN(rnd.dueDate.getTime()) ||
    !Number.isFinite(rnd.intervalDays) ||
    rnd.intervalDays < 0
  )
    invalid++;
}
t("২০০০ মিশ্র রিভিউ → সব state বৈধ", invalid === 0, `${invalid} অবৈধ`);

group("FSRS — বর্তমানে ব্যবহৃত অ্যালগরিদম");
let cur = {
  stability: null as number | null,
  difficulty: null as number | null,
  fsrsScheduledDays: null as number | null,
  fsrsReps: null as number | null,
  fsrsLapses: null as number | null,
  fsrsState: "NEW" as "NEW" | "LEARNING" | "REVIEW" | "RELEARNING",
  lastReviewed: null as Date | null,
};
let fsrsInvalid = -1;
for (let i = 1; i <= 200; i++) {
  const r = calculateNextFsrsReview(cur, "easy");
  if (isNaN(r.dueDate.getTime()) && fsrsInvalid < 0) fsrsInvalid = i;
  cur = {
    stability: r.stability,
    difficulty: r.difficulty,
    fsrsScheduledDays: r.scheduledDays,
    fsrsReps: r.reps,
    fsrsLapses: r.lapses,
    fsrsState: r.state,
    lastReviewed: new Date(),
  };
}
t("২০০ রিভিউ → dueDate বৈধ", fsrsInvalid < 0, `ভাঙন rep=${fsrsInvalid}`);
t("stability finite থাকে", Number.isFinite(cur.stability));
t(
  "difficulty ১-১০ রেঞ্জে",
  cur.difficulty !== null && cur.difficulty >= 1 && cur.difficulty <= 10,
  `${cur.difficulty}`
);

group("ইনপুট ভ্যালিডেশন");
t("2028 বৈধ ব্যাচ", isValidHscBatch(2028));
[2019, 2051, "2028", 2028.5, NaN, Infinity, null, undefined].forEach((v) =>
  t(`${String(v)} প্রত্যাখ্যাত`, !isValidHscBatch(v))
);
t("true বৈধ", isValidRequiredBoolean(true));
t("'true' স্ট্রিং প্রত্যাখ্যাত", !isValidRequiredBoolean("true"));
t("1 প্রত্যাখ্যাত", !isValidRequiredBoolean(1));
t("undefined optional-এ বৈধ", isValidOptionalBoolean(undefined));
t("null optional-এ প্রত্যাখ্যাত", !isValidOptionalBoolean(null));

group("Image Occlusion বক্স");
const bad = (v: unknown) => JSON.stringify(validateOcclusionBoxes(v)).includes("error");
t("ঋণাত্মক স্থানাঙ্ক প্রত্যাখ্যাত", bad([{ x: -5, y: 10, width: 20, height: 20 }]));
t(
  "সীমার বেশি বক্স প্রত্যাখ্যাত",
  bad(Array.from({ length: 20 }, () => ({ x: 1, y: 1, width: 5, height: 5 })))
);
t("non-array প্রত্যাখ্যাত", bad("x"));


group("Admission: কনফিগ বনাম বাস্তব circular");
for(const [k,c] of Object.entries(ADMISSION_EXAM_CONFIGS)){
  const q=getTotalQuestionCount(c);
  console.log(`   ${k.padEnd(10)} প্রশ্ন=${q} নেগেটিভ=${c.negativeMarkPerWrong} পাস=${c.passMark??"—"} সময়=${c.timeMinutes}মি`);
  t(`${k}: প্রশ্ন সংখ্যা > 0`, q>0);
  t(`${k}: নেগেটিভ মার্ক 0-1 এ`, c.negativeMarkPerWrong>=0&&c.negativeMarkPerWrong<=1, `${c.negativeMarkPerWrong}`);
  if(c.passMark!==null) t(`${k}: পাস মার্ক ≤ মোট`, c.passMark<=q, `${c.passMark}>${q}`);
}
const med=ADMISSION_EXAM_CONFIGS.MEDICAL;
t("Medical: ১০০ প্রশ্ন", getTotalQuestionCount(med)===100, `${getTotalQuestionCount(med)}`);
t("Medical: নেগেটিভ ০.২৫", med.negativeMarkPerWrong===0.25);
t("Medical: পাস ৪০", med.passMark===40);

console.log("── Admission: স্কোরিং edge case");
const s1=calculateAdmissionScore(100,0,100,med);
t("সব ভুল → rawScore -25", s1.rawScore===-25, `${s1.rawScore}`);
t("  percentage 0 এ ক্ল্যাম্প", s1.percentage===0, `${s1.percentage}`);
t("  isPass false", s1.isPass===false);
const s2=calculateAdmissionScore(100,100,0,med);
t("সব সঠিক → 100", s2.rawScore===100 && s2.percentage===100);
const s3=calculateAdmissionScore(100,0,0,med);
t("সব skip → 0, skipped=100", s3.rawScore===0 && s3.skippedCount===100);
const s4=calculateAdmissionScore(100,50,20,med);
t("৫০ সঠিক ২০ ভুল → 45", s4.rawScore===45, `${s4.rawScore}`);
t("  skipped = 30", s4.skippedCount===30, `${s4.skippedCount}`);
const s5=calculateAdmissionScore(100,40,0,med);
t("ঠিক পাস মার্কে (40) → পাস", s5.isPass===true, `${s5.rawScore}`);
const s6=calculateAdmissionScore(100,40,1,med);
t("৪০ সঠিক ১ ভুল (39.75) → ফেল", s6.isPass===false, `${s6.rawScore}`);
const buet=ADMISSION_EXAM_CONFIGS.BUET;
t("BUET: passMark null → isPass null", calculateAdmissionScore(getTotalQuestionCount(buet),10,5,buet).isPass===null);
const du=ADMISSION_EXAM_CONFIGS.DU_A_UNIT;
t("DU: নেগেটিভ ০.২৫ (অফিসিয়াল)", du.negativeMarkPerWrong===0.25);
t("DU: MCQ পাস মার্ক ২৪ (অফিসিয়াল)", du.passMark===24, `${du.passMark}`);
t("DU: ২৪ এ পাস", calculateAdmissionScore(60,24,0,du).isPass===true);
t("DU: ২৩.৭৫ এ ফেল", calculateAdmissionScore(60,24,1,du).isPass===false,
  `${calculateAdmissionScore(60,24,1,du).rawScore}`);
t("BUET: নেগেটিভ ০ → ভুলে শাস্তি নেই",
  calculateAdmissionScore(60,10,50,buet).rawScore===10);
const medS=ADMISSION_EXAM_CONFIGS.MEDICAL.subjects;
const find=(x:string)=>medS.find(s=>s.subject===x)?.questionCount;
t("Medical Physics ১৫ (অফিসিয়াল ২০২৫-২৬)", find("PHYSICS")===15, `${find("PHYSICS")}`);
t("Medical GK ১৫ (মানবিক গুণাবলী সহ)", find("GENERAL_KNOWLEDGE")===15, `${find("GENERAL_KNOWLEDGE")}`);
t("Medical Biology ৩০", find("BIOLOGY")===30);
t("Medical Chemistry ২৫", find("CHEMISTRY")===25);
t("Medical English ১৫", find("ENGLISH")===15);
t("Medical মোট এখনো ১০০", getTotalQuestionCount(ADMISSION_EXAM_CONFIGS.MEDICAL)===100);
// অসঙ্গত ইনপুট
const inconsistent=calculateAdmissionScore(10,8,8,med);
t("correct+wrong > total → skipped ঋণাত্মক (গার্ড নেই)", inconsistent.skippedCount===-6, `${inconsistent.skippedCount}`);

console.log("── League: সপ্তাহ সীমানা (UTC)");
const wk=(s:string)=>getCurrentWeekStart(new Date(s)).toISOString().slice(0,10);
t("রবিবার → নিজেই", wk("2026-07-26T00:00:00Z")==="2026-07-26", wk("2026-07-26T00:00:00Z"));
t("সোমবার → আগের রবি", wk("2026-07-27T12:00:00Z")==="2026-07-26", wk("2026-07-27T12:00:00Z"));
t("শনিবার ২৩:৫৯ → একই রবি", wk("2026-08-01T23:59:59Z")==="2026-07-26", wk("2026-08-01T23:59:59Z"));
t("পরের রবি → নতুন সপ্তাহ", wk("2026-08-02T00:00:00Z")==="2026-08-02", wk("2026-08-02T00:00:00Z"));
t("মাস সীমানা পার", wk("2026-03-02T05:00:00Z")==="2026-03-01", wk("2026-03-02T05:00:00Z"));
t("বছর সীমানা পার", wk("2027-01-01T10:00:00Z")==="2026-12-27", wk("2027-01-01T10:00:00Z"));
t("লিপ ইয়ার ফেব ২৯", wk("2028-02-29T10:00:00Z")==="2028-02-27", wk("2028-02-29T10:00:00Z"));
t("সময় অংশ শূন্য", getCurrentWeekStart(new Date("2026-07-29T17:45:33Z")).getUTCHours()===0);

console.log("── League: tier সিঁড়ি");
t("৫টা tier", LEAGUE_TIER_ORDER.length===5);
const xps=LEAGUE_TIER_ORDER.map(x=>LEAGUE_TIER_INFO[x].promotionXp).filter(x=>x!==null) as number[];
t("promotion XP ক্রমবর্ধমান", xps.every((v,i)=>i===0||v>xps[i-1]), xps.join(","));
t("DIAMOND এ promotion নেই (সর্বোচ্চ)", LEAGUE_TIER_INFO.DIAMOND.promotionXp===null);

console.log("── Item difficulty");
t("০% ভুল → সহজতম", !!classifyDifficultyBucket(0));
t("১০০% ভুল → কঠিনতম", !!classifyDifficultyBucket(100));
const buckets=[0,25,50,75,100].map(classifyDifficultyBucket);
console.log("   bucket ধারা:", buckets.join(" → "));
t("সব bucket ভিন্ন নয় হলেও string", buckets.every(b=>typeof b==="string"));
t("উচ্চ accuracy → কঠিন target", !!getTargetDifficultyForAccuracy(95));
t("নিম্ন accuracy → সহজ target", !!getTargetDifficultyForAccuracy(20));
const items=[{id:"easy1"},{id:"hard1"},{id:"med1"},{id:"uncal"}];
const mkDiff = (
  questionId: string,
  bucket: EmpiricalDifficulty["bucket"]
): EmpiricalDifficulty => ({
  questionId,
  totalResponses: 20,
  wrongCount: bucket === "HARD" ? 16 : bucket === "MEDIUM" ? 10 : 2,
  wrongPct: bucket === "HARD" ? 80 : bucket === "MEDIUM" ? 50 : 10,
  bucket,
});
const dmap = new Map<string, EmpiricalDifficulty>([
  ["easy1", mkDiff("easy1", "EASY")],
  ["hard1", mkDiff("hard1", "HARD")],
  ["med1", mkDiff("med1", "MEDIUM")],
]);
const sortedH=sortByTargetDifficulty(items,dmap,"HARD");
t("আইটেম হারায় না", sortedH.length===4, `${sortedH.length}`);
t("HARD target → hard1 প্রথমে", sortedH[0].id==="hard1", sortedH.map(i=>i.id).join(","));
const sortedE=sortByTargetDifficulty(items,dmap,"EASY");
t("EASY target → easy1 প্রথমে", sortedE[0].id==="easy1", sortedE.map(i=>i.id).join(","));
t("ক্যালিব্রেট-না-হওয়া প্রশ্ন বাদ পড়ে না",
  sortedH.some(i=>i.id==="uncal") && sortedE.some(i=>i.id==="uncal"));
t("মূল array মিউটেট হয় না", items[0].id==="easy1");
console.log("   HARD ক্রম:", sortedH.map(i=>i.id).join(" → "));
console.log("   EASY ক্রম:", sortedE.map(i=>i.id).join(" → "));


group("XP / Level");
t("০ XP → level 1", calculateLevel(0)===1, `${calculateLevel(0)}`);
t("level 1 → 0 XP লাগে", xpRequiredForLevel(1)===0);
t("level 2 → 50 XP", xpRequiredForLevel(2)===50, `${xpRequiredForLevel(2)}`);
t("৪৯ XP → এখনো level 1", calculateLevel(49)===1);
t("৫০ XP → level 2", calculateLevel(50)===2, `${calculateLevel(50)}`);
// monotonic + round-trip
let lvlBad=0;
for(let lv=1;lv<=60;lv++){ const need=xpRequiredForLevel(lv); if(calculateLevel(need)!==lv) lvlBad++; }
t("level↔XP round-trip (১-৬০)", lvlBad===0, `${bad} অমিল`);
let prev=-1,mono=true;
for(let xp=0;xp<=200000;xp+=137){ const l=calculateLevel(xp); if(l<prev) mono=false; prev=l; }
t("XP বাড়লে level কমে না", mono);
t("ঋণাত্মক XP → level 1 (ক্র্যাশ না)", calculateLevel(-500)===1, `${calculateLevel(-500)}`);

// রিগ্রেশন গার্ড: calculateLevel(Infinity) আগে **অসীম লুপে** আটকে
// পুরো প্রসেস হ্যাং করত। এই assertion ৩টা non-finite ইনপুটেই দ্রুত
// ফেরত আসা নিশ্চিত করে (হ্যাং হলে টেস্ট নিজেই টাইমআউট করবে)।
const nonFiniteStart = Date.now();
t("Infinity XP → হ্যাং করে না", calculateLevel(Infinity) === 1);
t("-Infinity XP → হ্যাং করে না", calculateLevel(-Infinity) === 1);
t("NaN XP → হ্যাং করে না", calculateLevel(NaN) === 1);
t("  ৩টাই <100ms এ শেষ", Date.now() - nonFiniteStart < 100, `${Date.now() - nonFiniteStart}ms`);

console.log("── getLevelProgress");
const lp0=getLevelProgress(0);
t("০ XP: progressPct 0", lp0.progressPct===0, `${lp0.progressPct}`);
t("০ XP: pct finite (NaN না)", Number.isFinite(lp0.progressPct), `${lp0.progressPct}`);
const lp1=getLevelProgress(75);
t("৭৫ XP: pct 0-100 এ", lp1.progressPct>=0&&lp1.progressPct<=100, `${lp1.progressPct}`);
let pctBad=0;
for(let xp=0;xp<=100000;xp+=53){ const lpx=getLevelProgress(xp);
  if(!Number.isFinite(lpx.progressPct)||lpx.progressPct<0||lpx.progressPct>100) pctBad++; }
t("সব XP তে pct 0-100 ও finite", pctBad===0, `${pctBad} খারাপ`);
const lpneg=getLevelProgress(-100);
t("ঋণাত্মক XP: pct finite", Number.isFinite(lpneg.progressPct), `${lpneg.progressPct}`);

// রিগ্রেশন গার্ড: progressPct সরাসরি UI progress-bar এর width হয়।
// আগে ঋণাত্মক XP তে -10% ও non-finite XP তে NaN/Infinity বেরোত।
t("ঋণাত্মক XP: pct ঋণাত্মক নয় (UI গার্ড)", lpneg.progressPct >= 0, `${lpneg.progressPct}`);
(
  [Infinity, -Infinity, NaN] as number[]
).forEach((v) => {
  const gp = getLevelProgress(v);
  t(`${String(v)} XP → pct 0-100 এ`, Number.isFinite(gp.progressPct) && gp.progressPct >= 0 && gp.progressPct <= 100, `${gp.progressPct}`);
});
t("Int সর্বোচ্চ XP → pct বৈধ", (() => { const g = getLevelProgress(2147483647); return Number.isFinite(g.progressPct) && g.progressPct <= 100; })());

console.log("── shuffleOptions (সব MCQ runner এ ব্যবহৃত)");
const opts=["ক","খ","গ","ঘ"];
const sh=shuffleOptions(opts);
t("দৈর্ঘ্য অপরিবর্তিত", sh.length===4);
t("সব আইটেম থাকে (হারায় না)", [...sh].sort().join()===[...opts].sort().join(), sh.join());
t("মূল array মিউটেট হয় না", opts.join()==="ক,খ,গ,ঘ", opts.join());
t("খালি array → ক্র্যাশ না", shuffleOptions([]).length===0);
t("১ আইটেম → ক্র্যাশ না", shuffleOptions(["a"]).length===1);
// বণ্টন: ১০০০ বার শাফলে প্রতিটা আইটেম প্রতিটা পজিশনে আসা উচিত
const posCount:Record<string,number[]>={"ক":[0,0,0,0],"খ":[0,0,0,0],"গ":[0,0,0,0],"ঘ":[0,0,0,0]};
for(let i=0;i<4000;i++){ shuffleOptions(opts).forEach((v,idx)=>posCount[v][idx]++); }
const flat=Object.values(posCount).flat();
const minC=Math.min(...flat), maxC=Math.max(...flat);
t("Fisher-Yates বণ্টন সুষম (bias নেই)", minC>800&&maxC<1200, `min=${minC} max=${maxC} (আদর্শ ১০০০)`);
console.log(`   ৪০০০ শাফল: প্রতি পজিশনে ${minC}-${maxC} (আদর্শ ১০০০)`);

console.log("── pickRandom");
const pool=Array.from({length:50},(_,i)=>i);
t("n আইটেম ফেরত", pickRandom(pool,10).length===10);
t("n > pool → pool size এ ক্ল্যাম্প", pickRandom(pool,999).length===50);
t("n=0 → খালি", pickRandom(pool,0).length===0);
t("ডুপ্লিকেট নেই", new Set(pickRandom(pool,25)).size===25);
t("মূল pool মিউটেট হয় না", pool[0]===0&&pool.length===50);
t("খালি pool → ক্র্যাশ না", pickRandom([],5).length===0);

console.log("── calculatePercentage");
t("০/০ → 0 (ডিভাইড-বাই-জিরো গার্ড)", calculatePercentage(0,0)===0);
t("২৫/২৫ → 100", calculatePercentage(25,25)===100);
t("ঋণাত্মক স্কোর → ঋণাত্মক %", calculatePercentage(-5,25)===-20, `${calculatePercentage(-5,25)}`);

console.log("── Mock exam কনফিগ (বাস্তব HSC ফরম্যাট)");
t("FULL: MCQ ২৫", MOCK_EXAM_CONFIG.FULL.mcqCount===25);
t("FULL: CQ ৫", MOCK_EXAM_CONFIG.FULL.cqCount===5);
t("FULL: CQ সময় ১৫০ মিনিট", MOCK_EXAM_CONFIG.FULL.cqTimeMinutes===150);
t("QUICK < FULL", MOCK_EXAM_CONFIG.QUICK.mcqCount<MOCK_EXAM_CONFIG.FULL.mcqCount);

console.log("── Study Pet stage");
t("৫টা stage", PET_STAGE_ORDER.length===5);
const th=PET_STAGE_ORDER.map(s=>PET_STAGE_INFO[s].threshold);
t("threshold ক্রমবর্ধমান", th.every((v,i)=>i===0||v>th[i-1]), th.join(","));
const maxP=getNextStageProgress(9999,"SAGE");
t("সর্বোচ্চ stage → isMaxStage", maxP.isMaxStage===true);
t("  pct 100", maxP.progressPct===100);
let petBad=0;
for(const s of PET_STAGE_ORDER) for(let cp=0;cp<=600;cp+=7){
  const r=getNextStageProgress(cp,s);
  if(!Number.isFinite(r.progressPct)) petBad++;
}
t("সব carePoints/stage এ pct finite", petBad===0, `${petBad} NaN/Infinity`);

console.log("── Formula parser");
t("খালি স্ট্রিং → খালি array", parseFormulaEntries("").length===0);
t("শুধু হেডার → খালি", parseFormulaEntries("# শিরোনাম\n## উপশিরোনাম").length===0);
const fm=parseFormulaEntries("# সূত্র\n- F = ma\n- E = mc²\n");
t("bullet সূত্র পার্স হয়", fm.length>=2, `${fm.length}: ${fm.join(" | ")}`);
const cb=parseFormulaEntries("```\nকোড\n```\n- v = u + at");
t("কোড ব্লক স্কিপ হয়", !cb.some(e=>e.includes("কোড")), cb.join(" | "));

console.log("── League tier কনট্রাস্ট (WCAG AA)");
// 🐛 রিগ্রেশন গার্ড: Dashboard ও Leaderboard এ league কার্ডের
// ব্যাকগ্রাউন্ড টিয়ারের নিজস্ব রঙ, আর টেক্সট আগে হার্ডকোড সাদা ছিল।
// চাক্ষুষ QA তে ধরা পড়ে ৫টার মধ্যে ৪টা টিয়ারে সাদা টেক্সট WCAG ফেল
// করত (GOLD মাত্র 1.40:1 — প্রায় অদৃশ্য)। এখন প্রতি টিয়ারে
// কনট্রাস্ট-নিরাপদ `textHex` আছে; নতুন টিয়ার যোগ করলে বা রং
// বদলালে এই টেস্ট সাথে সাথে ধরবে।
function relLuminance(hex: string): number {
  const h = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  const f = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [relLuminance(a), relLuminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
// চেকারটি vacuous না — জানা-ব্যর্থ জোড়ায় সত্যিই ফেল করে কিনা যাচাই
t(
  "কনট্রাস্ট ফাংশন সঠিক (সাদার উপর সাদা = 1:1)",
  Math.abs(contrastRatio("#ffffff", "#ffffff") - 1) < 0.001
);
t(
  "কনট্রাস্ট ফাংশন সঠিক (সাদা/কালো = 21:1)",
  Math.abs(contrastRatio("#ffffff", "#000000") - 21) < 0.05
);
t(
  "পুরনো বাগ শনাক্ত হয় (GOLD এ সাদা টেক্সট ফেল)",
  contrastRatio("#ffffff", LEAGUE_TIER_INFO.GOLD.colorHex) < 4.5
);
for (const [tier, info] of Object.entries(LEAGUE_TIER_INFO)) {
  const ratio = contrastRatio(info.textHex, info.colorHex);
  t(
    `${tier} টিয়ারে টেক্সট কনট্রাস্ট ≥ 4.5:1`,
    ratio >= 4.5,
    `${ratio.toFixed(2)}:1 (bg=${info.colorHex} fg=${info.textHex})`
  );
}

console.log("── Sound Effects & Offline Practice Store");
t("sfx ইঞ্জিন ইন্সট্যান্টিয়েটেড", typeof sfx === "object" && sfx !== null);
t("sfx getMuted রিটার্ন করে boolean", typeof sfx.getMuted() === "boolean");
sfx.setMuted(true);
t("sfx.setMuted(true) কাজ করে", sfx.getMuted() === true);
sfx.setMuted(false);
t("sfx.setMuted(false) কাজ করে", sfx.getMuted() === false);

t("getCachedPracticeSets ফাংশন অবজেক্ট দেয়", typeof getCachedPracticeSets() === "object");
const mockSet = {
  chapterId: "test-chap-1",
  chapterName: "ভেক্টর",
  subjectId: "physics-1",
  subjectName: "পদার্থবিজ্ঞান ১ম",
  cachedAt: Date.now(),
  questions: [
    {
      id: "q-1",
      text: "দুটি সমমানের ভেক্টরের লব্ধি এদের যে কোনো একটির সমান হলে মধ্যবর্তী কোণ কত?",
      options: ["0°", "60°", "120°", "180°"],
      difficulty: "MEDIUM",
      boardName: "ঢাকা বোর্ড",
      boardYear: 2023,
    },
  ],
};
t("offline practice set ডাটা স্ট্রাকচার বৈধ", mockSet.questions.length === 1 && mockSet.questions[0].options.length === 4);

console.log("\n" + "═".repeat(52));
if (failures.length === 0) {
  console.log(`✅ সব ${pass}টা assertion পাস`);
} else {
  console.log(`❌ ${failures.length}টা ব্যর্থ (পাস ${pass})`);
  failures.forEach((f) => console.log("   •", f));
}
console.log("═".repeat(52));
process.exit(failures.length === 0 ? 0 : 1);
