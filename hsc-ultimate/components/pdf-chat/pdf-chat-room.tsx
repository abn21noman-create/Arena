"use client";

// ===================================================================
// PDF Chat Room — একটা নির্দিষ্ট PDF নিয়ে AI এর সাথে কথোপকথন
// -------------------------------------------------------------------
// প্রতিটা assistant মেসেজে citedPages দেখানো হয় (কোন পাতা থেকে তথ্য
// নেওয়া হয়েছে), যাতে ইউজার চাইলে নিজে PDF এ গিয়ে যাচাই করতে পারে
// (transparency — RAG সিস্টেমের একটা গুরুত্বপূর্ণ UX প্র্যাকটিস)।
// ===================================================================
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TextToSpeechButton } from "@/components/learn/text-to-speech-button";
import { VoiceInputButton } from "@/components/shared/voice-input-button";
import { PdfSummaryCard } from "@/components/pdf-chat/pdf-summary-card";
import { MindMapCard } from "@/components/shared/mind-map-card";
import type { MindMapNode } from "@/components/shared/mind-map-tree";
import { toast } from "sonner";
import { ArrowLeft, Send, Loader2, Sparkles, BookOpen, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id?: string;
  role: "user" | "assistant";
  content: string;
  citedPages?: string | null;
  provider?: string | null;
}

interface DocumentInfo {
  id: string;
  title: string;
  status: "PROCESSING" | "READY" | "FAILED";
  errorMessage: string | null;
  pageCount: number;
  summary?: string | null;
  mindMap?: MindMapNode | null;
}

export function PdfChatRoom({ documentId }: { documentId: string }) {
  const [document, setDocument] = useState<DocumentInfo | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadData = useCallback(async () => {
    try {
      const [docRes, msgRes] = await Promise.all([
        fetch(`/api/pdf-chat/${documentId}`),
        fetch(`/api/pdf-chat/${documentId}/messages`),
      ]);
      const docData = await docRes.json();
      const msgData = await msgRes.json();
      if (docRes.ok) setDocument(docData.document);
      if (msgRes.ok) setMessages(msgData.messages);
    } catch {
      toast.error("লোড করতে সমস্যা হয়েছে");
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || sending || document?.status !== "READY") return;
    const question = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setSending(true);

    try {
      const res = await fetch(`/api/pdf-chat/${documentId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "উত্তর পাওয়া যায়নি");
        // ব্যর্থ হলে ইউজারের মেসেজ সরিয়ে না ফেলে থাকতে দেওয়া হচ্ছে (আবার চেষ্টা করতে পারবে)
        return;
      }
      setMessages((prev) => [...prev, data.message]);
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!document) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 text-center">
        <p className="text-muted-foreground">ডকুমেন্ট পাওয়া যায়নি।</p>
        <Button render={<Link href="/pdf-chat" />} variant="link">ফিরে যাও</Button>
      </div>
    );
  }

  const isNotReady = document.status !== "READY";

  return (
    <div className="mx-auto flex h-[calc(100vh-2rem)] max-w-3xl flex-col px-4 py-4">
      <div className="mb-3 flex items-center gap-3 border-b pb-3">
        <Button render={<Link href="/pdf-chat" />} variant="ghost" size="icon" aria-label="পিছনে যাও">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-semibold">{document.title}</h1>
          <p className="text-xs text-muted-foreground">{document.pageCount} পাতার PDF</p>
        </div>
      </div>

      {isNotReady ? (
        <Card className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
          <AlertCircle className="h-10 w-10 text-amber-600 dark:text-amber-400" />
          <p className="font-medium">
            {document.status === "PROCESSING"
              ? "PDF এখনো প্রসেস হচ্ছে..."
              : "প্রসেসিং ব্যর্থ হয়েছে"}
          </p>
          {document.errorMessage && (
            <p className="text-sm text-muted-foreground">{document.errorMessage}</p>
          )}
        </Card>
      ) : (
        <>
          <PdfSummaryCard documentId={documentId} initialSummary={document.summary ?? null} />
          <MindMapCard
            generateUrl={`/api/pdf-chat/${documentId}/mind-map`}
            initialMindMap={document.mindMap ?? null}
          />
          <div className="flex-1 space-y-4 overflow-y-auto py-2">
            {messages.length === 0 && (
              <Card className="p-4 text-sm text-muted-foreground">
                <Sparkles className="mb-2 h-5 w-5 text-violet-600 dark:text-violet-400" />
                এই PDF নিয়ে যেকোনো প্রশ্ন করো — যেমন &quot;এই অধ্যায়ের মূল সূত্রগুলো কী কী?&quot;
                বা &quot;নিউটনের দ্বিতীয় সূত্র ব্যাখ্যা করো&quot;
              </Card>
            )}
            {messages.map((msg, idx) => (
              <div
                key={msg.id ?? idx}
                className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm",
                    msg.role === "user"
                      ? "bg-violet-600 text-white"
                      : "bg-muted"
                  )}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  {msg.role === "assistant" && (
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {msg.citedPages && (
                        <Badge variant="secondary" className="text-xs">
                          <BookOpen className="mr-1 h-3 w-3" />
                          পাতা: {msg.citedPages}
                        </Badge>
                      )}
                      <TextToSpeechButton text={msg.content} />
                    </div>
                  )}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-muted px-4 py-2.5">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="flex gap-2 border-t pt-3">
            <VoiceInputButton
              onResult={(transcript) => setInput((prev) => (prev ? `${prev} ${transcript}` : transcript))}
              disabled={sending}
            />
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="এই PDF নিয়ে প্রশ্ন করো বা 🎤 বাটনে কথা বলো..."
              aria-label="PDF নিয়ে প্রশ্ন লেখো"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void handleSend();
                }
              }}
              disabled={sending}
            />
            <Button onClick={handleSend} disabled={!input.trim() || sending} aria-label="পাঠাও">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
