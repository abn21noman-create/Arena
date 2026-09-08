// ===================================================================
// ICT + বাংলা + English — নোট-শূন্য টপিকের গ্যাপ পূরণ
// -------------------------------------------------------------------
// নোট-গ্যাপ পূরণ সিরিজের চতুর্থ ও শেষ ছোট সেট। এই স্ক্রিপ্টের পর
// ICT (১২/১২), বাংলা ১ম+২য় (৪/৪ করে) ও English ১ম+২য় (৪/৪ করে)
// সম্পূর্ণ হবে। বাকি থাকবে শুধু জীববিজ্ঞান ও উচ্চতর গণিত।
//
// ⚠️ ICT এর paper = NONE (এক পত্রবিশিষ্ট সাবজেক্ট), বাংলা ও English
// এর FIRST/SECOND — তাই প্রতিটা টপিকে code+paper দুটোই বলা আছে।
//
// English এর নোট ইংরেজিতে লেখা (ছাত্র ঐ ভাষাতেই উত্তর লিখবে), তবে
// ব্যাখ্যামূলক টিপস বাংলায় দেওয়া হয়েছে যাতে বোঝা সহজ হয়।
// `pnpm verify:notes` চেকারে ENGLISH সাবজেক্টে বাংলা-অক্ষরের ন্যূনতম
// শর্ত ইচ্ছাকৃতভাবে শিথিল করা আছে।
//
// রান: pnpm db:seed-ict-bangla-english-notes-gaps
// ===================================================================
import { PrismaClient, type SubjectCode, type PaperNumber } from "@prisma/client";

const prisma = new PrismaClient();

interface TopicContentSeed {
  code: SubjectCode;
  paper: PaperNumber;
  notesMarkdown: string;
  formulaSheet: string;
}

