import { fetchPropertyByIdWithStats } from "@/app/optimised-actions/properties";
import BackButton from "@/components/BackButton";
import { baseKeywords, baseUrl, sharedMetadata } from "@/constants/sharedMetadata";
import { Metadata } from "next";
import { FileSearch } from "lucide-react";

export type PropertyDetailsPageProps = {
    params: Promise<{ id: string }>;
};

export async function generateMetadata(
    { params }: PropertyDetailsPageProps,
): Promise<Metadata> {
    const { id } = await params;

    try {
        const { property } = await fetchPropertyByIdWithStats(id)

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
                    "property analytics"
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

const PropertyDetailsPage = async ({ params }: PropertyDetailsPageProps) => {

    const { id } = await params;

    const { property, issues } = await fetchPropertyByIdWithStats(id)


    if (!property) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] px-6 mt-24 animate-fade-in">
                <div className="w-full max-w-md rounded-2xl border bg-card text-card-foreground shadow-sm p-8 text-center space-y-5">

                    {/* Icon */}
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                        <FileSearch className="h-6 w-6 text-muted-foreground" />
                    </div>

                    {/* Text */}
                    <div className="space-y-1">
                        <h2 className="text-xl font-semibold tracking-tight text-foreground">
                            Property Not Found
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            We couldn’t find a property with this ID.
                        </p>
                    </div>

                    {/* Property ID */}
                    <div className="text-xs text-muted-foreground border rounded-md px-3 py-2 bg-muted/40 font-mono">
                        {id}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-center">
                        <BackButton label="Back to Properties" />
                    </div>

                    {/* Hint */}
                    <p className="text-xs text-muted-foreground">
                        Please check the ID or navigate back to the dashboard.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-8 mt-24 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col gap-4">

                {/* Top row */}
                <div className="flex items-center justify-between">
                    <BackButton label="Back to Properties" />

                    {/* Optional subtle ID on the right */}
                    <span className="text-xs text-muted-foreground font-mono hidden sm:block">
                        {id?.slice(5)}...
                    </span>
                </div>

                {/* Title */}
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        {property.name}
                    </h1>
                    <p className="text-sm text-muted-foreground sm:hidden">
                        Property ID: <span className="font-mono">{id}</span>
                    </p>
                </div>
            </div>

            {/* Property Overview */}
            <div className="rounded-2xl border bg-card text-card-foreground shadow-sm p-6 space-y-4">
                <h2 className="text-lg font-semibold">Overview</h2>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Location</p>
                        <p className="font-medium">
                            {property.location || "—"}
                        </p>
                    </div>

                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Rooms</p>
                        <p className="font-medium">
                            {property.rooms.length ?? "—"}
                        </p>
                    </div>

                </div>
            </div>

            {/* Stats (Simple Visual Cards) */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border bg-card p-4">
                    <p className="text-sm text-muted-foreground">
                        Total Issues
                    </p>
                    <p className="text-2xl font-bold">
                        {issues?.length || 0}
                    </p>
                </div>

                <div className="rounded-xl border bg-card p-4">
                    <p className="text-sm text-muted-foreground">
                        Open Issues
                    </p>
                    <p className="text-2xl font-bold">
                        {issues?.filter(i => i.status === "open").length || 0}
                    </p>
                </div>

                <div className="rounded-xl border bg-card p-4">
                    <p className="text-sm text-muted-foreground">
                        Resolved
                    </p>
                    <p className="text-2xl font-bold">
                        {issues?.filter(i => i.status === "resolved").length || 0}
                    </p>
                </div>

                <div className="rounded-xl border bg-card p-4">
                    <p className="text-sm text-muted-foreground">
                        Critical Priority
                    </p>
                    <p className="text-2xl font-bold">
                        {issues?.filter(i => i.priority === "critical").length || 0}
                    </p>
                </div>
            </div>

            {/* Issues Section */}
            <div className="rounded-2xl border bg-card shadow-sm">
                <div className="p-6 border-b">
                    <h2 className="text-lg font-semibold">Recent Issues</h2>
                    <p className="text-sm text-muted-foreground">
                        A quick overview of reported issues
                    </p>
                </div>

                <div className="divide-y">
                    {issues?.length === 0 && (
                        <div className="p-6 text-sm text-muted-foreground">
                            No issues found for this property.
                        </div>
                    )}

                    {issues?.map((issue) => (
                        <div
                            key={issue.id}
                            className="p-6 flex flex-col gap-3 hover:bg-muted/40 transition-colors"
                        >
                            <div className="flex items-center justify-between gap-4">
                                <h3 className="font-medium text-foreground">
                                    {issue.title}
                                </h3>

                                <span className="text-xs px-2 py-1 rounded-md border bg-muted text-muted-foreground">
                                    {issue.status}
                                </span>
                            </div>

                            <p className="text-sm text-muted-foreground line-clamp-2">
                                {issue.description}
                            </p>

                            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                                <span>
                                    Room: {issue.roomNumber || "—"}
                                </span>
                                <span>
                                    Guest: {issue.guestName || "Anonymous"}
                                </span>
                                <span>
                                    Priority: {issue.priority}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default PropertyDetailsPage