import Link from "next/link"
import { Button } from "../ui/button"
import { AlertCircle, ArrowLeft } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "../ui/alert"

export function ErrorState({ error }: { error: Error }) {
    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl mt-24">
            <Link href="/staff/issues">
                <Button variant="ghost" size="sm" className="mb-6">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Issues
                </Button>
            </Link>

            <Alert variant="destructive" className="max-w-2xl mx-auto">
                <AlertCircle className="h-5 w-5" />
                <AlertTitle className="text-lg font-semibold">Error Loading Issue</AlertTitle>
                <AlertDescription className="mt-2">
                    There was an error loading the issue details. Please try again later.
                    <div className="mt-4 text-xs font-mono bg-destructive/10 p-3 rounded">
                        {error.message}
                    </div>
                    <Link href="/staff/issues" className="block mt-4">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Return to Issues
                        </Button>
                    </Link>
                </AlertDescription>
            </Alert>
        </div>
    )
}

export function NotFoundState() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl mt-24">
            <Link href="/staff/issues">
                <Button variant="ghost" size="sm" className="mb-6">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Issues
                </Button>
            </Link>

            <Alert variant="destructive" className="max-w-2xl mx-auto">
                <AlertCircle className="h-5 w-5" />
                <AlertTitle className="text-lg font-semibold">Issue Not Found</AlertTitle>
                <AlertDescription className="mt-2">
                    The issue you&apos;re looking for doesn&apos;t exist or has been removed.
                    <Link href="/staff/issues" className="block mt-4">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Return to Issues
                        </Button>
                    </Link>
                </AlertDescription>
            </Alert>
        </div>
    )
}