import { Clock, Shield, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { months } from "@/constants"
import RefreshAlert from "../RefreshAlert"
import { Dispatch, SetStateAction } from "react"


type Props = {
    isLoading: boolean
    rosterId: string | undefined
    selectedMonth: number
    selectedYear: number
    shifts: { length: number }
    showRefreshNudge: boolean
    setShowRefreshNudge: Dispatch<SetStateAction<boolean>>
}

export function RosterStatusAlerts({
    isLoading,
    rosterId,
    selectedMonth,
    selectedYear,
    shifts,
    showRefreshNudge,
    setShowRefreshNudge,
}: Props) {
    const monthLabel = `${months[selectedMonth]} ${selectedYear}`

    return (
        <>
            {isLoading && (
                <Alert>
                    <Clock className="h-4 w-4 animate-spin" />
                    <AlertTitle>Loading Roster</AlertTitle>
                    <AlertDescription>Fetching roster data for {monthLabel}...</AlertDescription>
                </Alert>
            )}

            {!rosterId && !isLoading && (
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>New Roster</AlertTitle>
                    <AlertDescription>
                        No roster exists for {monthLabel}. Click &quot;Create Roster&quot; to start scheduling shifts.
                    </AlertDescription>
                </Alert>
            )}

            {rosterId && !isLoading && (
                <Alert className="border-primary/50 bg-primary/5">
                    <Shield className="h-4 w-4 text-primary" />
                    <AlertTitle className="text-primary">Roster Loaded</AlertTitle>
                    <AlertDescription>
                        Editing roster for {monthLabel} • {shifts.length} shift{shifts.length !== 1 ? "s" : ""} scheduled
                    </AlertDescription>
                </Alert>
            )}

            {showRefreshNudge && <RefreshAlert setShowRefreshNudge={setShowRefreshNudge} />}
        </>
    )
}