import type { Metadata } from "next";

export const baseUrl =
  process.env.NODE_ENV === "production"
    ? "https://experienceiqplatform.com/"
    : "http://localhost:3000";

export const baseKeywords = [
  "hospitality",
  "hotel management",
  "service management",
  "guest experience",
  "real-time support",
  "staff dashboard",
  "roster",
  "scheduling",
  "staff-management",
  "nextjs",
  "firebase",
  "typescript",
  "PWA",
  "progressive web app",
  "offline support",
  "mobile app",
  "app store",
  "Google Play",
  "iOS",
  "Android",
];

export const sharedMetadata: Omit<
  Metadata,
  "title" | "description" | "keywords" | "openGraph" | "twitter"
> = {
  metadataBase: new URL(baseUrl),

  authors: [
    {
      name: "Nelson Zongezile Malgas",
      url: "https://github.com/NelsonMALGAS",
    },
  ],

  creator: "Nelson Malgas",
  publisher: "ExperienceIQ",

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: [
      {
        url: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    other: [
      { rel: "icon", url: "/icon-144x144.png", sizes: "144x144" },
      { rel: "icon", url: "/pwa-icon-192.png", sizes: "192x192" },
      { rel: "icon", url: "/pwa-icon-512.png", sizes: "512x512" },
    ],
  },

  appleWebApp: {
    title: "ExperienceIQ",
    capable: true,
    statusBarStyle: "black-translucent",
  },
};
