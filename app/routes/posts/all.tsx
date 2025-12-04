import { useEffect, useState } from "react";
import { mapRowToPost, type Post, type PostRow } from "~/types/post";
import PostCard from "~/components/posts/post-card";
import { ProtectedRoute } from "~/components/ProtectedRoute";

export default function AllPosts() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "claimed" | "unclaimed">("all");

    useEffect(() => {
        async function load() {
            try {
                const url = import.meta.env.DEV ? "/api/posts.php" : "https://project.frankhagan.online/posts.php";
                const res = await fetch(url, {
                    credentials: "include",
                });
                const json = await res.json();
                const rows: PostRow[] = json.posts || [];
                const all = rows.map(mapRowToPost);
                setPosts(all);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const filteredPosts = posts.filter((p) => {
        if (filter === "claimed") return p.isClaimed;
        if (filter === "unclaimed") return !p.isClaimed;
        return true;
    });

    return (
        <ProtectedRoute adminOnly>
            <main className="p-4 md:p-8 w-full">
                <section className="mt-8 md:mt-16">
                    <div className="flex items-center justify-between mb-8 md:mb-16">
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold">All Posts</h2>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setFilter("all")}
                                className={`px-4 py-2 rounded-md ${
                                    filter === "all"
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                }`}
                            >
                                All ({posts.length})
                            </button>
                            <button
                                onClick={() => setFilter("unclaimed")}
                                className={`px-4 py-2 rounded-md ${
                                    filter === "unclaimed"
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                }`}
                            >
                                Active ({posts.filter((p) => !p.isClaimed).length})
                            </button>
                            <button
                                onClick={() => setFilter("claimed")}
                                className={`px-4 py-2 rounded-md ${
                                    filter === "claimed"
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                }`}
                            >
                                Claimed/Found ({posts.filter((p) => p.isClaimed).length})
                            </button>
                        </div>
                    </div>
                    {loading ? (
                        <p className="text-center">Loading…</p>
                    ) : filteredPosts.length === 0 ? (
                        <p className="text-center">No posts found.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                            {filteredPosts.map((post) => (
                                <PostCard key={post.id} post={post} />
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </ProtectedRoute>
    );
}
