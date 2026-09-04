import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import fs from "fs";

// Read config.json to get the backend address (consistent with the WebPage version)
const configPath = resolve(__dirname, "public/static/config.json");
let backendUrl = "http://localhost:18084"; // Default value
try {
  if (fs.existsSync(configPath)) {
    const configContent = fs.readFileSync(configPath, "utf8");
    const config = JSON.parse(configContent);
    if (config.baseUrl) backendUrl = config.baseUrl;
  }
} catch (error) {
  console.warn("Failed to read config.json, using the default backend address:", backendUrl);
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "./dist",
    chunkSizeWarningLimit: 1500,
  },
  server: {
    host: true,
    port: 18085,
    fs: {
      strict: false,
      allow: [".."],
    },
    proxy: {
      "/api": {
        target: backendUrl,
        changeOrigin: true,
      },
      "/static": {
        target: backendUrl,
        changeOrigin: true,
      },
    },
  },
});
