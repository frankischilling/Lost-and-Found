import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("admin", "routes/admin.tsx"),
    route("posts/new", "routes/posts/new.tsx"),
    route("posts/:id/edit", "routes/posts/edit.tsx"),
    route("signin", "routes/signin.tsx"),
    route("signout", "routes/signout.tsx"),
] satisfies RouteConfig;
