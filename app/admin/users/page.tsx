import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Unverified from "@/components/Unverified";
import { roleConfig } from "@/constants";
import { mockUsers } from "@/constants/mockData";
import { auth } from "@/db/server";
import { cn } from "@/lib/utils";
import { requireVerifiedUser } from "@/lib/verificationGuards";
import { Role } from "@/types";
import { MoreHorizontal, Plus, Search, Shield, UserIcon, UsersIcon } from "lucide-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";


const UsersPage = async () => {

    const cookieStore = await cookies();
    const session = cookieStore?.get("_SESSION_")?.value;
    const role: Role = "admin"

    if (!session) redirect(`/login?role=${role}`);

    const decoded = await auth?.verifySessionCookie(session, true);

    if (!decoded) redirect(`/login?role=${role}`)
    const verificationResult = await requireVerifiedUser(session, role);
    const { uid, isVerified, canAccessData } = verificationResult;
    const userRole = role || "admin"

    if (!uid) redirect(`/login?role=${role}`)

    // 🚫 HARD RULE: If not verified, show restricted dashboard WITHOUT fetching data
    if (!canAccessData) {
        return <Unverified isVerified={isVerified} role={userRole} uid={uid} />
    }
    return (
        <div className="mt-24">
            <DashboardLayout role={role || "admin"} uid={uid} isVerified={isVerified}>
                <div className="space-y-6 animate-fade-in">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-display font-bold text-foreground">Users</h1>
                            <p className="text-muted-foreground mt-1">
                                Manage staff and user accounts
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="relative w-full sm:w-72">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Search users..." className="pl-9 bg-muted/50" />
                            </div>
                            <Button className="bg-gradient-gold text-primary hover:opacity-90 shadow-gold">
                                <Plus className="h-4 w-4 mr-2" />
                                Add User
                            </Button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Card className="bg-gradient-primary text-primary-foreground">
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                                    <UsersIcon className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-3xl font-display font-bold">{mockUsers.length}</p>
                                    <p className="text-sm text-primary-foreground/70">Total Users</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                                    <UserIcon className="h-6 w-6 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-3xl font-display font-bold text-foreground">
                                        {mockUsers.filter(u => u.role === 'staff').length}
                                    </p>
                                    <p className="text-sm text-muted-foreground">Staff Members</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                                    <Shield className="h-6 w-6 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-3xl font-display font-bold text-foreground">
                                        {mockUsers.filter(u => u.role === 'admin').length}
                                    </p>
                                    <p className="text-sm text-muted-foreground">Administrators</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Users List */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-display">All Users</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {mockUsers.map((user, index) => (
                                    <div
                                        key={user.uid}
                                        className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border hover:shadow-md transition-all animate-slide-up"
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        <div className="flex items-center gap-4">
                                            <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                                                <AvatarFallback className="bg-gradient-gold text-primary font-semibold">
                                                    {user.displayName?.split(' ').map(n => n[0]).join('')}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <h4 className="font-semibold text-foreground">{user.displayName || "Guest"}</h4>
                                                <p className="text-sm text-muted-foreground">{user.email}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <Badge className={cn("border", roleConfig[user.role].color)}>
                                                {roleConfig[user.role].label}
                                            </Badge>
                                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </DashboardLayout>
        </div>
    )
}

export default UsersPage