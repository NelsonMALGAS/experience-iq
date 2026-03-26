
import Link from "next/link";
import { ArrowLeft, Shield, FileText } from "lucide-react";
import { sections } from "@/constants";
import { Metadata } from "next";
import { baseKeywords, baseUrl, sharedMetadata } from "@/constants/sharedMetadata";

export const metadata: Metadata = {
    title: "Terms of Service – ExperienceIQ",
    description:
        "Read the Terms of Service for ExperienceIQ. Understand your rights, responsibilities, and the conditions governing use of the guest experience and service recovery platform.",
    keywords: [
        ...baseKeywords,
        "terms of service",
        "terms and conditions",
        "legal",
        "user agreement",
        "platform terms",
        "hospitality software terms",
    ],
    ...sharedMetadata,
    robots: {
        index: true,
        follow: true,
    },
    openGraph: {
        title: "Terms of Service – ExperienceIQ",
        description:
            "Read the Terms of Service governing use of the ExperienceIQ guest experience and service recovery platform.",
        url: `${baseUrl}/terms`,
        siteName: "ExperienceIQ",
        images: [
            {
                url: `${baseUrl}/og-image.png`,
                width: 1200,
                height: 630,
                alt: "ExperienceIQ Terms of Service",
            },
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Terms of Service – ExperienceIQ",
        description:
            "Read the Terms of Service governing use of the ExperienceIQ platform.",
        images: [`${baseUrl}/og-image.png`],
        creator: "@ExperienceIQ",
    },
};
const TermsOfServicePage = () => {
    return (
        <div className="min-h-screen bg-background text-foreground mt-24">
            {/* Hero */}
            <div className="border-b border-border bg-muted/40">
                <div className="container mx-auto px-4 py-16 max-w-4xl">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Home
                    </Link>

                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <span className="text-sm font-medium text-primary uppercase tracking-widest">
                            Legal
                        </span>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                        Terms of Service
                    </h1>

                    <p className="text-muted-foreground max-w-2xl">
                        These Terms govern your use of the ExperienceIQ platform. Please read
                        them carefully before using the service.
                    </p>

                    <div className="flex flex-wrap items-center gap-4 mt-6 text-sm text-muted-foreground">
                        <span>Effective date: 1 January 2026</span>
                        <span className="hidden sm:block">·</span>
                        <span>Last updated: 26 March 2026</span>
                        <span className="hidden sm:block">·</span>
                        <div className="flex items-center gap-1.5">
                            <Shield className="h-4 w-4 text-primary" />
                            <span>ExperienceIQ Platform</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 py-16 max-w-4xl">
                <div className="lg:grid lg:grid-cols-[220px_1fr] lg:gap-12">

                    {/* Sticky Table of Contents — desktop only */}
                    <aside className="hidden lg:block">
                        <div className="sticky top-24 space-y-1">
                            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                                Contents
                            </p>
                            {sections.map((section) => (
                                <a
                                    key={section.id}
                                    href={`#${section.id}`}
                                    className="block text-xs text-muted-foreground hover:text-primary transition-colors py-2 leading-snug"
                                >
                                    {section.title}
                                </a>
                            ))}
                        </div>
                    </aside>

                    {/* Sections */}
                    <main className="space-y-12">
                        {/* Intro callout */}
                        <div className="rounded-xl border border-primary/20 bg-primary/5 px-5 py-4 text-sm text-muted-foreground leading-relaxed">
                            This is a legal agreement between you and <strong className="text-foreground">ExperienceIQ</strong>.
                            By accessing or using the Platform, you confirm that you have read,
                            understood, and agree to be bound by these Terms of Service.
                        </div>

                        {sections.map((section) => (
                            <section key={section.id} id={section.id} className="scroll-mt-24">
                                <h2 className="text-lg font-semibold mb-3 text-foreground hover:text-primary">
                                    {section.title}
                                </h2>
                                <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                                    {section.content}
                                </div>
                            </section>
                        ))}

                        {/* Footer note */}
                        <div className="border-t border-border pt-8 text-xs text-muted-foreground">
                            <p>
                                <span className="hover:text-primary">&copy; {new Date().getFullYear()} ExperienceIQ.</span> All rights reserved. This software is
                                proprietary and confidential. Unauthorised use, reproduction, or
                                distribution is strictly prohibited.
                            </p>
                            <div className="flex flex-wrap gap-4 mt-4">
                                <Link href="/policy" className="hover:text-primary transition-colors">
                                    Privacy Policy
                                </Link>
                                <Link href="/contact" className="hover:text-primary transition-colors">
                                    Contact Us
                                </Link>
                                <Link href="/" className="hover:text-primary transition-colors">
                                    Back to Platform
                                </Link>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}

export default TermsOfServicePage