"use client";

import { ModeToggle } from "@/components/ModeToggle";
import { LogOutIcon } from "lucide-react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";
import useCurrentUser from "@/hooks/useCurrentUser";
import Link from "next/link";

const Header = () => {
    const router = useRouter();
    const { handleSignOut, loading, currentUser } = useCurrentUser();

    return (
        <header className="fixed inset-x-0 top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border shadow-sm">
            <nav className="container mx-auto flex items-center justify-between px-4 py-4">
                {/* Logo Section */}
                <div className="flex items-center gap-3">
                    <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20 shadow-sm">
                        <Image
                            src="/images/experienceIQ.png"
                            alt="ExperienceIQ Logo"
                            height={28}
                            width={28}
                            className="h-7 w-7 object-contain"
                            priority
                        />
                    </div>

                    <span className="hidden md:block text-lg font-semibold tracking-tight">
                        Experience
                        <span className="text-primary">IQ</span>
                    </span>
                </div>

                {/* Navigation Links */}
                <div className="hidden md:flex items-center gap-4">
                    {!loading && !currentUser && (
                        <Button asChild variant="outline">

                            <Link
                                href="/"
                                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                            >
                                Home
                            </Link>
                        </Button>
                    )}

                    <Button asChild variant="outline">
                        <Link
                            href="/policy"
                            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                        >
                            Policy
                        </Link>
                    </Button>

                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <ModeToggle />

                    {loading ? (
                        <Button variant="ghost" size="icon" disabled>
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-primary" />
                        </Button>
                    ) : currentUser ? (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleSignOut}
                            className="rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors"
                        >
                            <LogOutIcon className="h-4 w-4" />
                        </Button>
                    ) : (
                        <Button
                            variant="outline"
                            onClick={() => router.push("/login")}
                            className="rounded-lg px-4 font-medium"
                        >
                            Sign In
                        </Button>
                    )}
                </div>
            </nav>
        </header>
    );
};

export default Header;