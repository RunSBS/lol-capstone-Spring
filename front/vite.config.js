// config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            "/summoner": "http://localhost:8080",
            "/match": "http://localhost:8080"
        }
    }
});
