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
        dateFound: row.date_found ? new Date(row.date_found) : undefined,
        tags: parseTags(row.tags),
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
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
        } catch (e) {
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
