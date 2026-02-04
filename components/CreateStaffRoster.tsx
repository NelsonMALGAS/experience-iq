"use client"

import { useState } from 'react';
import { Calendar, Users, Clock, Save, Download, Copy, Trash2, Shield, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { useUserStore } from '@/store/useUserStore';
import { ShiftTemplatesSection } from './ShiftTemplateSection';
import { IssueCategory, Role, RosterData, Shift, StaffMember } from '@/types';
import { StaffListSection } from './StaffListSection';
import NotAdmin from './NotAdmin';
import SuccessAlert from './SuccessAlert';
import CalendarGrid from './CalendarGrid';
import { months, shiftTemplates, staffColorPalette } from '@/constants';


type AdminCreateProps = {
    role: Role
    uid: string
    staff: StaffMember[]
}



type NewStaffType = {
    name: string
    email: string
    department: IssueCategory
}
const AdminCreateRosterPage = ({ role, uid, staff }: AdminCreateProps) => {
    const { currentUser } = useUserStore();


    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [staffMembers, setStaffMembers] = useState<StaffMember[]>(staff);
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [selectedStaff, setSelectedStaff] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [rangeStart, setRangeStart] = useState<string | null>(null);
    const [rangeEnd, setRangeEnd] = useState<string | null>(null);
    const [isDraggingRange, setIsDraggingRange] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<typeof shiftTemplates[0] | null>(null);
    const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
    const [showSuccess, setShowSuccess] = useState(false);
    const [isAddStaffDialogOpen, setIsAddStaffDialogOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [newStaffData, setNewStaffData] = useState<NewStaffType>({
        name: '',
        email: '',
        department: 'other',
    });


    if (!uid) return <NotAdmin role={role} />;

    const onDateSelect = (date: string) => {
        if (!rangeStart || !isDraggingRange) {
            setRangeStart(date);
            setRangeEnd(null);
        } else {
            setRangeEnd(date);
        }
    };

    const isDateInRange = (date: string): boolean => {
        if (!rangeStart || !rangeEnd) return false;
        const [start, end] = rangeStart <= rangeEnd
            ? [rangeStart, rangeEnd]
            : [rangeEnd, rangeStart];
        return date > start && date < end;   // exclusive of endpoints
    };



    // Get days in month
    const getDaysInMonth = (month: number, year: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);

    // Get first day of month (0 = Sunday, 1 = Monday, etc.)
    const getFirstDayOfMonth = (month: number, year: number) => {
        return new Date(year, month, 1).getDay();
    };

    const firstDay = getFirstDayOfMonth(selectedMonth, selectedYear);

    // Add shift (admin only)
    const addShift = (staffId: string, date: string, startTime: string, endTime: string, notes?: string) => {
        if (!uid) {
            alert('Access denied. Only administrators can create shifts.');
            return;
        }

        // Check if staff member exists and has 'staff' role (in production)
        const staffMember = staffMembers.find(s => s.id === staffId);
        if (!staffMember) {
            alert('Invalid staff member selected.');
            return;
        }

        const newShift: Shift = {
            id: crypto.randomUUID(),
            staffId,
            date,
            startTime,
            endTime,
            notes,
        };
        setShifts([...shifts, newShift]);
    };

    // Remove shift (admin only)
    const removeShift = (shiftId: string) => {
        if (!uid) {
            alert('Access denied. Only administrators can remove shifts.');
            return;
        }
        setShifts(shifts.filter(s => s.id !== shiftId));
    };

    // Get shifts for a specific date
    const getShiftsForDate = (date: string) => {
        return shifts.filter(s => s.date === date);
    };

    // Get shifts for a specific staff member
    const getShiftsForStaff = (staffId: string) => {
        return shifts.filter(s => s.staffId === staffId);
    };

    // Add new staff member (admin only)
    const addStaffMember = () => {
        if (!uid) {
            alert('Access denied. Only administrators can add staff members.');
            return;
        }

        if (newStaffData.name && newStaffData.email && newStaffData.department) {
            const newStaff: StaffMember = {
                id: Date.now().toString(),
                name: newStaffData.name,
                email: newStaffData.email,
                department: newStaffData.department,
                color: staffColorPalette[staffMembers.length % staffColorPalette.length],
                isVerified: false, // New staff members start unverified
            };
            setStaffMembers([...staffMembers, newStaff]);
            setNewStaffData({ name: '', email: '', department: 'other' });
            setIsAddStaffDialogOpen(false);
        }
    };

    // Save roster (admin only)
    const saveRoster = () => {
        if (!uid) {
            alert('Access denied. Only administrators can save rosters.');
            return;
        }

        if (!uid) {
            alert('User not authenticated.');
            return;
        }

        const rosterData: RosterData = {
            month: months[selectedMonth],
            year: selectedYear,
            shifts,
            createdBy: uid,
            createdAt: new Date().toISOString(),
        };
        console.log('Saving roster:', rosterData);
        // In production, this would be a Firebase Firestore call:
        // await addDoc(collection(db, 'rosters'), rosterData);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    // Copy previous month's roster (admin only)
    const copyPreviousMonth = () => {
        if (!uid) {
            alert('Access denied. Only administrators can copy rosters.');
            return;
        }
        console.log('Copying previous month roster');
        // API call would go here
    };

    // Export roster
    const exportRoster = () => {

        if (!currentUser) return
        const rosterData: RosterData = {
            month: months[selectedMonth],
            year: selectedYear,
            shifts,
            createdAt: new Date().toISOString(),
            createdBy: currentUser?.uid
        };
        const dataStr = JSON.stringify(rosterData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileDefaultName = `roster-${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };

    // Quick add shift from template
    const quickAddShift = (day: number, template: typeof shiftTemplates[0]) => {
        if (!selectedStaff) return;
        const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        addShift(selectedStaff, dateStr, template.start, template.end);
    };


    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            {/* Success notification */}
            {showSuccess && (
                <SuccessAlert />
            )}

            <div className="max-w-400 mx-auto space-y-6">
                {/* Header */}
                <Card>
                    <CardHeader>
                        <div className="flex flex-col gap-4">
                            {/* Title and Actions Row */}
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                <div className="flex-1">
                                    <CardTitle className="text-2xl sm:text-3xl font-bold tracking-tight">
                                        Create Staff Roster
                                    </CardTitle>
                                    <CardDescription className="text-sm sm:text-base mt-2">
                                        Schedule your hospitality staff for {months[selectedMonth]} {selectedYear}
                                    </CardDescription>
                                    <Badge variant="secondary" className="mt-3 w-fit">
                                        <Shield className="w-3 h-3 mr-1" />
                                        Admin Access
                                    </Badge>
                                </div>

                                {/* Desktop Action Buttons */}
                                <div className="hidden md:flex flex-wrap gap-2">
                                    <Button variant="outline" onClick={copyPreviousMonth} className="gap-2">
                                        <Copy className="w-4 h-4" />
                                        <span className="hidden lg:inline">Copy Previous</span>
                                    </Button>
                                    <Button variant="outline" onClick={exportRoster} className="gap-2">
                                        <Download className="w-4 h-4" />
                                        <span className="hidden lg:inline">Export</span>
                                    </Button>
                                    <Button onClick={saveRoster} className="gap-2">
                                        <Save className="w-4 h-4" />
                                        Save Roster
                                    </Button>
                                </div>

                                {/* Mobile Action Button */}
                                <div className="md:hidden w-full">
                                    <Button onClick={saveRoster} className="w-full gap-2">
                                        <Save className="w-4 h-4" />
                                        Save Roster
                                    </Button>
                                </div>
                            </div>

                            {/* Month/Year Selector and View Toggle */}
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                <div className="grid grid-cols-2 sm:flex gap-3 flex-1">
                                    <div className="space-y-2">
                                        <Label htmlFor="month" className="text-xs sm:text-sm">Month</Label>
                                        <Select value={selectedMonth.toString()} onValueChange={(val) => setSelectedMonth(Number(val))}>
                                            <SelectTrigger id="month" className="w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {months.map((month, idx) => (
                                                    <SelectItem key={idx} value={idx.toString()}>
                                                        {month}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="year" className="text-xs sm:text-sm">Year</Label>
                                        <Select value={selectedYear.toString()} onValueChange={(val) => setSelectedYear(Number(val))}>
                                            <SelectTrigger id="year" className="w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {[2024, 2025, 2026, 2027, 2028].map(year => (
                                                    <SelectItem key={year} value={year.toString()}>
                                                        {year}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="w-full sm:w-auto sm:ml-auto">
                                    <Tabs value={viewMode} onValueChange={(val) => setViewMode(val as 'calendar' | 'list')} className="w-full">
                                        <TabsList className="grid w-full grid-cols-2">
                                            <TabsTrigger value="calendar" className="gap-2 text-xs sm:text-sm">
                                                <Calendar className="w-4 h-4" />
                                                <span className="hidden sm:inline">Calendar</span>
                                            </TabsTrigger>
                                            <TabsTrigger value="list" className="gap-2 text-xs sm:text-sm">
                                                <Users className="w-4 h-4" />
                                                <span className="hidden sm:inline">Staff List</span>
                                            </TabsTrigger>
                                        </TabsList>
                                    </Tabs>
                                </div>
                            </div>

                            {/* Mobile Action Buttons Row */}
                            <div className="md:hidden grid grid-cols-2 gap-2">
                                <Button variant="outline" size="sm" onClick={copyPreviousMonth} className="gap-2">
                                    <Copy className="w-4 h-4" />
                                    Copy
                                </Button>
                                <Button variant="outline" size="sm" onClick={exportRoster} className="gap-2">
                                    <Download className="w-4 h-4" />
                                    Export
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {/* Main Content Grid */}
                <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-[320px_1fr] lg:gap-6">
                    {/* Mobile Staff Menu Button */}
                    <div className="lg:hidden">
                        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                            <SheetTrigger asChild>
                                <Button variant="outline" className="w-full gap-2">
                                    <Menu className="w-4 h-4" />
                                    Staff & Templates
                                    {selectedStaff && (
                                        <Badge variant="secondary" className="ml-auto">
                                            {staffMembers.find(s => s.id === selectedStaff)?.name.split(' ')[0]}
                                        </Badge>
                                    )}
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-75 sm:w-100 overflow-y-auto">
                                <SheetHeader>
                                    <SheetTitle>Staff Management</SheetTitle>
                                    <SheetDescription>
                                        Select staff and use quick shift templates
                                    </SheetDescription>
                                </SheetHeader>
                                <div className="mt-6 space-y-4">
                                    {/* Staff List in Sheet */}
                                    <StaffListSection
                                        staffMembers={staffMembers}
                                        selectedStaff={selectedStaff}
                                        setSelectedStaff={setSelectedStaff}
                                        getShiftsForStaff={getShiftsForStaff}
                                        isAddStaffDialogOpen={isAddStaffDialogOpen}
                                        setIsAddStaffDialogOpen={setIsAddStaffDialogOpen}
                                        newStaffData={newStaffData}
                                        setNewStaffData={setNewStaffData}
                                        addStaffMember={addStaffMember}
                                    />
                                    {/* Shift Templates in Sheet */}
                                    {selectedStaff && (
                                        <ShiftTemplatesSection
                                            shiftTemplates={shiftTemplates}
                                            selectedDate={selectedDate}
                                            setSelectedTemplate={setSelectedTemplate}
                                        />
                                    )}
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

                    {/* Desktop Sidebar - Staff List */}
                    <div className="hidden lg:block space-y-4">
                        <Card className="sticky top-4">
                            <StaffListSection
                                staffMembers={staffMembers}
                                selectedStaff={selectedStaff}
                                setSelectedStaff={setSelectedStaff}
                                getShiftsForStaff={getShiftsForStaff}
                                isAddStaffDialogOpen={isAddStaffDialogOpen}
                                setIsAddStaffDialogOpen={setIsAddStaffDialogOpen}
                                newStaffData={newStaffData}
                                setNewStaffData={setNewStaffData}
                                addStaffMember={addStaffMember}
                            />
                        </Card>

                        {/* Shift Templates */}
                        {selectedStaff && (
                            <Card>
                                <ShiftTemplatesSection
                                    shiftTemplates={shiftTemplates}
                                    selectedDate={selectedDate}
                                    setSelectedTemplate={setSelectedTemplate} />
                            </Card>
                        )}
                    </div>

                    {/* Main Calendar/List View */}
                    <Card>
                        <CardContent className="p-3 sm:p-6">
                            {viewMode === 'calendar' ? (
                                <div className="space-y-4">
                                    {/* Calendar Header */}
                                    <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center font-semibold text-xs sm:text-sm text-muted-foreground mb-2">
                                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                            <div key={day} className="hidden sm:block">{day}</div>
                                        ))}
                                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                                            <div key={`mobile-${idx}`} className="sm:hidden">{day}</div>
                                        ))}
                                    </div>

                                    {/* Calendar Grid */}
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

                                    />

                                    {/* Mobile Quick Add Panel */}
                                    {selectedDate && selectedStaff && (
                                        <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-background border-t p-4 space-y-2 z-10">
                                            <div className="text-sm font-semibold mb-2">
                                                Add shift for {new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                {shiftTemplates.map((template, idx) => (
                                                    <Button
                                                        key={idx}
                                                        size="sm"
                                                        variant="secondary"
                                                        onClick={() => {
                                                            const day = new Date(selectedDate).getDate();
                                                            quickAddShift(day, template);
                                                        }}
                                                    >
                                                        {template.label}
                                                    </Button>
                                                ))}
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full"
                                                onClick={() => setSelectedDate('')}
                                            >
                                                Close
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                // List View
                                <div className="space-y-4">
                                    {staffMembers.map(staff => {
                                        const staffShifts = getShiftsForStaff(staff.id).sort((a, b) =>
                                            new Date(a.date).getTime() - new Date(b.date).getTime()
                                        );

                                        return (
                                            <Card key={staff.id}>
                                                <CardHeader className="pb-3">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg sm:text-xl shrink-0"
                                                            style={{ backgroundColor: staff.color }}
                                                        >
                                                            {staff.name.charAt(0)}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <CardTitle className="text-base sm:text-lg truncate">{staff.name}</CardTitle>
                                                            <CardDescription className="text-xs sm:text-sm">
                                                                {staff.department} • {staffShifts.length} shifts scheduled
                                                            </CardDescription>
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                                <CardContent>
                                                    {staffShifts.length > 0 ? (
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                                            {staffShifts.map(shift => (
                                                                <div
                                                                    key={shift.id}
                                                                    className="p-3 rounded-lg border bg-muted/50 relative group"
                                                                >
                                                                    <div className="font-semibold text-sm mb-1">
                                                                        {new Date(shift.date).toLocaleDateString('en-US', {
                                                                            month: 'short',
                                                                            day: 'numeric',
                                                                            weekday: 'short'
                                                                        })}
                                                                    </div>
                                                                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                                        <Clock className="w-3 h-3" />
                                                                        {shift.startTime} - {shift.endTime}
                                                                    </div>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="destructive"
                                                                        className="absolute top-2 right-2 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                        onClick={() => removeShift(shift.id)}
                                                                    >
                                                                        <Trash2 className="w-3 h-3" />
                                                                    </Button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="text-center py-8 text-muted-foreground text-sm">
                                                            No shifts scheduled yet
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AdminCreateRosterPage;