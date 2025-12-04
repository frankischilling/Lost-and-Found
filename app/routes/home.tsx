import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { mapRowToPost, type Post, type PostRow } from "~/types/post";
import { Button } from "~/components/ui/button";
import PostCard from "~/components/posts/post-card";
import { PostGridSkeleton } from "~/components/posts/post-card-skeleton";
import { MessageCircleQuestion, Search } from "lucide-react";
import { useAuth } from "~/lib/authContext";

export default function Home() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const { loggedIn } = useAuth();
    const location = useLocation();

    const loginUrl = `${
        import.meta.env.DEV ? "/api/auth/login.php" : "https://project.frankhagan.online/auth/login.php"
    }?return_to=${encodeURIComponent(location.pathname + location.search)}`;

    useEffect(() => {
        async function getPosts() {
            try {
                setLoading(true);
                const url = import.meta.env.DEV ? "/api/posts.php" : "https://project.frankhagan.online/posts.php";
                const response = await fetch(url, {
                    credentials: "include",
                });
                if (response.ok) {
                    const data = await response.json();
                    const dataRows: PostRow[] = data.posts;
                    const posts = dataRows.map(mapRowToPost);
                    setPosts(posts);
                } else {
                    console.error("Failed to fetch posts");
                }
            } catch (error) {
                console.error("Error fetching posts:", error);
            } finally {
                setLoading(false);
            }
        }
        getPosts();
    }, []);

    return (
        <main className="p-4 md:p-8 w-full">
            <div className="mb-8 flex flex-col md:flex-row items-stretch justify-around w-full px-4 md:px-32 py-8 md:py-16 gap-8 md:gap-16">
                <div className="text-center md:text-left">
                    <h1 className="text-5xl md:text-6xl lg:text-8xl font-semibold mb-1">Find & Recover</h1>
                    <h1 className="text-5xl md:text-6xl lg:text-8xl font-semibold mb-4 md:mb-6 from-green-800 via-50% via-black/80 to-red-800 bg-linear-to-r bg-clip-text text-transparent w-fit mx-auto md:mx-0">
                        With Ease
                    </h1>
                    <p className="text-lg text-center md:text-xl lg:text-2xl w-fit md:ml-2 mx-auto md:mx-0">
                        Community Led Lost & Found Recovery
                    </p>
                </div>
                <div className="mb-4 flex flex-col justify-around items-stretch gap-4 md:gap-6">
                    <Link to="/posts/new/lost" className="rounded-xl hover:cursor-pointer w-full">
                        <Button className="bg-red-700 text-white text-lg md:text-xl lg:text-2xl px-6 md:px-8 py-3 md:py-4 w-full gap-3 md:gap-4">
                            <MessageCircleQuestion className="size-6 md:size-8" />
                            Lost an Item?
                        </Button>
                    </Link>
                    <Link to="/posts/new/found" className="rounded-xl hover:cursor-pointer w-full">
                        <Button className="bg-green-600 text-white text-lg md:text-xl lg:text-2xl px-6 md:px-8 py-3 md:py-4 w-full gap-3 md:gap-4">
                            <Search className="size-6 md:size-8" />
                            Found an Item?
                        </Button>
                    </Link>
                </div>
            </div>

            <section className="mt-8 md:mt-16">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-center mb-8 md:mb-16">
                    Recent Posts
                </h2>
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
                            "No posts available."
                        )}
                    </p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                        {[...posts]
                            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                            .map((post) => (
                                <PostCard key={post.id} post={post} />
                            ))}
                    </div>
                )}
            </section>
        </main>
    );
}
