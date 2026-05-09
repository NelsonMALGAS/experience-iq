"use client"

import { Issue } from "@/types"
import usePagination from "@/hooks/usePagination"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

type PropertyDetailsIssueListProps = {
    issues: Issue[]
}

const PropertyDetailsIssueList = ({ issues }: PropertyDetailsIssueListProps) => {

    const {
        paginatedData,
        currentPage,
        totalPages,
        hasNext,
        hasPrev,
        nextPage,
        prevPage,
    } = usePagination(issues, 3)

    return (
        <div className="divide-y">

            {(!issues || issues.length === 0) && (
                <div className="p-8 text-sm text-muted-foreground text-center">
                    No issues found for this property.
                </div>
            )}

            {paginatedData?.map((issue) => (
                <div
                    key={issue.id}
                    className="p-5 flex flex-col gap-3 hover:bg-muted/30 transition-colors"
                >
                    <div className="flex items-start justify-between gap-4">
                        <h3 className="font-medium text-sm text-foreground leading-snug">
                            {issue.title}
                        </h3>

                        <div className="flex items-center gap-2 shrink-0">
                            {issue.priority === "critical" && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 border border-red-500/20 dark:text-red-400 font-medium">
                                    Critical
                                </span>
                            )}

                            <span className="text-xs px-2 py-0.5 rounded-md border bg-muted text-muted-foreground">
                                {issue.status}
                            </span>
                        </div>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2">
                        {issue.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        <span>Room: {issue.roomNumber || "—"}</span>
                        <span>Guest: {issue.guestName || "Anonymous"}</span>
                        <span>Priority: {issue.priority}</span>
                    </div>
                </div>
            ))}

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between p-4">
                    <p className="text-xs text-muted-foreground">
                        Page {currentPage} of {totalPages}
                    </p>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={prevPage}
                            disabled={!hasPrev}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={nextPage}
                            disabled={!hasNext}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default PropertyDetailsIssueList