"use client";

// ===================================================================
// Text-to-Speech বাটন — Browser এর built-in Web Speech API ব্যবহার করে
// টপিকের নোট শুনতে সাহায্য করে (কোনো external API/cost লাগে না)।
// -------------------------------------------------------------------
// দৃষ্টিপ্রতিবন্ধী বা পড়তে কষ্ট হওয়া (dyslexia) ছাত্রদের জন্য গুরুত্বপূর্ণ
// accessibility ফিচার (Deep Research এ WCAG 2.2 "Text-to-Speech/Read-Aloud"
// হিসেবে চিহ্নিত)। বাংলা ভাষা (bn-BD/bn-IN) সমর্থন ব্রাউজার-নির্ভর — না
// থাকলে ব্রাউজারের ডিফল্ট ভয়েস ব্যবহার হয়।
// ===================================================================
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, Square } from "lucide-react";

interface TextToSpeechButtonProps {
  text: string;
  label?: string;
}

export function TextToSpeechButton({ text, label = "শুনো" }: TextToSpeechButtonProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    setIsSupported(typeof window !== "undefined" && "speechSynthesis" in window);
    // পেজ ছেড়ে গেলে বকবক থামিয়ে দেওয়া (মেমরি লিক/অবাঞ্ছিত audio এড়াতে)
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  function handleToggle() {
    if (!isSupported || !text.trim()) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    // বাংলা ভয়েস পাওয়া গেলে সেটাই ব্যবহার করা হবে, না পেলে ব্রাউজার ডিফল্ট
    const voices = window.speechSynthesis.getVoices();
    const bengaliVoice = voices.find((v) => v.lang.startsWith("bn"));
    if (bengaliVoice) {
      utterance.voice = bengaliVoice;
      utterance.lang = bengaliVoice.lang;
    } else {
      utterance.lang = "bn-BD";
    }
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.cancel(); // আগের কোনো speech চলতে থাকলে থামানো
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  }

  if (!isSupported) return null;

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleToggle}
      className="gap-1.5"
      aria-label={isSpeaking ? "পড়া থামাও" : `${label} — টেক্সট শুনো`}
    >
      {isSpeaking ? (
        <>
          <Square className="h-3.5 w-3.5" />
          থামাও
        </>
      ) : (
        <>
          <Volume2 className="h-3.5 w-3.5" />
          {label}
        </>
      )}
    </Button>
  );
}
