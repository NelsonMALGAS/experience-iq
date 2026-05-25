// AdminCreateRosterPage.tsx
"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Role, StaffMember } from "@/types"
import { shiftTemplates } from "@/constants"
import NotAdmin from "./NotAdmin"
import SuccessAlert from "./SuccessAlert"
import { useRoster } from "@/hooks/useRoster"
import { useExportRoster } from "@/hooks/useExportRoster"
import { RosterStatusAlerts } from "@/components/roster/RosterStatusAlerts"
import { RosterHeader } from "@/components/roster/RosterHeader"
import { RosterSidebar } from "@/components/roster/RosterSidebar"
import { CalendarView } from "@/components/roster/CalendarView"
import { StaffListView } from "@/components/roster/StaffListView"
import { toast } from "sonner"


type AdminCreateProps = {
    role: Role
    uid: string
    staff: StaffMember[]
    existingRosterId?: string
}

const AdminCreateRosterPage = ({ role, uid, staff, existingRosterId }: AdminCreateProps) => {
    const [selectedStaff, setSelectedStaff] = useState("")
    const [selectedDate, setSelectedDate] = useState("")
    const [selectedTemplate, setSelectedTemplate] = useState<typeof shiftTemplates[0] | null>(null)
    const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar")
    const [isAddStaffDialogOpen, setIsAddStaffDialogOpen] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [rangeStart, setRangeStart] = useState<string | null>(null)
    const [rangeEnd, setRangeEnd] = useState<string | null>(null)
    const [isDraggingRange, setIsDraggingRange] = useState(false)

    const roster = useRoster(staff, existingRosterId, uid)
    const { exportRoster } = useExportRoster(
        uid, roster.selectedMonth, roster.selectedYear,
        roster.shifts, roster.staffMembers
    )

    if (!uid) return <NotAdmin role={role} />

    // Calendar helpers
    const daysInMonth = new Date(roster.selectedYear, roster.selectedMonth + 1, 0).getDate()
    const firstDay = new Date(roster.selectedYear, roster.selectedMonth, 1).getDay()

    const isDateInRange = (date: string): boolean => {
        if (!rangeStart || !rangeEnd) return false
        const [start, end] = rangeStart <= rangeEnd ? [rangeStart, rangeEnd] : [rangeEnd, rangeStart]
        return date > start && date < end
    }

    const onDateSelect = (date: string) => {
        if (!rangeStart || !isDraggingRange) {
            setRangeStart(date)
            setRangeEnd(null)
        } else {
            setRangeEnd(date)
        }
    }

    const quickAddShift = (day: number, template: typeof shiftTemplates[0]) => {
        if (!selectedStaff) return
        const dateStr = `${roster.selectedYear}-${String(roster.selectedMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
        const existing = roster.shifts.find((s) => s.staffId === selectedStaff && s.date === dateStr)
        if (existing) {
            toast.error("Already Assigned", {
                description: `${roster.staffMembers.find((s) => s.id === selectedStaff)?.name} already has a shift on this day.`,
            })
            return
        }
        roster.addShift(selectedStaff, dateStr, template.start, template.end)
    }

    return (
        <div className="min-h-screen bg-background p-3 sm:p-4 md:p-6 lg:p-8">
            {roster.showSuccess && <SuccessAlert />}

            <div className="max-w-480 mx-auto space-y-4 sm:space-y-6">
                <RosterStatusAlerts
                    isLoading={roster.isLoading}
                    rosterId={roster.rosterId}
                    selectedMonth={roster.selectedMonth}
                    selectedYear={roster.selectedYear}
                    shifts={roster.shifts}
                    showRefreshNudge={roster.showRefreshNudge}
                    setShowRefreshNudge={roster.setShowRefreshNudge}
                />

                <RosterHeader
                    rosterId={roster.rosterId}
                    selectedMonth={roster.selectedMonth}
                    selectedYear={roster.selectedYear}
                    viewMode={viewMode}
                    isSaving={roster.isSaving}
                    isLoading={roster.isLoading}
                    onMonthChange={roster.setSelectedMonth}
                    onYearChange={roster.setSelectedYear}
                    onViewModeChange={setViewMode}
                    onSave={roster.saveRoster}
                    onCopyPrevious={roster.copyPreviousMonth}
                    onExport={exportRoster}
                />

                <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-[280px_1fr] xl:grid-cols-[320px_1fr] lg:gap-4 xl:gap-6 lg:items-start">
                    <RosterSidebar
                        staffMembers={roster.staffMembers}
                        selectedStaff={selectedStaff}
                        selectedDate={selectedDate}
                        selectedTemplate={selectedTemplate}
                        isMobileMenuOpen={isMobileMenuOpen}
                        isLoading={roster.isLoading}
                        newStaffData={roster.newStaffData}
                        isAddStaffDialogOpen={isAddStaffDialogOpen}
                        getShiftsForStaff={roster.getShiftsForStaff}
                        setSelectedStaff={setSelectedStaff}
                        setSelectedTemplate={setSelectedTemplate}
                        setIsMobileMenuOpen={setIsMobileMenuOpen}
                        setIsAddStaffDialogOpen={setIsAddStaffDialogOpen}
                        setNewStaffData={roster.setNewStaffData}
                        addStaffMember={roster.addStaffMember}
                    />

                    <Card>
                        <CardContent className="p-3 sm:p-4 md:p-6">
                            {roster.isLoading ? (
                                <div className="space-y-3 animate-pulse">
                                    <div className="grid grid-cols-7 gap-2">
                                        {Array.from({ length: 35 }).map((_, i) => (
                                            <div key={i} className="aspect-square bg-muted rounded-lg" />
                                        ))}
                                    </div>
                                </div>
                            ) : viewMode === "calendar" ? (
                                <CalendarView
                                    firstDay={firstDay}
                                    daysInMonth={daysInMonth}
                                    selectedMonth={roster.selectedMonth}
                                    selectedYear={roster.selectedYear}
                                    selectedDate={selectedDate}
                                    selectedStaff={selectedStaff}
                                    selectedTemplate={selectedTemplate}
                                    rosterId={roster.rosterId}
                                    staffMembers={roster.staffMembers}
                                    isMobileMenuOpen={isMobileMenuOpen}
                                    rangeStart={rangeStart}
                                    rangeEnd={rangeEnd}
                                    isDraggingRange={isDraggingRange}
                                    getShiftsForDate={roster.getShiftsForDate}
                                    quickAddShift={quickAddShift}
                                    removeShift={roster.removeShift}
                                    setSelectedDate={setSelectedDate}
                                    setSelectedTemplate={setSelectedTemplate}
                                    setIsMobileMenuOpen={setIsMobileMenuOpen}
                                    setIsDraggingRange={setIsDraggingRange}
                                    isDateInRange={isDateInRange}
                                    onDateSelect={onDateSelect}
                                    onNotesUpdated={roster.handleNotesUpdated}
                                />
                            ) : (
                                <StaffListView
                                    staffMembers={roster.staffMembers}
                                    rosterId={roster.rosterId}
                                    getShiftsForStaff={roster.getShiftsForStaff}
                                    removeShift={roster.removeShift}
                                    onNotesUpdated={roster.handleNotesUpdated}
                                />
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default AdminCreateRosterPage