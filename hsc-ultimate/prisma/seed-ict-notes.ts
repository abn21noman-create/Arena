// ===================================================================
// ICT (তথ্য ও যোগাযোগ প্রযুক্তি) — গুরুত্বপূর্ণ টপিকে Notes+Formula
// Sheet Seed Script
// -------------------------------------------------------------------
// Physics/Chemistry/Biology/Higher Math Notes Seed ফিচারগুলোর সরাসরি
// ধারাবাহিকতা — একই প্রমাণিত প্যাটার্নে ICT এর ৬টা isImportant=true
// টপিকে বাস্তব কনটেন্ট যোগ করা হচ্ছে। এই ফিচারে প্রথমবারের মতো
// ফেন্সড কোড ব্লক (তিনটা ব্যাকটিক দিয়ে) ব্যবহার করা হয়েছে (HTML/C/SQL
// কোড উদাহরণ) — MarkdownLite ও PDF renderer দুটোতেই নতুন কোড ব্লক
// সাপোর্ট যোগ করা হয়েছে এই ফিচারের অংশ হিসেবে।
//
// নোট: এই ফাইলে ব্যাকটিক (`) চরিত্র \u0060 ইউনিকোড এস্কেপ দিয়ে লেখা
// হয়েছে, কারণ কনটেন্ট নিজেই ব্যাকটিক-ডিলিমিটেড TypeScript template
// literal এর ভেতরে থাকে — literal backtick ব্যবহার করলে string
// terminate হয়ে যেত (nested backtick conflict)।
//
// তথ্যসূত্র (web_search দিয়ে verify করা, ২০২৬ জুলাই):
// - নেটওয়ার্কের প্রকারভেদ: PAN/LAN/MAN/WAN তুলনা, টপোলজি
//   (logiczerobd.wordpress.com, sattacademy.com, shaktiict.com)
// - বাইনারি/অক্টাল/হেক্সাডেসিমেল: রূপান্তর নিয়ম
//   (iit-bd.org, shaktiict.com, 10minuteschool.com, edupointbd.com)
// - বুলিয়ান অ্যালজেবরা: AND/OR/NOT, সত্যক সারণি, ডি-মরগ্যানের উপপাদ্য
//   (edupointbd.com, banglanewsexpress.com, sattacademy.com)
// - HTML ট্যাগ পরিচিতি: মৌলিক ট্যাগ, টেবিল, attribute
//   (pavelsarwar.com, ictdemy.com, edupointbd.com)
// - C প্রোগ্রামিং বেসিক: ভ্যারিয়েবল, if-else, for/while loop
//   (ebookbou.edu.bd, sattacademy.com, amirul12.gitbooks.io)
// - SQL কুয়েরি: SELECT/INSERT/UPDATE/DELETE syntax
//   (klikgss.com, codecademy.com)
//
// রান করার নিয়ম: pnpm exec tsx prisma/seed-ict-notes.ts
// idempotent — বার বার চালালে আগের নোট/ফর্মুলাশীট মুছে নতুন করে বসাবে।
// ===================================================================
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ব্যাকটিক ক্যারেক্টার — টেমপ্লেট লিটারেলের ভেতরে literal backtick এর
// বিকল্প হিসেবে ব্যবহৃত (string concatenation দিয়ে inject করা হয়)
const BT = String.fromCharCode(96); // `
const FENCE = BT + BT + BT; // ```

interface TopicContentSeed {
  notesMarkdown: string;
  formulaSheet: string;
}

