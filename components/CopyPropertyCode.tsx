"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CopyPropertyCodeProps {
    code: string;
}

export default function CopyPropertyCode({ code }: CopyPropertyCodeProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        if (!code) return;

        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);

            setTimeout(() => {
                setCopied(false);
            }, 3000);
        } catch (error) {
            console.error("Failed to copy:", error);
            toast.error("Something went wrong while copying code")
        }
    };

    return (
        <div className="absolute top-3 left-3">
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-auto px-2 py-1 text-xs font-mono tracking-widest rounded-md bg-background/80 border border-border text-muted-foreground uppercase hover:bg-background transition gap-2"
            >
                {code.trim().toUpperCase()}

                {copied ? (
                    <Check className="h-3 w-3 text-green-500" />
                ) : (
                    <Copy className="h-3 w-3 opacity-70" />
                )}
            </Button>
        </div>
    );
}