import { Link } from "react-router";
import type { Route } from "./+types/home";
import { mapRowToPost, type Post, type PostRow } from "~/types/post";

export function meta({}: Route.MetaArgs) {
    return [{ title: "Sign Out | Lost and Found" }, { name: "description", content: "You are now signed out." }];
}

export default function SignOut() {
    return (
        <main className="pt-16 p-4 container mx-auto">
            <h1 className="text-4xl font-bold mb-4">You have been signed out</h1>
            <p className="text-lg">
                Thank you for using Lost and Found. You can now safely close this window or{" "}
                <Link to="/signin" className="text-blue-500 underline">
                    sign in again
                </Link>
                .
            </p>
        </main>
    );
}
