import { isRouteErrorResponse, Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import { AuthProvider } from "./authContext";
import { NotificationsProvider } from "./contexts/NotificationsContext";
import { Toaster } from "./components/ui/sonner";

export const links: Route.LinksFunction = () => [
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
    },
    {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,100;1,200;1,300;1,400;1,500;1,600;1,700&family=IBM+Plex+Sans+Condensed:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,100;1,200;1,300;1,400;1,500;1,600;1,700&family=IBM+Plex+Sans:ital,wdth,wght@0,75..100,100..700;1,75..100,100..700&family=IBM+Plex+Serif:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,100;1,200;1,300;1,400;1,500;1,600;1,700&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=block",
    },
    { rel: "icon", href: "/favicon.ico" },
];

import { useEffect, useContext } from "react";
import { AuthContext } from "./authContext";

function AppContent() {
    const auth = useContext(AuthContext);

    useEffect(() => {
        let resourcesLoaded = false;

        const checkReady = () => {
            // Only hide spinner once both resources are loaded AND auth is settled
            if (resourcesLoaded && !auth?.loading) {
                setTimeout(() => {
                    const spinner = document.getElementById("app-loading-spinner");
                    if (spinner) {
                        spinner.style.animation = "fadeOut 0.8s ease-out forwards";
                        // Remove from DOM after fade completes
                        setTimeout(() => {
                            spinner.style.display = "none";
                        }, 800);
                    }
                }, 200); // Small delay to ensure smoothness
            }
        };

        const hideSpinner = () => {
            resourcesLoaded = true;
            checkReady();
        };

        // Wait for fonts to actually load using the FontFaceSet API
        const waitForFonts = async () => {
            try {
                // Use document.fonts.ready to wait for all font files to load
                if (document.fonts && typeof document.fonts.ready !== "undefined") {
                    await document.fonts.ready;
                }
            } catch {
                // Fallback if Font Loading API not supported
                console.warn("Font Loading API not available, using timeout fallback");
                await new Promise((resolve) => setTimeout(resolve, 2000));
            }
            hideSpinner();
        };

        // Wait for both window load event AND fonts to be ready
        if (document.readyState === "complete") {
            waitForFonts();
        } else {
            window.addEventListener("load", waitForFonts);
            return () => window.removeEventListener("load", waitForFonts);
        }
    }, [auth]);

    return (
        <>
            <NotificationsProvider>
                <Outlet />
                <Toaster />
            </NotificationsProvider>
        </>
    );
}

export default function App() {
    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <Meta />
                <Links />
                <style>{`
                    /* Critical font optimization to prevent FOIT/FOUT */
                    html {
                        /* Reserve space for scrollbar to prevent layout shift when scrollbar appears */
                        scrollbar-gutter: stable;
                        overflow-x: hidden;
                    }
                    * {
                        font-display: block;
                    }
                    body {
                        font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                        font-weight: 400;
                        -webkit-font-smoothing: antialiased;
                        -moz-osx-font-smoothing: grayscale;
                        overflow-x: hidden;
                    }
                    h1, h2, h3, h4, h5, h6 {
                        font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    }
                    code, pre {
                        font-family: 'IBM Plex Mono', 'Courier New', monospace;
                    }
                `}</style>
            </head>
            <body>
                <div id="app-loading-spinner" className="app-loading-spinner">
                    <div className="spinner-content">
                        <div className="spinner-icon"></div>
                        <p className="spinner-text">Loading Application...</p>
                    </div>
                </div>
                <style>{`
                    .app-loading-spinner {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background-color: #ffffff;
                        z-index: 9999;
                    }
                    .spinner-content {
                        text-align: center;
                    }
                    .spinner-icon {
                        animation: spin 1s linear infinite;
                        border-radius: 50%;
                        height: 48px;
                        width: 48px;
                        border-bottom: 3px solid #2563eb;
                        margin: 0 auto 16px;
                    }
                    .spinner-text {
                        font-size: 18px;
                        color: #4b5563;
                        margin: 0;
                        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                        font-weight: 400;
                    }
                    @keyframes spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                    @keyframes fadeOut {
                        from {
                            opacity: 1;
                            pointer-events: auto;
                        }
                        to {
                            opacity: 0;
                            pointer-events: none;
                        }
                    }
                `}</style>
                <AuthProvider>
                    <AppContent />
                </AuthProvider>
                <ScrollRestoration />
                <Scripts />
            </body>
        </html>
    );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
    let message = "Oops!";
    let details = "An unexpected error occurred.";
    let stack: string | undefined;

    if (isRouteErrorResponse(error)) {
        message = error.status === 404 ? "404" : "Error";
        details = error.status === 404 ? "The requested page could not be found." : error.statusText || details;
    } else if (import.meta.env.DEV && error && error instanceof Error) {
        details = error.message;
        stack = error.stack;
    }

    return (
        <main className="pt-16 p-4 container mx-auto">
            <h1>{message}</h1>
            <p>{details}</p>
            {stack && (
                <pre className="w-full p-4 overflow-x-auto">
                    <code>{stack}</code>
                </pre>
            )}
        </main>
    );
}

export function HydrateFallback() {
    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <Meta />
                <Links />
                <style>{`
                    html {
                        scrollbar-gutter: stable;
                        overflow-x: hidden;
                    }
                    body {
                        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                        font-weight: 400;
                        -webkit-font-smoothing: antialiased;
                        -moz-osx-font-smoothing: grayscale;
                        overflow-x: hidden;
                    }
                    .hydrate-spinner-container {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background-color: #ffffff;
                        z-index: 9999;
                    }
                    .hydrate-spinner-content {
                        text-align: center;
                    }
                    .hydrate-spinner-icon {
                        animation: spin 1s linear infinite;
                        border-radius: 50%;
                        height: 48px;
                        width: 48px;
                        border-bottom: 3px solid #2563eb;
                        margin: 0 auto 16px;
                    }
                    .hydrate-spinner-text {
                        font-size: 18px;
                        color: #4b5563;
                        margin: 0;
                        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                        font-weight: 400;
                    }
                    @keyframes spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                `}</style>
            </head>
            <body>
                <div className="hydrate-spinner-container">
                    <div className="hydrate-spinner-content">
                        <div className="hydrate-spinner-icon"></div>
                        <p className="hydrate-spinner-text">Loading Application...</p>
                    </div>
                </div>
                <Scripts />
            </body>
        </html>
    );
}
