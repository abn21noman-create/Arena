/**
 * Voice Reader Utility using Web Speech Synthesis API.
 * Sanitizes markdown, math LaTeX, and formulas to produce clean, natural speech audio.
 */

export function sanitizeTextForSpeech(rawText: string): string {
  if (!rawText) return "";

  return rawText
    // Remove markdown headers, bold, italics, code blocks
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/[#*_~>]/g, "")
    // Convert math LaTeX to spoken words
    .replace(/\\sqrt\{([^}]+)\}/g, "রুট $1")
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "$1 ভাগ $2")
    .replace(/\^2/g, " স্কয়ার")
    .replace(/\^3/g, " কিউব")
    .replace(/\^\{([^}]+)\}/g, " টু দ্য পাওয়ার $1")
    .replace(/\\alpha/g, "আলফা")
    .replace(/\\beta/g, "বিটা")
    .replace(/\\gamma/g, "গামা")
    .replace(/\\theta/g, "থিটা")
    .replace(/\\lambda/g, "ল্যাম্বডা")
    .replace(/\\pi/g, "পাই")
    .replace(/\\Delta/g, "ডেল্টা")
    .replace(/\\Omega/g, "ওহম")
    .replace(/\\times/g, " গুণ ")
    .replace(/\\div/g, " ভাগ ")
    .replace(/\\approx/g, " প্রায় সমান ")
    .replace(/\\neq/g, " অসমান ")
    .replace(/\\leq/g, " ছোট বা সমান ")
    .replace(/\\geq/g, " বড় বা সমান ")
    .replace(/\\rightarrow/g, " থেকে তৈরি হয় ")
    .replace(/\\rightleftharpoons/g, " উভমুখী বিক্রিয়া ")
    .replace(/[\$\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function speakText(
  text: string,
  onEnd?: () => void,
  onError?: () => void
): SpeechSynthesisUtterance | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return null;
  }

  // Cancel any ongoing speech first
  window.speechSynthesis.cancel();

  const clean = sanitizeTextForSpeech(text);
  if (!clean) return null;

  const utterance = new SpeechSynthesisUtterance(clean);
  utterance.lang = "bn-BD";
  utterance.rate = 0.95;
  utterance.pitch = 1.0;

  // Try to find a Bengali or native voice if available
  const voices = window.speechSynthesis.getVoices();
  const banglaVoice = voices.find(
    (v) => v.lang.startsWith("bn") || v.name.toLowerCase().includes("bengali")
  );
  if (banglaVoice) {
    utterance.voice = banglaVoice;
  }

  if (onEnd) utterance.onend = onEnd;
  if (onError) utterance.onerror = onError;

  window.speechSynthesis.speak(utterance);
  return utterance;
}

export function stopSpeaking(): void {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}
