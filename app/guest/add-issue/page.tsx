import AddIssuePage from "@/components/issues/AddIssue"
import { baseKeywords, baseUrl, sharedMetadata } from "@/constants/sharedMetadata"
import { Metadata } from "next"


export const metadata: Metadata = {
    title: "Report Issue – ExperienceIQ",
    description:
        "Report a new service issue to hotel staff. Submit maintenance requests, housekeeping needs, or amenity issues with detailed descriptions and priority levels.",
    keywords: [
        ...baseKeywords,
        "report issue",
        "submit request",
        "maintenance request",
        "housekeeping request",
        "service request form",
        "guest complaints",
    ],
    ...sharedMetadata,
    openGraph: {
        title: "Report Issue – ExperienceIQ",
        description:
            "Report maintenance requests, housekeeping needs, or amenity issues with detailed descriptions and priority levels.",
        url: `${baseUrl}/guest/add-issue`,
        siteName: "ExperienceIQ",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "Report Issue to Hotel Staff",
            },
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Report Issue – ExperienceIQ",
        description:
            "Report maintenance requests, housekeeping needs, or amenity issues instantly.",
        images: ["/og-image.png", "/twitter-card.png"],
        creator: "@ExperienceIQ",
    },
}
const AddIssueDasboard = () => {
    return (
        <AddIssuePage />
    )
}

export default AddIssueDasboard