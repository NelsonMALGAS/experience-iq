'use client';

import { Sparkles, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import BackButton from '../BackButton';

export default function GuestDashboardHeader() {
    const router = useRouter();

    const handleRefresh = () => {
        router.refresh();
    };

    return (
        <div className="relative">
            {/* Decorative background gradient */}
            <div className="absolute inset-0 bg-linear-to-r from-primary/5 via-primary/3 to-transparent rounded-2xl blur-3xl -z-10" />

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 relative">
                {/* Left Section - Title and Description */}
                <div className="space-y-3">
                    {/* Icon and Title Row */}
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            {/* Animated gradient background */}
                            <div className="absolute inset-0 bg-linear-to-br from-primary/20 to-primary/5 rounded-xl blur-md animate-pulse" />
                            {/* Icon container */}
                            <div className="relative p-2.5 rounded-xl bg-linear-to-br from-primary/10 to-primary/5 border border-primary/20 shadow-sm">
                                <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
                            </div>
                        </div>

                        <div>
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight bg-linear-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                                My Service Requests
                            </h1>
                        </div>
                    </div>

                    {/* Subtitle with enhanced styling */}
                    <p className="text-muted-foreground text-sm sm:text-base max-w-2xl leading-relaxed pl-13 sm:pl-15">
                        Track and manage all your requests in one place
                    </p>

                    {/* Optional: Status indicator dots */}
                    <div className="flex items-center gap-3 pl-13 sm:pl-15">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-xs text-muted-foreground font-medium">Live tracking</span>
                        </div>
                        <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                            <span className="text-xs text-muted-foreground font-medium">Real-time updates</span>
                        </div>
                    </div>
                </div>

                {/* Right Section - Action Buttons */}
                <div className="flex items-center gap-2 sm:gap-3 sm:pb-1">
                    <Button
                        onClick={handleRefresh}
                        variant="outline"
                        className="group gap-2 h-11 px-4 border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 shadow-sm hover:shadow"
                    >
                        <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                        <span className="hidden sm:inline">Refresh</span>
                    </Button>
                    <BackButton label='Add New Request' />
                </div>
            </div>

            {/* Decorative divider */}
            <div className="mt-6 h-px bg-linear-to-r from-transparent via-border to-transparent" />
        </div>
    );
}