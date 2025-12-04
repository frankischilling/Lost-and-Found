import { Link } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { MessageCircle, Search, Shield, Users, Heart, MapPin, Bell, CheckCircle } from "lucide-react";
import { Button } from "~/components/ui/button";

export default function About() {
    return (
        <main className="pt-16 p-4 container mx-auto max-w-6xl">
            {/* Hero Section */}
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4">About Lost and Found</h1>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                    Connecting our community through a simple, effective platform for reporting and recovering lost
                    items on campus.
                </p>
            </div>

            {/* Mission Statement */}
            <Card className="mb-12 border-blue-200 bg-blue-50">
                <CardContent>
                    <div className="flex items-start gap-4">
                        <Heart className="w-8 h-8 text-blue-600 shrink-0 mt-1" />
                        <div>
                            <h2 className="text-2xl font-semibold mb-3">Our Mission</h2>
                            <p className="text-gray-700 leading-relaxed">
                                Lost and Found was created to help students, staff, and faculty reunite with their
                                belongings. We believe that losing something shouldn't mean it's gone forever. By
                                providing a centralized platform where our community can report lost and found items, we
                                make it easier than ever to recover what matters to you.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* How It Works */}
            <div className="mb-12">
                <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader>
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                                <Search className="w-6 h-6 text-blue-600" />
                            </div>
                            <CardTitle className="text-lg">1. Browse Items</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CardDescription>
                                Search through reported lost and found items using our easy-to-use browse pages.
                            </CardDescription>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                                <MapPin className="w-6 h-6 text-green-600" />
                            </div>
                            <CardTitle className="text-lg">2. Report Items</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CardDescription>
                                Found something? Lost something? Create a detailed report with photos and descriptions.
                            </CardDescription>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                                <Bell className="w-6 h-6 text-purple-600" />
                            </div>
                            <CardTitle className="text-lg">3. Get Notified</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CardDescription>
                                Receive notifications when someone comments on your post or when there's activity on
                                items you're tracking.
                            </CardDescription>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-3">
                                <CheckCircle className="w-6 h-6 text-orange-600" />
                            </div>
                            <CardTitle className="text-lg">4. Connect & Recover</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CardDescription>
                                Use the comment system to verify ownership and arrange pickup. Mark items as claimed
                                when recovered.
                            </CardDescription>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Features */}
            <div className="mb-12">
                <h2 className="text-3xl font-bold text-center mb-8">Key Features</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <Shield className="w-6 h-6 text-blue-600" />
                                <CardTitle>Secure & Private</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <CardDescription>
                                All posts are moderated by administrators before appearing publicly. Your personal
                                information is protected, and you control what details to share. Learn more in our{" "}
                                <Link to="/privacy" className="text-blue-600 underline hover:text-blue-800">
                                    Privacy Policy
                                </Link>
                                .
                            </CardDescription>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <MessageCircle className="w-6 h-6 text-green-600" />
                                <CardTitle>Easy Communication</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <CardDescription>
                                Comment on posts to ask questions, verify details, or arrange item pickup. Our comment
                                system makes it simple to connect with finders and owners.
                            </CardDescription>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <Search className="w-6 h-6 text-purple-600" />
                                <CardTitle>Powerful Search</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <CardDescription>
                                Filter through items by keywords, descriptions, locations, and tags. Find what you're
                                looking for quickly with our intuitive search functionality.
                            </CardDescription>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <Users className="w-6 h-6 text-orange-600" />
                                <CardTitle>Community-Driven</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <CardDescription>
                                Built by students, for students. Our platform thrives on community participation and
                                goodwill. Every report helps someone get their belongings back.
                            </CardDescription>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Statistics or Impact */}
            <Card className="mb-12 bg-linear-to-r from-blue-50 to-purple-50 border-none">
                <CardContent>
                    <h2 className="text-3xl font-bold text-center mb-4">Making a Difference</h2>
                    <p className="text-center text-gray-700 max-w-2xl mx-auto leading-relaxed">
                        Every day, members of our community help each other recover lost items—from keys and water
                        bottles to laptops and textbooks. Together, we're building a culture of honesty and mutual
                        support that makes our campus a better place for everyone.
                    </p>
                </CardContent>
            </Card>

            {/* Get Started CTA */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                <h2 className="text-2xl font-bold mb-3">Ready to Get Started?</h2>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                    Whether you've lost something or found an item that needs to be returned, you can make a difference
                    today.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/posts/new/lost">
                        <Button size="lg" variant="outline" className="w-full sm:w-auto">
                            Report a Lost Item
                        </Button>
                    </Link>
                    <Link to="/posts/new/found">
                        <Button size="lg" variant="outline" className="w-full sm:w-auto">
                            Report a Found Item
                        </Button>
                    </Link>
                    <Link to="/browse/lost">
                        <Button size="lg" variant="outline" className="w-full sm:w-auto">
                            Browse Items
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Contact/Support Section */}
            <div className="mt-12 text-center pb-8">
                <h3 className="text-xl font-semibold mb-3">Need Help?</h3>
                <p className="text-gray-600 mb-4">Have questions or feedback? We'd love to hear from you.</p>
                <div className="flex flex-wrap gap-4 justify-center">
                    <Link to="/faq">
                        <Button variant="outline" className="px-6 py-2">
                            View FAQ
                        </Button>
                    </Link>
                    <Link to="/contact">
                        <Button variant="outline" className="px-6 py-2">
                            Contact Support
                        </Button>
                    </Link>
                </div>
                <p className="text-sm text-gray-500 mt-4">
                    By using Lost and Found, you agree to our{" "}
                    <Link to="/terms" className="text-blue-600 underline hover:text-blue-800">
                        Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link to="/privacy" className="text-blue-600 underline hover:text-blue-800">
                        Privacy Policy
                    </Link>
                    .
                </p>
            </div>
        </main>
    );
}
