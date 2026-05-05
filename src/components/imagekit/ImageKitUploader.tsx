"use client";

import { upload } from "@imagekit/next";
import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type UploadResult = {
  filePath: string;
  url: string;
  width?: number;
  height?: number;
  size: number;
  fileType: string;
};

type Props = {
  folder:
    | "/public/projects"
    | "/public/studio"
    | "/public/applications"
    | "/public/contractors"
    | "/public/rfqs"
    | "/private/documents"
    | "/private/employees"
    | "/private/certifications";
  accept?: string;
  multiple?: boolean;
  maxSizeMB?: number;
  onUploaded: (results: UploadResult[]) => void;
  className?: string;
  label?: string;
};

/**
 * Thin wrapper around @imagekit/next's upload(). Handles:
 *  - fetching auth params from /api/imagekit/auth
 *  - validating size client-side
 *  - calling onUploaded with the resulting file metadata
 *
 * Visual treatment is minimal here — Step 11 will wrap this in the Aceternity
 * FileUpload shell for drag-drop + animated progress.
 */
export function ImageKitUploader({
  folder,
  accept,
  multiple = false,
  maxSizeMB = 20,
  onUploaded,
  className,
  label = "Upload file",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    setProgress(0);

    const fileList = Array.from(files);
    const tooBig = fileList.find((f) => f.size > maxSizeMB * 1024 * 1024);
    if (tooBig) {
      setError(`"${tooBig.name}" exceeds ${maxSizeMB}MB`);
      setProgress(null);
      return;
    }

    startTransition(async () => {
      try {
        const authRes = await fetch(
          `/api/imagekit/auth?folder=${encodeURIComponent(folder)}`,
          { cache: "no-store" },
        );
        if (!authRes.ok) {
          throw new Error(`auth failed (${authRes.status})`);
        }
        const auth = await authRes.json();

        const results: UploadResult[] = [];
        let completed = 0;

        for (const file of fileList) {
          const r = await upload({
            file,
            fileName: file.name,
            folder: auth.folder,
            publicKey: auth.publicKey,
            signature: auth.signature,
            expire: auth.expire,
            token: auth.token,
            useUniqueFileName: true,
            onProgress: (e) => {
              const fraction = (completed + e.loaded / e.total) / fileList.length;
              setProgress(Math.round(fraction * 100));
            },
          });
          completed += 1;
          results.push({
            filePath: r.filePath ?? "",
            url: r.url ?? "",
            width: r.width,
            height: r.height,
            size: r.size ?? 0,
            fileType: r.fileType ?? file.type,
          });
        }

        onUploaded(results);
        setProgress(100);
        setTimeout(() => setProgress(null), 800);
      } catch (e) {
        setError(e instanceof Error ? e.message : "upload failed");
        setProgress(null);
      }
    });
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={accept}
        multiple={multiple}
        onChange={(e) => handleFiles(e.target.files)}
      />
      <Button
        type="button"
        variant="outline"
        disabled={isPending}
        onClick={() => inputRef.current?.click()}
      >
        {isPending ? `Uploading… ${progress ?? 0}%` : label}
      </Button>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
