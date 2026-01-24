"use client";

import { ModeToggle } from "@/components/ModeToggle";
import { Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";


const Header = () => {
    const router = useRouter()

    return (
        <header className="fixed w-full z-50 bg-background text-foreground shadow-md transition-colors">
            <nav className="container mx-auto flex items-center justify-between px-4 py-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                        <Sparkles className="h-5 w-5 text-secondary-foreground" />
                    </div>
                    <span className="text-xl font-semibold">Experience<span className="text-primary">IQ</span></span>
                </div>

                <div className="flex items-center gap-4">
                    <ModeToggle />

                    <Button variant="outline" onClick={() => router.push("/login")}>
                        Sign In
                    </Button>
                </div>
            </nav>
        </header>
    );
};

export default Header;
