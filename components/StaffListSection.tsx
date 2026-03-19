"use client"

import { IssueCategory, Role, Shift, StaffMember } from "@/types";
import { CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { CheckCircle2, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { STAFF_DEPARTMENTS } from "@/constants";

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
    newStaffData: { name: string; email: string; department: IssueCategory, role: Role };
    setNewStaffData: (data: { name: string; email: string; department: IssueCategory, role: Role }) => void;
    addStaffMember: () => void;
}) => {
    return (
        <>
            <CardHeader>
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
                            <Button size="sm" variant="outline" className="gap-2">
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
                                        onChange={(e) => setNewStaffData({ ...newStaffData, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="staff-email">Email</Label>
                                    <Input
                                        id="staff-email"
                                        type="email"
                                        placeholder="john@example.com"
                                        value={newStaffData.email}
                                        onChange={(e) => setNewStaffData({ ...newStaffData, email: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="staff-department">Department</Label>
                                    <Select
                                        value={newStaffData.department}
                                        onValueChange={(val) =>
                                            setNewStaffData({ ...newStaffData, department: val as IssueCategory })
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
                                <Button variant="outline" onClick={() => setIsAddStaffDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={addStaffMember} disabled={true} className="cursor-not-allowed">Add Staff</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent className="space-y-2">
                {staffMembers.map(staff => {
                    const staffShifts = getShiftsForStaff(staff.id);
                    const isSelected = selectedStaff === staff.id;

                    return (
                        <div
                            key={staff.id}
                            onClick={() => setSelectedStaff(isSelected ? '' : staff.id)}
                            className={`
                p-3 rounded-lg border-2 transition-all cursor-pointer
                ${isSelected
                                    ? 'border-primary bg-primary/5'
                                    : 'border-transparent bg-muted/50 hover:bg-muted'
                                }
              `}
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
                                    <div className="font-semibold text-sm truncate flex items-center gap-1.5">
                                        {staff.name}
                                    </div>
                                    <div className="text-xs text-muted-foreground truncate">{staff.department}</div>
                                </div>
                                <Badge variant="secondary" className="font-mono text-xs shrink-0">
                                    {staffShifts.length}
                                </Badge>
                            </div>
                        </div>
                    );
                })}
            </CardContent>
        </>
    );
};