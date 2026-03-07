"use client";

/**
 * RevokeAccessButton.tsx
 * Confirms and triggers revokeAdminAccess server action.
 */

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldOff } from "lucide-react";
import { revokeAdminAccess } from "@/app/admin-invite-actions";


interface RevokeAccessButtonProps {
    accessId: string;
    revokerUid: string;
    adminName: string;
}

export function RevokeAccessButton({ accessId, revokerUid, adminName }: RevokeAccessButtonProps) {
    const [isPending, startTransition] = useTransition();
    const [confirmed, setConfirmed] = useState(false);

    console.log(adminName)

    const handleRevoke = () => {
        if (!confirmed) {
            setConfirmed(true);
            // Auto-reset confirmation after 4 seconds
            setTimeout(() => setConfirmed(false), 4000);
            return;
        }

        startTransition(async () => {
            await revokeAdminAccess(revokerUid, accessId);
            setConfirmed(false);
        });
    };

    return (
        <Button
            onClick={handleRevoke}
            variant="outline"
            size="sm"
            disabled={isPending}
            className={`gap-1.5 text-xs transition-all duration-200 ${confirmed
                    ? "border-red-400 text-red-600 bg-red-50 dark:bg-red-950/30 hover:bg-red-100"
                    : "text-muted-foreground hover:text-red-600 hover:border-red-300"
                }`}
        >
            {isPending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
                <ShieldOff className="h-3 w-3" />
            )}
            {confirmed ? "Confirm revoke?" : "Revoke"}
        </Button>
    );
}