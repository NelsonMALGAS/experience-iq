import { fetchPropertyByIdWithStats } from "@/app/optimised-actions/properties";
import BackButton from "@/components/BackButton";
import { baseKeywords, baseUrl, sharedMetadata } from "@/constants/sharedMetadata";
import { Metadata } from "next";
import {
    FileSearch,
    BedDouble,
    AlertTriangle,
    CheckCircle2,
    CircleDot,
    Layers,
} from "lucide-react";

import { RoomsSection } from "@/components/properties/room/RoomsSection";
import PropertyDetailsIssueList from "@/components/properties/PropertyDetailsIssueList";

export type PropertyDetailsPageProps = {
    params: Promise<{ id: string }>;
};

export async function generateMetadata(
    { params }: PropertyDetailsPageProps,
): Promise<Metadata> {
    const { id } = await params;

    try {
        const { property } = await fetchPropertyByIdWithStats(id);

        if (!property) {
            return {
                ...sharedMetadata,
                title: "Property Not Found – ExperienceIQ",
                description: "The requested property could not be found.",
                keywords: [
                    ...baseKeywords,
                    "admin property details",
                    "property management",
                    "property reassignment",
                    "administrative controls",
                    "property analytics",
                ],
            };
        }

        const title = `${property.name} – ExperienceIQ`;
        const description = `View detailed information for ${property.name}. Track room status, guest check-ins, and administrative controls.`;

        return {
            ...sharedMetadata,
            title,
            description,
            keywords: [
                ...baseKeywords,
                "property details",
                "room management",
                "guest tracking",
                "check-in check-out",
                "admin dashboard",
            ],
            openGraph: {
                title,
                description,
                url: `${baseUrl}/admin/properties/${id}`,
                siteName: "ExperienceIQ",
                images: [
                    {
                        url: "og-image.png",
                        width: 1200,
                        height: 630,
                        alt: "Property Details and Resolution",
                    },
                ],
                locale: "en_US",
                type: "website",
            },
            twitter: {
                card: "summary_large_image",
                title,
                description,
                images: ["/og-image.png", "/twitter-card.png"],
                creator: "@ExperienceIQ",
            },
        };
    } catch {
        return {
            ...sharedMetadata,
            title: "Property Details – ExperienceIQ",
            description:
                "View detailed information about a guest property and track resolution progress.",
            keywords: [...baseKeywords, "property details"],
        };
    }
}


type StatCardProps = {
    label: string;
    value: number | string;
    icon: React.ReactNode;
    accent?: "default" | "blue" | "emerald" | "red" | "amber";
};


