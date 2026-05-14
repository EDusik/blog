import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "EDusik · notes",
    short_name: "EDusik",
    description: "Notes on code, tools, and habits",
    start_url: "/en",
    display: "standalone",
    background_color: "#0f0f14",
    theme_color: "#0f0f14",
    lang: "en",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
