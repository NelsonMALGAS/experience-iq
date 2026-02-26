"use client";

import { useMemo, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BillingInterval, PRICE_PLANS } from "@/constants";
import useCurrentUser from "@/hooks/useCurrentUser";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function Pricing({ needsPayment }: { needsPayment?: boolean }) {
    const [billing, setBilling] = useState<BillingInterval>("monthly");
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
    const { currentUser } = useCurrentUser();

    const yearlyDiscountLabel = useMemo(() => "Save 20%", []);

    const formatPrice = (price: number) => price.toLocaleString("en-ZA");

    const handleSubscribe = async (planId: string) => {
        if (!currentUser?.email || !currentUser?.uid) {
            toast.error("Please sign in to subscribe");
            return;
        }

        const selectedPlan = PRICE_PLANS.find((p) => p.id === planId);

        if (!selectedPlan) {
            toast.error("Invalid plan selected");
            return;
        }

        const selectedPricing = selectedPlan.pricing[billing];

        console.log(selectedPricing, "SELECTED_PRICING")
        setLoadingPlan(planId);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/paystack/initialize`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: currentUser.email,
                    userId: currentUser.uid,
                    planId: selectedPlan.id,
                    billingInterval: billing,
                    priceId: selectedPricing.priceId,     // ✅ sending priceId
                    planCode: selectedPricing.planCode,   // ✅ sending Paystack planCode
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to initialize payment");
            }

            window.location.href = data.authorizationUrl;
        } catch (error) {
            console.error("Subscription error:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Failed to start subscription"
            );
            setLoadingPlan(null);
        }
    };

    return (
        <div className="min-h-screen bg-background py-24 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
                        {needsPayment
                            ? "Reactivate Your Subscription"
                            : "Simple, Transparent Pricing"}
                    </h1>
                    <p className="mt-5 text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
                        {needsPayment
                            ? "Choose a plan to continue accessing all features."
                            : "Flexible pricing built for modern hospitality operations."}
                    </p>
                </div>

                {/* Billing Toggle */}
                <div className="flex justify-center mb-16">
                    <div className="inline-flex items-center rounded-full bg-muted p-1">
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
                <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4 items-stretch">
                    {PRICE_PLANS.map((plan) => {
                        const isPro = plan.id === "pro";
                        const currentPricing = plan.pricing[billing];
                        const isLoading = loadingPlan === plan.id;

                        return (
                            <Card
                                key={plan.id}
                                className={cn(
                                    "relative flex flex-col rounded-2xl border bg-card transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl",
                                    isPro && "border-primary shadow-xl scale-[1.02]"
                                )}
                            >
                                {isPro && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                        <Badge>Most Popular</Badge>
                                    </div>
                                )}

                                <CardHeader className="pb-4 space-y-3">
                                    <CardTitle className="text-xl font-semibold">
                                        {plan.title}
                                    </CardTitle>
                                    <CardDescription className="leading-relaxed">
                                        {plan.description}
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="flex flex-col gap-8 pt-2">
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
                                    <ul className="space-y-3">
                                        {plan.info.map((feature, index) => (
                                            <li key={index} className="flex items-start gap-3">
                                                <div className="mt-1 rounded-full bg-primary/10 p-1">
                                                    <Check className="h-3.5 w-3.5 text-primary" />
                                                </div>
                                                <span className="text-sm text-muted-foreground leading-relaxed">
                                                    {feature}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>

                                    {/* CTA */}
                                    <div className="mt-auto">
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

                {/* Footer */}
                <div className="mt-20 text-center">
                    <p className="text-sm text-muted-foreground">
                        Need a custom plan?{" "}
                        <a href="#" className="text-primary font-medium hover:underline">
                            Contact sales
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}