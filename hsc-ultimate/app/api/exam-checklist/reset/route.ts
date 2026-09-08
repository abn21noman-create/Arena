// ===================================================================
// Exam Checklist Reset API — সব আইটেম আনচেক করে পরের পরীক্ষার দিনের
// জন্য প্রস্তুত করা (HSC পরীক্ষা একাধিক দিন ধরে চলে, প্রতিটা বিষয়ের
// জন্য আলাদা দিন — একই checklist বার বার পুনরায় ব্যবহার করা যায়)
// POST /api/exam-checklist/reset
// ===================================================================
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  await prisma.examChecklistItem.updateMany({
    where: { userId: session.user.id, isChecked: true },
    data: { isChecked: false },
  });

  return NextResponse.json({ success: true });
}
