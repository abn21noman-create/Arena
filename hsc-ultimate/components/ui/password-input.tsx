"use client";

// ===================================================================
// PasswordInput — show/hide toggle সহ পাসওয়ার্ড ইনপুট কম্পোনেন্ট
// -------------------------------------------------------------------
// সাধারণ Input কম্পোনেন্টের উপর একটা eye icon টগল বাটন যোগ করা হয়েছে,
// যাতে ইউজার টাইপ করার সময় পাসওয়ার্ড দেখে নিশ্চিত হতে পারে (বিশেষ করে
// মোবাইলে টাইপো এড়াতে খুবই কাজে লাগে)। এটা সব password type input এ
// ব্যবহার করার জন্য (Login/Register/Reset Password/Settings/Danger Zone)।
// ===================================================================
import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function PasswordInput({
  className,
  ...props
}: Omit<React.ComponentProps<"input">, "type">) {
  const [visible, setVisible] = React.useState(false);

  return (
    <div className="relative">
      <Input
        type={visible ? "text" : "password"}
        className={cn("pr-9", className)}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={visible ? "পাসওয়ার্ড লুকাও" : "পাসওয়ার্ড দেখাও"}
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

export { PasswordInput };
