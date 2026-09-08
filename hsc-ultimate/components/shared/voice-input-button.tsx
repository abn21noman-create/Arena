"use client";

// ===================================================================
// Voice Input Button — Browser এর built-in Web Speech API
// (SpeechRecognition) ব্যবহার করে কথা বলে টেক্সট ইনপুট দেওয়ার সুবিধা
// -------------------------------------------------------------------
// TextToSpeechButton (components/learn/text-to-speech-button.tsx) এর
// "counterpart" — সেটা টেক্সট শোনায় (output), এটা কথা শুনে টেক্সট
// বানায় (input)। একই ডিজাইন দর্শন: সম্পূর্ণ ফ্রি, কোনো external API/
// cost লাগে না (ব্রাউজারের নিজস্ব speech recognition engine ব্যবহার
// করে), browser support না থাকলে বাটন সম্পূর্ণ hidden হয়ে যায়
// (graceful degradation, কোনো broken UI দেখায় না)।
//
// bn-BD (বাংলা, বাংলাদেশ) ভাষা কোড ব্যবহার করা হয়েছে — Chrome এর
// অফিসিয়াল Web Speech API ডেমো/ভাষা তালিকায় verified ভাষা কোড
// (Deep Research দিয়ে যাচাই করা হয়েছে)।
//
// AI Doubt Solver ও PDF Chat দুই জায়গাতেই পুনর্ব্যবহারযোগ্য —
// `onResult` callback দিয়ে parent component কে transcript পাঠায়,
// parent নিজের input state আপডেট করে।
// ===================================================================
import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// TypeScript এর built-in lib.dom.d.ts এ SpeechRecognition টাইপ নেই
// (এখনো experimental/vendor-prefixed Web API হিসেবে বিবেচিত) — তাই
// প্রয়োজনীয় অংশটুকু ম্যানুয়ালি টাইপ করা হয়েছে (শুধু যা ব্যবহার করা
// হচ্ছে তার জন্য, পুরো স্পেক না)
interface SpeechRecognitionResultEvent extends Event {
  results: {
    [index: number]: { [index: number]: { transcript: string }; isFinal: boolean };
    length: number;
  };
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

interface WindowWithSpeechRecognition extends Window {
  SpeechRecognition?: new () => SpeechRecognitionLike;
  webkitSpeechRecognition?: new () => SpeechRecognitionLike;
}

interface VoiceInputButtonProps {
  onResult: (transcript: string) => void;
  disabled?: boolean;
  className?: string;
}

export function VoiceInputButton({ onResult, disabled, className }: VoiceInputButtonProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const w = window as WindowWithSpeechRecognition;
    const SpeechRecognitionCtor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognitionCtor);

    // কম্পোনেন্ট আনমাউন্ট হলে চলমান recognition বন্ধ করা (মেমরি লিক/
    // ব্যাকগ্রাউন্ডে মাইক্রোফোন চালু থেকে যাওয়া এড়াতে)
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  function startListening() {
    if (typeof window === "undefined" || disabled) return;
    const w = window as WindowWithSpeechRecognition;
    const SpeechRecognitionCtor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) return;

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "bn-BD";
    recognition.continuous = false; // একবার থামলেই (pause) ফলাফল পাঠাবে
    recognition.interimResults = false; // শুধু চূড়ান্ত ফলাফল, আংশিক না
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      if (transcript.trim()) {
        onResult(transcript.trim());
      }
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      // "no-speech" (কিছু বলা হয়নি) ও "aborted" (ইউজার নিজেই থামিয়েছে)
      // সাধারণ/প্রত্যাশিত অবস্থা — শুধু আসল সমস্যায় (permission-denied,
      // network) toast দেখানো হয়
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        toast.error("মাইক্রোফোন ব্যবহারের অনুমতি লাগবে — ব্রাউজার সেটিংসে চেক করো");
      } else if (event.error === "network") {
        toast.error("ভয়েস রিকগনিশনের জন্য ইন্টারনেট সংযোগ দরকার");
      } else if (event.error !== "no-speech" && event.error !== "aborted") {
        toast.error("ভয়েস ইনপুটে সমস্যা হয়েছে, আবার চেষ্টা করো");
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }

  if (!isSupported) return null;

  return (
    <Button
      type="button"
      variant={isListening ? "default" : "outline"}
      size="icon"
      onClick={isListening ? stopListening : startListening}
      disabled={disabled}
      className={cn(isListening && "animate-pulse", className)}
      aria-label={isListening ? "শোনা বন্ধ করো" : "কথা বলে লেখো (ভয়েস ইনপুট)"}
      title={isListening ? "শুনছি... (থামাতে আবার চাপো)" : "কথা বলে লেখো"}
    >
      {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
    </Button>
  );
}
