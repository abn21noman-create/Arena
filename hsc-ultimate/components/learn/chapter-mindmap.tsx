"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Network, Sparkles, Search, Layers, ChevronRight, Zap, Info, Compass } from "lucide-react";
import { sfx } from "@/lib/sound-effects";
import { cn } from "@/lib/utils";

interface MindmapNode {
  id: string;
  titleBn: string;
  category: string;
  formula: string;
  summary: string;
  connections: string[];
  boardImportance: "⭐⭐⭐" | "⭐⭐" | "⭐";
}

const MINDMAP_DATA: Record<string, { title: string; nodes: MindmapNode[] }> = {
  physics: {
    title: "পদার্থবিজ্ঞান: নিউটনীয় বলবিদ্যা ও গতিবিদ্যা",
    nodes: [
      {
        id: "p1",
        titleBn: "নিউটনের গতিসূত্র ও ভরবেগ",
        category: "বলবিদ্যা ভিত্তি",
        formula: "F = dp/dt = ma, p = mv",
        summary: "বস্তুর ভরবেগের পরিবর্তনের হার প্রযুক্ত বলের সমানুপাতিক। ক্রিয়া ও প্রতিক্রিয়া বল পরস্পর সমান ও বিপরীতমুখী।",
        connections: ["p2", "p3"],
        boardImportance: "⭐⭐⭐",
      },
      {
        id: "p2",
        titleBn: "ভরবেগের সংরক্ষণশীলতা ও রকেটের গতি",
        category: "প্রয়োগ",
        formula: "m₁u₁ + m₂u₂ = m₁v₁ + m₂v₂, a = (v_rel/m)(-dm/dt) - g",
        summary: "বাহ্যিক বল শূন্য হলে কোনো ব্যবস্থার মোট রৈখিক ভরবেগ সংরক্ষিত থাকে। রকেটের ভর হ্রাসের কারণে ঊর্ধ্বমুখী ত্বরণ সৃষ্টি হয়।",
        connections: ["p1", "p4"],
        boardImportance: "⭐⭐⭐",
      },
      {
        id: "p3",
        titleBn: "জড়তার ভ্রামক ও চক্রগতির ব্যাসার্ধ",
        category: "ঘূর্ণন গতি",
        formula: "I = ∑mr² = Mk², L = Iω, τ = Iα",
        summary: "ঘূর্ণনরত কণার ভর ও ঘূর্ণন অক্ষ থেকে দূরত্বের বর্গের গুণফল। নিরেট গোলকের I = (2/5)MR²।",
        connections: ["p1", "p5"],
        boardImportance: "⭐⭐⭐",
      },
      {
        id: "p4",
        titleBn: "রাস্তার ব্যাংকিং ও কেন্দ্রমুখী বল",
        category: "বৃত্তীয় গতি",
        formula: "tan θ = v² / (rg), F_c = mv² / r",
        summary: "মোড় ঘোরার সময় কেন্দ্রবিমুখী বলের বিপরীতে নিরাপদে গাড়ি চালানোর জন্য রাস্তার বাইরের অংশকে সামান্য উঁচু করা হয়।",
        connections: ["p2"],
        boardImportance: "⭐⭐⭐",
      },
      {
        id: "p5",
        titleBn: "কৌণিক ভরবেগের সংরক্ষণশীলতা",
        category: "ঘূর্ণন গতি",
        formula: "I₁ω₁ = I₂ω₂",
        summary: "বহিঃস্থ টর্ক শূন্য হলে ব্যবস্থার মোট কৌণিক ভরবেগ ধ্রুব থাকে (যেমন: ডাইভারের হাত-পা গোটানো)।",
        connections: ["p3"],
        boardImportance: "⭐⭐",
      },
    ],
  },
  math: {
    title: "উচ্চতর গণিত: অন্তরীকরণ ও যোগজীকরণ",
    nodes: [
      {
        id: "m1",
        titleBn: "লিমিট ও মূল নিয়মে অন্তরজ",
        category: "ক্যালকুলাস ভিত্তি",
        formula: "f'(x) = lim(h→0) [f(x+h) - f(x)] / h",
        summary: "অন্তরীকরণের মৌলিক ভিত্তি। ত্রিকোণমিতিক ও সূচকীয় ফাংশনের প্রথম অন্তরজ নির্ণয়।",
        connections: ["m2", "m3"],
        boardImportance: "⭐⭐⭐",
      },
      {
        id: "m2",
        titleBn: "স্পর্শক ও অভিলম্বের সমীকরণ",
        category: "জ্যামিতিক প্রয়োগ",
        formula: "y - y₁ = m(x - x₁), যেখানে m = (dy/dx)|_(x₁,y₁)",
        summary: "বক্ররেখার যেকোনো বিন্দুতে ঢাল dy/dx। অভিলম্বের ঢাল m' = -1/m।",
        connections: ["m1", "m4"],
        boardImportance: "⭐⭐⭐",
      },
      {
        id: "m3",
        titleBn: "গুরুমান ও লঘুমান (Max / Min)",
        category: "চরম মান",
        formula: "dy/dx = 0; d²y/dx² < 0 (গুরুমান), d²y/dx² > 0 (লঘুমান)",
        summary: "ফাংশনের সর্বোচ্চ ও সর্বনিম্ন বিন্দু নির্ণয়ের জন্য দ্বিতীয় অন্তরজের চিহ্ন পরীক্ষা।",
        connections: ["m1"],
        boardImportance: "⭐⭐⭐",
      },
      {
        id: "m4",
        titleBn: "নির্দিষ্ট যোগজ ও আবদ্ধ ক্ষেত্রফল",
        category: "যোগজীকরণ",
        formula: "Area = ∫[a to b] |y| dx = ∫[a to b] |f(x) - g(x)| dx",
        summary: "বক্ররেখা ও অক্ষ দ্বারা আবদ্ধ ক্ষেত্রের ক্ষেত্রফল নির্ণয়।",
        connections: ["m2"],
        boardImportance: "⭐⭐⭐",
      },
    ],
  },
  chemistry: {
    title: "রসায়ন: জৈব যৌগের রূপান্তর ও বিক্রিয়া",
    nodes: [
      {
        id: "c1",
        titleBn: "অ্যালকাইল হ্যালাইড ও নিউক্লিওফিলিক প্রতিস্থাপন",
        category: "জৈব রসায়ন",
        formula: "R-X + Nu⁻ → R-Nu + X⁻ (S_N1 / S_N2)",
        summary: "৩° অ্যালকাইল হ্যালাইড S_N1 এবং ১° অ্যালকাইল হ্যালাইড S_N2 বিক্রিয়া প্রদর্শন করে।",
        connections: ["c2", "c3"],
        boardImportance: "⭐⭐⭐",
      },
      {
        id: "c2",
        titleBn: "গ্রিগনার্ড বিকারক (R-Mg-X)",
        category: "সংশ্লেষণ",
        formula: "R-MgX + HCHO → ১° অ্যালকোহল, RCHO → ২°, RCOR → ৩°",
        summary: "কার্বন-শিকল বৃদ্ধির সবচেয়ে গুরুত্বপূর্ণ বিকারক। বুয়েট ও ঢাবি ভর্তি পরীক্ষায় বারবার আসা টপিক।",
        connections: ["c1", "c4"],
        boardImportance: "⭐⭐⭐",
      },
      {
        id: "c3",
        titleBn: "ক্যানিজারো বিকার ও অ্যালডল ঘনীভবন",
        category: "কার্বনিল যৌগ",
        formula: "2 HCHO + 50% NaOH → CH₃OH + HCOONa",
        summary: "α-হাইড্রোজেনহীন অ্যালডিহাইড ক্যানিজারো দেয়, α-হাইড্রোজেনযুক্ত অ্যালডিহাইড ক্ষারের উপস্থিতিতে অ্যালডল দেয়।",
        connections: ["c1"],
        boardImportance: "⭐⭐⭐",
      },
      {
        id: "c4",
        titleBn: "ফেনল ও বেঞ্জিন বলয় সক্রিয়কারী মূলক",
        category: "অ্যারোমেটিক",
        formula: "C₆H₅OH + 3 Br₂ (পানি) → ২,৪,৬-ট্রাইব্রোমোফেনল (সাদা অধঃক্ষেপ)",
        summary: "-OH, -NH₂ অর্থো-প্যারা নির্দেশক ও বলয় সক্রিয়কারী; -NO₂, -CHO মেটা নির্দেশক।",
        connections: ["c2"],
        boardImportance: "⭐⭐⭐",
      },
    ],
  },
};

