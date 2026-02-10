import { Card, CardContent } from "../ui/card";

const IssuesListSkeleton = () => {
    return (
        <div className="space-y-3">
            {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                        <div className="h-5 bg-muted rounded w-3/4 mb-3" />
                        <div className="h-4 bg-muted rounded w-1/2 mb-2" />
                        <div className="h-4 bg-muted rounded w-2/3" />
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

export default IssuesListSkeleton