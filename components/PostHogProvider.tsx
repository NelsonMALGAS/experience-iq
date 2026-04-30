"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider, usePostHog } from "posthog-js/react";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";

function PostHogPageView() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const ph = usePostHog();

    useEffect(() => {
        if (pathname && ph) {
            const url = window.origin + pathname;
            ph.capture("$pageview", { $current_url: url });
        }
    }, [pathname, searchParams, ph]);

    return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
import posthog from "posthog-js";
import { PostHogProvider as PHProvider, usePostHog } from "posthog-js/react";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense, useRef } from "react";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
    const didInit = useRef(false);

    useEffect(() => {
        if (didInit.current) return;
        const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
        if (!key) return;

        posthog.init(key, {
            api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
            capture_pageview: false,
            capture_pageleave: true,
        });
        didInit.current = true;
    }, []);

    return (
        <PHProvider client={posthog}>
            <Suspense fallback={null}>
                <PostHogPageView />
            </Suspense>
            {children}
        </PHProvider>
    );
}
