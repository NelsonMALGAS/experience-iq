"use client";

import Image from "next/image";
import Link from "next/link";
import { AlertCircle, CreditCard, Mail, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type SubscriptionBannerProps = {
    type: "admin" | "staff";
};

export const SubscriptionBanner = ({ type }: SubscriptionBannerProps) => {
    return (
        <div className="fixed inset-0 z-1000 flex items-center justify-center px-4">
            {/* Overlay */}
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />

            {/* Modal */}
            <Card className="relative z-1001 w-full max-w-3xl rounded-2xl border shadow-2xl">
                <CardContent className="p-6">

                    <div className="grid md:grid-cols-[auto,1fr] gap-6 items-start">

                        {/* Icon */}
                        <div
                            className={`rounded-xl p-4 flex items-center justify-center shrink-0
                            ${type === "admin"
                                    ? "bg-destructive/10"
                                    : "bg-amber-500/10"
                                }`}
                        >
                            {type === "admin" ? (
                                <CreditCard className="h-6 w-6 text-destructive" />
                            ) : (
                                <AlertCircle className="h-6 w-6 text-amber-500" />
                            )}
                        </div>

                        {/* Content */}
                        <div className="space-y-4 text-center flex flex-col items-center">

                            {/* Logo */}
                            <Image
                                src="/images/experienceIQ.png"
                                alt="ExperienceIQ Logo"
                                width={150}
                                height={40}
                                priority
                            />

                            {/* Title */}
                            <h2 className="text-xl font-semibold">
                                {type === "admin"
                                    ? "Workspace Access Required"
                                    : "Limited Platform Access"}
                            </h2>

                            {/* Description */}
                            <p className="text-sm text-muted-foreground">
                                {type === "admin"
                                    ? "Access to this workspace requires an active subscription. If you are the workspace owner, you can update the subscription below."
                                    : "Your administrator’s workspace subscription is currently inactive, which limits access to some features."}
                            </p>

                            {/* Admin Info */}
                            {type === "admin" && (
                                <div className="flex gap-2 rounded-lg border bg-muted/40 p-3">
                                    <Info className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                    <p className="text-xs text-muted-foreground">
                                        If another admin invited you to manage a property,
                                        you may not need a subscription. Check your invitations
                                        and accept the workspace invite to gain access.
                                    </p>
                                </div>
                            )}

                            {/* Actions */}
                            {type === "admin" && (
                                <div className="flex flex-wrap gap-3 pt-2">
                                    <Button asChild variant="destructive">
                                        <Link href="/payment">
                                            Update Subscription
                                        </Link>
                                    </Button>

                                    <Button asChild variant="outline">
                                        <Link href="/admin/invitations">
                                            <Mail className="mr-2 h-4 w-4" />
                                            Check Invitations
                                        </Link>
                                    </Button>
                                </div>
                            )}

                            {type === "staff" && (
                                <Button asChild variant="secondary">
                                    <Link href="#">
                                        Contact Administrator
                                    </Link>
                                </Button>
                            )}

                        </div>
                    </div>

                </CardContent>
            </Card>
        </div>
    );
};