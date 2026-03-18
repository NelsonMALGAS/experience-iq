"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Check, Loader2, Building2, ArrowRight } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BillingInterval, isDevelopment, PRICE_PLANS } from "@/constants";
import useCurrentUser from "@/hooks/useCurrentUser";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";


type PricingProps = {
    needsPayment?: boolean
    uid: string
}

export default function Pricing({ needsPayment, uid }: PricingProps) {
    const [billing, setBilling] = useState<BillingInterval>("monthly");
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
    const { currentUser } = useCurrentUser();

    const yearlyDiscountLabel = useMemo(() => "Save 20%", []);

    const formatPrice = (price: number) => price.toLocaleString("en-ZA");

    const handleSubscribe = async (planId: string) => {
        if (!currentUser?.email || !currentUser?.uid) {
            toast.error("🚨 Error", { description: "Please sign in to subscribe" });
            return;
        }

        const selectedPlan = PRICE_PLANS.find((p) => p.id === planId);

        if (!selectedPlan) {
            toast.error("🚨 Error", { description: "Invalid plan selected" });
            return;
        }

        const selectedPricing =
            billing === "monthly"
                ? selectedPlan.pricing.monthly
                : selectedPlan.pricing.yearly;

        if (!selectedPricing?.priceId || !selectedPricing?.planCode) {
            toast.error("🚨 Error", { description: "Pricing configuration error" });
            return;
        }

        setLoadingPlan(planId);

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_URL}/api/paystack/initialize`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: currentUser.email,
                        userId: uid,
                        planId: selectedPlan.id,
                        billingInterval: billing,
                        priceId: selectedPricing.priceId,
                        planCode: selectedPricing.planCode,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to initialize payment");
            }

            window.location.href = data.authorizationUrl;
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Failed to start subscription"
            );
            setLoadingPlan(null);
        }
    };

    return (
        <div className="min-h-screen bg-background py-20 px-4">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
                        {needsPayment
                            ? "Reactivate Your Subscription"
                            : "Simple, Transparent Pricing"}
                    </h1>
                    <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
                        {needsPayment
                            ? "Choose a plan to continue accessing all features."
                            : "Flexible pricing built for modern hospitality operations."}
                    </p>
                </div>

                {/* Test Mode Alert */}
                {isDevelopment && (
                    <div className="max-w-3xl mx-auto mb-8">
                        <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg border border-amber-700/30 bg-amber-500/10">
                            <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                            <p className="text-sm text-amber-700 dark:text-amber-400 leading-snug">
                                Test mode — no real charges will be made. Payments run through a sandbox environment.
                            </p>
                        </div>
                    </div>
                )}

                {/* Billing Toggle */}
                <div className="flex justify-center mb-10">
                    <div className="inline-flex items-center gap-1 rounded-full bg-muted p-1">
                        <Button
                            variant={billing === "monthly" ? "default" : "ghost"}
                            onClick={() => setBilling("monthly")}
                            className="rounded-full px-6"
                        >
                            Monthly
                        </Button>

                        <Button
                            variant={billing === "yearly" ? "default" : "ghost"}
                            onClick={() => setBilling("yearly")}
                            className="rounded-full px-6 flex items-center gap-2"
                        >
                            Yearly
                            <Badge variant="secondary" className="text-xs">
                                {yearlyDiscountLabel}
                            </Badge>
                        </Button>
                    </div>
                </div>

                {/* Pricing Grid */}
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                    {PRICE_PLANS.map((plan) => {
                        const isPro = plan.id === "pro";
                        const currentPricing = plan.pricing[billing];
                        const isLoading = loadingPlan === plan.id;

                        return (
                            <Card
                                key={plan.id}
                                className={cn(
                                    "relative flex flex-col h-full rounded-2xl border bg-card transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl",
                                    isPro && "border-primary shadow-xl scale-[1.02]"
                                )}
                            >
                                {isPro && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                        <Badge>Most Popular</Badge>
                                    </div>
                                )}

                                <CardHeader className="pb-3 space-y-2">
                                    <CardTitle className="text-xl font-semibold">
                                        {plan.title}
                                    </CardTitle>
                                    <CardDescription className="text-sm leading-relaxed line-clamp-2">
                                        {plan.description}
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="flex flex-col flex-1 gap-6 pt-0">
                                    {/* Price */}
                                    <div>
                                        <div className="flex items-end gap-2">
                                            <span className="text-4xl font-bold tracking-tight">
                                                R{formatPrice(currentPricing.price)}
                                            </span>
                                            <span className="text-sm text-muted-foreground mb-1">
                                                /{billing === "monthly" ? "month" : "year"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Features */}
                                    <div className="flex-1">
                                        <ul className="space-y-2.5 min-h-50">
                                            {plan.info.map((feature, index) => (
                                                <li key={index} className="flex items-start gap-2.5">
                                                    <div className="mt-0.5 rounded-full bg-primary/10 p-1 shrink-0">
                                                        <Check className="h-3.5 w-3.5 text-primary" />
                                                    </div>
                                                    <span className="text-sm text-muted-foreground leading-snug">
                                                        {feature}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* CTA */}
                                    <div className="mt-auto pt-4">
                                        <Button
                                            size="lg"
                                            variant={isPro ? "default" : "secondary"}
                                            className="w-full rounded-xl"
                                            onClick={() => handleSubscribe(plan.id)}
                                            disabled={isLoading || !!loadingPlan}
                                        >
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Processing...
                                                </>
                                            ) : (
                                                <>{needsPayment ? "Reactivate" : "Subscribe"}</>
                                            )}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Custom / Enterprise CTA */}
                <div className="mt-10 rounded-2xl border border-border bg-muted/40 px-6 py-8 sm:px-10 sm:py-10">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-10">

                        {/* Icon */}
                        <div className="shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-primary" />
                        </div>

                        {/* Text */}
                        <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-foreground">
                                Managing more than 12 properties?
                            </h3>
                            <p className="mt-1 text-sm text-muted-foreground leading-relaxed max-w-xl">
                                Our standard plans go up to 12 properties. If your organisation
                                needs more — whether it&apos;s 20, 50, or across multiple
                                regions — we&apos;ll build a plan around your exact footprint,
                                team size, and billing preferences.
                            </p>

                            {/* What you get */}
                            <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
                                {[
                                    "Unlimited properties",
                                    "Custom staff limits",
                                    "Dedicated account manager",
                                    "Invoice billing available",
                                    "SLA configurations per property",
                                ].map((item) => (
                                    <li key={item} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* CTA Button */}
                        <div className="shrink-0">
                            <Button asChild size="lg" className="rounded-xl gap-2 w-full sm:w-auto">
                                <Link href="/contact">
                                    Contact ExperienceIQ
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}