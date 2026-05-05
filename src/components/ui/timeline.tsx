"use client";
import {
  useScroll,
  useTransform,
  motion,
} from "motion/react";
import React, { useEffect, useRef, useState } from "react";

export interface TimelineEntry {
  title: string;
  content: React.ReactNode;
}

interface TimelineProps {
  data: TimelineEntry[];
  /** Section title rendered above the timeline. Omit to skip the header entirely. */
  title?: string;
  /** Section subtitle rendered under the title. Omit to skip. */
  subtitle?: string;
}

export const Timeline = ({ data, title, subtitle }: TimelineProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setHeight(rect.height);
    }
  }, [ref]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 10%", "end 50%"],
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  return (
    <div className="w-full font-sans md:px-10" ref={containerRef}>
      {(title || subtitle) ? (
        <div className="max-w-7xl mx-auto py-12 px-4 md:px-8 lg:px-10">
          {title ? (
            <h2 className="text-2xl md:text-4xl mb-3 text-foreground max-w-4xl font-semibold tracking-tight">
              {title}
            </h2>
          ) : null}
          {subtitle ? (
            <p className="text-muted-foreground text-sm md:text-base max-w-xl">
              {subtitle}
            </p>
          ) : null}
        </div>
      ) : null}

      <div ref={ref} className="relative max-w-7xl mx-auto pb-20">
        {data.map((item, index) => (
          <div key={item.title} className="flex justify-start pt-10 md:pt-32 md:gap-10">
            <div className="sticky flex flex-col md:flex-row z-10 items-center top-40 self-start max-w-xs lg:max-w-sm md:w-full">
              <div className="h-10 absolute start-3 md:start-3 w-10 rounded-full bg-background flex items-center justify-center ring-1 ring-border">
                <div className="h-4 w-4 rounded-full bg-brand-gold/30 border border-brand-gold p-2" />
              </div>
              <h3 className="hidden md:block text-xl md:ps-20 md:text-5xl font-bold text-brand-navy dark:text-brand-cream">
                {item.title}
              </h3>
            </div>

            <div className="relative ps-20 pe-4 md:ps-4 w-full">
              <h3 className="md:hidden block text-2xl mb-4 text-start font-bold text-brand-navy dark:text-brand-cream">
                {item.title}
              </h3>
              {item.content}
            </div>
          </div>
        ))}
        <div
          style={{ height: height + "px" }}
          className="absolute md:start-8 start-8 top-0 overflow-hidden w-[2px] bg-[linear-gradient(to_bottom,var(--tw-gradient-stops))] from-transparent from-[0%] via-border to-transparent to-[99%] [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)]"
        >
          <motion.div
            style={{ height: heightTransform, opacity: opacityTransform }}
            className="absolute inset-x-0 top-0 w-[2px] bg-gradient-to-t from-brand-gold via-brand-navy to-transparent from-[0%] via-[10%] rounded-full"
          />
        </div>
      </div>
    </div>
  );
};
