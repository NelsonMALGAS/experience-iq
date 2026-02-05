'use client';

import { UserX, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function GuestDashboardHeader() {
    const router = useRouter();

    const handleRefresh = () => {
        router.refresh();
    };

    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight flex items-center gap-3">
                    <UserX className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
                    My Issues
                </h1>
                <p className="text-muted-foreground text-sm sm:text-base">
                    View and track your submitted issues
                </p>
            </div>

            <Button onClick={handleRefresh} variant="outline" className="gap-2 w-full sm:w-auto">
                <RefreshCw className="w-4 h-4" />
                Refresh
            </Button>
        </div>
    );
}