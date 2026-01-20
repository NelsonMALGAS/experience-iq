"use client";

import { Button } from "@/components/ui/button";

interface IOSModalProps {
    show: boolean;
    onClose: () => void;
}

const IOSModal = ({ show, onClose }: IOSModalProps) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-overlay backdrop-blur-sm"
                onClick={onClose}
            ></div>

            {/* Modal Box */}
            <div className="relative bg-background w-full max-w-md mx-4 p-6 rounded-2xl shadow-lg z-10">
                <h2 className="text-xl font-semibold mb-3 text-foreground">
                    Install ServiceResolve on iOS
                </h2>
                <p className="text-foreground/80 mb-4">
                    To install this app on your iPhone or iPad:
                </p>

                <ul className="list-disc list-inside text-foreground mb-4 space-y-1">
                    <li>
                        Open <span className="font-semibold">Safari</span> and go to{" "}
                        <span className="text-primary">
                            {typeof window !== "undefined"
                                ? window.location.origin
                                : "https://service-resolve.vercel.app"}
                        </span>
                        .
                    </li>
                    <li>
                        Tap the <span className="font-semibold">Share</span> icon (the square
                        with the arrow pointing up).
                    </li>
                    <li>
                        Scroll down and select{" "}
                        <span className="font-semibold">“Add to Home Screen”</span>.
                    </li>
                    <li>
                        Tap <span className="font-semibold">Add</span> to confirm.
                    </li>
                </ul>

                <Button onClick={onClose} variant="outline" className="w-full">
                    Close
                </Button>
            </div>
        </div>
    );
};

export default IOSModal;
