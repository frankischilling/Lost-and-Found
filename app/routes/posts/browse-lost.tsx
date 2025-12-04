import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { mapRowToPost, type Post, type PostRow } from "~/types/post";
import PostCard from "~/components/posts/post-card";
import { PostGridSkeleton } from "~/components/posts/post-card-skeleton";
import { useAuth } from "~/lib/authContext";

export default function BrowseLost() {
    const location = useLocation();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const { loggedIn } = useAuth();

    const loginUrl = `${
        import.meta.env.DEV ? "/api/auth/login.php" : "https://project.frankhagan.online/auth/login.php"
    }?return_to=${encodeURIComponent(location.pathname + location.search)}`;

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
                setPosts(all.filter((p) => p.postType === "lost"));
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    // Filter posts based on search query
    const filteredPosts = posts
        .filter((post) => {
            if (!searchQuery.trim()) return true;
            const query = searchQuery.toLowerCase();
            return (
                post.title.toLowerCase().includes(query) ||
                post.itemName.toLowerCase().includes(query) ||
                post.description?.toLowerCase().includes(query) ||
                post.content?.toLowerCase().includes(query) ||
                post.locationFound?.toLowerCase().includes(query) ||
                post.tags?.some((tag) => tag.toLowerCase().includes(query))
            );
        })
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return (
        <main className="p-4 md:p-8 w-full">
            <section className="mt-8 md:mt-16">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-center mb-4">Lost Items</h2>
                <p className="text-center text-gray-600 mb-8 md:mb-12 max-w-2xl mx-auto">
                    Browse items that people have lost. If you've found something, check if it matches any of these
                    listings.
                </p>
                <div className="max-w-2xl mx-auto mb-8">
                    <input
                        type="text"
                        placeholder="Search lost items by title, description, location, tags..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {searchQuery && (
                        <p className="text-sm text-gray-600 mt-2">
                            Showing {filteredPosts.length} of {posts.length} items
                        </p>
                    )}
                </div>
                {!loggedIn && posts.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-center">
                        <p className="text-blue-800">
                            <a href={loginUrl} className="font-semibold underline">
                                Please sign in
                            </a>{" "}
                            to view all posts. Some posts may be hidden.
                        </p>
                    </div>
                )}
                {loading ? (
                    <PostGridSkeleton count={Math.max(3, posts.length)} />
                ) : posts.length === 0 ? (
                    <p className="text-center">
                        {!loggedIn ? (
                            <>
                                <a href={loginUrl} className="font-semibold text-blue-600 underline">
                                    Please sign in to view posts
                                </a>
                            </>
                        ) : (
                            "No lost items found."
                        )}
                    </p>
                ) : filteredPosts.length === 0 ? (
                    <p className="text-center text-gray-600">No items match your search. Try different keywords.</p>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                            {filteredPosts.map((post) => (
                                <PostCard key={post.id} post={post} />
                            ))}
                        </div>
                        <div className="mt-12 bg-gray-50 border border-gray-200 rounded-lg p-8 text-center max-w-2xl mx-auto">
                            <h3 className="text-xl font-semibold mb-3">Don't see your item here?</h3>
                            <p className="text-gray-600 mb-4">
                                If you found something and it's not listed here, report it so the owner can find it.
                            </p>
                            <Link
                                to="/posts/new/found"
                                className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Report a Found Item
                            </Link>
                        </div>
                    </>
                )}
            </section>
        </main>
    );
}
