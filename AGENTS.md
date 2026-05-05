# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev        # Start dev server (Turbopack)
pnpm build      # Production build
pnpm start      # Start production server
pnpm lint       # Run ESLint
```

No test framework is configured yet. Type-check with `tsc --noEmit` (or rely on IDE integration).

Adding shadcn/ui components:

```bash
pnpm dlx shadcn@latest add <component-name>
```

## Architecture

This is a **Next.js 16 App Router** application with a Supabase PostgreSQL backend.

**Stack:**

- Next.js 16 (App Router, RSC enabled, Turbopack)
- React 19 + TypeScript 5
- Tailwind CSS v4 with CSS variables (oklch color space)
- shadcn/ui ("radix-nova" style, RTL support enabled)
- Supabase (`@supabase/supabase-js` + `@supabase/ssr` for server-side auth)
- Prisma 7 (in devDependencies — schema not yet initialized)
- Zustand (state management), react-hook-form + Zod (forms/validation)
- next-intl (i18n), recharts (charts), motion (animations)

**Source layout (`src/`):**

- `app/` — file-based routes (App Router). `layout.tsx` sets fonts and global styles; `globals.css` contains Tailwind v4 theme variables.
- `components/ui/` — shadcn/ui components (generated via CLI, not hand-edited).
- `lib/utils.ts` — `cn()` helper (clsx + tailwind-merge).
- `hooks/` — custom React hooks (alias `@/hooks`).

**Import aliases** (configured in `tsconfig.json` and `components.json`):

- `@/components` → `src/components/`
- `@/components/ui` → `src/components/ui/`
- `@/lib` → `src/lib/`
- `@/hooks` → `src/hooks/`

**Environment variables** (`.env`): Supabase URL, anon key, service role key, and database connection strings (pooled via PgBouncer + direct URL for migrations).

## Key conventions

- Tailwind CSS v4 uses `@import "tailwindcss"` in `globals.css` — no `tailwind.config.js` file.
- shadcn/ui components live in `src/components/ui/` and use Class Variance Authority (CVA) for variants. Run the shadcn CLI to add/update them rather than editing them directly.
- Supabase client should be initialized per-request on the server using `@supabase/ssr` (`createServerClient`), and as a singleton on the client using `createBrowserClient`.
- Prisma migrations run against the direct database URL (not the pooled PgBouncer URL).
