"use client";

// ===================================================================
// Bookmark Button — টপিক সেভ/আনসেভ করার টগল বাটন
// ===================================================================
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Bookmark, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function BookmarkButton({ topicId }: { topicId: string }) {
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    async function loadStatus() {
      try {
        const res = await fetch(`/api/bookmarks/${topicId}`);
        const data = await res.json();
        setBookmarked(!!data.bookmarked);
      } catch {
        // silent fail
      } finally {
        setLoading(false);
      }
    }
    void loadStatus();
  }, [topicId]);

  async function toggle() {
    setToggling(true);
    try {
      if (bookmarked) {
        await fetch(`/api/bookmarks/${topicId}`, { method: "DELETE" });
        setBookmarked(false);
        toast.success("সেভ করা টপিক থেকে সরানো হয়েছে");
      } else {
        await fetch("/api/bookmarks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topicId }),
        });
        setBookmarked(true);
        toast.success("টপিকটি সেভ করা হয়েছে! পরে পড়ার জন্য দেখো");
      }
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setToggling(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggle}
      disabled={loading || toggling}
      className="gap-1.5"
    >
      {loading || toggling ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Bookmark
          className={cn(
            "h-3.5 w-3.5",
            bookmarked && "fill-primary text-primary"
          )}
        />
      )}
      {bookmarked ? "সেভ করা আছে" : "সেভ করো"}
    </Button>
  );
}
