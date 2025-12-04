import { Link } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Mail, MapPin, MessageCircle, Bug, HelpCircle } from "lucide-react";

export default function Contact() {
    return (
        <main className="pt-16 p-4 container mx-auto max-w-6xl">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4">Contact Support</h1>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                    Need help? Have feedback? We're here to assist you with any questions or issues.
                </p>
            </div>

            {/* Contact Methods */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                <Card>
                    <CardHeader>
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                            <Mail className="w-6 h-6 text-blue-600" />
                        </div>
                        <CardTitle>Email Us</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CardDescription className="mb-3">
                            For general inquiries, technical support, or feedback
                        </CardDescription>
                        <a
                            href="mailto:lostandfound@wit.edu"
                            className="text-blue-600 hover:text-blue-800 font-medium underline"
                        >
                            lostandfound@wit.edu
                        </a>
                        <p className="text-sm text-gray-500 mt-2">We typically respond within 24-48 hours</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                            <MapPin className="w-6 h-6 text-green-600" />
                        </div>
                        <CardTitle>Visit Public Safety</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CardDescription className="mb-3">
                            For in-person assistance with lost or found items
                        </CardDescription>
                        <p className="font-medium">Wentworth Institute of Technology</p>
                        <p className="text-sm text-gray-600">610 Huntington Ave</p>
                        <p className="text-sm text-gray-600">Boston, MA 02115</p>
                    </CardContent>
                </Card>
            </div>

            {/* Support Topics */}
            <div className="mb-12">
                <h2 className="text-3xl font-bold text-center mb-8">How Can We Help?</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <Bug className="w-6 h-6 text-red-600" />
                                <CardTitle>Report a Technical Issue</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <CardDescription className="mb-4">
                                Experiencing bugs, errors, or technical problems? Let us know so we can fix them.
                            </CardDescription>
                            <ul className="text-sm text-gray-600 space-y-2 mb-4">
                                <li>• Website not loading properly</li>
                                <li>• Can't upload photos</li>
                                <li>• Login or authentication issues</li>
                                <li>• Broken links or missing pages</li>
                                <li>• Notification problems</li>
                            </ul>
                            <p className="text-sm text-gray-600">
                                <strong>When reporting:</strong> Include your browser, device type, and steps to
                                reproduce the issue.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <HelpCircle className="w-6 h-6 text-blue-600" />
                                <CardTitle>General Questions</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <CardDescription className="mb-4">
                                Need help using the platform or have questions about how it works?
                            </CardDescription>
                            <ul className="text-sm text-gray-600 space-y-2 mb-4">
                                <li>• How to create a post</li>
                                <li>• Understanding post approval process</li>
                                <li>• How to claim an item</li>
                                <li>• Account and profile questions</li>
                                <li>• Search and filter tips</li>
                            </ul>
                            <p className="text-sm text-gray-600">
                                <strong>Tip:</strong> Check our{" "}
                                <Link to="/faq" className="text-blue-600 underline hover:text-blue-800">
                                    FAQ page
                                </Link>{" "}
                                first for quick answers.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <MessageCircle className="w-6 h-6 text-green-600" />
                                <CardTitle>Feedback & Suggestions</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <CardDescription className="mb-4">
                                We'd love to hear your ideas for improving Lost and Found!
                            </CardDescription>
                            <ul className="text-sm text-gray-600 space-y-2 mb-4">
                                <li>• Feature requests</li>
                                <li>• Design improvements</li>
                                <li>• User experience suggestions</li>
                                <li>• Content recommendations</li>
                                <li>• General feedback</li>
                            </ul>
                            <p className="text-sm text-gray-600">
                                <strong>Your input matters:</strong> We're continuously improving based on user
                                feedback.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <MapPin className="w-6 h-6 text-orange-600" />
                                <CardTitle>Lost Item Assistance</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <CardDescription className="mb-4">
                                Need help with a specific lost or found item on campus?
                            </CardDescription>
                            <ul className="text-sm text-gray-600 space-y-2 mb-4">
                                <li>• Item not appearing in search</li>
                                <li>• Questions about claiming process</li>
                                <li>• Verification assistance</li>
                                <li>• Arranging item pickup</li>
                                <li>• Post visibility concerns</li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Before You Contact */}
            <Card className="mb-12 bg-blue-50 border-blue-200">
                <CardHeader>
                    <CardTitle className="text-2xl">Before You Contact Us</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-700 mb-4">
                        To help us assist you more quickly, please try these resources first:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                                <HelpCircle className="w-4 h-4" />
                                Check the FAQ
                            </h4>
                            <p className="text-sm text-gray-600 mb-2">
                                Most common questions are answered in our{" "}
                                <Link to="/faq" className="text-blue-600 underline hover:text-blue-800">
                                    Frequently Asked Questions
                                </Link>{" "}
                                section.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                                <MessageCircle className="w-4 h-4" />
                                Search for Your Item
                            </h4>
                            <p className="text-sm text-gray-600 mb-2">
                                Browse{" "}
                                <Link to="/browse/found" className="text-blue-600 underline hover:text-blue-800">
                                    found items
                                </Link>{" "}
                                or{" "}
                                <Link to="/browse/lost" className="text-blue-600 underline hover:text-blue-800">
                                    lost items
                                </Link>{" "}
                                to see if it's already listed.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </main>
    );
}
