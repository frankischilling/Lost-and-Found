import { type ReactNode } from "react";
import { Link, useLocation } from "react-router";
import { useAuth } from "~/lib/authContext";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { LockKeyhole, ShieldAlert } from "lucide-react";

export function ProtectedRoute({ children, adminOnly = false }: { children: ReactNode; adminOnly?: boolean }) {
    const location = useLocation();
    const { user, loggedIn, loading } = useAuth();

    const loginUrl = `${
        import.meta.env.DEV ? "/api/auth/login.php" : "https://project.frankhagan.online/auth/login.php"
    }?return_to=${encodeURIComponent(location.pathname + location.search)}`;

    if (loading) {
        return (
            <main className="pt-16 p-4 container mx-auto flex items-center justify-center min-h-[50vh]">
                <p className="text-muted-foreground">Loading...</p>
            </main>
        );
    }

    if (!loggedIn) {
        return (
            <main className="pt-16 p-4 container mx-auto flex items-center justify-center min-h-[60vh]">
                <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <div className="mx-auto bg-muted p-3 rounded-full w-fit mb-2">
                            <LockKeyhole className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <CardTitle className="text-2xl">Sign In Required</CardTitle>
                        <CardDescription>You must be signed in to access this page.</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-4 px-10">
                        <Button asChild className="w-full py-2 px-4">
                            <a href={loginUrl}>Sign In</a>
                        </Button>
                    </CardContent>
                </Card>
            </main>
        );
    }

    if (adminOnly && user?.role !== "admin") {
        return (
            <main className="pt-16 p-4 container mx-auto flex items-center justify-center min-h-[60vh]">
                <Card className="w-full max-w-md text-center border-destructive/50">
                    <CardHeader>
                        <div className="mx-auto bg-red-100 p-3 rounded-full w-fit mb-2">
                            <ShieldAlert className="h-6 w-6 text-red-600" />
                        </div>
                        <CardTitle className="text-2xl text-destructive">Admin Access Required</CardTitle>
                        <CardDescription>You do not have permission to view this page.</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-8 px-10">
                        <Button asChild variant="outline" className="w-full">
                            <Link to="/">Go Home</Link>
                        </Button>
                    </CardContent>
                </Card>
            </main>
        );
    }

    return <>{children}</>;
}
