import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { mockProperties } from "@/constants/mockData";
import { auth } from "@/db/server";
import { Role } from "@/types";
import { MapPin, MoreHorizontal, Plus, Search } from "lucide-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";


const PropertiesPage = async () => {

    const cookieStore = await cookies();
    const session = cookieStore?.get("_SESSION_")?.value;
    const role: Role = "admin"

    if (!session) redirect(`/login?role=${role}`);

    const decoded = await auth?.verifySessionCookie(session, true);

    if (!decoded) redirect(`/login?role=${role}`)
    const uid = decoded.uid;


    // const adminSnap = await db?.collection("users").doc(uid).get();
    // if (!adminSnap) return redirect(`/login?role=${"admin"}`)
    // if (!adminSnap.exists) redirect(`/login?role=${"admin"}`);
    if (!uid) redirect(`/login?role=${role}`)
    return (
        <div className="mt-24">
            <DashboardLayout role={role} uid={uid}>
                <div className="space-y-6 animate-fade-in">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-display font-bold text-foreground">Properties</h1>
                            <p className="text-muted-foreground mt-1">
                                Manage and monitor all properties
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="relative w-full sm:w-72">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Search properties..." className="pl-9 bg-card" />
                            </div>
                            <Button className="text-white hover:opacity-90 shadow-gold" variant="default">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Property
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {mockProperties.map((property, index) => {
                            const resolutionRate = Math.round(((property.totalIssues - property.openIssues) / property.totalIssues) * 100);

                            return (
                                <Card
                                    key={property.id}
                                    className="group relative overflow-hidden border border-border bg-card transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-slide-up"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    {/* Header */}
                                    <div className="relative h-32 bg-muted p-0 mt-0">
                                        {/* Gradient overlay */}
                                        <div className="absolute inset-0 bg-linear-to-t from-background/80 to-transparent" />

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
                                        {/* Stats */}
                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="rounded-lg bg-muted/50 p-3 text-center">
                                                <p className="text-2xl font-bold text-foreground">
                                                    {property.totalIssues}
                                                </p>
                                                <p className="text-xs text-muted-foreground">Total</p>
                                            </div>

                                            <div className="rounded-lg bg-destructive/10 p-3 text-center">
                                                <p className="text-2xl font-bold text-destructive">
                                                    {property.openIssues}
                                                </p>
                                                <p className="text-xs text-muted-foreground">Open</p>
                                            </div>

                                            <div className="rounded-lg bg-muted/50 p-3 text-center">
                                                <p className="text-2xl font-bold text-foreground">
                                                    {property.avgResolutionTime}m
                                                </p>
                                                <p className="text-xs text-muted-foreground">Avg Time</p>
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
                                            <Progress value={resolutionRate} className="h-2" />
                                        </div>
                                    </CardContent>
                                </Card>

                            );
                        })}
                    </div>
                </div>
            </DashboardLayout>
        </div>
    )
}

export default PropertiesPage