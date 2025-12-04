import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { useAuth } from "../lib/authContext";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { mapRowToPost, type Post, type PostRow } from "~/types/post";
import PostCard from "~/components/posts/post-card";
import { ProfileSkeleton } from "~/components/profile/profile-skeleton";

interface UserDetails {
    id: string;
    email: string;
    name: string;
    picture?: string;
    phone?: string;
    created_at: string;
    updated_at: string;
    last_login?: string;
    role?: string;
}

export default function Profile() {
    const { user, loggedIn, loading: authLoading } = useAuth();
    const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userPosts, setUserPosts] = useState<Post[]>([]);
    const [loadingPosts, setLoadingPosts] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (authLoading) return;

        if (!loggedIn || !user) {
            const loginUrl = `${
                import.meta.env.DEV ? "/api/auth/login.php" : "https://project.frankhagan.online/auth/login.php"
            }?return_to=${encodeURIComponent(location.pathname + location.search)}`;
            window.location.href = loginUrl;
            return;
        }

        // Fetch detailed user information (canonical record)
        const fetchUserDetails = async () => {
            try {
                const url = import.meta.env.DEV ? `/api/auth/me.php` : `https://project.frankhagan.online/auth/me.php`;

                const response = await fetch(url, {
                    credentials: "include",
                });

                if (response.ok) {
                    const data = await response.json();
                    // data.user holds canonical record
                    setUserDetails(data.user ?? null);
                } else {
                    setError("Failed to load user details");
                }
            } catch (err) {
                setError("Error loading profile");
                console.error("Profile fetch error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchUserDetails();

        // Fetch user's posts
        const fetchUserPosts = async () => {
            try {
                const url = import.meta.env.DEV
                    ? `/api/posts.php?include_claimed=true`
                    : `https://project.frankhagan.online/posts.php?include_claimed=true`;
                const response = await fetch(url, {
                    credentials: "include",
                });
                if (response.ok) {
                    const data = await response.json();
                    const rows: PostRow[] = data.posts || [];
                    // Filter to only show current user's posts
                    const myPosts = rows
                        .filter((row) => (row as PostRow & { user_id?: string }).user_id === user?.id)
                        .map(mapRowToPost)
                        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
                    setUserPosts(myPosts);
                }
            } catch (err) {
                console.error("Error loading user posts:", err);
            } finally {
                setLoadingPosts(false);
            }
        };

        fetchUserPosts();
    }, [authLoading, loggedIn, user, navigate, location.pathname, location.search]);

    const handleLogout = () => {
        navigate("/signout");
    };

    if (authLoading || loading) {
        return <ProfileSkeleton />;
    }

    if (error) {
        return (
            <main className="pt-16 p-4 container mx-auto max-w-4xl">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Your Profile</h1>
                    <Button onClick={handleLogout} className="px-3 py-2">
                        Log Out
                    </Button>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Error</CardTitle>
                        <CardDescription>{error}</CardDescription>
                    </CardHeader>
                </Card>
            </main>
        );
    }

    const details = userDetails || user;
    const initials =
        details?.name
            ?.split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase() || "??";

    const avatarUrl = details?.id
        ? import.meta.env.DEV
            ? `/api/avatar_proxy.php?user_id=${encodeURIComponent(details.id)}`
            : `https://project.frankhagan.online/avatar_proxy.php?user_id=${encodeURIComponent(details.id)}`
        : details?.picture;

    return (
        <main className="pt-16 p-4 container mx-auto max-w-4xl">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Your Profile</h1>
                <Button onClick={handleLogout} variant="outline" className="px-3 py-2">
                    Log Out
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <Avatar className="w-20 h-20">
                            <AvatarImage src={avatarUrl} alt={details?.name} />
                            <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-2xl">{details?.name}</CardTitle>
                            <CardDescription>{details?.email}</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-500 mb-1">Email</h3>
                            <p className="text-base">{details?.email}</p>
                        </div>

                        {details?.phone && (
                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 mb-1">Phone</h3>
                                <p className="text-base">{details.phone}</p>
                            </div>
                        )}

                        {details?.role && (
                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 mb-1">Role</h3>
                                <p className="text-base capitalize">{details.role}</p>
                            </div>
                        )}

                        {userDetails?.created_at && (
                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 mb-1">Member Since</h3>
                                <p className="text-base">
                                    {new Date(userDetails.created_at).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })}
                                </p>
                            </div>
                        )}

                        {userDetails?.last_login && (
                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 mb-1">Last Login</h3>
                                <p className="text-base">
                                    {new Date(userDetails.last_login).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })}
                                </p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Post History Section */}
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Post History</CardTitle>
                    <CardDescription>All posts you've created</CardDescription>
                </CardHeader>
                <CardContent>
                    {loadingPosts ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="border rounded-lg overflow-hidden animate-pulse">
                                    <div className="w-full h-64 bg-gray-200" />
                                    <div className="p-4 space-y-2">
                                        <div className="h-5 bg-gray-200 rounded w-3/4" />
                                        <div className="h-4 bg-gray-200 rounded w-16" />
                                        <div className="h-16 bg-gray-200 rounded w-full" />
                                        <div className="h-4 bg-gray-200 rounded w-32" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : userPosts.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">You haven't created any posts yet.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {userPosts.map((post) => (
                                <PostCard key={post.id} post={post} />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </main>
    );
}
