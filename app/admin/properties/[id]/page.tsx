import { fetchPropertyByIdWithStats } from "@/app/optimised-actions/properties";
import { baseKeywords, baseUrl, sharedMetadata } from "@/constants/sharedMetadata";
import { Metadata } from "next";

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

    const { property } = await fetchPropertyByIdWithStats(id)

    if (!property) return <span>Property ID: {id} not found</span>

    return (
        <div className="p-6 space-y-6 animate-fade-in mt-24">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-3xl font-bold text-foreground">
                    Property Details
                </h1>
                <p className="text-muted-foreground text-sm">
                    Property ID: <span className="font-mono">{id}</span>
                </p>
            </div>

            {/* Card */}
            <div className="rounded-xl border bg-card shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4 text-foreground">
                    Raw Property Data
                </h2>

                <pre className="bg-muted/50 p-4 rounded-lg overflow-x-auto text-sm text-muted-foreground">
                    {JSON.stringify(property, null, 2)}
                </pre>
            </div>
        </div>
    )
}

export default PropertyDetailsPage