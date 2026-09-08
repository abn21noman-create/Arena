"use client";

// ===================================================================
// Mind Map কার্ড — Topic Detail ও PDF Chat দুই জায়গাতেই পুনর্ব্যবহারযোগ্য।
// একটা "generateUrl" prop নিয়ে সেই endpoint কল করে mind map বানায়/রিজেনারেট করে।
// ===================================================================
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MindMapTree, type MindMapNode } from "@/components/shared/mind-map-tree";
import { toast } from "sonner";
import { Network, Loader2, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";

interface MindMapCardProps {
  generateUrl: string; // যেমন `/api/topics/${topicId}/mind-map`
  initialMindMap: MindMapNode | null;
  disabled?: boolean; // যেমন নোট এখনো নেই — বাটন disable করার জন্য
  disabledMessage?: string;
}

export function MindMapCard({
  generateUrl,
  initialMindMap,
  disabled = false,
  disabledMessage,
}: MindMapCardProps) {
  const [mindMap, setMindMap] = useState<MindMapNode | null>(initialMindMap);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  async function handleGenerate(regenerate = false) {
    setLoading(true);
    try {
      const url = `${generateUrl}${regenerate ? "?regenerate=1" : ""}`;
      const res = await fetch(url, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Mind map বানানো যায়নি");
        return;
      }
      setMindMap(data.mindMap);
      setExpanded(true);
      if (!data.cached) toast.success("Mind map তৈরি হয়েছে!");
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setLoading(false);
    }
  }

  if (!mindMap) {
    return (
      <Card className="p-4 mb-3 flex items-center justify-between gap-3 bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-900">
        <div className="flex items-center gap-2 min-w-0">
          <Network className="h-5 w-5 text-violet-600 dark:text-violet-400 shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-medium">🧠 Mind Map</p>
            <p className="text-xs text-muted-foreground truncate">
              {disabled && disabledMessage ? disabledMessage : "মূল ধারণাগুলো visual tree আকারে দেখো"}
            </p>
          </div>
        </div>
        <Button
          size="sm"
          className="gap-1.5 shrink-0"
          onClick={() => handleGenerate(false)}
          disabled={loading || disabled}
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Network className="h-3.5 w-3.5" />}
          বানাও
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-4 mb-3 bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-900">
      <div className="flex items-center justify-between gap-2 mb-2">
        <button
          className="flex items-center gap-2 text-sm font-medium min-w-0"
          onClick={() => setExpanded((e) => !e)}
        >
          <Network className="h-4 w-4 text-violet-600 dark:text-violet-400 shrink-0" />
          🧠 Mind Map
          {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 shrink-0"
          onClick={() => handleGenerate(true)}
          disabled={loading}
          aria-label="নতুন করে বানাও"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
        </Button>
      </div>
      {expanded && (
        <div className="overflow-x-auto">
          <MindMapTree mindMap={mindMap} />
        </div>
      )}
    </Card>
  );
}
