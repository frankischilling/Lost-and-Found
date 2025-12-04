import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import type { PostRow, Post } from "~/types/post";
import { mapRowToPost } from "~/types/post";
import { EditPostSkeleton } from "~/components/posts/edit-skeleton";

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
    const [privacy, setPrivacy] = useState<"anyone" | "school_members" | "private">("anyone");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        setError(null);

        // Fetch single post by id. Adjust the backend query param as needed.
        const url = import.meta.env.DEV
            ? `/api/posts.php?id=${encodeURIComponent(id)}`
            : `https://project.frankhagan.online/posts.php?id=${encodeURIComponent(id)}`;
        fetch(url, {
            credentials: "include",
        })
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
                setPrivacy((row.privacy as "anyone" | "school_members" | "private") ?? "anyone");
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
            post_type: postType,
            item_name: itemName || title,
            title,
            description,
            content,
            location_found: locationFound || null,
            date_found: dateFound || null,
            privacy,
            tags: tags
                ? tags
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean)
                : null,
        };

        try {
            const url = import.meta.env.DEV
                ? `/api/posts.php?id=${encodeURIComponent(id)}`
                : `https://project.frankhagan.online/posts.php?id=${encodeURIComponent(id)}`;
            const res = await fetch(url, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "Failed to update post");
            }
            // Navigate back to the post view page
            navigate(`/posts/${id}`);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) {
        return <EditPostSkeleton />;
    }

    return (
        <main className="pt-16 p-4 container mx-auto">
            <div className="m-auto w-full lg:w-2/5">
                <h1 className="text-2xl font-bold mb-2 text-center">Edit Post</h1>
                <p className="text-center text-gray-600 mb-4">
                    Update your post details below. All changes will be saved when you click "Save Changes".
                </p>
                {error && <p className="text-red-600 mb-4 text-center">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="block font-medium" htmlFor="title">
                            Title
                        </label>
                        <input
                            name="title"
                            id="title"
                            aria-label="Post title"
                            placeholder="Enter a short title"
                            className="w-full border p-2 rounded"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block font-medium" htmlFor="item_name">
                            Item name
                        </label>
                        <input
                            name="item_name"
                            id="item_name"
                            aria-label="Item name"
                            placeholder="Name of the item (required)"
                            className="w-full border p-2 rounded"
                            value={itemName}
                            onChange={(e) => setItemName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block font-medium" htmlFor="post_type">
                            Post type
                        </label>
                        <select
                            name="post_type"
                            id="post_type"
                            className="w-full border p-2 rounded bg-white cursor-pointer"
                            value={postType}
                            onChange={(e) => setPostType(e.target.value as "lost" | "found")}
                        >
                            <option value="found">Found</option>
                            <option value="lost">Lost</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="block font-medium" htmlFor="description">
                            Short description
                        </label>
                        <textarea
                            name="description"
                            id="description"
                            aria-label="Short description"
                            placeholder="Short summary (optional)"
                            className="w-full border p-2 rounded"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block font-medium" htmlFor="content">
                            Content
                        </label>
                        <textarea
                            name="content"
                            id="content"
                            aria-label="Content"
                            placeholder="Full post content (optional)"
                            className="w-full border p-2 rounded"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={6}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block font-medium" htmlFor="location_found">
                            Location found
                        </label>
                        <input
                            name="location_found"
                            id="location_found"
                            aria-label="Location found"
                            placeholder="Where the item was found (optional)"
                            className="w-full border p-2 rounded"
                            value={locationFound}
                            onChange={(e) => setLocationFound(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block font-medium" htmlFor="date_found">
                            Date found
                        </label>
                        <input
                            type="date"
                            name="date_found"
                            id="date_found"
                            aria-label="Date found"
                            className="w-full border p-2 rounded"
                            value={dateFound}
                            onChange={(e) => setDateFound(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block font-medium" htmlFor="tags">
                            Tags
                        </label>
                        <input
                            name="tags"
                            id="tags"
                            aria-label="Tags"
                            placeholder="Comma-separated tags (optional)"
                            className="w-full border p-2 rounded"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block font-medium" htmlFor="privacy">
                            Privacy
                        </label>
                        <select
                            name="privacy"
                            id="privacy"
                            className="w-full border p-2 rounded bg-white cursor-pointer"
                            value={privacy}
                            onChange={(e) => setPrivacy(e.target.value as "anyone" | "school_members" | "private")}
                        >
                            <option value="anyone">Public - Anyone can view</option>
                            <option value="school_members">School Members - Only logged-in users</option>
                            <option value="private">Private - Only you and admins can view</option>
                        </select>
                        <p className="text-sm text-gray-600">
                            Control who can see this post. Public posts are visible to everyone. Private posts are only
                            visible to you and admins.
                        </p>
                    </div>

                    <div className="flex gap-2 pt-4">
                        <button
                            type="submit"
                            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition-colors"
                            disabled={submitting}
                        >
                            {submitting ? "Saving…" : "Save Changes"}
                        </button>
                        <button
                            type="button"
                            className="flex-1 px-6 py-3 bg-gray-200 rounded font-medium hover:bg-gray-300 transition-colors"
                            onClick={() => navigate(-1)}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}
