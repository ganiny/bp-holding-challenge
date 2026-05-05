import "server-only";
import ImageKit from "@imagekit/nodejs";
import type { Transformation } from "@imagekit/nodejs/resources/shared";

let cachedClient: ImageKit | undefined;
let cachedEndpoint: string | undefined;

function client() {
  if (!cachedClient) {
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    if (!privateKey) throw new Error("IMAGEKIT_PRIVATE_KEY missing");
    cachedClient = new ImageKit({ privateKey });
  }
  return cachedClient;
}

function endpoint() {
  if (!cachedEndpoint) {
    cachedEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;
    if (!cachedEndpoint) throw new Error("NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT missing");
  }
  return cachedEndpoint;
}

/**
 * Generate auth params for client-side uploads.
 * 30 min expiry by default — short enough that leaked tokens are low-risk.
 */
export function getUploadAuthParams() {
  return client().helper.getAuthenticationParameters();
}

/**
 * Time-limited signed URL for a private-folder file.
 * Default TTL: 5 minutes. Issue server-side just before render.
 */
export function getSignedUrl(filePath: string, ttlSeconds = 300): string {
  return client().helper.buildSrc({
    src: filePath,
    urlEndpoint: endpoint(),
    signed: true,
    expiresIn: ttlSeconds,
  });
}

/**
 * Public URL with optional ImageKit transformations.
 */
export function getPublicUrl(
  filePath: string,
  transformation?: Transformation[],
): string {
  return client().helper.buildSrc({
    src: filePath,
    urlEndpoint: endpoint(),
    transformation,
  });
}