const contentByTopic: Record<string, TopicContentSeed> = {
  // ==================== ICT ====================
  "ICT এর ধারণা": {
    code: "ICT",
    paper: "NONE",
    notesMarkdown: `# ICT এর ধারণা

তথ্য ও যোগাযোগ প্রযুক্তি (Information and Communication Technology) হলো তথ্য সংগ্রহ, সংরক্ষণ, প্রক্রিয়াকরণ ও বিতরণের সাথে জড়িত সব প্রযুক্তির সমষ্টি।

## তথ্য ও উপাত্ত
- **উপাত্ত (Data)**: অবিন্যস্ত, কাঁচা তথ্য — যেমন ৮৫, ৯০, ৭৮
- **তথ্য (Information)**: প্রক্রিয়াকৃত ও অর্থবহ উপাত্ত — যেমন "গড় নম্বর ৮৪.৩"

উপাত্ত প্রক্রিয়াকরণের মাধ্যমেই তথ্যে পরিণত হয়।

## বিশ্বগ্রাম (Global Village)
তথ্যপ্রযুক্তির কল্যাণে সমগ্র বিশ্ব একটি গ্রামের মতো ছোট হয়ে এসেছে — যেখানে দূরত্ব আর যোগাযোগের বাধা নয়।

**উপাদানসমূহ**: হার্ডওয়্যার, সফটওয়্যার, নেটওয়ার্ক (কানেক্টিভিটি), ডেটা, মানুষ (People)।

**সুবিধা**: শিক্ষা, চিকিৎসা, ব্যবসা-বাণিজ্য, কর্মসংস্থান, গবেষণা ও বিনোদনে বৈপ্লবিক পরিবর্তন।

## ICT এর প্রয়োগক্ষেত্র
- **শিক্ষা**: ই-লার্নিং, অনলাইন ক্লাস, ভার্চুয়াল ল্যাব
- **চিকিৎসা**: টেলিমেডিসিন, MRI/CT স্ক্যান, রোবোটিক সার্জারি
- **ব্যবসা**: ই-কমার্স, মোবাইল ব্যাংকিং, অনলাইন লেনদেন
- **অফিস**: ই-গভর্ন্যান্স, ডিজিটাল নথি
- **কৃষি**: আবহাওয়ার পূর্বাভাস, কৃষি তথ্য সেবা

## গুরুত্বপূর্ণ প্রযুক্তি
- **ভার্চুয়াল রিয়েলিটি (VR)**: কম্পিউটার-সৃষ্ট কৃত্রিম পরিবেশ, যেখানে ব্যবহারকারী নিজেকে উপস্থিত অনুভব করে। পাইলট প্রশিক্ষণ, চিকিৎসা প্রশিক্ষণ, গেমিং।
- **কৃত্রিম বুদ্ধিমত্তা (AI)**: যন্ত্রের মানুষের মতো চিন্তা ও সিদ্ধান্ত নেওয়ার ক্ষমতা।
- **রোবোটিক্স**: শিল্প উৎপাদন, ঝুঁকিপূর্ণ কাজ, মহাকাশ অভিযান।
- **বায়োমেট্রিক্স**: আঙুলের ছাপ, আইরিস, মুখাবয়ব দিয়ে পরিচয় শনাক্তকরণ।
- **বায়োইনফরমেটিক্স**: জীববিজ্ঞানের তথ্য বিশ্লেষণে কম্পিউটার প্রয়োগ।
- **জেনেটিক ইঞ্জিনিয়ারিং**: জিন প্রযুক্তি ব্যবহার করে কাঙ্ক্ষিত বৈশিষ্ট্য তৈরি।
- **ন্যানোটেকনোলজি**: ন্যানো স্কেলে পদার্থ নিয়ন্ত্রণ।
- **ক্রায়োসার্জারি**: অতিশীতল তাপমাত্রায় অস্বাভাবিক কলা ধ্বংস করা।

## ডিজিটাল বাংলাদেশ
২০২১ সালের মধ্যে ডিজিটাল বাংলাদেশ গড়ার লক্ষ্যে গৃহীত কর্মসূচি — ই-গভর্ন্যান্স, ইউনিয়ন ডিজিটাল সেন্টার, মোবাইল ব্যাংকিং, অনলাইন শিক্ষা।

## ICT এর নেতিবাচক দিক
সাইবার অপরাধ, তথ্য চুরি, গোপনীয়তা লঙ্ঘন, ইন্টারনেট আসক্তি, ভুয়া তথ্য ছড়ানো, ই-বর্জ্যের পরিবেশগত ক্ষতি।`,
    formulaSheet: `## ICT এর ধারণা — মূল তথ্য

- উপাত্ত (Data) → প্রক্রিয়াকরণ → তথ্য (Information)
- বিশ্বগ্রামের উপাদান: হার্ডওয়্যার, সফটওয়্যার, নেটওয়ার্ক, ডেটা, মানুষ
- VR = Virtual Reality (কৃত্রিম বাস্তবতা)
- AI = Artificial Intelligence
- ন্যানোমিটার: $1\\ \\text{nm} = 10^{-9}$ m
- বায়োমেট্রিক্স: আঙুলের ছাপ, আইরিস, রেটিনা, মুখাবয়ব, কণ্ঠস্বর
- ক্রায়োসার্জারিতে ব্যবহৃত: তরল নাইট্রোজেন ($-196°$C)
- ডিজিটাল বাংলাদেশ ঘোষণা: ২০০৮, লক্ষ্য ২০২১`,
  },

  "ন্যানো টেকনোলজি": {
    code: "ICT",
    paper: "NONE",
    notesMarkdown: `# ন্যানো টেকনোলজি

ন্যানো স্কেলে (১-১০০ ন্যানোমিটার) পদার্থ নিয়ন্ত্রণ ও ব্যবহার করার প্রযুক্তি।

## ন্যানো স্কেল কতটা ছোট
$$1\\ \\text{ন্যানোমিটার} = 10^{-9}\\ \\text{মিটার} = \\frac{1}{100\\ \\text{কোটি}}\\ \\text{মিটার}$$

তুলনা: মানুষের একটি চুলের ব্যাস প্রায় ৮০,০০০ ন্যানোমিটার। অর্থাৎ ন্যানো স্কেল চুলের প্রস্থের প্রায় এক-হাজার ভাগের এক ভাগ।

## কেন ন্যানো স্কেলে ধর্ম বদলায়
এটাই ন্যানো টেকনোলজির মূল রহস্য। ন্যানো স্কেলে পদার্থের ধর্ম **সম্পূর্ণ বদলে যায়**:

1. **পৃষ্ঠক্ষেত্রফল-আয়তন অনুপাত বিশাল বেড়ে যায়** — বেশিরভাগ পরমাণু পৃষ্ঠে থাকে, ফলে রাসায়নিক সক্রিয়তা বহুগুণ বাড়ে
2. **কোয়ান্টাম প্রভাব** কাজ শুরু করে — চিরায়ত পদার্থবিজ্ঞানের নিয়ম আর পুরোপুরি খাটে না

উদাহরণ: সোনা সাধারণত নিষ্ক্রিয় ও হলুদ, কিন্তু ন্যানো কণা হিসেবে এটি **লাল বা বেগুনি** দেখায় এবং চমৎকার অনুঘটক হিসেবে কাজ করে।

## গুরুত্বপূর্ণ ন্যানো উপাদান
- **কার্বন ন্যানোটিউব**: ইস্পাতের চেয়ে প্রায় ১০০ গুণ শক্ত অথচ ৬ গুণ হালকা; চমৎকার তড়িৎ ও তাপ পরিবাহী
- **গ্রাফিন**: এক-পরমাণু পুরু কার্বনের স্তর, অত্যন্ত শক্তিশালী ও পরিবাহী
- **ফুলারিন**: বল আকৃতির কার্বন অণু ($\\text{C}_{60}$)
- **কোয়ান্টাম ডট**: আকার বদলালেই যার নির্গত আলোর রং বদলায়

## প্রয়োগক্ষেত্র
- **চিকিৎসা**: নির্দিষ্ট কোষে ওষুধ পৌঁছে দেওয়া (targeted drug delivery) — ক্যান্সার চিকিৎসায় সুস্থ কোষ বাঁচিয়ে শুধু আক্রান্ত কোষে ওষুধ
- **ইলেকট্রনিক্স**: আরও ছোট ও দ্রুতগতির প্রসেসর, উন্নত মেমোরি
- **বস্ত্র**: দাগ ও পানি-প্রতিরোধী কাপড়
- **পরিবেশ**: পানি বিশুদ্ধকরণ ফিল্টার, দূষণ শোষণ
- **শক্তি**: উন্নত সৌর প্যানেল ও ব্যাটারি
- **প্রসাধনী**: সানস্ক্রিনে জিংক অক্সাইড ন্যানো কণা

## ঝুঁকি ও চ্যালেঞ্জ
- অত্যন্ত ক্ষুদ্র কণা শ্বাসের সাথে ফুসফুসে বা কোষে ঢুকে ক্ষতি করতে পারে
- দীর্ঘমেয়াদি স্বাস্থ্য ও পরিবেশগত প্রভাব এখনো পুরোপুরি জানা নেই
- উৎপাদন ব্যয়বহুল
- নৈতিক প্রশ্ন — অপব্যবহারের ঝুঁকি`,
    formulaSheet: `## ন্যানো টেকনোলজি — মূল তথ্য

- $1\\ \\text{nm} = 10^{-9}$ m $= 10^{-3}\\ \\mu\\text{m}$
- ন্যানো স্কেল পরিসর: $1 - 100$ nm
- মানুষের চুলের ব্যাস: $\\approx 80{,}000$ nm
- ফুলারিন: $\\text{C}_{60}$ (বাকিবল)
- গ্রাফিন: এক-পরমাণু পুরু কার্বন স্তর
- কার্বন ন্যানোটিউব: ইস্পাতের $\\approx100$ গুণ শক্ত
- পৃষ্ঠক্ষেত্রফল/আয়তন $\\propto \\frac{1}{r}$ (আকার কমলে অনুপাত বাড়ে)
- গোলকের পৃষ্ঠক্ষেত্রফল: $A = 4\\pi r^2$, আয়তন: $V = \\frac{4}{3}\\pi r^3$
- অনুপাত: $\\frac{A}{V} = \\frac{3}{r}$`,
  },

  "ডেটা ট্রান্সমিশন": {
    code: "ICT",
    paper: "NONE",
    notesMarkdown: `# ডেটা ট্রান্সমিশন

এক ডিভাইস থেকে অন্য ডিভাইসে ডেটা স্থানান্তরের প্রক্রিয়া।

## ডেটা ট্রান্সমিশন মেথড

### সিরিয়াল ট্রান্সমিশন
একটি মাত্র তার দিয়ে একবারে **একটি বিট** পাঠানো হয়।
- ধীর, কিন্তু খরচ কম
- দীর্ঘ দূরত্বে নির্ভরযোগ্য
- উদাহরণ: USB, ইন্টারনেট

**উপবিভাগ**:
- **অ্যাসিনক্রোনাস**: একবারে ১ ক্যারেক্টার, start ও stop বিট সহ; কোনো ক্লক লাগে না
- **সিনক্রোনাস**: ব্লক আকারে ডেটা, ক্লক দিয়ে সমন্বিত; দ্রুততর
- **আইসোক্রোনাস**: রিয়েল-টাইম, নির্দিষ্ট সময়ের মধ্যে পৌঁছাতেই হবে (ভিডিও কল, লাইভ স্ট্রিমিং)

### প্যারালাল ট্রান্সমিশন
একাধিক তার দিয়ে **একসাথে অনেক বিট** পাঠানো হয়।
- দ্রুত, কিন্তু খরচ বেশি
- **শুধু কম দূরত্বে** কার্যকর — বেশি দূরত্বে বিটগুলো ভিন্ন সময়ে পৌঁছে যায় (skew সমস্যা)
- উদাহরণ: কম্পিউটারের ভেতরের বাস

## ডেটা ট্রান্সমিশন মোড
- **সিমপ্লেক্স**: শুধু এক দিকে (রেডিও, টিভি সম্প্রচার, কীবোর্ড)
- **হাফ-ডুপ্লেক্স**: দুই দিকে, কিন্তু একসাথে নয় (ওয়াকিটকি)
- **ফুল-ডুপ্লেক্স**: দুই দিকে একসাথে (মোবাইল ফোন কল)

## ব্যান্ডউইথ
একক সময়ে স্থানান্তরিত ডেটার পরিমাণ। একক: **bps** (bits per second)।

শ্রেণিবিভাগ:
- **ন্যারো ব্যান্ড**: ৪৫-৩০০ bps (টেলিগ্রাফ)
- **ভয়েস ব্যান্ড**: ৯৬০০ bps পর্যন্ত (টেলিফোন, মডেম)
- **ব্রড ব্যান্ড**: ১ Mbps এর বেশি (ইন্টারনেট, ভিডিও)

## ট্রান্সমিশন মিডিয়া

### তারযুক্ত (Guided)
| মাধ্যম | বৈশিষ্ট্য |
|---|---|
| **টুইস্টেড পেয়ার** | সস্তা, সহজলভ্য; ব্যান্ডউইথ কম (টেলিফোন, LAN) |
| **কো-এক্সিয়াল** | মাঝারি ব্যান্ডউইথ, কম শব্দ (ক্যাবল টিভি) |
| **অপটিক্যাল ফাইবার** | সর্বোচ্চ ব্যান্ডউইথ, EMI মুক্ত, নিরাপদ; ব্যয়বহুল |

**অপটিক্যাল ফাইবার** আলোর **পূর্ণ অভ্যন্তরীণ প্রতিফলন** নীতিতে কাজ করে — এতে সংকেত প্রায় ক্ষয়হীনভাবে বহু দূর যেতে পারে।

### তারবিহীন (Unguided)
- **রেডিও ওয়েভ**: সর্বদিকে ছড়ায়, দেয়াল ভেদ করে (রেডিও, WiFi)
- **মাইক্রোওয়েভ**: দিকনির্দেশিত, লাইন-অব-সাইট প্রয়োজন
- **ইনফ্রারেড**: খুব কম দূরত্ব, বাধা ভেদ করে না (রিমোট কন্ট্রোল)`,
    formulaSheet: `## ডেটা ট্রান্সমিশন — সূত্র

- ব্যান্ডউইথ একক: bps, kbps, Mbps, Gbps
- $1$ Kbps $= 1000$ bps · $1$ Mbps $= 10^6$ bps
- ডেটা স্থানান্তরের সময়: $t = \\frac{\\text{ডেটার আকার}}{\\text{ব্যান্ডউইথ}}$
- $1$ Byte $= 8$ bit
- $1$ KB $= 1024$ Byte · $1$ MB $= 1024$ KB
- ন্যারো ব্যান্ড: $45-300$ bps
- ভয়েস ব্যান্ড: $\\le 9600$ bps
- ব্রড ব্যান্ড: $> 1$ Mbps
- মোড: সিমপ্লেক্স · হাফ-ডুপ্লেক্স · ফুল-ডুপ্লেক্স
- অপটিক্যাল ফাইবার → পূর্ণ অভ্যন্তরীণ প্রতিফলন
- সংকট কোণ: $\\sin\\theta_c = \\frac{n_2}{n_1}$`,
  },

  "CSS বেসিক": {
    code: "ICT",
    paper: "NONE",
    notesMarkdown: `# CSS বেসিক

CSS (Cascading Style Sheets) দিয়ে HTML ডকুমেন্টের উপস্থাপনা ও ডিজাইন নিয়ন্ত্রণ করা হয়।

## কেন CSS দরকার
HTML দিয়ে ওয়েবপেজের **গঠন** তৈরি হয়, আর CSS দিয়ে তার **চেহারা**। এই দুটো আলাদা রাখলে:
- একই স্টাইল বহু পেজে পুনর্ব্যবহার করা যায়
- একটি ফাইল বদলালেই পুরো সাইটের ডিজাইন বদলে যায়
- কোড পরিষ্কার ও রক্ষণাবেক্ষণযোগ্য থাকে

## CSS এর সিনট্যাক্স
\`\`\`css
selector {
  property: value;
}
\`\`\`

উদাহরণ:
\`\`\`css
p {
  color: blue;
  font-size: 16px;
}
\`\`\`

## CSS যুক্ত করার তিন উপায়

### ১. ইনলাইন CSS
HTML ট্যাগের ভেতরে \`style\` অ্যাট্রিবিউট দিয়ে:
\`\`\`html
<p style="color: red;">লাল লেখা</p>
\`\`\`
শুধু ঐ একটি এলিমেন্টে কাজ করে। বেশি ব্যবহার করলে কোড অগোছালো হয়।

### ২. ইন্টারনাল CSS
\`<head>\` অংশে \`<style>\` ট্যাগের ভেতরে। একটি পেজের সব এলিমেন্টে কাজ করে।

### ৩. এক্সটার্নাল CSS
আলাদা \`.css\` ফাইলে লিখে \`<link>\` ট্যাগ দিয়ে যুক্ত করা:
\`\`\`html
<link rel="stylesheet" href="style.css">
\`\`\`
**সবচেয়ে ভালো পদ্ধতি** — একাধিক পেজে একই স্টাইল প্রয়োগ করা যায়।

## অগ্রাধিকার (Cascading)
একই এলিমেন্টে একাধিক স্টাইল প্রয়োগ হলে অগ্রাধিকার:

**ইনলাইন > ইন্টারনাল > এক্সটার্নাল > ব্রাউজার ডিফল্ট**

এই "ক্যাসকেডিং" বা ধাপে ধাপে প্রয়োগের ধারণা থেকেই CSS এর নাম।

## সিলেক্টর
| সিলেক্টর | ব্যবহার | উদাহরণ |
|---|---|---|
| এলিমেন্ট | ট্যাগের নাম | \`p { }\` |
| ক্লাস | \`.\` দিয়ে, একাধিক এলিমেন্টে | \`.note { }\` |
| আইডি | \`#\` দিয়ে, **একটি মাত্র** এলিমেন্টে | \`#header { }\` |
| ইউনিভার্সাল | সব এলিমেন্টে | \`* { }\` |

আইডি ক্লাসের চেয়ে বেশি নির্দিষ্ট, তাই অগ্রাধিকারও বেশি।

## গুরুত্বপূর্ণ প্রোপার্টি
- **টেক্সট**: \`color\`, \`font-family\`, \`font-size\`, \`text-align\`
- **ব্যাকগ্রাউন্ড**: \`background-color\`, \`background-image\`
- **বক্স মডেল**: \`margin\`, \`border\`, \`padding\`, \`width\`, \`height\`

## বক্স মডেল
প্রতিটি HTML এলিমেন্ট একটি আয়তাকার বাক্স। ভেতর থেকে বাইরে:

**কনটেন্ট → প্যাডিং → বর্ডার → মার্জিন**

- **প্যাডিং**: কনটেন্ট ও বর্ডারের মাঝের ফাঁকা জায়গা (ভেতরে)
- **মার্জিন**: বর্ডারের বাইরের ফাঁকা জায়গা (অন্য এলিমেন্ট থেকে দূরত্ব)`,
    formulaSheet: `## CSS বেসিক — সিনট্যাক্স ও সূত্র

\`\`\`
selector { property: value; }
\`\`\`

- ইনলাইন: \`<p style="...">\`
- ইন্টারনাল: \`<style>\` ট্যাগ \`<head>\` এ
- এক্সটার্নাল: \`<link rel="stylesheet" href="style.css">\`
- অগ্রাধিকার: ইনলাইন > ইন্টারনাল > এক্সটার্নাল > ডিফল্ট
- ক্লাস সিলেক্টর: \`.classname\`
- আইডি সিলেক্টর: \`#idname\`
- ইউনিভার্সাল: \`*\`
- বক্স মডেল: কনটেন্ট → প্যাডিং → বর্ডার → মার্জিন
- মোট প্রস্থ = width + 2×padding + 2×border + 2×margin
- রং: নাম, HEX (\`#ff0000\`), \`rgb(255,0,0)\`
- CSS = Cascading Style Sheets`,
  },

  "প্রোগ্রামিং এর ধারণা": {
    code: "ICT",
    paper: "NONE",
    notesMarkdown: `# প্রোগ্রামিং এর ধারণা

কম্পিউটারকে নির্দিষ্ট কাজ করানোর জন্য ধারাবাহিক নির্দেশনার সমষ্টিই প্রোগ্রাম, আর তা লেখার প্রক্রিয়াই প্রোগ্রামিং।

## প্রোগ্রামিং ভাষার প্রজন্ম
1. **প্রথম প্রজন্ম — মেশিন ভাষা**: শুধু ০ ও ১; কম্পিউটার সরাসরি বোঝে, কিন্তু মানুষের জন্য অত্যন্ত কঠিন
2. **দ্বিতীয় প্রজন্ম — অ্যাসেম্বলি ভাষা**: সাংকেতিক নাম (ADD, SUB); অনুবাদক হিসেবে **অ্যাসেম্বলার** লাগে
3. **তৃতীয় প্রজন্ম — উচ্চস্তরের ভাষা**: ইংরেজির কাছাকাছি (C, C++, Java, Python)
4. **চতুর্থ প্রজন্ম — অতি উচ্চস্তরের**: SQL, Oracle — "কী করতে হবে" বলা হয়, "কীভাবে" নয়
5. **পঞ্চম প্রজন্ম — স্বাভাবিক ভাষা**: AI ভিত্তিক (PROLOG, LISP)

## নিম্নস্তর বনাম উচ্চস্তর
| নিম্নস্তর | উচ্চস্তর |
|---|---|
| মেশিন-নির্ভর | মেশিন-স্বাধীন (পোর্টেবল) |
| দ্রুত সম্পাদিত হয় | তুলনামূলক ধীর |
| লেখা ও বোঝা কঠিন | সহজবোধ্য |
| ভুল খোঁজা কঠিন | ডিবাগিং সহজ |

## অনুবাদক প্রোগ্রাম
উচ্চস্তরের ভাষায় লেখা কোড কম্পিউটার সরাসরি বোঝে না, তাই মেশিন ভাষায় অনুবাদ করতে হয়:

- **কম্পাইলার**: **পুরো প্রোগ্রাম একসাথে** অনুবাদ করে; দ্রুত, সব ভুল একবারে দেখায় (C, C++)
- **ইন্টারপ্রেটার**: **লাইন বাই লাইন** অনুবাদ ও সম্পাদন করে; ধীর, কিন্তু ভুল খোঁজা সহজ (Python)
- **অ্যাসেম্বলার**: অ্যাসেম্বলি ভাষাকে মেশিন ভাষায় অনুবাদ করে

## প্রোগ্রাম তৈরির ধাপ
1. **সমস্যা বিশ্লেষণ** — কী সমাধান করতে হবে বোঝা
2. **অ্যালগরিদম তৈরি** — ধাপে ধাপে সমাধানের পরিকল্পনা
3. **ফ্লোচার্ট অঙ্কন** — চিত্রের মাধ্যমে উপস্থাপন
4. **কোডিং** — প্রকৃত প্রোগ্রাম লেখা
5. **কম্পাইলেশন ও ডিবাগিং** — ভুল সংশোধন
6. **টেস্টিং** — বিভিন্ন ইনপুট দিয়ে পরীক্ষা
7. **ডকুমেন্টেশন ও রক্ষণাবেক্ষণ**

## অ্যালগরিদম
সমস্যা সমাধানের সসীম, সুনির্দিষ্ট ধাপের ক্রম।

বৈশিষ্ট্য: সুনির্দিষ্ট ইনপুট ও আউটপুট থাকবে, প্রতিটি ধাপ স্পষ্ট হবে, অবশ্যই **সসীম সময়ে শেষ** হবে।

## ফ্লোচার্টের প্রতীক
- **উপবৃত্ত**: শুরু/শেষ (Terminal)
- **সামান্তরিক**: ইনপুট/আউটপুট
- **আয়তক্ষেত্র**: প্রক্রিয়াকরণ
- **রম্বস**: সিদ্ধান্ত (Decision)
- **তীর**: প্রবাহের দিক

## ভুলের প্রকারভেদ
- **সিনট্যাক্স ত্রুটি**: ভাষার ব্যাকরণগত ভুল — কম্পাইলার ধরিয়ে দেয়
- **লজিক্যাল ত্রুটি**: প্রোগ্রাম চলে কিন্তু **ভুল ফল** দেয় — সবচেয়ে বিপজ্জনক, কারণ কম্পাইলার ধরতে পারে না
- **রানটাইম ত্রুটি**: চলার সময় ঘটে (যেমন শূন্য দিয়ে ভাগ)`,
    formulaSheet: `## প্রোগ্রামিং এর ধারণা — মূল তথ্য

- ১ম প্রজন্ম: মেশিন ভাষা (০,১)
- ২য়: অ্যাসেম্বলি (অ্যাসেম্বলার লাগে)
- ৩য়: উচ্চস্তর (C, C++, Java)
- ৪র্থ: SQL, Oracle
- ৫ম: AI ভাষা (PROLOG, LISP)

| অনুবাদক | পদ্ধতি |
|---|---|
| কম্পাইলার | পুরো প্রোগ্রাম একসাথে |
| ইন্টারপ্রেটার | লাইন বাই লাইন |
| অ্যাসেম্বলার | অ্যাসেম্বলি → মেশিন |

- ফ্লোচার্ট: উপবৃত্ত=শুরু/শেষ, সামান্তরিক=I/O, আয়তক্ষেত্র=প্রক্রিয়া, রম্বস=সিদ্ধান্ত
- ত্রুটি: সিনট্যাক্স · লজিক্যাল · রানটাইম
- C ভাষার জনক: ডেনিস রিচি (১৯৭২)`,
  },

  "ডেটাবেজের ধারণা": {
    code: "ICT",
    paper: "NONE",
    notesMarkdown: `# ডেটাবেজের ধারণা

পরস্পর সম্পর্কযুক্ত উপাত্তের সুসংগঠিত সংগ্রহই ডেটাবেজ।

## DBMS
**Database Management System** — ডেটাবেজ তৈরি, সংরক্ষণ, হালনাগাদ ও নিয়ন্ত্রণের সফটওয়্যার।

উদাহরণ: MySQL, Oracle, MS Access, PostgreSQL, SQL Server।

## ফাইল সিস্টেমের তুলনায় DBMS এর সুবিধা
- **ডেটা রিডানডেন্সি হ্রাস**: একই তথ্য বারবার সংরক্ষণ এড়ানো
- **ডেটার সামঞ্জস্য (consistency)**: একবার হালনাগাদেই সব জায়গায় প্রতিফলিত হয়
- **নিরাপত্তা**: ব্যবহারকারীভেদে ভিন্ন অনুমতি
- **সমন্বিত অ্যাক্সেস**: একাধিক ব্যবহারকারী একসাথে কাজ করতে পারে
- **ব্যাকআপ ও রিকভারি** সহজ

## ডেটাবেজ মডেল
- **রিলেশনাল মডেল**: টেবিল আকারে (সবচেয়ে জনপ্রিয়)
- **হায়ারার্কিক্যাল**: গাছের মতো, প্যারেন্ট-চাইল্ড সম্পর্ক
- **নেটওয়ার্ক**: একাধিক প্যারেন্ট থাকতে পারে
- **অবজেক্ট-ওরিয়েন্টেড**: অবজেক্ট আকারে

## রিলেশনাল ডেটাবেজের উপাদান
- **টেবিল (Relation)**: সারি ও কলামের সমষ্টি
- **রেকর্ড/টাপল (Row)**: একটি সম্পূর্ণ এন্ট্রি (যেমন একজন ছাত্রের সব তথ্য)
- **ফিল্ড/অ্যাট্রিবিউট (Column)**: একটি বৈশিষ্ট্য (যেমন "নাম")
- **ডোমেইন**: কোনো ফিল্ডে যেসব মান বসতে পারে তার সীমা

## কী (Key)
| কী | বর্ণনা |
|---|---|
| **প্রাইমারি কী** | প্রতিটি রেকর্ডকে অদ্বিতীয়ভাবে শনাক্ত করে; **NULL হতে পারে না**, ডুপ্লিকেট হতে পারে না |
| **ক্যান্ডিডেট কী** | যেসব ফিল্ড প্রাইমারি কী হওয়ার যোগ্য |
| **অল্টারনেট কী** | ক্যান্ডিডেট কী যেটি প্রাইমারি হিসেবে বাছাই হয়নি |
| **ফরেন কী** | অন্য টেবিলের প্রাইমারি কী-কে নির্দেশ করে; টেবিলের মধ্যে সম্পর্ক তৈরি করে |
| **কম্পোজিট কী** | একাধিক ফিল্ড মিলে তৈরি কী |

## ডেটা সর্টিং ও ইনডেক্সিং
- **সর্টিং**: নির্দিষ্ট ফিল্ড অনুযায়ী রেকর্ড সাজানো (আরোহী/অবরোহী)
- **ইনডেক্সিং**: দ্রুত খোঁজার জন্য আলাদা সূচি তৈরি — বইয়ের সূচিপত্রের মতো। ইনডেক্স ছাড়া DBMS পুরো টেবিল স্ক্যান করে, যা বড় টেবিলে অত্যন্ত ধীর।

## SQL
**Structured Query Language** — রিলেশনাল ডেটাবেজে কাজ করার আদর্শ ভাষা।

তিনটি ভাগ:
- **DDL** (Data Definition Language): CREATE, ALTER, DROP — গঠন নির্ধারণ
- **DML** (Data Manipulation Language): SELECT, INSERT, UPDATE, DELETE — ডেটা নিয়ে কাজ
- **DCL** (Data Control Language): GRANT, REVOKE — অনুমতি নিয়ন্ত্রণ

## মৌলিক SQL কমান্ড
\`\`\`sql
CREATE TABLE student (id INT, name VARCHAR(50));
INSERT INTO student VALUES (1, 'রফিক');
SELECT * FROM student WHERE id = 1;
UPDATE student SET name = 'করিম' WHERE id = 1;
DELETE FROM student WHERE id = 1;
\`\`\`

> ⚠️ \`WHERE\` শর্ত ছাড়া \`DELETE\` বা \`UPDATE\` চালালে **পুরো টেবিলের সব রেকর্ড** প্রভাবিত হয়।`,
    formulaSheet: `## ডেটাবেজ — মূল তথ্য

- DBMS = Database Management System
- SQL = Structured Query Language
- রিলেশন = টেবিল · টাপল = সারি · অ্যাট্রিবিউট = কলাম

| কী | বৈশিষ্ট্য |
|---|---|
| প্রাইমারি | অদ্বিতীয়, NULL নয় |
| ফরেন | অন্য টেবিলের প্রাইমারি কী |
| কম্পোজিট | একাধিক ফিল্ড মিলে |

- DDL: CREATE, ALTER, DROP
- DML: SELECT, INSERT, UPDATE, DELETE
- DCL: GRANT, REVOKE

\`\`\`sql
SELECT * FROM table WHERE condition;
INSERT INTO table VALUES (...);
UPDATE table SET col=val WHERE cond;
DELETE FROM table WHERE cond;
\`\`\`

- WHERE ছাড়া DELETE/UPDATE = পুরো টেবিল প্রভাবিত`,
  },

  // ==================== বাংলা ১ম পত্র ====================
  "আমার পথ": {
    code: "BANGLA",
    paper: "FIRST",
    notesMarkdown: `# আমার পথ — কাজী নজরুল ইসলাম

## লেখক পরিচিতি
কাজী নজরুল ইসলাম (১৮৯৯-১৯৭৬) — বাংলাদেশের **জাতীয় কবি**, "বিদ্রোহী কবি" নামে পরিচিত। জন্ম ভারতের বর্ধমান জেলার চুরুলিয়া গ্রামে। ১৯৭২ সালে বাংলাদেশে আনা হয় এবং ১৯৭৬ সালে বাংলাদেশের নাগরিকত্ব দেওয়া হয়।

উল্লেখযোগ্য রচনা: *অগ্নিবীণা*, *বিষের বাঁশি*, *সাম্যবাদী*, *মৃত্যুক্ষুধা*, *রুদ্রমঙ্গল*।

"আমার পথ" প্রবন্ধটি *রুদ্রমঙ্গল* গ্রন্থ থেকে সংকলিত। এটি নজরুল সম্পাদিত *ধূমকেতু* পত্রিকার প্রথম সংখ্যায় প্রকাশিত হয়েছিল।

## মূল বক্তব্য
প্রবন্ধের কেন্দ্রীয় ভাবনা হলো — **নিজের সত্যকে চেনা ও তার উপর অবিচল থাকা**। লেখক বলেন, নিজেকে চেনার মধ্য দিয়েই মানুষ প্রকৃত স্বাধীনতা লাভ করে।

## গুরুত্বপূর্ণ ভাবনাসমূহ

### আত্মশক্তি ও সত্য
লেখকের পথ দেখাবে তাঁর **সত্য**। এই সত্যই তাঁর আত্মবিশ্বাসের উৎস। যে নিজের সত্যকে চেনে, সে কারো কাছে মাথা নত করে না।

### মিথ্যা বিনয়ের বিরোধিতা
নজরুল স্পষ্ট বলেন, মিথ্যা বিনয় আসলে কাপুরুষতা। নিজেকে ছোট করে দেখানোর ভান করা মানে সত্যকে অস্বীকার করা।

> "আমি বলি, ভুল করেছি, কিন্তু আমি মিথ্যা বলিনি।"

ভুল স্বীকার করার সাহসই প্রকৃত সাহস — কিন্তু মিথ্যা বিনয় নয়।

### অন্যায়ের সাথে আপস নয়
লেখক নিজের ভুল স্বীকার করতে প্রস্তুত, কিন্তু অন্যায়ের কাছে মাথা নত করতে নয়।

### হিন্দু-মুসলিম ঐক্য
নজরুল সাম্প্রদায়িকতাকে বাঙালির সবচেয়ে বড় শত্রু মনে করতেন। তিনি বলেন, ধর্মের নামে বিভেদ সৃষ্টি করা "মিথ্যা", আর মানুষে মানুষে ঐক্যই সত্য।

### পরাধীনতার বিরুদ্ধে
দাসত্বের শৃঙ্খল ভাঙতে হলে আগে **মনের দাসত্ব** ভাঙতে হবে। বাইরের স্বাধীনতার আগে দরকার ভেতরের স্বাধীনতা।

## ভাষা ও রচনাশৈলী
- আত্মবিশ্বাসী ও ঋজু গদ্যভঙ্গি
- প্রথম পুরুষে (আমি) লেখা, তাই ব্যক্তিগত আবেদন প্রবল
- বিদ্রোহী চেতনা ও ওজস্বী ভাষা
- আরবি-ফারসি শব্দের সার্থক ব্যবহার

## প্রাসঙ্গিকতা
প্রায় শতবর্ষ পরেও প্রবন্ধটি প্রাসঙ্গিক — আত্মমর্যাদা, সাম্প্রদায়িক সম্প্রীতি ও অন্যায়ের বিরুদ্ধে প্রতিবাদের বার্তা আজও সমান জরুরি।`,
    formulaSheet: `## আমার পথ — দ্রুত রিভিশন

- **লেখক**: কাজী নজরুল ইসলাম (১৮৯৯-১৯৭৬)
- **উৎস গ্রন্থ**: রুদ্রমঙ্গল
- **প্রথম প্রকাশ**: ধূমকেতু পত্রিকার প্রথম সংখ্যায়
- **জন্মস্থান**: চুরুলিয়া, বর্ধমান, ভারত
- **উপাধি**: বিদ্রোহী কবি, বাংলাদেশের জাতীয় কবি
- **রচনার ধরন**: প্রবন্ধ (আত্মজৈবনিক ভঙ্গি)

**মূল ভাবনা**:
- নিজের সত্যকে চেনা = প্রকৃত স্বাধীনতা
- মিথ্যা বিনয় = কাপুরুষতা
- ভুল স্বীকারে সাহস, অন্যায়ে আপস নয়
- হিন্দু-মুসলিম ঐক্য
- মনের দাসত্ব ভাঙাই প্রথম কাজ

**উল্লেখযোগ্য গ্রন্থ**: অগ্নিবীণা, বিষের বাঁশি, সাম্যবাদী, মৃত্যুক্ষুধা`,
  },

  "আঠারো বছর বয়স": {
    code: "BANGLA",
    paper: "FIRST",
    notesMarkdown: `# আঠারো বছর বয়স — সুকান্ত ভট্টাচার্য

## কবি পরিচিতি
সুকান্ত ভট্টাccharya (১৯২৬-১৯৪৭) — মাত্র **২১ বছর** বয়সে যক্ষ্মায় মৃত্যুবরণ করেন। এত অল্প আয়ুতেও তিনি বাংলা কবিতায় স্থায়ী আসন করে নিয়েছেন। তাঁকে "কিশোর কবি" বলা হয়।

উল্লেখযোগ্য কাব্যগ্রন্থ: *ছাড়পত্র*, *ঘুম নেই*, *পূর্বাভাস*, *অভিযান*।

"আঠারো বছর বয়স" কবিতাটি *ছাড়পত্র* কাব্যগ্রন্থের অন্তর্গত।

## মূল বিষয়বস্তু
কবিতাটি **তারুণ্যের শক্তি ও সম্ভাবনার** জয়গান। আঠারো বছর বয়স মানে শৈশব পেরিয়ে যৌবনে পা দেওয়া — যে বয়সে মানুষ দুঃসাহসী, প্রতিবাদী ও পরিবর্তনকামী হয়।

## বয়সটির দ্বৈত রূপ
কবি আঠারো বছর বয়সকে একইসাথে **আশীর্বাদ ও ঝুঁকি** হিসেবে দেখেছেন — এটাই কবিতার সবচেয়ে সূক্ষ্ম দিক।

### ইতিবাচক দিক
- **দুঃসহ ও স্পর্ধিত**: ভয়কে জয় করার সাহস
- **আত্মত্যাগে উদ্যত**: বড় কিছুর জন্য নিজেকে বিলিয়ে দেওয়ার প্রস্তুতি
- **মাথা নোয়াবার নয়**: অন্যায়ের কাছে নত না হওয়া
- **প্রাণ দেওয়া-নেওয়ার প্রতিজ্ঞা**: আদর্শের জন্য চূড়ান্ত ত্যাগ
- **দুর্বার**: কোনো বাধাই আটকাতে পারে না

### ঝুঁকির দিক
- **বেদনায় কাতর**: অভিজ্ঞতার অভাবে আঘাত পাওয়ার সম্ভাবনা
- **অসহ্য যন্ত্রণা**: ভুল সিদ্ধান্তের ফল
- **ভয়ংকর**: নিয়ন্ত্রণহীন হলে ধ্বংসাত্মক

কবি বলেন — এ বয়স "জীবন স্রোতে" ঝাঁপিয়ে পড়ে; তাই সঠিক দিকনির্দেশনা পেলে এই শক্তি সমাজ বদলে দিতে পারে।

## বিখ্যাত পঙ্‌ক্তি
> "আঠারো বছর বয়স কী দুঃসহ  
> স্পর্ধায় নেয় মাথা তোলবার ঝুঁকি"

> "এ বয়সে কেউ মাথা নোয়াবার নয়"

> "আঠারো বছর বয়স এই বয়সেই  
> জীর্ণ শিকল ভেঙে ফেলা যায়"

## কাব্যিক বৈশিষ্ট্য
- **প্রতীক ও চিত্রকল্প**: "জীর্ণ শিকল" = পুরনো বন্ধন ও কুসংস্কার
- **পুনরাবৃত্তি**: "আঠারো বছর বয়স" বারবার এসে জোর দিয়েছে
- **বৈপরীত্য**: দুঃসহ↔স্পর্ধা, বেদনা↔সাহস — এই টানাপোড়েনই কবিতার প্রাণ
- অন্ত্যমিলযুক্ত, প্রাণবন্ত ছন্দ

## ঐতিহাসিক প্রেক্ষাপট
কবিতাটি রচিত হয় ভারতের স্বাধীনতা সংগ্রামের উত্তাল সময়ে (১৯৪০-এর দশক)। তখন তরুণরাই আন্দোলনের মূল শক্তি ছিল। তাই "জীর্ণ শিকল ভাঙা" শুধু রূপক নয় — পরাধীনতার শৃঙ্খল ভাঙার সরাসরি আহ্বান।

## বার্তা
তারুণ্য নিছক একটি বয়স নয় — এটি একটি **শক্তি**। এই শক্তিকে সঠিক পথে চালিত করলে জাতির ভাগ্য বদলে যায়।`,
    formulaSheet: `## আঠারো বছর বয়স — দ্রুত রিভিশন

- **কবি**: সুকান্ত ভট্টাচার্য (১৯২৬-১৯৪৭)
- **আয়ুষ্কাল**: মাত্র ২১ বছর (যক্ষ্মায় মৃত্যু)
- **কাব্যগ্রন্থ**: ছাড়পত্র
- **উপাধি**: কিশোর কবি
- **অন্যান্য গ্রন্থ**: ঘুম নেই, পূর্বাভাস, অভিযান
- **বিষয়**: তারুণ্যের শক্তি ও সম্ভাবনা

**বয়সটির বৈশিষ্ট্য**:
- দুঃসহ ও স্পর্ধিত · আত্মত্যাগে উদ্যত
- মাথা নোয়াবার নয় · দুর্বার
- বেদনায় কাতর (ঝুঁকির দিক)

**মূল প্রতীক**: "জীর্ণ শিকল" = পুরনো বন্ধন, পরাধীনতা, কুসংস্কার

**প্রেক্ষাপট**: ভারতের স্বাধীনতা সংগ্রাম (১৯৪০-এর দশক)`,
  },

  // ==================== বাংলা ২য় পত্র ====================
  "ভাষা ও বাংলা ভাষা": {
    code: "BANGLA",
    paper: "SECOND",
    notesMarkdown: `# ভাষা ও বাংলা ভাষা

## ভাষার সংজ্ঞা
মানুষ বাগযন্ত্রের সাহায্যে যে অর্থবোধক ধ্বনি উচ্চারণ করে মনের ভাব প্রকাশ করে, তাকেই ভাষা বলে।

**বাগযন্ত্র**: ফুসফুস, স্বরযন্ত্র, গলনালি, জিহ্বা, দাঁত, ঠোঁট, তালু, নাক।

## ভাষার বৈশিষ্ট্য
- অর্থবোধক ও নির্দিষ্ট সমাজে বোধগম্য
- **পরিবর্তনশীল** — সময়ের সাথে বদলায়
- অর্জিত, জন্মগত নয়
- ধ্বনিই ভাষার মূল উপাদান

## ভাষার মৌলিক অংশ
**ধ্বনি → বর্ণ → শব্দ → পদ → বাক্য**

- **ধ্বনি**: ভাষার ক্ষুদ্রতম একক (উচ্চারিত)
- **বর্ণ**: ধ্বনির লিখিত রূপ
- **শব্দ**: অর্থবোধক ধ্বনিসমষ্টি
- **পদ**: বাক্যে ব্যবহৃত শব্দ (বিভক্তিযুক্ত)
- **বাক্য**: সম্পূর্ণ ভাব প্রকাশক পদসমষ্টি

## বাংলা ভাষার উৎপত্তি
বাংলা ভাষা **ইন্দো-ইউরোপীয়** ভাষাগোষ্ঠীর অন্তর্গত।

ধারা: ইন্দো-ইউরোপীয় → শতম → ইন্দো-ইরানীয় → ইন্দো-আর্য → প্রাকৃত → **মাগধী প্রাকৃত** → **গৌড় অপভ্রংশ** → **বাংলা**

- ড. মুহম্মদ শহীদুল্লাহ্‌র মতে: **গৌড়ীয় অপভ্রংশ** থেকে, উৎপত্তিকাল সপ্তম শতক
- ড. সুনীতিকুমার চট্টোপাধ্যায়ের মতে: **মাগধী অপভ্রংশ** থেকে, উৎপত্তিকাল দশম শতক

বাংলা ভাষার বয়স আনুমানিক **এক হাজার বছরের** বেশি। প্রাচীনতম নিদর্শন **চর্যাপদ** (হরপ্রসাদ শাস্ত্রী ১৯০৭ সালে নেপালের রাজদরবার থেকে আবিষ্কার করেন)।

## ভাষার রীতি

### সাধু ভাষা
- সুনির্দিষ্ট ব্যাকরণের নিয়ম অনুসরণ করে
- ক্রিয়াপদ ও সর্বনাম **পূর্ণরূপে** ব্যবহৃত হয় (করিয়াছে, তাহারা)
- তৎসম শব্দবহুল, গম্ভীর ও আনুষ্ঠানিক
- নাটকের সংলাপে অনুপযোগী (কৃত্রিম শোনায়)

### চলিত ভাষা
- কথ্য ভাষার কাছাকাছি
- ক্রিয়াপদ ও সর্বনাম **সংক্ষিপ্ত** (করেছে, তারা)
- সহজ, সাবলীল ও স্বাভাবিক
- বর্তমানে সাহিত্য ও সংবাদপত্রে **প্রধানত ব্যবহৃত**

> চলিত ভাষাকে সাহিত্যে প্রতিষ্ঠিত করেন **প্রমথ চৌধুরী** (সবুজপত্র পত্রিকার মাধ্যমে)।

⚠️ এক রচনায় সাধু ও চলিত ভাষা মেশানো যায় না — একে **গুরুচণ্ডালী দোষ** বলে।

## আঞ্চলিক ভাষা (উপভাষা)
অঞ্চলভেদে ভাষার যে রূপভেদ — যেমন চট্টগ্রামের, সিলেটের, নোয়াখালীর ভাষা। এগুলো ভুল ভাষা নয়, বরং ভাষার স্বাভাবিক বৈচিত্র্য।

## বাংলা ভাষার বিস্তার
বিশ্বে কথ্য ভাষার মধ্যে বাংলা প্রায় **পঞ্চম-ষষ্ঠ** স্থানে। বাংলাদেশ ছাড়াও ভারতের পশ্চিমবঙ্গ, ত্রিপুরা, আসামে ব্যাপকভাবে প্রচলিত।

**২১ ফেব্রুয়ারি** আন্তর্জাতিক মাতৃভাষা দিবস হিসেবে ইউনেস্কো কর্তৃক স্বীকৃত (১৯৯৯ সালে ঘোষণা) — ১৯৫২ সালের ভাষা আন্দোলনের স্মরণে।`,
    formulaSheet: `## ভাষা ও বাংলা ভাষা — দ্রুত রিভিশন

- ভাষার একক ক্রম: **ধ্বনি → বর্ণ → শব্দ → পদ → বাক্য**
- ভাষাগোষ্ঠী: ইন্দো-ইউরোপীয়
- ধারা: ইন্দো-আর্য → প্রাকৃত → মাগধী প্রাকৃত → গৌড় অপভ্রংশ → বাংলা

| পণ্ডিত | উৎস | কাল |
|---|---|---|
| ড. শহীদুল্লাহ্ | গৌড়ীয় অপভ্রংশ | সপ্তম শতক |
| ড. সুনীতিকুমার | মাগধী অপভ্রংশ | দশম শতক |

- প্রাচীনতম নিদর্শন: **চর্যাপদ**
- আবিষ্কারক: হরপ্রসাদ শাস্ত্রী, ১৯০৭, নেপাল
- সাধু: করিয়াছে, তাহারা (পূর্ণরূপ)
- চলিত: করেছে, তারা (সংক্ষিপ্ত)
- চলিত ভাষার প্রবর্তক: প্রমথ চৌধুরী (সবুজপত্র)
- সাধু+চলিত মিশ্রণ = **গুরুচণ্ডালী দোষ**
- আন্তর্জাতিক মাতৃভাষা দিবস: ২১ ফেব্রুয়ারি`,
  },

  "ভাবসম্প্রসারণ": {
    code: "BANGLA",
    paper: "SECOND",
    notesMarkdown: `# ভাবসম্প্রসারণ

কোনো প্রবাদ, কবিতার চরণ বা বাক্যে নিহিত সংক্ষিপ্ত ভাবকে বিস্তৃতভাবে ব্যাখ্যা করাই ভাবসম্প্রসারণ।

## উদ্দেশ্য
মূল বাক্যে ভাব থাকে **সংহত ও প্রতীকী**। ভাবসম্প্রসারণে সেই ভাবকে খুলে বলা হয় — যাতে সাধারণ পাঠকও গভীর অর্থ বুঝতে পারেন।

## গঠন কাঠামো
সাধারণত **তিনটি অনুচ্ছেদে** লেখা হয়:

### ১. মূলভাব (সূচনা)
প্রদত্ত বাক্যের সরল অর্থ সংক্ষেপে বলা। ২-৩ বাক্যেই যথেষ্ট।

### ২. সম্প্রসারিত ভাব (মূল অংশ)
সবচেয়ে বড় অংশ। এখানে থাকবে:
- ভাবের বিস্তারিত ব্যাখ্যা
- যুক্তি ও উদাহরণ
- উপমা, দৃষ্টান্ত বা ঐতিহাসিক প্রসঙ্গ
- বিপরীত দিকের আলোচনা (প্রয়োজনে)

### ৩. মন্তব্য/উপসংহার
ভাবের তাৎপর্য ও ব্যবহারিক শিক্ষা দিয়ে শেষ করা।

## লেখার নিয়ম
1. প্রদত্ত বাক্যটি ভালোভাবে **বুঝে** নিতে হবে — তাড়াহুড়ো করে লিখলে ভাব ভুল হয়ে যায়
2. **রূপক অর্থ** ধরতে হবে, আক্ষরিক নয়
3. মূল বাক্যটি **হুবহু উদ্ধৃত করা যাবে না**
4. কবিতার চরণ থাকলে তা ব্যাখ্যা করতে হবে, অনুবাদ নয়
5. সহজ, সরল ও প্রাঞ্জল ভাষা
6. এক রীতিতে (সাধু বা চলিত) লিখতে হবে — মেশানো যাবে না
7. অপ্রাসঙ্গিক আলোচনা বাদ
8. আকার সাধারণত ১৫০-২০০ শব্দ

## নমুনা: "পরিশ্রম সৌভাগ্যের প্রসূতি"

**মূলভাব**: পরিশ্রমই মানুষের জীবনে সাফল্য ও সৌভাগ্য বয়ে আনে। ভাগ্য নিজে থেকে কিছু দেয় না, পরিশ্রমই তাকে সৃষ্টি করে।

**সম্প্রসারিত ভাব**: "প্রসূতি" অর্থ জন্মদাত্রী মা। অর্থাৎ পরিশ্রম হলো সৌভাগ্যের জননী। পৃথিবীতে যাঁরা সফল হয়েছেন, তাঁদের সাফল্যের পেছনে রয়েছে নিরলস পরিশ্রম। অলস ব্যক্তি ভাগ্যের দোহাই দিয়ে বসে থাকে, কিন্তু পরিশ্রমী মানুষ নিজের ভাগ্য নিজেই গড়ে নেয়। মৌমাছি অক্লান্ত পরিশ্রম করে বলেই মধু সঞ্চয় করতে পারে; কৃষক ঘাম ঝরান বলেই ফসল ফলে। বিজ্ঞানী নিউটন, এডিসন কিংবা আমাদের দেশের অনেক সফল মানুষ — সবার জীবনেই একই সত্য।

**মন্তব্য**: তাই ভাগ্যের উপর নির্ভর না করে পরিশ্রমী হওয়াই বুদ্ধিমানের কাজ। পরিশ্রম ছাড়া কোনো বড় অর্জন সম্ভব নয়।

## সাধারণ ভুল
- মূল বাক্য হুবহু লিখে দেওয়া
- আক্ষরিক অর্থে আটকে থাকা (রূপক না ধরা)
- অতিরিক্ত দীর্ঘ বা খুব সংক্ষিপ্ত লেখা
- গুরুচণ্ডালী দোষ (সাধু-চলিত মিশ্রণ)
- উদাহরণ ছাড়া শুধু তত্ত্বকথা

## গুরুত্বপূর্ণ কিছু ভাব
- "স্বাধীনতা হীনতায় কে বাঁচিতে চায় হে"
- "জ্ঞানহীন মানুষ পশুর সমান"
- "দুর্জন বিদ্বান হইলেও পরিত্যাজ্য"
- "অর্থই অনর্থের মূল"
- "সময়ের এক ফোঁড়, অসময়ের দশ ফোঁড়"`,
    formulaSheet: `## ভাবসম্প্রসারণ — কাঠামো

**তিন অনুচ্ছেদ**:
1. **মূলভাব** — সরল অর্থ (২-৩ বাক্য)
2. **সম্প্রসারিত ভাব** — ব্যাখ্যা + যুক্তি + উদাহরণ (সবচেয়ে বড়)
3. **মন্তব্য** — তাৎপর্য ও শিক্ষা

**নিয়ম**:
- রূপক অর্থ ধরতে হবে, আক্ষরিক নয়
- মূল বাক্য হুবহু উদ্ধৃত করা যাবে না
- এক ভাষারীতিতে (সাধু বা চলিত)
- সাধু+চলিত মেশানো = গুরুচণ্ডালী দোষ
- আকার: ১৫০-২০০ শব্দ
- উদাহরণ/দৃষ্টান্ত অবশ্যই দিতে হবে

**নম্বর পাওয়ার কৌশল**: প্রাসঙ্গিক উদাহরণ, পরিচ্ছন্ন হাতের লেখা, স্পষ্ট অনুচ্ছেদ বিভাজন`,
  },

  // ==================== English 1st Paper ====================
  "Cloze Test": {
    code: "ENGLISH",
    paper: "FIRST",
    notesMarkdown: `# Cloze Test

A cloze test is a passage with blanks that you must fill with suitable words. It tests vocabulary, grammar and comprehension together.

## Two Types

### Cloze Test With Clues
A box of words is given. You choose the right word for each blank.
- Each word is usually used **only once**
- Cross out words as you use them
- Do the easy blanks first, then use elimination for the hard ones

### Cloze Test Without Clues
No word list is given — you must supply your own word.
- Any grammatically and contextually correct word is accepted
- This is harder, so read the whole passage first

## Strategy (ধাপে ধাপে কৌশল)

**Step 1 — Read the whole passage first.** পুরো অনুচ্ছেদ না পড়ে ফাঁকা পূরণ করা সবচেয়ে বড় ভুল। প্রসঙ্গ না জানলে সঠিক শব্দ বাছাই অসম্ভব।

**Step 2 — Identify what part of speech is needed.** Look at the words before and after the blank:
- After *a / an / the* → a **noun** (or adjective + noun)
- After a subject → a **verb**
- Before a noun → an **adjective**
- Modifying a verb → an **adverb**
- After a preposition → a **noun** or **gerund (verb + ing)**

**Step 3 — Check grammar agreement:**
- Subject-verb agreement (*He goes*, not *He go*)
- Tense consistency with the rest of the passage
- Singular/plural

**Step 4 — Look for signal words** that show the logical direction:

| Relationship | Signal words |
|---|---|
| Addition | and, also, moreover, besides |
| Contrast | but, however, although, whereas |
| Cause | because, since, as, due to |
| Result | so, therefore, thus, consequently |
| Example | for example, such as, namely |

**Step 5 — Re-read the completed passage.** পুরোটা আবার পড়ে দেখো অর্থ ঠিক হলো কিনা।

## Common Mistakes (সাধারণ ভুল)
- Filling blanks without reading the full passage
- Ignoring the tense of surrounding sentences
- Using the same word twice when clues are given
- Forgetting articles (a/an/the) and prepositions
- Choosing a word that fits grammar but not meaning

## Practice Example

*Education is the backbone of a ____ (1). It helps people to ____ (2) their potential. Without education, no nation can ____ (3).*

Answers: (1) **nation** — after "a" we need a noun; (2) **realize/develop** — after "to" we need a base verb; (3) **prosper/progress** — after modal "can" we need a base verb.

## Marking Tips
- Spelling must be correct — a right word spelt wrongly loses the mark
- Write clearly; unreadable answers get no credit
- Never leave a blank empty — an intelligent guess costs nothing`,
    formulaSheet: `## Cloze Test — Quick Reference

**Two types**: With clues (word box) · Without clues

**Part of speech signals**:
- a / an / the + ___ → noun
- subject + ___ → verb
- ___ + noun → adjective
- preposition + ___ → noun / gerund
- modal (can, will) + ___ → base verb

**Signal words**:
| Type | Words |
|---|---|
| Addition | and, also, moreover |
| Contrast | but, however, although |
| Cause | because, since, as |
| Result | so, therefore, thus |
| Example | for example, such as |

**Steps**: Read all → identify part of speech → check grammar → use signals → re-read

**Remember**: Correct spelling · Never leave blank · One word per blank (with clues)`,
  },

  "CV & Cover Letter": {
    code: "ENGLISH",
    paper: "FIRST",
    notesMarkdown: `# CV & Cover Letter

## What is a CV?
CV stands for **Curriculum Vitae** (Latin: "course of life"). It is a written summary of your education, skills and experience, sent when applying for a job.

## CV vs Resume
| CV | Resume |
|---|---|
| Detailed, longer | Short (1-2 pages) |
| Full academic and work history | Only relevant highlights |
| Common in academia and in Bangladesh | Common in USA business jobs |

## Standard CV Format

**1. Personal Information**
Name, address, phone, email, date of birth, nationality.
> ⚠️ Use a professional email address. একটা অগোছালো ইমেইল ঠিকানা প্রথমেই খারাপ ধারণা তৈরি করে।

**2. Career Objective**
One or two sentences stating what position you want and what you offer.

*Example*: "To obtain a position as a Junior Officer in a reputed bank where I can apply my analytical skills and contribute to organisational growth."

**3. Educational Qualifications**
Listed in **reverse chronological order** (most recent first) — usually in a table:

| Degree | Institution | Board/University | Year | Result |
|---|---|---|---|---|
| HSC | Dhaka College | Dhaka | 2028 | GPA 5.00 |
| SSC | Ideal School | Dhaka | 2026 | GPA 5.00 |

**4. Work Experience** (if any)
Job title, organisation, duration and main responsibilities.

**5. Computer / Technical Skills**
MS Office, internet browsing, specific software.

**6. Language Proficiency**
Bengali (native), English (fluent in reading, writing, speaking).

**7. Extra-curricular Activities**
Debate, sports, volunteering, club membership.

**8. Personal Details**
Father's name, mother's name, permanent address, religion, marital status.

**9. References**
Two persons (usually teachers or former employers) with name, designation and contact.

## Cover Letter
A short letter sent **with** the CV, explaining why you are applying and why you are suitable.

### Structure
1. **Sender's address and date**
2. **Receiver's address** (name, designation, organisation)
3. **Subject**: "Application for the post of ______"
4. **Salutation**: "Dear Sir/Madam,"
5. **Body**:
   - Para 1: State the post and where you saw the advertisement
   - Para 2: Your qualifications and why you fit
   - Para 3: Request for consideration and interview
6. **Complimentary close**: "Yours faithfully," / "Sincerely yours,"
7. **Signature and name**
8. **Enclosure**: list attached documents

## Key Tips (গুরুত্বপূর্ণ পরামর্শ)
- Keep the cover letter to **one page**
- Never write false information — যাচাই করলে ধরা পড়বে
- Tailor it to each job; একই লেখা সব জায়গায় পাঠানো ভালো নয়
- Check spelling and grammar carefully
- Use formal, polite language throughout
- Keep formatting clean and consistent

## Common Mistakes
- Spelling errors, especially in the company's name
- Too long or rambling
- Informal tone or slang
- Missing contact information
- Repeating the CV word-for-word in the cover letter`,
    formulaSheet: `## CV & Cover Letter — Quick Reference

**CV = Curriculum Vitae**

**CV sections in order**:
1. Personal Information
2. Career Objective
3. Educational Qualifications (reverse chronological)
4. Work Experience
5. Computer Skills
6. Language Proficiency
7. Extra-curricular Activities
8. Personal Details
9. References (usually two)

**Cover letter structure**:
- Sender's address + Date
- Receiver's address
- Subject: "Application for the post of ___"
- Salutation: "Dear Sir/Madam,"
- Body (3 paragraphs)
- "Yours faithfully," / "Sincerely yours,"
- Signature + Name
- Enclosure list

**Remember**: One page · No false info · Formal tone · Check spelling · Professional email`,
  },

  // ==================== English 2nd Paper ====================
  "Essay Writing": {
    code: "ENGLISH",
    paper: "SECOND",
    notesMarkdown: `# Essay Writing

An essay is a piece of writing that presents ideas, arguments or descriptions on a particular topic in an organised way.

## Basic Structure

### 1. Introduction (ভূমিকা)
- Begin with a general statement, a question, or a relevant quotation
- Narrow down to your specific topic
- End with a **thesis statement** — the main idea of the whole essay
- Length: about 10% of the essay

### 2. Body (মূল অংশ)
- Usually **3-4 paragraphs**
- **One main idea per paragraph** — এটাই সবচেয়ে গুরুত্বপূর্ণ নিয়ম
- Each paragraph has:
  - A **topic sentence** (the main point)
  - **Supporting details** (explanation, facts, examples)
  - A **linking sentence** to the next paragraph
- Length: about 80% of the essay

### 3. Conclusion (উপসংহার)
- Restate the thesis in different words
- Summarise the main points briefly
- End with a suggestion, opinion or call to action
- **Never introduce a new idea here**
- Length: about 10%

## Types of Essays
| Type | Purpose |
|---|---|
| **Narrative** | Tells a story or an event |
| **Descriptive** | Describes a person, place or thing |
| **Argumentative** | Presents arguments for/against |
| **Expository** | Explains or informs about a topic |

## Useful Linking Words

**To add**: moreover, furthermore, in addition, besides, also
**To contrast**: however, on the other hand, nevertheless, in contrast
**To give cause**: because, since, as, owing to, due to
**To show result**: therefore, thus, consequently, as a result
**To give example**: for instance, for example, such as, namely
**To conclude**: in conclusion, to sum up, finally, all things considered

## Tips for Good Marks
1. **Plan before writing** — ২-৩ মিনিট খরচ করে পয়েন্ট সাজিয়ে নাও, এতে লেখা গোছানো হয়
2. Use varied sentence structures — simple, compound and complex
3. Use topic-specific vocabulary
4. Give concrete examples, especially from Bangladesh
5. Keep paragraphs balanced in length
6. Leave 2-3 minutes to check spelling and grammar
7. Handwriting must be legible

## Common Mistakes
- No clear paragraph divisions
- Repeating the same idea in different words
- Using informal language ("gonna", "stuff", contractions like "don't")
- Going off-topic
- Writing one huge paragraph
- Memorised essays that do not match the given topic

## Sample Outline: "Environmental Pollution"

**Introduction**: Definition of pollution; why it matters today

**Body Para 1** — *Types*: air, water, soil, sound pollution

**Body Para 2** — *Causes*: industrial waste, vehicle smoke, deforestation, unplanned urbanisation

**Body Para 3** — *Effects*: diseases, climate change, loss of biodiversity; Bangladesh is especially at risk as a low-lying delta

**Body Para 4** — *Solutions*: afforestation, waste management, renewable energy, public awareness, strict law enforcement

**Conclusion**: Collective responsibility; a call for immediate action

## Word Count
For HSC, an essay is usually **250-300 words** unless stated otherwise. Very short essays lose marks for lack of development; very long ones waste time you need for other questions.`,
    formulaSheet: `## Essay Writing — Quick Reference

**Structure**:
- Introduction (10%) — general → specific → thesis
- Body (80%) — 3-4 paragraphs, one idea each
- Conclusion (10%) — restate + summarise + suggestion

**Paragraph formula**: Topic sentence → Supporting details → Link

**Types**: Narrative · Descriptive · Argumentative · Expository

**Linking words**:
| Purpose | Words |
|---|---|
| Add | moreover, furthermore, besides |
| Contrast | however, nevertheless, on the other hand |
| Cause | because, since, owing to |
| Result | therefore, thus, consequently |
| Example | for instance, such as |
| Conclude | in conclusion, to sum up |

**Length**: 250-300 words (HSC)

**Avoid**: contractions · slang · one huge paragraph · new ideas in conclusion`,
  },

  "Letter Writing": {
    code: "ENGLISH",
    paper: "SECOND",
    notesMarkdown: `# Letter Writing

Letters are broadly of two kinds: **formal** (official, business, application) and **informal** (personal, to friends and family).

## Formal Letter

### Parts of a Formal Letter
1. **Sender's address** — top left
2. **Date** — below the address
3. **Receiver's address** — designation and organisation
4. **Subject** — one line stating the purpose
5. **Salutation** — "Dear Sir," / "Dear Madam,"
6. **Body** — usually three paragraphs
7. **Complimentary close** — "Yours faithfully," / "Yours sincerely,"
8. **Signature and name**

### Body Structure
- **Para 1**: State the purpose clearly and directly
- **Para 2**: Give details, reasons or explanation
- **Para 3**: State what action you want and thank the reader

### Language Rules
- Formal, polite and impersonal
- **No contractions** — write "do not", not "don't"
- No slang or emotional language
- Short, clear sentences
- Passive voice is often suitable ("It is requested that...")

## Informal Letter

### Parts
1. **Sender's address and date** — top right (or left)
2. **Salutation** — "Dear Rahim," / "My dear brother,"
3. **Body** — free and friendly
4. **Close** — "Yours ever," / "With love," / "Your loving friend,"
5. **Name**

### Language
- Casual, warm and personal
- Contractions are fine ("I'm", "don't")
- Ask about the reader's well-being
- Personal news and feelings are welcome

## Formal vs Informal

| Feature | Formal | Informal |
|---|---|---|
| Tone | Polite, impersonal | Friendly, personal |
| Contractions | Not used | Used freely |
| Salutation | Dear Sir/Madam | Dear + first name |
| Close | Yours faithfully | Yours ever / With love |
| Subject line | Required | Not used |

## Application to the Principal
This is the most common HSC letter. Format:

> The Principal
> [College Name]
> [Address]
>
> **Subject**: Application for ______
>
> Sir,
> With due respect, I beg to state that ______
>
> I, therefore, pray and hope that you would be kind enough to ______
>
> Sincerely yours,
> [Name]
> Class: ___, Roll: ___

**Common topics**: sick leave, transfer certificate, testimonial, seat in the hostel, setting up a canteen or common room, increasing library facilities.

## Email
Modern papers often ask for an email instead of a letter:

\`\`\`
To: recipient@example.com
Subject: [clear and specific]

Dear Sir,
[body]

Best regards,
[Name]
\`\`\`

Emails are shorter than letters, but keep formal language for official purposes.

## Common Mistakes (সাধারণ ভুল)
- Mixing formal and informal tone
- Forgetting the subject line in a formal letter
- Wrong complimentary close ("Yours faithfully" with a named person — use "Yours sincerely" instead)
- No paragraph divisions
- Writing the address in the wrong position
- Using contractions in a formal letter`,
    formulaSheet: `## Letter Writing — Quick Reference

**Formal letter parts**:
1. Sender's address · 2. Date · 3. Receiver's address
4. Subject · 5. Salutation · 6. Body (3 paras)
7. Complimentary close · 8. Signature

**Salutation → Close pairing**:
- "Dear Sir/Madam" → "Yours faithfully,"
- "Dear Mr. Rahman" → "Yours sincerely,"
- "Dear Rahim" (friend) → "Yours ever," / "With love,"

**Formal**: no contractions · polite · subject line required
**Informal**: contractions fine · warm tone · no subject line

**Application to Principal**:
"Sir, With due respect, I beg to state that..."
"I, therefore, pray and hope that you would be kind enough to..."

**Email**: To → Subject → Dear Sir → body → Best regards`,
  },
};

