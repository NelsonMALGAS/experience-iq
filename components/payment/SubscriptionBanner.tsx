"use client";

import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, CreditCard } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type SubscriptionBannerProps = {
    type: "admin" | "staff";
};

export const SubscriptionBanner = ({ type }: SubscriptionBannerProps) => {
    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center">
            {/* 🔒 Blur + interaction blocker */}
            <div className="absolute inset-0 bg-background/60 backdrop-blur-sm pointer-events-auto" />

            {/* 🔒 Centered modal-style banner */}
            <div className="relative z-101 w-full max-w-lg px-4">
                {type === "admin" ? (
                    <Card className="border-destructive shadow-xl">
                        <CardContent className="flex flex-col gap-4 py-6">
                            <div className="flex items-start gap-3">
                                <CreditCard className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
                                <div>
                                    <h3 className="font-semibold text-foreground mb-1">
                                        Subscription Required
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Your subscription is inactive or expired. Please update
                                        your payment information to regain full access.
                                    </p>
                                </div>
                            </div>

                            <Button asChild variant="destructive" className="w-full">
                                <Link href="/payment">Update Payment</Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="border-warning shadow-xl">
                        <CardContent className="flex flex-col gap-4 py-6">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 text-warning mt-0.5 shrink-0" />
                                <div>
                                    <h3 className="font-semibold text-foreground mb-1">
                                        Limited Access
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Your administrator&apos;s subscription is inactive or
                                        expired. Please contact your administrator to resolve this
                                        issue.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}