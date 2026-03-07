"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { acceptAdminInvitation, declineAdminInvitation } from "@/app/admin-invite-actions";


interface InvitationActionButtonsProps {
    invitationId: string;
    acceptingAdminUid: string;
}

export function InvitationActionButtons({
    invitationId,
    acceptingAdminUid,
}: InvitationActionButtonsProps) {
    const [isPending, startTransition] = useTransition();
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
    const [action, setAction] = useState<"accept" | "decline" | null>(null);

    const handle = (type: "accept" | "decline") => {
        setAction(type);
        startTransition(async () => {
            const res = type === "accept"
                ? await acceptAdminInvitation(acceptingAdminUid, invitationId)
                : await declineAdminInvitation(acceptingAdminUid, invitationId);

            setResult({
                success: res.success,
                message: res.success
                    ? type === "accept"
                        ? "Access granted. You can now manage this property."
                        : "Invitation declined."
                    : res.error ?? "Something went wrong.",
            });
        });
    };

    if (result) {
        return (
            <p className={`text-xs px-3 py-2 rounded-lg border ${result.success
                ? "bg-green-50 dark:bg-green-950/30 text-green-700 border-green-200"
                : "bg-red-50 dark:bg-red-950/30 text-red-700 border-red-200"
                }`}>
                {result.message}
            </p>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <Button
                onClick={() => handle("accept")}
                disabled={isPending}
                size="sm"
                className="gap-1.5 bg-green-600 hover:bg-green-700 text-white flex-1"
            >
                {isPending && action === "accept"
                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    : <CheckCircle2 className="h-3.5 w-3.5" />
                }
                Accept
            </Button>
            <Button
                onClick={() => handle("decline")}
                disabled={isPending}
                size="sm"
                variant="outline"
                className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50 flex-1"
            >
                {isPending && action === "decline"
                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    : <XCircle className="h-3.5 w-3.5" />
                }
                Decline
            </Button>
        </div>
    );
}