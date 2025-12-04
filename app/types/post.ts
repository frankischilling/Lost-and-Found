export interface PostRow {
    id: string;
    title: string;
    post_type: "lost" | "found";
    item_name: string;
    // MySQL TEXT can be nullable; use string | null to match raw row data
    content: string | null;
    description: string | null;
    location_found: string | null;
    date_found: string | null; // DATE serialized as string (YYYY-MM-DD) or null
    tags: unknown | null; // JSON column — might be returned as parsed object or string depending on driver
    photo_ids: unknown | null; // JSON column containing array of photo UUIDs
    is_claimed?: number | boolean; // TINYINT(1) from MySQL
    privacy?: "anyone" | "school_members" | "private"; // ENUM column for post privacy
    // Timestamps from DB are typically serialized as strings (ISO or MySQL format)
    created_at: string;
    updated_at: string;
}

/**
 * Domain-friendly Post type used in app code.
 * - content/description are optional (converted from null -> undefined)
 * - dates are converted to JS Date objects for convenience
 */
export interface Post {
    id: string;
    title: string;
    postType: "lost" | "found";
    itemName: string;
    content?: string;
    description?: string;
    locationFound?: string;
    dateFound?: Date;
    tags?: string[];
    photoIds?: string[]; // Array of photo UUIDs
    isClaimed?: boolean;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Maps a raw DB row to the app-friendly Post type.
 */
export function mapRowToPost(row: PostRow): Post {
    return {
        id: row.id,
        title: row.title,
        postType: row.post_type,
        itemName: row.item_name,
        content: row.content ?? undefined,
        description: row.description ?? undefined,
        locationFound: row.location_found ?? undefined,
        // MySQL DATE comes as YYYY-MM-DD (no timezone) — treat as UTC date
        dateFound: row.date_found ? parseDbDate(row.date_found) : undefined,
        tags: parseTags(row.tags),
        photoIds: parsePhotoIds(row.photo_ids),
        isClaimed: Boolean(row.is_claimed),
        // MySQL DATETIME/TIMESTAMP often serializes without timezone.
        // Normalize to UTC to avoid client local-offset shifts.
        createdAt: parseDbTimestamp(row.created_at),
        updatedAt: parseDbTimestamp(row.updated_at),
    };
}

function parseTags(raw: unknown | null): string[] | undefined {
    if (raw == null) return undefined;
    // If driver already parsed JSON into array
    if (Array.isArray(raw)) return raw.map(String);
    // If it's a string (JSON text), try to parse
    if (typeof raw === "string") {
        try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) return parsed.map(String);
        } catch {
            // not JSON — try comma-separated
            return raw
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean);
        }
    }
    // Unknown shape — attempt to coerce to string and split
    try {
        const s = String(raw);
        return s
            .split(",")
            .map((x) => x.trim())
            .filter(Boolean);
    } catch {
        return undefined;
    }
}

function parsePhotoIds(raw: unknown | null): string[] | undefined {
    if (raw == null) return undefined;
    // If driver already parsed JSON into array
    if (Array.isArray(raw)) return raw.map(String);
    // If it's a string (JSON text), try to parse
    if (typeof raw === "string") {
        try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) return parsed.map(String);
        } catch {
            return undefined;
        }
    }
    return undefined;
}

// Parses a MySQL DATE string (YYYY-MM-DD) as UTC midnight
function parseDbDate(s: string): Date {
    const m = /^\d{4}-\d{2}-\d{2}$/.exec(s);
    if (!m) return new Date(s);
    return new Date(`${s}T00:00:00Z`);
}

// Parses a MySQL datetime/timestamp string lacking timezone as UTC
function parseDbTimestamp(s: string): Date {
    const hasTimezone = /[zZ]|[+-]\d{2}:?\d{2}$/.test(s);
    if (hasTimezone) return new Date(s);
    const iso = s.replace(" ", "T") + "Z";
    return new Date(iso);
}