export function ChapterMindmap() {
  const [selectedSubject, setSelectedSubject] = useState<string>("physics");
  const [activeNodeId, setActiveNodeId] = useState<string>("p1");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const currentSubjectData = MINDMAP_DATA[selectedSubject] || MINDMAP_DATA.physics;
  const activeNode = currentSubjectData.nodes.find((n) => n.id === activeNodeId) || currentSubjectData.nodes[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border shadow-xs bg-linear-to-r from-purple-500/10 via-card to-pink-500/10">
        <CardHeader className="p-4 sm:p-6 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <Network className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                  <span>চ্যাপ্টার মাইন্ড ম্যাপ ও নলেজ গ্রাফ</span>
                  <Badge variant="secondary" className="text-xs">
                    Visual Concepts
                  </Badge>
                </CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  টপিকগুলোর পারস্পরিক যোগসূত্র, প্রধান সূত্র ও বোর্ড গুরুত্ব চোখের সামনে ভিজ্যুয়ালাইজ করুন
                </p>
              </div>
            </div>

            {/* Subject Tabs */}
            <div className="flex gap-1.5 bg-muted/40 p-1.5 rounded-xl border">
              {[
                { id: "physics", label: "পদার্থবিজ্ঞান" },
                { id: "math", label: "উচ্চতর গণিত" },
                { id: "chemistry", label: "রসায়ন" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    sfx.play("click");
                    setSelectedSubject(tab.id);
                    const firstNode = MINDMAP_DATA[tab.id]?.nodes[0]?.id;
                    if (firstNode) setActiveNodeId(firstNode);
                  }}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-bold transition",
                    selectedSubject === tab.id
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Grid: Interactive Graph Nodes (Left) vs Deep Concept Card (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Nodes Grid (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">
            টপিক নোডসমূহ (ক্লিক করে বিস্তারিত দেখুন):
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentSubjectData.nodes.map((node) => {
              const isSelected = activeNodeId === node.id;

              return (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => {
                    sfx.play("pop");
                    setActiveNodeId(node.id);
                  }}
                  className={cn(
                    "rounded-2xl border p-4 text-left transition-all duration-200 cursor-pointer relative shadow-2xs",
                    isSelected
                      ? "border-purple-500 bg-purple-500/10 ring-2 ring-purple-500/30 scale-[1.02]"
                      : "bg-card hover:border-primary/40 hover:bg-muted/30"
                  )}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <Badge variant="outline" className="text-3xs font-semibold">
                      {node.category}
                    </Badge>
                    <span className="text-2xs font-mono text-amber-500" title="বোর্ড পরীক্ষায় গুরুত্ব">
                      {node.boardImportance}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-foreground mb-1">
                    {node.titleBn}
                  </h4>

                  <div className="rounded-lg bg-background/80 p-2 font-mono text-2xs font-semibold text-primary truncate border">
                    {node.formula}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Deep Concept Inspector (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border shadow-xs bg-linear-to-b from-card to-muted/20 sticky top-6">
            <CardHeader className="p-4 sm:p-5 pb-2 border-b">
              <div className="flex items-center justify-between">
                <Badge className="bg-purple-600 text-white font-bold text-xs">
                  টপিক ইনসাইট
                </Badge>
                <span className="text-xs font-mono text-muted-foreground">
                  বোর্ড গুরুত্ব: {activeNode.boardImportance}
                </span>
              </div>
              <CardTitle className="text-lg font-bold text-foreground mt-2">
                {activeNode.titleBn}
              </CardTitle>
            </CardHeader>

            <CardContent className="p-4 sm:p-5 pt-3 space-y-4">
              {/* Formula Callout */}
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-3.5 space-y-1">
                <div className="text-2xs font-bold text-primary uppercase">প্রধান সমীকরণ / বিক্রিয়া:</div>
                <div className="font-mono text-sm sm:text-base font-bold text-foreground">
                  {activeNode.formula}
                </div>
              </div>

              {/* Concept Summary */}
              <div className="space-y-1 text-xs sm:text-sm">
                <div className="font-bold text-foreground">মূল সারসংক্ষেপ:</div>
                <p className="text-muted-foreground leading-relaxed">
                  {activeNode.summary}
                </p>
              </div>

              {/* Connected Concepts */}
              <div className="space-y-2 border-t pt-3">
                <div className="text-2xs font-bold text-muted-foreground uppercase">
                  পরবর্তী সংযুক্ত টপিকসমূহ:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {activeNode.connections.map((connId) => {
                    const connNode = currentSubjectData.nodes.find((n) => n.id === connId);
                    if (!connNode) return null;
                    return (
                      <button
                        key={connId}
                        type="button"
                        onClick={() => {
                          sfx.play("pop");
                          setActiveNodeId(connId);
                        }}
                        className="rounded-lg border bg-muted/40 hover:bg-primary/10 hover:border-primary/40 px-2.5 py-1 text-2xs font-bold text-foreground transition flex items-center gap-1"
                      >
                        <span>{connNode.titleBn}</span>
                        <ChevronRight className="h-3 w-3 text-primary" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
