/**
 * Hand-written Database types matching supabase/migrations/.
 *
 * Regenerate via the Supabase CLI when a personal access token is set up:
 *   pnpm dlx supabase gen types typescript --project-id dmfwblgbiwgrhffncuxp \
 *     --schema public > src/lib/types/supabase.ts
 *
 * Until then: keep this file in sync with the migrations by hand.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "admin" | "employee" | "member";
export type PublishStatus = "draft" | "published" | "archived";
export type CareerStatus = "draft" | "open" | "closed";
export type ApplicationStatus =
  | "new"
  | "reviewing"
  | "shortlisted"
  | "rejected"
  | "hired";
export type ContractorStatus = "new" | "reviewing" | "approved" | "rejected";
export type RfqStatus =
  | "new"
  | "in_progress"
  | "quoted"
  | "won"
  | "lost"
  | "closed";
export type MessageStatus = "new" | "read" | "replied" | "closed";
export type MediaVisibility = "public" | "private";
export type MediaKind = "image" | "video" | "document";
export type BudgetRange =
  | "under_100k"
  | "100k_500k"
  | "500k_1m"
  | "1m_5m"
  | "over_5m"
  | "unspecified";

interface BaseRow {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface Profile extends BaseRow {
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  phone: string | null;
  must_change_password: boolean;
}
type ProfileInsert = Partial<BaseRow> & {
  id: string;
  email: string;
  role?: UserRole;
  full_name?: string | null;
  avatar_url?: string | null;
  phone?: string | null;
  must_change_password?: boolean;
};

export interface Service extends BaseRow {
  slug: string;
  title_en: string;
  title_ar: string;
  summary_en: string | null;
  summary_ar: string | null;
  description_en: string | null;
  description_ar: string | null;
  icon: string | null;
  cover_image_path: string | null;
  sort_order: number;
  status: PublishStatus;
}
type ServiceInsert = Partial<BaseRow> & {
  slug: string;
  title_en: string;
  title_ar: string;
} & Partial<Omit<Service, "id" | "created_at" | "updated_at" | "slug" | "title_en" | "title_ar">>;

export interface Project extends BaseRow {
  slug: string;
  title_en: string;
  title_ar: string;
  summary_en: string | null;
  summary_ar: string | null;
  description_en: string | null;
  description_ar: string | null;
  sector: string | null;
  client: string | null;
  location_en: string | null;
  location_ar: string | null;
  year: number | null;
  cover_image_path: string | null;
  status: PublishStatus;
  is_featured: boolean;
  sort_order: number;
}
type ProjectInsert = Partial<BaseRow> & {
  slug: string;
  title_en: string;
  title_ar: string;
} & Partial<Omit<Project, "id" | "created_at" | "updated_at" | "slug" | "title_en" | "title_ar">>;

export interface ProjectMedia {
  id: string;
  project_id: string;
  kind: MediaKind;
  file_path: string;
  thumbnail_path: string | null;
  caption_en: string | null;
  caption_ar: string | null;
  sort_order: number;
  created_at: string;
}
type ProjectMediaInsert = Partial<Omit<ProjectMedia, "id" | "created_at">> & {
  project_id: string;
  file_path: string;
};

export interface Career extends BaseRow {
  slug: string;
  title_en: string;
  title_ar: string;
  department_en: string | null;
  department_ar: string | null;
  location_en: string | null;
  location_ar: string | null;
  type_en: string | null;
  type_ar: string | null;
  description_en: string | null;
  description_ar: string | null;
  requirements_en: string | null;
  requirements_ar: string | null;
  status: CareerStatus;
  closes_at: string | null;
}
type CareerInsert = Partial<BaseRow> & {
  slug: string;
  title_en: string;
  title_ar: string;
} & Partial<Omit<Career, "id" | "created_at" | "updated_at" | "slug" | "title_en" | "title_ar">>;

export interface JobApplication extends BaseRow {
  career_id: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  cover_letter: string | null;
  cv_file_path: string;
  portfolio_url: string | null;
  linkedin_url: string | null;
  status: ApplicationStatus;
  notes: string | null;
  ip_address: string | null;
}
type JobApplicationInsert = Partial<BaseRow> & {
  full_name: string;
  email: string;
  cv_file_path: string;
} & Partial<Omit<JobApplication, "id" | "created_at" | "updated_at" | "full_name" | "email" | "cv_file_path">>;

export interface ContractorApplication extends BaseRow {
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  country: string | null;
  city: string | null;
  cr_number: string | null;
  vat_number: string | null;
  specialty_en: string | null;
  specialty_ar: string | null;
  years_experience: number | null;
  website: string | null;
  document_paths: string[];
  notes: string | null;
  status: ContractorStatus;
  ip_address: string | null;
}
type ContractorApplicationInsert = Partial<BaseRow> & {
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
} & Partial<Omit<ContractorApplication, "id" | "created_at" | "updated_at" | "company_name" | "contact_name" | "email" | "phone">>;

export interface Rfq extends BaseRow {
  full_name: string;
  email: string;
  phone: string;
  company: string | null;
  project_type: string | null;
  budget: BudgetRange;
  location: string | null;
  start_date: string | null;
  description: string;
  attachment_paths: string[];
  status: RfqStatus;
  assigned_to: string | null;
  internal_notes: string | null;
  ip_address: string | null;
}
type RfqInsert = Partial<BaseRow> & {
  full_name: string;
  email: string;
  phone: string;
  description: string;
} & Partial<Omit<Rfq, "id" | "created_at" | "updated_at" | "full_name" | "email" | "phone" | "description">>;

export interface ContactMessage extends BaseRow {
  full_name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: MessageStatus;
  ip_address: string | null;
}
type ContactMessageInsert = Partial<BaseRow> & {
  full_name: string;
  email: string;
  message: string;
} & Partial<Omit<ContactMessage, "id" | "created_at" | "updated_at" | "full_name" | "email" | "message">>;

export interface Certification extends BaseRow {
  title_en: string;
  title_ar: string;
  issuer_en: string | null;
  issuer_ar: string | null;
  description_en: string | null;
  description_ar: string | null;
  file_path: string;
  thumbnail_path: string | null;
  visibility: MediaVisibility;
  issued_on: string | null;
  expires_on: string | null;
  sort_order: number;
}
type CertificationInsert = Partial<BaseRow> & {
  title_en: string;
  title_ar: string;
  file_path: string;
} & Partial<Omit<Certification, "id" | "created_at" | "updated_at" | "title_en" | "title_ar" | "file_path">>;

export interface MediaStudioItem extends BaseRow {
  kind: MediaKind;
  file_path: string;
  thumbnail_path: string | null;
  caption_en: string | null;
  caption_ar: string | null;
  visibility: MediaVisibility;
  tags: string[];
  sort_order: number;
}
type MediaStudioInsert = Partial<BaseRow> & {
  file_path: string;
} & Partial<Omit<MediaStudioItem, "id" | "created_at" | "updated_at" | "file_path">>;

export interface SiteContent {
  key: string;
  data: Json;
  updated_by: string | null;
  updated_at: string;
}
type SiteContentInsert = {
  key: string;
  data?: Json;
  updated_by?: string | null;
  updated_at?: string;
};

export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: ProfileInsert; Update: Partial<Profile> };
      services: { Row: Service; Insert: ServiceInsert; Update: Partial<Service> };
      projects: { Row: Project; Insert: ProjectInsert; Update: Partial<Project> };
      project_media: {
        Row: ProjectMedia;
        Insert: ProjectMediaInsert;
        Update: Partial<ProjectMedia>;
      };
      careers: { Row: Career; Insert: CareerInsert; Update: Partial<Career> };
      job_applications: {
        Row: JobApplication;
        Insert: JobApplicationInsert;
        Update: Partial<JobApplication>;
      };
      contractor_applications: {
        Row: ContractorApplication;
        Insert: ContractorApplicationInsert;
        Update: Partial<ContractorApplication>;
      };
      rfqs: { Row: Rfq; Insert: RfqInsert; Update: Partial<Rfq> };
      contact_messages: {
        Row: ContactMessage;
        Insert: ContactMessageInsert;
        Update: Partial<ContactMessage>;
      };
      certifications: {
        Row: Certification;
        Insert: CertificationInsert;
        Update: Partial<Certification>;
      };
      media_studio: {
        Row: MediaStudioItem;
        Insert: MediaStudioInsert;
        Update: Partial<MediaStudioItem>;
      };
      site_content: {
        Row: SiteContent;
        Insert: SiteContentInsert;
        Update: Partial<SiteContent>;
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
      is_employee: { Args: Record<string, never>; Returns: boolean };
    };
    Enums: {
      user_role: UserRole;
      publish_status: PublishStatus;
      career_status: CareerStatus;
      application_status: ApplicationStatus;
      contractor_status: ContractorStatus;
      rfq_status: RfqStatus;
      message_status: MessageStatus;
      media_visibility: MediaVisibility;
      media_kind: MediaKind;
      budget_range: BudgetRange;
    };
    CompositeTypes: Record<string, never>;
  };
}
