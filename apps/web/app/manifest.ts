import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    background_color: "#ffffff",
    categories: ["health", "medical", "productivity"],
    description: "Doe Sangue Angola liga dadores, hospitais e operações nacionais.",
    display: "standalone",
    icons: [
      {
        purpose: "any",
        sizes: "192x192",
        src: "/icons/icon-192.png",
        type: "image/png"
      },
      {
        purpose: "any",
        sizes: "512x512",
        src: "/icons/icon-512.png",
        type: "image/png"
      },
      {
        purpose: "maskable",
        sizes: "512x512",
        src: "/icons/maskable-512.png",
        type: "image/png"
      }
    ],
    id: "/",
    lang: "pt-AO",
    name: "Doe Sangue Angola",
    orientation: "portrait",
    scope: "/",
    short_name: "Doe Sangue",
    start_url: "/auth?source=pwa",
    theme_color: "#b10f1f"
  };
}
