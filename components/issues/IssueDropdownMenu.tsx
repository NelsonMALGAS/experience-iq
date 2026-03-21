"use client"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { CheckCircle2, Clock, MoreVertical } from "lucide-react";
import { Issue, Role } from "@/types";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateIssue } from "@/app/optimised-actions";
import { statusConfig } from "@/constants";

type IssueDropdownMenuProps = {
    issue: Issue
    currentUserId: string
    role: Role
}

const IssueDropdownMenu = ({ issue, currentUserId, role }: IssueDropdownMenuProps) => {
    const [isPending, startTransition] = useTransition();
    const [optimisticStatus, setOptimisticStatus] = useState(issue.status);

    const isAdmin = role === 'admin';
    const canUpdate = isAdmin || issue.assignedTo === currentUserId;

    const handleStatusChange = (newStatus: Issue['status']) => {
        if (!canUpdate) {
            toast.error("You can only update issues assigned to you");
            return;
        }

        // Prevent setting the same status
        if (optimisticStatus === newStatus) {
            toast.info(`Issue is already ${statusConfig[newStatus].label}`);
            return;
        }

        setOptimisticStatus(newStatus);
        startTransition(async () => {
            const result = await updateIssue(issue.id, issue.propertyId, { status: newStatus });
            if (!result?.success) {
                setOptimisticStatus(issue.status); // rollback
                toast.error(`Failed to update status: ${result?.message}`);
            } else {
                toast.success(`Status updated to ${statusConfig[newStatus].label}`);
            }
        });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0 h-9 w-9"
                    disabled={isPending}
                >
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem
                    onClick={() => handleStatusChange("in_progress")}
                    disabled={!canUpdate || optimisticStatus === "in_progress" || isPending}
                >
                    <Clock className="h-4 w-4 mr-2" />
                    Mark as In Progress
                </DropdownMenuItem>

                <DropdownMenuItem
                    onClick={() => handleStatusChange("resolved")}
                    disabled={!canUpdate || optimisticStatus === "resolved" || isPending}
                >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Mark as Resolved
                </DropdownMenuItem>

            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default IssueDropdownMenu;