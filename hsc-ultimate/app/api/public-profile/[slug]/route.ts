// ===================================================================
// Public Profile ডেটা fetch API (কোনো authentication লাগে না — সম্পূর্ণ
// পাবলিক এন্ডপয়েন্ট, শেয়ারযোগ্য লিংক থেকে যে কেউ দেখতে পারবে)
// GET /api/public-profile/[slug]
// -------------------------------------------------------------------
// publicProfileEnabled=false থাকলে বা slug না মিললে 404 রিটার্ন করে
// (কখনো "আছে কিন্তু বন্ধ" বলে দেয় না — privacy leak এড়াতে একই 404
// ব্যবহার করা হয় দুই ক্ষেত্রেই)।
// ===================================================================
import { NextResponse } from "next/server";
import { getPublicProfileBySlug } from "@/lib/public-profile";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const profile = await getPublicProfileBySlug(slug);

  if (!profile) {
    return NextResponse.json({ error: "প্রোফাইল পাওয়া যায়নি" }, { status: 404 });
  }

  return NextResponse.json({ profile });
}
