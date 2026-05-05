"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
};

type Props = {
  /** CSS colors for particles. Defaults to navy + gold + lighter navy. */
  colors?: string[];
  /** Particle count. Defaults to 60. */
  particleCount?: number;
  /** Pixel distance under which to draw connecting lines. Defaults to 140. */
  connectionDistance?: number;
  /** Canvas opacity. Defaults to 0.15 — keep it subtle behind content. */
  opacity?: number;
  /**
   * Position strategy:
   *   "absolute" (default) — fills its parent (parent must be `relative` and clip overflow)
   *   "fixed"             — covers the viewport (use sparingly; we recommend scoped surfaces)
   */
  position?: "absolute" | "fixed";
  className?: string;
};

const BRAND_DEFAULTS = ["#052a42", "#df9a13", "#0a3a5c"];

export function ParticleField({
  colors = BRAND_DEFAULTS,
  particleCount = 60,
  connectionDistance = 140,
  opacity = 0.15,
  position = "absolute",
  className,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Honor user preference for reduced motion.
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const sizeCanvas = () => {
      const parent = canvas.parentElement;
      const w = position === "fixed" ? window.innerWidth : (parent?.clientWidth ?? 0);
      const h = position === "fixed" ? window.innerHeight : (parent?.clientHeight ?? 0);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return { w, h };
    };

    let { w, h } = sizeCanvas();

    const particles: Particle[] = Array.from({ length: particleCount }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      radius: Math.random() * 1.6 + 0.6,
      color: colors[Math.floor(Math.random() * colors.length)]!,
    }));

    let raf = 0;
    let inView = true;

    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry?.isIntersecting ?? true;
        if (inView && !raf && !reducedMotion) raf = requestAnimationFrame(tick);
      },
      { threshold: 0 },
    );
    observer.observe(canvas);

    const onResize = () => {
      const next = sizeCanvas();
      w = next.w;
      h = next.h;
      // Snap any out-of-bounds particles back inside.
      for (const p of particles) {
        if (p.x > w) p.x = w;
        if (p.y > h) p.y = h;
      }
    };
    window.addEventListener("resize", onResize);

    const drawStatic = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      }
    };

    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]!;
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        else if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        else if (p.y > h) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const o = particles[j]!;
          const dx = p.x - o.x;
          const dy = p.y - o.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < connectionDistance) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(o.x, o.y);
            ctx.strokeStyle = p.color;
            ctx.globalAlpha = (1 - dist / connectionDistance) * 0.45;
            ctx.lineWidth = 0.45;
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
      }
      raf = inView ? requestAnimationFrame(tick) : 0;
    };

    if (reducedMotion) {
      drawStatic();
    } else {
      raf = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      observer.disconnect();
    };
  }, [colors, particleCount, connectionDistance, position]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn(
        "pointer-events-none",
        position === "fixed" ? "fixed inset-0 z-0" : "absolute inset-0",
        className,
      )}
      style={{ opacity }}
    />
  );
}
