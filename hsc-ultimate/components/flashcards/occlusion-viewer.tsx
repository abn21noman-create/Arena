"use client";

// ===================================================================
// Image Occlusion Viewer — Review Runner এর ভেতরে ব্যবহৃত
// -------------------------------------------------------------------
// ছবির উপর occlusion box গুলো overlay হিসেবে দেখায়। isRevealed=false
// থাকলে বক্সগুলো solid রঙে ঢাকা থাকে, true হলে transparent/অদৃশ্য হয়ে
// আসল ছবি দেখা যায় (Anki এর reveal মেকানিজমের মতো)।
// ===================================================================
import type { OcclusionBox } from "@/lib/image-occlusion";

export function OcclusionViewer({
  imageUrl,
  boxes,
  isRevealed,
}: {
  imageUrl: string;
  boxes: OcclusionBox[];
  isRevealed: boolean;
}) {
  return (
    <div className="relative w-full rounded-lg overflow-hidden border bg-muted/20">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imageUrl} alt="Occlusion flashcard" className="w-full h-auto block" />
      {boxes.map((box, i) => (
        <div
          key={i}
          className="absolute border-2 transition-opacity duration-300"
          style={{
            left: `${box.x}%`,
            top: `${box.y}%`,
            width: `${box.width}%`,
            height: `${box.height}%`,
            backgroundColor: isRevealed ? "transparent" : "#f59e0b",
            borderColor: isRevealed ? "transparent" : "#d97706",
            opacity: isRevealed ? 0 : 0.95,
            pointerEvents: "none",
          }}
        />
      ))}
    </div>
  );
}
