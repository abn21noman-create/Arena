"use client";

import { useEffect, useCallback } from "react";

export const TRIGGER_CONFETTI_EVENT = "hsc-ultimate:trigger-confetti";

export function triggerConfetti() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(TRIGGER_CONFETTI_EVENT));
  }
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  vRotation: number;
  alpha: number;
}

const CONFETTI_COLORS = [
  "#8b5cf6", // Violet
  "#3b82f6", // Blue
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#ec4899", // Pink
  "#06b6d4", // Cyan
  "#ef4444", // Red
];

export function ConfettiCanvas() {
  const fireConfetti = useCallback(() => {
    if (typeof window === "undefined") return;

    const canvas = document.createElement("canvas");
    canvas.style.position = "fixed";
    canvas.style.inset = "0";
    canvas.style.width = "100vw";
    canvas.style.height = "100vh";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "99999";
    document.body.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      canvas.remove();
      return;
    }

    const width = (canvas.width = window.innerWidth);
    const height = (canvas.height = window.innerHeight);

    const particleCount = 120;
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: width * 0.5 + (Math.random() - 0.5) * 200,
        y: height * 0.4 + (Math.random() - 0.5) * 100,
        vx: (Math.random() - 0.5) * 18,
        vy: -Math.random() * 15 - 5,
        size: Math.random() * 8 + 4,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        rotation: Math.random() * 360,
        vRotation: (Math.random() - 0.5) * 12,
        alpha: 1,
      });
    }

    let animationFrame: number;
    let startTime = Date.now();

    function render() {
      if (!ctx) return;
      const elapsed = Date.now() - startTime;
      ctx.clearRect(0, 0, width, height);

      let alive = false;
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.45; // gravity
        p.vx *= 0.98; // friction
        p.rotation += p.vRotation;

        if (elapsed > 1800) {
          p.alpha = Math.max(0, p.alpha - 0.03);
        }

        if (p.alpha > 0 && p.y < height + 50) {
          alive = true;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.5);
          ctx.restore();
        }
      }

      if (alive && elapsed < 3500) {
        animationFrame = requestAnimationFrame(render);
      } else {
        cancelAnimationFrame(animationFrame);
        canvas.remove();
      }
    }

    render();
  }, []);

  useEffect(() => {
    window.addEventListener(TRIGGER_CONFETTI_EVENT, fireConfetti);
    return () => window.removeEventListener(TRIGGER_CONFETTI_EVENT, fireConfetti);
  }, [fireConfetti]);

  return null;
}
