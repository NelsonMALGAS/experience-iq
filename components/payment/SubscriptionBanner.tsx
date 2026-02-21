"use client";

import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, CreditCard } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type SubscriptionBannerProps = {
    type: "admin" | "staff";
};

export function SubscriptionBanner({ type }: SubscriptionBannerProps) {
    if (type === "admin") {
        return (
            <Card className="border-destructive bg-destructive/5 mb-6">
                <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4">
                    <div className="flex items-start gap-3">
                        <CreditCard className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
                        <div>
                            <h3 className="font-semibold text-foreground mb-1">
                                Subscription Required
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Your subscription is inactive or expired. Please update your payment information to regain full access.
                            </p>
                        </div>
                    </div>
                    <Button asChild variant="destructive" className="shrink-0">
                        <Link href="/payment">
                            Update Payment
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-warning bg-warning/5 mb-6">
            <CardContent className="flex items-start gap-3 py-4">
                <AlertCircle className="h-5 w-5 text-warning mt-0.5 shrink-0" />
                <div>
                    <h3 className="font-semibold text-foreground mb-1">
                        Limited Access
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Your administrator&apos;s subscription is inactive or expired. Some features may be restricted. Please contact your administrator to resolve this issue.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}