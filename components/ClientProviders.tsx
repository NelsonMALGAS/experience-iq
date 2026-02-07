"use client";

import dynamic from "next/dynamic";

// 🔥 Sonner (client-only)
const Toaster = dynamic(
    () => import("sonner").then((m) => ({ default: m.Toaster })),
    { ssr: false }
);

// 🔥 Contexts
const NotificationProvider = dynamic(
    () =>
        import("@/contexts/NotificationContext").then((m) => ({
            default: m.NotificationProvider,
        })),
    { ssr: false }
);

const IssueProvider = dynamic(
    () =>
        import("@/contexts/IssuesContext").then((m) => ({
            default: m.IssueProvider,
        })),
    { ssr: false }
);

// 🔥 Service Worker registration
const PWAServiceWorkerRegister = dynamic(
    () => import("@/components/PWAServiceWorkerRegister"),
    { ssr: false }
);

export default function ClientProviders({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <NotificationProvider>
                <IssueProvider>{children}</IssueProvider>
            </NotificationProvider>

            <Toaster richColors position="top-center" />
            <PWAServiceWorkerRegister />
        </>
    );
}
