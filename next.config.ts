import type { NextConfig } from "next";

// Sent with every response.
const SECURITY_HEADERS = Object.entries({
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "same-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
}).map(([key, value]) => ({ key, value }));

const config: NextConfig = {
  poweredByHeader: false,
  images: {
    // Photos of past editions never change: let browsers and the CDN keep them for 30 days.
    minimumCacheTTL: 2_592_000,
    formats: ["image/webp", "image/avif"],
    deviceSizes: [480, 768, 1024, 1440, 1920],
  },
  headers: async () => [{ source: "/(.*)", headers: SECURITY_HEADERS }],
};

export default config;
