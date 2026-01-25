"use client";

import { ModeToggle } from "@/components/ModeToggle";
import { LogOutIcon } from "lucide-react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";
import useCurrentUser from "@/hooks/useCurrentUser";


const Header = () => {
    const router = useRouter()
    const { handleSignOut, loading, currentUser } = useCurrentUser()

    return (
        <header className="fixed w-full z-50 bg-background text-foreground shadow-md transition-colors">
            <nav className="container mx-auto flex items-center justify-between px-4 py-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                        <Image
                            src="/images/experienceIQ.png"
                            alt="ExperienceIQ Logo"
                            height={20}
                            width={20}
                            className="h-full w-full rounded-full cover"
                        />
                    </div>
                    <span className="text-xl font-semibold">Experience<span className="text-primary">IQ</span></span>
                </div>

                <div className="flex items-center gap-4">
                    <ModeToggle />
                    {loading ? (
                        <Button variant="ghost">
                            <span className="w-5 h-5 rounded-full animate-spin text-primary" />
                        </Button>
                    ) : currentUser ? (
                        <Button variant="ghost" className="hover:border hover:border-red-600 rounded-lg" onClick={handleSignOut}>
                            <LogOutIcon className="hover:text-red-500" />
                        </Button>
                    ) : (
                        <Button variant="outline" onClick={() => router.push("/login")}>
                            Sign In
                        </Button>
                    )}

                </div>
            </nav>
        </header>
    );
};

export default Header;
