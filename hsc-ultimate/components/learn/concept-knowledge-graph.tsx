"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  GitBranch,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Lock,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import { sfx } from "@/lib/sound-effects";
import { cn } from "@/lib/utils";

interface ConceptNode {
  id: string;
  subject: string;
  title: string;
  chapter: string;
  x: number;
  y: number;
  prerequisites: string[]; // parent node ids
  status: "mastered" | "in_progress" | "weak" | "locked";
  masteryPct: number;
  coreConcepts: string[];
  remediationAdvice: string;
}

const NODES_DATA: ConceptNode[] = [
  {
    id: "phys-vec",
    subject: "পদার্থবিজ্ঞান",
    title: "ভেক্টর ও স্থানাঙ্ক জ্যামিতি",
    chapter: "১ম পত্র: ২য় অধ্যায়",
    x: 100,
    y: 140,
    prerequisites: [],
    status: "mastered",
    masteryPct: 95,
    coreConcepts: ["ডট ও ক্রস গুণন", "নদী-নৌকা সমস্যা", "লব্ধির সামান্তরিক সূত্র"],
    remediationAdvice: "ভেক্টর অংশটি সম্পূর্ণ পরিষ্কার। বলবিদ্যায় এগিয়ে যান।",
  },
  {
    id: "phys-newton",
    subject: "পদার্থবিজ্ঞান",
    title: "নিউটনিয়ান বলবিদ্যা ও ঘাত বল",
    chapter: "১ম পত্র: ৪র্থ অধ্যায়",
    x: 280,
    y: 140,
    prerequisites: ["phys-vec"],
    status: "in_progress",
    masteryPct: 70,
    coreConcepts: ["জড়তার ভ্রামক", "কৌণিক ভরবেগ সংরক্ষণ", "ব্যাংকিং কোণ"],
    remediationAdvice: "জড়তার ভ্রামকের সমান্তরাল ও লম্ব অক্ষ উপপাদ্যটি আরেকবার রিভিশন দিন।",
  },
  {
    id: "phys-work",
    subject: "পদার্থবিজ্ঞান",
    title: "কাজ, শক্তি ও স্প্রিং ক্ষমতা",
    chapter: "১ম পত্র: ৫ম অধ্যায়",
    x: 460,
    y: 100,
    prerequisites: ["phys-newton"],
    status: "weak",
    masteryPct: 35,
    coreConcepts: ["পরিবর্তনশীল বল দ্বারা কাজ", "স্প্রিং এর বিভবশক্তি", "কর্মদক্ষতা ও কুয়ার ম্যাথ"],
    remediationAdvice: "কুয়া খালি করার গড় গভীরতা ও পানির ভর হিসাবের নিয়ম ভালোভাবে লক্ষ্য করুন।",
  },
  {
    id: "phys-grav",
    subject: "পদার্থবিজ্ঞান",
    title: "মহাকর্ষ ও উপগ্রহের বেগ",
    chapter: "১ম পত্র: ৬ষ্ঠ অধ্যায়",
    x: 460,
    y: 220,
    prerequisites: ["phys-newton"],
    status: "in_progress",
    masteryPct: 65,
    coreConcepts: ["কেপলারের সূত্র", "মুক্তিবেগ", "ভূ-স্থির উপগ্রহের শর্ত"],
    remediationAdvice: "ভূ-পৃষ্ঠ থেকে গভীরতায় g-এর হ্রাস পাওয়ার গ্রাফ ও সমীকরণ অনুশীলন করুন।",
  },
  {
    id: "chem-quant",
    subject: "রসায়ন",
    title: "গুণগত রসায়ন ও কোয়ান্টাম সংখ্যা",
    chapter: "১ম পত্র: ২য় অধ্যায়",
    x: 100,
    y: 320,
    prerequisites: [],
    status: "mastered",
    masteryPct: 90,
    coreConcepts: ["বোর পরমাণু মডেল", "আউফবাউ ও হুন্ডের নীতি", "দ্রাব্যতা ও Ksp"],
    remediationAdvice: "দ্রাব্যতার গুণফল ও সাধারণ আয়ন প্রভাবের গাণিতিক সমস্যা আয়ত্তে আছে।",
  },
  {
    id: "chem-eq",
    subject: "রসায়ন",
    title: "রাসায়নিক পরিবর্তন ও সাম্যাবস্থা",
    chapter: "১ম পত্র: ৪র্থ অধ্যায়",
    x: 280,
    y: 320,
    prerequisites: ["chem-quant"],
    status: "in_progress",
    masteryPct: 75,
    coreConcepts: ["Kp ও Kc সম্পর্ক", "লা-শাতেলিয়ার নীতি", "বাফার দ্রবণ ও pH"],
    remediationAdvice: "হেন্ডারসন-হ্যাসেলবাল্ক সমীকরণ ব্যবহার করে অম্লীয় বাফারের pH হিসাব প্র্যাকটিস করুন।",
  },
];

