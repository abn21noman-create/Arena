"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Atom,
  Rotate3d,
  Sparkles,
  Layers,
  Info,
  Maximize2,
  Eye,
} from "lucide-react";
import { sfx } from "@/lib/sound-effects";
import { cn } from "@/lib/utils";

interface Atom3D {
  element: string;
  x: number;
  y: number;
  z: number;
  color: string;
  radius: number;
}

interface Bond3D {
  fromIdx: number;
  toIdx: number;
  type: "single" | "double" | "triple";
}

interface MoleculeData {
  id: string;
  name: string;
  formula: string;
  hybridization: string;
  bondAngle: string;
  geometry: string;
  vseprDescription: string;
  atoms: Atom3D[];
  bonds: Bond3D[];
}

const MOLECULES: MoleculeData[] = [
  {
    id: "ch4",
    name: "মিথেন (Methane)",
    formula: "CH4",
    hybridization: "sp³",
    bondAngle: "১০৯.৫°",
    geometry: "চতুস্তলকীয় (Tetrahedral)",
    vseprDescription: "৪টি বন্ধনজোড় ইলেকট্রন এবং ০টি মুক্তজোড়। VSEPR তত্ত্ব অনুসারে বিকর্ষণ সর্বনিম্ন রাখতে চতুস্তলকীয় জ্যামিতি গঠন করে।",
    atoms: [
      { element: "C", x: 0, y: 0, z: 0, color: "#334155", radius: 18 },
      { element: "H", x: 0, y: 60, z: 0, color: "#e2e8f0", radius: 11 },
      { element: "H", x: 56.5, y: -20, z: 0, color: "#e2e8f0", radius: 11 },
      { element: "H", x: -28.2, y: -20, z: 49, color: "#e2e8f0", radius: 11 },
      { element: "H", x: -28.2, y: -20, z: -49, color: "#e2e8f0", radius: 11 },
    ],
    bonds: [
      { fromIdx: 0, toIdx: 1, type: "single" },
      { fromIdx: 0, toIdx: 2, type: "single" },
      { fromIdx: 0, toIdx: 3, type: "single" },
      { fromIdx: 0, toIdx: 4, type: "single" },
    ],
  },
  {
    id: "nh3",
    name: "অ্যামোনিয়া (Ammonia)",
    formula: "NH3",
    hybridization: "sp³",
    bondAngle: "১০৭°",
    geometry: "ত্রিকোণাকার পিরামিডীয় (Trigonal Pyramidal)",
    vseprDescription: "৩টি বন্ধনজোড় ও ১টি মুক্তজোড় (Lone Pair) ইলেকট্রন। মুক্তজোড়-বন্ধনজোড় বিকর্ষণের কারণে কোণ ১০৯.৫° থেকে কমে ১০৭° হয়।",
    atoms: [
      { element: "N", x: 0, y: 15, z: 0, color: "#3b82f6", radius: 17 },
      { element: "H", x: 45, y: -25, z: 20, color: "#e2e8f0", radius: 11 },
      { element: "H", x: -45, y: -25, z: 20, color: "#e2e8f0", radius: 11 },
      { element: "H", x: 0, y: -25, z: -45, color: "#e2e8f0", radius: 11 },
    ],
    bonds: [
      { fromIdx: 0, toIdx: 1, type: "single" },
      { fromIdx: 0, toIdx: 2, type: "single" },
      { fromIdx: 0, toIdx: 3, type: "single" },
    ],
  },
  {
    id: "h2o",
    name: "পানি (Water)",
    formula: "H2O",
    hybridization: "sp³",
    bondAngle: "১০৪.৫°",
    geometry: "কৌণিক বা V-আকৃতি (Bent / V-shaped)",
    vseprDescription: "২টি বন্ধনজোড় ও ২টি মুক্তজোড় ইলেকট্রন। দুটি মুক্তজোড়ের তীব্র বিকর্ষণের কারণে বন্ধন কোণ ১০৪.৫°-এ নেমে আসে।",
    atoms: [
      { element: "O", x: 0, y: 10, z: 0, color: "#ef4444", radius: 18 },
      { element: "H", x: -42, y: -25, z: 0, color: "#e2e8f0", radius: 11 },
      { element: "H", x: 42, y: -25, z: 0, color: "#e2e8f0", radius: 11 },
    ],
    bonds: [
      { fromIdx: 0, toIdx: 1, type: "single" },
      { fromIdx: 0, toIdx: 2, type: "single" },
    ],
  },
  {
    id: "c6h6",
    name: "বেনজিন (Benzene)",
    formula: "C6H6",
    hybridization: "sp²",
    bondAngle: "১২০°",
    geometry: "সমতলীয় সুষম ষড়ভুজ (Planar Hexagonal)",
    vseprDescription: "প্রতিটি কার্বন পরমাণু sp² সংকরিত এবং সঞ্চরণশীল পাই (π) ইলেকট্রন মেঘ বলয়জুড়ে বিস্তৃত থাকে।",
    atoms: [
      { element: "C", x: 45 * Math.cos(0), y: 45 * Math.sin(0), z: 0, color: "#334155", radius: 14 },
      { element: "C", x: 45 * Math.cos(Math.PI / 3), y: 45 * Math.sin(Math.PI / 3), z: 0, color: "#334155", radius: 14 },
      { element: "C", x: 45 * Math.cos(2 * Math.PI / 3), y: 45 * Math.sin(2 * Math.PI / 3), z: 0, color: "#334155", radius: 14 },
      { element: "C", x: 45 * Math.cos(Math.PI), y: 45 * Math.sin(Math.PI), z: 0, color: "#334155", radius: 14 },
      { element: "C", x: 45 * Math.cos(4 * Math.PI / 3), y: 45 * Math.sin(4 * Math.PI / 3), z: 0, color: "#334155", radius: 14 },
      { element: "C", x: 45 * Math.cos(5 * Math.PI / 3), y: 45 * Math.sin(5 * Math.PI / 3), z: 0, color: "#334155", radius: 14 },
    ],
    bonds: [
      { fromIdx: 0, toIdx: 1, type: "double" },
      { fromIdx: 1, toIdx: 2, type: "single" },
      { fromIdx: 2, toIdx: 3, type: "double" },
      { fromIdx: 3, toIdx: 4, type: "single" },
      { fromIdx: 4, toIdx: 5, type: "double" },
      { fromIdx: 5, toIdx: 0, type: "single" },
    ],
  },
];

