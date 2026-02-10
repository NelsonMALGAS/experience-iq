import { Card, CardContent, CardHeader } from "../ui/card";

const IssuesSkeleton = () => {
    return (
        <Card>
            <CardHeader>
                <div className="h-6 bg-muted rounded w-32 animate-pulse" />
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="p-4 rounded-lg border animate-pulse">
                            <div className="h-5 bg-muted rounded w-3/4 mb-3" />
                            <div className="h-4 bg-muted rounded w-1/2 mb-2" />
                            <div className="h-4 bg-muted rounded w-2/3" />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

export default IssuesSkeleton