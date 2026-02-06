import type { NextConfig } from "next";

export default {
  eslint: { ignoreDuringBuilds: true },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { hostname: "**.githubassets.com", protocol: "https" },
      { hostname: "**.githubusercontent.com", protocol: "https" },
      { hostname: "**.googleusercontent.com", protocol: "https" },
      { hostname: "**.ufs.sh", protocol: "https" },
      { hostname: "**.unsplash.com", protocol: "https" },
      { hostname: "api.github.com", protocol: "https" },
      { hostname: "utfs.io", protocol: "https" },
      { hostname: "via.placeholder.com", protocol: "https" },
      { hostname: "www.lojaclimatiza.com", protocol: "https" },
      { hostname: "i.etsystatic.com", protocol: "https" },
      { hostname: "scontent.fopo3-1.fna.fbcdn.net", protocol: "https" },
      { hostname: "**.fbcdn.net", protocol: "https" },
    ],
  },
} satisfies NextConfig;
