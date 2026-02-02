"use client"

import { useState } from 'react';
import { Calendar, Users, Clock, Save, Download, Copy, Plus, Trash2, AlertCircle, CheckCircle2, UserX, Shield, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { useUserStore } from '@/store/useUserStore';


interface StaffMember {
    id: string;
    name: string;
    email: string;
    department: string;
    color: string;
    isVerified: boolean;
}

interface Shift {
    id: string;
    staffId: string;
    date: string;
    startTime: string;
    endTime: string;
    notes?: string;
}

interface RosterData {
    month: string;
    year: number;
    shifts: Shift[];
    createdBy: string;
    createdAt: string;
}

// Staff List Section Component
const StaffListSection = ({
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
    newStaffData: { name: string; email: string; department: string };
    setNewStaffData: (data: { name: string; email: string; department: string }) => void;
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
                                        onValueChange={(val) => setNewStaffData({ ...newStaffData, department: val })}
                                    >
                                        <SelectTrigger id="staff-department">
                                            <SelectValue placeholder="Select department" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Housekeeping">Housekeeping</SelectItem>
                                            <SelectItem value="Maintenance">Maintenance</SelectItem>
                                            <SelectItem value="Food & Beverage">Food & Beverage</SelectItem>
                                            <SelectItem value="Guest Services">Guest Services</SelectItem>
                                            <SelectItem value="Security">Security</SelectItem>
                                            <SelectItem value="Management">Management</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsAddStaffDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={addStaffMember}>Add Staff</Button>
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

// Shift Templates Section Component
const ShiftTemplatesSection = ({
    shiftTemplates,
    selectedDate,
}: {
    shiftTemplates: Array<{ label: string; start: string; end: string; color: string }>;
    selectedDate: string;
}) => {
    return (
        <>
            <CardHeader>
                <CardTitle className="text-lg">Quick Add Shifts</CardTitle>
                <CardDescription className="text-xs">
                    Select a date on the calendar, then click a template
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
                {shiftTemplates.map((template, idx) => (
                    <div
                        key={idx}
                        className={`p-3 rounded-lg border ${template.color}`}
                    >
                        <div className="font-semibold text-sm">{template.label}</div>
                        <div className="text-xs flex items-center gap-1 mt-1 opacity-80">
                            <Clock className="w-3 h-3" />
                            {template.start} - {template.end}
                        </div>
                    </div>
                ))}
                {selectedDate && (
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                            Click any template above to add a shift on {new Date(selectedDate).toLocaleDateString()}
                        </AlertDescription>
                    </Alert>
                )}
            </CardContent>
        </>
    );
};

const AdminCreateRosterPage = () => {
    const { currentUser } = useUserStore();
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [staffMembers, setStaffMembers] = useState<StaffMember[]>([
        { id: '1', name: 'Sarah Johnson', email: 'sarah@example.com', department: 'Housekeeping', color: 'hsl(var(--chart-1))', isVerified: true },
        { id: '2', name: 'Michael Chen', email: 'michael@example.com', department: 'Maintenance', color: 'hsl(var(--chart-2))', isVerified: true },
        { id: '3', name: 'Emma Davis', email: 'emma@example.com', department: 'Food & Beverage', color: 'hsl(var(--chart-3))', isVerified: true },
        { id: '4', name: 'James Wilson', email: 'james@example.com', department: 'Guest Services', color: 'hsl(var(--chart-4))', isVerified: false },
        { id: '5', name: 'Lisa Anderson', email: 'lisa@example.com', department: 'Housekeeping', color: 'hsl(var(--chart-5))', isVerified: true },
    ]);
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [selectedStaff, setSelectedStaff] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
    const [showSuccess, setShowSuccess] = useState(false);
    const [isAddStaffDialogOpen, setIsAddStaffDialogOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [newStaffData, setNewStaffData] = useState({
        name: '',
        email: '',
        department: '',
    });

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const shiftTemplates = [
        { label: 'Morning', start: '06:00', end: '14:00', color: 'bg-amber-500/20 text-amber-700 dark:text-amber-300' },
        { label: 'Afternoon', start: '14:00', end: '22:00', color: 'bg-blue-500/20 text-blue-700 dark:text-blue-300' },
        { label: 'Night', start: '22:00', end: '06:00', color: 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300' },
        { label: 'Full Day', start: '09:00', end: '17:00', color: 'bg-green-500/20 text-green-700 dark:text-green-300' },
    ];

    const staffColorPalette = [
        'hsl(var(--chart-1))',
        'hsl(var(--chart-2))',
        'hsl(var(--chart-3))',
        'hsl(var(--chart-4))',
        'hsl(var(--chart-5))',
    ];

    // Access Control Check
    const hasAdminAccess = currentUser?.role === 'admin';

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
        if (!hasAdminAccess) {
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
        if (!hasAdminAccess) {
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
        if (!hasAdminAccess) {
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
            setNewStaffData({ name: '', email: '', department: '' });
            setIsAddStaffDialogOpen(false);
        }
    };

    // Save roster (admin only)
    const saveRoster = () => {
        if (!hasAdminAccess) {
            alert('Access denied. Only administrators can save rosters.');
            return;
        }

        if (!currentUser?.uid) {
            alert('User not authenticated.');
            return;
        }

        const rosterData: RosterData = {
            month: months[selectedMonth],
            year: selectedYear,
            shifts,
            createdBy: currentUser.uid,
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
        if (!hasAdminAccess) {
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

    // If not admin, show access denied
    if (!hasAdminAccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <Card className="max-w-md w-full">
                    <CardHeader>
                        <div className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-destructive/10 mx-auto mb-4">
                            <Shield className="w-7 h-7 sm:w-8 sm:h-8 text-destructive" />
                        </div>
                        <CardTitle className="text-center text-xl sm:text-2xl">Access Denied</CardTitle>
                        <CardDescription className="text-center text-sm sm:text-base">
                            You need administrator privileges to access this page.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Alert>
                            <UserX className="h-4 w-4" />
                            <AlertDescription className="text-sm">
                                Current role: <Badge variant="outline" className="ml-2">{currentUser?.role || 'unknown'}</Badge>
                            </AlertDescription>
                        </Alert>
                        <div className="text-center text-xs sm:text-sm text-muted-foreground">
                            Please contact your system administrator if you believe this is an error.
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            {/* Success notification */}
            {showSuccess && (
                <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right">
                    <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <AlertDescription className="text-green-600 dark:text-green-400 font-medium">
                            Roster saved successfully!
                        </AlertDescription>
                    </Alert>
                </div>
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
                                />
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
                                    <div className="grid grid-cols-7 gap-1 sm:gap-2">
                                        {/* Empty cells for days before month starts */}
                                        {Array.from({ length: firstDay }).map((_, idx) => (
                                            <div key={`empty-${idx}`} className="aspect-square" />
                                        ))}

                                        {/* Days of the month */}
                                        {Array.from({ length: daysInMonth }).map((_, idx) => {
                                            const day = idx + 1;
                                            const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                            const dayShifts = getShiftsForDate(dateStr);
                                            const isToday = new Date().getDate() === day &&
                                                new Date().getMonth() === selectedMonth &&
                                                new Date().getFullYear() === selectedYear;
                                            const isSelected = selectedDate === dateStr;

                                            return (
                                                <div
                                                    key={day}
                                                    onClick={() => {
                                                        setSelectedDate(isSelected ? '' : dateStr);
                                                        // Close mobile menu when date is selected
                                                        if (isMobileMenuOpen) setIsMobileMenuOpen(false);
                                                    }}
                                                    className={`
                            aspect-square p-1 sm:p-2 rounded-lg border-2 transition-all cursor-pointer
                            ${isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
                            ${isToday ? 'ring-1 sm:ring-2 ring-orange-500 ring-offset-1 sm:ring-offset-2' : ''}
                          `}
                                                >
                                                    <div className="h-full flex flex-col">
                                                        <div className="font-semibold text-[10px] sm:text-sm mb-0.5 sm:mb-1">{day}</div>
                                                        <div className="flex-1 space-y-0.5 sm:space-y-1 overflow-y-auto">
                                                            {dayShifts.map(shift => {
                                                                const staff = staffMembers.find(s => s.id === shift.staffId);
                                                                return (
                                                                    <div
                                                                        key={shift.id}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            removeShift(shift.id);
                                                                        }}
                                                                        className="text-[8px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 sm:py-1 rounded text-white font-medium flex items-center justify-between gap-0.5 sm:gap-1 hover:opacity-80 transition-opacity group"
                                                                        style={{ backgroundColor: staff?.color }}
                                                                        title={`${staff?.name} - Click to remove`}
                                                                    >
                                                                        <span className="truncate">{staff?.name.split(' ')[0]}</span>
                                                                        <Trash2 className="w-2 h-2 sm:w-3 sm:h-3 opacity-0 group-hover:opacity-100 shrink-0" />
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>

                                                        {/* Quick add buttons when date and staff are selected - Desktop only */}
                                                        {isSelected && selectedStaff && (
                                                            <div className="hidden sm:grid grid-cols-2 gap-1 mt-2">
                                                                {shiftTemplates.slice(0, 2).map((template, idx) => (
                                                                    <Button
                                                                        key={idx}
                                                                        size="sm"
                                                                        variant="secondary"
                                                                        className="h-6 text-[10px] px-1"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            quickAddShift(day, template);
                                                                        }}
                                                                    >
                                                                        {template.label}
                                                                    </Button>
                                                                ))}
                                                            </div>
                                                        )}

                                                        {/* Mobile - Show indicator when selected */}
                                                        {isSelected && selectedStaff && (
                                                            <div className="sm:hidden mt-1 text-center">
                                                                <div className="text-[8px] text-primary font-semibold">Selected</div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

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