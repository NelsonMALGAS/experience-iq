import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth, db } from '@/db/server';
import { Calendar, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Role } from '@/types';
import Link from 'next/link';
import { requireVerifiedUser } from '@/lib/verificationGuards';
import Unverified from '@/components/Unverified';
import { Metadata } from 'next';
import { baseKeywords, baseUrl, sharedMetadata } from '@/constants/sharedMetadata';
import { refreshShifts } from '@/app/optimised-actions';
import { Suspense } from 'react';
import { RosterContentSkeleton } from '@/components/skeletons/RosterContentSkeleton';
import RosterContent from '@/components/sections/RosterContent';
import { FormRefreshButton } from '@/components/RefreshButton';

export const metadata: Metadata = {
    title: "Roster – ExperienceIQ",
    description:
        "View your work schedule, shifts, and availability. Check assigned properties, time slots, and coordinate with team members for optimal coverage.",
    keywords: [
        ...baseKeywords,
        "staff roster",
        "work schedule",
        "shift management",
        "staff scheduling",
        "availability",
        "team coordination",
    ],
    ...sharedMetadata,
    openGraph: {
        title: "Staff Roster – ExperienceIQ",
        description:
            "View work schedule, shifts, and availability. Check assigned properties and coordinate with team members.",
        url: `${baseUrl}/staff/roster`,
        siteName: "ExperienceIQ",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "Staff Roster and Schedule",
            },
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Staff Roster – ExperienceIQ",
        description: "View work schedule and coordinate with team members.",
        images: ["/og-image.png", "/twitter-card.png"],
        creator: "@ExperienceIQ",
    },
}

const StaffRoster = async () => {
    const cookieStore = await cookies();
    const session = cookieStore?.get('_SESSION_')?.value;
    const role: Role = "staff";

    if (!session) redirect(`/login?role=${role}`);

    const decoded = await auth?.verifySessionCookie(session, true);

    if (!decoded) redirect(`/login?role=${role}`);

    const verificationResult = await requireVerifiedUser(session, role);
    const { uid, isVerified, canAccessData } = verificationResult;

    if (!uid) redirect(`/login?role=${role || "staff"}`);

    if (!canAccessData) {
        return <Unverified isVerified={isVerified} role={role} uid={uid} isOwner={undefined} />;
    }

    if (!auth || !db) throw new Error("Firebase admin not initialized");

    const userRecord = await auth.getUser(uid);
    const userRole = userRecord.customClaims?.role;

    if (userRole !== 'staff') {
        redirect(`/login?role=${role}`);
    }

    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
    const currentYear = currentDate.getFullYear();

    // 🚀 INSTANT shell renders immediately
    return (
        <div className="mt-16 sm:mt-20 min-h-screen bg-background px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
            <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
                {/* ✅ INSTANT: Back button renders with no await */}
                <div className="mb-4 sm:mb-6">
                    <Link href="/staff">
                        <Button variant="ghost" size="sm" className="flex items-center gap-2">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Dashboard
                        </Button>
                    </Link>
                </div>

                {/* ✅ INSTANT: Header renders immediately */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight flex items-center gap-2">
                            <Calendar className="w-6 h-6 sm:w-8 sm:h-8" />
                            My Shifts
                        </h1>
                        <p className="text-sm sm:text-base text-muted-foreground mt-1">
                            {currentMonth} {currentYear} Schedule
                        </p>
                    </div>

                    <form action={refreshShifts}>
                        <FormRefreshButton />
                    </form>
                </div>

                {/* 🚀 STREAMING: Content loads asynchronously */}
                <Suspense fallback={<RosterContentSkeleton />}>
                    <RosterContent uid={uid} />
                </Suspense>
            </div>
        </div>
    );
}

export default StaffRoster;