"use client"

import { useMemo, useState } from "react"
import { Clock, Trash2, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
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
    const [selectedProperty, setSelectedProperty] = useState<string>("all")

    // Derive sorted unique property names from staff members
    const propertyNames = useMemo<string[]>(() => {
        const names = new Set<string>()
        for (const staff of staffMembers) {
            if (staff.property?.name) {
                names.add(staff.property.name)
            }
        }
        return Array.from(names).sort((a, b) => a.localeCompare(b))
    }, [staffMembers])

    // Filter staff members by selected property
    const filteredStaffMembers = useMemo<StaffMember[]>(() => {
        if (selectedProperty === "all") return staffMembers
        return staffMembers.filter(
            (staff) => staff.property?.name === selectedProperty
        )
    }, [staffMembers, selectedProperty])

    return (
        <div className="space-y-3 sm:space-y-4">

            {/* ── Property Filter ─────────────────────────────────────────── */}
            {propertyNames.length > 0 && (
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 px-0.5">
                    <div className="flex items-center gap-2 shrink-0">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                            Filter by property
                        </span>
                    </div>
                    <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                        <SelectTrigger className="w-full sm:w-[260px]">
                            <SelectValue placeholder="All Properties" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Properties</SelectItem>
                            {propertyNames.map((name) => (
                                <SelectItem key={name} value={name}>
                                    {name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {selectedProperty !== "all" && (
                        <span className="text-xs text-muted-foreground sm:ml-1">
                            {filteredStaffMembers.length} staff member
                            {filteredStaffMembers.length !== 1 ? "s" : ""}
                        </span>
                    )}
                </div>
            )}

            {/* ── Empty State ──────────────────────────────────────────────── */}
            {filteredStaffMembers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center px-4">
                    <Building2 className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground/40 mb-3" />
                    <p className="text-sm sm:text-base font-medium text-muted-foreground">
                        No staff members found for this property.
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground/60 mt-1">
                        Try selecting a different property or{" "}
                        <button
                            className="underline underline-offset-2 hover:text-foreground transition-colors"
                            onClick={() => setSelectedProperty("all")}
                        >
                            view all
                        </button>
                        .
                    </p>
                </div>
            ) : (
                /* ── Staff List ──────────────────────────────────────────── */
                filteredStaffMembers.map((staff) => {
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
                                        <CardTitle className="text-sm sm:text-base md:text-lg truncate">
                                            {staff.name}
                                        </CardTitle>
                                        <CardDescription className="text-xs sm:text-sm">
                                            <div>
                                                {staff.department} •{" "}
                                                {staffShifts.length} shift
                                                {staffShifts.length !== 1 ? "s" : ""} scheduled
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
                })
            )}
        </div>
    )
}


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