-- ────────────────────────────────────────────────────────────────────────────
--  BP Holding — initial schema
--  Bilingual (en/ar) corporate site, admin panel, employee portal foundation.
-- ────────────────────────────────────────────────────────────────────────────

create extension if not exists "pgcrypto";
create extension if not exists "citext";

-- ── Enums ───────────────────────────────────────────────────────────────────

create type public.user_role           as enum ('admin', 'employee', 'member');
create type public.publish_status      as enum ('draft', 'published', 'archived');
create type public.career_status       as enum ('draft', 'open', 'closed');
create type public.application_status  as enum ('new', 'reviewing', 'shortlisted', 'rejected', 'hired');
create type public.contractor_status   as enum ('new', 'reviewing', 'approved', 'rejected');
create type public.rfq_status          as enum ('new', 'in_progress', 'quoted', 'won', 'lost', 'closed');
create type public.message_status      as enum ('new', 'read', 'replied', 'closed');
create type public.media_visibility    as enum ('public', 'private');
create type public.media_kind          as enum ('image', 'video', 'document');
create type public.budget_range        as enum ('under_100k', '100k_500k', '500k_1m', '1m_5m', 'over_5m', 'unspecified');

-- ── Helper: updated_at auto-touch ───────────────────────────────────────────

create or replace function public.tg_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ── profiles (1-1 with auth.users) ──────────────────────────────────────────

create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         citext      not null unique,
  full_name     text,
  avatar_url    text,
  role          public.user_role not null default 'employee',
  phone         text,
  must_change_password boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.tg_touch_updated_at();

-- Auto-create a profile row when a new auth.users row appears.
create or replace function public.tg_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'employee')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.tg_handle_new_user();

-- Helper used by RLS policies.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.is_employee()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('employee', 'admin')
  );
$$;

-- ── services ────────────────────────────────────────────────────────────────

