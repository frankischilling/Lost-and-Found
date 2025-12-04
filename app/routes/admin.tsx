import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import { ProtectedRoute } from "~/components/ProtectedRoute";

interface DashboardStats {
    total_posts: number;
    pending_posts: number;
    approved_posts: number;
    total_users: number;
    lost_items: number;
    found_items: number;
}

interface Post {
    uuid: string;
    title: string;
    post_type: string;
    item_name: string;
    description: string;
    created_at: string;
    author_name: string;
    admin_approval_status?: string;
    is_claimed?: boolean | number;
    is_deleted?: boolean | number;
    photo_ids?: string[] | string;
}

export default function Admin() {
    const [health, setHealth] = useState("Unknown");
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [pendingPosts, setPendingPosts] = useState<Post[]>([]);
    const [loadingStats, setLoadingStats] = useState(true);
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [activeTab, setActiveTab] = useState<"dashboard" | "approvals" | "all-posts">("dashboard");
    const [allPosts, setAllPosts] = useState<Post[]>([]);
    const [loadingAllPosts, setLoadingAllPosts] = useState(false);
    const [postsFilter, setPostsFilter] = useState<"all" | "claimed" | "unclaimed" | "deleted">("all");

    const checkServerHealth = useCallback(async (): Promise<void> => {
        setHealth("Checking...");
        try {
            const url = import.meta.env.DEV ? "/api/health.php" : "https://project.frankhagan.online/health.php";
            const response = await fetch(url, { credentials: "include" });
            if (response.ok) {
                setHealth("Healthy");
            } else {
                setHealth("Unhealthy");
            }
        } catch (error) {
            setHealth("Error connecting to server");
            console.error("Error checking server health:", error);
        }
    }, []);

    const fetchStats = useCallback(async (): Promise<void> => {
        setLoadingStats(true);
        try {
            const url = import.meta.env.DEV
                ? "/api/admin/stats.php"
                : "https://project.frankhagan.online/admin/stats.php";
            const response = await fetch(url, { credentials: "include" });
            if (response.ok) {
                const data: DashboardStats = await response.json();
                setStats(data);
            }
        } catch (error) {
            console.error("Error fetching stats:", error);
        } finally {
            setLoadingStats(false);
        }
    }, []);

    const fetchAllPosts = useCallback(async (): Promise<void> => {
        setLoadingAllPosts(true);
        try {
            // Fetch all posts with all approval statuses - we need to make multiple requests
            // or fetch approved, pending, and rejected separately and combine
            const baseUrl = import.meta.env.DEV ? "/api/posts.php" : "https://project.frankhagan.online/posts.php";

            // Fetch approved posts
            const approvedResponse = await fetch(
                `${baseUrl}?include_claimed=true&include_deleted=true&admin_approval_status=approved`,
                {
                    credentials: "include",
                }
            );
            const approvedData: { status: string; posts: Post[] } = approvedResponse.ok
                ? await approvedResponse.json()
                : { posts: [] };

            // Fetch pending posts
            const pendingResponse = await fetch(
                `${baseUrl}?include_claimed=true&include_deleted=true&admin_approval_status=pending`,
                {
                    credentials: "include",
                }
            );
            const pendingData: { status: string; posts: Post[] } = pendingResponse.ok
                ? await pendingResponse.json()
                : { posts: [] };

            // Fetch rejected posts
            const rejectedResponse = await fetch(
                `${baseUrl}?include_claimed=true&include_deleted=true&admin_approval_status=rejected`,
                {
                    credentials: "include",
                }
            );
            const rejectedData: { status: string; posts: Post[] } = rejectedResponse.ok
                ? await rejectedResponse.json()
                : { posts: [] };

            // Combine all posts and sort by creation date (newest first)
            const allPosts = [
                ...(approvedData.posts || []),
                ...(pendingData.posts || []),
                ...(rejectedData.posts || []),
            ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            setAllPosts(allPosts);
        } catch (error) {
            console.error("Error fetching all posts:", error);
        } finally {
            setLoadingAllPosts(false);
        }
    }, []);

    const fetchPendingPosts = useCallback(async (): Promise<void> => {
        setLoadingPosts(true);
        try {
            const url = import.meta.env.DEV ? "/api/posts.php" : "https://project.frankhagan.online/posts.php";
            // Align with backend filter param naming for admin approval state
            let response = await fetch(`${url}?admin_approval_status=pending`, { credentials: "include" });
            let posts: Post[] = [];
            if (response.ok) {
                const data: { status: string; posts: Post[] } = await response.json();
                posts = (data.posts || []).filter((p) => (p.admin_approval_status ?? "pending") === "pending");
            }
            // Fallback: if none found, fetch all and filter client-side to pending
            if (!response.ok || posts.length === 0) {
                response = await fetch(url, { credentials: "include" });
                if (response.ok) {
                    const dataAll: { status: string; posts: Post[] } = await response.json();
                    posts = (dataAll.posts || []).filter((p: Post & { approval_status?: string }) => {
                        const status = p.admin_approval_status ?? p.approval_status;
                        if (!status) return true; // treat missing status as pending
                        return status !== "approved"; // pending or other non-approved
                    });
                }
            }
            setPendingPosts(posts);
        } catch (error) {
            console.error("Error fetching pending posts:", error);
        } finally {
            setLoadingPosts(false);
        }
    }, []);

    const approvePost = useCallback(
        async (postId: string): Promise<void> => {
            try {
                const url = import.meta.env.DEV ? "/api/posts.php" : "https://project.frankhagan.online/posts.php";
                const response = await fetch(`${url}?id=${postId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ admin_approval_status: "approved" }),
                });
                if (response.ok) {
                    setPendingPosts((prev) => prev.filter((p) => p.uuid !== postId));
                    void fetchStats(); // Refresh stats
                    void fetchPendingPosts(); // Refresh pending list
                }
            } catch (error) {
                console.error("Error approving post:", error);
            }
        },
        [fetchStats, fetchPendingPosts]
    );

    const rejectPost = useCallback(
        async (postId: string): Promise<void> => {
            try {
                const url = import.meta.env.DEV ? "/api/posts.php" : "https://project.frankhagan.online/posts.php";
                const response = await fetch(`${url}?id=${postId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ admin_approval_status: "rejected" }),
                });
                if (response.ok) {
                    setPendingPosts((prev) => prev.filter((p) => p.uuid !== postId));
                    void fetchStats(); // Refresh stats
                    void fetchPendingPosts(); // Refresh pending list
                    void fetchAllPosts(); // Refresh all posts to show rejected status
                }
            } catch (error) {
                console.error("Error rejecting post:", error);
            }
        },
        [fetchStats, fetchPendingPosts, fetchAllPosts]
    );

    useEffect(() => {
        void checkServerHealth();
        void fetchStats();
        void fetchPendingPosts();
    }, [checkServerHealth, fetchStats, fetchPendingPosts]);

    useEffect(() => {
        if (activeTab === "all-posts" && allPosts.length === 0) {
            void fetchAllPosts();
        }
    }, [activeTab, allPosts.length, fetchAllPosts]);

    return (
        <ProtectedRoute>
            <main className="pt-16 p-4 container mx-auto">
                <h1 className="text-4xl font-bold mb-4">Admin Dashboard</h1>

                {/* Tab Navigation */}
                <div className="flex gap-4 mb-6 border-b">
                    <button
                        className={`px-4 py-2 font-medium ${
                            activeTab === "dashboard"
                                ? "text-blue-600 border-b-2 border-blue-600"
                                : "text-gray-600 hover:text-blue-600"
                        }`}
                        onClick={() => setActiveTab("dashboard")}
                    >
                        Dashboard
                    </button>
                    <button
                        className={`px-4 py-2 font-medium ${
                            activeTab === "approvals"
                                ? "text-blue-600 border-b-2 border-blue-600"
                                : "text-gray-600 hover:text-blue-600"
                        }`}
                        onClick={() => setActiveTab("approvals")}
                    >
                        Post Approvals {pendingPosts.length > 0 && `(${pendingPosts.length})`}
                    </button>
                    <button
                        className={`px-4 py-2 font-medium ${
                            activeTab === "all-posts"
                                ? "text-blue-600 border-b-2 border-blue-600"
                                : "text-gray-600 hover:text-blue-600"
                        }`}
                        onClick={() => setActiveTab("all-posts")}
                    >
                        All Posts
                    </button>
                </div>

                {/* Dashboard Tab */}
                {activeTab === "dashboard" && (
                    <div className="space-y-6">
                        {/* Statistics Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {loadingStats ? (
                                <p className="col-span-full text-gray-500">Loading statistics...</p>
                            ) : stats ? (
                                <>
                                    <div className="bg-white border rounded-lg p-6 shadow-sm">
                                        <h3 className="text-gray-600 text-sm font-medium">Total Posts</h3>
                                        <p className="text-3xl font-bold mt-2">{stats.total_posts}</p>
                                    </div>
                                    <div className="bg-white border rounded-lg p-6 shadow-sm">
                                        <h3 className="text-gray-600 text-sm font-medium">Pending Approval</h3>
                                        <p className="text-3xl font-bold mt-2 text-orange-600">{stats.pending_posts}</p>
                                    </div>
                                    <div className="bg-white border rounded-lg p-6 shadow-sm">
                                        <h3 className="text-gray-600 text-sm font-medium">Approved Posts</h3>
                                        <p className="text-3xl font-bold mt-2 text-green-600">{stats.approved_posts}</p>
                                    </div>
                                    <div className="bg-white border rounded-lg p-6 shadow-sm">
                                        <h3 className="text-gray-600 text-sm font-medium">Total Users</h3>
                                        <p className="text-3xl font-bold mt-2">{stats.total_users}</p>
                                    </div>
                                    <div className="bg-white border rounded-lg p-6 shadow-sm">
                                        <h3 className="text-gray-600 text-sm font-medium">Lost Items</h3>
                                        <p className="text-3xl font-bold mt-2 text-red-600">{stats.lost_items}</p>
                                    </div>
                                    <div className="bg-white border rounded-lg p-6 shadow-sm">
                                        <h3 className="text-gray-600 text-sm font-medium">Found Items</h3>
                                        <p className="text-3xl font-bold mt-2 text-blue-600">{stats.found_items}</p>
                                    </div>
                                </>
                            ) : (
                                <p className="col-span-full text-red-500">Failed to load statistics</p>
                            )}
                        </div>

                        {/* Server Health */}
                        <div className="bg-white border rounded-lg p-6 shadow-sm">
                            <h3 className="text-lg font-semibold mb-4">Server Health</h3>
                            <p className="mb-4">
                                Status:{" "}
                                <span
                                    className={`font-bold ${
                                        health === "Healthy"
                                            ? "text-green-600"
                                            : health === "Checking..."
                                              ? "text-gray-500"
                                              : "text-red-600"
                                    }`}
                                >
                                    {health}
                                </span>
                            </p>
                            <button
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                onClick={checkServerHealth}
                            >
                                Check Server Health
                            </button>
                        </div>
                    </div>
                )}

                {/* All Posts Tab */}
                {activeTab === "all-posts" && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold">All Posts</h2>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPostsFilter("all")}
                                    className={`px-4 py-2 rounded-md ${
                                        postsFilter === "all"
                                            ? "bg-blue-600 text-white"
                                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                    }`}
                                >
                                    All ({allPosts.filter((p) => !p.is_deleted).length})
                                </button>
                                <button
                                    onClick={() => setPostsFilter("unclaimed")}
                                    className={`px-4 py-2 rounded-md ${
                                        postsFilter === "unclaimed"
                                            ? "bg-blue-600 text-white"
                                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                    }`}
                                >
                                    Active ({allPosts.filter((p) => !p.is_claimed && !p.is_deleted).length})
                                </button>
                                <button
                                    onClick={() => setPostsFilter("claimed")}
                                    className={`px-4 py-2 rounded-md ${
                                        postsFilter === "claimed"
                                            ? "bg-blue-600 text-white"
                                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                    }`}
                                >
                                    Claimed/Found ({allPosts.filter((p) => p.is_claimed && !p.is_deleted).length})
                                </button>
                                <button
                                    onClick={() => setPostsFilter("deleted")}
                                    className={`px-4 py-2 rounded-md ${
                                        postsFilter === "deleted"
                                            ? "bg-blue-600 text-white"
                                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                    }`}
                                >
                                    Deleted/Rejected (
                                    {
                                        allPosts.filter((p) => p.is_deleted || p.admin_approval_status === "rejected")
                                            .length
                                    }
                                    )
                                </button>
                            </div>
                        </div>
                        {loadingAllPosts ? (
                            <p className="text-gray-500">Loading posts...</p>
                        ) : allPosts.filter((p) => {
                              if (postsFilter === "claimed") return p.is_claimed && !p.is_deleted;
                              if (postsFilter === "unclaimed") return !p.is_claimed && !p.is_deleted;
                              if (postsFilter === "deleted")
                                  return p.is_deleted || p.admin_approval_status === "rejected";
                              return !p.is_deleted && p.admin_approval_status !== "rejected";
                          }).length === 0 ? (
                            <p className="text-gray-500">No posts found.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {allPosts
                                    .filter((p) => {
                                        if (postsFilter === "claimed") return p.is_claimed && !p.is_deleted;
                                        if (postsFilter === "unclaimed") return !p.is_claimed && !p.is_deleted;
                                        if (postsFilter === "deleted")
                                            return p.is_deleted || p.admin_approval_status === "rejected";
                                        return !p.is_deleted && p.admin_approval_status !== "rejected";
                                    })
                                    .map((post) => (
                                        <Link
                                            key={post.uuid}
                                            to={`/posts/${post.uuid}`}
                                            className={`border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow ${
                                                post.is_deleted ? "bg-gray-100 opacity-75" : "bg-white"
                                            }`}
                                        >
                                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                <span
                                                    className={`px-2 py-1 text-xs font-semibold rounded ${
                                                        post.post_type === "lost"
                                                            ? "bg-red-100 text-red-800"
                                                            : "bg-blue-100 text-blue-800"
                                                    }`}
                                                >
                                                    {post.post_type.toUpperCase()}
                                                </span>
                                                {Boolean(post.is_claimed) && (
                                                    <span className="px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-700">
                                                        {post.post_type === "lost" ? "Found" : "Claimed"}
                                                    </span>
                                                )}
                                                {post.admin_approval_status === "pending" && (
                                                    <span className="px-2 py-1 text-xs font-semibold rounded bg-orange-100 text-orange-700 border border-orange-300">
                                                        Pending Approval
                                                    </span>
                                                )}
                                                {post.admin_approval_status === "rejected" && (
                                                    <span className="px-2 py-1 text-xs font-semibold rounded bg-red-100 text-red-700 border border-red-300">
                                                        Rejected
                                                    </span>
                                                )}
                                                {Boolean(post.is_deleted) && (
                                                    <span className="px-2 py-1 text-xs font-semibold rounded bg-gray-400 text-gray-700 border border-gray-500">
                                                        Deleted
                                                    </span>
                                                )}
                                                <span className="text-xs text-gray-500">
                                                    {new Date(post.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-bold mb-1">{post.title}</h3>
                                            <p className="text-sm text-gray-600 mb-1">
                                                <strong>Item:</strong> {post.item_name}
                                            </p>
                                            <p className="text-sm text-gray-600 line-clamp-2">{post.description}</p>
                                            <p className="text-xs text-gray-500 mt-2">
                                                <strong>Author:</strong> {post.author_name}
                                            </p>
                                        </Link>
                                    ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Approvals Tab */}
                {activeTab === "approvals" && (
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold">Pending Post Approvals</h2>
                        {loadingPosts ? (
                            <p className="text-gray-500">Loading pending posts...</p>
                        ) : pendingPosts.length === 0 ? (
                            <p className="text-gray-500">No posts pending approval</p>
                        ) : (
                            <div className="space-y-4">
                                {pendingPosts.map((post) => {
                                    // Parse photo_ids if it's a string
                                    let photoIds: string[] = [];
                                    if (Array.isArray(post.photo_ids)) {
                                        photoIds = post.photo_ids.filter(Boolean).map(String);
                                    } else if (typeof post.photo_ids === "string") {
                                        try {
                                            const arr = JSON.parse(post.photo_ids || "[]");
                                            if (Array.isArray(arr)) {
                                                photoIds = arr.filter(Boolean).map(String);
                                            }
                                        } catch {
                                            photoIds = post.photo_ids
                                                .split(",")
                                                .map((s: string) => s.trim())
                                                .filter(Boolean);
                                        }
                                    }

                                    const photoUrl = (uuid?: string) => {
                                        if (!uuid) return undefined;
                                        const base = import.meta.env.DEV
                                            ? "/api/view_photo.php"
                                            : "https://project.frankhagan.online/view_photo.php";
                                        const sep = base.includes("?") ? "&" : "?";
                                        return `${base}${sep}id=${uuid}`;
                                    };

                                    return (
                                        <div key={post.uuid} className="bg-white border rounded-lg p-6 shadow-sm">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span
                                                            className={`px-2 py-1 text-xs font-semibold rounded ${
                                                                post.post_type === "lost"
                                                                    ? "bg-red-100 text-red-800"
                                                                    : "bg-blue-100 text-blue-800"
                                                            }`}
                                                        >
                                                            {post.post_type.toUpperCase()}
                                                        </span>
                                                        <span className="text-sm text-gray-500">
                                                            {new Date(post.created_at).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <h3 className="text-xl font-bold mb-2">{post.title}</h3>
                                                    <p className="text-gray-600 mb-2">
                                                        <strong>Item:</strong> {post.item_name}
                                                    </p>
                                                    <p className="text-gray-600 mb-4">{post.description}</p>
                                                    <p className="text-sm text-gray-500 mb-4">
                                                        <strong>Author:</strong> {post.author_name}
                                                    </p>

                                                    {/* Photo Gallery */}
                                                    {photoIds.length > 0 && (
                                                        <div className="mb-4">
                                                            <p className="text-sm font-semibold text-gray-700 mb-2">
                                                                Photos ({photoIds.length})
                                                            </p>
                                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                                                {photoIds.map((photoId) => (
                                                                    <div
                                                                        key={photoId}
                                                                        className="relative rounded-lg overflow-hidden border bg-gray-100 aspect-square"
                                                                    >
                                                                        <img
                                                                            src={photoUrl(photoId)}
                                                                            alt="Post photo"
                                                                            className="w-full h-full object-contain"
                                                                        />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-2 mt-4">
                                                <button
                                                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                                    onClick={() => void approvePost(post.uuid)}
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                                    onClick={() => void rejectPost(post.uuid)}
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </main>
        </ProtectedRoute>
    );
}
