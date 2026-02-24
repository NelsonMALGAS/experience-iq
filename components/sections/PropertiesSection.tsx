import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Building2 } from "lucide-react";
import { Progress } from "../ui/progress";
import { fetchPropertiesWithStats } from "@/app/optimised-actions/properties";

type PropertiesSectionProps = {
    uid: string
}

const PropertiesSection = async ({ uid }: PropertiesSectionProps) => {
    const { properties } = await fetchPropertiesWithStats(uid);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-display flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-secondary" />
                    Properties Overview
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {properties.length > 0 ? (
                        properties.map((property, index) => (
                            <div
                                key={property.id}
                                className="p-4 rounded-lg bg-muted/30 border border-border hover:shadow-md transition-all"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <h4 className="font-semibold text-foreground">{property.name}</h4>
                                        <p className="text-sm text-muted-foreground">{property.location}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-status-open-bg text-status-open">
                                            {property.openIssues} open
                                        </span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Resolution Rate</span>
                                        <span className="font-medium">
                                            {property.totalIssues > 0
                                                ? Math.round(((property.totalIssues - property.openIssues) / property.totalIssues) * 100)
                                                : 0}%
                                        </span>
                                    </div>
                                    <Progress
                                        value={property.totalIssues > 0
                                            ? ((property.totalIssues - property.openIssues) / property.totalIssues) * 100
                                            : 0}
                                        className="h-2"
                                    />
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            No properties found
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

export default PropertiesSection