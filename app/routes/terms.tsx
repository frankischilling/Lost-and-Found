import { Link } from "react-router";
import { Card, CardContent } from "~/components/ui/card";
import { Shield, CheckCircle } from "lucide-react";

export default function Terms() {
    return (
        <main className="pt-16 p-4 container mx-auto max-w-4xl">
            <div className="text-center mb-12">
                <Shield className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
                <p className="text-gray-600">Last Updated: December 4, 2025</p>
            </div>

            <Card className="mb-8 bg-blue-50 border-blue-200">
                <CardContent>
                    <p className="text-gray-700 leading-relaxed">
                        By accessing and using the Lost and Found platform ("Service"), you agree to be bound by these
                        Terms of Service. If you do not agree to these terms, please do not use the Service.
                    </p>
                </CardContent>
            </Card>

            <div className="space-y-8 prose prose-lg max-w-none">
                <section>
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                        1. Acceptance of Terms
                    </h2>
                    <Card>
                        <CardContent>
                            <p className="text-gray-700 leading-relaxed">
                                By creating an account or using our Service, you represent that you are:
                            </p>
                            <ul className="list-disc list-inside text-gray-700 space-y-2 mt-2">
                                <li>
                                    A current student, faculty member, or staff of Wentworth Institute of Technology
                                </li>
                                <li>At least 18 years of age or have parental consent to use the Service</li>
                            </ul>
                        </CardContent>
                    </Card>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4">2. User Accounts</h2>
                    <Card>
                        <CardContent>
                            <div className="space-y-4 text-gray-700">
                                <div>
                                    <h3 className="font-semibold mb-2">2.1 Account Creation</h3>
                                    <p>
                                        You must sign in with your Wentworth Google account to access certain features.
                                        You are responsible for maintaining the confidentiality of your account and for
                                        all activities that occur under your account.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-2">2.2 Account Responsibilities</h3>
                                    <p>You agree to:</p>
                                    <ul className="list-disc list-inside space-y-1 mt-2">
                                        <li>Provide accurate and complete information</li>
                                        <li>Maintain the security of your account credentials</li>
                                        <li>Notify us immediately of any unauthorized access</li>
                                        <li>Accept responsibility for all activities under your account</li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4">3. Acceptable Use</h2>
                    <Card>
                        <CardContent>
                            <div className="space-y-4 text-gray-700">
                                <div>
                                    <h3 className="font-semibold mb-2">3.1 Permitted Uses</h3>
                                    <p>You may use the Service to:</p>
                                    <ul className="list-disc list-inside space-y-1 mt-2">
                                        <li>Report lost or found items on campus</li>
                                        <li>Search for your lost belongings</li>
                                        <li>Help return found items to their rightful owners</li>
                                        <li>Communicate with other users regarding posted items</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-2">3.2 Prohibited Conduct</h3>
                                    <p>You agree NOT to:</p>
                                    <ul className="list-disc list-inside space-y-1 mt-2">
                                        <li>Post false, misleading, or fraudulent information</li>
                                        <li>Attempt to claim items that do not belong to you</li>
                                        <li>Use the Service for commercial purposes or advertising</li>
                                        <li>Harass, threaten, or abuse other users</li>
                                        <li>Post content that violates any law or regulation</li>
                                        <li>Upload viruses or malicious code</li>
                                        <li>Scrape or collect user data without permission</li>
                                        <li>Impersonate another person or entity</li>
                                        <li>Interfere with the proper functioning of the Service</li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4">4. Content and Intellectual Property</h2>
                    <Card>
                        <CardContent>
                            <div className="space-y-4 text-gray-700">
                                <div>
                                    <h3 className="font-semibold mb-2">4.1 Your Content</h3>
                                    <p>
                                        You retain ownership of content you post ("User Content"). By posting, you grant
                                        us a non-exclusive, worldwide, royalty-free license to use, display, and
                                        distribute your User Content solely for the purpose of operating the Service.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-2">4.2 Content Standards</h3>
                                    <p>All User Content must:</p>
                                    <ul className="list-disc list-inside space-y-1 mt-2">
                                        <li>Be accurate and truthful</li>
                                        <li>Not infringe on any third party's rights</li>
                                        <li>Not contain offensive, discriminatory, or inappropriate material</li>
                                        <li>Comply with all applicable laws and regulations</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-2">4.3 Content Moderation</h3>
                                    <p>
                                        We reserve the right to review, approve, reject, or remove any User Content at
                                        our discretion. All posts are subject to administrator approval before appearing
                                        publicly.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4">5. Privacy and Data</h2>
                    <Card>
                        <CardContent>
                            <p className="text-gray-700 leading-relaxed">
                                Your privacy is important to us. Our collection and use of personal information is
                                governed by our{" "}
                                <Link to="/privacy" className="text-blue-600 underline hover:text-blue-800">
                                    Privacy Policy
                                </Link>
                                , which is incorporated into these Terms by reference. By using the Service, you consent
                                to our privacy practices as described in the Privacy Policy.
                            </p>
                        </CardContent>
                    </Card>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4">6. Disclaimers and Limitations</h2>
                    <Card>
                        <CardContent>
                            <div className="space-y-4 text-gray-700">
                                <div>
                                    <h3 className="font-semibold mb-2">6.1 Service "As Is"</h3>
                                    <p>
                                        The Service is provided "as is" without warranties of any kind, either express
                                        or implied. We do not guarantee that the Service will be uninterrupted,
                                        error-free, or secure.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-2">6.2 No Guarantee of Results</h3>
                                    <p>
                                        We do not guarantee that you will recover lost items or successfully return
                                        found items. The Service is a tool to facilitate connections between users, but
                                        we cannot control outcomes.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-2">6.3 Third-Party Conduct</h3>
                                    <p>
                                        We are not responsible for the conduct of other users or the accuracy of
                                        information they post. Users interact at their own risk and should use caution
                                        when meeting to exchange items.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-2">6.4 Limitation of Liability</h3>
                                    <p>
                                        To the maximum extent permitted by law, we shall not be liable for any indirect,
                                        incidental, special, consequential, or punitive damages arising from your use of
                                        the Service.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4">7. Termination</h2>
                    <Card>
                        <CardContent>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                We reserve the right to suspend or terminate your access to the Service at any time,
                                with or without cause, with or without notice. Reasons for termination may include:
                            </p>
                            <ul className="list-disc list-inside text-gray-700 space-y-2">
                                <li>Violation of these Terms of Service</li>
                                <li>Fraudulent or illegal activity</li>
                                <li>Requests from law enforcement or legal process</li>
                                <li>Discontinuation of the Service</li>
                            </ul>
                        </CardContent>
                    </Card>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4">8. Changes to Terms</h2>
                    <Card>
                        <CardContent>
                            <p className="text-gray-700 leading-relaxed">
                                We may modify these Terms at any time by posting updated Terms on this page. The "Last
                                Updated" date at the top will reflect when changes were made. Your continued use of the
                                Service after changes are posted constitutes acceptance of the modified Terms.
                            </p>
                        </CardContent>
                    </Card>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4">9. Contact Information</h2>
                    <Card>
                        <CardContent>
                            <p className="text-gray-700 leading-relaxed mb-2">
                                If you have questions about these Terms of Service, please contact us:
                            </p>
                            <div className="text-gray-700 ml-4">
                                <p>
                                    Email:{" "}
                                    <a
                                        href="mailto:lostandfound@wit.edu"
                                        className="text-blue-600 underline hover:text-blue-800"
                                    >
                                        lostandfound@wit.edu
                                    </a>
                                </p>
                                <p>Address: 550 Huntington Ave, Boston, MA 02115</p>
                            </div>
                        </CardContent>
                    </Card>
                </section>
            </div>

            <div className="mt-12 bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                <p className="text-sm text-gray-600">
                    By using Lost and Found, you acknowledge that you have read, understood, and agree to be bound by
                    these Terms of Service.
                </p>
            </div>
        </main>
    );
}
