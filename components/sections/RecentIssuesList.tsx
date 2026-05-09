"use client";

import { Issue, Role, StaffMember } from "@/types";
import { IssueCard } from "../issues/IssueCard";
import usePagination from "@/hooks/usePagination";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

type RecentIssuesListProps = {
    issues: Issue[];
    staffMembers: StaffMember[];
    currentUserId: string;
    userRole: Role;
};

const RecentIssuesList = ({
    issues,
    staffMembers,
    currentUserId,
    userRole,
}: RecentIssuesListProps) => {
    const {
        paginatedData,
        currentPage,
        totalPages,
        hasNext,
        hasPrev,
        nextPage,
        prevPage,
    } = usePagination(issues, 6);

    return (
        <div className="space-y-6">
            {/* Issues Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedData.map((issue, index) => (
                    <div
                        key={issue.id}
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        <IssueCard
                            issue={issue}
                            staffMembers={staffMembers}
                            currentUserId={currentUserId}
                            userRole={userRole}
                        />
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {paginatedData.length === 0 && (
                <div className="flex items-center justify-center rounded-xl border border-dashed border-border py-12 text-center">
                    <p className="text-sm text-muted-foreground">
                        No issues found
                    </p>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                    <p className="text-sm text-muted-foreground">
                        Page{" "}
                        <span className="font-medium text-foreground">
                            {currentPage}
                        </span>{" "}
                        of{" "}
                        <span className="font-medium text-foreground">
                            {totalPages}
                        </span>
                    </p>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={prevPage}
                            disabled={!hasPrev}
                            className="h-9 rounded-lg"
                            aria-label="Previous Page"
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Previous
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={nextPage}
                            disabled={!hasNext}
                            className="h-9 rounded-lg"
                            aria-label="Next Page"
                        >
                            Next
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecentIssuesList;