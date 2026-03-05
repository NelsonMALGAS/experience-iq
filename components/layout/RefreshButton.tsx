"use client";

import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function RefreshButton() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleRefresh = () => {
        startTransition(() => {
            router.refresh();
        });
    };

    return (
        <Button
            onClick={handleRefresh}
            variant="outline"
            disabled={isPending}
            className="gap-2 w-full sm:w-auto h-10 sm:h-11"
        >
            <RefreshCw
                className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`}
            />
            <span className="hidden sm:inline">
                {isPending ? "Refreshing..." : "Refresh"}
            </span>
        </Button>
    );
}