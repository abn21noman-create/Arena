// ===================================================================
// Admin Panel Layout — সাইডবার সহ সব admin পেজের জন্য কমন লেআউট
// -------------------------------------------------------------------
// 🔧 UI/UX Polish: নেভিগেশন UI (active-highlight, mobile-responsive,
// dark mode consistency) এখন `AdminSidebarNav` (client component) এ
// — নিচে বিস্তারিত কারণ কমেন্ট আছে সেই ফাইলে।
// ===================================================================
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminSidebarNav } from "@/components/admin/admin-sidebar-nav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <AdminSidebarNav
        name={session.user.name ?? "Admin"}
        email={session.user.email ?? ""}
      />

      {/* Content */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-x-hidden min-w-0">{children}</main>
    </div>
  );
}
