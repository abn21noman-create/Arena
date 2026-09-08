// ===================================================================
// Admin: User Management পেজ — search/filter/sort/ban/delete Power-up
// -------------------------------------------------------------------
// প্রথম পেজলোড server-side রেন্ডার করা হয় (SEO/initial-paint দ্রুত),
// পরবর্তী search/filter/sort/pagination সব client-side (UserManager)
// থেকে `/api/admin/users` কল করে হয়।
// ===================================================================
import { getAdminUserList } from "@/lib/admin-user-management";
import { UserManager } from "@/components/admin/user-manager";

export default async function AdminUsersPage() {
  const { users, totalCount } = await getAdminUserList({ page: 1 });

  const serializedUsers = users.map((u) => ({
    ...u,
    createdAt: u.createdAt.toISOString(),
    lastActiveAt: u.lastActiveAt ? u.lastActiveAt.toISOString() : null,
    bannedAt: u.bannedAt ? u.bannedAt.toISOString() : null,
  }));

  return <UserManager initialUsers={serializedUsers} initialTotalCount={totalCount} />;
}
