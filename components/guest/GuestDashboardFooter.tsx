'use client';

import { Shield, ArrowRight, CheckCircle2, Clock, Smartphone } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function GuestDashboardFooter() {
    const handleSignUp = () => {
        toast.info("Account Creation", {
            description: "Guest users can only sign in anonymously.",
            duration: 6000
        });
    };

    return (
        <div className="relative">
            {/* Decorative gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/3 to-transparent rounded-2xl blur-2xl -z-10" />

            <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background shadow-lg">
                {/* Subtle pattern overlay */}
                <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,transparent,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,transparent,rgba(255,255,255,0.1))]" />

                <CardContent className="relative pt-8 pb-8 px-6 sm:px-8">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
                        {/* Icon Section */}
                        <div className="shrink-0">
                            <div className="relative">
                                {/* Animated background glow */}
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary/10 rounded-2xl blur-xl animate-pulse" />
                                {/* Icon container */}
                                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center shadow-lg">
                                    <Shield className="w-8 h-8 text-primary" />
                                </div>
                            </div>
                        </div>

                        {/* Content Section */}
                        <div className="flex-1 space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                                        Unlock Full Access
                                    </h3>
                                    <Badge
                                        variant="secondary"
                                        className="bg-primary/10 text-primary border-primary/20 text-xs font-semibold px-2.5 py-0.5"
                                    >
                                        Recommended
                                    </Badge>
                                </div>
                                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl">
                                    Create a permanent account to access your requests from any device, receive instant notifications,
                                    and never lose track of your service history.
                                </p>
                            </div>

                            {/* Features Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="flex items-center gap-2 text-sm">
                                    <div className="p-1 rounded-md bg-green-100 dark:bg-green-900/30">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                                    </div>
                                    <span className="text-muted-foreground font-medium">Persistent history</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <div className="p-1 rounded-md bg-blue-100 dark:bg-blue-900/30">
                                        <Smartphone className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <span className="text-muted-foreground font-medium">Multi-device sync</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <div className="p-1 rounded-md bg-purple-100 dark:bg-purple-900/30">
                                        <Clock className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <span className="text-muted-foreground font-medium">Priority support</span>
                                </div>
                            </div>
                        </div>

                        {/* CTA Button */}
                        <Button
                            onClick={handleSignUp}
                            size="lg"
                            className="group gap-2 w-full lg:w-auto whitespace-nowrap shrink-0 shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
                        >
                            <span className="font-semibold">Create Account</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                        </Button>
                    </div>

                    {/* Bottom note */}
                    <div className="mt-6 pt-6 border-t border-border/50">
                        <p className="text-xs text-muted-foreground text-center sm:text-left">
                            ✨ Takes less than 30 seconds • No credit card required • Free forever
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}