"use client";

import { animate, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

type Stat = { valueKey: "years" | "clients" | "sectors" | "projects"; value: number; suffix?: string };

const STATS: Stat[] = [
  { valueKey: "years", value: 5, suffix: "+" },
  { valueKey: "clients", value: 150, suffix: "+" },
  { valueKey: "sectors", value: 4 },
  { valueKey: "projects", value: 60, suffix: "+" },
];

export function StatsCounter() {
  const t = useTranslations("home.stats");

  return (
    <section className="border-y border-border bg-card/40">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
        {STATS.map((stat) => (
          <CounterTile
            key={stat.valueKey}
            value={stat.value}
            suffix={stat.suffix}
            label={t(`${stat.valueKey}Label` as "yearsLabel" | "clientsLabel" | "sectorsLabel" | "projectsLabel")}
          />
        ))}
      </div>
    </section>
  );
}

function CounterTile({ value, label, suffix }: { value: number; label: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20%" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration: 1.4,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => setDisplay(Math.floor(latest)),
    });
    return () => controls.stop();
  }, [inView, value]);

  return (
    <div className="flex flex-col items-center text-center">
      <span
        ref={ref}
        className="text-5xl font-semibold tracking-tight text-brand-navy dark:text-brand-gold"
      >
        {display}
        {suffix ?? ""}
      </span>
      <span className="mt-2 text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
    </div>
  );
}
