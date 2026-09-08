"use client";

// ===================================================================
// Unsaved Changes Warning Hook — পেজ ছেড়ে যাওয়ার আগে সতর্ক করা
// -------------------------------------------------------------------
// আগে টপিক নোট এডিটর সহ কিছু ফর্মে অনেকটা টেক্সট লেখার পরেও ইউজার
// ভুলবশত ব্যাক বাটন/ট্যাব বন্ধ করলে কোনো সতর্কতা ছাড়াই সব হারিয়ে
// যেত। এই হুক ব্রাউজারের native `beforeunload` ইভেন্ট ব্যবহার করে
// (ট্যাব বন্ধ/রিফ্রেশ/অন্য সাইটে যাওয়ার জন্য) — `hasUnsavedChanges`
// true থাকলে ব্রাউজার নিজস্ব "আপনি কি নিশ্চিত?" কনফার্মেশন দেখাবে।
//
// সীমাবদ্ধতা: Next.js এর ক্লায়েন্ট-সাইড রাউটিং (Link ক্লিক করে অন্য
// পেজে যাওয়া) এই ইভেন্টে ধরা পড়ে না (এটা শুধু full page
// unload/reload/close এর জন্য) — Next.js App Router এ in-app
// navigation intercept করার কোনো stable public API নেই এখনো।
// ===================================================================
import { useEffect } from "react";

export function useUnsavedChangesWarning(hasUnsavedChanges: boolean) {
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    function handleBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
      // পুরনো ব্রাউজার সমর্থনের জন্য returnValue সেট করা প্রয়োজন
      e.returnValue = "";
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);
}
