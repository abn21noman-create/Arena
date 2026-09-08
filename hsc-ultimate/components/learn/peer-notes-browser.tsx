"use client";

// ===================================================================
// Peer Note Sharing — একটা টপিকের সহপাঠীদের শেয়ার করা নোট দেখা
// -------------------------------------------------------------------
// components/flashcards/discover-deck-browser.tsx এর একই "Discover"
// প্যাটার্ন অনুসরণ করা হয়েছে (fetch on mount, card list, popularity
// signal অনুযায়ী sort — এখানে helpfulCount)।
// ===================================================================
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Users, ThumbsUp, User2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PeerNote {
  id: string;
  content: string;
  helpfulCount: number;
  authorName: string;
  isOwnNote: boolean;
  hasVoted: boolean;
  updatedAt: string;
}

export function PeerNotesBrowser({ topicId }: { topicId: string }) {
  const [notes, setNotes] = useState<PeerNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [votingId, setVotingId] = useState<string | null>(null);

  async function loadNotes() {
    setLoading(true);
    try {
      const res = await fetch(`/api/notes/${topicId}/peer`);
      const data = await res.json();
      setNotes(data.notes ?? []);
    } catch {
      // silent fail — এটা একটা secondary/ঐচ্ছিক ফিচার, error toast দিয়ে
      // মূল Topic Detail পেজের UX নষ্ট করার দরকার নেই
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicId]);

  async function handleVote(noteId: string) {
    setVotingId(noteId);
    try {
      const res = await fetch(`/api/notes/peer/${noteId}/helpful`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "ভোট দেওয়া যায়নি");
        return;
      }
      setNotes((prev) =>
        prev.map((n) =>
          n.id === noteId ? { ...n, hasVoted: data.voted, helpfulCount: data.helpfulCount } : n
        )
      );
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setVotingId(null);
    }
  }

  if (loading) {
    return (
      <Card className="p-5 mb-6">
        <div className="flex justify-center py-4">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      </Card>
    );
  }

  if (notes.length === 0) {
    return null; // কোনো শেয়ার করা নোট না থাকলে সেকশনই দেখানো হয় না
  }

  return (
    <Card className="p-5 mb-6">
      <h2 className="font-semibold text-sm text-muted-foreground flex items-center gap-1.5 mb-3">
        <Users className="h-3.5 w-3.5" />
        Peer Notes — সহপাঠীদের নোট ({notes.length})
      </h2>
      <div className="space-y-3">
        {notes.map((note) => (
          <div key={note.id} className="p-3 rounded-lg border bg-muted/20">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <User2 className="h-3 w-3" />
                {note.isOwnNote ? "তোমার নোট" : note.authorName}
              </span>
              {!note.isOwnNote && (
                <Button
                  size="sm"
                  variant={note.hasVoted ? "secondary" : "ghost"}
                  className="h-6 px-2 gap-1 text-xs"
                  onClick={() => handleVote(note.id)}
                  disabled={votingId === note.id}
                >
                  {votingId === note.id ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <ThumbsUp className={cn("h-3 w-3", note.hasVoted && "fill-current")} />
                  )}
                  {note.helpfulCount}
                </Button>
              )}
              {note.isOwnNote && note.helpfulCount > 0 && (
                <span className="text-xs text-violet-600 dark:text-violet-400 flex items-center gap-1">
                  <ThumbsUp className="h-3 w-3" />
                  {note.helpfulCount}টা উপকারী ভোট
                </span>
              )}
            </div>
            <p className="text-sm whitespace-pre-wrap">{note.content}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
