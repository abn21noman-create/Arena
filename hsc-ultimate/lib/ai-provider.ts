// ===================================================================
// Multi-Provider AI Fallback System
// -------------------------------------------------------------------
// আমাদের AI Study Assistant (Doubt Solver) এর জন্য একাধিক ফ্রি AI provider
// ব্যবহার করা হচ্ছে যাতে একটা fail করলে বা rate-limit এ পড়লে অটোমেটিক
// পরের provider দিয়ে কাজ চালানো যায়।
//
// অগ্রাধিকার ক্রম (আমাদের টেস্টের ভিত্তিতে ঠিক করা হয়েছে):
//   1) Groq        -> সবচেয়ে দ্রুত, ফ্রি, রিলায়েবল          (PRIMARY)
//   2) Mistral     -> ভালো বাংলা রেসপন্স + vision সাপোর্ট      (SECONDARY)
//   3) Cerebras    -> অতি দ্রুত, ব্যাকআপ                       (TERTIARY)
//   4) OpenRouter  -> ফ্রি মডেলে প্রায়ই rate-limit হয়          (LAST RESORT)
//
// সবগুলো provider OpenAI-compatible `/chat/completions` endpoint সাপোর্ট
// করে, তাই একই রকম request/response structure দিয়ে কাজ করা যায়।
// ===================================================================

export type ChatRole = "system" | "user" | "assistant";

// টেক্সট-ওনলি মেসেজ কন্টেন্ট
export type TextContent = string;

// Vision মেসেজের জন্য multi-modal content (OpenAI-compatible ফরম্যাট)
export type MultiModalContent = (
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } }
)[];

export interface ChatMessage {
  role: ChatRole;
  content: TextContent | MultiModalContent;
}

export interface AIProviderResult {
  content: string;
  provider: "groq" | "mistral" | "cerebras" | "openrouter";
  model: string;
}

export interface ProviderConfig {
  name: AIProviderResult["provider"];
  apiKeyEnv: string;
  baseUrl: string;
  model: string;
  supportsVision?: boolean;
}

// প্রতিটা provider এর কনফিগারেশন — .env.local এ key বসালেই কাজ করবে
// টেস্ট থেকে পড়া যায় বলে export করা হয়েছে — scripts/test-ai-providers.ts
// এই একই তালিকা ব্যবহার করে লাইভ হেলথ-চেক করে, ফলে কনফিগ বদলালে
// টেস্ট নিজে থেকেই নতুন মডেল যাচাই করে (হার্ডকোড drift হয় না)।
export const PROVIDERS: ProviderConfig[] = [
  {
    name: "groq",
    apiKeyEnv: "GROQ_API_KEY",
    baseUrl: "https://api.groq.com/openai/v1/chat/completions",
    model: "llama-3.3-70b-versatile",
  },
  {
    name: "mistral",
    apiKeyEnv: "MISTRAL_API_KEY",
    baseUrl: "https://api.mistral.ai/v1/chat/completions",
    model: "mistral-small-latest",
  },
  {
    name: "cerebras",
    apiKeyEnv: "CEREBRAS_API_KEY",
    baseUrl: "https://api.cerebras.ai/v1/chat/completions",
    model: "gpt-oss-120b",
  },
  {
    name: "openrouter",
    apiKeyEnv: "OPENROUTER_API_KEY",
    baseUrl: "https://openrouter.ai/api/v1/chat/completions",
    // 🐛 বাগ ফিক্স (লাইভ প্রোভাইডার হেলথ-চেকে ধরা পড়েছে): আগে এখানে
    // "openai/gpt-oss-120b:free" ছিল, কিন্তু OpenRouter সেই free tier
    // তুলে নিয়েছে — লাইভ কল করলে HTTP 404 আসে:
    //   "This model is unavailable for free. The paid version is
    //    available now - use this slug instead: openai/gpt-oss-120b"
    // ফলে fallback চেইনের শেষ ধাপটা কার্যত মৃত ছিল (আগের তিনটা
    // প্রোভাইডার একসাথে ডাউন হলে AI পুরো বন্ধ হয়ে যেত, অথচ আমরা
    // ভাবতাম চার-স্তরের সুরক্ষা আছে)। "openai/gpt-oss-20b:free" এখনো
    // সত্যিই ফ্রি ও সক্রিয় — বাংলা প্রশ্নে যাচাই করা হয়েছে।
    model: "openai/gpt-oss-20b:free",
  },
];

