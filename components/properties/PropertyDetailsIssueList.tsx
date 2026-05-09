"use client"

import { Issue } from "@/types"
import usePagination from "@/hooks/usePagination"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

type PropertyDetailsIssueListProps = {
    issues: Issue[]
}

const PRIORITY_COLORS: Record<string, string> = {
    critical: "#E24B4A",
    high: "#BA7517",
    medium: "#378ADD",
    low: "#1D9E75",
}

const PAGE_SIZE = 5

const PropertyDetailsIssueList = ({ issues }: PropertyDetailsIssueListProps) => {

    const {
        paginatedData,
        currentPage,
        totalPages,
        hasNext,
        hasPrev,
        nextPage,
        prevPage,
    } = usePagination(issues, PAGE_SIZE)

    if (!issues || issues.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-14 px-6 text-center gap-2">
                <p className="text-sm text-muted-foreground">No issues found for this property.</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-3 p-4">

            {/* Summary row */}
            <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">
                    {issues.length} issue{issues.length !== 1 ? "s" : ""}
                </span>
                {totalPages > 1 && (
                    <span className="text-xs text-muted-foreground">
                        Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, issues.length)} of {issues.length}
                    </span>
                )}
            </div>

            {/* Issue cards */}
            <div className="flex flex-col gap-2">
                {paginatedData?.map((issue) => {
                    const dotColor = PRIORITY_COLORS[issue.priority] ?? "#888"

                    return (
                        <div
                            key={issue.id}
                            className="group flex flex-col gap-2.5 rounded-xl border border-border bg-card p-4 transition-colors hover:border-border/80 hover:bg-muted/30"
                        >
                            {/* Title row */}
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-2.5 flex-1 min-w-0">
                                    {/* Priority dot */}
                                    <span
                                        className="mt-1.25 h-2 w-2 shrink-0 rounded-full"
                                        style={{ backgroundColor: dotColor }}
                                    />
                                    <h3 className="text-sm font-medium text-foreground leading-snug">
                                        {issue.title}
                                    </h3>
                                </div>

                                {/* Badges */}
                                <div className="flex items-center gap-1.5 shrink-0">
                                    {issue.priority === "critical" && (
                                        <span className="inline-flex items-center rounded-full bg-red-500/10 border border-red-500/20 px-2 py-0.5 text-[11px] font-medium text-red-600 dark:text-red-400">
                                            Critical
                                        </span>
                                    )}
                                    <span className="inline-flex items-center rounded-md border border-border bg-muted px-2 py-0.5 text-[11px] text-muted-foreground capitalize">
                                        {issue.status.replace("-", " ")}
                                    </span>
                                </div>
                            </div>

                            {/* Description */}
                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed pl-4.5">
                                {issue.description}
                            </p>

                            {/* Meta chips */}
                            <div className="flex flex-wrap items-center gap-1.5 pl-4.5">
                                <span className="inline-flex items-center rounded-md border border-border bg-background px-2 py-0.5 text-[11px] text-muted-foreground">
                                    Room: {issue.roomNumber || "—"}
                                </span>
                                <span className="inline-flex items-center rounded-md border border-border bg-background px-2 py-0.5 text-[11px] text-muted-foreground">
                                    {issue.guestName || "Anonymous"}
                                </span>
                                <span
                                    className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-0.5 text-[11px] text-muted-foreground capitalize"
                                >
                                    <span
                                        className="h-1.5 w-1.5 rounded-full"
                                        style={{ backgroundColor: dotColor }}
                                    />
                                    {issue.priority}
                                </span>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between pt-1">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={prevPage}
                        disabled={!hasPrev}
                        className="gap-1.5 h-8 px-3 text-xs"
                    >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        Prev
                    </Button>

                    <span className="text-xs text-muted-foreground tabular-nums">
                        Page {currentPage} of {totalPages}
                    </span>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={nextPage}
                        disabled={!hasNext}
                        className="gap-1.5 h-8 px-3 text-xs"
                    >
                        Next
                        <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                </div>
            )}
        </div>
    )
}

export default PropertyDetailsIssueList