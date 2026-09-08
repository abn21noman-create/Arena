"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  PenTool,
  Square,
  Circle,
  Minus,
  ArrowUpRight,
  Eraser,
  RotateCcw,
  Download,
  Mic,
  MicOff,
  Users,
  Grid,
  Sparkles,
  Type,
} from "lucide-react";
import { sfx } from "@/lib/sound-effects";
import { cn } from "@/lib/utils";

type ToolType = "pen" | "line" | "arrow" | "rect" | "circle" | "axes" | "eraser";

interface Point {
  x: number;
  y: number;
}

export function StudyWhiteboard() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedTool, setSelectedTool] = useState<ToolType>("pen");
  const [color, setColor] = useState<string>("#3b82f6");
  const [lineWidth, setLineWidth] = useState<number>(3);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [activePeers, setActivePeers] = useState<string[]>([
    "রাহিম (Admin)",
    "তানভীর (BUET Prep)",
    "নুসরাত (DMC Prep)",
  ]);

  // History stack for undo
  const [history, setHistory] = useState<ImageData[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Initialize blank whiteboard background
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    ctx.fillStyle = "#0f172a"; // dark slate board
    ctx.fillRect(0, 0, rect.width, rect.height);
  }, []);

  const saveState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => [...prev.slice(-10), snapshot]);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const previousState = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    ctx.putImageData(previousState, 0, 0);
    sfx.play("pop");
  };

  const handleClear = () => {
    saveState();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, rect.width, rect.height);
    sfx.play("click");
  };

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    saveState();
    setIsDrawing(true);
    const coords = getCanvasCoords(e);
    setStartPoint(coords);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (selectedTool === "pen" || selectedTool === "eraser") {
      ctx.beginPath();
      ctx.moveTo(coords.x, coords.y);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const coords = getCanvasCoords(e);

    if (selectedTool === "pen") {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = "round";
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    } else if (selectedTool === "eraser") {
      ctx.strokeStyle = "#0f172a";
      ctx.lineWidth = lineWidth * 4;
      ctx.lineCap = "round";
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPoint) return;
    setIsDrawing(false);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const endPoint = getCanvasCoords(e);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.fillStyle = color;

    if (selectedTool === "line") {
      ctx.beginPath();
      ctx.moveTo(startPoint.x, startPoint.y);
      ctx.lineTo(endPoint.x, endPoint.y);
      ctx.stroke();
    } else if (selectedTool === "arrow") {
      ctx.beginPath();
      ctx.moveTo(startPoint.x, startPoint.y);
      ctx.lineTo(endPoint.x, endPoint.y);
      ctx.stroke();
      // Arrow head
      const angle = Math.atan2(endPoint.y - startPoint.y, endPoint.x - startPoint.x);
      ctx.beginPath();
      ctx.moveTo(endPoint.x, endPoint.y);
      ctx.lineTo(endPoint.x - 12 * Math.cos(angle - Math.PI / 6), endPoint.y - 12 * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(endPoint.x - 12 * Math.cos(angle + Math.PI / 6), endPoint.y - 12 * Math.sin(angle + Math.PI / 6));
      ctx.fill();
    } else if (selectedTool === "rect") {
      ctx.strokeRect(startPoint.x, startPoint.y, endPoint.x - startPoint.x, endPoint.y - startPoint.y);
    } else if (selectedTool === "circle") {
      const radius = Math.hypot(endPoint.x - startPoint.x, endPoint.y - startPoint.y);
      ctx.beginPath();
      ctx.arc(startPoint.x, startPoint.y, radius, 0, Math.PI * 2);
      ctx.stroke();
    } else if (selectedTool === "axes") {
      // Draw Cartesian coordinate grid
      ctx.strokeStyle = "rgba(148, 163, 184, 0.5)";
      ctx.lineWidth = 1.5;
      // X-axis
      ctx.beginPath();
      ctx.moveTo(20, startPoint.y);
      ctx.lineTo(canvas.width / 2, startPoint.y);
      ctx.stroke();
      // Y-axis
      ctx.beginPath();
      ctx.moveTo(startPoint.x, 20);
      ctx.lineTo(startPoint.x, canvas.height / 2);
      ctx.stroke();
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `hsc-ultimate-whiteboard-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    sfx.play("correct");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border shadow-xs bg-linear-to-r from-blue-500/10 via-card to-purple-500/10">
        <CardHeader className="p-4 sm:p-6 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <PenTool className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                  <span>লাইভ মাল্টিপ্লেয়ার হোয়াইটবোর্ড ও ডাউট রুম</span>
                  <Badge variant="secondary" className="text-xs">
                    WebRTC Sync V3.0
                  </Badge>
                </CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  সহপাঠীদের সাথে একই ক্যানভাসে জটিল গাণিতিক সমস্যা ও চিত্র সরাসরি অঙ্কন করুন
                </p>
              </div>
            </div>

            {/* Audio State & Peer Badges */}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={isMuted ? "destructive" : "outline"}
                className="gap-2 font-bold"
                onClick={() => {
                  sfx.play("pop");
                  setIsMuted(!isMuted);
                }}
              >
                {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4 text-emerald-500" />}
                <span>{isMuted ? "মাইক্রোফোন বন্ধ" : "ভয়েস সক্রিয়"}</span>
              </Button>
              <Badge variant="outline" className="text-xs gap-1 py-1.5 px-3">
                <Users className="h-3.5 w-3.5 text-primary" />
                <span>{activePeers.length} জন উপস্থিত</span>
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Whiteboard Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Canvas & Floating Toolbar (9 cols) */}
        <div className="lg:col-span-9 space-y-3">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-2xl border bg-card shadow-xs">
            {/* Tool Selection */}
            <div className="flex flex-wrap items-center gap-1">
              {[
                { id: "pen", label: "কলম", icon: PenTool },
                { id: "line", label: "রেখা", icon: Minus },
                { id: "arrow", label: "ভেক্টর তীর", icon: ArrowUpRight },
                { id: "rect", label: "আয়তক্ষেত্র", icon: Square },
                { id: "circle", label: "বৃত্ত", icon: Circle },
                { id: "axes", label: "স্থানাঙ্ক গ্রিড", icon: Grid },
                { id: "eraser", label: "ইরেজার", icon: Eraser },
              ].map((t) => {
                const Icon = t.icon;
                const isSelected = selectedTool === t.id;
                return (
                  <Button
                    key={t.id}
                    size="sm"
                    variant={isSelected ? "default" : "ghost"}
                    className={cn("h-8 px-2.5 gap-1.5 text-2xs font-bold", isSelected && "shadow-xs")}
                    onClick={() => {
                      sfx.play("click");
                      setSelectedTool(t.id as ToolType);
                    }}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{t.label}</span>
                  </Button>
                );
              })}
            </div>

            {/* Colors */}
            <div className="flex items-center gap-1.5 border-l pl-2">
              {["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#a855f7", "#ffffff"].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    sfx.play("pop");
                    setColor(c);
                  }}
                  style={{ backgroundColor: c }}
                  className={cn(
                    "w-5 h-5 rounded-full border border-slate-700 transition",
                    color === c && "ring-2 ring-primary ring-offset-2 scale-110"
                  )}
                />
              ))}
            </div>

            {/* Actions: Undo, Clear, Save */}
            <div className="flex items-center gap-1.5 border-l pl-2">
              <Button size="sm" variant="outline" className="h-8 px-2 text-2xs" onClick={handleUndo}>
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
              <Button size="sm" variant="outline" className="h-8 px-2 text-2xs" onClick={handleClear}>
                মুছুন
              </Button>
              <Button size="sm" variant="secondary" className="h-8 px-2.5 text-2xs gap-1 font-bold" onClick={handleDownload}>
                <Download className="h-3.5 w-3.5" />
                <span>PNG সেভ</span>
              </Button>
            </div>
          </div>

          {/* Interactive HTML5 Canvas */}
          <Card className="border shadow-xs overflow-hidden bg-slate-950">
            <canvas
              ref={canvasRef}
              className="w-full h-[520px] block cursor-crosshair touch-none"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={() => setIsDrawing(false)}
            />
          </Card>
        </div>

        {/* Right Sidebar: Active Peers & Formula Stamps (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <Card className="border shadow-2xs p-4 space-y-3">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-primary" />
              <span>রুমের সহপাঠী</span>
            </CardTitle>
            <div className="space-y-2">
              {activePeers.map((peer, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-muted/20 border text-xs font-semibold">
                  <span>{peer}</span>
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
              ))}
            </div>
          </Card>

          <Card className="border shadow-2xs p-4 space-y-3">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-purple-500" />
              <span>সহজ সূত্র স্ট্যাম্প</span>
            </CardTitle>
            <div className="space-y-1.5 text-2xs font-mono">
              {[
                "$F = ma$",
                "$E_k = \\frac{1}{2}mv^2$",
                "$v = \\sqrt{\\frac{GM}{r}}$",
                "$\\int x^n dx = \\frac{x^{n+1}}{n+1}$",
                "$\\text{pH} = -\\log[H^+]$",
              ].map((f, idx) => (
                <div key={idx} className="p-2 rounded-lg bg-card border font-bold text-primary">
                  {f}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
