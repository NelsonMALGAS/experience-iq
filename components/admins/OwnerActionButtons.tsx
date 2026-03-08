"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldCheck, ShieldOff, ShieldX, ShieldAlert } from "lucide-react";
import { disableCollaboratorAdmin, enableCollaboratorAdmin, revokeCollaboratorAdmin, verifyCollaboratorAdmin } from "@/app/admin-invite-actions/owner";



interface FeedbackProps {
    success: boolean;
    message: string;
}

function Feedback({ success, message }: FeedbackProps) {
    return (
        <p className={`text-xs px-2.5 py-1.5 rounded-md border w-full text-center ${success
            ? "bg-green-50 dark:bg-green-950/30 text-green-700 border-green-200"
            : "bg-red-50 dark:bg-red-950/30 text-red-700 border-red-200"
            }`}>
            {message}
        </p>
    );
}

// ─── VerifyCollaboratorButton ─────────────────────────────────────────────────

export function VerifyCollaboratorButton({
    collaboratorId,
    name,
}: {
    collaboratorId: string;
    name: string;
}) {
    const [isPending, startTransition] = useTransition();
    const [feedback, setFeedback] = useState<FeedbackProps | null>(null);

    const handle = () => {
        startTransition(async () => {
            const res = await verifyCollaboratorAdmin(collaboratorId);
            setFeedback({
                success: res.success,
                message: res.success ? `${name} has been verified.` : (res as { success: false; error: string }).error,
            });
        });
    };

    if (feedback) return <Feedback {...feedback} />;

    return (
        <Button
            onClick={handle}
            disabled={isPending}
            size="sm"
            className="gap-1.5 text-xs bg-green-600 hover:bg-green-700 text-white"
        >
            {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <ShieldCheck className="h-3 w-3" />}
            Verify
        </Button>
    );
}

// ─── RevokeCollaboratorButton ─────────────────────────────────────────────────

export function RevokeCollaboratorButton({
    collaboratorId,
    name,
}: {
    collaboratorId: string;
    name: string;
}) {
    const [isPending, startTransition] = useTransition();
    const [confirmed, setConfirmed] = useState(false);
    const [feedback, setFeedback] = useState<FeedbackProps | null>(null);

    const handle = () => {
        if (!confirmed) {
            setConfirmed(true);
            setTimeout(() => setConfirmed(false), 4000);
            return;
        }
        startTransition(async () => {
            const res = await revokeCollaboratorAdmin(collaboratorId);
            setFeedback({
                success: res.success,
                message: res.success
                    ? `${name}'s verification has been revoked.`
                    : (res as { success: false; error: string }).error,
            });
        });
    };

    if (feedback) return <Feedback {...feedback} />;

    return (
        <Button
            onClick={handle}
            disabled={isPending}
            size="sm"
            variant="outline"
            className={`gap-1.5 text-xs transition-colors ${confirmed
                ? "border-orange-400 text-orange-600 bg-orange-50 dark:bg-orange-950/30"
                : "text-muted-foreground hover:text-orange-600 hover:border-orange-300"
                }`}
        >
            {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <ShieldOff className="h-3 w-3" />}
            {confirmed ? "Confirm revoke?" : "Revoke"}
        </Button>
    );
}


export function DisableCollaboratorButton({
    collaboratorId,
    name,
    mode,
}: {
    collaboratorId: string;
    name: string;
    mode: "disable" | "enable";
}) {
    const [isPending, startTransition] = useTransition();
    const [confirmed, setConfirmed] = useState(false);
    const [feedback, setFeedback] = useState<FeedbackProps | null>(null);

    const handle = () => {
        if (mode === "disable" && !confirmed) {
            setConfirmed(true);
            setTimeout(() => setConfirmed(false), 4000);
            return;
        }
        startTransition(async () => {
            const res = mode === "disable"
                ? await disableCollaboratorAdmin(collaboratorId)
                : await enableCollaboratorAdmin(collaboratorId);
            setFeedback({
                success: res.success,
                message: res.success
                    ? mode === "disable"
                        ? `${name} has been disabled.`
                        : `${name} has been re-enabled.`
                    : (res as { success: false; error: string }).error,
            });
        });
    };

    if (feedback) return <Feedback {...feedback} />;

    if (mode === "enable") {
        return (
            <Button
                onClick={handle}
                disabled={isPending}
                size="sm"
                className="gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white"
            >
                {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <ShieldAlert className="h-3 w-3" />}
                Re-enable
            </Button>
        );
    }

    return (
        <Button
            onClick={handle}
            disabled={isPending}
            size="sm"
            variant="outline"
            className={`gap-1.5 text-xs transition-colors ${confirmed
                ? "border-red-400 text-red-600 bg-red-50 dark:bg-red-950/30"
                : "text-muted-foreground hover:text-red-600 hover:border-red-300"
                }`}
        >
            {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <ShieldX className="h-3 w-3" />}
            {confirmed ? "Confirm disable?" : "Disable"}
        </Button>
    );
}