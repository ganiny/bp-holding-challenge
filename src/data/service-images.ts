/**
 * Placeholder cover images per service slug.
 * TODO: replace with real photography uploaded to ImageKit, then read
 *   `services.cover_image_path` from Supabase as the source of truth.
 */
export const SERVICE_PLACEHOLDER_IMAGE: Record<string, string> = {
  "residential-construction":
    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1600&auto=format&fit=crop",
  "structural-works":
    "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1600&auto=format&fit=crop",
  "interior-finishing":
    "https://images.unsplash.com/photo-1556909211-d5b0d6f8efe7?q=80&w=1600&auto=format&fit=crop",
  "engineering-consulting":
    "https://images.unsplash.com/photo-1486325212027-8081e485255e?q=80&w=1600&auto=format&fit=crop",
  "general-contracting":
    "https://images.unsplash.com/photo-1487958449943-2429e8be8625?q=80&w=1600&auto=format&fit=crop",
};

export const FALLBACK_PLACEHOLDER =
  "https://images.unsplash.com/photo-1487958449943-2429e8be8625?q=80&w=1600&auto=format&fit=crop";
