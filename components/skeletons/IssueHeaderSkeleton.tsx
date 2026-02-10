export function IssueHeaderSkeleton() {
    return (
        <div className="mb-6 sm:mb-8 animate-pulse">
            <div className="h-10 bg-muted rounded w-3/4 mb-4" />
            <div className="flex gap-2">
                <div className="h-6 bg-muted rounded w-20" />
                <div className="h-6 bg-muted rounded w-24" />
                <div className="h-6 bg-muted rounded w-20" />
            </div>
        </div>
    );
}