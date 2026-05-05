"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  IconChevronLeft,
  IconChevronRight,
  IconDownload,
  IconExternalLink,
  IconLoader2,
  IconMinus,
  IconPlus,
  IconRefresh,
} from "@tabler/icons-react";

if (typeof window !== "undefined") {
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
}

export type CompanyProfileViewerCopy = {
  loading: string;
  loadError: string;
  retry: string;
  pageOf: string;
  previous: string;
  next: string;
  zoomIn: string;
  zoomOut: string;
  download: string;
  openExternal: string;
};

const ZOOM_MIN = 0.6;
const ZOOM_MAX = 2.4;
const ZOOM_STEP = 0.2;

export function CompanyProfileViewer({
  fileUrl,
  fileName,
  copy,
  locale,
}: {
  fileUrl: string;
  fileName: string;
  copy: CompanyProfileViewerCopy;
  locale: "ar" | "en";
}) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);
  const [hasError, setHasError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const file = useMemo(() => ({ url: fileUrl }), [fileUrl]);

  const onLoadSuccess = useCallback(({ numPages: n }: { numPages: number }) => {
    setNumPages(n);
    setHasError(false);
  }, []);

  const onLoadError = useCallback(() => {
    setHasError(true);
  }, []);

  const goPrev = useCallback(() => {
    setPageNumber((p) => Math.max(1, p - 1));
  }, []);
  const goNext = useCallback(() => {
    setPageNumber((p) => (numPages ? Math.min(numPages, p + 1) : p));
  }, [numPages]);

  const zoomIn = useCallback(() => {
    setScale((s) => Math.min(ZOOM_MAX, Math.round((s + ZOOM_STEP) * 10) / 10));
  }, []);
  const zoomOut = useCallback(() => {
    setScale((s) => Math.max(ZOOM_MIN, Math.round((s - ZOOM_STEP) * 10) / 10));
  }, []);

  const retry = useCallback(() => {
    setHasError(false);
    setReloadKey((k) => k + 1);
  }, []);

  const renderWidth = containerWidth
    ? Math.min(containerWidth - 32, 1000) * scale
    : undefined;

  const pageLabel = copy.pageOf
    .replace("{current}", String(pageNumber))
    .replace("{total}", numPages ? String(numPages) : "—");

  const isRtl = locale === "ar";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3">
        <div className="flex items-center gap-2">
          {locale === "en" ? (
            <>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={isRtl ? goNext : goPrev}
                disabled={
                  isRtl ? pageNumber >= (numPages ?? 1) : pageNumber <= 1
                }
                aria-label={copy.previous}
              >
                <IconChevronLeft className="size-4" />
              </Button>
              <span className="min-w-[5.5rem] text-center font-mono text-xs text-muted-foreground">
                {pageLabel}
              </span>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={isRtl ? goPrev : goNext}
                disabled={
                  isRtl ? pageNumber <= 1 : pageNumber >= (numPages ?? 1)
                }
                aria-label={copy.next}
              >
                <IconChevronRight className="size-4" />
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={isRtl ? goPrev : goNext}
                disabled={
                  isRtl ? pageNumber <= 1 : pageNumber >= (numPages ?? 1)
                }
                aria-label={copy.next}
              >
                <IconChevronRight className="size-4" />
              </Button>
              <span className="min-w-[5.5rem] text-center font-mono text-xs text-muted-foreground">
                {pageLabel}
              </span>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={isRtl ? goNext : goPrev}
                disabled={
                  isRtl ? pageNumber >= (numPages ?? 1) : pageNumber <= 1
                }
                aria-label={copy.previous}
              >
                <IconChevronLeft className="size-4" />
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={zoomOut}
            disabled={scale <= ZOOM_MIN}
            aria-label={copy.zoomOut}
          >
            <IconMinus className="size-4" />
          </Button>
          <span className="min-w-[3rem] text-center font-mono text-xs text-muted-foreground">
            {Math.round(scale * 100)}%
          </span>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={zoomIn}
            disabled={scale >= ZOOM_MAX}
            aria-label={copy.zoomIn}
          >
            <IconPlus className="size-4" />
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button asChild size="sm" variant="outline">
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={copy.openExternal}
            >
              <IconExternalLink className="size-4" />
              <span className="hidden sm:inline">{copy.openExternal}</span>
            </a>
          </Button>
          <Button
            asChild
            size="sm"
            className="bg-brand-navy text-brand-cream hover:bg-brand-navy-hover"
          >
            <a href={fileUrl} download={fileName}>
              <IconDownload className="size-4" />
              {copy.download}
            </a>
          </Button>
        </div>
      </div>

      <div
        ref={containerRef}
        className={cn(
          "overflow-hidden rounded-xl border border-border bg-muted/40",
          "flex justify-center p-4",
        )}
      >
        {hasError ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <p className="text-sm text-muted-foreground">{copy.loadError}</p>
            <Button type="button" variant="outline" size="sm" onClick={retry}>
              <IconRefresh className="size-4" />
              {copy.retry}
            </Button>
          </div>
        ) : (
          <Document
            key={reloadKey}
            file={file}
            onLoadSuccess={onLoadSuccess}
            onLoadError={onLoadError}
            loading={
              <div className="flex items-center gap-2 py-16 text-sm text-muted-foreground">
                <IconLoader2 className="size-4 animate-spin" />
                {copy.loading}
              </div>
            }
            error={
              <div className="py-16 text-center text-sm text-muted-foreground">
                {copy.loadError}
              </div>
            }
            className="max-w-full"
          >
            <Page
              pageNumber={pageNumber}
              width={renderWidth}
              renderAnnotationLayer={false}
              renderTextLayer={false}
              loading={
                <div className="flex items-center gap-2 py-12 text-sm text-muted-foreground">
                  <IconLoader2 className="size-4 animate-spin" />
                  {copy.loading}
                </div>
              }
              className="shadow-md"
            />
          </Document>
        )}
      </div>
    </div>
  );
}
