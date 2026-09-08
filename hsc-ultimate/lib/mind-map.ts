// ===================================================================
// Mind Map Generation — টেক্সট (Topic নোট অথবা PDF এর chunk) থেকে AI দিয়ে
// একটা hierarchical concept tree (JSON) বানানো।
// -------------------------------------------------------------------
// NotebookLM এর ২০২৬ "Mind Map" ফিচার থেকে অনুপ্রাণিত — মূল বিষয় থেকে
// উপ-বিষয়ে ভেঙে ভেঙে visual tree দেখানো, যাতে ছাত্র একনজরে বুঝতে পারে
// একটা টপিকের ভেতরে কী কী concept আছে এবং সেগুলো কীভাবে একে অপরের সাথে
// সম্পর্কিত। রেন্ডারিং করা হয় সাধারণ React কম্পোনেন্ট দিয়ে (collapsible
// nested tree) — কোনো ভারী graph-visualization লাইব্রেরি (D3/React Flow)
// ছাড়াই, যাতে bundle size/complexity কম থাকে।
// ===================================================================
import { getAIResponse, type ChatMessage } from "@/lib/ai-provider";

export interface MindMapNode {
  label: string;
  children?: MindMapNode[];
}

const MIND_MAP_SYSTEM_PROMPT = `তুমি "HSC Ultimate" প্ল্যাটফর্মের একজন AI সহকারী। নিচে দেওয়া টেক্সট থেকে
একটা hierarchical mind map (concept tree) তৈরি করো — মূল বিষয় থেকে শুরু করে
ধাপে ধাপে উপ-বিষয়/সাব-টপিকে ভেঙে দেখাও।

নিয়মাবলী:
- সর্বোচ্চ ৩ স্তরের গভীরতা রাখবে (root → main branches → sub-branches),
  বেশি গভীর করবে না (visual clutter এড়াতে)
- প্রতিটা branch এ সর্বোচ্চ ৬টা child রাখবে
- প্রতিটা label ছোট ও স্পষ্ট রাখবে (৩-৮ শব্দ, পুরো বাক্য না)
- বাংলায় লিখবে (প্রয়োজনে ইংরেজি টার্ম/সূত্র রাখতে পারো)
- শুধু দেওয়া টেক্সটের ভিত্তিতেই বানাবে, বাইরের তথ্য যোগ করবে না

তুমি অবশ্যই শুধুমাত্র একটা valid JSON object রিটার্ন করবে, অন্য কোনো টেক্সট লিখবে না।
ফরম্যাট:
{
  "label": "মূল বিষয়ের নাম",
  "children": [
    {
      "label": "উপ-বিষয় ১",
      "children": [
        { "label": "সাব-টপিক ১.১" },
        { "label": "সাব-টপিক ১.২" }
      ]
    },
    {
      "label": "উপ-বিষয় ২",
      "children": [{ "label": "সাব-টপিক ২.১" }]
    }
  ]
}`;

/** AI এর output কে recursively sanitize করে — অপ্রত্যাশিত টাইপ/অতিরিক্ত গভীরতা আটকাতে */
function sanitizeNode(node: unknown, depth: number): MindMapNode | null {
  if (depth > 3) return null; // সর্বোচ্চ ৩ স্তর (root সহ) — runaway recursion আটকাতে
  if (typeof node !== "object" || node === null) return null;

  const obj = node as Record<string, unknown>;
  const label = typeof obj.label === "string" ? obj.label.trim().slice(0, 100) : null;
  if (!label) return null;

  const result: MindMapNode = { label };

  if (Array.isArray(obj.children)) {
    const children = obj.children
      .slice(0, 6) // সর্বোচ্চ ৬টা child
      .map((c) => sanitizeNode(c, depth + 1))
      .filter((c): c is MindMapNode => c !== null);
    if (children.length > 0) result.children = children;
  }

  return result;
}

/**
 * দেওয়া টেক্সট থেকে AI দিয়ে একটা mind map (JSON tree) জেনারেট করে।
 * কল করা caller (Topic notes বা PDF summary route) DB তে cache করে রাখবে।
 */
export async function generateMindMap(sourceText: string): Promise<{
  mindMap: MindMapNode;
  provider: string;
}> {
  const trimmedText = sourceText.slice(0, 6000); // টোকেন-সীমার মধ্যে রাখতে

  const messages: ChatMessage[] = [
    { role: "system", content: MIND_MAP_SYSTEM_PROMPT },
    { role: "user", content: `টেক্সট:\n\n${trimmedText}\n\nএখন এই টেক্সটের একটা mind map (JSON) বানাও।` },
  ];

  const result = await getAIResponse(messages, 1536);

  // AI output থেকে JSON অংশ বের করা (মাঝে মাঝে extra text/markdown fence আসতে পারে)
  const jsonMatch = result.content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("AI থেকে সঠিক JSON ফরম্যাটে mind map পাওয়া যায়নি");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch {
    throw new Error("AI এর mind map JSON পার্স করা যায়নি");
  }

  const sanitized = sanitizeNode(parsed, 0);
  if (!sanitized) {
    throw new Error("AI এর mind map ফরম্যাট বৈধ না");
  }

  return { mindMap: sanitized, provider: result.provider };
}
