import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
    plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
    server: {
        proxy: {
            "/api": {
                target: "https://project.frankhagan.online",
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path.replace(/^\/api/, ""),
                configure: (proxy) => {
                    proxy.on("proxyReq", (proxyReq) => {
                        // Add a custom header so backend knows this is from localhost dev
                        proxyReq.setHeader("X-Forwarded-Host", "localhost:5173");
                        proxyReq.setHeader("X-Dev-Mode", "true");
                    });
                },
            },
        },
    },
});