export function Molecular3DLab() {
  const [selectedMolecule, setSelectedMolecule] = useState<MoleculeData>(MOLECULES[0]);
  const [rotX, setRotX] = useState<number>(20);
  const [rotY, setRotY] = useState<number>(30);
  const [isAutoRotate, setIsAutoRotate] = useState<boolean>(true);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const lastMousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number | null>(null);

  // Auto-rotate tick
  useEffect(() => {
    let lastTime = performance.now();
    const render = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      if (isAutoRotate && !isDragging) {
        setRotY((y) => (y + 25 * dt) % 360);
      }

      drawScene();
      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  });

  const drawScene = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = 650;
    const height = 400;

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const originX = width / 2;
    const originY = height / 2;

    const radX = (rotX * Math.PI) / 180;
    const radY = (rotY * Math.PI) / 180;

    // 3D rotation transform function
    const project = (atom: Atom3D) => {
      // Rotate around Y
      const x1 = atom.x * Math.cos(radY) + atom.z * Math.sin(radY);
      const z1 = -atom.x * Math.sin(radY) + atom.z * Math.cos(radY);

      // Rotate around X
      const y2 = atom.y * Math.cos(radX) - z1 * Math.sin(radX);
      const z2 = atom.y * Math.sin(radX) + z1 * Math.cos(radX);

      // Perspective projection
      const distance = 300;
      const scale = distance / (distance + z2);

      return {
        x: originX + x1 * scale * 1.5,
        y: originY - y2 * scale * 1.5,
        z: z2,
        scale,
        element: atom.element,
        color: atom.color,
        radius: atom.radius * scale * 1.4,
      };
    };

    const projectedAtoms = selectedMolecule.atoms.map(project);

    // Draw Bonds
    selectedMolecule.bonds.forEach((bond) => {
      const p1 = projectedAtoms[bond.fromIdx];
      const p2 = projectedAtoms[bond.toIdx];

      ctx.strokeStyle = "rgba(148, 163, 184, 0.7)";
      ctx.lineWidth = bond.type === "double" ? 6 : 4;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();

      if (bond.type === "double") {
        ctx.strokeStyle = "#090d16";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
    });

    // Sort atoms by Z for painter's algorithm
    const sorted = [...projectedAtoms].sort((a, b) => a.z - b.z);

    // Draw Atoms (Spheres with 3D gradient)
    sorted.forEach((p) => {
      const grad = ctx.createRadialGradient(
        p.x - p.radius * 0.3,
        p.y - p.radius * 0.3,
        p.radius * 0.1,
        p.x,
        p.y,
        p.radius
      );
      grad.addColorStop(0, "#ffffff");
      grad.addColorStop(0.3, p.color);
      grad.addColorStop(1, "#0f172a");

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(3, p.radius), 0, Math.PI * 2);
      ctx.fill();

      // Element text label
      ctx.fillStyle = p.color === "#e2e8f0" ? "#0f172a" : "#ffffff";
      ctx.font = `bold ${Math.round(10 * p.scale)}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(p.element, p.x, p.y);
    });

    ctx.restore();
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;
    lastMousePos.current = { x: e.clientX, y: e.clientY };

    setRotY((y) => (y + dx * 0.8) % 360);
    setRotX((x) => Math.max(-80, Math.min(80, x - dy * 0.8)));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border shadow-xs bg-linear-to-r from-cyan-500/10 via-card to-blue-500/10">
        <CardHeader className="p-4 sm:p-6 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                <Atom className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                  <span>3D আণবিক গঠন ও অরবিটাল সংকরায়ন ল্যাব</span>
                  <Badge variant="secondary" className="text-xs">
                    VSEPR & Hybridization V3.0
                  </Badge>
                </CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  কার্সার দিয়ে ঘুরিয়ে অনুসমূহের চতুস্তলকীয়, পিরামিডীয় ও সমতলীয় জ্যামিতি এবং বন্ধন কোণ পর্যবেক্ষণ করুন
                </p>
              </div>
            </div>

            {/* Molecule Switcher */}
            <div className="flex gap-1.5 bg-muted/40 p-1.5 rounded-xl border">
              {MOLECULES.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    sfx.play("click");
                    setSelectedMolecule(m);
                  }}
                  className={cn(
                    "rounded-lg px-2.5 py-1 text-xs font-bold transition",
                    selectedMolecule.id === m.id
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground"
                  )}
                >
                  {m.name.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 3D Canvas Viewport (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <Card className="border shadow-xs overflow-hidden bg-slate-950">
            <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
              <span className="text-2xs font-mono text-slate-400">
                3D MOLECULAR GRAPHICS ENGINE [BALL & STICK]
              </span>
              <Button
                size="sm"
                variant="outline"
                className="h-6 text-3xs font-bold gap-1"
                onClick={() => {
                  sfx.play("pop");
                  setIsAutoRotate(!isAutoRotate);
                }}
              >
                <Rotate3d className="h-3 w-3" />
                <span>{isAutoRotate ? "ঘূর্ণন বিরতি" : "অটো-ঘূর্ণন"}</span>
              </Button>
            </div>

            <canvas
              ref={canvasRef}
              width={650}
              height={400}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="w-full h-auto block aspect-[650/400] cursor-grab active:cursor-grabbing touch-none"
            />
          </Card>
        </div>

        {/* Telemetry & VSEPR Info (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border shadow-2xs p-5 space-y-4 bg-card">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-base text-foreground">
                {selectedMolecule.name} ({selectedMolecule.formula})
              </h3>
              <Badge className="bg-cyan-600 text-white font-mono font-bold text-xs">
                {selectedMolecule.hybridization} সংকরায়ন
              </Badge>
            </div>

            {/* Geometric specs */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="rounded-xl border bg-muted/20 p-2.5">
                <div className="text-3xs text-muted-foreground uppercase font-bold">বন্ধন কোণ (Bond Angle)</div>
                <div className="text-lg font-black text-primary font-sans">{selectedMolecule.bondAngle}</div>
              </div>
              <div className="rounded-xl border bg-muted/20 p-2.5">
                <div className="text-3xs text-muted-foreground uppercase font-bold">আণবিক আকৃতি</div>
                <div className="text-xs font-bold text-foreground font-sans mt-1">{selectedMolecule.geometry}</div>
              </div>
            </div>

            {/* VSEPR explanation */}
            <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-3.5 space-y-1.5 text-2xs">
              <div className="font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4" />
                <span>VSEPR তত্ত্ব ও মুক্তজোড় বিকর্ষণ:</span>
              </div>
              <p className="text-foreground leading-relaxed">
                {selectedMolecule.vseprDescription}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
