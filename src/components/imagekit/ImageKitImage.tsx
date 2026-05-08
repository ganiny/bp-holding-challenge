"use client";

import NextImage from "next/image";
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
 *
 * If `src` is a fully-qualified external URL (Unsplash / placeholder hosts
 * during seeding), we fall back to next/image so the URL is rendered as-is
 * instead of being prepended to the ImageKit endpoint.
 */
export function ImageKitImage(props: ImageProps) {
  const endpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;
  const src = typeof props.src === "string" ? props.src : "";
  const isExternal = /^https?:\/\//i.test(src);

  if (isExternal) {
    const {
      src: _src,
      width,
      height,
      alt,
      sizes,
      className,
      style,
      priority,
      loading,
      placeholder,
      blurDataURL,
      onLoad,
      onError,
    } = props as IKImageProps & {
      width?: number | `${number}`;
      height?: number | `${number}`;
      sizes?: string;
      style?: React.CSSProperties;
      priority?: boolean;
      loading?: "eager" | "lazy";
      placeholder?: "blur" | "empty";
      blurDataURL?: string;
      onLoad?: React.ReactEventHandler<HTMLImageElement>;
      onError?: React.ReactEventHandler<HTMLImageElement>;
    };
    return (
      <NextImage
        src={src}
        alt={alt ?? ""}
        width={typeof width === "string" ? Number(width) : width ?? 800}
        height={typeof height === "string" ? Number(height) : height ?? 600}
        sizes={sizes}
        className={className}
        style={style}
        priority={priority}
        loading={loading}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        onLoad={onLoad}
        onError={onError}
        unoptimized
      />
    );
  }

  return (
    <ImageKitProvider urlEndpoint={endpoint}>
      {/* eslint-disable-next-line jsx-a11y/alt-text -- alt is a required prop on ImageProps; rule can't see it through spread */}
      <Image {...props} />
    </ImageKitProvider>
  );
}
