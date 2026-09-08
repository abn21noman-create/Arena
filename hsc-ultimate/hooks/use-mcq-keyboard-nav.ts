"use client";

// ===================================================================
// MCQ Keyboard Navigation Hook — WCAG 2.2 Accessibility গ্যাপ পূরণ
// (FEATURE_RESEARCH.md এ চিহ্নিত: "Keyboard navigation/screen reader
// ARIA labels" ❌ ছিল)
// -------------------------------------------------------------------
// সব MCQ practice/exam runner এ পুনর্ব্যবহারযোগ্য একটা কেন্দ্রীভূত
// keyboard shortcut hook:
//   - সংখ্যা ১-৯ অথবা অক্ষর A-I চাপলে সেই ইনডেক্সের অপশন নির্বাচিত হয়
//     (দুটোই সাপোর্ট করা হয়, কারণ কিছু UI তে অপশনের পাশে সংখ্যা দেখানো
//     হয় আর কিছুতে অক্ষর — quiz-runner.tsx এ ইতিমধ্যে a/b/c/d দেখানো হয়)
//   - Enter অথবা → (ArrowRight) চাপলে "পরের প্রশ্ন"/"জমা দাও" ট্রিগার হয়
//     (nextEnabled true থাকলেই, যেমন উত্তর দেওয়া থাকলে)
//   - ← (ArrowLeft) চাপলে "আগের প্রশ্ন" (শুধু bilateral-navigation
//     runner গুলোতে prevEnabled/onPrev দেওয়া থাকলে কাজ করে)
// -------------------------------------------------------------------
// Input/Textarea তে টাইপ করার সময় (যেমন CQ answer লেখা, কোনো ফর্ম
// ফিল্ড) এই শর্টকাট গুলো ট্রিগার হয় না — target.tagName চেক করে বাদ
// দেওয়া হয়েছে, নাহলে টাইপ করার সময় "a" চাপলেও অপশন বদলে যেত।
// ===================================================================
import { useEffect } from "react";

interface UseMcqKeyboardNavOptions {
  /** বর্তমান প্রশ্নের অপশন লিস্ট — এই লিস্টের ইনডেক্স অনুযায়ী ১/a, ২/b ইত্যাদি ম্যাপ হয় */
  options: string[] | null | undefined;
  /** কোনো অপশন সিলেক্ট হলে কল হবে */
  onSelect: (option: string) => void;
  /** Enter/→ চাপলে কল হবে (দেওয়া না থাকলে কিছু হবে না) */
  onNext?: () => void;
  /** Enter/→ কাজ করবে কিনা (যেমন: প্রশ্নের উত্তর দেওয়া আছে কিনা) */
  nextEnabled?: boolean;
  /** ← চাপলে কল হবে (bilateral-navigation runner গুলোতে ব্যবহৃত) */
  onPrev?: () => void;
  /** ← কাজ করবে কিনা */
  prevEnabled?: boolean;
  /** পুরো hook টা সাময়িকভাবে বন্ধ রাখতে (যেমন submitting/loading অবস্থায়) */
  enabled?: boolean;
}

export function useMcqKeyboardNav({
  options,
  onSelect,
  onNext,
  nextEnabled = false,
  onPrev,
  prevEnabled = false,
  enabled = true,
}: UseMcqKeyboardNavOptions) {
  useEffect(() => {
    if (!enabled) return;

    function handleKeyDown(e: KeyboardEvent) {
      // ইনপুট/টেক্সটএরিয়াতে টাইপ করার সময় শর্টকাট কাজ করবে না
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable) {
        return;
      }

      const key = e.key;

      // সংখ্যা ১-৯ অথবা অক্ষর A-I (case-insensitive) দিয়ে অপশন সিলেক্ট
      let index = -1;
      if (/^[1-9]$/.test(key)) {
        index = Number(key) - 1;
      } else if (/^[a-iA-I]$/.test(key)) {
        index = key.toLowerCase().charCodeAt(0) - 97; // 'a' -> 0
      }

      if (index >= 0 && options && index < options.length) {
        e.preventDefault();
        onSelect(options[index]);
        return;
      }

      if ((key === "Enter" || key === "ArrowRight") && onNext && nextEnabled) {
        e.preventDefault();
        onNext();
        return;
      }

      if (key === "ArrowLeft" && onPrev && prevEnabled) {
        e.preventDefault();
        onPrev();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [options, onSelect, onNext, nextEnabled, onPrev, prevEnabled, enabled]);
}
