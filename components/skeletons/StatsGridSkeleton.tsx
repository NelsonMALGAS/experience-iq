import { Card, CardContent } from "../ui/card";

// 🚀 OPTIMIZATION 1: Skeleton components for instant UI feedback
const StatsGridSkeleton = () => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                        <div className="h-4 bg-muted rounded w-24 mb-4" />
                        <div className="h-8 bg-muted rounded w-16 mb-2" />
                        <div className="h-3 bg-muted rounded w-20" />
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

export default StatsGridSkeleton