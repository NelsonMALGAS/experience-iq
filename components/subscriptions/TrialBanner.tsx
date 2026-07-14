import { UserSubscription } from "@/types";
import { getTrialDaysRemaining, isTrialExpired } from "@/lib/subscriptionAccess";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SubscriptionBanner } from "../payment/SubscriptionBanner";

type TrialBannerProps = {
    subscription: UserSubscription | null | undefined;
};

/**
 * TrialBanner
 * ────────────
 * Renders nothing for active paying subscribers. For trialing users,
 * shows days-remaining messaging that escalates as the trial nears its
 * end. For expired trials, prompts subscription.
 */
export const TrialBanner = ({ subscription }: TrialBannerProps) => {
    // Active subscribers see no banner at all.
    if (!subscription || subscription.status === "active") return null;

    const expired = isTrialExpired(subscription);
    const daysRemaining = getTrialDaysRemaining(subscription);


    if (subscription.status === "trialing" && !expired && daysRemaining !== null) {
        // ⚠️ Escalated messaging for the final day
        if (daysRemaining <= 1) {
            return (
                <div className="rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/20 px-4 py-3 flex items-center justify-between gap-4">
                    <p className="text-sm text-amber-800 dark:text-amber-300">
                        ⚠️ Your free trial ends tomorrow. Subscribe now to avoid interruption.
                    </p>
                    <Button asChild size="sm">
                        <Link href="/payment">Subscribe</Link>
                    </Button>
                </div>
            );
        }

        return (
            <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 flex items-center justify-between gap-4">
                <p className="text-sm">
                    🎉 You&apos;re currently on a free trial. {daysRemaining} days remaining. Upgrade anytime.
                </p>
                <Button asChild size="sm">
                    <Link href="/payment">Upgrade Now</Link>
                </Button>
            </div>
        );
    }

    // Trial expired (or status already flipped by the daily sweep job)
    if (expired || subscription.status === "expired") {
        return (
            <SubscriptionBanner type="admin" />
        );
    }

    return null;
}