const contentByTopic: Record<string, TopicContentSeed> = {
  "নেটওয়ার্কের প্রকারভেদ": {
    notesMarkdown: `# নেটওয়ার্কের প্রকারভেদ

## কম্পিউটার নেটওয়ার্ক কী
একাধিক কম্পিউটার বা ডিভাইসকে পরস্পর সংযুক্ত করে তথ্য আদান-প্রদানের ব্যবস্থাকে **কম্পিউটার নেটওয়ার্ক** বলে।

## ভৌগোলিক বিস্তৃতি অনুযায়ী নেটওয়ার্কের প্রকারভেদ

### PAN (Personal Area Network)
কোনো ব্যক্তির নিকটবর্তী ডিভাইসগুলোর (ল্যাপটপ, মোবাইল, প্রিন্টার) মধ্যে তথ্য আদান-প্রদানের নেটওয়ার্ক। HSC ICT পাঠ্যধারা অনুযায়ী বিস্তৃতি সাধারণত **সর্বোচ্চ ১০ মিটার**। উদাহরণ: ব্লুটুথ।

### LAN (Local Area Network)
সীমিত এলাকায় (বাড়ি, অফিস, ক্যাম্পাস) বিস্তৃত নেটওয়ার্ক, সাধারণত **১০ কিমি বা তার কম**। উচ্চ গতি, সহজ রক্ষণাবেক্ষণ। উদাহরণ: অফিস নেটওয়ার্ক (WiFi/টুইস্টেড পেয়ার ক্যাবল)।

### MAN (Metropolitan Area Network)
একটি শহর বা মেট্রোপলিটন এলাকা জুড়ে বিস্তৃত, একাধিক LAN নিয়ে গঠিত, প্রায় **৫০ কিমি** পর্যন্ত। উদাহরণ: ওয়াইম্যাক্স প্রযুক্তি ব্যবহারকারী শহরব্যাপী নেটওয়ার্ক।

### WAN (Wide Area Network)
বিস্তৃত ভৌগোলিক অঞ্চল (দেশ/মহাদেশ) জুড়ে বিস্তৃত, একাধিক LAN/MAN নিয়ে গঠিত। উদাহরণ: ইন্টারনেট।

## PAN, LAN, MAN, WAN তুলনা

| বৈশিষ্ট্য | PAN | LAN | MAN | WAN |
|---|---|---|---|---|
| বিস্তৃতি | সর্বোচ্চ ১০ মিটার | ≤১০ কিমি | ~৫০ কিমি | বিস্তৃত অঞ্চল |
| গতি | সবচেয়ে বেশি | বেশি | মাঝারি | সবচেয়ে কম |
| রক্ষণাবেক্ষণ | সহজ | সহজ | কঠিন | কঠিন |
| প্রযুক্তি | ব্লুটুথ | WiFi | ওয়াইম্যাক্স | ইন্টারনেট |

## নেটওয়ার্ক টপোলজি
নেটওয়ার্কে ডিভাইসগুলো কীভাবে সংযুক্ত থাকে তার বিন্যাসকে **টপোলজি** বলে:
- **বাস (Bus)**: সব ডিভাইস একটি কেন্দ্রীয় ক্যাবলের সাথে যুক্ত
- **স্টার (Star)**: সব ডিভাইস একটি কেন্দ্রীয় হাব/সুইচের সাথে যুক্ত
- **রিং (Ring)**: ডিভাইসগুলো বৃত্তাকারে সংযুক্ত
- **মেশ (Mesh)**: প্রতিটি ডিভাইস অন্য সব ডিভাইসের সাথে সরাসরি সংযুক্ত (সবচেয়ে নির্ভরযোগ্য)`,
    formulaSheet: `## নেটওয়ার্কের প্রকারভেদ — সারাংশ

| প্রকার | বিস্তৃতি | প্রযুক্তি |
|---|---|---|
| PAN | সর্বোচ্চ ১০ মিটার | ব্লুটুথ |
| LAN | ≤১০ কিমি | WiFi |
| MAN | ~৫০ কিমি | ওয়াইম্যাক্স |
| WAN | বিস্তৃত অঞ্চল | ইন্টারনেট |

- টপোলজি প্রকার: বাস, স্টার, রিং, মেশ, ট্রি, হাইব্রিড
- সবচেয়ে নির্ভরযোগ্য টপোলজি: মেশ`,
  },

  "বাইনারি, অক্টাল, হেক্সাডেসিমেল": {
    notesMarkdown: `# বাইনারি, অক্টাল, হেক্সাডেসিমেল

## সংখ্যা পদ্ধতির ভিত্তি (Base)
- **বাইনারি (Binary)**: ভিত্তি ২, অঙ্ক 0,1
- **অক্টাল (Octal)**: ভিত্তি ৮, অঙ্ক 0-7
- **দশমিক (Decimal)**: ভিত্তি ১০, অঙ্ক 0-9
- **হেক্সাডেসিমেল (Hexadecimal)**: ভিত্তি ১৬, অঙ্ক 0-9, A-F

## দশমিক থেকে বাইনারি/অক্টাল/হেক্সাডেসিমেল রূপান্তর
পূর্ণ সংখ্যাকে যথাক্রমে **২, ৮, ১৬** দ্বারা ভাগ করতে থাকতে হয় (ভাগফল শূন্য না হওয়া পর্যন্ত), এবং ভাগশেষগুলো নিচ থেকে উপরে সাজালে কাঙ্ক্ষিত সংখ্যা পাওয়া যায়। ভগ্নাংশের ক্ষেত্রে **গুণ** করতে হয়।

## বাইনারি থেকে অক্টাল রূপান্তর
বাইনারি সংখ্যাকে ডান দিক থেকে **৩ বিট করে** গ্রুপ করে প্রতি গ্রুপের সমতুল্য অক্টাল অঙ্ক (0-7) বসাতে হয়। গ্রুপে অঙ্ক কম পড়লে বামে শূন্য বসিয়ে পূর্ণ করতে হয়।

উদাহরণ: $(1011001)_2 = 001\\ 011\\ 001 = (131)_8$

## বাইনারি থেকে হেক্সাডেসিমেল রূপান্তর
বাইনারি সংখ্যাকে ডান দিক থেকে **৪ বিট করে** গ্রুপ করে প্রতি গ্রুপের সমতুল্য হেক্সাডেসিমেল অঙ্ক (0-9, A-F) বসাতে হয়।

উদাহরণ: $(11010110)_2 = 1101\\ 0110 = (D6)_{16}$

## অক্টাল-হেক্সাডেসিমেল পারস্পরিক রূপান্তর
সরাসরি রূপান্তরের সূত্র নেই — প্রথমে **বাইনারি** এর মধ্যস্থতায় রূপান্তর করে তারপর কাঙ্ক্ষিত পদ্ধতিতে নিতে হয় (এটাই সহজতম পদ্ধতি)।

## যেকোনো পদ্ধতি থেকে দশমিকে রূপান্তর
প্রতিটি অঙ্কের নিজস্ব মানকে তার স্থানীয় মান (base এর ঘাত) দিয়ে গুণ করে যোগফল নিতে হয়:
$$(a_na_{n-1}...a_1a_0)_b = a_n \\times b^n + ... + a_1 \\times b^1 + a_0 \\times b^0$$

## ব্যবহারিক প্রয়োগ
বাইনারি কম্পিউটারের মৌলিক ভাষা (ON/OFF সিগন্যাল), হেক্সাডেসিমেল মেমরি ঠিকানা ও রঙের কোড (যেমন CSS ${BT}#FF5733${BT}) প্রকাশে ব্যবহৃত হয়।`,
    formulaSheet: `## সংখ্যা পদ্ধতি রূপান্তর — সারাংশ

| থেকে | দিকে | পদ্ধতি |
|---|---|---|
| দশমিক | বাইনারি/অক্টাল/হেক্সা | পূর্ণাংশ ভাগ (২/৮/১৬), ভগ্নাংশ গুণ |
| বাইনারি | অক্টাল | ডান থেকে ৩ বিট গ্রুপ |
| বাইনারি | হেক্সাডেসিমেল | ডান থেকে ৪ বিট গ্রুপ |
| যেকোনো | দশমিক | স্থানীয় মান দ্বারা গুণ ও যোগ |

**দশমিকে রূপান্তর সূত্র:**
$$(a_na_{n-1}...a_0)_b = \\sum a_i \\times b^i$$`,
  },

  "বুলিয়ান অ্যালজেবরা": {
    notesMarkdown: `# বুলিয়ান অ্যালজেবরা

## বুলিয়ান অ্যালজেবরা কী
বুলিয়ান অ্যালজেবরা লজিকের **সত্য (1/TRUE)** ও **মিথ্যা (0/FALSE)** — এই দুটি স্তরের উপর ভিত্তি করে তৈরি, যা ৩টি মৌলিক লজিক্যাল অপারেশন (AND, OR, NOT) নিয়ে কাজ করে।

## মৌলিক অপারেশন
- **AND (·)**: উভয় ইনপুট সত্য (1) হলেই আউটপুট সত্য
- **OR (+)**: যেকোনো একটি ইনপুট সত্য হলেই আউটপুট সত্য
- **NOT (')**: ইনপুটের বিপরীত মান

## সত্যক সারণি (Truth Table)
বুলিয়ান ফাংশনের চলকসমূহের বিভিন্ন মানবিন্যাসের জন্য আউটপুট প্রদর্শনকারী সারণিকে **সত্যক সারণি** বলে।

| A | B | A·B (AND) | A+B (OR) |
|---|---|---|---|
| 0 | 0 | 0 | 0 |
| 0 | 1 | 0 | 1 |
| 1 | 0 | 0 | 1 |
| 1 | 1 | 1 | 1 |

$n$ সংখ্যক চলকের জন্য সত্যক সারণিতে ইনপুট সংখ্যা $= 2^n$।

## ডি-মরগ্যানের উপপাদ্য
**প্রথম উপপাদ্য**: যেকোনো সংখ্যক চলকের যৌক্তিক যোগের পূরক, প্রত্যেক চলকের পূরকের যৌক্তিক গুণের সমান:
$$(A+B)' = A' \\cdot B'$$

**দ্বিতীয় উপপাদ্য**: যেকোনো সংখ্যক চলকের যৌক্তিক গুণের পূরক, প্রত্যেক চলকের পূরকের যৌক্তিক যোগের সমান:
$$(A \\cdot B)' = A' + B'$$

## মৌলিক ও যৌগিক গেট
- **মৌলিক গেট**: AND, OR, NOT — বুলিয়ান অ্যালজেবরার মৌলিক অপারেশন বাস্তবায়ন করে
- **যৌগিক গেট**: দুই বা ততোধিক মৌলিক গেটের সমন্বয়ে তৈরি, যেমন NAND (AND+NOT), NOR (OR+NOT)
- **সার্বজনীন গেট**: NAND ও NOR — এদের দিয়েই যেকোনো লজিক ফাংশন তৈরি করা যায়
- **বিশেষ গেট**: XOR, XNOR

## বুলিয়ান দ্বৈতনীতি (Duality)
একটি বৈধ সমীকরণে **AND↔OR** এবং **0↔1** পরস্পর বদলে নিলে আরেকটি বৈধ সমীকরণ পাওয়া যায়।`,
    formulaSheet: `## বুলিয়ান অ্যালজেবরা — সূত্রাবলি

**ডি-মরগ্যানের উপপাদ্য:**
$$(A+B)' = A' \\cdot B'$$
$$(A \\cdot B)' = A' + B'$$

**সত্যক সারণিতে ইনপুট সংখ্যা** ($n$ চলকের জন্য): $2^n$

| গেট | প্রকার |
|---|---|
| AND, OR, NOT | মৌলিক |
| NAND, NOR | সার্বজনীন |
| XOR, XNOR | বিশেষ |`,
  },

  "HTML ট্যাগ পরিচিতি": {
    notesMarkdown:
      `# HTML ট্যাগ পরিচিতি

## HTML কী
**HTML (HyperText Markup Language)** হলো ওয়েব পেজ তৈরির মূল ভাষা, যা ট্যাগ ব্যবহার করে কনটেন্টের গঠন সংজ্ঞায়িত করে।

## HTML ডকুমেন্টের মৌলিক কাঠামো
` +
      FENCE +
      `html
<html>
<head>
  <title>পেজের শিরোনাম</title>
</head>
<body>
  <h1>প্রধান শিরোনাম</h1>
  <p>এখানে অনুচ্ছেদ লেখা হয়।</p>
</body>
</html>
` +
      FENCE +
      `

## গুরুত্বপূর্ণ ট্যাগসমূহ
| ট্যাগ | বর্ণনা |
|---|---|
| ${BT}<html>${BT} | HTML ডকুমেন্ট নির্দেশ করে |
| ${BT}<head>${BT} | ডকুমেন্টের মেটাডেটা অংশ |
| ${BT}<title>${BT} | ব্রাউজার ট্যাবের শিরোনাম |
| ${BT}<body>${BT} | মূল কনটেন্ট অংশ |
| ${BT}<h1>${BT}-${BT}<h6>${BT} | হেডিং ট্যাগ (১ থেকে ৬ পর্যন্ত) |
| ${BT}<p>${BT} | অনুচ্ছেদ |
| ${BT}<a>${BT} | হাইপারলিংক (Anchor) |
| ${BT}<img>${BT} | ছবি যুক্ত করা |
| ${BT}<ul>${BT}/${BT}<ol>${BT} | আনঅর্ডার/অর্ডার লিস্ট |
| ${BT}<li>${BT} | লিস্ট আইটেম |
| ${BT}<table>${BT} | টেবিল তৈরি |
| ${BT}<tr>${BT}/${BT}<td>${BT}/${BT}<th>${BT} | টেবিল সারি/সেল/হেডার সেল |

## টেবিলের rowspan ও colspan
` +
      FENCE +
      `html
<table border="1">
  <tr>
    <th colspan="2">শিরোনাম</th>
    <td rowspan="2">ডেটা</td>
  </tr>
  <tr>
    <td>সেল ১</td>
    <td>সেল ২</td>
  </tr>
</table>
` +
      FENCE +
      `
- **colspan**: একটি সেল একাধিক কলাম জুড়ে বিস্তৃত করে
- **rowspan**: একটি সেল একাধিক সারি জুড়ে বিস্তৃত করে

## গুরুত্বপূর্ণ অ্যাট্রিবিউট
- ${BT}<a href="url">${BT}: লিংক গন্তব্য
- ${BT}<img src="path" width="" height="">${BT}: ছবির উৎস ও আকার
- ${BT}<body bgcolor="">${BT}: ব্যাকগ্রাউন্ড রঙ (আধুনিক HTML এ CSS ব্যবহার্য)

## HTML5 এর নতুন সেমান্টিক ট্যাগ
${BT}<header>${BT}, ${BT}<footer>${BT}, ${BT}<nav>${BT}, ${BT}<article>${BT}, ${BT}<section>${BT} — এগুলো ওয়েব পেজের কাঠামোকে আরও অর্থবহ করে তোলে।`,
    formulaSheet:
      `## HTML ট্যাগ পরিচিতি — সারাংশ

| ট্যাগ | কাজ |
|---|---|
| ${BT}<html>${BT}, ${BT}<head>${BT}, ${BT}<body>${BT} | মৌলিক কাঠামো |
| ${BT}<h1>-<h6>${BT} | হেডিং |
| ${BT}<a href="">${BT} | হাইপারলিংক |
| ${BT}<img src="">${BT} | ছবি |
| ${BT}<table>/<tr>/<td>/<th>${BT} | টেবিল |
| ${BT}colspan${BT}/${BT}rowspan${BT} | সেল বিস্তার নিয়ন্ত্রণ |

**মৌলিক কাঠামো:**
` +
      FENCE +
      `html
<html><head><title></title></head><body></body></html>
` +
      FENCE,
  },

  "C প্রোগ্রামিং বেসিক": {
    notesMarkdown:
      `# C প্রোগ্রামিং বেসিক

## C প্রোগ্রামের মৌলিক কাঠামো
` +
      FENCE +
      `c
#include <stdio.h>
int main() {
    printf("Hello World");
    return 0;
}
` +
      FENCE +
      `

## ভ্যারিয়েবল ও ডেটা টাইপ
C ভাষায় ডেটা টাইপ নির্ধারণ করে ভ্যারিয়েবল কোন ধরনের মান ধারণ করবে:
` +
      FENCE +
      `c
int age = 25;        // পূর্ণ সংখ্যা
float height = 5.9;   // দশমিক সংখ্যা
char grade = 'A';     // একক অক্ষর
` +
      FENCE +
      `

## শর্তাধীন স্টেটমেন্ট (if-else)
সাধারণ গঠন (syntax):
` +
      FENCE +
      `c
if (test_expression) {
    statement_block;
} else {
    statement_x;
}
` +
      FENCE +
      `

**if...else ladder** — একাধিক শর্ত পরীক্ষার জন্য:
` +
      FENCE +
      `c
if (a > b) {
    printf("a বড়");
} else if (a == b) {
    printf("সমান");
} else {
    printf("b বড়");
}
` +
      FENCE +
      `

## লুপ (Loop)
বার বার একই কাজ করার জন্য লুপ ব্যবহৃত হয় — **for**, **while**, **do-while**।

**for loop গঠন:**
` +
      FENCE +
      `c
for (initialization; test_condition; increment/decrement) {
    body_of_loop;
}
` +
      FENCE +
      `

উদাহরণ (১ থেকে ১০ পর্যন্ত প্রিন্ট):
` +
      FENCE +
      `c
for (int i = 1; i <= 10; i++) {
    printf("%d\\t", i);
}
` +
      FENCE +
      `

**while loop** — শর্ত সত্য থাকা পর্যন্ত পুনরাবৃত্তি হয়, শর্ত আগে পরীক্ষা করে।

**do-while loop** — শর্ত পরে পরীক্ষা করে, তাই কমপক্ষে একবার body চলে।

## for loop এর কার্যপ্রণালী
1. **initialize** অংশ প্রথমবার একবার চলে (কন্ট্রোল চলকের প্রাথমিক মান)
2. **test-condition** পরীক্ষা করা হয় — সত্য হলে body চলে
3. **increment/decrement** অংশ কন্ট্রোল চলকের মান পরিবর্তন করে
4. test-condition মিথ্যা না হওয়া পর্যন্ত ধাপ ২-৩ পুনরাবৃত্তি হয়`,
    formulaSheet:
      `## C প্রোগ্রামিং বেসিক — সারাংশ

**মৌলিক ডেটা টাইপ:** ${BT}int${BT}, ${BT}float${BT}, ${BT}double${BT}, ${BT}char${BT}

**if-else গঠন:**
` +
      FENCE +
      `c
if (condition) { } else { }
` +
      FENCE +
      `

**for loop গঠন:**
` +
      FENCE +
      `c
for (init; condition; increment) { }
` +
      FENCE +
      `

**while vs do-while:** while শর্ত আগে পরীক্ষা করে, do-while পরে (কমপক্ষে ১ বার চলে)`,
  },

  "SQL কুয়েরি": {
    notesMarkdown:
      `# SQL কুয়েরি

## SQL কী
**SQL (Structured Query Language)** হলো ডেটাবেজ ম্যানেজমেন্ট সিস্টেমে ডেটা সংরক্ষণ, পুনরুদ্ধার ও পরিচালনার জন্য ব্যবহৃত প্রমিত ভাষা।

## SELECT — ডেটা পুনরুদ্ধার
` +
      FENCE +
      `sql
SELECT column1, column2 FROM table_name WHERE condition ORDER BY column1;
` +
      FENCE +
      `

উদাহরণ:
` +
      FENCE +
      `sql
SELECT name, marks FROM students WHERE marks >= 80 ORDER BY marks DESC;
` +
      FENCE +
      `

## INSERT — নতুন রেকর্ড যোগ
` +
      FENCE +
      `sql
INSERT INTO table_name (column1, column2) VALUES (value1, value2);
` +
      FENCE +
      `

উদাহরণ:
` +
      FENCE +
      `sql
INSERT INTO students (name, marks) VALUES ('Rahim', 85);
` +
      FENCE +
      `

## UPDATE — বিদ্যমান রেকর্ড সংশোধন
` +
      FENCE +
      `sql
UPDATE table_name SET column1 = value1 WHERE condition;
` +
      FENCE +
      `

উদাহরণ:
` +
      FENCE +
      `sql
UPDATE students SET marks = 90 WHERE name = 'Rahim';
` +
      FENCE +
      `

**সতর্কতা**: ${BT}WHERE${BT} ক্লজ ছাড়া UPDATE চালালে **সব রেকর্ড** পরিবর্তিত হয়ে যাবে।

## DELETE — রেকর্ড মুছে ফেলা
` +
      FENCE +
      `sql
DELETE FROM table_name WHERE condition;
` +
      FENCE +
      `

উদাহরণ:
` +
      FENCE +
      `sql
DELETE FROM students WHERE marks < 33;
` +
      FENCE +
      `

**সতর্কতা**: ${BT}WHERE${BT} ক্লজ ছাড়া DELETE চালালে টেবিলের **সব রেকর্ড** মুছে যাবে।

## গুরুত্বপূর্ণ ক্লজ
- **WHERE**: শর্ত নির্ধারণ করে কোন রেকর্ডে কাজ হবে
- **ORDER BY**: ফলাফল সাজানো (ASC ঊর্ধ্বক্রম, DESC নিম্নক্রম)
- **DISTINCT**: ডুপ্লিকেট বাদ দিয়ে অনন্য মান দেখায়

## DDL বনাম DML
- **DDL (Data Definition Language)**: ${BT}CREATE${BT}, ${BT}ALTER${BT}, ${BT}DROP${BT} — টেবিলের গঠন নিয়ন্ত্রণ করে
- **DML (Data Manipulation Language)**: ${BT}SELECT${BT}, ${BT}INSERT${BT}, ${BT}UPDATE${BT}, ${BT}DELETE${BT} — ডেটা নিয়ন্ত্রণ করে`,
    formulaSheet: `## SQL কুয়েরি — সারাংশ

| কুয়েরি | গঠন |
|---|---|
| SELECT | ${BT}SELECT col FROM table WHERE cond ORDER BY col${BT} |
| INSERT | ${BT}INSERT INTO table (col) VALUES (val)${BT} |
| UPDATE | ${BT}UPDATE table SET col=val WHERE cond${BT} |
| DELETE | ${BT}DELETE FROM table WHERE cond${BT} |

**DDL:** CREATE, ALTER, DROP (গঠন)
**DML:** SELECT, INSERT, UPDATE, DELETE (ডেটা)

⚠️ WHERE ছাড়া UPDATE/DELETE সব রেকর্ড প্রভাবিত করে`,
  },
};

async function main() {
  console.log("🌱 ICT Topic Notes+Formula Sheet Seeding শুরু হচ্ছে...\n");

  let totalUpdated = 0;
  const topicsNotFound: string[] = [];

  for (const [topicName, content] of Object.entries(contentByTopic)) {
    const topic = await prisma.topic.findFirst({
      where: { name: topicName },
    });

    if (!topic) {
      topicsNotFound.push(topicName);
      continue;
    }

    await prisma.topic.update({
      where: { id: topic.id },
      data: {
        notesMarkdown: content.notesMarkdown,
        formulaSheet: content.formulaSheet,
      },
    });

    console.log(`✅ ${topicName} — নোট (${content.notesMarkdown.length} অক্ষর) ও সারাংশ যোগ হলো`);
    totalUpdated += 1;
  }

  if (topicsNotFound.length > 0) {
    console.log(`\n⚠️  এই টপিকগুলো পাওয়া যায়নি: ${topicsNotFound.join(", ")}`);
  }

  console.log(`\n✅ মোট ${totalUpdated}টা টপিকে নোট+সারাংশ সিড করা হলো!`);
}

main()
  .catch((e) => {
    console.error("❌ সমস্যা হয়েছে:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
