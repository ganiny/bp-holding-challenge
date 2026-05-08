-- ────────────────────────────────────────────────────────────────────────────
--  Store (Phase 2 — demo scaffolding)
--    products / orders / order_items
--    Anon may insert orders + order_items at checkout (no auth flow yet).
--    Admin reads/manages.
-- ────────────────────────────────────────────────────────────────────────────

create type public.product_status as enum ('draft', 'published', 'archived');
create type public.order_status   as enum (
  'pending_payment', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'
);

-- ── products ────────────────────────────────────────────────────────────────

create table public.products (
  id              uuid primary key default gen_random_uuid(),
  slug            citext      not null unique,
  name_en         text        not null,
  name_ar         text        not null,
  description_en  text,
  description_ar  text,
  category_en     text,
  category_ar     text,
  price_sar       numeric(10,2) not null check (price_sar >= 0),
  compare_at_sar  numeric(10,2),
  stock           integer     not null default 0 check (stock >= 0),
  cover_image_path text,
  gallery_paths   text[]      not null default '{}',
  status          public.product_status not null default 'draft',
  is_featured     boolean     not null default false,
  sort_order      integer     not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index products_status_idx     on public.products(status);
create index products_featured_idx   on public.products(is_featured) where is_featured;
create index products_category_idx   on public.products(category_en);

create trigger products_updated_at
  before update on public.products
  for each row execute function public.tg_touch_updated_at();

-- ── orders ──────────────────────────────────────────────────────────────────

create table public.orders (
  id              uuid primary key default gen_random_uuid(),
  order_number    text        not null unique,
  full_name       text        not null,
  email           citext      not null,
  phone           text        not null,
  shipping_address text       not null,
  city            text,
  notes           text,
  subtotal_sar    numeric(10,2) not null default 0,
  shipping_sar    numeric(10,2) not null default 0,
  total_sar       numeric(10,2) not null default 0,
  status          public.order_status not null default 'pending_payment',
  ip_address      inet,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index orders_status_idx     on public.orders(status);
create index orders_created_at_idx on public.orders(created_at desc);
create index orders_email_idx      on public.orders(email);

create trigger orders_updated_at
  before update on public.orders
  for each row execute function public.tg_touch_updated_at();

-- ── order_items (snapshot of price/name at purchase time) ───────────────────

create table public.order_items (
  id              uuid primary key default gen_random_uuid(),
  order_id        uuid not null references public.orders(id) on delete cascade,
  product_id      uuid references public.products(id) on delete set null,
  name_snapshot   text not null,
  price_sar       numeric(10,2) not null,
  quantity        integer not null check (quantity > 0),
  line_total_sar  numeric(10,2) not null,
  created_at      timestamptz not null default now()
);

create index order_items_order_id_idx on public.order_items(order_id);

-- ── RLS ─────────────────────────────────────────────────────────────────────

alter table public.products    enable row level security;
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;

-- products: public reads on published; admin manages
create policy "products_public_read"
  on public.products for select
  to anon, authenticated
  using (status = 'published' or public.is_admin());

create policy "products_admin_write"
  on public.products for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- orders: anon may insert (checkout); only admin reads/updates
create policy "orders_anon_insert"
  on public.orders for insert
  to anon, authenticated
  with check (true);

create policy "orders_admin_read"
  on public.orders for select
  to authenticated
  using (public.is_admin());

create policy "orders_admin_update"
  on public.orders for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "orders_admin_delete"
  on public.orders for delete
  to authenticated
  using (public.is_admin());

-- order_items: anon may insert (checkout); admin reads
create policy "order_items_anon_insert"
  on public.order_items for insert
  to anon, authenticated
  with check (true);

create policy "order_items_admin_read"
  on public.order_items for select
  to authenticated
  using (public.is_admin());

create policy "order_items_admin_delete"
  on public.order_items for delete
  to authenticated
  using (public.is_admin());

-- ── Sample products (demo data) ─────────────────────────────────────────────

insert into public.products (
  slug, name_en, name_ar, description_en, description_ar,
  category_en, category_ar, price_sar, compare_at_sar, stock,
  cover_image_path, status, is_featured, sort_order
) values
  (
    'industrial-safety-helmet',
    'Industrial Safety Helmet',
    'خوذة سلامة صناعية',
    'CE-certified hard hat with adjustable harness, side ventilation, and chin strap. Suitable for all construction and industrial sites.',
    'خوذة معتمدة من CE بحزام قابل للتعديل وتهوية جانبية وحزام ذقن. مناسبة لجميع مواقع البناء والمواقع الصناعية.',
    'Safety Equipment', 'معدات السلامة',
    89.00, 120.00, 250,
    'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=1200&h=900&fit=crop',
    'published', true, 1
  ),
  (
    'industrial-work-gloves',
    'Industrial Work Gloves (Pair)',
    'قفازات عمل صناعية (زوج)',
    'Cut-resistant gloves with reinforced palm and breathable back. Sold per pair.',
    'قفازات مقاومة للقطع براحة معززة وظهر مسامي. تباع بالزوج.',
    'Safety Equipment', 'معدات السلامة',
    35.00, null, 500,
    'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=1200&h=900&fit=crop',
    'published', true, 2
  ),
  (
    'high-visibility-vest',
    'High-Visibility Safety Vest',
    'سترة سلامة عاكسة',
    'Class 2 hi-vis vest with reflective tape, dual chest pockets, and breathable mesh.',
    'سترة عاكسة من الفئة الثانية بشريط عاكس وجيبين على الصدر وشبك مسامي.',
    'Safety Equipment', 'معدات السلامة',
    55.00, 75.00, 320,
    'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200&h=900&fit=crop',
    'published', true, 3
  ),
  (
    'professional-hand-drill',
    'Professional Cordless Drill 18V',
    'مثقاب لاسلكي احترافي 18V',
    'Brushless 18V cordless drill with two batteries, charger, and carry case. 60Nm torque.',
    'مثقاب لاسلكي احترافي 18 فولت مع بطاريتين وشاحن وحقيبة حمل. عزم دوران 60 نيوتن متر.',
    'Power Tools', 'أدوات كهربائية',
    899.00, 1199.00, 45,
    'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=1200&h=900&fit=crop',
    'published', true, 4
  ),
  (
    'measuring-tape-8m',
    'Heavy-Duty Measuring Tape 8m',
    'متر قياس شاق 8 متر',
    '8-meter steel measuring tape with rubber-coated case, double locking, and metric/imperial markings.',
    'متر قياس فولاذي 8 متر بغلاف مطاطي وقفل مزدوج وعلامات متري وإمبريالي.',
    'Hand Tools', 'أدوات يدوية',
    65.00, null, 180,
    'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=1200&h=900&fit=crop',
    'published', false, 5
  ),
  (
    'led-work-light-50w',
    'LED Work Light 50W',
    'كشاف عمل LED 50 وات',
    'Portable rechargeable 50W LED work light with adjustable stand and 8-hour runtime.',
    'كشاف عمل LED محمول قابل لإعادة الشحن 50 وات بحامل قابل للتعديل و 8 ساعات تشغيل.',
    'Lighting', 'إضاءة',
    320.00, 425.00, 75,
    'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=1200&h=900&fit=crop',
    'published', false, 6
  ),
  (
    'safety-goggles-anti-fog',
    'Anti-Fog Safety Goggles',
    'نظارات سلامة مضادة للضباب',
    'ANSI Z87.1-rated polycarbonate goggles with anti-fog and scratch-resistant coating, vented frame.',
    'نظارات بولي كاربونات معتمدة ANSI Z87.1 بطلاء مضاد للضباب ومقاوم للخدش، إطار بفتحات تهوية.',
    'Safety Equipment', 'معدات السلامة',
    45.00, 65.00, 280,
    'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=1200&h=900&fit=crop',
    'published', false, 7
  ),
  (
    'angle-grinder-115mm',
    'Angle Grinder 115mm 900W',
    'جلخ زاوية 115 مم 900 وات',
    'Compact angle grinder with side handle, spindle lock, and overload protection. Ideal for cutting and grinding metal.',
    'جلخ زاوية مدمج بمقبض جانبي وقفل المحور وحماية ضد التحميل الزائد. مثالي لقطع وجلخ المعادن.',
    'Power Tools', 'أدوات كهربائية',
    285.00, 380.00, 60,
    'https://images.unsplash.com/photo-1581147036324-c47a03a81d48?w=1200&h=900&fit=crop',
    'published', false, 8
  ),
  (
    'tool-belt-multi-pocket',
    'Heavy-Duty Tool Belt',
    'حزام عدة احترافي',
    'Padded leather tool belt with 12 pockets, hammer loop, and adjustable waist strap up to 50 inches.',
    'حزام عدة جلد مبطّن بـ 12 جيب، حلقة للمطرقة، وحزام خصر قابل للتعديل حتى 50 إنش.',
    'Hand Tools', 'أدوات يدوية',
    175.00, null, 95,
    'https://images.unsplash.com/photo-1426927308491-6380b6a9936f?w=1200&h=900&fit=crop',
    'published', false, 9
  );
