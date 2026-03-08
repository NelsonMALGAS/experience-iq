"use client";


import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ChevronDown, Copy, Check } from "lucide-react";
import { useState } from "react";

interface SubscriptionPopoverProps {
    subscription: {
        name?: string | undefined;
        status?: string | undefined;
        hasAccess?: boolean | undefined;
        amount?: number | undefined;
        createdAt?: string | undefined;
        currentPeriodEnd?: string | undefined;
        lastPaymentDate?: string | undefined;
        lastPaymentAmount?: number | undefined;
        lastPaymentReference?: string | undefined;
        subscriptionCode?: string | undefined;
        subscriptionId?: string | undefined;
        customerCode?: string | undefined;
        cancelAtPeriodEnd?: boolean | undefined;

    } | null | undefined;
}


function CopyCode({ value }: { value: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(value).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <button
            onClick={handleCopy}
            className="ml-1.5 inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
            title="Copy to clipboard"
        >
            {copied
                ? <Check className="h-3 w-3 text-green-500" />
                : <Copy className="h-3 w-3" />
            }
        </button>
    );
}


function DetailRow({
    label,
    value,
    mono = false,
    copyable = false,
}: {
    label: string;
    value: string;
    mono?: boolean;
    copyable?: boolean;
}) {
    return (
        <div className="flex items-start justify-between gap-4 py-1.5">
            <p className="text-xs text-muted-foreground shrink-0">{label}</p>
            <div className="flex items-center min-w-0">
                <p className={`text-xs text-right truncate ${mono ? "font-mono text-foreground" : "text-foreground font-medium"}`}>
                    {value}
                </p>
                {copyable && <CopyCode value={value} />}
            </div>
        </div>
    );
}


export function SubscriptionDetailsPopover({ subscription }: SubscriptionPopoverProps) {
    if (!subscription) return null;

    const formatAmount = (kobo?: number) =>
        kobo != null
            ? `R${(kobo / 100).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`
            : "—";

    const formatDate = (iso?: string) =>
        iso
            ? new Date(iso).toLocaleDateString("en-ZA", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            })
            : "—";

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs h-8 shrink-0"
                >
                    Billing details
                    <ChevronDown className="h-3 w-3" />
                </Button>
            </PopoverTrigger>

            <PopoverContent
                align="end"
                className="w-80 p-0 shadow-lg"
                sideOffset={8}
            >
                {/* Header */}
                <div className="px-4 py-3 border-b border-border bg-muted/30">
                    <p className="text-sm font-semibold text-foreground">Billing Details</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        {subscription.name ?? "Subscription"}
                    </p>
                </div>

                <div className="px-4 py-3 space-y-0.5">

                    {/* Status */}
                    <DetailRow
                        label="Status"
                        value={
                            subscription.status
                                ? subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)
                                : "—"
                        }
                    />
                    <DetailRow
                        label="Amount"
                        value={formatAmount(subscription.amount)}
                    />
                    <DetailRow
                        label="Subscribed on"
                        value={formatDate(subscription.createdAt)}
                    />
                    <DetailRow
                        label="Period ends"
                        value={formatDate(subscription.currentPeriodEnd)}
                    />

                    <Separator className="my-2" />

                    {/* Last payment */}
                    <p className="text-xs font-medium text-muted-foreground pb-1">Last Payment</p>
                    <DetailRow
                        label="Date"
                        value={formatDate(subscription.lastPaymentDate)}
                    />
                    <DetailRow
                        label="Amount"
                        value={formatAmount(subscription.lastPaymentAmount)}
                    />
                    {subscription.lastPaymentReference && (
                        <DetailRow
                            label="Reference"
                            value={subscription.lastPaymentReference}
                            mono
                            copyable
                        />
                    )}

                    <Separator className="my-2" />

                    {/* Identifiers */}
                    <p className="text-xs font-medium text-muted-foreground pb-1">Identifiers</p>
                    {subscription.subscriptionCode && (
                        <DetailRow
                            label="Subscription ID"
                            value={subscription.subscriptionCode}
                            mono
                            copyable
                        />
                    )}
                    {subscription.customerCode && (
                        <DetailRow
                            label="Customer code"
                            value={subscription.customerCode}
                            mono
                            copyable
                        />
                    )}

                    <Separator className="my-2" />

                    {/* Auto-renew */}
                    <DetailRow
                        label="Auto-renew"
                        value={subscription.cancelAtPeriodEnd ? "Cancels at period end" : "Enabled"}
                    />
                </div>

                <div className="px-4 py-2.5 border-t border-border bg-muted/20">
                    <p className="text-xs text-muted-foreground">
                        For billing queries contact{" "}
                        <span className="font-medium text-foreground">experienceiq.helpdesk@gmail.com</span>
                    </p>
                </div>
            </PopoverContent>
        </Popover>
    );
}