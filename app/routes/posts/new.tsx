import { useState } from "react";
import { useNavigate } from "react-router";
import type { PostRow, Post } from "~/types/post";
import { mapRowToPost } from "~/types/post";

export function meta() {
    return [{ title: "Create Post" }, { name: "description", content: "Create a new post" }];
}

export default function CreatePost() {
    const navigate = useNavigate();
    const [title, setTitle] = useState("");
    const [postType, setPostType] = useState<"lost" | "found">("found");
    const [itemName, setItemName] = useState("");
    const [description, setDescription] = useState("");
    const [content, setContent] = useState("");
    const [locationFound, setLocationFound] = useState("");
    const [dateFound, setDateFound] = useState("");
    const [tags, setTags] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            // Adjust this endpoint if your backend expects a different URL for creating posts
            const payload = {
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

            const response = await fetch("https://project.frankhagan.online/posts.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(text || "Failed to create post");
            }

            // Try to parse returned post (optional)
            try {
                const data = await response.json();
                // If your endpoint returns the created row as `post` or similar, you can map it
                if (data?.post) {
                    const row: PostRow = data.post;
                    const created = mapRowToPost(row);
                    // you could navigate to the post detail page if one exists
                }
            } catch (err) {
                // ignore JSON parse errors
            }

            // Navigate back to home or posts list
            navigate("/");
        } catch (err: any) {
            setError(err?.message ?? String(err));
            console.error("Create post error:", err);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <main className="pt-16 p-4 container m-auto">
            <h1 className="text-3xl font-bold mb-4">Create a Post</h1>
            <form onSubmit={handleSubmit} className="max-w-lg m-auto">
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

                {error && <p className="text-red-600 mb-2">{error}</p>}

                <div className="flex gap-2">
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded" disabled={submitting}>
                        {submitting ? "Creating…" : "Create Post"}
                    </button>
                    <button type="button" className="px-4 py-2 bg-gray-200 rounded" onClick={() => navigate(-1)}>
                        Cancel
                    </button>
                </div>
            </form>
        </main>
    );
}
