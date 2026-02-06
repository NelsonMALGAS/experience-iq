import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ExperienceIQ",
    short_name: "ExperienceIQ",
    description:
      "ExperienceIQ helps hotels and resorts monitor, manage, and resolve guest issues in real time.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#FFD700",
    orientation: "portrait-primary",

    icons: [
      {
        src: "/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/favicon-96x96.png",
        sizes: "96x96",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-144x144.png",
        sizes: "144x144",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/pwa-icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/pwa-icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],

    // Screenshots for Richer Install UI
    screenshots: [
      {
        src: "/screenshots/desktop-wide.png",
        sizes: "1920x1080",
        type: "image/png",
        form_factor: "wide",
        label: "ExperienceIQ Dashboard - Desktop View",
      },
      {
        src: "/screenshots/mobile-1.png",
        sizes: "1080x1920",
        type: "image/png",
        label: "ExperienceIQ Dashboard - Mobile View",
      },
      {
        src: "/screenshots/mobile-2.png",
        sizes: "1080x1920",
        type: "image/png",
        label: "Issue Management - Mobile View",
      },
    ],
  };
}