export function ConceptKnowledgeGraph() {
  const [selectedNode, setSelectedNode] = useState<ConceptNode>(NODES_DATA[2]); // default weak node
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const displayW = 600;
    const displayH = 400;

    canvas.width = displayW * dpr;
    canvas.height = displayH * dpr;
    ctx.scale(dpr, dpr);

    // Clear
    ctx.fillStyle = "#090d16";
    ctx.fillRect(0, 0, displayW, displayH);

    // Draw dependency edges
    NODES_DATA.forEach((node) => {
      node.prerequisites.forEach((parentKey) => {
        const parent = NODES_DATA.find((n) => n.id === parentKey);
        if (!parent) return;

        ctx.strokeStyle = node.id === selectedNode.id ? "#3b82f6" : "rgba(100, 116, 139, 0.4)";
        ctx.lineWidth = node.id === selectedNode.id ? 2.5 : 1.5;
        ctx.setLineDash(node.id === selectedNode.id ? [] : [4, 4]);

        ctx.beginPath();
        ctx.moveTo(parent.x, parent.y);
        ctx.lineTo(node.x, node.y);
        ctx.stroke();
        ctx.setLineDash([]);
      });
    });

    // Draw Nodes
    NODES_DATA.forEach((node) => {
      const isSelected = node.id === selectedNode.id;

      // Outer glow
      if (isSelected) {
        ctx.fillStyle = "rgba(59, 130, 246, 0.3)";
        ctx.beginPath();
        ctx.arc(node.x, node.y, 22, 0, Math.PI * 2);
        ctx.fill();
      }

      // Node Circle
      ctx.fillStyle =
        node.status === "mastered"
          ? "#10b981"
          : node.status === "in_progress"
          ? "#f59e0b"
          : node.status === "weak"
          ? "#ef4444"
          : "#64748b";

      ctx.beginPath();
      ctx.arc(node.x, node.y, 14, 0, Math.PI * 2);
      ctx.fill();

      // Border
      ctx.strokeStyle = isSelected ? "#ffffff" : "#1e293b";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Node Title Label
      ctx.fillStyle = isSelected ? "#ffffff" : "#cbd5e1";
      ctx.font = isSelected ? "bold 11px sans-serif" : "10px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(node.title.split(" ")[0], node.x, node.y + 28);
    });
  }, [selectedNode]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Find closest node within 25px
    const clicked = NODES_DATA.find(
      (n) => Math.hypot(n.x - clickX, n.y - clickY) < 28
    );

    if (clicked) {
      sfx.play("pop");
      setSelectedNode(clicked);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border shadow-xs bg-linear-to-r from-blue-500/10 via-card to-emerald-500/10">
        <CardHeader className="p-4 sm:p-6 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <GitBranch className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                  <span>কনসেপ্ট ডিপেন্ডেন্সি নলেজ গ্রাফ ও স্কিল ট্রি</span>
                  <Badge variant="secondary" className="text-xs">
                    Neural Skill Map V3.0
                  </Badge>
                </CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  সিলেবাসের আন্তঃসম্পর্কিত অধ্যায়সমূহ এবং দুর্বলতার মূল কারণ (Root-cause) ভিজ্যুয়াল নোড ম্যাপিং
                </p>
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-3 text-2xs font-bold">
              <span className="flex items-center gap-1 text-emerald-500">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> আয়ত্তে (৯০%+)
              </span>
              <span className="flex items-center gap-1 text-amber-500">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> চলমান (৬০%+)
              </span>
              <span className="flex items-center gap-1 text-rose-500">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500" /> দুর্বলতা চিহ্নিত
              </span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Knowledge Graph Canvas (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <Card className="border shadow-xs overflow-hidden bg-slate-950 p-2">
            <div className="p-2 text-2xs font-mono text-muted-foreground flex justify-between">
              <span>CONCEPT DEPENDENCY DAG [CLICK ANY NODE TO INSPECT]</span>
              <span className="text-primary font-bold">নির্বাচিত: {selectedNode.title}</span>
            </div>
            <canvas
              ref={canvasRef}
              width={600}
              height={400}
              onClick={handleCanvasClick}
              className="w-full h-auto block aspect-[600/400] cursor-pointer"
            />
          </Card>
        </div>

        {/* Selected Node Details & Root-Cause Remediation (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border shadow-2xs p-5 space-y-4 bg-card">
            <div className="flex items-center justify-between border-b pb-2">
              <Badge variant="outline" className="text-3xs font-semibold">
                {selectedNode.chapter}
              </Badge>
              <Badge
                className={cn(
                  "text-3xs font-bold",
                  selectedNode.status === "mastered" && "bg-emerald-600 text-white",
                  selectedNode.status === "in_progress" && "bg-amber-500 text-slate-950",
                  selectedNode.status === "weak" && "bg-rose-600 text-white"
                )}
              >
                দক্ষতা স্কোর: {selectedNode.masteryPct}%
              </Badge>
            </div>

            <h3 className="font-bold text-base text-foreground">
              {selectedNode.title}
            </h3>

            {/* Core Concepts */}
            <div className="space-y-1.5">
              <span className="text-2xs font-bold text-muted-foreground uppercase tracking-wider">
                মূল ধারণা ও উপ-টপিকসমূহ:
              </span>
              <div className="space-y-1">
                {selectedNode.coreConcepts.map((concept, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-muted/20 border text-xs font-semibold">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                    <span>{concept}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Root-cause Remediation Box */}
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 space-y-1.5 text-2xs">
              <div className="font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4" />
                <span>দুর্বলতা দূরীকরণ প্রেসক্রিপশন:</span>
              </div>
              <p className="text-foreground leading-relaxed">
                {selectedNode.remediationAdvice}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
