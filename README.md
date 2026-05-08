# BP Holding Platform

Bilingual (Arabic / English) digital ecosystem for **Business Pioneers Holding** — a Riyadh-based engineering and contracting group founded in 2021. The platform replaces the static "site under development" placeholder at [bpholding.net](https://www.bpholding.net) with a premium corporate website, lead-generation funnel, full admin console, and a growing internal portal — built so phases 2–4 (e-commerce, HR, PEG-N member network, AI assistant) plug in without a rewrite.

This repository is the active build. The full multi-phase implementation plan lives in `C:\Users\LAPTOP\.claude\plans\you-are-an-eager-umbrella.md`; this README summarizes what's already shipping in the dev environment and what's coming next.

---

## Tech stack

| Concern              | Choice                                                          |
| -------------------- | --------------------------------------------------------------- |
| Framework            | Next.js 16 (App Router) + React 19, RSC-first                   |
| Styling              | Tailwind CSS v4 (`oklch()` brand tokens) + shadcn/ui            |
| Animation            | Aceternity components per-section, Motion, Tabler icons         |
| Auth + DB            | Supabase (Postgres, RLS, `@supabase/ssr`)                       |
| i18n                 | `next-intl` — locales `ar` (default) + `en`, RTL/LTR-aware      |
| Forms                | `react-hook-form` + Zod                                         |
| Storage              | ImageKit — public folder for marketing, signed URLs for private |
| Email                | Nodemailer over Gmail SMTP, bilingual templates                 |
| Rate limiting        | Upstash Redis                                                   |
| Spam guard           | Cloudflare Turnstile                                            |
| Cart state           | Zustand + `localStorage` persistence                            |
| Charts               | Recharts                                                        |
| Edge orchestration   | Next 16 **proxy** (renamed from middleware) — i18n + auth gate  |

---

## What's done — Phase 1 (corporate website + admin)

### Public site (bilingual `ar` / `en`)

| Page                          | Highlights                                                          |
| ----------------------------- | ------------------------------------------------------------------- |
| **Home**                      | Aceternity ImagesSlider hero, animated stats, services bento, featured projects (3D cards), testimonials, CTA banner — all CMS-driven |
| **About**                     | Bilingual timeline (founding 2021 → today), leadership card, sectors map |
| **Services** index + detail   | Bento grid with `GlowingEffect`; per-service detail page             |
| **Portfolio** index + detail  | Filters (sector / year / location), gallery with ImageKit transforms |
| **Portfolio Studio**          | Masonry of photos and videos with lightbox, captions, video poster support |
| **Certifications**            | Listing with PDF preview + signed-URL downloads                     |
| **Careers** index + detail    | Job listings + apply form with CV upload (Aceternity FileUpload)    |
| **Contractors / suppliers**   | Multi-section vendor registration with multi-file upload            |
| **RFQ + Contact**             | Forms with Zod validation, rate-limit, Nodemailer confirmations     |
| **Company Profile**           | `react-pdf` viewer for the bilingual company profile                |
| **Privacy / Terms**           | MDX-rendered legal pages                                            |

### Admin console (`/<locale>/admin`)

Role-gated by Supabase + the proxy. Forces password rotation on the seed admin's first sign-in.

- **Overview** — KPI counters, 30-day submission trends (Recharts), recent activity feed
- **Projects** — DataTable + drawer editor, ImageKit gallery, status workflow, drag-reorder
- **Portfolio Studio** — Bulk media upload with bilingual captions, per-video poster, edit/replace media
- **Careers** — CRUD job postings with status transitions
- **Job Applications** — Pipeline (`new → reviewing → shortlisted → rejected → hired`), CV via signed URL, CSV export with UTF-8 BOM
- **Contractor Applications** — Same pipeline with vendor docs
- **RFQs** — Full pipeline + reply via Nodemailer admin-reply template
- **Contact Messages** — Inbox + reply
- **Certifications** — Upload, reorder, visibility toggle (public / private)
- **Site Content** — JSON CMS for hero copy, slider images, footer, contact info, About timeline (changes flow live to public pages)
- **Settings** — Admin profile (avatar via ImageKit) + password change
- **Mobile-first** — Fully responsive; locale and theme switch in the header

### Foundations / cross-cutting

- Brand tokens (navy `#052a42` + gold `#df9a13`), light + dark theme, Cairo (AR) + Inter (EN) fonts
- Locale-aware routing via `next-intl` `pathnames`; RTL flips the entire layout
- Supabase RLS on every table; admin actions use the service-role client
- ImageKit private-folder reads always go through short-lived signed URLs
- Spam protection: Turnstile + Upstash IP rate-limits on every public form
- Bilingual transactional emails for RFQ, contact, job/contractor applications, admin replies, and now order confirmations

---

## What's new — Phase 2 e-commerce (demo scaffolding)

A pragmatic store wired end-to-end so the client can experience the buying flow today. Production-grade enhancements (Mada / credit-card capture, customer accounts, returns) land later in Phase 2 proper.

### Public

- **`/store`** — Product grid with category filter, "Add to cart", and sale badges
- **`/store/[slug]`** — Product detail with quantity selector, image gallery, "Buy now"
- **`/cart`** — Editable cart (Zustand + `localStorage`), live subtotal, free-shipping threshold
- **`/checkout`** — Address + contact form, order summary, places the order via Server Action
- **`/order-confirmed/[orderNumber]`** — Confirmation page + Nodemailer order-receipt email

### Admin

- **`/admin/products`** — Full CRUD with bilingual fields, pricing (with optional compare-at), stock, status (draft / published / archived), featured flag, ImageKit cover upload
- **`/admin/orders`** — Searchable + filterable order list, expandable details (items, address, notes), status workflow (`pending_payment → paid → processing → shipped → delivered → cancelled / refunded`)

### Data layer

- New tables: `products`, `orders`, `order_items` (with line-item snapshots so historical orders stay readable if a product is deleted)
- New enums: `product_status`, `order_status`
- RLS: anon can insert orders + items at checkout; reads/updates are admin-only
- Migration: `supabase/migrations/20260508120000_store.sql`
- Seed loader: `node scripts/apply-store-migration.mjs` (idempotent; refreshes demo products on re-run)

---

## What's coming next

### Phase 1 wrap-up (next on deck)

- **SEO finalization** — sitemap, robots, JSON-LD on every public page (Organization, BreadcrumbList, JobPosting), dynamic OG image route, hreflang
- **Performance pass** — Lighthouse mobile ≥ 90 perf / 100 SEO / 100 a11y, dynamic-import the Aceternity-heavy sections
- **Security pass** — full RLS test matrix (anon × employee × admin × every table), CSP headers, Sentry boot
- **Email polish** — bilingual HTML + plaintext refinement for all transactional templates
- **Smoke deploy** to a Vercel preview with prod ImageKit folder + prod Supabase project

### Phase 2 (real e-commerce)

- **Moyasar payment** integration (Mada + credit cards, the Saudi-friendly default)
- **Customer accounts** — orders history, saved addresses, password reset
- **Stock-aware cart** (server-validated availability before checkout)
- **Coupons / discounts** + tax / VAT line
- **Multi-image galleries** on product detail + zoom view
- **HR portal** — employee profiles, leave requests, admin requests, notifications

### Phase 3

- **PEG-N (Professional Engineers Global Network)** — member registration (third role), portfolios, opportunity feed via Supabase Realtime, proposal flow
- **Business Pioneers Community** — companion mirror tables for non-engineer participants

### Phase 4

- **Smart FAQ chatbot** — config-driven `chatbot_intents` table, then an Anthropic-backed conversational layer with tool-use ("create RFQ from chat")
- **CRM webhooks** — push qualified leads to HubSpot / Pipedrive

---

## Repo layout (high-signal entry points)

```
src/
  app/[locale]/
    (marketing)/        — public pages (home, services, portfolio, store, cart, checkout, …)
    (auth)/login        — shared admin + employee sign-in
    admin/              — admin console, gated by proxy
  components/
    layout/             — Header, Footer, MobileNav, CartIndicator, LocaleSwitcher
    marketing/          — Hero, BentoGrid, FeaturedProjects, Testimonials, …
    store/              — StoreGrid, ProductDetailClient, CartClient, CheckoutClient
    admin/              — AdminShell + per-section client components
    imagekit/           — ImageKitImage (auto-falls back to next/image for external URLs)
  lib/
    supabase/           — browser / server / admin / proxy clients
    email/              — Nodemailer transporter + bilingual templates
    imagekit/           — server signer + public URL helper
    i18n/               — routing.ts, request.ts
    store/              — Zustand cart store
    validation/         — Zod schemas (one per form / entity)
  proxy.ts              — Next 16 edge orchestration (i18n + auth + role gates)
supabase/migrations/    — SQL migrations + RLS policies + sample data
messages/{ar,en}.json   — bilingual UI dictionaries
scripts/                — seed-admin, smoke tests, store migration runner
```

---

## Local development

### Prerequisites

- Node 20+
- `pnpm`
- A Supabase project (URL + anon key + service-role key + DB password)
- ImageKit credentials (public, private, endpoint)
- Gmail SMTP app password (or any SMTP)
- Upstash Redis (rate limiting)
- Cloudflare Turnstile keys

### Setup

```bash
pnpm install
cp .env.example .env.local   # then fill in your values
node scripts/seed-admin.mjs               # creates the bootstrap admin
node scripts/apply-store-migration.mjs    # creates store tables + seeds demo products
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) — the app redirects to `/ar` by default. Sign in at `/ar/login` with the seed admin credentials (you'll be forced to rotate the password on first login).

### Useful scripts

| Command                                       | What it does                                   |
| --------------------------------------------- | ---------------------------------------------- |
| `pnpm dev`                                    | Run Next.js dev server                         |
| `pnpm build && pnpm start`                    | Production build + start                       |
| `pnpm lint`                                   | ESLint                                         |
| `node scripts/seed-admin.mjs`                 | Seed / upsert the bootstrap admin              |
| `node scripts/apply-store-migration.mjs`      | Apply the store migration + refresh demo seed  |
| `node scripts/email-smoke-test.mjs`           | Send a test email through the Nodemailer pipe  |
| `node scripts/rls-smoke-test.mjs`             | Sanity-check RLS posture on the public tables  |

---

## Design system snapshot

- **Brand colors** — Navy `#052a42`, Gold `#df9a13`, Cream `#fbf9f4` — exposed as `--brand-navy`, `--brand-gold`, `--brand-cream`, plus shadcn semantic tokens (`bg-card`, `text-muted-foreground`, …) flipped per theme.
- **Typography** — Inter for English / Cairo for Arabic, loaded via `next/font/google`, switched per locale on `<html>`.
- **RTL** — All layouts use logical properties (`ms-`, `me-`, `start-`, `end-`) plus `rtl:` modifiers; mobile sheets respect locale direction.
- **Animations** — Aceternity components per-section (ImagesSlider, BentoGrid + GlowingEffect, FocusCards, ExpandableCards, InfiniteMovingCards, AuroraBackground, FileUpload, Timeline). Scoped `ParticleField` only behind Hero, CTA banner, and login. `prefers-reduced-motion` honored everywhere.
- **Email** — Branded inline-CSS shell (`src/lib/email/templates/_shell.ts`), bilingual subjects + bodies, plaintext fallback for every template.

---

## Security posture

- **Auth** — Supabase email + password, no public signup. Two roles in production today (`admin`, `employee`); `member` is reserved for Phase 3.
- **RLS** — Every table is RLS-enabled. Public reads are restricted to `status = 'published'` / `visibility = 'public'`. Submission tables (`rfqs`, `contact_messages`, `job_applications`, `contractor_applications`, `orders`, `order_items`) accept anon inserts only.
- **Service-role usage** — Confined to admin Server Actions and migration scripts; never reaches the browser.
- **Storage** — Private files (CVs, contractor docs, internal certificates) stay in `/private/...` and are only ever served via 5-minute signed URLs.
- **Spam / abuse** — Turnstile on every public form + Upstash sliding-window rate limits keyed by IP + form.
- **Secrets hygiene** — `.env.local` git-ignored; no secrets committed; the brief's earlier `public/all-env-vars-for-bp-holding.txt` was relocated and rotated as step 1 of the build.

---

## Status (May 8, 2026)

- **Phase 1** — admin console + public site complete (steps 1–34 of the plan). Wrap-up steps 35–39 (SEO / perf / security / email polish / Vercel preview deploy) are next.
- **Phase 2** — store demo scaffolding live (browse → cart → checkout → confirm + admin products / orders). Real payments + customer accounts to follow.
- **Phases 3–4** — architectural placeholders only; tables and routes will be added when those phases start.

For full task-by-task history and decisions, see the implementation plan referenced at the top of this file.
