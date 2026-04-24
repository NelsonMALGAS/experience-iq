"use client"

import { Property } from "@/types"
import { Progress } from "../ui/progress"
import { Button } from "../ui/button"
import usePagination from "@/hooks/usePagination"
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react"

type PropertiesSectionListProps = {
    properties: Property[]
}

const PropertySectionList = ({ properties }: PropertiesSectionListProps) => {

    const {
        paginatedData,
        currentPage,
        hasNext,
        hasPrev,
        reset,
        nextPage,
        prevPage,
        totalPages,
        totalItems,
    } = usePagination(properties, 10)


    return (
        <div className="flex flex-col gap-3">
            {/* ← MODIFIED: iterate paginatedData instead of properties */}
            {paginatedData.map((property, index) => (
                <div
                    key={property.id}
                    className="p-4 rounded-lg bg-muted/30 border border-border hover:shadow-md transition-all"
                    style={{ animationDelay: `${index * 50}ms` }}
                >
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h4 className="font-semibold text-foreground">{property.name}</h4>
                            <p className="text-sm text-muted-foreground">{property.location}</p>
                        </div>
                        <div className="text-right">
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-status-open-bg text-status-open">
                                {property.openIssues} open
                            </span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Resolution Rate</span>
                            <span className="font-medium">
                                {property.totalIssues > 0
                                    ? Math.round(((property.totalIssues - property.openIssues) / property.totalIssues) * 100)
                                    : 0}%
                            </span>
                        </div>
                        <Progress
                            value={property.totalIssues > 0
                                ? ((property.totalIssues - property.openIssues) / property.totalIssues) * 100
                                : 0}
                            className="h-2"
                        />
                    </div>
                </div>
            ))}

            {/* ← NEW: Pagination controls — only render when there's more than one page */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between pt-1">
                    <p className="text-xs text-muted-foreground">
                        Page {currentPage} of {totalPages}
                        <span className="ml-1 text-muted-foreground/60">({totalItems} total)</span>
                    </p>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={prevPage}
                            disabled={!hasPrev}
                            aria-label="Previous page"
                        >
                            <ChevronLeft className="h-3.5 w-3.5" />
                        </Button>

                        <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={nextPage}
                            disabled={!hasNext}
                            aria-label="Next page"
                        >
                            <ChevronRight className="h-3.5 w-3.5" />
                        </Button>

                        <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={reset}
                            aria-label="Reset pagination"
                        >
                            <RotateCcw className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default PropertySectionList