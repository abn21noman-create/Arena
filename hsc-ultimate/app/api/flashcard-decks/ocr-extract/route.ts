// ===================================================================
// OCR Text Extraction — হাতের লেখা নোট/বইয়ের পাতার ছবি থেকে টেক্সট বের করা
// POST /api/flashcard-decks/ocr-extract
// Body: { imageUrl: string (data URL) }
// -------------------------------------------------------------------
// Deep Research এ চিহ্নিত RemNote/Quizlet Magic Notes এর "handwriting →
// flashcard" প্যাটার্ন অনুসরণ করে — কিন্তু দুই ধাপে ভাগ করা হয়েছে:
// ধাপ ১ (এই endpoint): ছবি → টেক্সট (OCR), ইউজার রিভিউ/এডিট করতে পারবে
// ধাপ ২ (generate-ai endpoint, আগে থেকেই আছে): টেক্সট → ফ্ল্যাশকার্ড
// দুই ধাপে ভাগ করার কারণ: OCR মাঝে মাঝে ভুল পড়তে পারে (বিশেষত হাতের লেখা),
// তাই ইউজারকে টেক্সট রিভিউ করার সুযোগ দেওয়া ভালো UX (ভুল ফ্ল্যাশকার্ড
// তৈরি হওয়ার আগেই ভুল ধরা পড়বে)।
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getVisionResponse, type ChatMessage } from "@/lib/ai-provider";
import { validateImageDataUrlSize } from "@/lib/image-validation";

const OCR_SYSTEM_PROMPT = `তুমি একজন OCR (Optical Character Recognition) বিশেষজ্ঞ।
ছবিতে থাকা সব লেখা (হাতের লেখা বা ছাপার অক্ষর, বাংলা বা ইংরেজি) হুবহু বের করে দাও।

নিয়মাবলী:
- শুধু ছবিতে যা লেখা আছে তা-ই লিখবে, নিজের থেকে কিছু যোগ করবে না বা ব্যাখ্যা করবে না
- বানান/ব্যাকরণ ভুল থাকলেও যেভাবে লেখা আছে সেভাবেই তুলবে (অনুমান করে ঠিক করবে না)
- অনুচ্ছেদ/লাইন ব্রেক যথাসম্ভব বজায় রাখবে
- গাণিতিক সূত্র/সমীকরণ থাকলে টেক্সট আকারে স্পষ্টভাবে লিখবে (যেমন: F = ma)
- ছবিতে কোনো লেখা বুঝতে না পারলে বা অস্পষ্ট হলে [অস্পষ্ট] লিখে চিহ্নিত করবে
- কোনো ভূমিকা/উপসংহার লিখবে না ("এখানে টেক্সট আছে" জাতীয় কিছু বলবে না) — শুধু raw extracted text দেবে`;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { imageUrl } = body as { imageUrl?: string };

  if (!imageUrl) {
    return NextResponse.json({ error: "ছবি পাওয়া যায়নি" }, { status: 400 });
  }

  // 🐛 বাগ ফিক্স (প্রোঅ্যাক্টিভ non-race-condition bug hunt এ
  // আবিষ্কৃত): আগে imageUrl এর কোনো ব্যাকএন্ড সাইজ ভ্যালিডেশন ছিল
  // না। লাইভ টেস্টে ~১৫MB oversized data URL পাঠিয়ে AI provider
  // reject করেছে এবং সেই error unhandled থেকে ৫০০ crash হয়েছে
  // (৪০০ হওয়া উচিত ছিল)। ফিক্স: custom-question-sets এর established
  // সাইজ লিমিট এখানেও প্রয়োগ করা হয়েছে।
  const sizeCheck = validateImageDataUrlSize(imageUrl);
  if (!sizeCheck.valid) {
    return NextResponse.json({ error: sizeCheck.error }, { status: 400 });
  }

  try {
    const visionMessages: ChatMessage[] = [
      { role: "system", content: OCR_SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          { type: "text", text: "এই ছবি থেকে সব লেখা বের করে দাও।" },
          { type: "image_url", image_url: { url: imageUrl } },
        ],
      },
    ];

    const result = await getVisionResponse(visionMessages);
    const extractedText = result.content.trim();

    if (!extractedText || extractedText.length < 5) {
      return NextResponse.json(
        { error: "ছবি থেকে কোনো টেক্সট বের করা যায়নি, স্পষ্ট ছবি দিয়ে আবার চেষ্টা করো" },
        { status: 502 }
      );
    }

    return NextResponse.json({ extractedText, provider: result.provider });
  } catch (err) {
    console.error("OCR Extraction Error:", err);
    return NextResponse.json(
      { error: "ছবি থেকে টেক্সট বের করতে সমস্যা হয়েছে, আবার চেষ্টা করো" },
      { status: 500 }
    );
  }
}
