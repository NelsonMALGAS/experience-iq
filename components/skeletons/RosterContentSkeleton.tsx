import { Card, CardContent } from "../ui/card";

export function RosterContentSkeleton() {
    return (
        <div className="space-y-4 sm:space-y-6">
            <Card className="animate-pulse">
                <CardContent className="p-6">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i}>
                                <div className="h-4 bg-muted rounded w-20 mb-2" />
                                <div className="h-8 bg-muted rounded w-16" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
            <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="animate-pulse">
                        <CardContent className="p-4 sm:p-6">
                            <div className="h-20 bg-muted rounded" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}