const accentMap: Record<NonNullable<StatCardProps["accent"]>, string> = {
    default: "bg-muted text-muted-foreground",
    blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    red: "bg-red-500/10 text-red-600 dark:text-red-400",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

function StatCard({ label, value, icon, accent = "default" }: StatCardProps) {
    return (
        <div className="rounded-xl border bg-card p-5 space-y-3 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground font-medium">{label}</p>
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${accentMap[accent]}`}>
                    {icon}
                </div>
            </div>
            <p className="text-3xl font-bold tracking-tight text-foreground">{value}</p>
        </div>
    );
}

// ─── Room Summary Pills ───────────────────────────────────────────────────────

function RoomSummaryPills({ rooms }: { rooms: { status: string }[] }) {
    const available = rooms.filter((r) => r.status === "available").length;
    const occupied = rooms.filter((r) => r.status === "occupied").length;
    const maintenance = rooms.filter((r) => r.status === "maintenance").length;

    return (
        <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {available} Available
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-400">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                {occupied} Occupied
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                {maintenance} Maintenance
            </span>
        </div>
    );
}


const PropertyDetailsPage = async ({ params }: PropertyDetailsPageProps) => {
    const { id } = await params;
    const { property, issues } = await fetchPropertyByIdWithStats(id);

    if (!property) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] px-6 mt-24 animate-fade-in">
                <div className="w-full max-w-md rounded-2xl border bg-card text-card-foreground shadow-sm p-8 text-center space-y-5">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                        <FileSearch className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                        <h2 className="text-xl font-semibold tracking-tight text-foreground">
                            Property Not Found
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            We couldn&apos;t find a property with this ID.
                        </p>
                    </div>
                    <div className="text-xs text-muted-foreground border rounded-md px-3 py-2 bg-muted/40 font-mono">
                        {id}
                    </div>
                    <div className="flex justify-center">
                        <BackButton label="Back to Properties" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Please check the ID or navigate back to the dashboard.
                    </p>
                </div>
            </div>
        );
    }

    const totalRooms = property.rooms.length;
    const availableRooms = property.rooms.filter((r) => r.status === "available").length;
    const occupancyRate =
        totalRooms > 0
            ? Math.round(
                (property.rooms.filter((r) => r.status === "occupied").length / totalRooms) * 100
            )
            : 0;



    return (
        <div className="p-6 space-y-8 mt-24 animate-fade-in max-w-screen-2xl mx-auto">

            {/* ── Header ── */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <BackButton label="Back to Properties" />
                    <span className="text-xs text-muted-foreground font-mono hidden sm:block">
                        {id?.slice(0, 8)}…
                    </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <h1 className="text-3xl font-bold tracking-tight text-foreground">
                                {property.name}
                            </h1>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {property.location || "No location set"} · {totalRooms} rooms
                        </p>
                    </div>

                    {/* Occupancy pill */}
                    <div className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-sm">
                        <span className="text-muted-foreground">Occupancy</span>
                        <span className="font-semibold text-foreground">{occupancyRate}%</span>
                    </div>
                </div>
            </div>

            {/* ── Stats ── */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    label="Total Issues"
                    value={issues?.length || 0}
                    icon={<Layers className="h-4 w-4" />}
                    accent="default"
                />
                <StatCard
                    label="Open Issues"
                    value={issues?.filter((i) => i.status === "open").length || 0}
                    icon={<CircleDot className="h-4 w-4" />}
                    accent="blue"
                />
                <StatCard
                    label="Resolved"
                    value={issues?.filter((i) => i.status === "resolved").length || 0}
                    icon={<CheckCircle2 className="h-4 w-4" />}
                    accent="emerald"
                />
                <StatCard
                    label="Critical Priority"
                    value={issues?.filter((i) => i.priority === "critical").length || 0}
                    icon={<AlertTriangle className="h-4 w-4" />}
                    accent="red"
                />
            </div>

            {/* ── Property Overview ── */}
            <div className="rounded-2xl border bg-card shadow-sm p-6 space-y-4">
                <h2 className="text-base font-semibold">Property Overview</h2>
                <div className="grid gap-6 sm:grid-cols-3">
                    <div className="space-y-1">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Location</p>
                        <p className="font-medium text-sm">{property.location || "—"}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Rooms</p>
                        <p className="font-medium text-sm">{totalRooms}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Available Now</p>
                        <p className="font-medium text-sm">{availableRooms}</p>
                    </div>
                </div>
            </div>

            {/* ── Rooms Management ── */}
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h2 className="text-base font-semibold flex items-center gap-2">
                            <BedDouble className="h-4 w-4 text-muted-foreground" />
                            Rooms Management
                        </h2>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Manage check-ins, check-outs and maintenance across all rooms.
                        </p>
                    </div>
                    {totalRooms > 0 && (
                        <RoomSummaryPills rooms={property.rooms} />
                    )}
                </div>

                {totalRooms === 0 ? (
                    <div className="rounded-xl border bg-muted/20 p-10 text-center text-sm text-muted-foreground">
                        No rooms have been added to this property yet.
                    </div>
                ) : (

                    <RoomsSection
                        rooms={property.rooms}
                        propertyId={property.id}
                    />

                )}
            </div>

            {/* ── Issues Section ── */}
            <div className="rounded-2xl border bg-card shadow-sm">
                <div className="p-6 border-b flex items-center justify-between">
                    <div>
                        <h2 className="text-base font-semibold">Recent Issues</h2>
                        <p className="text-sm text-muted-foreground">
                            A quick overview of reported issues
                        </p>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground bg-muted rounded-full px-2.5 py-1">
                        {issues?.length || 0} total
                    </span>
                </div>

                <PropertyDetailsIssueList issues={issues} />
            </div>
        </div>
    );
};

export default PropertyDetailsPage;