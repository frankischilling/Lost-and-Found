import { createContext, useEffect, useState, useCallback, type ReactNode } from "react";

// Types matching the session endpoint response
interface User {
    id: string;
    email: string;
    name: string;
    picture: string;
    uuid?: string;
    phone?: string;
    role?: string;
    created_at?: string;
    updated_at?: string;
    last_login?: string;
}

interface SessionResponse {
    status: string;
    logged_in: boolean;
    user?: User;
}

interface AuthContextType {
    user: User | null;
    loggedIn: boolean;
    loading: boolean;
    refreshSession: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loggedIn, setLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);

    const refreshSession = useCallback(async () => {
        setLoading(true);
        try {
            const url = import.meta.env.DEV
                ? "/api/auth/session.php"
                : "https://project.frankhagan.online/auth/session.php";
            const res = await fetch(url, {
                credentials: "include",
            });
            if (!res.ok) {
                setUser(null);
                setLoggedIn(false);
                return;
            }
            const data: SessionResponse = await res.json();
            if (data.status === "success" && data.logged_in && data.user) {
                setUser(data.user);
                setLoggedIn(true);
            } else {
                setUser(null);
                setLoggedIn(false);
            }
        } catch (err) {
            console.error("Failed to fetch session:", err);
            setUser(null);
            setLoggedIn(false);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            await refreshSession();
            if (cancelled) return;
        })();
        return () => {
            cancelled = true;
        };
    }, [refreshSession]);

    return <AuthContext.Provider value={{ user, loggedIn, loading, refreshSession }}>{children}</AuthContext.Provider>;
}

// useAuth hook is provided from `app/lib/authContext.ts` to avoid
// mixing component and non-component exports in this file (Fast Refresh friendly).
