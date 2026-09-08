// ===================================================================
// Feature Disabled পেজ — Admin যখন System Control থেকে কোনো নির্দিষ্ট
// মডিউল (Feature Flag দিয়ে) বন্ধ করে দেয় তখন সেই মডিউলের রুটে গেলে
// এই পেজ দেখানো হয় (proxy.ts এ rewrite করা হয়)।
// ===================================================================
import Link from "next/link";
import { ToggleLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FeatureDisabledPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-linear-to-br from-violet-50 via-white to-fuchsia-50 dark:from-violet-950/30 dark:via-background dark:to-fuchsia-950/20">
      <div className="max-w-md w-full text-center">
        <div className="h-16 w-16 rounded-2xl bg-linear-to-br from-slate-500 to-slate-700 flex items-center justify-center mx-auto mb-5">
          <ToggleLeft className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-xl font-bold mb-2">এই ফিচারটা সাময়িকভাবে বন্ধ আছে</h1>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
          আমরা এই মুহূর্তে এই ফিচারে কিছু কাজ করছি। খুব শীঘ্রই আবার চালু হয়ে
          যাবে — ততক্ষণ প্ল্যাটফর্মের বাকি সব ফিচার স্বাভাবিকভাবে ব্যবহার করতে
          পারো।
        </p>
        <Button render={<Link href="/dashboard" />}>ড্যাশবোর্ডে ফিরে যাও</Button>
      </div>
    </div>
  );
}
