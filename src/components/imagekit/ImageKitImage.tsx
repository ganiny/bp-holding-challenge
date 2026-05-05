import Image, { type ImageProps } from "next/image";
import { imageKitLoader } from "@/lib/imagekit/loader";

/**
 * Drop-in replacement for next/image that pipes through ImageKit transformations.
 * Pass the ImageKit filePath as `src` (e.g. "/public/projects/cover.jpg").
 */
export function ImageKitImage(props: Omit<ImageProps, "loader">) {
  return <Image loader={imageKitLoader} {...props} />;
}
