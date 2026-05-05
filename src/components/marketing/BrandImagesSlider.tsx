"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

type Props = {
  images: string[];
  /** Children render above the image with a configurable overlay. */
  children?: React.ReactNode;
  /** Tailwind class for the gradient overlay above each slide. */
  overlayClassName?: string;
  /** Autoplay interval in ms. Pass `null` to disable. */
  autoplayMs?: number | null;
  className?: string;
};

/**
 * In-house replacement for the Aceternity ImagesSlider.
 *
 * Why custom: the upstream component preloads via `new Image()` inside a
 * `useEffect(..., [])` and the render is gated on Promise.all completing.
 * In React 19 StrictMode + Turbopack HMR, the dual-mount + slow-image
 * combination caused visible reload loops. This version:
 *   - uses next/image (so we get optimization + remotePatterns enforcement)
 *   - never gates render on preload completion
 *   - cleans up its autoplay timer correctly across remounts
 *   - pauses autoplay on hover or when off-screen
 */
export function BrandImagesSlider({
  images,
  children,
  overlayClassName,
  autoplayMs = 6000,
  className,
}: Props) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inViewRef = useRef(true);

  // Autoplay — single timer, recreated only when deps change.
  useEffect(() => {
    if (autoplayMs == null || images.length <= 1) return;
    if (paused) return;
    const id = window.setInterval(() => {
      if (inViewRef.current) {
        setIndex((i) => (i + 1) % images.length);
      }
    }, autoplayMs);
    return () => window.clearInterval(id);
  }, [autoplayMs, images.length, paused]);

  // Pause autoplay when the slider is offscreen.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = entry?.isIntersecting ?? true;
      },
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className={cn("relative isolate overflow-hidden", className)}
    >
      <AnimatePresence initial={false}>
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <Image
            src={images[index]!}
            alt=""
            fill
            priority={index === 0}
            sizes="100vw"
            className="object-cover object-center"
          />
        </motion.div>
      </AnimatePresence>

      <div className={cn("absolute inset-0 z-10", overlayClassName)} />

      {/* Slide indicators — bottom center, brand gold for active. */}
      {images.length > 1 ? (
        <div className="absolute bottom-6 start-1/2 z-30 flex -translate-x-1/2 gap-2 rtl:translate-x-1/2">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === index ? "w-8 bg-brand-gold" : "w-1.5 bg-brand-cream/50 hover:bg-brand-cream/80",
              )}
            />
          ))}
        </div>
      ) : null}

      {children ? <div className="relative z-20 flex h-full items-center justify-center">{children}</div> : null}
    </div>
  );
}
