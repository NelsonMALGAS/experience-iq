"use client"

import { PwaModalProps } from "@/types"
import { Button } from "@/components/ui/button";


const PWAModal = ({ onClose, onInstall, show }: PwaModalProps) => {

    const blurBackground = show ? "backdrop-blur" : "";

    if (!show) return null;
    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 m-4">
            <div className="bg-card w-full max-w-md border border-border p-6 rounded-lg shadow-lg relative z-10">
                <h2 className="text-lg font-semibold mb-2 text-foreground">Install the App</h2>
                <p className="text-sm mb-4 text-foreground/80">
                    Click on the button below to install the app on your device
                </p>
                <div className="flex justify-end gap-2">
                    <Button onClick={onInstall} variant="default">
                        Install PWA
                    </Button>
                    <Button onClick={onClose} variant="outline">
                        Cancel
                    </Button>
                </div>
            </div>

            <div className={`fixed inset-0 bg-overlay backdrop-blur-sm ${blurBackground}`}></div>
        </div>


    )
}

export default PWAModal