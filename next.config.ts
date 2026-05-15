import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  experimental: {
    optimizePackageImports: ["lucide-react", "date-fns"],
  },
  async rewrites() {
    return [
      {
        source: "/backend/:path*",
        destination: "https://prescriptions-app-backend.onrender.com/:path*",
      },
    ];
  },
  async headers() {
    // The CSP `connect-src` allowlist MUST include the API origin the
    // browser will dial. Default for production builds is the Render URL
    // baked at build time; the local-dev fallback covers `pnpm dev`.
    // Both loopback hostnames are listed so `127.0.0.1` and `localhost`
    // work interchangeably — Playwright tests + Next dev have historically
    // mixed them and silent CSP blocks surfaced as opaque axios
    // "Network Error" responses (run #25908783621).
    const apiOrigin =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    const connectSrc = [
      "'self'",
      apiOrigin,
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://localhost:3001",
      "http://127.0.0.1:3001",
    ]
      .filter((v, i, a) => a.indexOf(v) === i)
      .join(" ");
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src ${connectSrc};`,
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