async function main() {
  console.log("🔍 ICT + বাংলা + English এর নোট-শূন্য টপিকে কনটেন্ট বসানো হচ্ছে...\n");

  const subjects = await prisma.subject.findMany({
    where: { code: { in: ["ICT", "BANGLA", "ENGLISH"] } },
    select: { id: true, name: true, code: true, paper: true },
  });
  const key = (c: SubjectCode, p: PaperNumber) => `${c}:${p}`;
  const byKey = new Map(subjects.map((s) => [key(s.code, s.paper), s]));

  let updated = 0;
  let skipped = 0;
  const notFound: string[] = [];

  for (const [topicName, content] of Object.entries(contentByTopic)) {
    const subject = byKey.get(key(content.code, content.paper));
    if (!subject) {
      notFound.push(`${topicName} (সাবজেক্ট নেই: ${content.code}/${content.paper})`);
      continue;
    }

    const topic = await prisma.topic.findFirst({
      where: { name: topicName, chapter: { subjectId: subject.id } },
      select: { id: true, notesMarkdown: true, formulaSheet: true },
    });

    if (!topic) {
      notFound.push(`${topicName} (${subject.name})`);
      continue;
    }

    const firstLine = (s: string) => s.split("\n")[0].trim();
    const hasOtherContent =
      topic.notesMarkdown != null &&
      topic.notesMarkdown.length > 100 &&
      firstLine(topic.notesMarkdown) !== firstLine(content.notesMarkdown);
    if (hasOtherContent) {
      console.log(`⏭️  ${topicName} — অন্য seed এর নোট আছে`);
      skipped += 1;
      continue;
    }

    if (
      topic.notesMarkdown === content.notesMarkdown &&
      topic.formulaSheet === content.formulaSheet
    ) {
      console.log(`✓  ${topicName} — অপরিবর্তিত`);
      skipped += 1;
      continue;
    }

    await prisma.topic.update({
      where: { id: topic.id },
      data: {
        notesMarkdown: content.notesMarkdown,
        formulaSheet: content.formulaSheet,
      },
    });
    console.log(`✅ [${subject.name}] ${topicName} — ${content.notesMarkdown.length} অক্ষর`);
    updated += 1;
  }

  if (notFound.length > 0) {
    console.log(`\n⚠️  পাওয়া যায়নি: ${notFound.join(", ")}`);
  }

  console.log(`\n📊 ফলাফল:  নতুন ${updated} · অপরিবর্তিত ${skipped}`);
  for (const s of subjects) {
    const remaining = await prisma.topic.count({
      where: {
        chapter: { subjectId: s.id },
        OR: [{ notesMarkdown: null }, { notesMarkdown: "" }],
      },
    });
    console.log(`   ${s.name}: এখনো নোট-শূন্য ${remaining}`);
  }
}

main()
  .catch((e) => {
    console.error("❌ সমস্যা হয়েছে:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