// ছবি সহ প্রশ্নের জন্য vision-capable মডেল ব্যবহার করা providers (অগ্রাধিকার ক্রমে)
export const VISION_PROVIDERS: ProviderConfig[] = [
  {
    name: "mistral",
    apiKeyEnv: "MISTRAL_API_KEY",
    baseUrl: "https://api.mistral.ai/v1/chat/completions",
    // 🐛 বাগ ফিক্স (লাইভ যাচাইয়ে ধরা): "pixtral-12b-2409" Mistral এর
    // /v1/models তালিকা থেকে সরে গেছে (deprecated)। এখন ওই নাম দিলে
    // Mistral নীরবে সম্পূর্ণ ভিন্ন একটা মডেলে (ministral-14b-latest)
    // রুট করে দেয় — অর্থাৎ আমরা যে মডেল চেয়েছি সেটা পাচ্ছিলাম না,
    // অথচ কোনো error ও আসছিল না (নীরব আচরণ-পরিবর্তন, ভবিষ্যতে হঠাৎ
    // 404 হয়ে ভাঙার ঝুঁকি)। "mistral-medium-latest" তালিকাভুক্ত ও
    // vision-capable — নীল ছবি দিয়ে লাইভ যাচাই: "The image is blue."
    model: "mistral-medium-latest",
    supportsVision: true,
  },
  {
    name: "openrouter",
    apiKeyEnv: "OPENROUTER_API_KEY",
    baseUrl: "https://openrouter.ai/api/v1/chat/completions",
    // 🐛 বাগ ফিক্স: "google/gemini-2.0-flash-exp:free" আর OpenRouter এ
    // নেই — লাইভ কলে HTTP 404 "No endpoints found"। ফলে ছবি-প্রশ্নের
    // fallback ধাপটা কার্যত ছিলই না। "google/gemma-4-26b-a4b-it:free"
    // ফ্রি, image input সমর্থন করে, এবং বাংলা আউটপুটও পরিচ্ছন্ন —
    // দুটোই লাইভ যাচাই করা হয়েছে।
    model: "google/gemma-4-26b-a4b-it:free",
    supportsVision: true,
  },
];

// HSC Science এর জন্য system prompt — AI কে বাংলায় শিক্ষক-সুলভ আচরণ করতে বলা হচ্ছে
// এটা DIRECT mode এর prompt (সরাসরি সম্পূর্ণ সমাধান দেয়) — HSC Ultimate এর
// ডিফল্ট আচরণ, দ্রুত উত্তর দরকার হলে ছাত্র এটাই বেছে নেবে।
export const HSC_TUTOR_SYSTEM_PROMPT = `তুমি "HSC Ultimate" প্ল্যাটফর্মের একজন বন্ধুত্বপূর্ণ AI শিক্ষক।
তুমি HSC (Higher Secondary Certificate) Science Group এর একজন শিক্ষার্থীকে সাহায্য করছো।
শিক্ষার্থীর বিষয়সমূহ: বাংলা, ইংরেজি, ICT, পদার্থবিজ্ঞান (Physics), রসায়ন (Chemistry),
জীববিজ্ঞান (Biology), উচ্চতর গণিত (Higher Mathematics)।

নিয়মাবলী:
- সবসময় সহজ, বন্ধুত্বপূর্ণ বাংলা ভাষায় উত্তর দেবে (ইংরেজি টার্ম দরকার হলে ব্র্যাকেটে দিতে পারো)
- ধাপে ধাপে ব্যাখ্যা করবে, শুধু উত্তর দিয়ে দেবে না
- অংক/সূত্র থাকলে পরিষ্কারভাবে দেখাবে
- NCTB HSC কারিকুলাম অনুযায়ী উত্তর দেওয়ার চেষ্টা করবে
- উৎসাহ দিয়ে কথা বলবে, শিক্ষার্থীকে motivate করবে`;

