import { Link, Outlet, useLocation } from "react-router";
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
} from "./components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "./components/ui/sheet";
import { Button } from "./components/ui/button";
import { Menu } from "lucide-react";
import { useIsMobile } from "./hooks/use-mobile";
import { cn } from "./lib/utils";
import { useAuth } from "./lib/authContext";
import { useState, useEffect } from "react";
import { NotificationBell } from "./components/NotificationBell";

export default function Layout() {
    const { user, loggedIn, loading } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Request notification permission when user logs in
    useEffect(() => {
        if (loggedIn && !loading && "Notification" in window) {
            if (Notification.permission === "default") {
                // Only request if permission hasn't been asked yet
                Notification.requestPermission();
            }
        }
    }, [loggedIn, loading]);

    const location = useLocation();
    const menuLinks = [
        { href: "/", label: "Home" },
        { href: "/posts/new/lost", label: "Report Lost" },
        { href: "/posts/new/found", label: "Report Found" },
        { href: "/browse/lost", label: "Browse Lost" },
        { href: "/browse/found", label: "Browse Found" },
        ...(loading
            ? []
            : loggedIn
              ? [
                    { href: "/profile", label: "View Profile" },
                    ...(user?.role === "admin" ? [{ href: "/admin", label: "Admin Dashboard" }] : []),
                ]
              : [
                    {
                        href: `${
                            import.meta.env.DEV
                                ? "/api/auth/login.php"
                                : "https://project.frankhagan.online/auth/login.php"
                        }?return_to=${encodeURIComponent(location.pathname + location.search)}`,
                        label: "Sign In",
                    },
                ]),
    ];
    const isMobile = useIsMobile();

    return (
        <div className="flex flex-col grow min-h-screen min-w-full">
            <div className="w-full flex flex-row items-center sticky top-0 bg-white shadow-md z-10">
                <Link to="/" className="p-4 flex items-center">
                    <img
                        src="/logo.png"
                        alt="Lost and Found Logo"
                        className="w-full max-h-full max-w-32 md:max-w-48 lg:max-w-64 object-contain"
                    />
                </Link>
                <div className="grow" />

                {/* Desktop Navigation */}
                <NavigationMenu className="hidden md:flex m-2 md:m-4" viewport={isMobile}>
                    <div className="grow" />
                    <NavigationMenuList>
                        {menuLinks.map((link) => (
                            <NavigationMenuItem key={link.href}>
                                <NavigationMenuLink
                                    asChild
                                    href={link.href}
                                    className={cn(location.pathname === link.href && "bg-gray-200!")}
                                >
                                    {link.href.startsWith("http") || link.href.startsWith("/api/") ? (
                                        <a
                                            href={link.href}
                                            className="p-2 md:p-3 lg:p-4 text-sm md:text-base text-nowrap"
                                        >
                                            {link.label}
                                        </a>
                                    ) : (
                                        <Link
                                            to={link.href}
                                            className="p-2 md:p-3 lg:p-4 text-sm md:text-base text-nowrap"
                                        >
                                            {link.label}
                                        </Link>
                                    )}
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                        ))}
                        {loggedIn && !loading && (
                            <NavigationMenuItem>
                                <NotificationBell />
                            </NavigationMenuItem>
                        )}
                    </NavigationMenuList>
                </NavigationMenu>

                {/* Notification Bell - Mobile */}
                {loggedIn && !loading && (
                    <div className="md:hidden flex items-center mr-2">
                        <NotificationBell />
                    </div>
                )}

                {/* Mobile Hamburger Menu */}
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="md:hidden m-3">
                            <Menu className="h-6 w-6" />
                            <span className="sr-only">Toggle menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-64">
                        <SheetHeader>
                            <SheetTitle>Navigation</SheetTitle>
                            <SheetDescription>Select a destination from the site menu</SheetDescription>
                        </SheetHeader>
                        <nav className="flex flex-col gap-2 mt-0">
                            {menuLinks.map((link) => (
                                <div key={link.href}>
                                    {link.href.startsWith("http") || link.href.startsWith("/api/") ? (
                                        <a
                                            href={link.href}
                                            className={cn(
                                                "block p-3 rounded-md hover:bg-gray-100 transition-colors",
                                                location.pathname === link.href && "bg-gray-200"
                                            )}
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            {link.label}
                                        </a>
                                    ) : (
                                        <Link
                                            to={link.href}
                                            className={cn(
                                                "block p-3 rounded-md hover:bg-gray-100 transition-colors",
                                                location.pathname === link.href && "bg-gray-200"
                                            )}
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            {link.label}
                                        </Link>
                                    )}
                                </div>
                            ))}
                        </nav>
                    </SheetContent>
                </Sheet>
            </div>
            <div className="grow">
                <Outlet />
            </div>
            <footer className="bg-white/50 mt-8">
                <div className="flex flex-col md:flex-row items-center md:items-start">
                    <div className="w-full md:max-w-[33%] p-4 md:p-8 h-full flex justify-center md:justify-start">
                        <img
                            src="/logo.png"
                            alt="Lost and Found Logo"
                            className="w-full max-h-full max-w-32 md:max-w-48 align-middle"
                        />
                    </div>
                    <nav className="w-full md:max-w-[33%] p-4 md:p-8 self-start">
                        <h5 className="p-2 md:p-4 text-base md:text-lg font-semibold">Site Map</h5>
                        <ul className="flex flex-col justify-center">
                            {menuLinks.map((link) => (
                                <li key={link.href} className="my-1">
                                    {link.href.startsWith("http") || link.href.startsWith("/api/") ? (
                                        <a href={link.href} className="p-2 md:p-4 text-sm md:text-base">
                                            {link.label}
                                        </a>
                                    ) : (
                                        <Link to={link.href} className="p-2 md:p-4 text-sm md:text-base">
                                            {link.label}
                                        </Link>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </nav>
                    <div className="w-full md:max-w-[33%] p-4 md:p-8 self-start">
                        <h5 className="p-2 md:p-4 text-base md:text-lg font-semibold">Help</h5>
                        <ul className="flex flex-col justify-center">
                            <li className="my-1">
                                <Link to="/about" className="p-2 md:p-4 text-sm md:text-base">
                                    About
                                </Link>
                            </li>
                            <li className="my-1">
                                <Link to="/faq" className="p-2 md:p-4 text-sm md:text-base">
                                    FAQ
                                </Link>
                            </li>
                            <li className="my-1">
                                <Link to="/contact" className="p-2 md:p-4 text-sm md:text-base">
                                    Contact Support
                                </Link>
                            </li>
                            <li className="my-1">
                                <Link to="/terms" className="p-2 md:p-4 text-sm md:text-base">
                                    Terms of Service
                                </Link>
                            </li>
                            <li className="my-1">
                                <Link to="/privacy" className="p-2 md:p-4 text-sm md:text-base">
                                    Privacy Policy
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div className="w-full md:max-w-[33%] p-4 md:p-8 self-start">
                        <h5 className="p-2 md:p-4 text-base md:text-lg font-semibold">Contact Us</h5>
                        <p className="px-2 md:px-4 text-sm md:text-base">
                            Lost and Found Team
                            <br />
                            Wentworth Institute of Technology
                            <br />
                            550 Huntington Ave, Boston, MA 02115
                            <br />
                            <Link to="mailto:lostandfound@wit.edu">lostandfound@wit.edu</Link>
                            {/* <br />
                            <Link to="#">+1 (617) 555-5555</Link> */}
                        </p>
                    </div>
                </div>
                <div className="bg-gray-800 text-white py-3 md:py-4 w-full text-center">
                    <p className="text-sm md:text-base">
                        &copy; {new Date().getFullYear()} Lost and Found. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
