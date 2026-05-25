
"use client"

import { Clock, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shift, StaffMember } from "@/types"
import { ShiftNotesPopover } from "../ShiftNotesPopover"


type Props = {
    staffMembers: StaffMember[]
    rosterId: string | undefined
    getShiftsForStaff: (staffId: string) => Shift[]
    removeShift: (shiftId: string) => void
    onNotesUpdated: (shiftId: string, notes: string) => void
}

export function StaffListView({
    staffMembers,
    rosterId,
    getShiftsForStaff,
    removeShift,
    onNotesUpdated,
}: Props) {
    return (
        <div className="space-y-3 sm:space-y-4">
            {staffMembers.map((staff) => {
                const staffShifts = getShiftsForStaff(staff.id).sort(
                    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
                )

                return (
                    <Card key={staff.id}>
                        <CardHeader className="p-3 sm:p-4 md:pb-3">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div
                                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center text-white font-bold text-base sm:text-lg md:text-xl shrink-0"
                                    style={{ backgroundColor: staff.color }}
                                >
                                    {staff.name.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <CardTitle className="text-sm sm:text-base md:text-lg truncate">{staff.name}</CardTitle>
                                    <CardDescription className="text-xs sm:text-sm">
                                        <div>
                                            {staff.department} • {staffShifts.length} shift{staffShifts.length !== 1 ? "s" : ""} scheduled
                                        </div>
                                        {staff.property && (
                                            <div className="text-[11px] text-muted-foreground/80 mt-0.5">
                                                {staff.property.name}
                                            </div>
                                        )}
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="p-3 sm:p-4 pt-0">
                            {staffShifts.length > 0 ? (
                                <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3">
                                    {staffShifts.map((shift) => (
                                        <ShiftCard
                                            key={shift.id}
                                            shift={shift}
                                            rosterId={rosterId}
                                            onRemove={removeShift}
                                            onNotesUpdated={onNotesUpdated}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6 sm:py-8 text-muted-foreground text-xs sm:text-sm">
                                    No shifts scheduled yet
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}

// ── ShiftCard ────────────────────────────────────────────────────────────────

type ShiftCardProps = {
    shift: Shift
    rosterId: string | undefined
    onRemove: (shiftId: string) => void
    onNotesUpdated: (shiftId: string, notes: string) => void
}

function ShiftCard({ shift, rosterId, onRemove, onNotesUpdated }: ShiftCardProps) {
    return (
        <div className="p-2.5 sm:p-3 rounded-lg border bg-muted/50 relative group">
            <div className="font-semibold text-xs sm:text-sm mb-1">
                {new Date(shift.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    weekday: "short",
                })}
            </div>
            <div className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {shift.startTime} - {shift.endTime}
            </div>
            <div className="flex items-center justify-between mt-2">
                <ShiftNotesPopover
                    rosterId={rosterId}
                    shiftId={shift.id}
                    existingNotes={shift.notes}
                    onNotesUpdated={onNotesUpdated}
                />
                <Button
                    size="sm"
                    variant="destructive"
                    className="h-6 w-6 sm:h-7 sm:w-7 p-0 md:absolute md:top-2 md:right-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => onRemove(shift.id)}
                >
                    <Trash2 className="w-3 h-3" />
                </Button>
            </div>
        </div>
    )
}