// ===================================================================
// Socratic AI Tutor Mode — Khan Academy এর "Khanmigo" থেকে অনুপ্রাণিত
// -------------------------------------------------------------------
// Deep Research এ চিহ্নিত মূল pedagogy পার্থক্য: বেশিরভাগ AI tutor (Photomath,
// সাধারণ ChatGPT ব্যবহার) সরাসরি উত্তর দিয়ে দেয় — এতে ছাত্র সমাধান দেখে কিন্তু
// নিজে চিন্তা করে না (answer-copying ঝুঁকি)। Khanmigo এর Socratic method এর
// বদলে গাইডিং প্রশ্ন করে ("তুমি এখন পর্যন্ত কী চেষ্টা করেছো?", "এই সূত্রটা কি
// চেনা মনে হচ্ছে?") — ছাত্র নিজে ধাপে ধাপে উত্তরে পৌঁছায়, deep learning হয়।
// ===================================================================
export const HSC_TUTOR_SOCRATIC_PROMPT = `তুমি "HSC Ultimate" প্ল্যাটফর্মের একজন Socratic AI শিক্ষক
(Khan Academy এর Khanmigo থেকে অনুপ্রাণিত পদ্ধতিতে শেখাও)। তুমি HSC Science Group এর
একজন শিক্ষার্থীকে সাহায্য করছো। শিক্ষার্থীর বিষয়সমূহ: বাংলা, ইংরেজি, ICT, পদার্থবিজ্ঞান,
রসায়ন, জীববিজ্ঞান, উচ্চতর গণিত।

🚫 **কঠোরভাবে নিষিদ্ধ (কখনোই করবে না)**:
- কোনো সমীকরণ সমাধান করে চূড়ান্ত মান/উত্তর বলে দেওয়া (যেমন "x = 2 বা x = 3")
- কোনো সূত্র প্রয়োগ করে সরাসরি গণনা করে ফলাফল দেখানো
- একাধিক ধাপ একসাথে করে ফেলা (যেমন factoring + সমাধান + answer একই মেসেজে)
- প্রথম উত্তরেই সমস্যাটা "সমাধান" করা শুরু করা

✅ **তোমার একমাত্র কাজ**: প্রতিটা মেসেজে **শুধু একটা প্রশ্ন বা ছোট ইঙ্গিত** দেওয়া, যাতে
শিক্ষার্থী নিজে পরের ধাপটা বের করে। তুমি কখনো নিজে গণনা/সমাধান করবে না — শিক্ষার্থীকেই
করতে বলবে এবং তার উত্তরের অপেক্ষা করবে।

**প্রথম মেসেজের জন্য বাধ্যতামূলক ফরম্যাট উদাহরণ** (এই প্যাটার্ন অনুসরণ করো):
> শিক্ষার্থী: "x² - 5x + 6 = 0 সমাধান করে দাও"
> তোমার সঠিক উত্তর: "চলো একসাথে বের করি! প্রথমে বলো তো, এটা কোন ধরনের সমীকরণ
> (রৈখিক নাকি দ্বিঘাত)? আর দ্বিঘাত সমীকরণ সমাধানের কোন কোন পদ্ধতি তোমার জানা আছে?"
> (❌ ভুল উত্তর: "x² - 5x + 6 = 0 কে (x-2)(x-3)=0 আকারে লেখা যায়, তাই x=2 বা x=3")

**কথোপকথন চালিয়ে যাওয়ার নিয়ম**:
- শিক্ষার্থী একটা ধাপ ঠিকভাবে করলে, পরের ধাপের দিকে গাইড করা একটা নতুন প্রশ্ন করো
  (নিজে সেই ধাপ করে দিও না)
- শিক্ষার্থী ভুল করলে সরাসরি "ভুল" না বলে ইঙ্গিত দাও (যেমন: "কাছাকাছি এসেছো, কিন্তু
  এই ধাপে আরেকবার দেখো — চিহ্নটা (sign) ঠিক আছে তো?")
- শিক্ষার্থী ৩-৪ বার চেষ্টার পরও আটকে থাকলে, একটা ছোট hint দাও (পুরো সমাধান না),
  তারপরও শেষ ধাপটা শিক্ষার্থীকেই করতে বলো ("এখন তুমি কী মান পাচ্ছো?")
- শিক্ষার্থী চূড়ান্ত উত্তর নিজে বললে, সেটা সঠিক কিনা confirm করো ও প্রশংসা করো
- শিক্ষার্থী স্পষ্টভাবে বললে ("শুধু উত্তরটা বলে দাও", "আমি বুঝতে চাই না") — তখনও
  সরাসরি চূড়ান্ত সংখ্যা/উত্তর না দিয়ে, একটা মূল ধাপ দেখিয়ে শেষ হিসাবটা শিক্ষার্থীকে
  নিজে করতে বলো
- সবসময় সহজ, বন্ধুত্বপূর্ণ বাংলায় কথা বলবে, ছোট (২-৪ বাক্যের) উত্তর দেবে, উৎসাহ দেবে
- ছবি/অংক আপলোড করলেও একই নিয়ম প্রযোজ্য — ছবি দেখে সরাসরি সমাধান না দিয়ে প্রথমে
  "এই সমস্যাটায় প্রথম ধাপ কী হওয়া উচিত মনে হয় তোমার?" জিজ্ঞেস করবে`;

