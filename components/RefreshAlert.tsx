"use client"

import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "./ui/alert"
import { Dispatch, SetStateAction } from "react"
import { Button } from "./ui/button"
import { useRouter } from "next/navigation"

type RefreshAlertProps = {
    setShowRefreshNudge: Dispatch<SetStateAction<boolean>>
}

const RefreshAlert = ({ setShowRefreshNudge }: RefreshAlertProps) => {

    const router = useRouter()
    return (
        <Alert className="border-yellow-500/50 bg-yellow-500/5">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            <AlertTitle className="text-yellow-600 dark:text-yellow-400 flex items-center justify-between">
                <span>Refresh recommended</span>
                <Button
                    onClick={() => {
                        setShowRefreshNudge(false)
                        router.refresh()
                    }}
                    variant="outline"
                    className="text-xs font-normal text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Dismiss"
                >
                    Dismiss
                </Button>
            </AlertTitle>
            <AlertDescription className="flex items-center justify-between gap-3">
                <span className="text-xs">
                    Notes may not save correctly until the page is refreshed.
                </span>
            </AlertDescription>
        </Alert>
    )
}

export default RefreshAlert