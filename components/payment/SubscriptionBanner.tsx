"use client";

import Image from "next/image";
import Link from "next/link";
import { AlertCircle, CreditCard } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type SubscriptionBannerProps = {
    type: "admin" | "staff";
};

export const SubscriptionBanner = ({ type }: SubscriptionBannerProps) => {
    return (
        <div className="fixed inset-0 z-1000 flex items-center justify-center px-4">
            {/* Overlay */}
            <div className="absolute inset-0 bg-background/70 backdrop-blur-md transition-opacity" />

            {/* Modal */}
            <Card className="relative z-1001 w-full max-w-md rounded-2xl shadow-2xl border border-border animate-in fade-in zoom-in-95 duration-200">
                <CardContent className="p-8 space-y-6">
                    {/* Logo */}
                    <div className="flex justify-center">
                        <Image
                            src="/images/experienceIQ.png"
                            alt="ExperienceIQ Logo"
                            width={140}
                            height={40}
                            priority
                            className="object-contain"
                        />
                    </div>

                    {/* Icon + Title */}
                    <div className="flex flex-col items-center text-center space-y-3">
                        <div
                            className={`flex items-center justify-center rounded-full p-3 ${type === "admin"
                                    ? "bg-destructive/10"
                                    : "bg-warning/10"
                                }`}
                        >
                            {type === "admin" ? (
                                <CreditCard className="h-6 w-6 text-destructive" />
                            ) : (
                                <AlertCircle className="h-6 w-6 text-warning" />
                            )}
                        </div>

                        <h2 className="text-xl font-semibold text-foreground">
                            {type === "admin"
                                ? "Subscription Required"
                                : "Limited Access"}
                        </h2>

                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {type === "admin"
                                ? "Your subscription is inactive or has expired. To continue managing properties and accessing analytics, please update your payment details."
                                : "Your administrator's subscription is currently inactive or expired. Some features are restricted. Please contact your administrator for assistance."}
                        </p>
                    </div>

                    {/* Actions */}
                    {type === "admin" && (
                        <div className="pt-2">
                            <Button
                                asChild
                                size="lg"
                                variant="destructive"
                                className="w-full rounded-xl"
                            >
                                <Link href="/payment">
                                    Update Subscription
                                </Link>
                            </Button>

                            <p className="text-xs text-muted-foreground text-center mt-3">
                                Need help? Contact support for assistance.
                            </p>
                        </div>
                    )}

                    {type === "staff" && (
                        <div className="pt-2">
                            <Button
                                asChild
                                size="lg"
                                variant="secondary"
                                className="w-full rounded-xl"
                            >
                                <Link href="#">
                                    Contact Administrator
                                </Link>
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};