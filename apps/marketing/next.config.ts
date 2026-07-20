import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  transpilePackages: ["@workspace/ui", "@workspace/db"],
  // Move the dev badge off the bottom corners — they're occupied by the
  // WhatsApp float (right) and the staff "Back to admin" bar (left).
  devIndicators: { position: "top-left" },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
}

export default nextConfig
