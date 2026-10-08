import type { NextConfig } from "next";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const config: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  devIndicators: false,
  images: {
    remotePatterns: url
      ? [
          {
            protocol: "https",
            hostname: new URL(url).hostname,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};
export default config;
