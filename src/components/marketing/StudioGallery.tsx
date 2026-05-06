"use client";

import { useCallback, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  IconChevronLeft,
  IconChevronRight,
  IconPlayerPlayFilled,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Image, ImageKitProvider } from "@imagekit/next";

export type StudioItem = {
  id: string;
  kind: "image" | "video" | "document";
  url: string;
  thumbnail?: string | null;
  caption?: string | null;
  tags?: string[];
};

type Copy = {
  previous: string;
  next: string;
  close: string;
  videoLabel: string;
};

export function StudioGallery({
  items,
  copy,
}: {
  items: StudioItem[];
  copy: Copy;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const isOpen = openIndex !== null;
  const current = openIndex !== null ? items[openIndex] : null;

  const close = useCallback(() => setOpenIndex(null), []);
  const next = useCallback(
    () => setOpenIndex((i) => (i === null ? null : (i + 1) % items.length)),
    [items.length],
  );
  const prev = useCallback(
    () =>
      setOpenIndex((i) =>
        i === null ? null : (i - 1 + items.length) % items.length,
      ),
    [items.length],
  );

  // Keyboard navigation while the lightbox is open.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, next, prev, close]);

  return (
    <>
      <div
        className={cn(
          "gap-4 [column-fill:_balance]",
          "columns-1 sm:columns-2 lg:columns-3",
        )}
      >
        {items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setOpenIndex(index)}
            className={cn(
              "group mb-4 block w-full overflow-hidden rounded-xl border border-border bg-card text-start break-inside-avoid",
              "transition-all duration-300 hover:border-brand-gold/40 hover:-translate-y-0.5",
            )}
          >
            <div className="relative">
              {item.kind === "video" ? (
                <span className="absolute inset-0 flex items-center justify-center bg-brand-navy/40">
                  <span className="flex size-14 items-center justify-center rounded-full bg-brand-gold/95 text-brand-navy shadow-xl">
                    <IconPlayerPlayFilled className="size-6 ms-0.5" />
                  </span>
                </span>
              ) : null}
              <ImageKitProvider
                urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}
              >
                <Image
                  src={item.thumbnail || item.url}
                  width={800}
                  height={600}
                  alt={item.caption ?? ""}
                  sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="h-auto w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </ImageKitProvider>
            </div>
            {item.caption ? (
              <p className="px-4 py-3 text-xs text-muted-foreground line-clamp-2">
                {item.caption}
              </p>
            ) : null}
          </button>
        ))}
      </div>

      <Dialog open={isOpen} onOpenChange={(o) => !o && close()}>
        <DialogContent className="w-[min(95vw,1100px)] md:w-[min(90vw,950px)] max-w-none p-0 bg-transparent border-0 shadow-none sm:max-w-none">
          <DialogTitle className="sr-only">
            {current?.caption ?? "Media preview"}
          </DialogTitle>
          {current ? (
            <div className="relative">
              {current.kind === "video" ? (
                <video
                  src={current.url}
                  controls
                  autoPlay
                  className="w-full max-h-[85vh] rounded-xl bg-black"
                />
              ) : (
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-black">
                  <ImageKitProvider
                    urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}
                  >
                    <Image
                      src={current.url}
                      alt={current.caption ?? ""}
                      fill
                      sizes="95vw"
                      className="object-contain"
                    />
                  </ImageKitProvider>
                </div>
              )}

              {current.caption ? (
                <p className="mt-4 px-2 text-center text-sm text-brand-cream">
                  {current.caption}
                </p>
              ) : null}

              {/* Prev / Next */}
              {items.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={prev}
                    aria-label={copy.previous}
                    className="absolute start-2 top-1/2 -translate-y-1/2 flex size-12 items-center justify-center rounded-full bg-brand-navy/85 text-brand-cream backdrop-blur hover:bg-brand-navy"
                  >
                    <IconChevronLeft className="size-5 rtl:rotate-180" />
                  </button>
                  <button
                    type="button"
                    onClick={next}
                    aria-label={copy.next}
                    className="absolute end-2 top-1/2 -translate-y-1/2 flex size-12 items-center justify-center rounded-full bg-brand-navy/85 text-brand-cream backdrop-blur hover:bg-brand-navy"
                  >
                    <IconChevronRight className="size-5 rtl:rotate-180" />
                  </button>
                </>
              ) : null}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
