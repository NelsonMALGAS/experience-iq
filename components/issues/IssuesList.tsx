'use client';

import { Issue, Role, StaffMember } from "@/types";
import { IssueCard } from "./IssueCard";

interface IssuesListProps {
    issues: Issue[];
    staffMembers?: StaffMember[];
    currentUserId?: string;
    userRole?: Role;
}

export default function IssuesList({
    issues,
    staffMembers = [],
    currentUserId,
    userRole = 'staff'
}: IssuesListProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {issues.map((issue, index) => (
                <div
                    key={issue.id}
                    className="animate-slide-up"
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
    );
}