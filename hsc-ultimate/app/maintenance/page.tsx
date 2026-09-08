// ===================================================================
// Maintenance Mode পেজ — Admin যখন System Settings থেকে Maintenance
// Mode চালু করে তখন সব প্রোটেক্টেড student রুটে এই পেজ দেখানো হয়
// (proxy.ts এ rewrite করা হয়, URL বার এ আসল URL-ই থাকে)।
// -------------------------------------------------------------------
// Admin (role=ADMIN) এই ব্লকের বাইরে থাকে (proxy.ts এ শর্ত), তাই
// Admin সবসময় স্বাভাবিকভাবে অ্যাপ ব্যবহার করে maintenance বন্ধ করতে
// পারবে।
// -------------------------------------------------------------------
// 🔧 `export const dynamic = "force-dynamic"` বাধ্যতামূলক — এই পেজ
// `getSystemSettings()` দিয়ে লাইভ DB read করে (maintenanceMessage
// সবসময় সর্বশেষ থাকা উচিত)। এটা ছাড়া Next.js বিল্ড টাইমে এই পেজ
// static prerender করার চেষ্টা করে, যা বিল্ড-টাইম DB connection এর
// উপর নির্ভরশীল করে তোলে (flaky/ধীর নেটওয়ার্কে বিল্ড ফেইল করতে পারে,
// এই সেশনে ধরা পড়েছে — "Server has closed the connection" এরর)।
// ===================================================================
import { Wrench } from "lucide-react";
import { getSystemSettings } from "@/lib/system-settings";

export const dynamic = "force-dynamic";

export default async function MaintenancePage() {
  const settings = await getSystemSettings();

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-linear-to-br from-violet-50 via-white to-fuchsia-50 dark:from-violet-950/30 dark:via-background dark:to-fuchsia-950/20">
      <div className="max-w-md w-full text-center">
        <div className="h-16 w-16 rounded-2xl bg-linear-to-br from-violet-600 to-violet-800 flex items-center justify-center mx-auto mb-5">
          <Wrench className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-xl font-bold mb-2">রক্ষণাবেক্ষণ চলছে</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {settings.maintenanceMessage?.trim() ||
            "HSC Ultimate এ এই মুহূর্তে কিছু রক্ষণাবেক্ষণের কাজ চলছে। একটু পরে আবার চেষ্টা করো — খুব শীঘ্রই ফিরে আসছি! 🛠️"}
        </p>
      </div>
    </div>
  );
}
