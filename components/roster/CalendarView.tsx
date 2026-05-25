"use client"

import { Button } from "@/components/ui/button"
import { shiftTemplates } from "@/constants"
import { Shift, StaffMember } from "@/types"
import CalendarGrid from "../CalendarGrid"


type Props = {
    firstDay: number
    daysInMonth: number
    selectedMonth: number
    selectedYear: number
    selectedDate: string
    selectedStaff: string
    selectedTemplate: typeof shiftTemplates[0] | null
    rosterId: string | undefined
    staffMembers: StaffMember[]
    isMobileMenuOpen: boolean
    rangeStart: string | null
    rangeEnd: string | null
    isDraggingRange: boolean
    getShiftsForDate: (date: string) => Shift[]
    quickAddShift: (day: number, template: typeof shiftTemplates[0]) => void
    removeShift: (shiftId: string) => void
    setSelectedDate: (date: string) => void
    setSelectedTemplate: (t: typeof shiftTemplates[0] | null) => void
    setIsMobileMenuOpen: (open: boolean) => void
    setIsDraggingRange: (val: boolean) => void
    isDateInRange: (date: string) => boolean
    onDateSelect: (date: string) => void
    onNotesUpdated: (shiftId: string, notes: string) => void
}

export function CalendarView({
    firstDay, daysInMonth, selectedMonth, selectedYear,
    selectedDate, selectedStaff, selectedTemplate, rosterId,
    staffMembers, isMobileMenuOpen, rangeStart, rangeEnd, isDraggingRange,
    getShiftsForDate, quickAddShift, removeShift,
    setSelectedDate, setSelectedTemplate, setIsMobileMenuOpen,
    setIsDraggingRange, isDateInRange, onDateSelect, onNotesUpdated,
}: Props) {
    return (
        <div className="space-y-3 sm:space-y-4">
            {/* Calendar day headers */}
            <div className="grid grid-cols-7 gap-0.5 sm:gap-1 md:gap-2 text-center font-semibold text-[10px] xs:text-xs sm:text-sm text-muted-foreground mb-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="hidden sm:block py-1">{day}</div>
                ))}
                {["S", "M", "T", "W", "T", "F", "S"].map((day, idx) => (
                    <div key={`mobile-${idx}`} className="sm:hidden py-1">{day}</div>
                ))}
            </div>

            <CalendarGrid
                firstDay={firstDay}
                daysInMonth={daysInMonth}
                getShiftsForDate={getShiftsForDate}
                isMobileMenuOpen={isMobileMenuOpen}
                quickAddShift={quickAddShift}
                removeShift={removeShift}
                selectedDate={selectedDate}
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
                selectedStaff={selectedStaff}
                setIsMobileMenuOpen={setIsMobileMenuOpen}
                setSelectedDate={setSelectedDate}
                shiftTemplates={shiftTemplates}
                staffMembers={staffMembers}
                isDateInRange={isDateInRange}
                isDraggingRange={isDraggingRange}
                onDateSelect={onDateSelect}
                setIsDraggingRange={setIsDraggingRange}
                rangeStart={rangeStart}
                rangeEnd={rangeEnd}
                selectedTemplate={selectedTemplate}
                setSelectedTemplate={setSelectedTemplate}
                rosterId={rosterId}
                onNotesUpdated={onNotesUpdated}
            />

            {/* Mobile quick-add panel */}
            {selectedDate && selectedStaff && rosterId && (
                <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-background border-t p-3 sm:p-4 space-y-2 z-50 shadow-lg">
                    <div className="text-xs sm:text-sm font-semibold mb-2">
                        Add shift for{" "}
                        {new Date(selectedDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        {shiftTemplates.map((template, idx) => (
                            <Button
                                key={idx}
                                size="sm"
                                variant="secondary"
                                className="text-xs h-9"
                                onClick={() => {
                                    const day = new Date(selectedDate).getDate()
                                    quickAddShift(day, template)
                                }}
                            >
                                {template.label}
                            </Button>
                        ))}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs h-9"
                        onClick={() => setSelectedDate("")}
                    >
                        Close
                    </Button>
                </div>
            )}
        </div>
    )
}