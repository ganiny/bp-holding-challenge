"use client";

import {
  ImageKitProvider,
  Image,
  type IKImageProps,
} from "@imagekit/next";

type ImageProps = IKImageProps;

/**
 * Drop-in image wrapper using @imagekit/next's <ImageKitProvider> + <Image>.
 * Pass the ImageKit filePath as `src` (e.g. "/public/projects/cover.jpg").
 *
 * Wrapping the Provider here keeps call sites simple — they don't need to
 * know about the endpoint env var, and nesting Providers is a no-op so
 * higher-level Provider wrapping (e.g. for galleries) still works.
 */
export function ImageKitImage(props: ImageProps) {
  const endpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;
  return (
    <ImageKitProvider urlEndpoint={endpoint}>
      {/* eslint-disable-next-line jsx-a11y/alt-text -- alt is a required prop on ImageProps; rule can't see it through spread */}
      <Image {...props} />
    </ImageKitProvider>
  );
}
