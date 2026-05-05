/**
 * Five core service sectors used by the home BentoGrid.
 * `iconKey` references @tabler/icons-react component names.
 */

export type SectorId = "residential" | "structural" | "interior" | "consulting" | "general";

export type Sector = {
  id: SectorId;
  /** Slug of the matching service detail page. */
  serviceSlug: string;
  iconKey: string;
};

export const SECTORS: Sector[] = [
  { id: "residential", serviceSlug: "residential-construction", iconKey: "IconHome" },
  { id: "structural", serviceSlug: "structural-works", iconKey: "IconBuildingSkyscraper" },
  { id: "interior", serviceSlug: "interior-finishing", iconKey: "IconBrush" },
  { id: "consulting", serviceSlug: "engineering-consulting", iconKey: "IconCompass" },
  { id: "general", serviceSlug: "general-contracting", iconKey: "IconHelmet" },
];
