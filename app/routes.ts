import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
    layout("layout.tsx", [
        index("routes/home.tsx"),
        route("admin", "routes/admin.tsx"),

        // Create posts
        route("posts/new/lost", "routes/posts/new-lost.tsx"),
        route("posts/new/found", "routes/posts/new-found.tsx"),

        // Browse posts
        route("browse/lost", "routes/posts/browse-lost.tsx"),
        route("browse/found", "routes/posts/browse-found.tsx"),

        // View single post
        route("posts/:id", "routes/posts/view.tsx"),

        // Single post edit
        route("posts/:id/edit", "routes/posts/edit.tsx"),

        // Site pages
        route("profile", "routes/profile.tsx"),
        route("about", "routes/about.tsx"),
        route("faq", "routes/faq.tsx"),
        route("contact", "routes/contact.tsx"),
        route("terms", "routes/terms.tsx"),
        route("privacy", "routes/privacy.tsx"),

        // 404 catch-all
        route("*", "routes/404.tsx"),
    ]),
    // Auth
    route("signin", "routes/signin.tsx"),
    route("signout", "routes/signout.tsx"),
] satisfies RouteConfig;
