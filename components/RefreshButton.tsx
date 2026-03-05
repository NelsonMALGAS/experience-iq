"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2 } from "lucide-react";

export const FormRefreshButton = () => {
    const { pending } = useFormStatus();

    return (
        <Button
            variant="outline"
            type="submit"
            disabled={pending}
            className="gap-2 w-full sm:w-auto h-10 sm:h-11"
        >
            {pending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <RefreshCw className="w-4 h-4" />
            )}

            {pending ? "Refreshing..." : "Refresh"}
        </Button>
    );
}