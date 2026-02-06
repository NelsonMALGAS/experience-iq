"use client"

import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function RefreshButton() {
    const router = useRouter();
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = async () => {
        setIsRefreshing(true);

        router.refresh();

        setTimeout(() => {
            setIsRefreshing(false);
        }, 500);
    };

    return (
        <Button
            onClick={handleRefresh}
            variant="outline"
            size="default"
            disabled={isRefreshing}
            className="gap-2"
        >
            <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
            />
            <span className="hidden sm:inline">Refresh</span>
        </Button>
    );
}