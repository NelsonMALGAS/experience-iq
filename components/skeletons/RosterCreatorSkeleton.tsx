import { Card, CardContent } from "../ui/card";


const RosterCreatorSkeleton = () => {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="space-y-6 sm:space-y-8 animate-pulse">
                {/* Header Skeleton */}
                <div className="space-y-2">
                    <div className="h-8 sm:h-10 bg-muted rounded w-64" />
                    <div className="h-4 bg-muted rounded w-96 max-w-full" />
                </div>

                {/* Controls Skeleton */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <Card key={i}>
                            <CardContent className="p-6">
                                <div className="h-4 bg-muted rounded w-24 mb-3" />
                                <div className="h-10 bg-muted rounded" />
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Staff List Skeleton */}
                <Card>
                    <CardContent className="p-6">
                        <div className="h-6 bg-muted rounded w-32 mb-4" />
                        <div className="space-y-3">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="h-16 bg-muted rounded" />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default RosterCreatorSkeleton