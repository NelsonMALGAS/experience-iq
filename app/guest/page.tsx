import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth, db } from '@/db/server';
import { AlertCircle, FileQuestion, TrendingUp, Clock, CheckCircle2, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Role } from '@/types';
import GuestDashboardHeader from '@/components/guest/GuestDashboardHeader';
import IssuesList from '@/components/guest/GuestIssuesList';
import GuestDashboardFooter from '@/components/guest/GuestDashboardFooter';
import { Metadata } from 'next';
import { baseKeywords, baseUrl, sharedMetadata } from '@/constants/sharedMetadata';
import { fetchGuestIssues } from '../optimised-actions';
import { Suspense } from 'react';

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
    const totalIssues = userIssues.length;

    return (
        <Suspense fallback={<span>Loading Guest Dashboard...</span>}>
            <div className="min-h-screen bg-linear-to-b from-slate-50/50 via-background to-background dark:from-slate-950/20 dark:via-background dark:to-background">
                {/* Main Container */}
                <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12 space-y-8">

                    {/* ===== HERO SECTION ===== */}
                    <section className="space-y-6">
                        {/* Page Header */}
                        <GuestDashboardHeader />
                    </section>

                    {/* ===== DASHBOARD OVERVIEW SECTION ===== */}
                    {totalIssues > 0 && (
                        <section className="space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="h-1 w-12 bg-linear-to-r from-primary to-primary/40 rounded-full" />
                                <h2 className="text-lg font-semibold text-foreground">Overview</h2>
                            </div>

                            {/* Stats Grid - Responsive & Enhanced */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                                {/* Total Issues */}
                                <Card className="group relative overflow-hidden border-slate-200/60 dark:border-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 hover:shadow-md">
                                    <div className="absolute inset-0 bg-linear-to-br from-slate-50/50 to-transparent dark:from-slate-900/20 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <CardHeader className="pb-3 pt-5">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                                Total
                                            </CardTitle>
                                            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800/50">
                                                <FileQuestion className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pb-5">
                                        <div className="text-3xl font-bold text-foreground">{totalIssues}</div>
                                        <p className="text-xs text-muted-foreground mt-1.5">Submissions</p>
                                    </CardContent>
                                </Card>

                                {/* Open Issues */}
                                <Card className="group relative overflow-hidden border-red-200/60 dark:border-red-900/40 bg-linear-to-br from-red-50/30 to-transparent dark:from-red-950/10 dark:to-transparent hover:border-red-300 dark:hover:border-red-800 transition-all duration-300 hover:shadow-md">
                                    <div className="absolute inset-0 bg-linear-to-br from-red-50/50 to-transparent dark:from-red-900/10 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <CardHeader className="pb-3 pt-5">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-xs font-medium text-red-700 dark:text-red-400 uppercase tracking-wide">
                                                Open
                                            </CardTitle>
                                            <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/50">
                                                <AlertCircle className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pb-5">
                                        <div className="text-3xl font-bold text-red-700 dark:text-red-400">{openIssues}</div>
                                        <p className="text-xs text-red-600/80 dark:text-red-400/80 mt-1.5">Awaiting review</p>
                                    </CardContent>
                                </Card>

                                {/* In Progress Issues */}
                                <Card className="group relative overflow-hidden border-blue-200/60 dark:border-blue-900/40 bg-linear-to-br from-blue-50/30 to-transparent dark:from-blue-950/10 dark:to-transparent hover:border-blue-300 dark:hover:border-blue-800 transition-all duration-300 hover:shadow-md">
                                    <div className="absolute inset-0 bg-linear-to-br from-blue-50/50 to-transparent dark:from-blue-900/10 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <CardHeader className="pb-3 pt-5">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-xs font-medium text-blue-700 dark:text-blue-400 uppercase tracking-wide">
                                                In Progress
                                            </CardTitle>
                                            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                                                <Clock className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pb-5">
                                        <div className="text-3xl font-bold text-blue-700 dark:text-blue-400">{inProgressIssues}</div>
                                        <p className="text-xs text-blue-600/80 dark:text-blue-400/80 mt-1.5">Being resolved</p>
                                    </CardContent>
                                </Card>

                                {/* Resolved Issues */}
                                <Card className="group relative overflow-hidden border-green-200/60 dark:border-green-900/40 bg-linear-to-br from-green-50/30 to-transparent dark:from-green-950/10 dark:to-transparent hover:border-green-300 dark:hover:border-green-800 transition-all duration-300 hover:shadow-md">
                                    <div className="absolute inset-0 bg-linear-to-br from-green-50/50 to-transparent dark:from-green-900/10 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <CardHeader className="pb-3 pt-5">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-xs font-medium text-green-700 dark:text-green-400 uppercase tracking-wide">
                                                Resolved
                                            </CardTitle>
                                            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/50">
                                                <CheckCircle2 className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pb-5">
                                        <div className="text-3xl font-bold text-green-700 dark:text-green-400">{resolvedIssues}</div>
                                        <p className="text-xs text-green-600/80 dark:text-green-400/80 mt-1.5">Completed</p>
                                    </CardContent>
                                </Card>
                            </div>
                        </section>
                    )}

                    {/* ===== SESSION INFORMATION (Collapsed Design) ===== */}
                    {uid && (
                        <section>
                            <details className="group">
                                <summary className="cursor-pointer list-none">
                                    <Card className="border-blue-200/60 dark:border-blue-900/40 bg-linear-to-br from-blue-50/40 to-slate-50/20 dark:from-blue-950/20 dark:to-slate-950/10 hover:border-blue-300 dark:hover:border-blue-800 transition-all duration-200">
                                        <CardContent className="py-4 px-5">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                                                        <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-foreground">Session Information</p>
                                                        <p className="text-xs text-muted-foreground">Tap to view session ID</p>
                                                    </div>
                                                </div>
                                                <div className="text-xs text-muted-foreground group-open:rotate-180 transition-transform">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </summary>
                                <div className="mt-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <Card className="border-blue-200/60 dark:border-blue-900/40">
                                        <CardContent className="pt-5 pb-5">
                                            <div className="space-y-3">
                                                <div>
                                                    <p className="text-xs font-medium text-muted-foreground mb-2">Your Session ID</p>
                                                    <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                                                        <p className="text-xs font-mono text-foreground/80 break-all leading-relaxed">
                                                            {uid}
                                                        </p>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-muted-foreground leading-relaxed">
                                                    This unique identifier links your issues to your current session.
                                                    Keep this session active to maintain access.
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </details>
                        </section>
                    )}

                    {/* ===== MAIN CONTENT SECTION ===== */}
                    <section className="space-y-4">
                        {totalIssues === 0 ? (
                            /* ===== EMPTY STATE - Welcoming & Encouraging ===== */
                            <Card className="border-dashed border-2 border-muted-foreground/20 bg-linear-to-b from-muted/30 to-background">
                                <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16 px-6">
                                    <div className="relative mb-6">
                                        {/* Decorative background circle */}
                                        <div className="absolute inset-0 bg-linear-to-br from-primary/10 to-primary/5 rounded-full blur-2xl scale-150" />
                                        {/* Icon container */}
                                        <div className="relative p-6 rounded-2xl bg-linear-to-br from-muted/80 to-muted/40 border border-border/50 shadow-sm">
                                            <Sparkles className="w-12 h-12 sm:w-14 sm:h-14 text-primary/70" />
                                        </div>
                                    </div>

                                    <div className="text-center space-y-3 max-w-md">
                                        <h3 className="text-2xl sm:text-3xl font-bold text-foreground">
                                            You&apos;re All Set
                                        </h3>
                                        <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                                            No issues reported yet. When you need assistance,
                                            we&apos;ll be here to help you right away.
                                        </p>
                                    </div>

                                    {/* Feature badges */}
                                    <div className="mt-8 flex flex-wrap gap-2 justify-center max-w-lg">
                                        <Badge variant="secondary" className="px-4 py-2 text-xs font-medium bg-muted/80 hover:bg-muted border-border/40">
                                            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-green-600 dark:text-green-500" />
                                            Fast Response
                                        </Badge>
                                        <Badge variant="secondary" className="px-4 py-2 text-xs font-medium bg-muted/80 hover:bg-muted border-border/40">
                                            <Clock className="w-3.5 h-3.5 mr-1.5 text-blue-600 dark:text-blue-500" />
                                            24/7 Support
                                        </Badge>
                                        <Badge variant="secondary" className="px-4 py-2 text-xs font-medium bg-muted/80 hover:bg-muted border-border/40">
                                            <TrendingUp className="w-3.5 h-3.5 mr-1.5 text-purple-600 dark:text-purple-500" />
                                            Live Tracking
                                        </Badge>
                                    </div>

                                    <p className="mt-8 text-xs text-muted-foreground/70">
                                        Click &quot;Add Issue&quot; above to submit your first request
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            /* ===== ISSUES LIST - Clean & Organized ===== */
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <div className="h-1 w-12 bg-linear-to-r from-primary to-primary/40 rounded-full" />
                                    <h2 className="text-lg font-semibold text-foreground">Your Requests</h2>
                                </div>

                                <Card className="border-border/60 shadow-sm">
                                    <CardHeader className="border-b bg-muted/30 pb-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-primary/10">
                                                    <TrendingUp className="h-5 w-5 text-primary" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-lg font-semibold">
                                                        Issue History
                                                    </CardTitle>
                                                    <p className="text-xs text-muted-foreground mt-0.5">
                                                        Tracking all your submissions
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="w-fit px-3 py-1 text-xs font-semibold border-primary/30 text-primary">
                                                {totalIssues} {totalIssues === 1 ? 'Issue' : 'Issues'}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-6 pb-6">
                                        <IssuesList issues={userIssues} />
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </section>

                    {/* ===== FOOTER SECTION ===== */}
                    <section className="pt-4">
                        <GuestDashboardFooter />
                    </section>
                </div>
            </div>
        </Suspense>
    );
}

export default GuestDashboard;