import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.donmai.us" },
      { protocol: "https", hostname: "danbooru.donmai.us" },
      { protocol: "https", hostname: "img3.gelbooru.com" },
      { protocol: "https", hostname: "img1.gelbooru.com" },
      { protocol: "https", hostname: "img2.gelbooru.com" },
      { protocol: "https", hostname: "img4.gelbooru.com" },
      { protocol: "https", hostname: "us.rule34.xxx" },
      { protocol: "https", hostname: "api.rule34.xxx" },
      { protocol: "https", hostname: "waifu.im" },
      { protocol: "https", hostname: "cdn.waifu.im" },
      { protocol: "https", hostname: "nekos.moe" },
      { protocol: "https", hostname: "api.nekosapi.com" },
      { protocol: "https", hostname: "cdn.nekosapi.com" },
      { protocol: "https", hostname: "api.nekosia.cat" },
      { protocol: "https", hostname: "cdn.nekosia.cat" },
      // Wildcard fallback for any other CDN
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
