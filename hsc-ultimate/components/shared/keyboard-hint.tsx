// ===================================================================
// Keyboard Shortcut Hint — MCQ Runner গুলোতে ছোট্ট reusable ইঙ্গিত
// -------------------------------------------------------------------
// useMcqKeyboardNav হুকের সাথে জোড়ায় ব্যবহৃত হয় — ইউজারকে জানায় যে
// কীবোর্ড দিয়েও উত্তর দেওয়া যায় (accessibility discoverability)।
// Desktop এ দেখা যায় (মোবাইলে কীবোর্ড শর্টকাট প্রাসঙ্গিক না)।
// ===================================================================
import { Keyboard } from "lucide-react";

export function KeyboardHint({
  showPrev = false,
}: {
  /** ← শর্টকাটও উল্লেখ করবে কিনা (bilateral-navigation runner এ) */
  showPrev?: boolean;
}) {
  return (
    <p className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
      <Keyboard className="h-3 w-3 shrink-0" />
      কীবোর্ড: <kbd className="px-1 py-0.5 rounded bg-muted border text-xs">1-4</kbd>
      /
      <kbd className="px-1 py-0.5 rounded bg-muted border text-xs">A-D</kbd>
      অপশন বাছাই,
      <kbd className="px-1 py-0.5 rounded bg-muted border text-xs">Enter</kbd>
      পরের প্রশ্ন
      {showPrev && (
        <>
          ,
          <kbd className="px-1 py-0.5 rounded bg-muted border text-xs">←</kbd>
          আগের
        </>
      )}
    </p>
  );
}
