import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // libheif-js ships a WASM bundle. Keeping these packages external lets the
  // HEIC decoder load that bundle from node_modules on Windows.
  serverExternalPackages: ["heic-convert", "heic-decode", "libheif-js"],
  // This site reads and writes PostgreSQL on every request. Cache Components
  // prerender a static shell and require Suspense around each database read,
  // which would serve stale promotion content after admin edits.
  cacheComponents: false,
  experimental: {
    serverActions: {
      bodySizeLimit: "20mb",
    },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "img.youtube.com" },
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
