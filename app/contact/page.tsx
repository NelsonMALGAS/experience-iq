import Image from "next/image";
import ContactForm from "@/components/contact/ContactForm";
import { Mail, Building2, Clock, MapPin } from "lucide-react";
import Link from "next/link";
import { baseKeywords, baseUrl, sharedMetadata } from "@/constants/sharedMetadata";
import { Metadata } from "next";
import BackButton from "@/components/BackButton";

export const metadata: Metadata = {
    title: "Contact ExperienceIQ – Enterprise Hospitality Support",
    description:
        "Contact ExperienceIQ for enterprise hospitality support, product inquiries, partnership opportunities, and technical assistance for hotels and hospitality groups.",
    keywords: [
        ...baseKeywords,
        "contact ExperienceIQ",
        "hospitality support",
        "enterprise SaaS support",
        "hotel management support",
        "technical assistance",
        "hospitality software contact",
        "ExperienceIQ helpdesk",
    ],
    ...sharedMetadata,
    openGraph: {
        title: "Contact ExperienceIQ – Enterprise Hospitality Support",
        description:
            "Get in touch with ExperienceIQ for enterprise hospitality operations support and product inquiries.",
        url: `${baseUrl}/contact`,
        siteName: "ExperienceIQ",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "Contact ExperienceIQ",
            },
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Contact ExperienceIQ – Enterprise Hospitality Support",
        description:
            "Professional hospitality operations support and enterprise assistance.",
        images: ["/og-image.png", "/twitter-card.png"],
        creator: "@ExperienceIQ",
    },
};

const ContactPage = () => {
    return (
        <div className="min-h-screen bg-background mt-12">
            {/* Hero Section */}
            <section className="border-b bg-linear-to-b from-muted/30 to-background py-12">
                <div className="max-w-6xl mx-auto px-4">
                    {/* Back Button */}
                    <div className="mb-6">
                        <BackButton label="⬅️ Go back" />
                    </div>
                    <div className="flex flex-col items-center text-center space-y-6">
                        <Image
                            src="/images/experienceIQ.png"
                            alt="ExperienceIQ"
                            width={200}
                            height={60}
                            priority
                            className="object-contain"
                        />
                        <div className="space-y-3 max-w-2xl">
                            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
                                Get in Touch
                            </h1>
                            <p className="text-lg text-muted-foreground leading-relaxed">
                                We&apos;re here to help your hospitality operations thrive. Reach out
                                to our team for support, partnership inquiries, or product demos.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section className="py-24 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="grid lg:grid-cols-5 gap-12">
                        {/* Left Column - Contact Info */}
                        <div className="lg:col-span-2 space-y-8">
                            <div>
                                <h2 className="text-2xl font-semibold mb-4">
                                    Contact Information
                                </h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    Our dedicated support team is here to assist with technical
                                    questions, enterprise inquiries, and partnership opportunities.
                                </p>
                            </div>

                            {/* Contact Details */}
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="mt-1 rounded-full bg-primary/10 p-2.5">
                                        <Mail className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-medium mb-1">Email Support</p>
                                        <a
                                            href="mailto:experienceiq.helpdesk@gmail.com"
                                            className="text-muted-foreground hover:text-primary transition-colors"
                                        >
                                            experienceiq.helpdesk@gmail.com
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="mt-1 rounded-full bg-primary/10 p-2.5">
                                        <Clock className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-medium mb-1">Response Time</p>
                                        <p className="text-muted-foreground">
                                            Within 24 hours on business days
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="mt-1 rounded-full bg-primary/10 p-2.5">
                                        <Building2 className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-medium mb-1">Enterprise Support</p>
                                        <p className="text-muted-foreground">
                                            Dedicated account managers for Enterprise plans
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="mt-1 rounded-full bg-primary/10 p-2.5">
                                        <MapPin className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-medium mb-1">Serving</p>
                                        <p className="text-muted-foreground">
                                            Hotels, resorts, and hospitality groups across South Africa
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Trust Badge */}
                            <div className="rounded-2xl bg-muted/50 p-6 border">
                                <h3 className="font-semibold mb-3">Why ExperienceIQ?</h3>
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    <li className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                        Real-time guest issue tracking
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                        Multi-property management
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                        Advanced SLA monitoring
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                        Enterprise-grade security
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Right Column - Contact Form */}
                        <div className="lg:col-span-3">
                            <ContactForm />
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer Note */}
            <section className="border-t py-12">
                <div className="max-w-6xl mx-auto px-4">
                    <p className="text-center text-sm text-muted-foreground">
                        Looking for technical documentation?{" "}
                        <Link href="#" className="text-primary hover:underline font-medium">
                            Visit our Help Center
                        </Link>
                    </p>
                </div>
            </section>
        </div>
    );
}

export default ContactPage