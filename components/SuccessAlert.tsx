import { CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription } from "./ui/alert"


const SuccessAlert = () => {
    return (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right">
            <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertDescription className="text-green-600 dark:text-green-400 font-medium">
                    Roster saved successfully!
                </AlertDescription>
            </Alert>
        </div>
    )
}

export default SuccessAlert