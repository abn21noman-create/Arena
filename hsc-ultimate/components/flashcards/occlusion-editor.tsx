"use client";

// ===================================================================
// Image Occlusion Editor — ছবি আপলোড করে মাউস/টাচ দিয়ে বক্স আঁকা
// -------------------------------------------------------------------
// ইউজার ছবির উপর ক্লিক-ড্র্যাগ করে rectangle আঁকে, প্রতিটা rectangle
// একটা occlusion box হয়ে যায় (শতাংশ-ভিত্তিক কো-অর্ডিনেটে সংরক্ষিত)।
// ===================================================================
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import type { OcclusionBox } from "@/lib/image-occlusion";

interface DrawState {
  startX: number;
  startY: number;
  curX: number;
  curY: number;
}

export function OcclusionEditor({
  imageUrl,
  boxes,
  onBoxesChange,
}: {
  imageUrl: string;
  boxes: OcclusionBox[];
  onBoxesChange: (boxes: OcclusionBox[]) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [drawing, setDrawing] = useState<DrawState | null>(null);

  function getRelativeCoords(clientX: number, clientY: number) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
  }

  function handlePointerDown(e: React.PointerEvent) {
    const { x, y } = getRelativeCoords(e.clientX, e.clientY);
    setDrawing({ startX: x, startY: y, curX: x, curY: y });
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!drawing) return;
    const { x, y } = getRelativeCoords(e.clientX, e.clientY);
    setDrawing({ ...drawing, curX: x, curY: y });
  }

  function handlePointerUp() {
    if (!drawing) return;
    const x = Math.min(drawing.startX, drawing.curX);
    const y = Math.min(drawing.startY, drawing.curY);
    const width = Math.abs(drawing.curX - drawing.startX);
    const height = Math.abs(drawing.curY - drawing.startY);

    // খুব ছোট বক্স (ভুলবশত ক্লিক) উপেক্ষা করা হচ্ছে
    if (width > 1.5 && height > 1.5) {
      onBoxesChange([...boxes, { x, y, width, height }]);
    }
    setDrawing(null);
  }

  function removeBox(index: number) {
    onBoxesChange(boxes.filter((_, i) => i !== index));
  }

  const previewBox =
    drawing &&
    (() => {
      const x = Math.min(drawing.startX, drawing.curX);
      const y = Math.min(drawing.startY, drawing.curY);
      const width = Math.abs(drawing.curX - drawing.startX);
      const height = Math.abs(drawing.curY - drawing.startY);
      return { x, y, width, height };
    })();

  return (
    <div className="space-y-2">
      <div
        ref={containerRef}
        className="relative w-full rounded-lg overflow-hidden border select-none touch-none cursor-crosshair"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={() => setDrawing(null)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt="Occlusion সোর্স ছবি" className="w-full h-auto block pointer-events-none" draggable={false} />
        {boxes.map((box, i) => (
          <div
            key={i}
            className="absolute border-2 border-amber-600 bg-amber-500/70 group"
            style={{
              left: `${box.x}%`,
              top: `${box.y}%`,
              width: `${box.width}%`,
              height: `${box.height}%`,
            }}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeBox(i);
              }}
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity"
              aria-label="বক্স মুছে ফেলো"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        ))}
        {previewBox && (
          <div
            className="absolute border-2 border-dashed border-primary bg-primary/30"
            style={{
              left: `${previewBox.x}%`,
              top: `${previewBox.y}%`,
              width: `${previewBox.width}%`,
              height: `${previewBox.height}%`,
            }}
          />
        )}
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>ছবির উপর ক্লিক করে টেনে বক্স আঁকো ({boxes.length} টা বক্স)</span>
        {boxes.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 text-xs text-destructive hover:text-destructive"
            onClick={() => onBoxesChange([])}
          >
            সব মুছো
          </Button>
        )}
      </div>
    </div>
  );
}
