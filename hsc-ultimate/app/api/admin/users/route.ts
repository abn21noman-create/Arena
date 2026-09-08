// ===================================================================
// Admin: ইউজার লিস্ট — search/filter/sort/pagination সহ
// GET /api/admin/users?search=&role=&status=&sortBy=&sortOrder=&page=&pageSize=
// -------------------------------------------------------------------
// 🔧 Admin Panel Power-up: আগে এই এন্ডপয়েন্ট সব ইউজার একবারে (কোনো
// filter/sort/pagination ছাড়া) ফেরত দিত। ইউজার সংখ্যা বাড়লে এটা
// স্কেল করত না। এখন `lib/admin-user-management.ts` এর
// `getAdminUserList()` ব্যবহার করে।
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getAdminUserList } from "@/lib/admin-user-management";
import { parsePaginationParam } from "@/lib/pagination-validation";
import type {
  UserRoleFilter,
  UserSortField,
  UserSortOrder,
  UserStatusFilter,
} from "@/lib/admin-user-management";

const VALID_SORT_FIELDS: UserSortField[] = ["createdAt", "xp", "name", "lastActiveAt"];
const VALID_ROLE_FILTERS: UserRoleFilter[] = ["ALL", "STUDENT", "ADMIN"];
const VALID_STATUS_FILTERS: UserStatusFilter[] = ["ALL", "ACTIVE", "BANNED"];

export async function GET(req: NextRequest) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const { searchParams } = new URL(req.url);

  const search = searchParams.get("search") ?? undefined;

  const roleParam = searchParams.get("role") ?? "ALL";
  const role = VALID_ROLE_FILTERS.includes(roleParam as UserRoleFilter)
    ? (roleParam as UserRoleFilter)
    : "ALL";

  const statusParam = searchParams.get("status") ?? "ALL";
  const status = VALID_STATUS_FILTERS.includes(statusParam as UserStatusFilter)
    ? (statusParam as UserStatusFilter)
    : "ALL";

  const sortByParam = searchParams.get("sortBy") ?? "createdAt";
  const sortBy = VALID_SORT_FIELDS.includes(sortByParam as UserSortField)
    ? (sortByParam as UserSortField)
    : "createdAt";

  const sortOrder: UserSortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

  // 🐛 বাগ ফিক্স: `?page=1e300`/বিশাল digit-string দিলে আগে Prisma
  // `skip`-এ গিয়ে ৫০০ ক্র্যাশ করাত — এখন safe-integer চেক করে fallback।
  const page = parsePaginationParam(searchParams.get("page"), 1, { min: 1 });
  const pageSizeParam = searchParams.get("pageSize");
  const pageSize = pageSizeParam
    ? parsePaginationParam(pageSizeParam, 25, { min: 1 })
    : undefined;

  const result = await getAdminUserList({
    search,
    role,
    status,
    sortBy,
    sortOrder,
    page,
    pageSize,
  });

  return NextResponse.json(result);
}
