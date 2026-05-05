import { createRequire } from "node:module";
import { copyFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(here, "..");
const target = join(projectRoot, "public", "pdf.worker.min.mjs");
const require = createRequire(import.meta.url);

function resolveWorker() {
  const reactPdfPkg = (() => {
    try {
      return require.resolve("react-pdf/package.json", { paths: [projectRoot] });
    } catch {
      return null;
    }
  })();

  const lookupPaths = [projectRoot];
  if (reactPdfPkg) lookupPaths.unshift(dirname(reactPdfPkg));

  try {
    return require.resolve("pdfjs-dist/build/pdf.worker.min.mjs", {
      paths: lookupPaths,
    });
  } catch {}

  try {
    const pkg = require.resolve("pdfjs-dist/package.json", { paths: lookupPaths });
    return join(dirname(pkg), "build", "pdf.worker.min.mjs");
  } catch {}

  const pnpmDir = join(projectRoot, "node_modules", ".pnpm");
  if (existsSync(pnpmDir)) {
    const match = readdirSync(pnpmDir).find((d) => d.startsWith("pdfjs-dist@"));
    if (match) {
      const fallback = join(
        pnpmDir,
        match,
        "node_modules",
        "pdfjs-dist",
        "build",
        "pdf.worker.min.mjs",
      );
      if (existsSync(fallback)) return fallback;
    }
  }

  return null;
}

const source = resolveWorker();

if (!source || !existsSync(source)) {
  console.warn("[sync-pdf-worker] pdfjs-dist worker not found — skipping.");
  process.exit(0);
}

mkdirSync(dirname(target), { recursive: true });
copyFileSync(source, target);
console.log(`[sync-pdf-worker] copied ${source} → ${target}`);
