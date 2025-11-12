import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import type { PostRow, Post } from "~/types/post";
import { mapRowToPost } from "~/types/post";

export function meta() {
    return [{ title: "Edit Post" }, { name: "description", content: "Edit an existing post" }];
}

export default function EditPost() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // form fields
    const [title, setTitle] = useState("");
    const [postType, setPostType] = useState<"lost" | "found">("found");
    const [itemName, setItemName] = useState("");
    const [description, setDescription] = useState("");
    const [content, setContent] = useState("");
    const [locationFound, setLocationFound] = useState("");
    const [dateFound, setDateFound] = useState("");
    const [tags, setTags] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        setError(null);

        // Fetch single post by id. Adjust the backend query param as needed.
        fetch(`https://project.frankhagan.online/posts.php?id=${encodeURIComponent(id)}`)
            .then(async (res) => {
                if (!res.ok) throw new Error("Failed to fetch post");
                const data = await res.json();
                const row: PostRow | undefined = data ?? (Array.isArray(data.posts) ? data.posts[0] : undefined);
                if (!row) throw new Error("Post not found");
                const post: Post = mapRowToPost(row);

                setTitle(post.title ?? "");
                setPostType((row.post_type as "lost" | "found") ?? "found");
                setItemName((row.item_name as string) ?? post.title ?? "");
                setDescription(post.description ?? "");
                setContent(post.content ?? "");
                setLocationFound(post.locationFound ?? "");
                setDateFound(post.dateFound ? post.dateFound.toISOString().slice(0, 10) : "");
                setTags((post.tags ?? []).join(", "));
            })
            .catch((err) => setError(String(err)))
            .finally(() => setLoading(false));
    }, [id]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!id) return setError("Missing post id");
        setSubmitting(true);
        setError(null);

        const payload = {
            action: "update",
            id,
            post_type: postType,
            item_name: itemName || title,
            title,
            description,
            content,
            location_found: locationFound || null,
            date_found: dateFound || null,
            tags: tags
                ? tags
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean)
                : null,
        } as const;

        try {
            const res = await fetch("https://project.frankhagan.online/posts.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "Failed to update post");
            }
            // Optionally parse response to show updated data
            navigate("/");
        } catch (err: any) {
            setError(err?.message ?? String(err));
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) {
        return (
            <main className="pt-16 p-4 container mx-auto">
                <p>Loading post...</p>
            </main>
        );
    }

    return (
        <main className="pt-16 p-4 container mx-auto">
            <h1 className="text-3xl font-bold mb-4">Edit Post</h1>
            {error && <p className="text-red-600 mb-2">{error}</p>}
            <form onSubmit={handleSubmit} className="max-w-lg">
                <label className="block mb-2">
                    <span className="text-sm font-medium">Title</span>
                    <input
                        name="title"
                        id="title"
                        aria-label="Post title"
                        placeholder="Enter a short title"
                        className="mt-1 block w-full border rounded px-3 py-2"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </label>

                <label className="block mb-2">
                    <span className="text-sm font-medium">Item name</span>
                    <input
                        name="item_name"
                        id="item_name"
                        aria-label="Item name"
                        placeholder="Name of the item (required)"
                        className="mt-1 block w-full border rounded px-3 py-2"
                        value={itemName}
                        onChange={(e) => setItemName(e.target.value)}
                        required
                    />
                </label>

                <label className="block mb-2">
                    <span className="text-sm font-medium">Post type</span>
                    <select
                        name="post_type"
                        id="post_type"
                        className="mt-1 block w-full border rounded px-3 py-2"
                        value={postType}
                        onChange={(e) => setPostType(e.target.value as "lost" | "found")}
                    >
                        <option value="found">Found</option>
                        <option value="lost">Lost</option>
                    </select>
                </label>

                <label className="block mb-2">
                    <span className="text-sm font-medium">Short description</span>
                    <textarea
                        name="description"
                        id="description"
                        aria-label="Short description"
                        placeholder="Short summary (optional)"
                        className="mt-1 block w-full border rounded px-3 py-2"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                    />
                </label>

                <label className="block mb-4">
                    <span className="text-sm font-medium">Content</span>
                    <textarea
                        name="content"
                        id="content"
                        aria-label="Content"
                        placeholder="Full post content (optional)"
                        className="mt-1 block w-full border rounded px-3 py-2"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={6}
                    />
                </label>

                <label className="block mb-2">
                    <span className="text-sm font-medium">Location found</span>
                    <input
                        name="location_found"
                        id="location_found"
                        aria-label="Location found"
                        placeholder="Where the item was found (optional)"
                        className="mt-1 block w-full border rounded px-3 py-2"
                        value={locationFound}
                        onChange={(e) => setLocationFound(e.target.value)}
                    />
                </label>

                <label className="block mb-2">
                    <span className="text-sm font-medium">Date found</span>
                    <input
                        type="date"
                        name="date_found"
                        id="date_found"
                        aria-label="Date found"
                        className="mt-1 block w-full border rounded px-3 py-2"
                        value={dateFound}
                        onChange={(e) => setDateFound(e.target.value)}
                    />
                </label>

                <label className="block mb-4">
                    <span className="text-sm font-medium">Tags</span>
                    <input
                        name="tags"
                        id="tags"
                        aria-label="Tags"
                        placeholder="Comma-separated tags (optional)"
                        className="mt-1 block w-full border rounded px-3 py-2"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                    />
                </label>

                <div className="flex gap-2">
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded" disabled={submitting}>
                        {submitting ? "Saving…" : "Save Changes"}
                    </button>
                    <button type="button" className="px-4 py-2 bg-gray-200 rounded" onClick={() => navigate(-1)}>
                        Cancel
                    </button>
                </div>
            </form>
        </main>
    );
}
