
"use client";

import Image from "next/image";
import Link from "next/link";
import { Activity, BellRing, ShieldCheck } from "lucide-react";
import AuthForm from "@/components/AuthForm";
import { Role } from "@/types";

const features = [
    {
        icon: Activity,
        title: "Real-time issue management",
        description: "Monitor and manage guest concerns as they happen.",
    },
    {
        icon: BellRing,
        title: "Instant staff notifications",
        description: "Keep your team informed and ready to respond.",
    },
    {
        icon: ShieldCheck,
        title: "Accountable service recovery",
        description: "Track resolutions and maintain service standards.",
    },
];

type LoginLayoutProps = {
    role: Role
};

const LoginLayout = ({ role }: LoginLayoutProps) => {
    return (
        <main className="min-h-screen bg-background lg:grid lg:grid-cols-2">
            {/* Left: Brand section */}
            <section className="relative hidden flex-col justify-between overflow-hidden bg-card rounded-2xl p-10 text-foreground lg:flex xl:p-16">
                <div className="absolute -right-32 -top-32 size-96 rounded-full border border-primary-foreground/10" />
                <div className="absolute -bottom-40 -left-32 size-120 rounded-full border border-primary-foreground/10" />

                <div className="relative z-10">
                    <Link href="/" aria-label="ExperienceIQ home">
                        <Image
                            src="/images/experienceIQ.png"
                            alt="ExperienceIQ"
                            width={190}
                            height={55}
                            priority
                            className="h-12 w-auto object-contain"
                        />
                    </Link>
                </div>

                <div className="relative z-10 my-16 max-w-xl">
                    <span className="mb-5 inline-flex items-center rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-1 text-xs font-medium tracking-wide">
                        GUEST EXPERIENCE & SERVICE RECOVERY
                    </span>

                    <h1 className="text-4xl font-bold leading-tight tracking-tight xl:text-5xl">
                        Deliver exceptional guest experiences.
                    </h1>

                    <p className="mt-6 max-w-lg text-base leading-7 text-primary-foreground/75">
                        A smarter way to manage guest concerns, empower your team, and
                        deliver consistent service recovery across your hospitality
                        operations.
                    </p>

                    <div className="mt-12 space-y-7">
                        {features.map(({ icon: Icon, title, description }) => (
                            <div key={title} className="flex items-start gap-4">
                                <div className="rounded-lg bg-primary-foreground/10 p-3">
                                    <Icon className="size-5" />
                                </div>

                                <div>
                                    <h3 className="font-semibold">{title}</h3>
                                    <p className="mt-1 text-sm leading-6 text-primary-foreground/70">
                                        {description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <p className="relative z-10 text-xs text-primary-foreground/60">
                    © {new Date().getFullYear()} ExperienceIQ. All rights reserved.
                </p>
            </section>

            {/* Right: Authentication section */}
            <section className="flex min-h-screen flex-col justify-center px-5 py-12 sm:px-10 lg:px-12 xl:px-20">
                <div className="mx-auto w-full max-w-md">
                    {/* Mobile branding */}
                    <div className="mb-10 flex justify-center lg:hidden">
                        <Link href="/" aria-label="ExperienceIQ home">
                            <Image
                                src="/images/experienceIQ.png"
                                alt="ExperienceIQ"
                                width={190}
                                height={55}
                                priority
                                className="h-12 w-auto object-contain"
                            />
                        </Link>
                    </div>

                    <AuthForm role={role} />

                    <div className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                        <ShieldCheck className="size-4" />
                        Secure account authentication
                    </div>
                </div>

                <p className="mt-10 text-center text-xs text-muted-foreground lg:hidden">
                    © {new Date().getFullYear()} ExperienceIQ. All rights reserved.
                </p>
            </section>
        </main>
    );
};

export default LoginLayout;
