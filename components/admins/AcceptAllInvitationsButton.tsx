"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCheck } from "lucide-react";
import { acceptAdminInvitation } from "@/app/admin-invite-actions";
import { toast } from "sonner";

interface AcceptAllInvitationsButtonProps {
    invitationIds: string[];
    acceptingAdminUid: string;
}

export function AcceptAllInvitationsButton({
    invitationIds,
    acceptingAdminUid,
}: AcceptAllInvitationsButtonProps) {
    const [isPending, startTransition] = useTransition();
    const [isDone, setIsDone] = useState(false);

    // Guard: don't render if 0 or 1 invitation (also enforced in server component)
    if (invitationIds.length <= 1 || isDone) return null;

    const handleAcceptAll = () => {
        startTransition(async () => {
            const results = await Promise.allSettled(
                invitationIds.map((id) =>
                    acceptAdminInvitation(acceptingAdminUid, id)
                )
            );

            const succeeded = results.filter(
                (r) => r.status === "fulfilled" && r.value?.success
            ).length;
            const failed = results.length - succeeded;

            if (failed === 0) {
                toast.success(`All ${succeeded} invitations accepted.`, {
                    description: "You now have access to all properties.",
                });
                setIsDone(true);
            } else if (succeeded > 0) {
                toast.warning(`${succeeded} accepted, ${failed} failed.`, {
                    description: "Some invitations could not be processed. Please try again.",
                });
            } else {
                toast.error("Failed to accept invitations.", {
                    description: "None of the invitations could be accepted. Please try again.",
                });
            }
        });
    };

    return (
        <Button
            onClick={handleAcceptAll}
            disabled={isPending}
            size="sm"
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
        >
            {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <CheckCheck className="h-4 w-4" />
            )}
            {isPending ? "Accepting all…" : `Accept All (${invitationIds.length})`}
        </Button>
    );
}