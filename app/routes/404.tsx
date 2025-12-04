import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { SearchX, Home, MapPin, Package } from "lucide-react";

export default function NotFound() {
    return (
        <main className="pt-16 min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
            <div className="max-w-2xl w-full text-center space-y-8">
                {/* Icon and 404 */}
                <div className="space-y-4">
                    <div className="flex justify-center">
                        <div className="relative">
                            <SearchX className="w-24 h-24 text-gray-300" strokeWidth={1.5} />
                            <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                                !
                            </div>
                        </div>
                    </div>
                    <h1 className="text-6xl font-bold text-gray-900">404</h1>
                    <h2 className="text-2xl font-semibold text-gray-700">Page Not Found</h2>
                    <p className="text-gray-600 max-w-md mx-auto">
                        Looks like this page got lost! Just like a missing item, we couldn't find what you're looking
                        for.
                    </p>
                </div>

                {/* Quick Actions */}
                <div className="space-y-4">
                    <p className="text-sm text-gray-500 font-medium">Where would you like to go?</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
                        <Link to="/">
                            <Button variant="default" className="w-full h-auto py-4 flex flex-col gap-2">
                                <Home className="w-6 h-6" />
                                <span className="font-semibold">Home</span>
                                <span className="text-xs opacity-90">Go back to homepage</span>
                            </Button>
                        </Link>
                        <Link to="/browse/lost">
                            <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                                <SearchX className="w-6 h-6" />
                                <span className="font-semibold">Browse Lost Items</span>
                                <span className="text-xs opacity-90">Find lost items</span>
                            </Button>
                        </Link>
                        <Link to="/browse/found">
                            <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                                <Package className="w-6 h-6" />
                                <span className="font-semibold">Browse Found Items</span>
                                <span className="text-xs opacity-90">Check found items</span>
                            </Button>
                        </Link>
                        <Link to="/posts/new/lost">
                            <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                                <MapPin className="w-6 h-6" />
                                <span className="font-semibold">Report Lost Item</span>
                                <span className="text-xs opacity-90">Create a report</span>
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Help Text */}
                <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-500">
                        If you believe this is an error, please{" "}
                        <Link to="/about" className="text-blue-600 hover:text-blue-700 underline font-medium">
                            contact us
                        </Link>
                        .
                    </p>
                </div>
            </div>
        </main>
    );
}
