// ===================================================================
// Admin Panel Power-up — User Management এর Core Logic
// -------------------------------------------------------------------
// আগে `/api/admin/users` সব ইউজার একবারে ফেরত দিত (search/filter/sort
// কিছুই ছিল না)। ইউজার সংখ্যা বাড়ার সাথে সাথে এটা স্কেল করবে না — এই
// ফাইলে সেই ক্ষমতা যোগ করা হয়েছে।
// ===================================================================
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export type UserSortField = "createdAt" | "xp" | "name" | "lastActiveAt";
export type UserSortOrder = "asc" | "desc";
export type UserRoleFilter = "ALL" | "STUDENT" | "ADMIN";
export type UserStatusFilter = "ALL" | "ACTIVE" | "BANNED";

export interface AdminUserListParams {
  search?: string;
  role?: UserRoleFilter;
  status?: UserStatusFilter;
  sortBy?: UserSortField;
  sortOrder?: UserSortOrder;
  page?: number;
  pageSize?: number;
}

const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;

/**
 * Admin User Management এর জন্য search/filter/sort/pagination সহ
 * ইউজার লিস্ট বের করে। কোনো নতুন migration লাগেনি — বিদ্যমান User
 * কলামের উপর query।
 */
export async function getAdminUserList(params: AdminUserListParams) {
  const search = params.search?.trim();
  const role = params.role ?? "ALL";
  const status = params.status ?? "ALL";
  const sortBy = params.sortBy ?? "createdAt";
  const sortOrder = params.sortOrder ?? "desc";
  // 🐛 defense-in-depth: এই ফাংশন route.ts (untrusted query param) ও
  // page.tsx (trusted hardcoded value) — দুই জায়গা থেকে কল হয়। route.ts
  // এ আগেই sanitize করা হয়, কিন্তু ভবিষ্যতে নতুন caller যোগ হলে যাতে
  // অবৈধ page/pageSize (Infinity, 1e300) Prisma `skip`-এ গিয়ে ক্র্যাশ
  // না করে, তাই এখানেও safe-integer চেক রাখা হলো।
  const rawPage = params.page ?? 1;
  const safePage = Number.isSafeInteger(rawPage) ? rawPage : 1;
  const page = Math.max(1, safePage);

  const rawPageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
  const safePageSize = Number.isSafeInteger(rawPageSize) ? rawPageSize : DEFAULT_PAGE_SIZE;
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, safePageSize));

  const where: Prisma.UserWhereInput = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  if (role !== "ALL") {
    where.role = role;
  }

  if (status === "ACTIVE") {
    where.isBanned = false;
  } else if (status === "BANNED") {
    where.isBanned = true;
  }

  const [users, totalCount] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        xp: true,
        level: true,
        hscBatch: true,
        board: true,
        createdAt: true,
        lastActiveAt: true,
        streakCount: true,
        isBanned: true,
        banReason: true,
        bannedAt: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    totalCount,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(totalCount / pageSize)),
  };
}

export interface UserDetailStats {
  quizAttemptsCount: number;
  cqAttemptsCount: number;
  mockExamAttemptsCount: number;
  forumPostsCount: number;
  forumRepliesCount: number;
  contentReportsAgainstCount: number; // এই ইউজারের বিরুদ্ধে কতগুলো রিপোর্ট এসেছে (তার পোস্ট/রিপ্লাই এর উপর)
}

/**
 * Admin User Detail ভিউ এর জন্য একজন নির্দিষ্ট ইউজারের সংক্ষিপ্ত
 * কার্যক্রম পরিসংখ্যান — কোনো ভারী raw ডেটা না, শুধু গণনা (count)
 * যাতে দ্রুত লোড হয়।
 */
export async function getUserDetailStats(userId: string): Promise<UserDetailStats> {
  const [
    quizAttemptsCount,
    cqAttemptsCount,
    mockExamAttemptsCount,
    forumPostsCount,
    forumRepliesCount,
    reportsOnPosts,
    reportsOnReplies,
  ] = await Promise.all([
    prisma.quizAttempt.count({ where: { userId } }),
    prisma.cQAttempt.count({ where: { userId } }),
    prisma.mockExamAttempt.count({ where: { userId } }),
    prisma.forumPost.count({ where: { userId } }),
    prisma.forumReply.count({ where: { userId } }),
    prisma.contentReport.count({ where: { post: { userId } } }),
    prisma.contentReport.count({ where: { reply: { userId } } }),
  ]);

  return {
    quizAttemptsCount,
    cqAttemptsCount,
    mockExamAttemptsCount,
    forumPostsCount,
    forumRepliesCount,
    contentReportsAgainstCount: reportsOnPosts + reportsOnReplies,
  };
}
