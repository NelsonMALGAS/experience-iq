"use client"

import { Issue } from "@/types"
import { IssueCard } from "./IssueCard"
import Link from "next/link"

type IssuesListProps = {
    issues: Issue[]
}

const IssuesList = ({ issues }: IssuesListProps) => {

    const handleIssueClick = (issue: Issue) => {
        console.log(issue, "ISSUE")
    }
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {issues.map((issue, index) => (
                <div
                    key={issue.id}
                    className="animate-slide-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                >
                    <Link href={`/staff/issues/${issue.id}`}>
                        <IssueCard issue={issue} onClick={() => handleIssueClick(issue)} />
                    </Link>
                </div>
            ))}
        </div>
    )
}

export default IssuesList