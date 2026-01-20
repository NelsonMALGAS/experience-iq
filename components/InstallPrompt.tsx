"use client";

import { useEffect, useState } from "react";
import PWAModal from "@/components/PWAModal";
import IOSModal from "@/components/IOSModal";
import { toast } from "sonner";


/**
 * Type definition for the custom beforeinstallprompt event.
 * This is not included in TypeScript DOM lib by default.
 */
interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{
        outcome: "accepted" | "dismissed";
        platform: string;
    }>;
    prompt(): Promise<void>;
}

/**
 * iOS-specific window type that includes optional MSStream.
 */
interface WindowWithMSStream extends Window {
    MSStream?: unknown;
}

const InstallPrompt = () => {
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const [deferredPrompt, setDeferredPrompt] =
        useState<BeforeInstallPromptEvent | null>(null);
    const [show, setShow] = useState(false);
    const [showIOSModal, setShowIOSModal] = useState(false);


    useEffect(() => {
        const checkIfStandalone = (): boolean => {
            const isIOSStandalone = (window.navigator as Navigator & {
                standalone?: boolean;
            }).standalone === true;
            const isDisplayModeStandalone = window.matchMedia(
                "(display-mode: standalone)"
            ).matches;
            const installed = isIOSStandalone || isDisplayModeStandalone;


            setIsStandalone(installed);
            return installed;
        };

        const checkPlatform = (): void => {
            const ua = navigator.userAgent;
            const ios =
                /iPad|iPhone|iPod/.test(ua) &&
                !(window as WindowWithMSStream).MSStream;
            setIsIOS(ios);

            const installed = checkIfStandalone();

            if (!installed) {
                setShow(true);
            }
        };

        const timeoutId = window.setTimeout(checkPlatform, 200);

        const handleBeforeInstallPrompt = (e: Event): void => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

        const mediaQuery = window.matchMedia("(display-mode: standalone)");
        const handleDisplayModeChange = (e: MediaQueryListEvent): void => {
            setIsStandalone(e.matches);
            if (e.matches) setShow(false);
        };
        mediaQuery.addEventListener("change", handleDisplayModeChange);

        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener(
                "beforeinstallprompt",
                handleBeforeInstallPrompt
            );
            mediaQuery.removeEventListener("change", handleDisplayModeChange);
        };
    }, []);

    // ✅ Hide everything if the app is already installed
    if (isStandalone) return null;

    const handleInstallClick = async (): Promise<void> => {
        if (deferredPrompt) {
            await deferredPrompt.prompt();
            const choiceResult = await deferredPrompt.userChoice;
            if (choiceResult.outcome === "accepted") {
                toast.success("✅ PWA install accepted");
            } else {
                toast.info("❌ PWA install dismissed");
            }
            setDeferredPrompt(null);
            setShow(false);
        } else if (isIOS) {
            setShowIOSModal(true);
            setShow(false);
        } else {
            toast.error("⚠️ Install prompt not available");
        }
    };

    const handleClose = (): void => {
        setShow(false);
        setShowIOSModal(false);
    };


    return (
        <div className="p-24">
            <PWAModal show={show} onInstall={handleInstallClick} onClose={handleClose} />
            <IOSModal show={showIOSModal} onClose={handleClose} />
        </div>
    );
};

export default InstallPrompt;
