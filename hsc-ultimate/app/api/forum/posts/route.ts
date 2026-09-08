// ===================================================================
// Forum Posts List + Create API
// GET  /api/forum/posts?category=&subjectCode=  -> লিস্ট (ফিল্টার সহ)
// POST /api/forum/posts                          -> নতুন পোস্ট তৈরি
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateStreak } from "@/lib/streak";
import { awardXp } from "@/lib/league";
import { moderateText, getModerationBlockMessage } from "@/lib/content-moderation";
import { isValidEnumValue, VALID_POST_CATEGORIES, VALID_SUBJECT_CODES } from "@/lib/enum-validation";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const subjectCode = searchParams.get("subjectCode");
  const requestedPage = Number(searchParams.get("page") ?? "1");
  const page = Number.isSafeInteger(requestedPage) ? Math.max(1, requestedPage) : 1;
  const pageSize = 20;

  // 🐛 বাগ ফিক্স (প্রোঅ্যাক্টিভ non-race-condition bug hunt এ আবিষ্কৃত,
  // POST endpoint এর একই enum-validation-missing ক্লাস, কিন্তু এবার
  // GET query parameter এ — যা আরও সহজে exploit করা যায় কারণ শুধু
  // URL এ query param বসিয়ে দিলেই হয়): আগে `category as never`/
  // `subjectCode as never` দিয়ে TypeScript বাইপাস করে সরাসরি Prisma
  // `where` ক্লজে পাস করা হতো, কোনো ভ্যালিডেশন ছাড়া। অজানা enum
  // ভ্যালু (যেমন `?category=INVALID_CATEGORY_XYZ`) দিলে Prisma
  // `PrismaClientValidationError` throw করে ৫০০ crash করতো। লাইভ
  // টেস্টে category ও subjectCode উভয় query param এই প্রমাণিত।
  // ফিক্স: `isValidEnumValue()` দিয়ে ভ্যালিডেট করে অবৈধ হলে সেই
  // ফিল্টার (silently) উপেক্ষা করা হচ্ছে — GET/list endpoint এ ৪০০
  // এর বদলে "কোনো ফলাফল না দেখানো" এর চেয়ে "ফিল্টার ছাড়াই সব
  // দেখানো" বেশি ইউজার-বান্ধব (malformed ফিল্টার একটা fail-open
  // read-only endpoint এ ব্লকিং এরর হওয়ার দরকার নেই)।
  const validCategory = isValidEnumValue(category, VALID_POST_CATEGORIES) ? category : null;
  const validSubjectCode = isValidEnumValue(subjectCode, VALID_SUBJECT_CODES) ? subjectCode : null;

  const where = {
    ...(validCategory && { category: validCategory }),
    ...(validSubjectCode && { subjectCode: validSubjectCode }),
  };
  const [totalItems, posts] = await prisma.$transaction([
    prisma.forumPost.count({ where }),
    prisma.forumPost.findMany({
      where,
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        user: { select: { id: true, name: true, image: true } },
        _count: { select: { replies: true } },
      },
    }),
  ]);
  const voteGroups = posts.length > 0
    ? await prisma.forumVote.groupBy({
        by: ["postId"],
        where: { postId: { in: posts.map((post) => post.id) } },
        _sum: { value: true },
      })
    : [];
  const voteScores = new Map(voteGroups.map((group) => [group.postId, group._sum.value ?? 0]));

  const result = posts.map((p) => ({
    id: p.id,
    title: p.title,
    content: p.content,
    category: p.category,
    subjectCode: p.subjectCode,
    isPinned: p.isPinned,
    isResolved: p.isResolved,
    viewCount: p.viewCount,
    createdAt: p.createdAt,
    author: p.user,
    replyCount: p._count.replies,
    voteScore: voteScores.get(p.id) ?? 0,
  }));

  return NextResponse.json({
    posts: result,
    pagination: {
      page,
      pageSize,
      totalItems,
      totalPages: Math.max(1, Math.ceil(totalItems / pageSize)),
    },
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { title, content, category, subjectCode } = body;

  if (!title?.trim() || !content?.trim()) {
    return NextResponse.json({ error: "শিরোনাম ও বিস্তারিত লিখতে হবে" }, { status: 400 });
  }

  // 🐛 বাগ ফিক্স (প্রোঅ্যাক্টিভ non-race-condition bug hunt এ আবিষ্কৃত):
  // আগে কোনো ব্যাকএন্ড length limit ছিল না — শুধু AI moderation এর
  // উপর নির্ভর করা হতো (যেটা fail-open, এবং শুধু "শিরোনাম+content"
  // একসাথে ৩০০০ অক্ষরে truncate করে পাঠায়, নিজেই একটা reliable length
  // guard না)। লাইভ টেস্টে র‍্যান্ডম-শব্দ দিয়ে বানানো ~৩১৭ KB টেক্সট
  // পাঠিয়ে AI moderation দৈবক্রমে "spam" হিসেবে ধরে ফেলেছিল, কিন্তু
  // এটা নির্ভরযোগ্য length limit না (AI ব্যর্থ হলে বা fail-open হলে
  // bypass হতে পারে)। ফিক্স: explicit length limit যোগ (defense-in-
  // depth, AI moderation এর উপর নির্ভরতা কমানো)।
  if (title.trim().length > 200) {
    return NextResponse.json({ error: "শিরোনাম খুব বড় (সর্বোচ্চ ২০০ অক্ষর)" }, { status: 400 });
  }
  if (content.trim().length > 10000) {
    return NextResponse.json({ error: "বিস্তারিত খুব বড় (সর্বোচ্চ ১০,০০০ অক্ষর)" }, { status: 400 });
  }
  // 🐛 বাগ ফিক্স (প্রোঅ্যাক্টিভ non-race-condition bug hunt এ আবিষ্কৃত,
  // lib/enum-validation.ts এ বিস্তারিত): অজানা category/subjectCode
  // দিলে Prisma create() এ `PrismaClientValidationError` throw করে
  // ৫০০ crash করতো। লাইভ টেস্টে প্রমাণিত।
  if (!isValidEnumValue(category, VALID_POST_CATEGORIES)) {
    return NextResponse.json({ error: "সঠিক category দিন" }, { status: 400 });
  }
  if (!isValidEnumValue(subjectCode, VALID_SUBJECT_CODES)) {
    return NextResponse.json({ error: "সঠিক subjectCode দিন" }, { status: 400 });
  }

  // AI Content Moderation — পোস্ট তৈরির আগেই স্প্যাম/আপত্তিকর/হয়রানিমূলক
  // কন্টেন্ট স্ক্যান করা হয় (title+content একসাথে), fail-open (AI ব্যর্থ
  // হলে block করা হয় না)
  const moderation = await moderateText(`${title.trim()}\n\n${content.trim()}`);
  if (moderation.shouldBlock) {
    return NextResponse.json({ error: getModerationBlockMessage(moderation) }, { status: 422 });
  }

  const post = await prisma.forumPost.create({
    data: {
      userId: session.user.id,
      title: title.trim(),
      content: content.trim(),
      category: category || "QUESTION",
      subjectCode: subjectCode || null,
    },
  });

  // পোস্ট করাটাও একটা একটিভিটি, streak আপডেট হবে
  await updateStreak(session.user.id);

  // ছোট XP reward (কমিউনিটিতে অংশগ্রহণ উৎসাহিত করতে)
  await awardXp(session.user.id, 3);

  return NextResponse.json({ post }, { status: 201 });
}
