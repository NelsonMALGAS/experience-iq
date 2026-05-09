"use client";

import { IssueCategory, Role, Shift, StaffMember } from "@/types";
import { CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { CheckCircle2, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select";
import { Badge } from "./ui/badge";
import { STAFF_DEPARTMENTS } from "@/constants";
import usePagination from "@/hooks/usePagination";
import { formatIssueCategory } from "@/helpers/formatCategory";

export const StaffListSection = ({
    staffMembers,
    selectedStaff,
    setSelectedStaff,
    getShiftsForStaff,
    isAddStaffDialogOpen,
    setIsAddStaffDialogOpen,
    newStaffData,
    setNewStaffData,
    addStaffMember,
}: {
    staffMembers: StaffMember[];
    selectedStaff: string;
    setSelectedStaff: (id: string) => void;
    getShiftsForStaff: (id: string) => Shift[];
    isAddStaffDialogOpen: boolean;
    setIsAddStaffDialogOpen: (open: boolean) => void;
    newStaffData: { name: string; email: string; department: IssueCategory; role: Role };
    setNewStaffData: (data: {
        name: string;
        email: string;
        department: IssueCategory;
        role: Role;
    }) => void;
    addStaffMember: () => void;
}) => {
    const {
        paginatedData,
        currentPage,
        totalPages,
        hasNext,
        hasPrev,
        nextPage,
        prevPage,
    } = usePagination(staffMembers, 10);

    return (

        <div className="flex flex-col min-h-0 h-full">
            {/* ── Header ─────────────────────────────────────────────── */}
            <CardHeader className="shrink-0 pb-3">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg">Staff Members</CardTitle>
                        <CardDescription className="text-xs mt-1">
                            <CheckCircle2 className="w-3 h-3 inline mr-1" />
                            Verified staff only
                        </CardDescription>
                    </div>

                    <Dialog open={isAddStaffDialogOpen} onOpenChange={setIsAddStaffDialogOpen}>
                        <DialogTrigger asChild>
                            {/* Hidden trigger preserved for future use */}
                            <Button
                                size="sm"
                                variant="outline"
                                className="gap-2 opacity-0 cursor-none pointer-events-none"
                                tabIndex={-1}
                                aria-hidden
                            >
                                <Plus className="w-4 h-4" />
                                Add
                            </Button>
                        </DialogTrigger>

                        <DialogContent className="sm:max-w-106.25">
                            <DialogHeader>
                                <DialogTitle>Add New Staff Member</DialogTitle>
                                <DialogDescription>
                                    Add a new staff member to assign shifts to.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="staff-name">Name</Label>
                                    <Input
                                        id="staff-name"
                                        placeholder="John Doe"
                                        value={newStaffData.name}
                                        onChange={(e) =>
                                            setNewStaffData({ ...newStaffData, name: e.target.value })
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="staff-email">Email</Label>
                                    <Input
                                        id="staff-email"
                                        type="email"
                                        placeholder="john@example.com"
                                        value={newStaffData.email}
                                        onChange={(e) =>
                                            setNewStaffData({ ...newStaffData, email: e.target.value })
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="staff-department">Department</Label>
                                    <Select
                                        value={newStaffData.department}
                                        onValueChange={(val) =>
                                            setNewStaffData({
                                                ...newStaffData,
                                                department: val as IssueCategory,
                                            })
                                        }
                                    >
                                        <SelectTrigger id="staff-department">
                                            <SelectValue placeholder="Select department" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {STAFF_DEPARTMENTS.map((dep) => (
                                                <SelectItem key={dep} value={dep}>
                                                    {dep.toUpperCase()}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsAddStaffDialogOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={addStaffMember}
                                    disabled
                                    className="cursor-not-allowed"
                                >
                                    Add Staff
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>

            {/* ── Scrollable staff list ───────────────────────────────── */}
            <CardContent className="flex-1 overflow-y-auto pr-1 space-y-2 min-h-0">
                {paginatedData.map((staff) => {
                    const staffShifts = getShiftsForStaff(staff.id);
                    const isSelected = selectedStaff === staff.id;
                    const property = staff.property ?? null;

                    return (
                        <div
                            key={staff.id}
                            onClick={() => setSelectedStaff(isSelected ? "" : staff.id)}
                            className={`p-3 rounded-lg border-2 transition-all cursor-pointer select-none
                                ${isSelected
                                    ? "border-primary bg-primary/5"
                                    : "border-transparent bg-muted/50 hover:bg-muted"
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg relative shrink-0"
                                    style={{ backgroundColor: staff.color }}
                                >
                                    {staff.name.charAt(0)}
                                    {staff.isVerified && (
                                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background flex items-center justify-center">
                                            <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-sm truncate">
                                        {staff.name}
                                    </div>
                                    <div className="text-xs text-muted-foreground truncate">
                                        {formatIssueCategory(staff.department ?? "other")}
                                    </div>
                                    {property && (
                                        <div className="text-[11px] text-muted-foreground/80 truncate">
                                            {property.name}
                                        </div>
                                    )}
                                </div>

                                <Badge variant="secondary" className="font-mono text-xs shrink-0">
                                    {staffShifts.length}
                                </Badge>
                            </div>
                        </div>
                    );
                })}
            </CardContent>

            {/* ── Pagination — always pinned below the list ───────────── */}
            {totalPages > 1 && (
                <div className="shrink-0 flex items-center justify-between px-6 py-3 border-t border-border">
                    <p className="text-xs text-muted-foreground tabular-nums">
                        Page {currentPage} of {totalPages}
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={prevPage}
                            disabled={!hasPrev}
                            aria-label="Previous page"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={nextPage}
                            disabled={!hasNext}
                            aria-label="Next page"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};