
export const revalidate = 300;

import type { Metadata, Viewport } from "next";
import { Poppins, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Header from "@/components/Header";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin"
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "@/utils/core";
import ClientProviders from "@/components/ClientProviders";
import { Analytics } from "@vercel/analytics/next"
import { PostHogProvider } from "@/components/PostHogProvider"

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
  preload: true,
  fallback: ['system-ui', 'arial'],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  fallback: ['Georgia', 'serif'],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NODE_ENV === "production"
      ? "https://experienceiqplatform.com"
      : "http://localhost:3000"
  ),
  title: "ExperienceIQ — Real-Time Guest Issue Resolution",
  description: "ExperienceIQ empowers hospitality teams to resolve guest issues in real time.",
  keywords: [
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
  ],
  authors: [
    { name: "Nelson Zongezile Malgas", url: "https://github.com/NelsonMALGAS" },
  ],
  creator: "Nelson Malgas",
  publisher: "ExperienceIQ",

  openGraph: {
    title: "ExperienceIQ – Hospitality Service Management",
    description:
      "ExperienceIQ helps hotels and resorts monitor, manage, and resolve guest issues in real time.",
    url: "https://experienceiqplatform.com",
    siteName: "ExperienceIQ",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ExperienceIQ - Hospitality Management",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "ExperienceIQ – Hospitality Service Management",
    description:
      "ExperienceIQ helps hotels and resorts monitor, manage, and resolve guest issues in real time.",
    images: ["/og-image.png", "/twitter-card.png"],
    site: "@ExperienceIQ",
    creator: "@NelsonMalgas",
  },

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
      { url: "/icon0.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "16x16 32x32 48x48" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    title: "ExperienceIQ",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${poppins.variable} ${playfairDisplay.variable} antialiased`}
      >
        <PostHogProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >

            <Header />
            <main className="container mx-auto px-4 md:px-8 min-h-[calc(100vh-4rem)]">
              <NextSSRPlugin
                routerConfig={extractRouterConfig(ourFileRouter)}
              />
              <ClientProviders>
                {children}
                <Analytics />
              </ClientProviders>
            </main>
          </ThemeProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}