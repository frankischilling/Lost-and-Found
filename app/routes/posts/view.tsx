import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "~/components/ui/dialog";
import { useAuth } from "~/lib/authContext";
import { cn } from "~/lib/utils";
import { ChevronLeft, ChevronRight, Edit3, CheckCircle, XCircle, Trash2, MapPin, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ViewPostSkeleton } from "~/components/posts/view-skeleton";

interface Post {
    id: string;
    title: string;
    description: string;
    type: "lost" | "found";
    photoIds?: string[];
    created_at?: string;
    updated_at?: string;
    owner_id?: string;
    owner_name?: string;
    owner_picture?: string;
    is_claimed?: boolean | number;
    admin_approval_status?: string;
    location_found?: string;
    date_found?: string;
    tags?: string[];
}

interface Comment {
    id: string;
    post_id: string;
    user_id: string;
    message?: string;
    content?: string;
    created_at: string;
    user_name?: string;
    user_email?: string;
    user_picture?: string;
}

interface HistoryItem {
    id: string;
    post_id: string;
    type: string; // status change, comment, approval, etc.
    message: string;
    created_at: string;
}

const parseTimestampUTC = (s: string): Date => {
    const hasTimezone = /[zZ]|[+-]\d{2}:?\d{2}$/.test(s);
    if (hasTimezone) return new Date(s);
    const iso = s.replace(" ", "T") + "Z";
    return new Date(iso);
};

