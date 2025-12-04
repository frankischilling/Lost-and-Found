import { Link } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface FAQItemProps {
    question: string;
    answer: string | React.ReactNode;
}

function FAQItem({ question, answer }: FAQItemProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Card className="mb-4">
            <CardHeader
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold">{question}</CardTitle>
                    <ChevronDown
                        className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    />
                </div>
            </CardHeader>
            {isOpen && (
                <CardContent>
                    <CardDescription className="text-gray-700 leading-relaxed">{answer}</CardDescription>
                </CardContent>
            )}
        </Card>
    );
}

export default function FAQ() {
    const generalFAQs: FAQItemProps[] = [
        {
            question: "What is Lost and Found?",
            answer: "Lost and Found is a web-based platform designed to help students, staff, and faculty at Wentworth Institute of Technology report and recover lost items. You can browse items that others have found, report items you've lost, or post about items you've found to help return them to their rightful owners.",
        },
        {
            question: "Do I need an account to use Lost and Found?",
            answer: "You can browse some items without an account, but you'll need to sign in with your Wentworth account to create posts, add comments, or mark items as claimed. This helps us maintain security and accountability within our campus community.",
        },
        {
            question: "How much does it cost to use?",
            answer: "Lost and Found is completely free for all members of the Wentworth community. There are no fees to post items, browse listings, or use any features of the platform.",
        },
        {
            question: "Is my personal information safe?",
            answer: "Yes! We take privacy seriously. Your personal information is protected, and you control what details you share in your posts. All posts are reviewed by administrators before going live to ensure they meet our community guidelines.",
        },
    ];

    const reportingFAQs: FAQItemProps[] = [
        {
            question: "How do I report a lost item?",
            answer: (
                <>
                    Click on "Report Lost" in the navigation menu or visit the{" "}
                    <Link to="/posts/new/lost" className="text-blue-600 underline hover:text-blue-800">
                        Report Lost Item
                    </Link>{" "}
                    page. Fill out the form with as much detail as possible, including photos if available. The more
                    details you provide, the easier it will be for someone who found your item to identify it.
                </>
            ),
        },
        {
            question: "How do I report a found item?",
            answer: (
                <>
                    Click on "Report Found" in the navigation menu or visit the{" "}
                    <Link to="/posts/new/found" className="text-blue-600 underline hover:text-blue-800">
                        Report Found Item
                    </Link>{" "}
                    page. Include photos and a detailed description. For security reasons, you may want to leave out one
                    or two identifying details that the owner could confirm when they claim it.
                </>
            ),
        },
        {
            question: "How many photos can I upload?",
            answer: "You can upload up to 10 photos per post. We recommend including multiple angles and any distinctive features to help with identification. Photos are limited to JPEG, PNG, GIF, and WebP formats.",
        },
        {
            question: "Can I edit my post after submitting it?",
            answer: "Yes! You can edit your posts at any time by visiting the post page and clicking the edit button. This is helpful if you remember additional details or want to update the status of your item.",
        },
        {
            question: "Why isn't my post showing up immediately?",
            answer: "All posts are reviewed by our administrators before appearing publicly. This helps maintain the quality and safety of our platform. Most posts are approved within 24 hours. You'll be able to see your post in your profile even while it's pending approval.",
        },
    ];

    const searchingFAQs: FAQItemProps[] = [
        {
            question: "How do I search for my lost item?",
            answer: (
                <>
                    Visit the{" "}
                    <Link to="/browse/found" className="text-blue-600 underline hover:text-blue-800">
                        Browse Found Items
                    </Link>{" "}
                    page and use the search bar to filter by keywords, location, or description. You can search for item
                    names, colors, brands, locations, and more.
                </>
            ),
        },
        {
            question: "What if I don't see my item listed?",
            answer: "If your lost item isn't listed yet, create a lost item report. When someone finds it and posts it to the platform, they or other users may be able to match it with your report. You can also check back regularly as new items are posted daily.",
        },
        {
            question: "How do I know if someone found my item?",
            answer: "If someone comments on your lost item post or if there's a potential match, you'll receive a notification. You can also enable browser notifications to get real-time alerts.",
        },
        {
            question: "Can I save or bookmark items?",
            answer: "Currently, this feature is not available, but you can comment on items you're interested in or return to browse pages to search for them again. We're considering adding a bookmark feature in future updates.",
        },
    ];

    const claimingFAQs: FAQItemProps[] = [
        {
            question: "I found my item in the listings. What do I do next?",
            answer: "Great! Leave a comment on the post describing some identifying details that prove it's yours. The person who found it will respond to arrange a pickup. Be prepared to verify ownership by describing unique features that weren't mentioned in the post.",
        },
        {
            question: "Someone claims my found item is theirs. How do I verify?",
            answer: "Ask them to describe specific details about the item that you didn't include in your post—things like what was inside a wallet, specific scratches or marks, or serial numbers. Once you're confident they're the rightful owner, arrange a safe pickup location on campus.",
        },
        {
            question: "Where should we meet to exchange items?",
            answer: "We recommend meeting in public, well-lit areas on campus such as the library, Info Hub, or public safety office. For valuable items like electronics or IDs, consider meeting at the public safety office.",
        },
        {
            question: "What happens after I claim an item?",
            answer: "Once the item has been returned, mark it as claimed on the post. This removes it from public listings and helps us track successful reunions. The post will remain visible in your profile history for your records.",
        },
        {
            question: "What if the owner never claims the item I found?",
            answer: "If no one claims the item after several weeks, consider turning it in to Public Safety or the Info Hub. They have procedures for storing and eventually disposing of unclaimed items according to campus policies.",
        },
    ];

    const technicalFAQs: FAQItemProps[] = [
        {
            question: "What browsers are supported?",
            answer: "Lost and Found works best on modern browsers including Chrome, Firefox, Safari, and Edge. Make sure your browser is up to date for the best experience.",
        },
        {
            question: "Can I use Lost and Found on my phone?",
            answer: "Yes! Our platform is fully responsive and works on smartphones and tablets. You can even use your phone's camera to take photos directly when creating a post.",
        },
        {
            question: "I'm having technical issues. Who can I contact?",
            answer: (
                <>
                    Please visit our{" "}
                    <Link to="/contact" className="text-blue-600 underline hover:text-blue-800">
                        Contact Support
                    </Link>{" "}
                    page to report technical issues. Include details about what you were trying to do and any error
                    messages you received.
                </>
            ),
        },
        {
            question: "How do I enable notifications?",
            answer: "When you first sign in, your browser will ask if you want to receive notifications from Lost and Found. Click 'Allow' to enable them. You can change this setting in your browser's notification preferences at any time.",
        },
    ];

    return (
        <main className="pt-16 p-4 container mx-auto max-w-4xl">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
                <p className="text-xl text-gray-600">Find answers to common questions about using Lost and Found</p>
            </div>

            <div className="space-y-8">
                <section>
                    <h2 className="text-2xl font-bold mb-4 text-blue-600">General Questions</h2>
                    {generalFAQs.map((faq, index) => (
                        <FAQItem key={index} question={faq.question} answer={faq.answer} />
                    ))}
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4 text-green-600">Reporting Items</h2>
                    {reportingFAQs.map((faq, index) => (
                        <FAQItem key={index} question={faq.question} answer={faq.answer} />
                    ))}
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4 text-purple-600">Searching & Browsing</h2>
                    {searchingFAQs.map((faq, index) => (
                        <FAQItem key={index} question={faq.question} answer={faq.answer} />
                    ))}
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4 text-orange-600">Claiming Items</h2>
                    {claimingFAQs.map((faq, index) => (
                        <FAQItem key={index} question={faq.question} answer={faq.answer} />
                    ))}
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4 text-red-600">Technical Support</h2>
                    {technicalFAQs.map((faq, index) => (
                        <FAQItem key={index} question={faq.question} answer={faq.answer} />
                    ))}
                </section>
            </div>

            <div className="mt-12 bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                <h3 className="text-xl font-semibold mb-3">Still have questions?</h3>
                <p className="text-gray-600 mb-4">Can't find the answer you're looking for? We're here to help!</p>
                <Link
                    to="/contact"
                    className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Contact Support
                </Link>
            </div>
        </main>
    );
}
