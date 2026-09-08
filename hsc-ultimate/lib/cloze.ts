// ===================================================================
// Cloze Deletion Flashcard — Helper Functions
// -------------------------------------------------------------------
// Anki এর "cloze deletion" ফিচার থেকে অনুপ্রাণিত (Anki তে "{{c1::উত্তর}}"
// সিনট্যাক্স ব্যবহার হয়)। HSC Ultimate এ সহজ রাখার জন্য শুধু "{{উত্তর}}"
// সিনট্যাক্স ব্যবহার করা হয়েছে — নাম্বারিং (c1/c2) ছাড়া, কারণ আমাদের
// এখানে একটা কার্ডের সব ফাঁকা একসাথে reveal হয় (Anki এর মতো প্রতিটা
// নাম্বারের জন্য আলাদা কার্ড তৈরি হয় না, সরলীকরণ)।
//
// উদাহরণ: "সালোকসংশ্লেষণের মূল উপাদান হলো {{CO2}}, {{পানি}} ও {{সূর্যালোক}}"
// → মাস্কড ভার্সন: "সালোকসংশ্লেষণের মূল উপাদান হলো [...], [...] ও [...]"
// → রিভিউ এর সময় ইউজার প্রথমে মাস্কড টেক্সট দেখে, ক্লিক করলে আসল উত্তর
//   সহ পুরো টেক্সট দেখায় (Anki এর "reveal" ব্যবহারের মতোই)।
// ===================================================================

// {{...}} প্যাটার্ন ম্যাচ করার regex — non-greedy, multiline সাপোর্ট করে
const CLOZE_PATTERN = /\{\{(.+?)\}\}/g;

export interface ClozeParseResult {
  isValid: boolean;
  blankCount: number;
  maskedText: string; // "[...]" দিয়ে প্রতিস্থাপিত টেক্সট (প্রশ্ন হিসেবে দেখানো হয়)
  answers: string[]; // ফাঁকা স্থানের আসল উত্তরগুলো (ক্রম অনুযায়ী)
  fullText: string; // মূল টেক্সট (bracket ছাড়া, উত্তরসহ — রিভিল করার সময় দেখানো হয়)
}

/**
 * "{{উত্তর}}" সিনট্যাক্স যুক্ত টেক্সট পার্স করে মাস্কড ভার্সন, উত্তরের
 * লিস্ট এবং পূর্ণ টেক্সট (bracket ছাড়া) বের করে।
 *
 * @param text - "{{...}}" ব্লকসহ কাঁচা টেক্সট
 */
export function parseClozeText(text: string): ClozeParseResult {
  const answers: string[] = [];

  const maskedText = text.replace(CLOZE_PATTERN, (_match, inner: string) => {
    answers.push(inner.trim());
    return "[...]";
  });

  const fullText = text.replace(CLOZE_PATTERN, (_match, inner: string) => inner.trim());

  return {
    isValid: answers.length > 0 && answers.every((a) => a.length > 0),
    blankCount: answers.length,
    maskedText,
    answers,
    fullText,
  };
}

/** টেক্সটে অন্তত একটা valid "{{...}}" ব্লক আছে কিনা যাচাই করে (ফাঁকা ভেতরে না থাকলে false) */
export function isValidClozeText(text: string): boolean {
  if (!text.includes("{{") || !text.includes("}}")) return false;
  return parseClozeText(text).isValid;
}

/** সর্বোচ্চ কতগুলো ফাঁকা একটা কার্ডে রাখা যাবে (UX + প্রশ্ন পরিষ্কার রাখার জন্য) */
export const MAX_CLOZE_BLANKS = 8;
