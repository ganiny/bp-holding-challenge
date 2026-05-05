"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { IconDownload, IconEye, IconCalendar } from "@tabler/icons-react";

export type CertificationCard = {
  id: string;
  title: string;
  issuer: string | null;
  description: string | null;
  fileUrl: string;
  thumbnailUrl: string | null;
  issuedOn: string | null;
  expiresOn: string | null;
};

type Copy = {
  issuedLabel: string;
  expiresLabel: string;
  issuerLabel: string;
  preview: string;
  download: string;
  close: string;
};

export function CertificationsList({
  items,
  copy,
  locale,
}: {
  items: CertificationCard[];
  copy: Copy;
  locale: string;
}) {
  const [active, setActive] = useState<CertificationCard | null>(null);

  const fmt = (iso: string | null) => {
    if (!iso) return null;
    try {
      return new Intl.DateTimeFormat(locale === "ar" ? "ar-SA" : "en-GB", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(new Date(iso));
    } catch {
      return iso;
    }
  };

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <article
            key={item.id}
            className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-gold/40 hover:shadow-lg"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-brand-navy/5">
              {item.thumbnailUrl ? (
                <Image
                  src={item.thumbnailUrl}
                  alt={item.title}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs font-mono uppercase tracking-widest text-muted-foreground">
                  PDF
                </div>
              )}
            </div>

            <div className="flex flex-1 flex-col gap-3 p-5">
              <h3 className="text-base font-semibold leading-snug text-balance">
                {item.title}
              </h3>
              {item.issuer ? (
                <p className="text-xs font-mono uppercase tracking-widest text-brand-gold">
                  {item.issuer}
                </p>
              ) : null}
              {item.description ? (
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {item.description}
                </p>
              ) : null}

              {item.issuedOn || item.expiresOn ? (
                <dl className="mt-auto grid grid-cols-2 gap-2 border-t border-border pt-3 text-[11px] text-muted-foreground">
                  {item.issuedOn ? (
                    <div>
                      <dt className="font-mono uppercase tracking-widest">
                        {copy.issuedLabel}
                      </dt>
                      <dd className="mt-0.5 flex items-center gap-1 text-foreground/80">
                        <IconCalendar className="size-3" />
                        {fmt(item.issuedOn)}
                      </dd>
                    </div>
                  ) : null}
                  {item.expiresOn ? (
                    <div>
                      <dt className="font-mono uppercase tracking-widest">
                        {copy.expiresLabel}
                      </dt>
                      <dd className="mt-0.5 flex items-center gap-1 text-foreground/80">
                        <IconCalendar className="size-3" />
                        {fmt(item.expiresOn)}
                      </dd>
                    </div>
                  ) : null}
                </dl>
              ) : null}

              <div className="flex flex-wrap gap-2 pt-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setActive(item)}
                >
                  <IconEye className="size-4" />
                  {copy.preview}
                </Button>
                <Button asChild size="sm" variant="ghost">
                  <a href={item.fileUrl} download target="_blank" rel="noopener noreferrer">
                    <IconDownload className="size-4" />
                    {copy.download}
                  </a>
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <Dialog open={active !== null} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="w-[min(95vw,1100px)] md:w-[min(90vw,950px)] max-w-none p-0 sm:max-w-none">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle className="pe-8 text-balance">{active?.title}</DialogTitle>
          </DialogHeader>
          {active ? (
            <div className="px-6 pb-6">
              <div className="aspect-[4/5] w-full overflow-hidden rounded-lg border border-border bg-muted sm:aspect-[16/10]">
                <iframe
                  src={active.fileUrl}
                  title={active.title}
                  className="h-full w-full"
                />
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
                <Button asChild variant="default">
                  <a
                    href={active.fileUrl}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <IconDownload className="size-4" />
                    {copy.download}
                  </a>
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
