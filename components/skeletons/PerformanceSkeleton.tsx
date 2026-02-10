import { Card, CardContent } from "../ui/card";

const PerformanceSkeleton = () => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <Card className="lg:col-span-1 animate-pulse">
                <CardContent className="p-4 sm:p-6">
                    <div className="h-12 bg-muted rounded mb-4" />
                    <div className="space-y-2">
                        <div className="h-4 bg-muted rounded" />
                        <div className="h-4 bg-muted rounded" />
                    </div>
                </CardContent>
            </Card>
            <Card className="lg:col-span-2 animate-pulse">
                <CardContent className="p-4 sm:p-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="h-24 bg-muted rounded" />
                        <div className="h-24 bg-muted rounded" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default PerformanceSkeleton