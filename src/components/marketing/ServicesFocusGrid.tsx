"use client";

import { useState } from "react";
import { Link } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";
import { Image, ImageKitProvider } from "@imagekit/next";

export type ServiceCard = {
  slug: string;
  title: string;
  summary: string;
  cover: string;
};

type Props = {
  cards: ServiceCard[];
  ctaLabel: string;
};

/**
 * In-house variant of Aceternity's FocusCards.
 *  - Each card is a Link to /services/[slug]
 *  - Title is always visible in a gold-accent strip
 *  - Summary fades in on hover
 *  - Other cards blur + scale down when one is hovered
 */
export function ServicesFocusGrid({ cards, ctaLabel }: Props) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {cards.map((card, index) => {
        const isOther = hovered !== null && hovered !== index;
        return (
          <Link
            key={card.slug}
            href={`/services/${card.slug}`}
            onMouseEnter={() => setHovered(index)}
            onMouseLeave={() => setHovered(null)}
            className={cn(
              "group relative h-72 overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 ease-out md:h-96",
              isOther && "scale-[0.98] blur-[2px]",
            )}
          >
            <ImageKitProvider
              urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}
            >
              <Image
                src={card.cover}
                alt=""
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </ImageKitProvider>
            <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/60 to-transparent" />

            <div className="absolute inset-x-0 bottom-0 p-6 text-brand-cream">
              <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-brand-gold">
                {ctaLabel}
              </p>
              <h3 className="mt-2 text-xl font-semibold tracking-tight md:text-2xl">
                {card.title}
              </h3>
              <p className="mt-3 max-h-0 overflow-hidden text-sm text-brand-cream/85 opacity-0 transition-all duration-300 group-hover:max-h-32 group-hover:opacity-100">
                {card.summary}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
