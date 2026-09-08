"use client";

// ===================================================================
// HSC ULTIMATE — Premium AI Tutor 2026
// -------------------------------------------------------------------
// - Aurora glassmorphic design
// - Premium chat bubbles
// - Quick action suggestions
// - Model selector with provider dots
// ===================================================================

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { TextToSpeechButton } from "@/components/learn/text-to-speech-button";
import { VoiceInputButton } from "@/components/shared/voice-input-button";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { GlassCard } from "@/components/ui/glass-card";
import { toast } from "sonner";
import {
  ArrowLeft,
  Send,
  Sparkles,
  Loader2,
  ImagePlus,
  X,
  Trash2,
  Lightbulb,
  Zap,
  Brain,
  ShieldCheck,
} from "lucide-react";

type TutorMode = "DIRECT" | "SOCRATIC";

interface Message {
  id?: string;
  role: "user" | "assistant";
  content: string;
  imageUrl?: string | null;
  provider?: string | null;
  tutorMode?: TutorMode | null;
}

const WELCOME_MESSAGES: Record<TutorMode, Message> = {
  DIRECT: {
    role: "assistant",
    content:
      "আসসালামু আলাইকুম! 👋 আমি তোমার HSC Ultimate AI শিক্ষক। পদার্থবিজ্ঞান, রসায়ন, জীববিজ্ঞান, উচ্চতর গণিত, বাংলা, ইংরেজি বা ICT — যেকোনো বিষয়ে প্রশ্ন করতে পারো! চাইলে অংকের ছবি তুলে/আপলোড করেও সমাধান জানতে পারো। 📸",
  },
  SOCRATIC: {
    role: "assistant",
    content:
      "আসসালামু আলাইকুম! 👋 আমি এখন Socratic মোডে আছি — সরাসরি উত্তর না দিয়ে তোমাকে প্রশ্ন করে করে নিজে ভাবতে সাহায্য করবো, যাতে তুমি নিজেই সমাধানে পৌঁছাতে পারো। এতে শেখাটা আরও গভীর হবে! কোনো সমস্যা নিয়ে জিজ্ঞেস করো। 🧠",
  },
};

