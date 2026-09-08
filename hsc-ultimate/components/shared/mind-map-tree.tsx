"use client";

// ===================================================================
// Mind Map Tree — AI-জেনারেটেড hierarchical concept tree রেন্ডার করার
// রিকার্সিভ কম্পোনেন্ট। কোনো ভারী graph-visualization লাইব্রেরি (D3/React
// Flow) ছাড়াই সাধারণ collapsible nested list দিয়ে বানানো হয়েছে —
// bundle size/complexity কম রাখতে।
// ===================================================================
import { useState } from "react";
import { ChevronRight, ChevronDown, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MindMapNode {
  label: string;
  children?: MindMapNode[];
}

const LEVEL_COLORS = [
  "text-violet-700 dark:text-violet-300 font-semibold",
  "text-violet-700 dark:text-violet-400 font-medium",
  "text-muted-foreground",
];

function MindMapNodeView({ node, depth }: { node: MindMapNode; depth: number }) {
  const [expanded, setExpanded] = useState(depth < 2); // root+১ম স্তর ডিফল্টে খোলা
  const hasChildren = !!node.children && node.children.length > 0;
  const colorClass = LEVEL_COLORS[Math.min(depth, LEVEL_COLORS.length - 1)];

  return (
    <div className={cn(depth > 0 && "ml-4 border-l pl-3")}>
      <button
        type="button"
        className={cn(
          "flex items-center gap-1.5 py-1.5 text-left w-full hover:opacity-80 transition-opacity",
          !hasChildren && "cursor-default"
        )}
        onClick={() => hasChildren && setExpanded((e) => !e)}
      >
        {hasChildren ? (
          expanded ? (
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          )
        ) : (
          <Circle className="h-2 w-2 shrink-0 fill-current text-muted-foreground/50" />
        )}
        <span className={cn("text-sm", colorClass)}>{node.label}</span>
      </button>
      {hasChildren && expanded && (
        <div>
          {node.children!.map((child, i) => (
            <MindMapNodeView key={i} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function MindMapTree({ mindMap }: { mindMap: MindMapNode }) {
  return (
    <div className="text-sm">
      <MindMapNodeView node={mindMap} depth={0} />
    </div>
  );
}
