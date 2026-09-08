"use client";

// ===================================================================
// Topic Note Editor — প্রতিটা টপিকে নিজের নোট লেখার জায়গা
// -------------------------------------------------------------------
// Debounced auto-save না করে সহজ "সেভ করো" বাটন ব্যবহার করা হয়েছে,
// যাতে আচমকা নেটওয়ার্ক কল না হয়ে predictable UX থাকে।
// -------------------------------------------------------------------
// Note-to-Flashcard ফিচার (RemNote-অনুপ্রাণিত, FEATURE_RESEARCH.md এ
// চিহ্নিত গ্যাপ পূরণ): সেভ করা নোট থেকে এক-ক্লিকে AI দিয়ে ফ্ল্যাশকার্ড
// বানানো যায় — নোটের নামে নতুন ডেক অটো-তৈরি হয়ে যায়।
// ===================================================================
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { useUnsavedChangesWarning } from "@/hooks/use-unsaved-changes-warning";
import { StickyNote, Loader2, Save, Trash2, Sparkles, ArrowRight, Share2, Users } from "lucide-react";

interface GeneratedDeckInfo {
  id: string;
  name: string;
  count: number;
}

export function TopicNoteEditor({ topicId }: { topicId: string }) {
  const [content, setContent] = useState("");
  const [savedContent, setSavedContent] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedDeck, setGeneratedDeck] = useState<GeneratedDeckInfo | null>(null);

  useEffect(() => {
    async function loadNote() {
      try {
        const res = await fetch(`/api/notes/${topicId}`);
        const data = await res.json();
        const text = data.note?.content ?? "";
        setContent(text);
        setSavedContent(text);
        setIsPublic(!!data.note?.isPublic);
      } catch {
        // silent fail
      } finally {
        setLoading(false);
      }
    }
    void loadNote();
    setGeneratedDeck(null); // অন্য টপিকে গেলে আগের সেশনের ডেক-রেফারেন্স রিসেট
  }, [topicId]);

  const hasChanges = content !== savedContent;
  const MIN_LENGTH_FOR_FLASHCARDS = 30;

  // ট্যাব বন্ধ/রিফ্রেশ করার আগে সতর্ক করা যদি সেভ না করা পরিবর্তন থাকে
  useUnsavedChangesWarning(hasChanges);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/notes/${topicId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (!res.ok) {
        toast.error("নোট সেভ করা যায়নি");
        return;
      }

      setSavedContent(content);
      toast.success("নোট সেভ হয়েছে!");
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setSaving(true);
    try {
      await fetch(`/api/notes/${topicId}`, { method: "DELETE" });
      setContent("");
      setSavedContent("");
      setIsPublic(false);
      setGeneratedDeck(null);
      toast.success("নোট মুছে ফেলা হয়েছে");
    } finally {
      setSaving(false);
    }
  }

  // Peer Note Sharing — নিজের নোট পাবলিশ/আনপাবলিশ টগল (সহপাঠীদের সাথে শেয়ার)
  async function handleTogglePublish() {
    const nextValue = !isPublic;
    setPublishing(true);
    try {
      const res = await fetch(`/api/notes/${topicId}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic: nextValue }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "শেয়ার করা যায়নি");
        return;
      }
      setIsPublic(nextValue);
      toast.success(
        nextValue
          ? "🎉 তোমার নোট এখন সবাই দেখতে পাবে (Peer Notes এ)!"
          : "নোট আনশেয়ার করা হয়েছে, শুধু তুমি দেখতে পাবে"
      );
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setPublishing(false);
    }
  }

  async function handleGenerateFlashcards() {
    setGenerating(true);
    try {
      const res = await fetch(`/api/notes/${topicId}/to-flashcards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // ইতিমধ্যে এই সেশনে একবার জেনারেট করা থাকলে সেই একই ডেকে যোগ করা
        // হয় (বারবার ক্লিক করলে ডুপ্লিকেট ডেক তৈরি এড়াতে)
        body: JSON.stringify(generatedDeck ? { deckId: generatedDeck.id } : {}),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "ফ্ল্যাশকার্ড তৈরি করা যায়নি");
        return;
      }

      toast.success(`🎉 AI তোমার নোট থেকে ${data.count}টি ফ্ল্যাশকার্ড বানিয়েছে!`);
      setGeneratedDeck((prev) => ({
        id: data.deck.id,
        name: data.deck.name,
        count: (prev && prev.id === data.deck.id ? prev.count : 0) + data.count,
      }));
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-semibold text-sm text-muted-foreground flex items-center gap-1.5">
          <StickyNote className="h-3.5 w-3.5" />
          আমার নোট
        </h2>
        {savedContent && (
          <button
            onClick={handleDelete}
            disabled={saving}
            className="text-xs text-destructive hover:underline flex items-center gap-1"
          >
            <Trash2 className="h-3 w-3" />
            মুছে ফেলো
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="এই টপিক সম্পর্কে নিজের ভাষায় নোট লিখো... (যেমন মনে রাখার টিপস, গুরুত্বপূর্ণ পয়েন্ট)"
            aria-label="টপিকের নোট"
            className="min-h-24 mb-3"
          />
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!hasChanges || saving}
              className="gap-1.5"
            >
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              নোট সেভ করো
            </Button>

            {savedContent.length >= MIN_LENGTH_FOR_FLASHCARDS && !hasChanges && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleGenerateFlashcards}
                disabled={generating}
                className="gap-1.5"
              >
                {generating ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
                {generating ? "তৈরি হচ্ছে..." : "AI দিয়ে ফ্ল্যাশকার্ড বানাও"}
              </Button>
            )}

            {/* Peer Note Sharing — শুধু নোট সেভ করা থাকলে ও কোনো unsaved
                পরিবর্তন না থাকলে শেয়ার বাটন দেখানো হয় */}
            {savedContent.trim() && !hasChanges && (
              <Button
                size="sm"
                variant={isPublic ? "secondary" : "outline"}
                onClick={handleTogglePublish}
                disabled={publishing}
                className="gap-1.5"
              >
                {publishing ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : isPublic ? (
                  <Users className="h-3.5 w-3.5" />
                ) : (
                  <Share2 className="h-3.5 w-3.5" />
                )}
                {isPublic ? "শেয়ার করা আছে ✓" : "সহপাঠীদের সাথে শেয়ার করো"}
              </Button>
            )}
          </div>

          {isPublic && (
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <Users className="h-3 w-3" />
              তোমার নোট এখন এই টপিকের &ldquo;Peer Notes&rdquo; সেকশনে সবাই
              দেখতে পাবে
            </p>
          )}

          {hasChanges && savedContent.length >= MIN_LENGTH_FOR_FLASHCARDS && (
            <p className="text-xs text-muted-foreground mt-2">
              ফ্ল্যাশকার্ড বানানোর আগে নোটটা সেভ করে নাও
            </p>
          )}

          {generatedDeck && (
            <Alert variant="success" className="mt-3">
              <Sparkles className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between gap-2 text-xs text-violet-700 dark:text-violet-400">
                <span>
                  🎉 &ldquo;{generatedDeck.name}&rdquo; ডেকে {generatedDeck.count}টি নতুন কার্ড যোগ হয়েছে
                </span>
                <Link
                  href={`/flashcards/${generatedDeck.id}`}
                  className="font-medium hover:underline flex items-center gap-1 shrink-0"
                >
                  দেখো
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </AlertDescription>
            </Alert>
          )}
        </>
      )}
    </div>
  );
}
