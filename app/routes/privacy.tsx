import { Link } from "react-router";
import { Card, CardContent } from "~/components/ui/card";
import { Shield, Lock, Eye, Database, UserCheck, Bell } from "lucide-react";

export default function Privacy() {
    return (
        <main className="pt-16 p-4 container mx-auto max-w-4xl">
            <div className="text-center mb-12">
                <Lock className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
                <p className="text-gray-600">Last Updated: December 4, 2025</p>
            </div>

            <Card className="mb-8 bg-blue-50 border-blue-200">
                <CardContent>
                    <p className="text-gray-700 leading-relaxed">
                        At Lost and Found, we take your privacy seriously. This Privacy Policy explains how we collect,
                        use, disclose, and safeguard your information when you use our platform. By using the Service,
                        you agree to the collection and use of information in accordance with this policy.
                    </p>
                </CardContent>
            </Card>

            <div className="space-y-8">
                <section>
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                        <Database className="w-6 h-6 text-blue-600" />
                        1. Information We Collect
                    </h2>
                    <Card>
                        <CardContent>
                            <div className="space-y-4 text-gray-700">
                                <div>
                                    <h3 className="font-semibold mb-2">1.1 Information You Provide</h3>
                                    <p className="mb-2">When you use our Service, you may provide:</p>
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>
                                            <strong>Account Information:</strong> Name, email address, and profile
                                            information from your Wentworth Google account
                                        </li>
                                        <li>
                                            <strong>Post Content:</strong> Descriptions, photos, locations, and other
                                            details about lost or found items
                                        </li>
                                        <li>
                                            <strong>Comments:</strong> Messages and communications with other users
                                        </li>
                                        <li>
                                            <strong>Contact Information:</strong> Any additional contact details you
                                            choose to share
                                        </li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="font-semibold mb-2">1.2 Automatically Collected Information</h3>
                                    <p className="mb-2">We automatically collect certain information, including:</p>
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>
                                            <strong>Usage Data:</strong> Pages visited, time spent, features used, and
                                            interaction patterns
                                        </li>
                                        <li>
                                            <strong>Device Information:</strong> Browser type, operating system, IP
                                            address, and device identifiers
                                        </li>
                                        <li>
                                            <strong>Log Data:</strong> Server logs including access times, errors, and
                                            system events
                                        </li>
                                        <li>
                                            <strong>Cookies:</strong> Session cookies to maintain your login state and
                                            preferences
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                        <Eye className="w-6 h-6 text-green-600" />
                        2. How We Use Your Information
                    </h2>
                    <Card>
                        <CardContent>
                            <div className="space-y-4 text-gray-700">
                                <p>We use your information to:</p>
                                <ul className="list-disc list-inside space-y-2">
                                    <li>
                                        <strong>Provide the Service:</strong> Enable you to create, browse, and manage
                                        posts about lost and found items
                                    </li>
                                    <li>
                                        <strong>Facilitate Communication:</strong> Allow you to communicate with other
                                        users through comments and notifications
                                    </li>
                                    <li>
                                        <strong>Moderate Content:</strong> Review posts for compliance with our Terms of
                                        Service and community guidelines
                                    </li>
                                    <li>
                                        <strong>Improve the Service:</strong> Analyze usage patterns to enhance
                                        features, fix bugs, and optimize performance
                                    </li>
                                    <li>
                                        <strong>Send Notifications:</strong> Alert you about comments, matches, and
                                        updates related to your posts
                                    </li>
                                    <li>
                                        <strong>Ensure Security:</strong> Protect against fraud, abuse, and unauthorized
                                        access
                                    </li>
                                    <li>
                                        <strong>Comply with Legal Obligations:</strong> Respond to legal requests and
                                        enforce our policies
                                    </li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                        <UserCheck className="w-6 h-6 text-purple-600" />
                        3. Information Sharing and Disclosure
                    </h2>
                    <Card>
                        <CardContent>
                            <div className="space-y-4 text-gray-700">
                                <div>
                                    <h3 className="font-semibold mb-2">3.1 Public Information</h3>
                                    <p>
                                        Posts about lost and found items are public and visible to all users of the
                                        platform. This includes descriptions, photos, and any information you choose to
                                        include in your posts.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="font-semibold mb-2">3.2 Within the Wentworth Community</h3>
                                    <p>
                                        Your name and profile information from your Wentworth account may be visible to
                                        other authenticated users when you create posts or comments.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="font-semibold mb-2">3.3 Administrators</h3>
                                    <p>
                                        Designated administrators can access all posts (including pending and rejected
                                        posts), user information, and activity logs for moderation and support purposes.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="font-semibold mb-2">3.4 Legal Requirements</h3>
                                    <p>We may disclose your information if required to:</p>
                                    <ul className="list-disc list-inside space-y-1 mt-2">
                                        <li>Comply with legal process or court orders</li>
                                        <li>Enforce our Terms of Service</li>
                                        <li>Protect the rights, property, or safety of our users or others</li>
                                        <li>Investigate potential violations or fraudulent activity</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="font-semibold mb-2">3.5 No Third-Party Sale</h3>
                                    <p>
                                        We do not sell, rent, or trade your personal information to third parties for
                                        marketing purposes.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                        <Shield className="w-6 h-6 text-orange-600" />
                        4. Data Security
                    </h2>
                    <Card>
                        <CardContent>
                            <div className="space-y-4 text-gray-700">
                                <p>
                                    We implement reasonable security measures to protect your information from
                                    unauthorized access, alteration, disclosure, or destruction. These measures include:
                                </p>
                                <ul className="list-disc list-inside space-y-2">
                                    <li>Secure authentication through Wentworth's SSO</li>
                                    <li>Encrypted data transmission using HTTPS</li>
                                    <li>Access controls and administrator authentication</li>
                                    <li>Regular security updates and monitoring</li>
                                    <li>Database protection and backup procedures</li>
                                </ul>
                                <p className="text-sm italic mt-4">
                                    However, no method of transmission over the internet or electronic storage is 100%
                                    secure. While we strive to protect your information, we cannot guarantee absolute
                                    security.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                        <Bell className="w-6 h-6 text-red-600" />
                        5. Your Rights and Choices
                    </h2>
                    <Card>
                        <CardContent>
                            <div className="space-y-4 text-gray-700">
                                <p>You have the following rights regarding your information:</p>
                                <ul className="list-disc list-inside space-y-2">
                                    <li>
                                        <strong>Access:</strong> View your posts and profile information at any time
                                    </li>
                                    <li>
                                        <strong>Edit:</strong> Update or modify your posts and profile details
                                    </li>
                                    <li>
                                        <strong>Delete:</strong> Remove your posts or request account deletion
                                    </li>
                                    <li>
                                        <strong>Opt-Out of Notifications:</strong> Disable browser notifications in your
                                        settings
                                    </li>
                                    <li>
                                        <strong>Limit Visibility:</strong> Control what information you include in your
                                        public posts
                                    </li>
                                </ul>
                                <p className="mt-4">
                                    To exercise these rights or for questions about your data, contact us at{" "}
                                    <a
                                        href="mailto:lostandfound@wit.edu"
                                        className="text-blue-600 underline hover:text-blue-800"
                                    >
                                        lostandfound@wit.edu
                                    </a>
                                    .
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4">6. Data Retention</h2>
                    <Card>
                        <CardContent>
                            <div className="space-y-4 text-gray-700">
                                <p>We retain your information for as long as:</p>
                                <ul className="list-disc list-inside space-y-2">
                                    <li>Your account is active</li>
                                    <li>Necessary to provide the Service</li>
                                    <li>Required by law or for legitimate business purposes</li>
                                    <li>Needed to resolve disputes or enforce agreements</li>
                                </ul>
                                <p className="mt-4">
                                    When you mark an item as claimed, it is hidden from public view but retained in your
                                    post history. Deleted posts may be kept in backups for a limited period for security
                                    and legal compliance purposes.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4">7. Children's Privacy</h2>
                    <Card>
                        <CardContent>
                            <p className="text-gray-700 leading-relaxed">
                                The Service is intended for use by members of the Wentworth community who are 18 years
                                or older. We do not knowingly collect information from individuals under 18 without
                                parental consent. If we become aware of such collection, we will take steps to delete
                                the information.
                            </p>
                        </CardContent>
                    </Card>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4">8. Changes to This Privacy Policy</h2>
                    <Card>
                        <CardContent>
                            <p className="text-gray-700 leading-relaxed">
                                We may update this Privacy Policy from time to time to reflect changes in our practices,
                                technology, legal requirements, or other factors. We will notify you of significant
                                changes by updating the "Last Updated" date and, where appropriate, through email or
                                in-app notifications. Your continued use of the Service after changes are posted
                                constitutes acceptance of the updated policy.
                            </p>
                        </CardContent>
                    </Card>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4">9. Contact Us</h2>
                    <Card>
                        <CardContent>
                            <div className="text-gray-700 space-y-2">
                                <p>If you have questions or concerns about this Privacy Policy, please contact us:</p>
                                <div className="ml-4 mt-3">
                                    <p>
                                        <strong>Email:</strong>{" "}
                                        <a
                                            href="mailto:lostandfound@wit.edu"
                                            className="text-blue-600 underline hover:text-blue-800"
                                        >
                                            lostandfound@wit.edu
                                        </a>
                                    </p>
                                    <p>
                                        <strong>Address:</strong> Wentworth Institute of Technology, 550 Huntington Ave,
                                        Boston, MA 02115
                                    </p>
                                    <p>
                                        <strong>Support:</strong>{" "}
                                        <Link to="/contact" className="text-blue-600 underline hover:text-blue-800">
                                            Contact Support Page
                                        </Link>
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4">10. Your Consent</h2>
                    <Card className="bg-blue-50 border-blue-200">
                        <CardContent>
                            <p className="text-gray-700 leading-relaxed">
                                By using Lost and Found, you consent to this Privacy Policy and our{" "}
                                <Link to="/terms" className="text-blue-600 underline hover:text-blue-800">
                                    Terms of Service
                                </Link>
                                . If you do not agree with any part of this policy, please discontinue use of the
                                Service.
                            </p>
                        </CardContent>
                    </Card>
                </section>
            </div>

            <div className="mt-12 text-center text-sm text-gray-500">
                <p>
                    This Privacy Policy is part of our commitment to transparency and protecting your privacy.
                    <br />
                    Thank you for being part of the Lost and Found community.
                </p>
            </div>
        </main>
    );
}
