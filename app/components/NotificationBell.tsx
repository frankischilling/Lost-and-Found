import { Bell } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useNotifications } from "~/contexts/NotificationsContext";
import { formatDistanceToNow } from "date-fns";

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

export function NotificationBell() {
    const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();

    const handleNotificationClick = async (notification: Notification) => {
        if (!notification.is_read) {
            await markAsRead(notification.id);
        }
    };
    // Normalize MySQL-like timestamps (YYYY-MM-DD HH:MM:SS) to UTC Date
    const parseTimestampUTC = (s: string): Date => {
        const hasTimezone = /[zZ]|[+-]\d{2}:?\d{2}$/.test(s);
        if (hasTimezone) return new Date(s);
        const iso = s.replace(" ", "T") + "Z";
        return new Date(iso);
    };

    return (
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative p-2 md:p-3 lg:p-4 h-auto w-auto">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-600 text-white text-xs flex items-center justify-center font-semibold">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 max-h-[500px]">
                <DropdownMenuLabel className="flex items-center justify-between sticky top-0 bg-background z-10">
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" className="h-auto p-1 text-xs" onClick={markAllAsRead}>
                            Mark all as read
                        </Button>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="overflow-y-auto max-h-[400px]">
                    {loading ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
                    ) : notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">No notifications yet</div>
                    ) : (
                        notifications.map((notification) => (
                            <DropdownMenuItem
                                key={notification.id}
                                className={`p-3 cursor-pointer ${!notification.is_read ? "bg-blue-50 dark:bg-blue-950" : ""}`}
                                onSelect={async () => {
                                    await handleNotificationClick(notification);
                                    if (notification.link) {
                                        window.location.href = notification.link;
                                    }
                                }}
                            >
                                <div className="flex flex-col gap-1 w-full">
                                    <div className="flex items-start justify-between">
                                        <p className="font-semibold text-sm">{notification.title}</p>
                                        {!notification.is_read && (
                                            <span className="h-2 w-2 rounded-full bg-blue-600 shrink-0 mt-1" />
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground line-clamp-2">{notification.message}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(parseTimestampUTC(notification.created_at), {
                                            addSuffix: true,
                                        })}
                                    </p>
                                </div>
                            </DropdownMenuItem>
                        ))
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