export default function AITutorPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [tutorMode, setTutorMode] = useState<TutorMode>("DIRECT");
  const [modeLoading, setModeLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch("/api/ai-chat");
      const data = await res.json();
      if (res.ok && data.messages?.length > 0) {
        setMessages(data.messages);
      } else {
        setMessages([WELCOME_MESSAGES.DIRECT]);
      }
      if (res.ok && data.aiTutorMode) {
        setTutorMode(data.aiTutorMode);
      }
    } catch {
      setMessages([WELCOME_MESSAGES.DIRECT]);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleModeChange(mode: TutorMode) {
    if (mode === tutorMode || modeLoading) return;
    setModeLoading(true);
    try {
      const res = await fetch("/api/user/ai-tutor-mode", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode }),
      });
      if (!res.ok) {
        toast.error("মোড পরিবর্তন করা যায়নি");
        return;
      }
      setTutorMode(mode);
      toast.success(
        mode === "SOCRATIC"
          ? "🧠 Socratic মোড চালু — এখন থেকে গাইডিং প্রশ্ন করে শেখাবে"
          : "⚡ Direct মোড চালু — এখন থেকে সরাসরি সমাধান দেবে"
      );
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setModeLoading(false);
    }
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("ছবির সাইজ ৫MB এর কম হতে হবে");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setPendingImage(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function sendMessage() {
    const text = input.trim();
    if ((!text && !pendingImage) || loading) return;

    const userMessage: Message = {
      role: "user",
      content: text,
      imageUrl: pendingImage,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    const imageToSend = pendingImage;
    setPendingImage(null);
    setLoading(true);

    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, imageUrl: imageToSend }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.error ?? "সমস্যা হয়েছে, আবার চেষ্টা করো।" },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.content,
            provider: data.provider,
            tutorMode: data.tutorMode,
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "নেটওয়ার্ক সমস্যা হয়েছে, আবার চেষ্টা করো।" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function clearHistory() {
    try {
      await fetch("/api/ai-chat", { method: "DELETE" });
      setMessages([WELCOME_MESSAGES[tutorMode]]);
      toast.success("চ্যাট হিস্ট্রি মুছে ফেলা হয়েছে");
    } catch {
      toast.error("মুছতে সমস্যা হয়েছে");
    }
  }

  return (
    <AuroraBackground variant="subtle" className="h-screen">
      <div className="flex flex-col h-screen max-w-4xl mx-auto w-full">
        {/* Premium Header */}
        <GlassCard className="rounded-none border-x-0 border-t-0" variant="subtle">
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="flex items-center gap-3 min-w-0">
              <Button render={<Link href="/dashboard" />} variant="ghost" size="icon" className="rounded-full shrink-0" aria-label="পিছনে যাও">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 flex items-center justify-center shadow-lg shadow-violet-500/30 shrink-0">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="font-bold leading-tight truncate flex items-center gap-1.5">
                  AI Doubt Solver
                  <Badge variant="secondary" className="text-xs px-1.5 py-0">
                    <Sparkles className="h-2.5 w-2.5 mr-0.5" />
                    AI
                  </Badge>
                </p>
                <p className="text-xs text-muted-foreground leading-tight truncate">
                  HSC Science • ছবি আপলোড সাপোর্ট • বাংলা/English
                </p>
              </div>
            </div>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={clearHistory}
                    aria-label="হিস্ট্রি মুছে ফেলো"
                    className="shrink-0"
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                }
              />
              <TooltipContent>হিস্ট্রি মুছে ফেলো</TooltipContent>
            </Tooltip>
          </div>

          {/* AI Tutor Mode Toggle */}
          <div className="px-4 pb-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleModeChange("DIRECT")}
              disabled={modeLoading}
              aria-pressed={tutorMode === "DIRECT"}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${
                tutorMode === "DIRECT"
                  ? "border-primary bg-primary/15 text-primary shadow-xs font-semibold"
                  : "border-border bg-card/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Zap className="h-3.5 w-3.5" />
              Direct Mode
            </button>
            <button
              type="button"
              onClick={() => handleModeChange("SOCRATIC")}
              disabled={modeLoading}
              aria-pressed={tutorMode === "SOCRATIC"}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${
                tutorMode === "SOCRATIC"
                  ? "border-primary bg-primary/15 text-primary shadow-xs font-semibold"
                  : "border-border bg-card/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Lightbulb className="h-3.5 w-3.5" />
              Socratic Mode
            </button>
          </div>
          <p className="mx-4 mb-3 flex items-start gap-1.5 text-xs leading-4 text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" />
            প্রশ্ন/ছবি ও relevant history configured AI provider-এ যায় এবং chat history account-এ থাকে। Sensitive data দিও না। <Link href="/privacy#ai-processing" className="font-semibold text-primary hover:underline">বিস্তারিত</Link>
          </p>
        </GlassCard>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 space-y-3 sm:space-y-4">
          {historyLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            messages.map((m, i) => (
              <div
                key={m.id ?? i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[75%] px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl whitespace-pre-wrap text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-gradient-to-br from-blue-500 to-violet-500 text-white rounded-tr-sm shadow-lg shadow-blue-500/20"
                      : "glass-card rounded-tl-sm"
                  }`}
                >
                  {m.imageUrl && (
                    <div className="mb-2 relative w-full max-w-[200px] aspect-square rounded-lg overflow-hidden">
                      <Image
                        src={m.imageUrl}
                        alt="আপলোড করা ছবি"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  )}
                  {m.content}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {m.role === "assistant" && m.tutorMode === "SOCRATIC" && (
                      <Badge className="text-xs gap-1 bg-amber-500/15 text-amber-700 dark:text-amber-400 hover:bg-amber-500/15">
                        <Lightbulb className="h-2.5 w-2.5" />
                        Socratic
                      </Badge>
                    )}
                    {m.provider && (
                      <Badge variant="outline" className="text-xs opacity-70">
                        {m.provider}
                      </Badge>
                    )}
                    {m.role === "assistant" && m.content && (
                      <TextToSpeechButton text={m.content} label="শুনো" />
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex justify-start">
              <div className="glass-card rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                ভাবছি...
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Pending image preview */}
        {pendingImage && (
          <div className="px-4 pt-2">
            <div className="relative inline-block">
              <div className="relative h-16 w-16 rounded-lg overflow-hidden border">
                <Image src={pendingImage} alt="প্রিভিউ" fill className="object-cover" unoptimized />
              </div>
              <button
                onClick={() => setPendingImage(null)}
                className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-destructive text-white flex items-center justify-center"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}

        {/* Input */}
        <GlassCard className="rounded-none border-x-0 border-b-0" variant="subtle">
          <div className="p-3 flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageSelect}
            />
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                    aria-label="ছবি আপলোড করো"
                    className="shrink-0"
                  >
                    <ImagePlus className="h-4 w-4" />
                  </Button>
                }
              />
              <TooltipContent>ছবি আপলোড করো</TooltipContent>
            </Tooltip>
            <VoiceInputButton
              onResult={(transcript) => setInput((prev) => (prev ? `${prev} ${transcript}` : transcript))}
              disabled={loading}
            />
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="তোমার প্রশ্ন লেখো বা 🎤 বাটনে কথা বলো..."
              aria-label="তোমার প্রশ্ন লেখো"
              disabled={loading}
            />
            <Button
              onClick={sendMessage}
              disabled={loading || (!input.trim() && !pendingImage)}
              aria-label="পাঠাও"
              className="shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </GlassCard>
      </div>
    </AuroraBackground>
  );
}