async function callProvider(
  config: ProviderConfig,
  messages: ChatMessage[],
  maxTokens: number = 1024
): Promise<string> {
  const apiKey = process.env[config.apiKeyEnv];
  if (!apiKey) {
    throw new Error(`${config.name} এর জন্য API key পাওয়া যায়নি (.env.local দেখুন)`);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000); // ৩০ সেকেন্ড টাইমআউট (বড় রেসপন্সের জন্য বাড়ানো হয়েছে)

  try {
    const res = await fetch(config.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages,
        max_tokens: maxTokens,
        temperature: 0.4,
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`${config.name} error (${res.status}): ${errText}`);
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) throw new Error(`${config.name} থেকে খালি রেসপন্স এসেছে`);
    return content;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Fallback chain দিয়ে AI চ্যাট রেসপন্স জেনারেট করে (টেক্সট-ওনলি)।
 * প্রথমে Groq ট্রাই করবে, fail হলে Mistral, তারপর Cerebras, শেষে OpenRouter।
 * @param maxTokens ঐচ্ছিক — বড় রেসপন্স দরকার হলে (যেমন Study Plan JSON) বাড়িয়ে দেওয়া যায়
 */
export async function getAIResponse(
  messages: ChatMessage[],
  maxTokens?: number
): Promise<AIProviderResult> {
  return runProviderChain(PROVIDERS, messages, maxTokens);
}

/**
 * ছবি সহ প্রশ্নের জন্য vision-capable provider দিয়ে রেসপন্স জেনারেট করে
 * (গণিত/বিজ্ঞানের অংক ছবি তুলে সমাধান করার জন্য ব্যবহার হয়)।
 * প্রথমে Mistral Pixtral ট্রাই করবে, fail হলে OpenRouter Gemini Vision।
 */
export async function getVisionResponse(
  messages: ChatMessage[]
): Promise<AIProviderResult> {
  return runProviderChain(VISION_PROVIDERS, messages);
}

/**
 * Gets independent answers from distinct configured text providers. Unlike the
 * normal fallback chain, one provider's success never substitutes for consensus.
 */
export async function getIndependentAIResponses(
  messages: ChatMessage[],
  minimum = 2,
  maxTokens = 1_200
): Promise<AIProviderResult[]> {
  const configured = PROVIDERS.filter((provider) => Boolean(process.env[provider.apiKeyEnv]));
  const responses: AIProviderResult[] = [];
  for (let index = 0; index < configured.length && responses.length < minimum; index += 2) {
    const pair = configured.slice(index, index + 2);
    const settled = await Promise.allSettled(
      pair.map(async (provider) => ({
        content: await callProvider(provider, messages, maxTokens),
        provider: provider.name,
        model: provider.model,
      }))
    );
    for (const result of settled) {
      if (result.status === "fulfilled") responses.push(result.value);
    }
  }
  return responses.slice(0, minimum);
}

async function runProviderChain(
  providers: ProviderConfig[],
  messages: ChatMessage[],
  maxTokens?: number
): Promise<AIProviderResult> {
  const errors: string[] = [];

  for (const config of providers) {
    try {
      const content = await callProvider(config, messages, maxTokens);
      return { content, provider: config.name, model: config.model };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      errors.push(`[${config.name}] ${message}`);
      // পরের provider এ চেষ্টা করার জন্য continue
      continue;
    }
  }

  throw new Error(`সব AI provider ব্যর্থ হয়েছে:\n${errors.join("\n")}`);
}
