import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Necesario para el Service Worker del PWA (cabeceras de seguridad)
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },
};

export default nextConfig;
