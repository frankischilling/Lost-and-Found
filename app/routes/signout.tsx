import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useAuth } from "~/lib/authContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Spinner } from "~/components/ui/spinner";
import { LogOut, Home } from "lucide-react";

export default function SignOut() {
    const { refreshSession } = useAuth();
    const [loggingOut, setLoggingOut] = useState(true);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const url = import.meta.env.DEV
                    ? "/api/auth/logout.php"
                    : "https://project.frankhagan.online/auth/logout.php";
                // Call the logout endpoint to destroy session
                await fetch(url, {
                    method: "POST",
                    credentials: "include",
                });
                if (!cancelled) {
                    await refreshSession();
                    setLoggingOut(false);
                }
            } catch (err) {
                console.error("Logout failed:", err);
                if (!cancelled) setLoggingOut(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [refreshSession]);

    if (loggingOut) {
        return (
            <main className="pt-16 p-4 container mx-auto flex justify-center items-center min-h-[60vh]">
                <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <div className="flex justify-center mb-4">
                            <div className="rounded-full bg-primary/10 p-4">
                                <LogOut className="h-8 w-8 text-primary" />
                            </div>
                        </div>
                        <CardTitle>Signing Out</CardTitle>
                        <CardDescription>Please wait while we sign you out...</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Spinner className="w-8 h-8 mx-auto" />
                    </CardContent>
                </Card>
            </main>
        );
    }

    return (
        <main className="pt-16 p-4 container mx-auto flex justify-center items-center min-h-[60vh]">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <div className="flex justify-center mb-4">
                        <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-4">
                            <LogOut className="h-8 w-8 text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl">Successfully Signed Out</CardTitle>
                    <CardDescription>Thank you for using Lost and Found</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        You have been safely signed out of your account. You can now close this window or continue
                        browsing.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button asChild variant="default" size="lg">
                            <Link to="/">
                                <Home className="h-4 w-4 mr-2" />
                                Go Home
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="lg">
                            <a
                                href={
                                    import.meta.env.DEV
                                        ? "/api/auth/login.php?return_to=/"
                                        : "https://project.frankhagan.online/auth/login.php?return_to=/"
                                }
                            >
                                <LogOut className="h-4 w-4 mr-2" />
                                Sign In Again
                            </a>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </main>
    );
}
