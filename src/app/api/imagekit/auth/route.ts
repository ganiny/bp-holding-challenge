import { NextResponse } from "next/server";
import { getUploadAuthParams } from "@/lib/imagekit/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * Issues a short-lived upload token for the ImageKit client SDK.
 *
 * Public-folder uploads (visitor RFQ/career/contractor forms) — anonymous OK.
 * Private-folder uploads (employee docs, admin uploads) — require auth.
 *
 * The folder is specified by the client; we validate it against an allowlist.
 */
const PUBLIC_FOLDERS = [
  "/public/projects",
  "/public/studio",
  "/public/applications",
  "/public/contractors",
  "/public/rfqs",
];
const PRIVATE_FOLDERS = ["/private/documents", "/private/employees", "/private/certifications"];

export async function GET(request: Request) {
  const url = new URL(request.url);
  const folder = url.searchParams.get("folder") ?? "/public/applications";

  const isPrivate = PRIVATE_FOLDERS.includes(folder);
  const isPublic = PUBLIC_FOLDERS.includes(folder);

  if (!isPrivate && !isPublic) {
    return NextResponse.json({ error: "invalid folder" }, { status: 400 });
  }

  if (isPrivate) {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const params = getUploadAuthParams();

  return NextResponse.json({
    ...params,
    publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
    folder,
  });
}
