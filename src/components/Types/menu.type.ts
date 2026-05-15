export type SiteMenuItem = {
  id: string;
  label: string;
  path: string;
  order: number;
  isActive: boolean;
  isExternal: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type SiteMenuFormPayload = {
  label: string;
  path: string;
  order: number;
  isActive: boolean;
  isExternal: boolean;
};

/** Map API rows to our shape (supports legacy `href` if present). */
export function parseSiteMenuItem(raw: unknown): SiteMenuItem | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.id !== "string") return null;

  const path =
    typeof r.path === "string"
      ? r.path
      : typeof r.href === "string"
        ? r.href
        : "";

  return {
    id: r.id,
    label: typeof r.label === "string" ? r.label : "",
    path,
    order: typeof r.order === "number" ? r.order : Number(r.order) || 0,
    isActive: Boolean(r.isActive ?? true),
    isExternal: Boolean(r.isExternal ?? false),
    createdAt: typeof r.createdAt === "string" ? r.createdAt : undefined,
    updatedAt: typeof r.updatedAt === "string" ? r.updatedAt : undefined,
  };
}
