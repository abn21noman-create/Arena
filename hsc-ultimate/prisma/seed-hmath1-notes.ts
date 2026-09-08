// ===================================================================
// Higher Math (উচ্চতর গণিত) 1st Paper — গুরুত্বপূর্ণ টপিকে
// Notes+Formula Sheet Seed Script
// -------------------------------------------------------------------
// Physics/Chemistry/Biology Notes Seed ফিচারগুলোর সরাসরি ধারাবাহিকতা —
// একই প্রমাণিত প্যাটার্নে Higher Math 1st Paper এর ১০টা isImportant=true
// টপিকে বাস্তব কনটেন্ট যোগ করা হচ্ছে। গণিতে formulaSheet ফিল্ড তার
// আসল উদ্দেশ্যেই ব্যবহৃত হয়েছে (Physics/Chemistry এর মতো) — প্রকৃত
// গাণিতিক সূত্র, LaTeX দিয়ে লেখা, যা KaTeX দিয়ে রেন্ডার হবে।
//
// তথ্যসূত্র (web_search দিয়ে verify করা, ২০২৬ জুলাই):
// - নির্ণায়কের মান নির্ণয়: cofactor expansion, নির্ণায়কের ধর্ম
//   (webschoolbd.com, mathcheap.com)
// - স্কেলার ও ভেক্টর গুণন: ডট প্রোডাক্ট, ক্রস প্রোডাক্ট, i,j,k নোটেশন
//   (sattacademy.com, 10minuteschool.com, itmona.com)
// - সরলরেখার সমীকরণ: ঢাল-ছেদ, বিন্দু-ঢাল, দুই বিন্দু, সাধারণ রূপ
//   (sattacademy.com, webschoolbd.com, slideshare.net)
// - বৃত্তের সমীকরণ: মানক ও সাধারণ রূপ, কেন্দ্র-ব্যাসার্ধ
//   (10minuteschool.com, mathcheap.com, sattacademy.com)
// - বিন্যাস ও সমাবেশ: nPr, nCr সূত্র, পার্থক্য
//   (w3classroom.com, sattacademy.com, chorcha.net)
// - ত্রিকোণমিতিক অভেদ: sin²+cos²=1, tan=sin/cos
//   (eshikhon.com, mathcheap.com)
// - যোগ ও বিয়োগ সূত্র (সংযুক্ত কোণ): sin(A±B), cos(A±B)
//   (eshikhon.com.bd, mathcheap.com, udvash.com)
// - অন্তরীকরণের সূত্রাবলি: d/dx(xⁿ), ত্রিকোণমিতিক অন্তরজ, চেইন রুল
//   (wisilife.com, mathcheap.com)
// - যোগজীকরণের সূত্রাবলি: ∫xⁿdx, by parts, substitution
//   (mathcheap.com, 10minuteschool.com)
//
// রান করার নিয়ম: pnpm exec tsx prisma/seed-hmath1-notes.ts
// idempotent — বার বার চালালে আগের নোট/ফর্মুলাশীট মুছে নতুন করে বসাবে।
// ===================================================================
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface TopicContentSeed {
  notesMarkdown: string;
  formulaSheet: string;
}

