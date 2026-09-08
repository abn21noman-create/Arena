// ===================================================================
// Data URL Image Size Validation — শেয়ার্ড হেল্পার
// -------------------------------------------------------------------
// 🐛 বাগ ফিক্স (প্রোঅ্যাক্টিভ non-race-condition bug hunt এ আবিষ্কৃত):
// `app/api/custom-question-sets/route.ts` এ ইউজার-আপলোডেড ছবির
// (data URL) জন্য সাইজ ভ্যালিডেশন (৫ MB) ছিল, কিন্তু একই ধরনের ইনপুট
// নেওয়া আরও ৩টা endpoint এ (`ai-chat`, `flashcard-decks/ocr-extract`,
// `flashcard-decks/[deckId]/cards` IMAGE_OCCLUSION) কোনো ব্যাকএন্ড
// সাইজ ভ্যালিডেশন ছিল না — শুধু frontend এ ৫MB চেক ছিল যেটা সরাসরি
// API কল করে সহজেই bypass করা যায়। লাইভ টেস্টে ~১৫MB oversized/
// malformed data URL পাঠিয়ে `ai-chat` ও `ocr-extract` উভয়েই ৫০০
// crash দিয়েছে (AI provider ছবিটা invalid/oversized হিসেবে reject
// করে দিয়েছে, এবং সেই error unhandled থেকে generic ৫০০ হয়ে গেছে,
// ৪০০ Bad Request হওয়া উচিত ছিল)। ফিক্স: `custom-question-sets` এর
// established limit (৫ MB, base64 overhead হিসাব করে ১.৪× মার্জিন)
// একটা শেয়ার্ড ফাংশনে তুলে সব ৪টা endpoint এই ব্যবহার করা হচ্ছে।
// ===================================================================

// ছবির আসল (raw binary) সাইজ সর্বোচ্চ এতটুকু হতে পারবে
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // ৫ MB

// base64 এনকোডিং এ প্রায় ৩৩% বেশি সাইজ লাগে, তাই data URL এর length
// এর জন্য একটু বাড়িয়ে (১.৪×) থ্রেশহোল্ড রাখা হয়েছে
const MAX_DATA_URL_LENGTH = MAX_IMAGE_SIZE_BYTES * 1.4;

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * একটা data URL (বা যেকোনো imageUrl স্ট্রিং) সাইজে সীমার মধ্যে আছে
 * কিনা যাচাই করে। এটা সাইজ-ই শুধু চেক করে (MIME type/actual decode
 * করে না — সেটা AI provider নিজেই করবে, valid না হলে সেটা normal
 * ৪০০/502 flow এ ধরা পড়বে, এখানে শুধু obviously-oversized payload
 * আগেভাগেই ব্লক করে ব্যয়বহুল AI কল এড়ানো হচ্ছে)।
 */
export function validateImageDataUrlSize(imageUrl: string): ImageValidationResult {
  if (imageUrl.length > MAX_DATA_URL_LENGTH) {
    return {
      valid: false,
      error: `ছবির সাইজ ${MAX_IMAGE_SIZE_BYTES / (1024 * 1024)} MB এর বেশি হতে পারবে না`,
    };
  }
  return { valid: true };
}