create table public.services (
  id              uuid primary key default gen_random_uuid(),
  slug            citext      not null unique,
  title_en        text        not null,
  title_ar        text        not null,
  summary_en      text,
  summary_ar      text,
  description_en  text,
  description_ar  text,
  icon            text,                       -- lucide / tabler icon name
  cover_image_path text,                      -- ImageKit path
  sort_order      integer     not null default 0,
  status          public.publish_status not null default 'draft',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index services_status_idx     on public.services(status);
create index services_sort_order_idx on public.services(sort_order);

create trigger services_updated_at
  before update on public.services
  for each row execute function public.tg_touch_updated_at();

-- ── projects ────────────────────────────────────────────────────────────────

create table public.projects (
  id              uuid primary key default gen_random_uuid(),
  slug            citext      not null unique,
  title_en        text        not null,
  title_ar        text        not null,
  summary_en      text,
  summary_ar      text,
  description_en  text,
  description_ar  text,
  sector          text,                       -- e.g. "residential", "structural"
  client          text,
  location_en     text,
  location_ar     text,
  year            integer,
  cover_image_path text,                      -- ImageKit path
  status          public.publish_status not null default 'draft',
  is_featured     boolean     not null default false,
  sort_order      integer     not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index projects_status_idx        on public.projects(status);
create index projects_is_featured_idx   on public.projects(is_featured) where is_featured;
create index projects_sector_idx        on public.projects(sector);
create index projects_year_idx          on public.projects(year);

create trigger projects_updated_at
  before update on public.projects
  for each row execute function public.tg_touch_updated_at();

-- ── project_media ──────────────────────────────────────────────────────────

create table public.project_media (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid not null references public.projects(id) on delete cascade,
  kind         public.media_kind   not null default 'image',
  file_path    text   not null,                -- ImageKit path
  thumbnail_path text,
  caption_en   text,
  caption_ar   text,
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now()
);

create index project_media_project_id_idx on public.project_media(project_id);

-- ── careers ────────────────────────────────────────────────────────────────

create table public.careers (
  id              uuid primary key default gen_random_uuid(),
  slug            citext      not null unique,
  title_en        text        not null,
  title_ar        text        not null,
  department_en   text,
  department_ar   text,
  location_en     text,
  location_ar     text,
  type_en         text,                        -- "Full-time", "Contract", ...
  type_ar         text,
  description_en  text,
  description_ar  text,
  requirements_en text,
  requirements_ar text,
  status          public.career_status not null default 'draft',
  closes_at       timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index careers_status_idx on public.careers(status);

create trigger careers_updated_at
  before update on public.careers
  for each row execute function public.tg_touch_updated_at();

-- ── job_applications ───────────────────────────────────────────────────────

create table public.job_applications (
  id              uuid primary key default gen_random_uuid(),
  career_id       uuid references public.careers(id) on delete set null,
  full_name       text   not null,
  email           citext not null,
  phone           text,
  cover_letter    text,
  cv_file_path    text   not null,            -- ImageKit private folder
  portfolio_url   text,
  linkedin_url    text,
  status          public.application_status not null default 'new',
  notes           text,
  ip_address      inet,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index job_applications_career_id_idx on public.job_applications(career_id);
create index job_applications_status_idx    on public.job_applications(status);
create index job_applications_created_at_idx on public.job_applications(created_at desc);

create trigger job_applications_updated_at
  before update on public.job_applications
  for each row execute function public.tg_touch_updated_at();

-- ── contractor_applications ────────────────────────────────────────────────

create table public.contractor_applications (
  id                uuid primary key default gen_random_uuid(),
  company_name      text   not null,
  contact_name      text   not null,
  email             citext not null,
  phone             text   not null,
  country           text,
  city              text,
  cr_number         text,                      -- Saudi commercial registration
  vat_number        text,
  specialty_en      text,
  specialty_ar      text,
  years_experience  integer,
  website           text,
  document_paths    text[] not null default '{}', -- ImageKit private paths
  notes             text,
  status            public.contractor_status not null default 'new',
  ip_address        inet,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index contractor_applications_status_idx     on public.contractor_applications(status);
create index contractor_applications_created_at_idx on public.contractor_applications(created_at desc);

create trigger contractor_applications_updated_at
  before update on public.contractor_applications
  for each row execute function public.tg_touch_updated_at();

-- ── rfqs ───────────────────────────────────────────────────────────────────

create table public.rfqs (
  id              uuid primary key default gen_random_uuid(),
  full_name       text   not null,
  email           citext not null,
  phone           text   not null,
  company         text,
  project_type    text,
  budget          public.budget_range not null default 'unspecified',
  location        text,
  start_date      date,
  description     text   not null,
  attachment_paths text[] not null default '{}',  -- ImageKit private paths
  status          public.rfq_status not null default 'new',
  assigned_to     uuid references public.profiles(id) on delete set null,
  internal_notes  text,
  ip_address      inet,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index rfqs_status_idx       on public.rfqs(status);
create index rfqs_assigned_to_idx  on public.rfqs(assigned_to);
create index rfqs_created_at_idx   on public.rfqs(created_at desc);

create trigger rfqs_updated_at
  before update on public.rfqs
  for each row execute function public.tg_touch_updated_at();

-- ── contact_messages ───────────────────────────────────────────────────────

create table public.contact_messages (
  id          uuid primary key default gen_random_uuid(),
  full_name   text   not null,
  email       citext not null,
  phone       text,
  subject     text,
  message     text   not null,
  status      public.message_status not null default 'new',
  ip_address  inet,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index contact_messages_status_idx     on public.contact_messages(status);
create index contact_messages_created_at_idx on public.contact_messages(created_at desc);

create trigger contact_messages_updated_at
  before update on public.contact_messages
  for each row execute function public.tg_touch_updated_at();

-- ── certifications ─────────────────────────────────────────────────────────

create table public.certifications (
  id            uuid primary key default gen_random_uuid(),
  title_en      text   not null,
  title_ar      text   not null,
  issuer_en     text,
  issuer_ar     text,
  description_en text,
  description_ar text,
  file_path     text   not null,                -- ImageKit (PDF or image)
  thumbnail_path text,
  visibility    public.media_visibility not null default 'public',
  issued_on     date,
  expires_on    date,
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index certifications_visibility_idx on public.certifications(visibility);
create index certifications_sort_order_idx on public.certifications(sort_order);

create trigger certifications_updated_at
  before update on public.certifications
  for each row execute function public.tg_touch_updated_at();

-- ── media_studio (portfolio studio masonry) ────────────────────────────────

create table public.media_studio (
  id             uuid primary key default gen_random_uuid(),
  kind           public.media_kind not null default 'image',
  file_path      text not null,
  thumbnail_path text,
  caption_en     text,
  caption_ar     text,
  visibility     public.media_visibility not null default 'public',
  tags           text[] not null default '{}',
  sort_order     integer not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index media_studio_visibility_idx on public.media_studio(visibility);
create index media_studio_sort_order_idx on public.media_studio(sort_order);
create index media_studio_tags_idx       on public.media_studio using gin(tags);

create trigger media_studio_updated_at
  before update on public.media_studio
  for each row execute function public.tg_touch_updated_at();

-- ── site_content (JSON CMS for hero copy, footer, contact info, etc.) ──────

create table public.site_content (
  key         text primary key,                 -- e.g. 'home.hero', 'footer'
  data        jsonb not null default '{}'::jsonb,
  updated_by  uuid references public.profiles(id) on delete set null,
  updated_at  timestamptz not null default now()
);

create trigger site_content_updated_at
  before update on public.site_content
  for each row execute function public.tg_touch_updated_at();
