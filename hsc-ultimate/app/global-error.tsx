"use client";

// ===================================================================
// Global Error Boundary — root layout.tsx নিজেই crash করলে এটা কাজ করে
// -------------------------------------------------------------------
// app/error.tsx শুধু layout এর *ভেতরের* সেগমেন্টের error catch করে।
// কিন্তু root layout.tsx (html/body ট্যাগসহ) নিজে কোনো কারণে crash
// করলে সেটা এই ফাইল দিয়ে catch হয় — তাই এই ফাইলে নিজস্ব <html>/<body>
// থাকা বাধ্যতামূলক (Next.js ডকুমেন্টেশন অনুযায়ী), কারণ এটা root layout
// কে সম্পূর্ণ replace করে render হয়।
// এই কেসটা বাস্তবে খুব কম ঘটে (root layout এ সাধারণত ভারী লজিক থাকে না),
// কিন্তু defensive completeness এর জন্য যোগ করা হলো।
// ===================================================================
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("HSC Ultimate — Root Layout Crash:", error);
  }, [error]);

  return (
    <html lang="bn">
      <body
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
          textAlign: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#0a0a0a",
          color: "#fafafa",
        }}
      >
        <h1 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.5rem" }}>
          অ্যাপ্লিকেশনে একটা গুরুতর সমস্যা হয়েছে
        </h1>
        <p style={{ color: "#a1a1aa", maxWidth: "24rem", marginBottom: "1.5rem" }}>
          দুঃখিত, HSC Ultimate লোড করতে সমস্যা হচ্ছে। পেজটি রিফ্রেশ করে আবার
          চেষ্টা করো।
        </p>
        <button
          onClick={() => reset()}
          style={{
            padding: "0.6rem 1.25rem",
            borderRadius: "0.5rem",
            background: "#6d28d9",
            color: "white",
            fontWeight: 500,
            border: "none",
            cursor: "pointer",
          }}
        >
          আবার চেষ্টা করো
        </button>
      </body>
    </html>
  );
}
