"use client";

// ===================================================================
// DialogInertBackground — base-ui v1.6.0 এর একটা established upstream
// বাগ (GitHub mui/base-ui#4678) এর জন্য workaround।
// -------------------------------------------------------------------
// সমস্যা: base-ui এর Dialog/Menu/Sheet (Modal) খোলা অবস্থায়
// `FloatingFocusManager` background element গুলোতে শুধু
// `aria-hidden="true"` সেট করে (স্ক্রিন-রিডার থেকে লুকানোর জন্য) কিন্তু
// HTML `inert` attribute সেট করে না — ফলে background এর লিংক/বাটন
// keyboard Tab navigation এ এখনো ফোকাসযোগ্য থেকে যায় (WCAG 2.1.1
// Keyboard ভায়োলেশন: Tab চাপলে ফোকাস মোডাল থেকে বেরিয়ে পিছনের পেজে
// চলে যায়, focus trap ভেঙে যায়)। এই সেশনে Playwright দিয়ে লাইভ প্রুফ
// পাওয়া গেছে: GlobalSearch (Cmd+K) ডায়ালগ খোলা অবস্থায় ৮টা Tab চাপলে
// ফোকাস sidebar এর লিংকে চলে যাচ্ছিল।
//
// GitHub issue এ maintainer-approved fix (PR #4714) এখনো merge/release
// হয়নি (npm এ এখনো 1.6.0 ই latest, কোনো patch ভার্সন নেই), তাই issue
// এ দেওয়া অফিসিয়াল workaround এখানে প্রয়োগ করা হয়েছে: base-ui নিজেই
// background element গুলোতে `data-base-ui-inert` মার্কার attribute
// বসায় (এটা প্রুফ — এই সেশনে `dataBaseUiInertCount: 11` পাওয়া গেছে,
// dialog খোলা অবস্থায়), MutationObserver দিয়ে সেই মার্কার observe করে
// একই element এ আসল `inert` attribute mirror করা হয় — `inert` HTML
// attribute browser কে element কে accessibility tree ও keyboard tab
// order দুটো থেকেই বাদ দিতে বাধ্য করে (`aria-hidden` শুধু প্রথমটা করে)।
//
// ⚠️ Focus guard sentinel exclude করা আবশ্যক: base-ui নিজের focus-trap
// implement করতে দুইটা invisible "guard" element ব্যবহার করে (Tab
// শেষ পর্যন্ত গেলে আবার dialog এর শুরুতে ফিরিয়ে আনার জন্য) — এগুলোতেও
// `data-base-ui-inert` মার্কার লাগানো থাকে, কিন্তু এগুলোকে `inert` করে
// দিলে focus trap সম্পূর্ণ ভেঙে যাবে (Tab আর dialog এর ভেতরে loop করবে
// না, বরং browser chrome এ চলে যাবে) — তাই `[data-base-ui-focus-guard]`
// attribute থাকা element গুলো স্কিপ করা হয়েছে।
// ===================================================================
import { useEffect } from "react";

export function DialogInertBackground() {
  useEffect(() => {
    function syncInert(el: Element) {
      if (!(el instanceof HTMLElement)) return;
      // focus guard sentinel এ inert বসালে focus trap ভেঙে যায় — স্কিপ করা আবশ্যক
      if (el.hasAttribute("data-base-ui-focus-guard")) return;

      if (el.hasAttribute("data-base-ui-inert")) {
        el.setAttribute("inert", "");
      } else {
        el.removeAttribute("inert");
      }
    }

    // পেজ লোড হওয়ার সময় ইতিমধ্যে মার্ক করা element থাকলে (rare, কিন্তু
    // safety net হিসেবে) প্রথমেই একবার sync করে নেওয়া
    document.querySelectorAll("[data-base-ui-inert]").forEach(syncInert);

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type !== "attributes") continue;
        syncInert(mutation.target as Element);
      }
    });

    observer.observe(document.body, {
      subtree: true,
      attributes: true,
      attributeFilter: ["data-base-ui-inert"],
    });

    return () => observer.disconnect();
  }, []);

  return null;
}
