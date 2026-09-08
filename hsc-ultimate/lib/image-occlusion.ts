// ===================================================================
// Image Occlusion Flashcard — Helper Functions
// -------------------------------------------------------------------
// Anki এর "Image Occlusion" ফিচার থেকে অনুপ্রাণিত — ডায়াগ্রাম/মানচিত্র/
// গ্রাফের নির্দিষ্ট অংশ (লেবেল, অংশের নাম) একটা বক্স দিয়ে ঢেকে দেওয়া হয়,
// রিভিউ এর সময় প্রথমে ঢাকা অবস্থায় দেখায়, ক্লিক করলে বক্স সরে গিয়ে
// আসল লেখা/অংশ দেখা যায়।
//
// সরলীকরণ (Cloze এর মতোই প্যাটার্ন): Anki তে প্রতিটা occlusion box এর
// জন্য আলাদা রিভিউ কার্ড তৈরি হয় (box ১ ঢাকা+বাকিগুলো খোলা, তারপর box ২
// ঢাকা+বাকিগুলো খোলা...)। HSC Ultimate এ এটা সরল রাখা হয়েছে — একটা
// কার্ডের সব বক্স একসাথে ঢাকা থাকে, ক্লিক করলে সব একসাথে reveal হয়
// (একটা কার্ড = একটা রিভিউ ইউনিট, বিদ্যমান FSRS/SM-2 review flow
// অপরিবর্তিত রাখতে)।
//
// Coordinate system: শতাংশ-ভিত্তিক (0-100, ছবির width/height এর সাপেক্ষে)
// — এভাবে ছবি যেকোনো স্ক্রিন সাইজে render হলেও বক্সের অবস্থান সঠিক থাকে।
// ===================================================================

export interface OcclusionBox {
  x: number; // বাম থেকে দূরত্ব, শতাংশ (0-100)
  y: number; // উপর থেকে দূরত্ব, শতাংশ (0-100)
  width: number; // বক্সের প্রস্থ, শতাংশ (0-100)
  height: number; // বক্সের উচ্চতা, শতাংশ (0-100)
  label?: string; // ঐচ্ছিক — বক্সের ভেতরে কী আছে তার নাম (শুধু ইউজারের নিজের রেফারেন্সের জন্য, রিভিউ এর সময় দেখানো হয় না)
}

export const MAX_OCCLUSION_BOXES = 15; // একটা কার্ডে সর্বোচ্চ কতগুলো বক্স রাখা যাবে (UX পরিষ্কার রাখতে)
export const MIN_BOX_SIZE_PERCENT = 1; // এর চেয়ে ছোট বক্স অর্থহীন (ভুলবশত ক্লিক থেকে বাঁচাতে)

export interface OcclusionValidationResult {
  valid: boolean;
  error?: string;
}

/** Occlusion box লিস্ট ভ্যালিড কিনা যাচাই করে (কো-অর্ডিনেট রেঞ্জ, সংখ্যা, সাইজ) */
export function validateOcclusionBoxes(boxes: unknown): OcclusionValidationResult {
  if (!Array.isArray(boxes) || boxes.length === 0) {
    return { valid: false, error: "অন্তত একটা বক্স আঁকতে হবে" };
  }

  if (boxes.length > MAX_OCCLUSION_BOXES) {
    return {
      valid: false,
      error: `একটা কার্ডে সর্বোচ্চ ${MAX_OCCLUSION_BOXES}টা বক্স রাখা যাবে`,
    };
  }

  for (const box of boxes) {
    if (
      typeof box !== "object" ||
      box === null ||
      typeof (box as OcclusionBox).x !== "number" ||
      typeof (box as OcclusionBox).y !== "number" ||
      typeof (box as OcclusionBox).width !== "number" ||
      typeof (box as OcclusionBox).height !== "number"
    ) {
      return { valid: false, error: "বক্সের ডেটা সঠিক ফরম্যাটে নেই" };
    }

    const b = box as OcclusionBox;
    if (b.x < 0 || b.x > 100 || b.y < 0 || b.y > 100) {
      return { valid: false, error: "বক্সের অবস্থান ছবির বাইরে চলে গেছে" };
    }
    if (b.width < MIN_BOX_SIZE_PERCENT || b.height < MIN_BOX_SIZE_PERCENT) {
      return { valid: false, error: "বক্স খুব ছোট, আরেকটু বড় করে আঁকো" };
    }
    if (b.x + b.width > 100.5 || b.y + b.height > 100.5) {
      // 0.5% tolerance for floating point rounding
      return { valid: false, error: "বক্স ছবির সীমার বাইরে চলে গেছে" };
    }
  }

  return { valid: true };
}
