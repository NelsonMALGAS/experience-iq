import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Property, Role } from "@/types";
import { MapPin, MoreHorizontal, Search, Building2 } from "lucide-react";
import { redirect } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { AddPropertyDialog } from "@/components/Addpropertydialog";
import { cookies } from "next/headers";
import { auth } from "@/db/server";
import { requireVerifiedUser } from "@/lib/verificationGuards";
import Unverified from "@/components/Unverified";
import { Metadata } from "next";
import { baseKeywords, baseUrl, sharedMetadata } from "@/constants/sharedMetadata";
import { fetchPropertiesWithStats } from "@/app/optimised-actions/properties";

export const metadata: Metadata = {
    title: "Properties – ExperienceIQ",
    description:
        "Manage all properties and view property-specific analytics. Monitor issue resolution rates, staff performance, guest satisfaction, and operational metrics per location.",
    keywords: [
        ...baseKeywords,
        "property management",
        "properties dashboard",
        "multi-property",
        "location management",
        "property analytics",
        "hotel portfolio",
    ],
    ...sharedMetadata,
    openGraph: {
        title: "Properties Dashboard – ExperienceIQ",
        description:
            "Manage all properties and view property-specific analytics. Monitor resolution rates and guest satisfaction.",
        url: `${baseUrl}/admin/properties`,
        siteName: "ExperienceIQ",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "Properties Management Dashboard",
            },
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Properties Dashboard – ExperienceIQ",
        description: "Manage all properties and view property-specific analytics.",
        images: ["/og-image.png", "/twitter-card.png"],
        creator: "@ExperienceIQ",
    },
}

const PropertiesPage = async () => {
    const cookieStore = await cookies();
    const session = cookieStore?.get("_SESSION_")?.value;
    const role: Role = "admin"

    if (!session) redirect(`/login?role=${role}`);

    const decoded = await auth?.verifySessionCookie(session, true);

    if (!decoded) redirect(`/login?role=${role}`)

    const verificationResult = await requireVerifiedUser(session, role);
    const { uid, isVerified, canAccessData } = verificationResult;

    if (!uid) redirect(`/login?role=${role}`)

    // 🚫 HARD RULE: If not verified, show restricted dashboard WITHOUT fetching data
    if (!canAccessData) {
        return <Unverified isVerified={isVerified} role={role} uid={uid} />
    }

    // ✅ USER IS VERIFIED - Fetch properties with live statistics
    // Statistics are derived from issues collection at read time
    let properties: Property[] = [];
    let error = null;

    try {
        properties = await fetchPropertiesWithStats();
    } catch (e) {
        error = e instanceof Error ? e.message : "Failed to fetch properties";
        console.error("Error fetching properties:", e);
    }

    return (
        <div className="mt-24">
            <DashboardLayout role={role} uid={uid} isVerified={isVerified}>
                <div className="space-y-6 animate-fade-in">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-display font-bold text-foreground">Properties</h1>
                            <p className="text-muted-foreground mt-1">
                                Manage and monitor all properties with live statistics
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="relative w-full sm:w-72">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Search properties..." className="pl-9 bg-card" />
                            </div>
                            <AddPropertyDialog />
                        </div>
                    </div>

                    {/* Info Badge - Statistics are live */}
                    {properties.length > 0 && (
                        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20 w-fit">
                            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                            <p className="text-xs text-primary font-medium">
                                Live statistics derived from {properties.reduce((sum, p) => sum + p.totalIssues, 0)} issues
                            </p>
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                {error}
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Properties Grid */}
                    {properties.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {properties.map((property, index) => {
                                const resolutionRate = property.totalIssues > 0
                                    ? Math.round(((property.totalIssues - property.openIssues) / property.totalIssues) * 100)
                                    : 0;

                                return (
                                    <Card
                                        key={property.id}
                                        className="group relative overflow-hidden border border-border bg-card transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-slide-up"
                                        style={{ animationDelay: `${index * 100}ms` }}
                                    >
                                        {/* Header */}
                                        <div className="relative h-32 bg-linear-to-br from-primary/10 via-primary/5 to-transparent">
                                            {/* Gradient overlay */}
                                            <div className="absolute inset-0 bg-linear-to-t from-background/80 to-transparent" />

                                            {/* Property code badge */}
                                            <div className="absolute top-3 left-3">
                                                <span className="px-2 py-1 text-xs font-mono tracking-widest rounded-md bg-background/80 border border-border text-muted-foreground uppercase">
                                                    {property.code?.toUpperCase()}
                                                </span>
                                            </div>

                                            {/* Property info */}
                                            <div className="absolute bottom-4 left-4 space-y-1">
                                                <h3 className="text-lg font-semibold text-card-foreground">
                                                    {property.name}
                                                </h3>
                                                <p className="flex items-center gap-1 text-sm text-muted-foreground">
                                                    <MapPin className="h-3.5 w-3.5" />
                                                    {property.location}
                                                </p>
                                            </div>

                                            {/* Menu button */}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
                                            >
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        {/* Content */}
                                        <CardContent className="p-6 space-y-4">
                                            {/* Stats - Now showing LIVE data */}
                                            <div className="grid grid-cols-3 gap-3">
                                                <div className="rounded-lg bg-muted/50 p-3 text-center">
                                                    <p className="text-2xl font-bold text-foreground">
                                                        {property.totalIssues}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">Total</p>
                                                </div>

                                                <div className={`rounded-lg p-3 text-center ${property.openIssues > 0
                                                        ? 'bg-destructive/10'
                                                        : 'bg-success/10'
                                                    }`}>
                                                    <p className={`text-2xl font-bold ${property.openIssues > 0
                                                            ? 'text-destructive'
                                                            : 'text-success'
                                                        }`}>
                                                        {property.openIssues}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">Open</p>
                                                </div>

                                                <div className="rounded-lg bg-muted/50 p-3 text-center">
                                                    <p className="text-2xl font-bold text-foreground">
                                                        {property.avgResolutionTime}h
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">Avg</p>
                                                </div>
                                            </div>

                                            {/* Progress */}
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-muted-foreground">Resolution Rate</span>
                                                    <span className="font-medium text-foreground">
                                                        {resolutionRate}%
                                                    </span>
                                                </div>
                                                <Progress
                                                    value={resolutionRate}
                                                    className="h-2"
                                                />
                                            </div>

                                            {/* Additional Stats */}
                                            <div className="pt-2 border-t border-border">
                                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                    <span>Resolved Issues</span>
                                                    <span className="font-medium text-success">
                                                        {property.resolvedIssues}
                                                    </span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    ) : !error ? (
                        /* Empty State */
                        <Card className="border-dashed border-2">
                            <CardContent className="flex flex-col items-center justify-center py-16">
                                <div className="rounded-full bg-muted p-6 mb-4">
                                    <Building2 className="h-12 w-12 text-muted-foreground" />
                                </div>
                                <h3 className="text-xl font-semibold text-foreground mb-2">
                                    No Properties Yet
                                </h3>
                                <p className="text-muted-foreground text-center mb-6 max-w-md">
                                    Get started by adding your first property. Properties help you organize and track issues across different locations.
                                </p>
                                <AddPropertyDialog />
                            </CardContent>
                        </Card>
                    ) : null}
                </div>
            </DashboardLayout>
        </div>
    )
}

export default PropertiesPage