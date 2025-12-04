import { Link } from "react-router";
import { Card, CardContent, CardDescription, CardTitle } from "../ui/card";
import type { Post } from "~/types/post";
import { cn } from "~/lib/utils";

export default function PostCard({ post, className }: { post: Post; className?: string }) {
    // Get the first photo URL if available
    const photoUrl =
        post.photoIds && post.photoIds.length > 0
            ? import.meta.env.DEV
                ? `/api/view_photo.php?id=${post.photoIds[0]}`
                : `https://project.frankhagan.online/view_photo.php?id=${post.photoIds[0]}`
            : null;

    return (
        <Link to={`/posts/${post.id}`} className="block h-full">
            <Card
                key={post.id}
                className={cn(
                    "border p-4 rounded-xl w-full h-full flex flex-col hover:shadow-lg transition-shadow cursor-pointer gap-3",
                    className
                )}
            >
                <div className="flex items-center gap-2">
                    <span
                        className={`px-2 py-1 text-xs font-semibold rounded ${
                            post.postType === "lost" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                        }`}
                    >
                        {post.postType.toUpperCase()}
                    </span>
                </div>
                <CardTitle className="text-xl font-bold mb-2">{post.title}</CardTitle>
                <CardContent className="shrink-0 w-full h-64 flex items-center justify-center p-0">
                    {photoUrl ? (
                        <img src={photoUrl} alt={post.title} className="w-full h-full rounded object-contain" />
                    ) : (
                        <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center text-gray-500">
                            No image available
                        </div>
                    )}
                </CardContent>
                <CardDescription className="grow">
                    {post.description && <p className="line-clamp-3">{post.description}</p>}
                </CardDescription>
                <p className="text-sm text-gray-600 mt-auto">Posted: {post.createdAt.toLocaleDateString()}</p>
            </Card>
        </Link>
    );
}