export default function ViewPost() {
    const { id } = useParams();
    const location = useLocation();
    const { user, loggedIn } = useAuth();

    const loginUrl = `${
        import.meta.env.DEV ? "/api/auth/login.php" : "https://project.frankhagan.online/auth/login.php"
    }?return_to=${encodeURIComponent(location.pathname + location.search)}`;

    const [post, setPost] = useState<Post | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [commentsPage, setCommentsPage] = useState(1);
    const [historyPage, setHistoryPage] = useState(1);
    const [commentsPageSize, setCommentsPageSize] = useState(10);
    const [historyPageSize, setHistoryPageSize] = useState(10);
    const [hasMoreComments, setHasMoreComments] = useState(true);
    const [hasMoreHistory, setHasMoreHistory] = useState(true);
    const [commentsTotalCount, setCommentsTotalCount] = useState(0);
    const [historyTotalCount, setHistoryTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [photoIndex, setPhotoIndex] = useState(0);
    const [newComment, setNewComment] = useState("");
    const [markingAsFound, setMarkingAsFound] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogMessage, setDialogMessage] = useState("");
    const [dialogTitle, setDialogTitle] = useState("");
    const [dialogSuccess, setDialogSuccess] = useState(true);
    const [deletingPost, setDeletingPost] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [shouldNavigateAfterDelete, setShouldNavigateAfterDelete] = useState(false);
    const navigate = useNavigate();

    const canEdit = useMemo(() => {
        if (!loggedIn || !user) return false;
        if (user.role === "admin") return true;
        if (post?.owner_id && user.id === post.owner_id) return true;
        return false;
    }, [loggedIn, user, post]);

    const canDelete = useMemo(() => {
        // Can delete if: admin or owner of the post
        if (!loggedIn || !user) return false;
        if (user.role === "admin") return true;
        if (post?.owner_id && user.id === post.owner_id) return true;
        return false;
    }, [loggedIn, user, post]);

    const canMarkAsClaimed = useMemo(() => {
        // Can mark as claimed if: logged in, not already claimed, and either admin or owner
        if (!loggedIn || !user || post?.is_claimed) return false;
        if (user.role === "admin") return true;
        if (post?.owner_id && user.id === post.owner_id) return true;
        return false;
    }, [loggedIn, user, post]);

    useEffect(() => {
        if (!dialogOpen && shouldNavigateAfterDelete && dialogSuccess) {
            setShouldNavigateAfterDelete(false);
            navigate("/");
        }
    }, [dialogOpen, shouldNavigateAfterDelete, dialogSuccess, navigate]);

    useEffect(() => {
        let cancelled = false;
        async function fetchAll() {
            try {
                setLoading(true);
                const postUrl = import.meta.env.DEV
                    ? `/api/posts.php?id=${id}`
                    : `https://project.frankhagan.online/posts.php?id=${id}`;
                const postRes = await fetch(postUrl);
                if (!postRes.ok) throw new Error("Failed to load post");
                const postData = await postRes.json();
                // Debug: inspect incoming photo_ids structure
                console.debug("view: postData.photo_ids", postData.photo_ids);
                let parsedPhotoIds: string[] = [];
                if (Array.isArray(postData.photo_ids)) {
                    parsedPhotoIds = postData.photo_ids.filter(Boolean).map(String);
                } else if (typeof postData.photo_ids === "string") {
                    try {
                        const arr = JSON.parse(postData.photo_ids || "[]");
                        if (Array.isArray(arr)) {
                            parsedPhotoIds = arr.filter(Boolean).map(String);
                        } else {
                            // Fallback: treat as comma-separated values
                            parsedPhotoIds = postData.photo_ids
                                .split(",")
                                .map((s: string) => s.trim())
                                .filter(Boolean);
                        }
                    } catch {
                        // Fallback: treat as comma-separated values when JSON parse fails
                        parsedPhotoIds = postData.photo_ids
                            .split(",")
                            .map((s: string) => s.trim())
                            .filter(Boolean);
                    }
                }
                const mapped: Post = {
                    id: String(postData.id),
                    title: postData.title,
                    description: postData.description,
                    type: postData.post_type === "found" ? "found" : "lost",
                    photoIds: parsedPhotoIds,
                    created_at: postData.created_at,
                    updated_at: postData.updated_at,
                    owner_id: postData.user_id || postData.owner_id,
                    owner_name: postData.author_name,
                    owner_picture: postData.author_picture,
                    is_claimed: Boolean(postData.is_claimed),
                    admin_approval_status: postData.admin_approval_status,
                    location_found: postData.location_found,
                    date_found: postData.date_found,
                    tags: Array.isArray(postData.tags) ? postData.tags : [],
                };
                console.debug("view: mapped.photoIds", parsedPhotoIds);
                console.debug("view: postData keys", Object.keys(postData));
                console.debug("view: owner info", {
                    user_name: postData.user_name,
                    owner_name: postData.owner_name,
                    user_picture: postData.user_picture,
                    owner_picture: postData.owner_picture,
                });
                const commentsUrl = import.meta.env.DEV
                    ? `/api/comments.php?post_id=${id}&page=1&pageSize=${commentsPageSize}`
                    : `https://project.frankhagan.online/comments.php?post_id=${id}&page=1&pageSize=${commentsPageSize}`;
                const historyUrl = import.meta.env.DEV
                    ? `/api/history.php?post_id=${id}&page=1&pageSize=${historyPageSize}`
                    : `https://project.frankhagan.online/history.php?post_id=${id}&page=1&pageSize=${historyPageSize}`;
                const commentsRes = await fetch(commentsUrl);
                const historyRes = await fetch(historyUrl);
                if (!commentsRes.ok) throw new Error("Failed to load comments");
                if (!historyRes.ok) throw new Error("Failed to load history");
                const commentsData = await commentsRes.json();
                const historyData = await historyRes.json();
                if (!cancelled) {
                    setPost(mapped);
                    // Reset photo index when a new post loads to ensure first image shows
                    setPhotoIndex(0);
                    const commentsList = commentsData.items || commentsData.comments || commentsData || [];
                    console.log("Comments data:", commentsList);
                    setComments(commentsList);
                    setHasMoreComments(Boolean(commentsData.hasMore));
                    setCommentsTotalCount(commentsData.totalCount || 0);
                    setHistory(historyData.items || historyData || []);
                    setHasMoreHistory(Boolean(historyData.hasMore));
                    setHistoryTotalCount(historyData.totalCount || 0);
                }
            } catch (e) {
                const msg = e instanceof Error ? e.message : "Error loading post";
                if (!cancelled) setError(msg);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        fetchAll();
        return () => {
            cancelled = true;
        };
    }, [id, commentsPageSize, historyPageSize]);

    const photoUrl = (uuid?: string) => {
        if (!uuid) return undefined;
        const base = import.meta.env.DEV ? "/api/view_photo.php" : "https://project.frankhagan.online/view_photo.php";
        const sep = base.includes("?") ? "&" : "?";
        return `${base}${sep}id=${uuid}`;
    };

    const nextPhoto = () => {
        if (!post?.photoIds?.length) return;
        setPhotoIndex((i) => (i + 1) % post.photoIds!.length);
    };
    const prevPhoto = () => {
        if (!post?.photoIds?.length) return;
        setPhotoIndex((i) => (i - 1 + post.photoIds!.length) % post.photoIds!.length);
    };

    const avatarUrl = (userId?: string, fallbackPicture?: string) => {
        if (!userId) return fallbackPicture;
        const base = import.meta.env.DEV
            ? "/api/avatar_proxy.php"
            : "https://project.frankhagan.online/avatar_proxy.php";
        return `${base}?user_id=${encodeURIComponent(userId)}`;
    };

    const submitComment = async () => {
        if (!loggedIn || !newComment.trim()) return;
        const body = new URLSearchParams({ post_id: String(id), message: newComment.trim() });
        const commentsUrl = import.meta.env.DEV
            ? "/api/comments.php"
            : "https://project.frankhagan.online/comments.php";
        const res = await fetch(commentsUrl, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: body.toString(),
            credentials: "include",
        });
        if (res.ok) {
            setNewComment("");
            const result = await res.json();
            const created = result.comment || result;
            // Map content field to message if needed
            if (created.content && !created.message) {
                created.message = created.content;
            }
            // Add current user info if not present
            if (!created.user_name && user) {
                created.user_name = user.name;
                created.user_picture = user.picture;
            }
            setComments((c) => [created, ...c]);
            setCommentsTotalCount((t) => t + 1);
        }
    };

    const markAsClaimed = async () => {
        if (!canMarkAsClaimed || markingAsFound) return;
        setMarkingAsFound(true);
        try {
            const url = import.meta.env.DEV
                ? `/api/posts.php?id=${id}`
                : `https://project.frankhagan.online/posts.php?id=${id}`;
            const res = await fetch(url, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ is_claimed: 1 }),
            });
            if (res.ok) {
                // Update local state
                setPost((prev) => (prev ? { ...prev, is_claimed: true } : null));
                // Show contextual success message
                const message =
                    post?.type === "lost"
                        ? "This item has been successfully marked as found! It will no longer appear in public listings."
                        : "This item has been successfully marked as claimed! It will no longer appear in public listings.";
                setDialogTitle(post?.type === "lost" ? "Item Marked as Found" : "Item Marked as Claimed");
                setDialogMessage(message);
                setDialogSuccess(true);
                setDialogOpen(true);
            } else {
                const message =
                    post?.type === "lost"
                        ? "Unable to mark this item as found. Please try again later."
                        : "Unable to mark this item as claimed. Please try again later.";
                setDialogTitle("Error");
                setDialogMessage(message);
                setDialogSuccess(false);
                setDialogOpen(true);
            }
        } catch (err) {
            console.error("Error marking as claimed:", err);
            setDialogTitle("Error");
            setDialogMessage("An unexpected error occurred. Please try again later.");
            setDialogSuccess(false);
            setDialogOpen(true);
        } finally {
            setMarkingAsFound(false);
        }
    };

    const deletePost = async () => {
        if (!canDelete) return;
        setDeletingPost(true);
        try {
            const url = import.meta.env.DEV
                ? `/api/posts.php?id=${id}`
                : `https://project.frankhagan.online/posts.php?id=${id}`;
            const res = await fetch(url, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ is_deleted: 1 }),
            });
            if (res.ok) {
                setDialogTitle("Post Deleted");
                setDialogMessage("Your post has been successfully deleted and is no longer visible to others.");
                setDialogSuccess(true);
                setShouldNavigateAfterDelete(true);
                setDialogOpen(true);
            } else {
                setDialogTitle("Error");
                setDialogMessage("Unable to delete this post. Please try again later.");
                setDialogSuccess(false);
                setDialogOpen(true);
            }
        } catch (err) {
            console.error("Error deleting post:", err);
            setDialogTitle("Error");
            setDialogMessage("An unexpected error occurred. Please try again later.");
            setDialogSuccess(false);
            setDialogOpen(true);
        } finally {
            setDeletingPost(false);
            setDeleteConfirmOpen(false);
        }
    };

    if (loading) return <ViewPostSkeleton />;
    if (error) return <div className="p-4 text-red-600">{error}</div>;
    if (!post) return <div className="p-4">Not found</div>;

    const currentPhotoUuid = post.photoIds?.[photoIndex];

    return (
        <>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {dialogSuccess ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                                <XCircle className="h-5 w-5 text-red-600" />
                            )}
                            {dialogTitle}
                        </DialogTitle>
                        <DialogDescription className="text-base pt-2">{dialogMessage}</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button onClick={() => setDialogOpen(false)} className="px-4 py-2">
                            {dialogSuccess ? "Got it" : "Close"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Post?</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this post? It will be hidden from public view, but admins
                            can still see it in the admin dashboard.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteConfirmOpen(false)}
                            disabled={deletingPost}
                            className="px-4 py-2"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => void deletePost()}
                            disabled={deletingPost}
                            className="px-4 py-2"
                        >
                            {deletingPost ? "Deleting..." : "Delete"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <div className="max-w-5xl mx-auto p-4 md:p-6 lg:p-8">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl md:text-3xl font-semibold">{post.title}</h1>
                    <div className="flex gap-2">
                        {canMarkAsClaimed && (
                            <Button
                                variant="default"
                                className="gap-2 px-6 py-2 bg-green-600 hover:bg-green-700"
                                onClick={markAsClaimed}
                                disabled={markingAsFound}
                            >
                                {markingAsFound
                                    ? "Marking..."
                                    : post.type === "lost"
                                      ? "Mark as Found"
                                      : "Mark as Claimed"}
                            </Button>
                        )}
                        {canEdit && (
                            <Link to={`/posts/${post.id}/edit`}>
                                <Button variant="outline" className="gap-2 px-6 py-2">
                                    <Edit3 className="h-4 w-4" /> Edit
                                </Button>
                            </Link>
                        )}
                        {canDelete && (
                            <Button
                                variant="destructive"
                                className="gap-2 px-6 py-2"
                                onClick={() => setDeleteConfirmOpen(true)}
                                disabled={deletingPost}
                            >
                                <Trash2 className="h-4 w-4" /> Delete
                            </Button>
                        )}
                    </div>
                </div>

                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <span
                                className={cn(
                                    "px-2 py-1 rounded text-xs font-medium",
                                    post.type === "lost"
                                        ? "bg-rose-100 text-rose-700"
                                        : "bg-emerald-100 text-emerald-700"
                                )}
                            >
                                {post.type === "lost" ? "Lost" : "Found"}
                            </span>
                            {post.admin_approval_status === "pending" && user?.role === "admin" && (
                                <span className="px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-700 border border-orange-300">
                                    Pending Approval
                                </span>
                            )}
                            {post.admin_approval_status === "rejected" && user?.role === "admin" && (
                                <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700 border border-red-300">
                                    Rejected
                                </span>
                            )}
                            {post.is_claimed && (
                                <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
                                    {post.type === "lost" ? "Found" : "Claimed"}
                                </span>
                            )}
                            <span className="text-sm text-muted-foreground">
                                Posted{" "}
                                {post.created_at &&
                                    formatDistanceToNow(parseTimestampUTC(post.created_at), { addSuffix: true })}
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div className="relative rounded-lg overflow-hidden border bg-muted/30 shadow-sm">
                                    {currentPhotoUuid ? (
                                        <img
                                            src={photoUrl(currentPhotoUuid)}
                                            alt="Post photo"
                                            className="w-full h-80 md:h-[450px] object-contain"
                                        />
                                    ) : (
                                        <div className="w-full h-80 md:h-[450px] grid place-items-center text-muted-foreground">
                                            No photos
                                        </div>
                                    )}
                                    {post.photoIds && post.photoIds.length > 1 && (
                                        <div className="absolute inset-0 flex items-center justify-between pointer-events-none">
                                            <Button
                                                variant="secondary"
                                                size="icon"
                                                className="m-2 pointer-events-auto h-8 w-8 rounded-full opacity-70 hover:opacity-100"
                                                onClick={prevPhoto}
                                                aria-label="Previous photo"
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                size="icon"
                                                className="m-2 pointer-events-auto h-8 w-8 rounded-full opacity-70 hover:opacity-100"
                                                onClick={nextPhoto}
                                                aria-label="Next photo"
                                            >
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                                {post.photoIds && post.photoIds.length > 1 && (
                                    <div className="flex gap-2 overflow-x-auto py-1 pb-2">
                                        {post.photoIds.map((uuid, idx) => (
                                            <button
                                                key={uuid}
                                                className={cn(
                                                    "relative shrink-0 border rounded-md overflow-hidden transition-all",
                                                    idx === photoIndex
                                                        ? "ring-2 ring-primary ring-offset-1"
                                                        : "opacity-70 hover:opacity-100"
                                                )}
                                                onClick={() => setPhotoIndex(idx)}
                                                aria-label={`Go to photo ${idx + 1}`}
                                            >
                                                <img
                                                    src={photoUrl(uuid)}
                                                    alt={`Thumbnail ${idx + 1}`}
                                                    className="w-16 h-16 object-cover"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-6">
                                {loggedIn && post.owner_name && (
                                    <div className="flex items-center gap-3">
                                        {post.owner_picture || post.owner_id ? (
                                            <img
                                                src={avatarUrl(post.owner_id, post.owner_picture)}
                                                alt={post.owner_name}
                                                className="w-10 h-10 rounded-full object-cover border border-border"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-semibold text-muted-foreground border border-border">
                                                {post.owner_name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <p className="font-medium text-base">{post.owner_name}</p>
                                    </div>
                                )}

                                {(post.location_found || post.date_found) && (
                                    <div className="grid grid-cols-2 gap-4">
                                        {post.location_found && (
                                            <div className="flex items-start gap-2">
                                                <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                                                <div>
                                                    <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                        Location
                                                    </h3>
                                                    <p className="text-sm font-medium">{post.location_found}</p>
                                                </div>
                                            </div>
                                        )}
                                        {post.date_found && (
                                            <div className="flex items-start gap-2">
                                                <Calendar className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                                                <div>
                                                    <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                        Date
                                                    </h3>
                                                    <p className="text-sm font-medium">
                                                        {new Date(post.date_found).toLocaleDateString(undefined, {
                                                            dateStyle: "medium",
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                                        Description
                                    </h3>
                                    <p className="whitespace-pre-wrap text-base leading-relaxed text-foreground/90">
                                        {post.description}
                                    </p>
                                </div>

                                {post.tags && post.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {post.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>Comments ({commentsTotalCount})</span>
                                <select
                                    value={commentsPageSize}
                                    onChange={(e) => {
                                        setCommentsPageSize(Number(e.target.value));
                                        setCommentsPage(1);
                                    }}
                                    className="text-xs border rounded px-2 py-1"
                                >
                                    <option value={5}>5 per page</option>
                                    <option value={10}>10 per page</option>
                                    <option value={25}>25 per page</option>
                                    <option value={50}>50 per page</option>
                                </select>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {comments.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No comments yet</p>
                            ) : (
                                <ul className="space-y-3">
                                    {comments.map((c) => (
                                        <li key={c.id} className="border rounded-md p-3">
                                            <div className="flex items-start gap-2 mb-2">
                                                {c.user_picture || c.user_id ? (
                                                    <img
                                                        src={avatarUrl(c.user_id, c.user_picture)}
                                                        alt={c.user_name || "User"}
                                                        className="w-8 h-8 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-semibold text-gray-700">
                                                        {(c.user_name || "?").charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <div className="flex-1">
                                                    <p className="text-sm font-semibold">
                                                        {c.user_name || "Anonymous"}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatDistanceToNow(parseTimestampUTC(c.created_at), {
                                                            addSuffix: true,
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="text-sm">{c.message || c.content}</p>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {hasMoreComments && (
                                <div className="mt-3">
                                    <Button
                                        variant="ghost"
                                        onClick={async () => {
                                            const next = commentsPage + 1;
                                            const url = import.meta.env.DEV
                                                ? `/api/comments.php?post_id=${id}&page=${next}&pageSize=${commentsPageSize}`
                                                : `https://project.frankhagan.online/comments.php?post_id=${id}&page=${next}&pageSize=${commentsPageSize}`;
                                            const res = await fetch(url);
                                            if (res.ok) {
                                                const data = await res.json();
                                                const items = data.items || data.comments || data || [];
                                                setComments((prev) => [...prev, ...items]);
                                                setCommentsPage(next);
                                                setHasMoreComments(Boolean(data.hasMore));
                                            }
                                        }}
                                    >
                                        Load more
                                    </Button>
                                </div>
                            )}

                            {loggedIn ? (
                                <div className="mt-4 flex gap-2">
                                    <input
                                        className="flex-1 border rounded-md px-3 py-2 text-sm"
                                        placeholder="Write a comment…"
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" && !e.shiftKey) {
                                                e.preventDefault();
                                                submitComment();
                                            }
                                        }}
                                    />
                                    <Button onClick={submitComment} disabled={!newComment.trim()} className="px-6 py-2">
                                        Post
                                    </Button>
                                </div>
                            ) : (
                                <p className="text-xs text-muted-foreground mt-4">
                                    <a href={loginUrl} className="underline">
                                        Sign in
                                    </a>{" "}
                                    to post a comment.
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>History ({historyTotalCount})</span>
                                <select
                                    value={historyPageSize}
                                    onChange={(e) => {
                                        setHistoryPageSize(Number(e.target.value));
                                        setHistoryPage(1);
                                    }}
                                    className="text-xs border rounded px-2 py-1"
                                >
                                    <option value={5}>5 per page</option>
                                    <option value={10}>10 per page</option>
                                    <option value={25}>25 per page</option>
                                    <option value={50}>50 per page</option>
                                </select>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {history.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No history</p>
                            ) : (
                                <ul className="space-y-3">
                                    {history.map((h) => (
                                        <li key={h.id} className="border rounded-md p-3">
                                            <p className="text-sm">{h.message}</p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {formatDistanceToNow(parseTimestampUTC(h.created_at), {
                                                    addSuffix: true,
                                                })}
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {hasMoreHistory && (
                                <div className="mt-3">
                                    <Button
                                        variant="ghost"
                                        onClick={async () => {
                                            const next = historyPage + 1;
                                            const url = import.meta.env.DEV
                                                ? `/api/history.php?post_id=${id}&page=${next}&pageSize=${historyPageSize}`
                                                : `https://project.frankhagan.online/history.php?post_id=${id}&page=${next}&pageSize=${historyPageSize}`;
                                            const res = await fetch(url);
                                            if (res.ok) {
                                                const data = await res.json();
                                                const items = data.items || data || [];
                                                setHistory((prev) => [...prev, ...items]);
                                                setHistoryPage(next);
                                                setHasMoreHistory(Boolean(data.hasMore));
                                            }
                                        }}
                                    >
                                        Load more
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
