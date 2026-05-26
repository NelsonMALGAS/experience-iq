"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Clock, CheckCircle2, LucideIcon, ShieldCheck, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { StaffCard } from "@/components/staff/StaffCard";
import { EmptyState, SectionHeader } from "@/components/staff/Verification";
import usePagination from "@/hooks/usePagination";
import type { StaffMember } from "@/types";
import { toast } from "sonner";
import { verifyAllStaffUsers } from "@/app/staffVerificationActions";

const ITEMS_PER_PAGE = 6;

const ICON_MAP: Record<PaginatedStaffListProps["emptyIcon"], LucideIcon> = {
    clock: Clock,
    checkCircle2: CheckCircle2,
};

interface PaginatedStaffListProps {
    title: string;
    count: number;
    variant: "verified" | "pending";
    emptyMessage: string;
    emptyIcon: "clock" | "checkCircle2";
    staff: StaffMember[];
}

export const PaginatedStaffList = ({
    title,
    count,
    variant,
    emptyMessage,
    emptyIcon,
    staff,
}: PaginatedStaffListProps) => {
    const Icon = ICON_MAP[emptyIcon];
    const [isVerifying, setIsVerifying] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);

    const {
        paginatedData,
        currentPage,
        totalPages,
        hasNext,
        hasPrev,
        nextPage,
        prevPage,
    } = usePagination(staff, ITEMS_PER_PAGE);

    const handleVerifyAll = async () => {
        try {
            setIsVerifying(true);
            await verifyAllStaffUsers(staff.map((s) => s.id));
            toast.success(`${staff.length} staff members verified.`);
        } catch (error) {
            console.error("Failed to verify all staff:", error);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsVerifying(false);
            setDialogOpen(false);
        }
    };

    const showVerifyAll = variant === "pending" && staff.length > 0;

    return (
        <div className="space-y-4">
            {/* Section header row */}
            <div className="flex items-center justify-between gap-2">
                <SectionHeader title={title} count={count} variant={variant} />

                {showVerifyAll && (
                    <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <AlertDialogTrigger asChild>
                            <Button
                                size="sm"
                                variant="outline"
                                disabled={isVerifying}
                                className="flex items-center gap-1.5 rounded-lg text-sm font-medium border-green-300 text-green-700 hover:bg-green-50 hover:text-green-800 hover:border-green-400 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-950/40 dark:hover:text-green-300 transition-colors"
                            >
                                <ShieldCheck className="h-3.5 w-3.5" />
                                Verify All
                            </Button>
                        </AlertDialogTrigger>

                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Verify all staff members?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will verify all{" "}
                                    <span className="font-semibold text-foreground">{staff.length}</span>{" "}
                                    currently pending staff member{staff.length !== 1 ? "s" : ""}.
                                    This action cannot be easily undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>

                            <AlertDialogFooter>
                                <AlertDialogCancel disabled={isVerifying}>
                                    Cancel
                                </AlertDialogCancel>

                                {/* Use a plain Button so we can control the loading state ourselves */}
                                <AlertDialogAction asChild>
                                    <Button
                                        onClick={handleVerifyAll}
                                        disabled={isVerifying}
                                        className="bg-green-600 hover:bg-green-700 text-white gap-1.5"
                                    >
                                        {isVerifying ? (
                                            <>
                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                Verifying...
                                            </>
                                        ) : (
                                            <>
                                                <ShieldCheck className="h-3.5 w-3.5" />
                                                Verify All
                                            </>
                                        )}
                                    </Button>
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </div>

            <Separator />

            {staff.length === 0 ? (
                <EmptyState message={emptyMessage} icon={Icon} />
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                        {paginatedData.map((member) => (
                            <StaffCard key={member.id} staff={member} />
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-between gap-3 pt-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={prevPage}
                                disabled={!hasPrev}
                                className="flex items-center gap-1.5 rounded-lg text-sm font-medium disabled:opacity-40"
                                aria-label="Previous page"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                <span className="hidden sm:inline">Previous</span>
                            </Button>

                            <span className="text-sm text-muted-foreground tabular-nums select-none">
                                Page{" "}
                                <span className="font-semibold text-foreground">{currentPage}</span>
                                {" "}of{" "}
                                <span className="font-semibold text-foreground">{totalPages}</span>
                            </span>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={nextPage}
                                disabled={!hasNext}
                                className="flex items-center gap-1.5 rounded-lg text-sm font-medium disabled:opacity-40"
                                aria-label="Next page"
                            >
                                <span className="hidden sm:inline">Next</span>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};