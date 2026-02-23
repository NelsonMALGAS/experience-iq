"use client";

import { useMemo, useState } from "react";
import { Check } from "lucide-react";
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

type PricingProps = {
    uid?: string;
    needsPayment?: boolean;
};

const Pricing = ({ needsPayment }: PricingProps) => {
    const [billing, setBilling] = useState<BillingInterval>("monthly");
    const { currentUser } = useCurrentUser();

    console.log("PRICING COMPONENT VERSION 2 LOADED");

    const formatPrice = (price: number) => {
        return price.toLocaleString("en-ZA");
    };

    const getPaymentLink = (baseLink: string) => {
        const email = currentUser?.email || "";

        if (!email) {
            return baseLink;
        }

        // Check if the base link already has query parameters
        const separator = baseLink.includes('?') ? '&' : '?';

        return `${baseLink}${separator}prefilled_email=${email}`;
    };

    const yearlyDiscountLabel = useMemo(() => {
        return "Save 20%";
    }, []);

    return (
        <div className="min-h-screen bg-background py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl mb-4">
                        {needsPayment
                            ? "Reactivate Your Subscription"
                            : "Simple, Transparent Pricing"}
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        {needsPayment
                            ? "Choose a plan to continue accessing all features."
                            : "Choose a plan that fits your hospitality operation."}
                    </p>
                </div>

                {/* Billing Toggle */}
                <div className="flex flex-col items-center gap-4 mb-12">
                    <div className="inline-flex items-center rounded-lg bg-muted p-1 gap-1">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setBilling("monthly")}
                            className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${billing === "monthly"
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            Monthly
                        </Button>

                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setBilling("yearly")}
                            className={`px-6 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${billing === "yearly"
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            Yearly
                            {billing === "yearly" && (
                                <Badge variant="secondary" className="text-xs">
                                    {yearlyDiscountLabel}
                                </Badge>
                            )}
                        </Button>
                    </div>

                    {billing === "yearly" && (
                        <p className="text-sm text-muted-foreground">
                            Billed annually at a 20% discount.
                        </p>
                    )}
                </div>

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {PRICE_PLANS.map((plan) => {
                        const isPro = plan.id === "pro";
                        const currentPricing = plan.pricing[billing];
                        const paymentLink = getPaymentLink(
                            currentPricing.paymentLink,
                        );

                        return (
                            <Card
                                key={plan.id}
                                className={`relative flex flex-col rounded-2xl transition-all duration-200 hover:shadow-lg ${isPro
                                    ? "ring-2 ring-primary scale-[1.03] shadow-xl"
                                    : "hover:scale-[1.02]"
                                    }`}
                            >
                                {isPro && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                        <Badge className="bg-primary text-primary-foreground">
                                            Most Popular
                                        </Badge>
                                    </div>
                                )}

                                <CardHeader className="pb-6">
                                    <CardTitle className="text-2xl font-bold">
                                        {plan.title}
                                    </CardTitle>
                                    <CardDescription className="text-sm">
                                        {plan.description}
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="flex-1 flex flex-col">
                                    {/* Price */}
                                    <div className="mb-6">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-4xl font-bold text-foreground">
                                                R{formatPrice(currentPricing.price)}
                                            </span>
                                            <span className="text-muted-foreground">
                                                /{billing === "monthly" ? "month" : "year"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Features */}
                                    <ul className="space-y-3 mb-8 flex-1">
                                        {plan.info.map((feature, index) => (
                                            <li key={index} className="flex items-start gap-3">
                                                <div className="rounded-full bg-primary/10 p-1 mt-0.5 shrink-0">
                                                    <Check className="h-3.5 w-3.5 text-primary" />
                                                </div>
                                                <span className="text-sm text-muted-foreground">
                                                    {feature}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>

                                    {/* CTA */}
                                    <a
                                        href={paymentLink}
                                        className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 w-full ${isPro
                                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                                            }`}
                                    >
                                        {needsPayment ? "Reactivate" : "Subscribe"}
                                    </a>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="mt-16 text-center">
                    {!needsPayment && (
                        <p className="text-sm text-muted-foreground">
                            All plans include a 14-day free trial. No credit card required.
                        </p>
                    )}

                    <p className="text-sm text-muted-foreground mt-2">
                        Need a custom plan?{" "}
                        <a
                            href="#"
                            className="text-primary hover:underline font-medium"
                        >
                            Contact our sales team
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Pricing;