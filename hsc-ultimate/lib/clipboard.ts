// ===================================================================
// Clipboard কপি ইউটিলিটি — error handling সহ, fallback সহ
// -------------------------------------------------------------------
// আধুনিক Permissions Policy, iframe sandbox, iOS Safari ও পুরনো ব্রাউজার
// সমর্থিত সেইফ কপি মেকানিজম।
// ===================================================================
export async function copyToClipboard(text: string): Promise<boolean> {
  // আধুনিক Clipboard API সাপোর্ট ও পারমিশন পলিসি যাচাই
  let canUseClipboardApi = Boolean(
    typeof navigator !== "undefined" &&
      navigator.clipboard &&
      typeof navigator.clipboard.writeText === "function" &&
      typeof window !== "undefined" &&
      window.isSecureContext
  );

  // Permissions policy থাকলে clipboard-write নিষিদ্ধ কি না চেক করা
  if (canUseClipboardApi && typeof document !== "undefined") {
    try {
      const doc = document as unknown as {
        permissionsPolicy?: { allowsFeature?: (feature: string) => boolean };
        featurePolicy?: { allowsFeature?: (feature: string) => boolean };
      };
      if (
        doc.permissionsPolicy?.allowsFeature &&
        !doc.permissionsPolicy.allowsFeature("clipboard-write")
      ) {
        canUseClipboardApi = false;
      } else if (
        doc.featurePolicy?.allowsFeature &&
        !doc.featurePolicy.allowsFeature("clipboard-write")
      ) {
        canUseClipboardApi = false;
      }
    } catch {
      // Ignore policy inspection error
    }
  }

  if (canUseClipboardApi) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // permission denied বা sandbox restrictions থাকলে fallback-এ যাওয়া হবে
    }
  }

  // Fallback: document.execCommand("copy")
  if (typeof document !== "undefined") {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.top = "0";
      textarea.style.left = "0";
      textarea.style.opacity = "0";
      textarea.style.pointerEvents = "none";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      textarea.setSelectionRange(0, 99999);
      const success = document.execCommand("copy");
      document.body.removeChild(textarea);
      if (success) return true;
    } catch {
      // Fallback failed
    }
  }

  return false;
}
