import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createProxyMiddleware } from "http-proxy-middleware";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 18090; // 18086-18089 are reserved by Windows (Hyper-V), so 18090 is used instead
const BACKEND = "http://localhost:18084"; // nodeApi backend (CORS not enabled, must be proxied same-origin)

// API proxy: /api -> nodeApi
app.use(
  "/api",
  createProxyMiddleware({
    target: BACKEND,
    changeOrigin: true,
  })
);

// /static static resources:
// 1) Prioritize this project's public/static (config.json, with baseUrl as "" it goes through the same-origin proxy)
// 2) The rest (libs decoders, OutputModel model data) are shared from VuePage's directory, no copying
app.use(
  "/static",
  express.static(path.join(__dirname, "public/static")),
  express.static(path.join(__dirname, "../VuePage/public/static"))
);

// Build output
app.use(express.static(path.join(__dirname, "dist")));

// SPA fallback (does not affect /static and /api)
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/static/") || req.path.startsWith("/api/")) {
    return next();
  }
  res.sendFile(path.join(__dirname, "dist/index.html"));
});

app.listen(PORT, () => {
  console.log(`React static server running at http://localhost:${PORT}`);
  console.log(`API proxied to ${BACKEND}`);
  console.log(`Model/decoder resources shared from ../VuePage/public/static`);
});
