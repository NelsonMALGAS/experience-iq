"use client"

import { Button } from "@/components/ui/button";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

interface ActionButtonProps {
    label: string;
    icon: React.ReactNode;
    variant?: "default" | "outline";
    className?: string;
}

export function ActionButton({ label, icon, variant = "default", className }: ActionButtonProps) {
    const { pending } = useFormStatus();

    return (
        <Button
            type="submit"
            size="sm"
            variant={variant}
            disabled={pending}
            className={`gap-1.5 ${className}`}
        >
            {pending ? (
                <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Processing...
                </>
            ) : (
                <>
                    {icon}
                    {label}
                </>
            )}
        </Button>
    );
}