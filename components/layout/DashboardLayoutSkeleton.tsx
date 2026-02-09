import { Skeleton } from "@/components/ui/skeleton"
import { Menu } from "lucide-react"

const DashboardLayoutSkeleton = () => {
    return (
        <div className="min-h-screen bg-background flex w-full">
            {/* Sidebar Skeleton */}
            <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 border-r border-border bg-background p-4">
                <div className="space-y-4 w-full">
                    <Skeleton className="h-8 w-3/4" />
                    <div className="space-y-2">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Skeleton key={i} className="h-10 w-full rounded-lg" />
                        ))}
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 lg:ml-64">
                {/* Header Skeleton */}
                <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button className="lg:hidden p-2 rounded-lg">
                                <Menu className="h-5 w-5 text-muted-foreground" />
                            </button>
                            <div className="hidden sm:block space-y-1">
                                <Skeleton className="h-3 w-24" />
                                <Skeleton className="h-4 w-40" />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Skeleton className="h-9 w-9 rounded-full" />
                            <Skeleton className="h-9 w-9 rounded-full" />
                        </div>
                    </div>
                </header>

                {/* Page Content Skeleton */}
                <div className="p-4 lg:p-8 space-y-6">
                    <Skeleton className="h-8 w-1/3" />
                    <Skeleton className="h-4 w-1/2" />

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className="h-28 rounded-xl" />
                        ))}
                    </div>

                    <Skeleton className="h-64 rounded-xl" />
                </div>
            </main>
        </div>
    )
}

export default DashboardLayoutSkeleton