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
