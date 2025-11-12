import { useEffect, useState } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/home";
import { mapRowToPost, type Post, type PostRow } from "~/types/post";

export function meta({}: Route.MetaArgs) {
    return [{ title: "Lost and Found" }, { name: "description", content: "Welcome to Lost and Found!" }];
}

export default function Home() {
    const [posts, setPosts] = useState<Post[]>([]);

    const getPosts = async () => {
        try {
            const response = await fetch("https://project.frankhagan.online/posts.php");
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
        }
    };

    useEffect(() => {
        getPosts();
    }, []);

    return (
        <main className="pt-16 p-4 container mx-auto">
            <h1 className="text-4xl font-bold mb-4">Welcome to Lost and Found</h1>
            <div className="mb-4">
                <Link
                    to="/posts/new"
                    className="inline-block px-4 py-2 bg-wentworth-gold--2 text-white rounded hover:bg-wentworth-gold"
                >
                    Create Post
                </Link>
            </div>
            <p className="text-lg">
                This is the home page of the Lost and Found application. Here you can report lost items, found items,
                and search for items that have been reported.
            </p>

            <section className="mt-8">
                <h2 className="text-2xl font-semibold mb-4">Recent Posts</h2>
                {posts.length === 0 ? (
                    <p>No posts available.</p>
                ) : (
                    <ul className="space-y-4">
                        {posts.map((post) => (
                            <li key={post.id} className="border p-4 rounded shadow">
                                <h3 className="text-xl font-bold">{post.title}</h3>
                                {post.description && <p className="mt-2">{post.description}</p>}
                                <p className="mt-2 text-sm text-gray-600">
                                    Posted on: {post.createdAt.toLocaleDateString()}
                                </p>
                                <p className="mt-2">ID: {post.id}</p>
                                <div className="mt-3 flex gap-2">
                                    <Link
                                        to={`/posts/${post.id}/edit`}
                                        className="px-3 py-1 bg-yellow-500 text-white rounded"
                                    >
                                        Edit
                                    </Link>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </main>
    );
}
