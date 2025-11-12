import { useEffect, useState } from "react";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
    return [
        { title: "Lost and Found Management Page" },
        { name: "description", content: "Manage lost and found items" },
    ];
}

export default function Admin() {
    const [health, setHealth] = useState("Unknown");

    async function checkServerHealth(): Promise<void> {
        setHealth("Checking...");
        try {
            const response = await fetch("https://project.frankhagan.online/health.php");
            if (response.ok) {
                setHealth("Healthy");
            } else {
                setHealth("Unhealthy");
            }
        } catch (error) {
            setHealth("Error connecting to server");
        }
    }

    useEffect(() => {
        checkServerHealth();
    }, []);

    return (
        <main className="pt-16 p-4 container mx-auto">
            <h1 className="text-4xl font-bold mb-4">Admin Page</h1>
            <p className="text-lg">
                This is the admin page of the Lost and Found application. Here you can manage lost items, found items,
                and search for items that have been reported.
            </p>
            <br />
            <h3>Server Health</h3>
            <p>Status: {health}</p>
            <button
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded cursor-pointer"
                onClick={checkServerHealth}
            >
                Check Server Health
            </button>
        </main>
    );
}
