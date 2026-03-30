import { Skeleton } from "@/components/ui/skeleton"
import { Sparkles } from "lucide-react"

const DashboardLayoutSkeleton = () => {
    return (
        <div className="min-h-screen bg-background flex w-full mt-24">
            {/* Sidebar Skeleton — mirrors exact AppSidebar structure */}
            <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 z-40 flex-col bg-sidebar">

                {/* Logo section */}
                <div className="p-6 border-b border-sidebar-border">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-gold flex items-center justify-center shrink-0">
                            <Sparkles className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-16" />
                        </div>
                    </div>
                </div>

                {/* User info card */}
                <div className="p-4 mx-4 mt-4 rounded-xl bg-sidebar-accent">
                    <div className="flex items-center gap-3">
                        <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                            <Skeleton className="h-3.5 w-28" />
                            <Skeleton className="h-3 w-14" />
                        </div>
                    </div>
                </div>

                {/* Nav links */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    <Skeleton className="h-3 w-20 mx-3 mb-3" />
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-lg">
                            <Skeleton className="h-5 w-5 rounded shrink-0" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                    ))}
                </nav>

                {/* Sign out */}
                <div className="p-4 border-t border-sidebar-border">
                    <div className="flex items-center gap-3 px-3 py-2">
                        <Skeleton className="h-5 w-5 rounded shrink-0" />
                        <Skeleton className="h-4 w-16" />
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 lg:ml-64">
                {/* Header */}
                <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {/* Mobile menu button placeholder */}
                            <div className="lg:hidden w-9 h-9 rounded-lg bg-primary/10" />
                            <div className="hidden sm:flex flex-col gap-1">
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

                {/* Page content */}
                <div className="p-4 lg:p-8 space-y-6">
                    <div className="space-y-2">
                        <Skeleton className="h-7 w-48" />
                        <Skeleton className="h-4 w-72" />
                    </div>

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