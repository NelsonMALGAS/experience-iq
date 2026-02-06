import { Role } from "@/types"
import { DashboardLayout } from "./layout/DashboardLayout"
import { RefreshButton } from "./layout/RefreshButton"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { AlertCircle, BarChart3, Building2, Clock, ShieldAlert, TrendingUp } from "lucide-react"
import { StatCard } from "./dashboard/StatCard"

type UnverifiedProps = {
    uid: string
    role: Role
    isVerified: boolean
}
const Unverified = ({ uid, role, isVerified }: UnverifiedProps) => {
    return (
        <div className="mt-24">
            <DashboardLayout role={role} uid={uid} isVerified={isVerified}>
                <div className="space-y-8 animate-fade-in">
                    {/* Header with Refresh Button */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-display font-bold text-foreground">
                                Executive Overview
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                Monitor guest experience across all properties
                            </p>
                        </div>
                        <RefreshButton />
                    </div>

                    {/* Verification Pending State */}
                    <Card className="border-warning bg-warning/5">
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <ShieldAlert className="h-16 w-16 text-warning mb-4" />
                            <h3 className="text-lg font-semibold text-foreground mb-2">
                                Account Pending Verification
                            </h3>
                            <p className="text-sm text-muted-foreground text-center max-w-md">
                                Your administrator account is currently pending verification.
                                You&apos;ll gain full access to property analytics, issue management,
                                user administration, and all executive tools once verified.
                            </p>
                            <p className="text-xs text-muted-foreground mt-4">
                                Please contact the system administrator if you need immediate access.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Locked Stats Grid - Visual placeholders */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 opacity-50 pointer-events-none">
                        <StatCard
                            title="Total Issues"
                            value="—"
                            subtitle="Access restricted"
                            icon={BarChart3}
                            variant="primary"
                        />
                        <StatCard
                            title="Open Issues"
                            value="—"
                            subtitle="Access restricted"
                            icon={AlertCircle}
                            variant="danger"
                        />
                        <StatCard
                            title="Avg. Resolution"
                            value="—"
                            subtitle="Access restricted"
                            icon={Clock}
                        />
                        <StatCard
                            title="SLA Compliance"
                            value="—"
                            icon={TrendingUp}
                            variant="warning"
                        />
                    </div>

                    {/* Locked Properties Section */}
                    <Card className="opacity-50 pointer-events-none">
                        <CardHeader>
                            <CardTitle className="font-display flex items-center gap-2">
                                <Building2 className="h-5 w-5 text-secondary" />
                                Properties Overview
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-12 text-muted-foreground">
                                Property data restricted until verification
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </DashboardLayout>
        </div>
    )
}

export default Unverified