'use client';

import { AlertTriangle, LogIn } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function GuestDashboardFooter() {
    // const router = useRouter();

    const handleSignUp = () => {
        toast.info("Info", { description: "Guest can only sign up anonymously" })
        // router.push("/login?role=guest")
    };

    return (
        <Card className="bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-900">
            <CardContent className="pt-6 pb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="shrink-0">
                        <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                            <AlertTriangle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>

                    <div className="flex-1 space-y-2">
                        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200">
                            Want to keep your issues permanently?
                        </h3>
                        <p className="text-sm text-blue-800 dark:text-blue-300">
                            Create a permanent account to ensure you never lose access to your submitted issues.
                            With a regular account, you can track your issues across all devices and sessions.
                        </p>
                    </div>

                    <Button
                        onClick={handleSignUp}
                        className="gap-2 w-full sm:w-auto whitespace-nowrap shrink-0"
                        variant="default"
                    >
                        <LogIn className="w-4 h-4" />
                        Create Account
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}