import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Building2 } from "lucide-react";
import { fetchPropertiesWithStats } from "@/app/optimised-actions/properties";
import PropertySectionList from "./PropertySectionList";

type PropertiesSectionProps = {
    uid: string
    inheritedFrom: string | undefined
}

const PropertiesSection = async ({ uid, inheritedFrom }: PropertiesSectionProps) => {

    const { properties } = await fetchPropertiesWithStats(uid, inheritedFrom);

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
                    {properties.length > 0 ? <PropertySectionList properties={properties} /> : (
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