import InstallPrompt from "@/components/InstallPrompt";
import LandingPage from "@/components/LandingPage";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { auth } from "@/db/server";
import { baseKeywords, baseUrl, sharedMetadata } from "@/constants/sharedMetadata";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "ExperienceIQ – Real-Time Guest Experience Management",
  description:
    "ExperienceIQ helps hotels and resorts monitor, manage, and resolve guest issues in real time. Improve service quality, staff efficiency, and guest satisfaction across all properties.",
  keywords: [
    ...baseKeywords,
    "guest experience platform",
    "hotel operations",
    "hospitality technology",
    "real-time issue management",
    "guest satisfaction",
    "hotel software",
  ],
  ...sharedMetadata,
  openGraph: {
    title: "ExperienceIQ – Real-Time Guest Experience Management",
    description:
      "Monitor, manage, and resolve guest issues in real time. ExperienceIQ empowers hospitality teams with live insights and operational clarity.",
    url: `${baseUrl}/`,
    siteName: "ExperienceIQ",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ExperienceIQ Platform Overview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ExperienceIQ – Real-Time Guest Experience Management",
    description:
      "A modern guest experience platform for hotels and resorts.",
    images: ["/og-image.png", "/twitter-card.png"],
    creator: "@ExperienceIQ",
  },
};


const Home = async () => {
  const cookieStore = await cookies();
  const session = cookieStore.get("_SESSION_")?.value;

  // 👤 No session → public landing page
  if (!session) {
    return (
      <>
        <main className="min-h-screen flex items-center justify-center px-6">
          <LandingPage />
        </main>
        <InstallPrompt />
      </>
    );
  }

  // 🔐 Verify session
  const decoded = await auth?.verifySessionCookie(session, true);

  if (!decoded) {
    redirect("/");
  }

  const role = decoded.role;

  // ✅ Authenticated users go to their dashboard
  redirect(`/${role}`);
};

export default Home;
