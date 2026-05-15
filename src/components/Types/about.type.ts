/** Public “about profile” payload (API uses `professonName`). */
export type AboutItem = {
  id: string;
  nameTitle: string;
  professonName: string;
  shortdescription: string;
  imageUrl: string | null;
  resumeUrl: string | null;
  cvUrl: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type AboutFormPayload = {
  nameTitle: string;
  professonName: string;
  shortdescription: string;
  imageUrl: string;
  resumeUrl: string;
  cvUrl: string;
};

/** Multipart body for POST/PATCH /about (field names match API JSON keys). */
export function buildAboutFormData(payload: AboutFormPayload): FormData {
  const fd = new FormData();
  fd.append('nameTitle', payload.nameTitle.trim());
  fd.append('professonName', payload.professonName.trim());
  fd.append('shortdescription', payload.shortdescription.trim());
  fd.append('imageUrl', payload.imageUrl.trim());
  fd.append('resumeUrl', payload.resumeUrl.trim());
  fd.append('cvUrl', payload.cvUrl.trim());
  return fd;
}

function strOrEmpty(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

function strOrNull(v: unknown): string | null {
  const s = strOrEmpty(v);
  return s ? s : null;
}

/** Map API rows / legacy aliases. */
export function parseAboutRecord(raw: unknown): AboutItem | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.id !== 'string') return null;

  const img =
    strOrNull(r.imageUrl) ?? strOrNull(r.thumbnail) ?? strOrNull(r.avatarUrl);

  return {
    id: r.id,
    nameTitle: strOrEmpty(r.nameTitle) || strOrEmpty(r.title) || strOrEmpty(r.name) || '—',
    professonName:
      strOrEmpty(r.professonName) ||
      strOrEmpty(r.professionName) ||
      strOrEmpty(r.profession) ||
      '',
    shortdescription:
      strOrEmpty(r.shortdescription) ||
      strOrEmpty(r.shortDescription) ||
      strOrEmpty(r.description) ||
      strOrEmpty(r.content) ||
      '',
    imageUrl: img,
    resumeUrl: strOrNull(r.resumeUrl),
    cvUrl: strOrNull(r.cvUrl),
    createdAt: typeof r.createdAt === 'string' ? r.createdAt : undefined,
    updatedAt: typeof r.updatedAt === 'string' ? r.updatedAt : undefined,
  };
}

/** List from GET /profile/about or /profile (array, single object, or { data, about }). */
export function normalizeAboutPayload(apiData: unknown): unknown[] {
  if (Array.isArray(apiData)) return apiData;
  if (!apiData || typeof apiData !== 'object') return [];
  const o = apiData as Record<string, unknown>;
  const d = o.data;
  if (Array.isArray(d)) return d;
  if (d && typeof d === 'object' && !Array.isArray(d)) {
    const row = d as Record<string, unknown>;
    if (typeof row.id === 'string') return [d];
    const nested = row.about;
    if (Array.isArray(nested)) return nested;
    if (nested && typeof nested === 'object' && typeof (nested as { id?: unknown }).id === 'string') {
      return [nested];
    }
  }
  const about = o.about;
  if (Array.isArray(about)) return about;
  if (about && typeof about === 'object' && typeof (about as { id?: unknown }).id === 'string') {
    return [about];
  }
  if (typeof o.id === 'string') return [apiData];
  return [];
}

/** GET /profile — extract primary about/profile block if embedded. */
export function parseProfileAboutResponse(res: unknown): AboutItem | null {
  if (!res || typeof res !== 'object') return null;
  const o = res as Record<string, unknown>;
  let root: unknown = o.data !== undefined ? o.data : res;
  if (Array.isArray(root) && root.length > 0) {
    root = root[0];
  }
  if (!root || typeof root !== 'object' || Array.isArray(root)) return null;
  const payload = root as Record<string, unknown>;
  const about = payload.about ?? payload.profile ?? payload;
  return parseAboutRecord(about);
}

export function plainTextPreview(htmlOrText: string, maxLen: number): string {
  const stripped = htmlOrText
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (stripped.length <= maxLen) return stripped;
  return `${stripped.slice(0, maxLen)}…`;
}
