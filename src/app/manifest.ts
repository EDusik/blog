import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "EDusik · notas",
    short_name: "EDusik",
    description: "Notas sobre código, ferramentas e hábitos",
    start_url: "/pt-BR",
    display: "standalone",
    background_color: "#0f0f14",
    theme_color: "#0f0f14",
    lang: "pt-BR",
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
