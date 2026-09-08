// ===================================================================
// Global Search API — Subject/Topic/Flashcard Deck/Forum Post একসাথে খোঁজা
// GET /api/search?q=নিউটন
// -------------------------------------------------------------------
// প্রতিটা ক্যাটাগরি থেকে সর্বোচ্চ ৫টা রেজাল্ট রিটার্ন করে, খুব ছোট query
// (১ অক্ষরের কম) হলে খালি রেজাল্ট দেয় (অপ্রয়োজনীয় DB load এড়াতে)।
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const RESULT_LIMIT = 5;

export interface SearchResultItem {
  id: string;
  type: "subject" | "topic" | "flashcard-deck" | "forum-post";
  title: string;
  subtitle?: string;
  href: string;
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const query = req.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const [subjects, topics, decks, posts] = await Promise.all([
    // Subject — নাম দিয়ে খোঁজা (বাংলা ও ইংরেজি নাম দুটোই)
    prisma.subject.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { nameEn: { contains: query, mode: "insensitive" } },
        ],
      },
      take: RESULT_LIMIT,
    }),

    // Topic — নাম দিয়ে খোঁজা, chapter/subject সহ (breadcrumb দেখানোর জন্য)
    prisma.topic.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { nameEn: { contains: query, mode: "insensitive" } },
        ],
      },
      include: { chapter: { include: { subject: true } } },
      take: RESULT_LIMIT,
    }),

    // নিজের Flashcard Deck — নাম দিয়ে খোঁজা (শুধু নিজের ডেক)
    prisma.flashcardDeck.findMany({
      where: {
        userId: session.user.id,
        name: { contains: query, mode: "insensitive" },
      },
      take: RESULT_LIMIT,
    }),

    // Forum Post — শিরোনাম দিয়ে খোঁজা (সবার পোস্ট)
    prisma.forumPost.findMany({
      where: { title: { contains: query, mode: "insensitive" } },
      take: RESULT_LIMIT,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const results: SearchResultItem[] = [
    ...subjects.map((s) => ({
      id: s.id,
      type: "subject" as const,
      title: s.name,
      subtitle: "সাবজেক্ট",
      href: `/learn/${s.id}`,
    })),
    ...topics.map((t) => ({
      id: t.id,
      type: "topic" as const,
      title: t.name,
      subtitle: `${t.chapter.subject.name} • ${t.chapter.name}`,
      href: `/learn/${t.chapter.subjectId}/${t.id}`,
    })),
    ...decks.map((d) => ({
      id: d.id,
      type: "flashcard-deck" as const,
      title: d.name,
      subtitle: "ফ্ল্যাশকার্ড ডেক",
      href: `/flashcards/${d.id}`,
    })),
    ...posts.map((p) => ({
      id: p.id,
      type: "forum-post" as const,
      title: p.title,
      subtitle: "Community পোস্ট",
      href: `/forum/${p.id}`,
    })),
  ];

  return NextResponse.json({ results });
}
