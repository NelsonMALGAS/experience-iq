"use client"

import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import {
    Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet"

import { shiftTemplates } from "@/constants"
import { Shift, ShiftTemplate, StaffMember } from "@/types"
import { NewStaffType } from "@/hooks/useRoster"
import { StaffListSection } from "../StaffListSection"
import { ShiftTemplatesSection } from "../ShiftTemplateSection"
import { Dispatch, SetStateAction } from "react"

type Props = {
    staffMembers: StaffMember[]
    selectedStaff: string
    selectedDate: string
    selectedTemplate: typeof shiftTemplates[0] | null
    isMobileMenuOpen: boolean
    isLoading: boolean
    newStaffData: NewStaffType
    isAddStaffDialogOpen: boolean
    getShiftsForStaff: (staffId: string) => Shift[]
    setSelectedStaff: (id: string) => void
    setSelectedTemplate: Dispatch<SetStateAction<ShiftTemplate | null>>
    setIsMobileMenuOpen: (open: boolean) => void
    setIsAddStaffDialogOpen: (open: boolean) => void
    setNewStaffData: (data: NewStaffType) => void
    addStaffMember: (disabled?: boolean) => void
}

export function RosterSidebar({
    staffMembers, selectedStaff, selectedDate, selectedTemplate,
    isMobileMenuOpen, isLoading, newStaffData, isAddStaffDialogOpen,
    getShiftsForStaff, setSelectedStaff, setSelectedTemplate,
    setIsMobileMenuOpen, setIsAddStaffDialogOpen, setNewStaffData, addStaffMember,
}: Props) {
    const sharedStaffListProps = {
        staffMembers, selectedStaff, setSelectedStaff, getShiftsForStaff,
        isAddStaffDialogOpen, setIsAddStaffDialogOpen,
        newStaffData, setNewStaffData, addStaffMember,
    }

    const sharedTemplateProps = {
        shiftTemplates, selectedDate,
        setSelectedTemplate, selectedTemplate,
    }

    return (
        <>
            {/* Mobile trigger */}
            <div className="lg:hidden">
                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                    <SheetTrigger asChild>
                        <Button variant="outline" className="w-full gap-2 h-auto py-3" disabled={isLoading}>
                            <Menu className="w-4 h-4" />
                            <span className="flex-1 text-left">Staff & Templates</span>
                            {selectedStaff && (
                                <Badge variant="secondary" className="text-xs">
                                    {staffMembers.find((s) => s.id === selectedStaff)?.name.split(" ")[0]}
                                </Badge>
                            )}
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[85vw] sm:w-100 p-0 flex flex-col h-dvh overflow-hidden">
                        <SheetHeader className="shrink-0 px-4 pt-6 pb-4 sm:px-6 border-b border-border">
                            <SheetTitle className="text-lg sm:text-xl">Staff Management</SheetTitle>
                            <SheetDescription className="text-xs sm:text-sm">
                                Select staff and use quick shift templates
                            </SheetDescription>
                        </SheetHeader>
                        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
                            <div className="flex-1 min-h-0 overflow-hidden">
                                <StaffListSection {...sharedStaffListProps} />
                            </div>
                            {selectedStaff && (
                                <div className="shrink-0 max-h-[40dvh] flex flex-col overflow-hidden border-t border-border">
                                    <ShiftTemplatesSection {...sharedTemplateProps} />
                                </div>
                            )}
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            {/* Desktop sidebar */}
            <div className="hidden lg:flex lg:flex-col lg:gap-4 sticky top-4 h-[calc(100vh-6rem)]">
                <Card className="flex-1 min-h-0 flex flex-col overflow-hidden">
                    <StaffListSection {...sharedStaffListProps} />
                </Card>
                {selectedStaff && (
                    <Card className="shrink-0 max-h-[35vh] flex flex-col overflow-hidden">
                        <ShiftTemplatesSection {...sharedTemplateProps} />
                    </Card>
                )}
            </div>
        </>
    )
}