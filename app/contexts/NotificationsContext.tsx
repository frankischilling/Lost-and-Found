import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from "react";
import { toast } from "sonner";
import { useAuth } from "~/lib/authContext";

interface Notification {
    id: string;
    user_id: string;
    type: string;
    title: string;
    message: string;
    link?: string;
    is_read: boolean;
    created_at: string;
}

interface NotificationsContextType {
    notifications: Notification[];
    unreadCount: number;
    loading: boolean;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    refetch: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export function NotificationsProvider({ children }: { children: ReactNode }) {
    const { loggedIn } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    // Retained for potential future use (e.g., ordering), but dedupe uses deliveredIdsRef
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [lastNotificationId, setLastNotificationId] = useState<string | null>(null);
    // Track which notifications we've already toasted to avoid duplicates across polls
    const deliveredIdsRef = useRef<Set<string>>(new Set());

    const fetchNotifications = useCallback(async () => {
        try {
            const url = import.meta.env.DEV
                ? "/api/notifications.php"
                : "https://project.frankhagan.online/notifications.php";
            const response = await fetch(url, {
                credentials: "include",
            });

            if (response.ok) {
                const data = await response.json();
                const newNotifications = data.notifications || [];
                // Seed delivered IDs on first load to avoid retro-toasting
                if (deliveredIdsRef.current.size === 0) {
                    for (const n of newNotifications) {
                        deliveredIdsRef.current.add(n.id);
                    }
                } else {
                    // Toast only unseen, unread notifications
                    for (const n of newNotifications) {
                        if (!n.is_read && !deliveredIdsRef.current.has(n.id)) {
                            // Show toast notification
                            toast(n.title, {
                                description: n.message,
                                action: n.link
                                    ? {
                                          label: "View",
                                          onClick: () => {
                                              if (n.link) {
                                                  window.location.href = n.link;
                                              }
                                          },
                                      }
                                    : undefined,
                            });

                            // Show browser notification if permission is granted
                            if ("Notification" in window && Notification.permission === "granted") {
                                try {
                                    new Notification(n.title, {
                                        body: n.message,
                                        icon: "/logo.png",
                                        tag: n.id, // Prevents duplicate notifications for same id
                                    });
                                } catch (error) {
                                    console.error("Error showing browser notification:", error);
                                }
                            }

                            deliveredIdsRef.current.add(n.id);
                        }
                    }
                }

                setNotifications(newNotifications);
                setUnreadCount(data.unread_count || 0);

                if (newNotifications.length > 0) {
                    setLastNotificationId(newNotifications[0].id);
                }
            } else if (response.status === 401) {
                // User not authenticated, don't keep trying
                setLoading(false);
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    const markAsRead = useCallback(async (id: string) => {
        try {
            const url = import.meta.env.DEV
                ? `/api/notifications.php?id=${id}`
                : `https://project.frankhagan.online/notifications.php?id=${id}`;
            const response = await fetch(url, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ is_read: true }),
            });

            if (response.ok) {
                setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
                setUnreadCount((prev) => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        try {
            const unreadNotifications = notifications.filter((n) => !n.is_read);
            await Promise.all(unreadNotifications.map((n) => markAsRead(n.id)));
        } catch (error) {
            console.error("Error marking all as read:", error);
        }
    }, [notifications, markAsRead]);

    useEffect(() => {
        // Only fetch and poll notifications if user is logged in
        if (!loggedIn) {
            setLoading(false);
            setNotifications([]);
            setUnreadCount(0);
            return;
        }

        fetchNotifications();
        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [fetchNotifications, loggedIn]);

    return (
        <NotificationsContext.Provider
            value={{
                notifications,
                unreadCount,
                loading,
                markAsRead,
                markAllAsRead,
                refetch: fetchNotifications,
            }}
        >
            {children}
        </NotificationsContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationsContext);
    if (context === undefined) {
        throw new Error("useNotifications must be used within a NotificationsProvider");
    }
    return context;
}
