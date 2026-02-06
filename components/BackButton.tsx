"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

type BackButtonProps = {
    label: string;
    className?: string;
};

const BackButton = ({
    label = "Back",
    className,
}: BackButtonProps) => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleBack = () => {
        if (loading) return;

        setLoading(true);
        router.back();
    };

    return (
        <Button
            variant="ghost"
            onClick={handleBack}
            disabled={loading}
            className={cn(
                "flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors",
                className
            )}
        >
            {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <ArrowLeft className="h-4 w-4" />
            )}

            <span className="text-sm font-medium">
                {label}
            </span>
        </Button>
    );
};

export default BackButton;
