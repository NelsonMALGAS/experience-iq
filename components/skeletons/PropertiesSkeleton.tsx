import { Card, CardContent, CardHeader } from "../ui/card";

const PropertiesSkeleton = () => {
    return (
        <Card>
            <CardHeader>
                <div className="h-6 bg-muted rounded w-48 animate-pulse" />
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="p-4 rounded-lg bg-muted/30 animate-pulse">
                            <div className="h-5 bg-muted rounded w-32 mb-2" />
                            <div className="h-4 bg-muted rounded w-24" />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

export default PropertiesSkeleton