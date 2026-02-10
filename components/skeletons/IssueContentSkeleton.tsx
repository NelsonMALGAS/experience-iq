import { Card, CardContent } from "../ui/card";

export function IssueContentSkeleton() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                <Card className="animate-pulse">
                    <CardContent className="p-6">
                        <div className="space-y-2">
                            <div className="h-4 bg-muted rounded w-full" />
                            <div className="h-4 bg-muted rounded w-5/6" />
                            <div className="h-4 bg-muted rounded w-4/6" />
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="space-y-4 sm:space-y-6">
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="animate-pulse">
                        <CardContent className="p-6">
                            <div className="h-20 bg-muted rounded" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}