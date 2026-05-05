-- ────────────────────────────────────────────────────────────────────────────
--  RLS policies
--    Visitors (anon) — read published catalog data; insert into submission tables
--    Employees       — read own employee data; admins do everything
--    Admins          — full access via is_admin()
-- ────────────────────────────────────────────────────────────────────────────

alter table public.profiles               enable row level security;
alter table public.services               enable row level security;
alter table public.projects               enable row level security;
alter table public.project_media          enable row level security;
alter table public.careers                enable row level security;
alter table public.job_applications       enable row level security;
alter table public.contractor_applications enable row level security;
alter table public.rfqs                   enable row level security;
alter table public.contact_messages       enable row level security;
alter table public.certifications         enable row level security;
alter table public.media_studio           enable row level security;
alter table public.site_content           enable row level security;

-- ── profiles ───────────────────────────────────────────────────────────────
create policy "profiles_self_read"
  on public.profiles for select
  to authenticated
  using (id = auth.uid() or public.is_admin());

create policy "profiles_self_update"
  on public.profiles for update
  to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

create policy "profiles_admin_insert"
  on public.profiles for insert
  to authenticated
  with check (public.is_admin());

create policy "profiles_admin_delete"
  on public.profiles for delete
  to authenticated
  using (public.is_admin());

-- ── services (public catalog) ──────────────────────────────────────────────
create policy "services_public_read"
  on public.services for select
  to anon, authenticated
  using (status = 'published' or public.is_admin());

create policy "services_admin_write"
  on public.services for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ── projects (public catalog) ──────────────────────────────────────────────
create policy "projects_public_read"
  on public.projects for select
  to anon, authenticated
  using (status = 'published' or public.is_admin());

create policy "projects_admin_write"
  on public.projects for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ── project_media ──────────────────────────────────────────────────────────
create policy "project_media_public_read"
  on public.project_media for select
  to anon, authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.projects p
      where p.id = project_media.project_id and p.status = 'published'
    )
  );

create policy "project_media_admin_write"
  on public.project_media for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ── careers ────────────────────────────────────────────────────────────────
create policy "careers_public_read"
  on public.careers for select
  to anon, authenticated
  using (status = 'open' or public.is_admin());

create policy "careers_admin_write"
  on public.careers for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ── job_applications (anon may insert; admin reads/manages) ────────────────
create policy "job_applications_anon_insert"
  on public.job_applications for insert
  to anon, authenticated
  with check (true);

create policy "job_applications_admin_read"
  on public.job_applications for select
  to authenticated
  using (public.is_admin());

create policy "job_applications_admin_update"
  on public.job_applications for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "job_applications_admin_delete"
  on public.job_applications for delete
  to authenticated
  using (public.is_admin());

-- ── contractor_applications ────────────────────────────────────────────────
create policy "contractor_applications_anon_insert"
  on public.contractor_applications for insert
  to anon, authenticated
  with check (true);

create policy "contractor_applications_admin_read"
  on public.contractor_applications for select
  to authenticated
  using (public.is_admin());

create policy "contractor_applications_admin_update"
  on public.contractor_applications for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "contractor_applications_admin_delete"
  on public.contractor_applications for delete
  to authenticated
  using (public.is_admin());

-- ── rfqs ───────────────────────────────────────────────────────────────────
create policy "rfqs_anon_insert"
  on public.rfqs for insert
  to anon, authenticated
  with check (true);

create policy "rfqs_admin_read"
  on public.rfqs for select
  to authenticated
  using (public.is_admin());

create policy "rfqs_admin_update"
  on public.rfqs for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "rfqs_admin_delete"
  on public.rfqs for delete
  to authenticated
  using (public.is_admin());

-- ── contact_messages ───────────────────────────────────────────────────────
create policy "contact_messages_anon_insert"
  on public.contact_messages for insert
  to anon, authenticated
  with check (true);

create policy "contact_messages_admin_read"
  on public.contact_messages for select
  to authenticated
  using (public.is_admin());

create policy "contact_messages_admin_update"
  on public.contact_messages for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "contact_messages_admin_delete"
  on public.contact_messages for delete
  to authenticated
  using (public.is_admin());

-- ── certifications ─────────────────────────────────────────────────────────
create policy "certifications_public_read"
  on public.certifications for select
  to anon, authenticated
  using (visibility = 'public' or public.is_admin());

create policy "certifications_admin_write"
  on public.certifications for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ── media_studio ───────────────────────────────────────────────────────────
create policy "media_studio_public_read"
  on public.media_studio for select
  to anon, authenticated
  using (visibility = 'public' or public.is_admin());

create policy "media_studio_admin_write"
  on public.media_studio for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ── site_content (admin-managed, public read) ─────────────────────────────
create policy "site_content_public_read"
  on public.site_content for select
  to anon, authenticated
  using (true);

create policy "site_content_admin_write"
  on public.site_content for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
