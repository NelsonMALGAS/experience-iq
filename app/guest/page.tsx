import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth, db } from '@/db/server';
import { AlertCircle, FileQuestion, Shield, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Role } from '@/types';
import GuestDashboardHeader from '@/components/guest/GuestDashboardHeader';
import IssuesList from '@/components/guest/GuestIssuesList';
import GuestDashboardFooter from '@/components/guest/GuestDashboardFooter';
import { Metadata } from 'next';
import { baseKeywords, baseUrl, sharedMetadata } from '@/constants/sharedMetadata';
import { fetchGuestIssues } from '../optimised-actions';

export const metadata: Metadata = {
    title: "Dashboard – ExperienceIQ",
    description:
        "Guest Dashboard for submitting and tracking service issues in real time. Report maintenance, housekeeping, or amenity requests instantly and monitor resolution progress.",
    keywords: [
        ...baseKeywords,
        "guest portal",
        "issue reporting",
        "service requests",
        "track issues",
        "hotel guest app",
        "guest services",
    ],
    ...sharedMetadata,
    openGraph: {
        title: "Guest Dashboard – ExperienceIQ",
        description:
            "Submit and track service issues in real time. Report maintenance, housekeeping, or amenity requests instantly.",
        url: `${baseUrl}/guest`,
        siteName: "ExperienceIQ",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "ExperienceIQ Guest Dashboard",
            },
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Guest Dashboard – ExperienceIQ",
        description:
            "Submit and track service issues in real time. Report maintenance, housekeeping, or amenity requests instantly.",
        images: ["/og-image.png", "/twitter-card.png"],
        creator: "@ExperienceIQ",
    },
}

async function GuestDashboard() {
    const cookieStore = await cookies();
    const session = cookieStore?.get('_SESSION_')?.value;
    const role: Role = "guest";

    if (!session) redirect(`/login?role=${role}`);

    const decoded = await auth?.verifySessionCookie(session, true);

    if (!decoded) redirect(`/login?role=${role}`);

    const uid = decoded.uid;

    if (!uid) redirect(`/login?role=${role}`);

    if (!auth || !db) throw new Error("Firebase admin not initialized")

    // Verify user is guest/anonymous
    const userRecord = await auth.getUser(uid);
    const userRole = userRecord.customClaims?.role;

    // Allow both guest role and anonymous users
    if (userRole !== 'guest' && !userRecord.providerData.find(p => p.providerId === 'anonymous')) {
        redirect(`/login?role=${role}`);
    }

    const userIssues = await fetchGuestIssues(uid)

    // Calculate stats
    const openIssues = userIssues.filter(i => i.status === 'open').length;
    const inProgressIssues = userIssues.filter(i => i.status === 'in_progress').length;
    const resolvedIssues = userIssues.filter(i => i.status === 'resolved').length;

    return (
        <div className="mt-20 min-h-screen bg-background">
            <div className="container max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
                {/* Header */}
                <GuestDashboardHeader />

                {/* Anonymous User Alert */}
                <Alert className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
                    <Shield className="h-4 w-4 text-amber-600 dark:text-amber-500" />
                    <AlertTitle className="text-amber-900 dark:text-amber-200 font-semibold">
                        Anonymous Guest Session
                    </AlertTitle>
                    <AlertDescription className="text-amber-800 dark:text-amber-300 text-sm">
                        You&apos;re signed in anonymously. Issues are only visible for your current session.
                        <br />
                        <span className="font-medium">Important:</span> If your session expires or browser data is cleared, you may
                        lose access to these issues. For permanent access, please create a regular account.
                    </AlertDescription>
                </Alert>

                {/* Session Info Card */}
                {uid && (
                    <Card className="border-blue-200 dark:border-blue-900 bg-linear-to-br from-blue-50/50 to-slate-50/50 dark:from-blue-950/20 dark:to-slate-950/20">
                        <CardContent className="pt-6 pb-6">
                            <div className="flex items-start gap-4">
                                <div className="p-2.5 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                                    <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="flex-1 space-y-2">
                                    <p className="text-sm font-semibold text-foreground">Current Session ID</p>
                                    <p className="text-xs text-muted-foreground font-mono break-all bg-muted/50 p-2 rounded">
                                        {uid}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        This ID identifies your current anonymous session. Your issues are linked to this ID.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}



                {/* Stats Cards - Only show if there are issues */}
                {userIssues.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card className="border-slate-200 dark:border-slate-800">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <FileQuestion className="h-4 w-4" />
                                    Total Issues
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{userIssues.length}</div>
                                <p className="text-xs text-muted-foreground mt-1">All submissions</p>
                            </CardContent>
                        </Card>

                        <Card className="border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-red-700 dark:text-red-400 flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4" />
                                    Open
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-700 dark:text-red-400">{openIssues}</div>
                                <p className="text-xs text-red-600/70 dark:text-red-400/70 mt-1">Awaiting response</p>
                            </CardContent>
                        </Card>

                        <Card className="border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-400 flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    In Progress
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">{inProgressIssues}</div>
                                <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1">Being resolved</p>
                            </CardContent>
                        </Card>

                        <Card className="border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-950/20">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-green-700 dark:text-green-400 flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4" />
                                    Resolved
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-700 dark:text-green-400">{resolvedIssues}</div>
                                <p className="text-xs text-green-600/70 dark:text-green-400/70 mt-1">Completed</p>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Main Content */}

                <>
                    {userIssues.length === 0 ? (
                        // Empty State
                        <Card className="border-dashed">
                            <CardContent className="flex flex-col items-center justify-center py-16 sm:py-20">
                                <div className="p-4 rounded-full bg-muted/50 mb-4">
                                    <FileQuestion className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground" />
                                </div>
                                <h3 className="text-xl sm:text-2xl font-semibold mb-2">No Issues Yet</h3>
                                <p className="text-muted-foreground text-center max-w-md mb-6 text-sm sm:text-base">
                                    You haven&apos;t submitted any issues in this session. Create your first issue
                                    to get started.
                                </p>
                                <div className="flex flex-wrap gap-2 justify-center text-xs text-muted-foreground">
                                    <span className="px-3 py-1.5 bg-muted rounded-full">Quick Response</span>
                                    <span className="px-3 py-1.5 bg-muted rounded-full">24/7 Support</span>
                                    <span className="px-3 py-1.5 bg-muted rounded-full">Track Status</span>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        // Issues List (Client Component)
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-xl font-semibold flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5 text-primary" />
                                        Your Issues
                                    </CardTitle>
                                    <span className="text-sm text-muted-foreground">
                                        {userIssues.length} total
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <IssuesList issues={userIssues} />
                            </CardContent>
                        </Card>
                    )}
                </>

                {/* Footer Note */}
                <GuestDashboardFooter />
            </div>
        </div>
    );
}

export default GuestDashboard;