import type { ImageLoaderProps } from "next/image";

/**
 * Custom next/image loader that pipes through ImageKit transformations.
 * Use as: <Image loader={imageKitLoader} src={filePath} ... />
 *
 * Accepts either a full ImageKit URL or a bare filePath like "/public/projects/foo.jpg".
 */
export function imageKitLoader({ src, width, quality }: ImageLoaderProps): string {
  const endpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;
  if (!endpoint) throw new Error("NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT missing");

  const path = src.startsWith("http") ? new URL(src).pathname : src.startsWith("/") ? src : `/${src}`;
  const cleaned = path.replace(/^\/(public|private)\//, "/");

  const params = [`w-${width}`, `q-${quality ?? 80}`, "f-auto"].join(",");
  return `${endpoint.replace(/\/$/, "")}${cleaned}?tr=${params}`;
}

/**
 * Build a plain ImageKit delivery URL for a non-image asset (video, PDF, etc.)
 * — no `tr=` transforms. Use this when feeding a raw `<video>` or `<a download>`
 * element since those don't go through `<Image>` / `ImageKitProvider`.
 *
 * The path is preserved verbatim (no `/public` or `/private` stripping) — that
 * matches how `ImageKitProvider` builds image URLs and ensures the video URL
 * points at the same object the upload created.
 *
 * Accepts a full ImageKit URL (returned as-is) or a bare filePath like
 * "/public/studio/clip.mp4".
 */
export function imageKitPublicUrl(filePath: string): string {
  if (!filePath) return "";
  if (filePath.startsWith("http")) return filePath;
  const endpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;
  if (!endpoint) throw new Error("NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT missing");
  const path = filePath.startsWith("/") ? filePath : `/${filePath}`;
  return `${endpoint.replace(/\/$/, "")}${path}`;
}