const contentByTopic: Record<string, TopicContentSeed> = {
  "নির্ণায়কের মান নির্ণয়": {
    notesMarkdown: `# নির্ণায়কের মান নির্ণয়

## নির্ণায়ক (Determinant) কী
বর্গ ম্যাট্রিক্স থেকে পাওয়া একটি সংখ্যাকে **নির্ণায়ক** বলে, যা ম্যাট্রিক্সের অনেক গুরুত্বপূর্ণ বৈশিষ্ট্য নির্দেশ করে (যেমন ম্যাট্রিক্স বিপরীতযোগ্য কিনা)।

## ২×২ নির্ণায়কের মান
$$\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix} = ad - bc$$

## ৩×৩ নির্ণায়কের মান (Cofactor Expansion)
প্রথম সারি বরাবর বিস্তৃত করে:
$$\\begin{vmatrix} a_1 & b_1 & c_1 \\\\ a_2 & b_2 & c_2 \\\\ a_3 & b_3 & c_3 \\end{vmatrix} = a_1(b_2c_3 - b_3c_2) - b_1(a_2c_3 - a_3c_2) + c_1(a_2b_3 - a_3b_2)$$

## নির্ণায়কের গুরুত্বপূর্ণ ধর্ম
1. নির্ণায়কের কোনো সারি বা কলামের সব উপাদান শূন্য হলে নির্ণায়কের মান শূন্য হয়
2. সারি ও কলাম পরস্পর স্থান বিনিময় করলে (transpose) নির্ণায়কের মান অপরিবর্তিত থাকে
3. পাশাপাশি দুটি সারি/কলাম স্থান বিনিময় করলে নির্ণায়কের **চিহ্ন পরিবর্তিত** হয়, মান একই থাকে
4. দুটি সারি/কলাম অভিন্ন (identical) হলে নির্ণায়কের মান শূন্য হয়
5. কোনো সারি/কলামের প্রতিটি উপাদানকে একটি ধ্রুবক দিয়ে গুণ করলে নির্ণায়কের মানও সেই ধ্রুবক দিয়ে গুণিত হয়

## বিপরীত ম্যাট্রিক্স ও নির্ণায়ক
$2\\times2$ ম্যাট্রিক্স $A$ এর জন্য, $|A| \\neq 0$ হলে:
$$A^{-1} = \\frac{1}{|A|}\\text{adj}(A)$$

নির্ণায়কের মান শূন্য হলে ম্যাট্রিক্সটির বিপরীত ম্যাট্রিক্স থাকে না (Singular Matrix)।

## প্রয়োগ
নির্ণায়ক ব্যবহার করে একাধিক চলকবিশিষ্ট সমীকরণ সিস্টেম সমাধান করা যায় (ক্রেমারের নিয়ম), এবং বিপরীত ম্যাট্রিক্স নির্ণয় করা যায়।`,
    formulaSheet: `## নির্ণায়কের মান নির্ণয় — সূত্রাবলি

$$\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix} = ad - bc$$

$$\\begin{vmatrix} a_1 & b_1 & c_1 \\\\ a_2 & b_2 & c_2 \\\\ a_3 & b_3 & c_3 \\end{vmatrix} = a_1(b_2c_3 - b_3c_2) - b_1(a_2c_3 - a_3c_2) + c_1(a_2b_3 - a_3b_2)$$

$$A^{-1} = \\frac{1}{|A|}\\text{adj}(A), \\quad |A| \\neq 0$$

**নির্ণায়কের ধর্ম:**
- সারি/কলাম স্থান বিনিময়ে চিহ্ন পরিবর্তন
- অভিন্ন সারি/কলামে মান = ০
- transpose এ মান অপরিবর্তিত`,
  },

  "স্কেলার ও ভেক্টর গুণন": {
    notesMarkdown: `# স্কেলার ও ভেক্টর গুণন

## স্কেলার গুণন (Dot Product)
দুটি ভেক্টরের স্কেলার গুণনের ফলাফল একটি **স্কেলার রাশি**। যদি $\\vec{A} = A_x i + A_y j + A_z k$ এবং $\\vec{B} = B_x i + B_y j + B_z k$ হয়:
$$\\vec{A} \\cdot \\vec{B} = A_xB_x + A_yB_y + A_zB_z$$

কোণের মাধ্যমে:
$$\\vec{A} \\cdot \\vec{B} = |A||B|\\cos\\theta$$

যেখানে $\\theta$ হলো দুই ভেক্টরের মধ্যবর্তী কোণ। ডট প্রোডাক্ট শূন্য হলে ভেক্টরদ্বয় পরস্পর **লম্ব**।

## ভেক্টর গুণন (Cross Product)
দুটি ভেক্টরের ভেক্টর গুণনের ফলাফল একটি **ভেক্টর রাশি**, যা মূল দুটি ভেক্টরের সমতলে লম্ব।
$$\\vec{A} \\times \\vec{B} = (A_yB_z - A_zB_y)i - (A_xB_z - A_zB_x)j + (A_xB_y - A_yB_x)k$$

কোণের মাধ্যমে মান:
$$|\\vec{A} \\times \\vec{B}| = |A||B|\\sin\\theta$$

ক্রস প্রোডাক্টের দিক **ডানহাতি স্ক্রু নিয়মে** নির্ণয় করা হয়। ক্রস প্রোডাক্ট শূন্য হলে ভেক্টরদ্বয় পরস্পর **সমান্তরাল**।

## একক ভেক্টরের গুণফল সম্পর্ক
$$i \\cdot i = j \\cdot j = k \\cdot k = 1, \\quad i \\cdot j = j \\cdot k = k \\cdot i = 0$$
$$i \\times i = j \\times j = k \\times k = 0, \\quad i \\times j = k,\\ j \\times k = i,\\ k \\times i = j$$

## জ্যামিতিক প্রয়োগ
- **সামান্তরিকের ক্ষেত্রফল**: $|\\vec{a} \\times \\vec{b}|$ (যেখানে $\\vec{a}, \\vec{b}$ সন্নিহিত বাহু)
- **ত্রিভুজের ক্ষেত্রফল**: $\\frac{1}{2}|\\vec{a} \\times \\vec{b}|$
- **রম্বসের ক্ষেত্রফল**: $\\frac{1}{2}|\\vec{d_1} \\times \\vec{d_2}|$ (কর্ণদ্বয়)

## ডট প্রোডাক্ট বনাম ক্রস প্রোডাক্ট
| বৈশিষ্ট্য | ডট প্রোডাক্ট | ক্রস প্রোডাক্ট |
|---|---|---|
| ফলাফল | স্কেলার | ভেক্টর |
| ক্রমবিনিময়যোগ্যতা | $\\vec{A}\\cdot\\vec{B}=\\vec{B}\\cdot\\vec{A}$ | $\\vec{A}\\times\\vec{B}=-\\vec{B}\\times\\vec{A}$ |
| শূন্য হলে | লম্ব | সমান্তরাল |`,
    formulaSheet: `## স্কেলার ও ভেক্টর গুণন — সূত্রাবলি

**ডট প্রোডাক্ট:**
$$\\vec{A} \\cdot \\vec{B} = A_xB_x + A_yB_y + A_zB_z = |A||B|\\cos\\theta$$

**ক্রস প্রোডাক্ট:**
$$\\vec{A} \\times \\vec{B} = (A_yB_z - A_zB_y)i - (A_xB_z - A_zB_x)j + (A_xB_y - A_yB_x)k$$
$$|\\vec{A} \\times \\vec{B}| = |A||B|\\sin\\theta$$

**ক্ষেত্রফল প্রয়োগ:**
- ত্রিভুজ: $\\frac{1}{2}|\\vec{a} \\times \\vec{b}|$
- সামান্তরিক: $|\\vec{a} \\times \\vec{b}|$

লম্ব হলে: $\\vec{A}\\cdot\\vec{B}=0$; সমান্তরাল হলে: $\\vec{A}\\times\\vec{B}=0$`,
  },

  "সরলরেখার সমীকরণ": {
    notesMarkdown: `# সরলরেখার সমীকরণ

## ঢাল-ছেদ আকার (Slope-Intercept Form)
$$y = mx + c$$
যেখানে $m$ = রেখার ঢাল, $c$ = $y$-অক্ষে ছেদবিন্দু।

## বিন্দু-ঢাল আকার (Point-Slope Form)
$(x_1, y_1)$ বিন্দুগামী ও $m$ ঢালবিশিষ্ট সরলরেখার সমীকরণ:
$$y - y_1 = m(x - x_1)$$

## দুই বিন্দুগামী সরলরেখার সমীকরণ
$(x_1, y_1)$ ও $(x_2, y_2)$ বিন্দুগামী রেখার সমীকরণ:
$$\\frac{x - x_1}{x_1 - x_2} = \\frac{y - y_1}{y_1 - y_2}$$

## সাধারণ আকার (General Form)
$$Ax + By + C = 0$$
এই রেখার ঢাল: $m = -\\dfrac{A}{B}$

## দুই ছেদবিন্দু আকার (Intercept Form)
রেখা $x$-অক্ষকে $(a,0)$ এবং $y$-অক্ষকে $(0,b)$ বিন্দুতে ছেদ করলে:
$$\\frac{x}{a} + \\frac{y}{b} = 1$$

## ঢাল নির্ণয়ের সূত্র
$(x_1,y_1)$ ও $(x_2,y_2)$ বিন্দুগামী রেখার ঢাল:
$$m = \\frac{y_2 - y_1}{x_2 - x_1}$$

## সমান্তরাল ও লম্ব সরলরেখা
- দুটি রেখা সমান্তরাল হলে তাদের ঢাল সমান: $m_1 = m_2$
- দুটি রেখা পরস্পর লম্ব হলে: $m_1 \\cdot m_2 = -1$
- $a_1x+b_1y+c_1=0$ ও $a_2x+b_2y+c_2=0$ লম্ব হলে: $a_1a_2+b_1b_2=0$

## বিশেষ ক্ষেত্র
- $x$-অক্ষের সমীকরণ: $y = 0$
- $y$-অক্ষের সমীকরণ: $x = 0$
- মূলবিন্দুগামী রেখা ($c=0$): $y = mx$`,
    formulaSheet: `## সরলরেখার সমীকরণ — সূত্রাবলি

| রূপ | সমীকরণ |
|---|---|
| ঢাল-ছেদ | $y = mx + c$ |
| বিন্দু-ঢাল | $y - y_1 = m(x - x_1)$ |
| দুই বিন্দু | $\\dfrac{x-x_1}{x_1-x_2} = \\dfrac{y-y_1}{y_1-y_2}$ |
| সাধারণ রূপ | $Ax + By + C = 0$, ঢাল $= -A/B$ |
| দুই ছেদবিন্দু | $\\dfrac{x}{a} + \\dfrac{y}{b} = 1$ |

**ঢাল:** $m = \\dfrac{y_2-y_1}{x_2-x_1}$

**সমান্তরাল:** $m_1 = m_2$ । **লম্ব:** $m_1 \\cdot m_2 = -1$`,
  },

  "বৃত্তের সমীকরণ": {
    notesMarkdown: `# বৃত্তের সমীকরণ

## মানক সমীকরণ (Standard Form)
$(a, b)$ কেন্দ্র ও $r$ ব্যাসার্ধবিশিষ্ট বৃত্তের সমীকরণ:
$$(x - a)^2 + (y - b)^2 = r^2$$

মূলবিন্দুকেন্দ্রিক বৃত্তের সমীকরণ ($a=0, b=0$):
$$x^2 + y^2 = r^2$$

## সাধারণ সমীকরণ (General Form)
মানক সমীকরণ বিস্তৃত করে পাওয়া যায়:
$$x^2 + y^2 + 2gx + 2fy + c = 0$$

এই সমীকরণ থেকে:
- **কেন্দ্র**: $(-g, -f)$
- **ব্যাসার্ধ**: $r = \\sqrt{g^2 + f^2 - c}$

## বৃত্তের সমীকরণ প্রতিষ্ঠা (Derivation)
$(h,k)$ কেন্দ্র ও $a$ ব্যাসার্ধের বৃত্তের উপর যেকোনো বিন্দু $(x,y)$ এর জন্য পিথাগোরাসের উপপাদ্য প্রয়োগ করে:
$$(x-h)^2 + (y-k)^2 = a^2$$

## স্পর্শকের সমীকরণ
$(x_1, y_1)$ বিন্দুতে বৃত্ত $(x-h)^2+(y-k)^2=r^2$ এর স্পর্শকের সমীকরণ:
$$(x-h)(x_1-h) + (y-k)(y_1-k) = r^2$$

## বাইরের বিন্দু থেকে স্পর্শকের দৈর্ঘ্য
$(x_1, y_1)$ বৃত্তের বাইরের বিন্দু হলে, বৃত্তে অঙ্কিত স্পর্শকের দৈর্ঘ্য:
$$PT = \\sqrt{(x_1-h)^2 + (y_1-k)^2 - r^2}$$

## দুই বৃত্তের ছেদবিন্দুগামী বৃত্ত
প্রথম বৃত্ত $+ k(\\text{দ্বিতীয় বৃত্ত}) = 0$ (যেখানে $k$ যেকোনো ধ্রুবক)

## দুই বৃত্তের সাধারণ জ্যা (Common Chord)
দুটি বৃত্তের সমীকরণ বিয়োগ করলে সাধারণ জ্যার সমীকরণ পাওয়া যায়।`,
    formulaSheet: `## বৃত্তের সমীকরণ — সূত্রাবলি

**মানক রূপ:** $(x-a)^2+(y-b)^2=r^2$ [কেন্দ্র $(a,b)$, ব্যাসার্ধ $r$]

**সাধারণ রূপ:** $x^2+y^2+2gx+2fy+c=0$
- কেন্দ্র: $(-g,-f)$
- ব্যাসার্ধ: $r=\\sqrt{g^2+f^2-c}$

**স্পর্শকের সমীকরণ** (বিন্দু $(x_1,y_1)$ বৃত্তের উপর):
$$(x-h)(x_1-h)+(y-k)(y_1-k)=r^2$$

**স্পর্শকের দৈর্ঘ্য** (বাইরের বিন্দু থেকে):
$$PT=\\sqrt{(x_1-h)^2+(y_1-k)^2-r^2}$$`,
  },

  "বিন্যাস": {
    notesMarkdown: `# বিন্যাস (Permutation)

## বিন্যাস কী
কতগুলো ভিন্ন ভিন্ন বস্তু থেকে কতগুলো বা সবগুলো বস্তু নিয়ে **যতভাবে সাজানো (arrange) যায়**, তার প্রতিটি ভিন্ন সজ্জাকে বিন্যাস বলে। বিন্যাসে **ক্রম (order) গুরুত্বপূর্ণ** — ক্রম পরিবর্তন হলে নতুন বিন্যাস তৈরি হয়।

## বিন্যাসের সূত্র
$n$ সংখ্যক ভিন্ন বস্তু থেকে প্রতিবারে $r$ সংখ্যক বস্তু নিয়ে বিন্যাসের সংখ্যা:
$$^nP_r = \\frac{n!}{(n-r)!}$$

সবগুলো বস্তু নিয়ে বিন্যাস ($r = n$):
$$^nP_n = n!$$

## একই জাতীয় বস্তুর বিন্যাস
$n$টি বস্তুর মধ্যে $p$টি একজাতীয়, $q$টি আরেক জাতীয় (এবং বাকি ভিন্ন) হলে, বিন্যাসের সংখ্যা:
$$\\frac{n!}{p! \\, q!}$$

## বৃত্তাকার বিন্যাস (Circular Permutation)
$n$টি ভিন্ন বস্তুর বৃত্তাকার বিন্যাস সংখ্যা: $(n-1)!$

## বিন্যাসের বৈশিষ্ট্য
- অক্ষর/সংখ্যা সাজানো, শব্দ গঠন, ক্রমিক স্থান নির্ধারণে বিন্যাস ব্যবহৃত হয়
- উদাহরণ: $AB$ ও $BA$ — দুটি **ভিন্ন** বিন্যাস (ক্রম আলাদা)

## গুরুত্বপূর্ণ উদাহরণ
$^5P_2 = \\dfrac{5!}{3!} = \\dfrac{5\\times4\\times3!}{3!} = 20$

এর মানে ৫টি ভিন্ন বস্তু থেকে ২টি নিয়ে ২০ ভাবে সাজানো যায়।`,
    formulaSheet: `## বিন্যাস — সূত্রাবলি

$$^nP_r = \\frac{n!}{(n-r)!}$$

$$^nP_n = n!$$

**একই জাতীয় বস্তুর বিন্যাস:** $\\dfrac{n!}{p!\\,q!}$

**বৃত্তাকার বিন্যাস:** $(n-1)!$

উদাহরণ: $^5P_2 = \\dfrac{5!}{3!} = 20$`,
  },

  "সমাবেশ": {
    notesMarkdown: `# সমাবেশ (Combination)

## সমাবেশ কী
কতগুলো বস্তু থেকে কতগুলো বা সবগুলো বস্তু নিয়ে **যতভাবে বাছাই/নির্বাচন করা যায়** (ক্রম বিবেচনা না করে), তার প্রতিটিকে সমাবেশ বলে। সমাবেশে **শুধু উপস্থিতি গুরুত্বপূর্ণ**, ক্রম নয়।

## সমাবেশের সূত্র
$n$ সংখ্যক ভিন্ন বস্তু থেকে $r$ সংখ্যক বস্তুর সমাবেশ সংখ্যা:
$$^nC_r = \\frac{n!}{r!(n-r)!}$$

## বিন্যাস ও সমাবেশের সম্পর্ক
$$^nP_r = r! \\times {^nC_r}$$

## সমাবেশের গুরুত্বপূর্ণ ধর্ম
1. **প্রতিসাম্য সূত্র**: $^nC_r = {^nC_{n-r}}$
2. **প্যাস্কালের সূত্র**: $^nC_r + {^nC_{r-1}} = {^{n+1}C_r}$
3. $^nC_0 = {^nC_n} = 1$
4. $^nC_1 = n$

## বিন্যাস বনাম সমাবেশ
| বৈশিষ্ট্য | বিন্যাস | সমাবেশ |
|---|---|---|
| ক্রম | গুরুত্বপূর্ণ | গুরুত্বপূর্ণ নয় |
| ফলাফলের সংখ্যা | বড় | ছোট |
| উদাহরণ | শব্দ গঠন, র‍্যাংকিং | কমিটি, দল, হ্যান্ডশেক |
| $AB, BA$ | দুটি ভিন্ন বিন্যাস | একটি সমাবেশ |

## গুরুত্বপূর্ণ উদাহরণ
$^5C_3 = \\dfrac{5!}{3! \\times 2!} = \\dfrac{5\\times4}{2\\times1} = 10$

## প্রয়োগ ক্ষেত্র
কমিটি গঠন, দল নির্বাচন, হ্যান্ডশেকের সংখ্যা, লটারি/সম্ভাবনা সংক্রান্ত সমস্যা — এসব ক্ষেত্রে সমাবেশ সূত্র প্রয়োগ করতে হয়।`,
    formulaSheet: `## সমাবেশ — সূত্রাবলি

$$^nC_r = \\frac{n!}{r!(n-r)!}$$

**বিন্যাস-সমাবেশ সম্পর্ক:** $^nP_r = r! \\times {^nC_r}$

**প্রতিসাম্য:** $^nC_r = {^nC_{n-r}}$

**প্যাস্কালের সূত্র:** $^nC_r + {^nC_{r-1}} = {^{n+1}C_r}$

উদাহরণ: $^5C_3 = \\dfrac{5!}{3!\\times2!} = 10$`,
  },

  "ত্রিকোণমিতিক অভেদ": {
    notesMarkdown: `# ত্রিকোণমিতিক অভেদ

## মৌলিক অভেদ (Pythagorean Identities)
সমকোণী ত্রিভুজে পিথাগোরাসের উপপাদ্য থেকে:
$$\\sin^2\\theta + \\cos^2\\theta = 1$$
$$1 + \\tan^2\\theta = \\sec^2\\theta$$
$$1 + \\cot^2\\theta = \\text{cosec}^2\\theta$$

## অনুপাতের সংজ্ঞা ও সম্পর্ক
$$\\tan\\theta = \\frac{\\sin\\theta}{\\cos\\theta}, \\quad \\cot\\theta = \\frac{\\cos\\theta}{\\sin\\theta}$$
$$\\text{cosec}\\,\\theta = \\frac{1}{\\sin\\theta}, \\quad \\sec\\theta = \\frac{1}{\\cos\\theta}, \\quad \\cot\\theta = \\frac{1}{\\tan\\theta}$$

## কো-ফাংশন সম্পর্ক (Complementary Angles)
$$\\sin(90°-\\theta) = \\cos\\theta, \\quad \\cos(90°-\\theta) = \\sin\\theta$$
$$\\tan(90°-\\theta) = \\cot\\theta, \\quad \\cot(90°-\\theta) = \\tan\\theta$$

## অভেদ প্রমাণের কৌশল
সাধারণত একপক্ষকে (সাধারণত জটিল পক্ষ) $\\sin$ ও $\\cos$ এ রূপান্তর করে অপরপক্ষের সমান করে দেখানো হয়। মৌলিক অভেদ $\\sin^2\\theta+\\cos^2\\theta=1$ প্রায় সব প্রমাণেই ব্যবহৃত হয়।

## গুরুত্বপূর্ণ কোণের মান
| $\\theta$ | $0°$ | $30°$ | $45°$ | $60°$ | $90°$ |
|---|---|---|---|---|---|
| $\\sin\\theta$ | $0$ | $\\frac{1}{2}$ | $\\frac{1}{\\sqrt2}$ | $\\frac{\\sqrt3}{2}$ | $1$ |
| $\\cos\\theta$ | $1$ | $\\frac{\\sqrt3}{2}$ | $\\frac{1}{\\sqrt2}$ | $\\frac{1}{2}$ | $0$ |
| $\\tan\\theta$ | $0$ | $\\frac{1}{\\sqrt3}$ | $1$ | $\\sqrt3$ | অসংজ্ঞায়িত |

## সাধারণ সমাধান (General Solution)
$$\\sin\\theta = \\sin\\alpha \\Rightarrow \\theta = n\\pi + (-1)^n\\alpha$$
$$\\cos\\theta = \\cos\\alpha \\Rightarrow \\theta = 2n\\pi \\pm \\alpha$$
$$\\tan\\theta = \\tan\\alpha \\Rightarrow \\theta = n\\pi + \\alpha$$`,
    formulaSheet: `## ত্রিকোণমিতিক অভেদ — সূত্রাবলি

$$\\sin^2\\theta + \\cos^2\\theta = 1$$
$$1 + \\tan^2\\theta = \\sec^2\\theta$$
$$1 + \\cot^2\\theta = \\text{cosec}^2\\theta$$

**কো-ফাংশন:** $\\sin(90°-\\theta)=\\cos\\theta$, $\\cos(90°-\\theta)=\\sin\\theta$

**সাধারণ সমাধান:**
- $\\sin\\theta=\\sin\\alpha \\Rightarrow \\theta=n\\pi+(-1)^n\\alpha$
- $\\cos\\theta=\\cos\\alpha \\Rightarrow \\theta=2n\\pi\\pm\\alpha$
- $\\tan\\theta=\\tan\\alpha \\Rightarrow \\theta=n\\pi+\\alpha$`,
  },

  "যোগ ও বিয়োগ সূত্র": {
    notesMarkdown: `# সংযুক্ত কোণের যোগ ও বিয়োগ সূত্র

## যৌগিক কোণের ত্রিকোণমিতিক অনুপাত
$$\\sin(A+B) = \\sin A\\cos B + \\cos A\\sin B$$
$$\\sin(A-B) = \\sin A\\cos B - \\cos A\\sin B$$
$$\\cos(A+B) = \\cos A\\cos B - \\sin A\\sin B$$
$$\\cos(A-B) = \\cos A\\cos B + \\sin A\\sin B$$
$$\\tan(A+B) = \\frac{\\tan A + \\tan B}{1 - \\tan A\\tan B}$$
$$\\tan(A-B) = \\frac{\\tan A - \\tan B}{1 + \\tan A\\tan B}$$

## গুণফল থেকে যোগফলে রূপান্তর
$$2\\sin A\\cos B = \\sin(A+B) + \\sin(A-B)$$
$$2\\cos A\\sin B = \\sin(A+B) - \\sin(A-B)$$
$$2\\cos A\\cos B = \\cos(A+B) + \\cos(A-B)$$
$$2\\sin A\\sin B = \\cos(A-B) - \\cos(A+B)$$

## যোগফল থেকে গুণফলে রূপান্তর
$$\\sin A + \\sin B = 2\\sin\\frac{A+B}{2}\\cos\\frac{A-B}{2}$$
$$\\sin A - \\sin B = 2\\cos\\frac{A+B}{2}\\sin\\frac{A-B}{2}$$
$$\\cos A + \\cos B = 2\\cos\\frac{A+B}{2}\\cos\\frac{A-B}{2}$$
$$\\cos A - \\cos B = -2\\sin\\frac{A+B}{2}\\sin\\frac{A-B}{2}$$

## দ্বিগুণ কোণের সূত্র (থেকে উদ্ভূত)
$A=B$ বসিয়ে যোগ সূত্র থেকে পাওয়া যায়:
$$\\sin 2A = 2\\sin A\\cos A$$
$$\\cos 2A = \\cos^2 A - \\sin^2 A = 1-2\\sin^2A = 2\\cos^2A-1$$
$$\\tan 2A = \\frac{2\\tan A}{1-\\tan^2A}$$

## প্রয়োগ
জটিল ত্রিকোণমিতিক সমীকরণ সমাধান, প্রমাণ সংক্রান্ত সমস্যা, এবং $75°, 15°$ এর মতো অ-মানক কোণের অনুপাত নির্ণয়ে ($75° = 45°+30°$ ভেঙে) এই সূত্রগুলো ব্যবহৃত হয়।`,
    formulaSheet: `## যোগ ও বিয়োগ সূত্র — সূত্রাবলি

$$\\sin(A\\pm B) = \\sin A\\cos B \\pm \\cos A\\sin B$$
$$\\cos(A\\pm B) = \\cos A\\cos B \\mp \\sin A\\sin B$$
$$\\tan(A\\pm B) = \\frac{\\tan A \\pm \\tan B}{1 \\mp \\tan A\\tan B}$$

**দ্বিগুণ কোণ:**
$$\\sin 2A = 2\\sin A\\cos A, \\quad \\cos 2A = 1-2\\sin^2A$$

**গুণফল→যোগফল:** $2\\sin A\\cos B = \\sin(A+B)+\\sin(A-B)$`,
  },

  "অন্তরীকরণের সূত্রাবলি": {
    notesMarkdown: `# অন্তরীকরণের সূত্রাবলি

## মৌলিক নিয়ম
$$\\frac{d}{dx}(x^n) = nx^{n-1}$$
$$\\frac{d}{dx}(a) = 0 \\quad (a \\text{ ধ্রুবক})$$
$$\\frac{d}{dx}(a \\cdot f) = a\\frac{df}{dx}$$
$$\\frac{d}{dx}(f \\pm g) = \\frac{df}{dx} \\pm \\frac{dg}{dx}$$

## গুণফল নিয়ম (Product Rule)
$$\\frac{d}{dx}(uv) = v\\frac{du}{dx} + u\\frac{dv}{dx}$$

## ভাগফল নিয়ম (Quotient Rule)
$$\\frac{d}{dx}\\left(\\frac{u}{v}\\right) = \\frac{v\\frac{du}{dx} - u\\frac{dv}{dx}}{v^2}$$

## ত্রিকোণমিতিক ফাংশনের অন্তরজ
$$\\frac{d}{dx}(\\sin x) = \\cos x, \\quad \\frac{d}{dx}(\\cos x) = -\\sin x$$
$$\\frac{d}{dx}(\\tan x) = \\sec^2x, \\quad \\frac{d}{dx}(\\cot x) = -\\text{cosec}^2x$$

## চেইন রুল (Chain Rule)
$f(x)$ ও $g(x)$ দুটি ফাংশন হলে, যৌগিক ফাংশন $f(g(x))$ এর অন্তরজ:
$$\\frac{d}{dx}\\big[f(g(x))\\big] = f'(g(x)) \\cdot g'(x)$$

উদাহরণ: $\\dfrac{d}{dx}(\\sin x^2) = \\cos(x^2) \\cdot 2x$

## উচ্চতর ক্রমের অন্তরজ (Higher Order Derivatives)
প্রথম অন্তরজকে আবার অন্তরীকরণ করে দ্বিতীয় ক্রমের অন্তরজ পাওয়া যায়:
$$\\frac{d^2y}{dx^2} = \\frac{d}{dx}\\left(\\frac{dy}{dx}\\right)$$

## প্রয়োগ
অন্তরীকরণ দিয়ে বক্ররেখার ঢাল, ফাংশনের সর্বোচ্চ/সর্বনিম্ন মান (Maxima/Minima), এবং হারের সমস্যা (Rate of change) সমাধান করা যায়।`,
    formulaSheet: `## অন্তরীকরণের সূত্রাবলি

$$\\frac{d}{dx}(x^n) = nx^{n-1}$$
$$\\frac{d}{dx}(\\sin x) = \\cos x, \\quad \\frac{d}{dx}(\\cos x) = -\\sin x$$

**গুণফল নিয়ম:** $\\dfrac{d}{dx}(uv) = v\\dfrac{du}{dx}+u\\dfrac{dv}{dx}$

**ভাগফল নিয়ম:** $\\dfrac{d}{dx}\\left(\\dfrac{u}{v}\\right) = \\dfrac{v\\frac{du}{dx}-u\\frac{dv}{dx}}{v^2}$

**চেইন রুল:** $\\dfrac{d}{dx}[f(g(x))] = f'(g(x))\\cdot g'(x)$`,
  },

  "যোগজীকরণের সূত্রাবলি": {
    notesMarkdown: `# যোগজীকরণের সূত্রাবলি

## যোগজীকরণ কী
যোগজীকরণ (Integration) হলো **অন্তরীকরণের বিপরীত প্রক্রিয়া**। কোনো ফাংশনের সমাকলন (antiderivative) নির্ণয় করাই যোগজীকরণ।

## মৌলিক সূত্র
$$\\int x^n\\,dx = \\frac{x^{n+1}}{n+1} + C \\quad (n \\neq -1)$$
$$\\int \\frac{1}{x}\\,dx = \\ln|x| + C$$
$$\\int \\sin x\\,dx = -\\cos x + C$$
$$\\int \\cos x\\,dx = \\sin x + C$$
$$\\int \\sec^2x\\,dx = \\tan x + C$$

## যোগ-বিয়োগের নিয়ম
$$\\int [f(x) \\pm g(x)]\\,dx = \\int f(x)\\,dx \\pm \\int g(x)\\,dx$$

## অংশায়ন পদ্ধতি (Integration by Parts)
দুটি ভিন্ন ফাংশনের গুণফল যোগজীকরণ করতে:
$$\\int u \\cdot v\\,dx = u\\int v\\,dx - \\int\\left(\\frac{du}{dx}\\int v\\,dx\\right)dx$$

উদাহরণ: $\\int xe^x\\,dx = xe^x - e^x + C$

## প্রতিস্থাপন পদ্ধতি (Substitution Method)
সরাসরি যোগজীকরণ কঠিন হলে একটি নতুন চলক ধরে সরল করা হয়।

উদাহরণ: $\\int 2x\\cos(x^2)\\,dx$ এ $x^2 = u \\Rightarrow 2x\\,dx = du$ ধরে:
$$\\int \\cos u\\,du = \\sin u + C = \\sin(x^2) + C$$

## $\\sin^n x$ ও $\\cos^n x$ এর যোগজ (বিশেষ কৌশল)
- $n$ বিজোড় হলে: $\\int\\sin^n x\\,dx$ এর জন্য $\\cos x = z$ ধরতে হয়
- $n$ জোড় হলে: $\\sin^2x = \\frac{1}{2}(1-\\cos2x)$ সূত্র প্রয়োগ করতে হয়

## নির্দিষ্ট যোগজ (Definite Integral)
$$\\int_a^b f(x)\\,dx = F(b) - F(a)$$
নির্দিষ্ট যোগজ ব্যবহার করে বক্ররেখার নিচের ক্ষেত্রফল নির্ণয় করা হয়।`,
    formulaSheet: `## যোগজীকরণের সূত্রাবলি

$$\\int x^n\\,dx = \\frac{x^{n+1}}{n+1} + C \\ (n\\neq-1)$$
$$\\int \\sin x\\,dx = -\\cos x + C, \\quad \\int \\cos x\\,dx = \\sin x + C$$

**অংশায়ন:** $\\int uv\\,dx = u\\int v\\,dx - \\int\\left(\\frac{du}{dx}\\int v\\,dx\\right)dx$

**নির্দিষ্ট যোগজ:** $\\int_a^b f(x)\\,dx = F(b)-F(a)$

**$\\sin^n x$:** $n$ বিজোড়→$\\cos x=z$; $n$ জোড়→$\\sin^2x=\\frac12(1-\\cos2x)$`,
  },
};

async function main() {
  console.log("🌱 Higher Math 1st Paper Topic Notes+Formula Sheet Seeding শুরু হচ্ছে...\n");

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

    console.log(`✅ ${topicName} — নোট (${content.notesMarkdown.length} অক্ষর) ও সূত্রাবলি যোগ হলো`);
    totalUpdated += 1;
  }

  if (topicsNotFound.length > 0) {
    console.log(`\n⚠️  এই টপিকগুলো পাওয়া যায়নি: ${topicsNotFound.join(", ")}`);
  }

  console.log(`\n✅ মোট ${totalUpdated}টা টপিকে নোট+সূত্রাবলি সিড করা হলো!`);
}

main()
  .catch((e) => {
    console.error("❌ সমস্যা হয়েছে:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
