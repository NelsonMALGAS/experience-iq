"use client";

import { ChevronLeft, ChevronRight, Clock, CheckCircle2, LucideIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { StaffCard } from "@/components/staff/StaffCard";
import { EmptyState, SectionHeader } from "@/components/staff/Verification";
import usePagination from "@/hooks/usePagination";
import type { StaffMember } from "@/types";

const ITEMS_PER_PAGE = 6;

// Map a plain string → icon component entirely inside the client bundle.
// This avoids passing a function reference across the server→client boundary.
const ICON_MAP: Record<PaginatedStaffListProps["emptyIcon"], LucideIcon> = {
    clock: Clock,
    checkCircle2: CheckCircle2,
};

interface PaginatedStaffListProps {
    title: string;
    count: number;
    variant: "verified" | "pending";
    emptyMessage: string;
    /** Use a plain string key instead of a component reference so Next.js can serialize the prop. */
    emptyIcon: "clock" | "checkCircle2";
    staff: StaffMember[];
}

export function PaginatedStaffList({
    title,
    count,
    variant,
    emptyMessage,
    emptyIcon,
    staff,
}: PaginatedStaffListProps) {
    const Icon = ICON_MAP[emptyIcon];

    const {
        paginatedData,
        currentPage,
        totalPages,
        hasNext,
        hasPrev,
        nextPage,
        prevPage,
    } = usePagination(staff, ITEMS_PER_PAGE);

    return (
        <div className="space-y-4">
            {/* Section header */}
            <div className="flex items-center justify-between gap-2">
                <SectionHeader title={title} count={count} variant={variant} />
            </div>

            <Separator />

            {staff.length === 0 ? (
                <EmptyState message={emptyMessage} icon={Icon} />
            ) : (
                <>
                    {/* Card grid — no fixed scroll area; page scrolls naturally */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                        {paginatedData.map((member) => (
                            <StaffCard key={member.id} staff={member} />
                        ))}
                    </div>

                    {/* Pagination controls — only shown when there is more than one page */}
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
}