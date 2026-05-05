-- Sample certifications & accreditations. Public visibility — file_path points to
-- the bilingual company-profile PDF as a stand-in until real cert PDFs are uploaded
-- to ImageKit. Idempotent on (title_en).

create unique index if not exists certifications_title_en_uq on public.certifications(title_en);

insert into public.certifications
  (title_en, title_ar, issuer_en, issuer_ar, description_en, description_ar,
   file_path, thumbnail_path, visibility, issued_on, expires_on, sort_order)
values
  ('ISO 9001:2015 — Quality Management',
   'آيزو 9001:2015 — إدارة الجودة',
   'International Organization for Standardization',
   'المنظمة الدولية للمعايير',
   'Certifies our quality-management system across project delivery, supplier oversight, and continuous improvement.',
   'يشهد بمطابقة نظام إدارة الجودة لدينا في تسليم المشاريع وإدارة الموردين والتحسين المستمر.',
   '/documents/company-profile-en.pdf',
   'https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=800&auto=format&fit=crop',
   'public', '2024-03-15', '2027-03-14', 10),

  ('ISO 14001:2015 — Environmental Management',
   'آيزو 14001:2015 — الإدارة البيئية',
   'International Organization for Standardization',
   'المنظمة الدولية للمعايير',
   'Verifies controls for environmental impact during construction — waste, emissions, and site rehabilitation.',
   'يوثّق ضوابط الأثر البيئي أثناء الإنشاء — النفايات والانبعاثات وإعادة تأهيل الموقع.',
   '/documents/company-profile-en.pdf',
   'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=800&auto=format&fit=crop',
   'public', '2024-03-15', '2027-03-14', 20),

  ('ISO 45001:2018 — Occupational Health & Safety',
   'آيزو 45001:2018 — الصحة والسلامة المهنية',
   'International Organization for Standardization',
   'المنظمة الدولية للمعايير',
   'Independent verification of our occupational health and safety management system on site and in office.',
   'تحقق مستقل من نظام إدارة الصحة والسلامة المهنية في المواقع والمكاتب.',
   '/documents/company-profile-en.pdf',
   'https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?q=80&w=800&auto=format&fit=crop',
   'public', '2024-06-01', '2027-05-31', 30),

  ('Saudi Contractors Authority — Membership',
   'الهيئة السعودية للمقاولين — العضوية',
   'Saudi Contractors Authority',
   'الهيئة السعودية للمقاولين',
   'Active membership confirming our standing as a registered Saudi contractor.',
   'عضوية فعّالة تؤكد وضعنا كمقاول سعودي مسجّل.',
   '/documents/company-profile-ar.pdf',
   'https://images.unsplash.com/photo-1607968565043-36af90dde238?q=80&w=800&auto=format&fit=crop',
   'public', '2023-11-01', '2026-10-31', 40),

  ('SOCPA — Saudi Organization for Chartered Accountants',
   'الهيئة السعودية للمحاسبين القانونيين — SOCPA',
   'SOCPA',
   'الهيئة السعودية للمحاسبين القانونيين',
   'Compliance attestation aligned with SOCPA-issued accounting and auditing standards.',
   'إقرار امتثال متوافق مع معايير المحاسبة والمراجعة الصادرة عن SOCPA.',
   '/documents/company-profile-en.pdf',
   'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=800&auto=format&fit=crop',
   'public', '2024-01-10', '2026-01-09', 50),

  ('Saudi Council of Engineers — Firm Accreditation',
   'هيئة المهندسين السعوديين — اعتماد المنشأة',
   'Saudi Council of Engineers',
   'هيئة المهندسين السعوديين',
   'Firm-level accreditation enabling our engineers to issue and seal official drawings within the Kingdom.',
   'اعتماد على مستوى المنشأة يُمكّن مهندسينا من إصدار واعتماد المخططات الرسمية داخل المملكة.',
   '/documents/company-profile-ar.pdf',
   'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=800&auto=format&fit=crop',
   'public', '2023-09-20', '2026-09-19', 60)
on conflict (title_en) do nothing;
