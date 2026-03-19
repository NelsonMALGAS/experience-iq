"use client"

import { useEffect, useState } from 'react';
import { Calendar, Users, Clock, Save, Download, Copy, Trash2, Shield, Menu, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

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
import { months, shiftTemplates, staffColorPalette, years } from '@/constants';
import { toast } from 'sonner';
import { addShiftToRoster, createRoster, removeShiftFromRoster } from '@/app/actions/rosterActions';
import Link from 'next/link';
import { fetchRosterByMonthYear } from '@/app/actions/roster';
import { ShiftNotesPopover } from './ShiftNotesPopover';

type AdminCreateProps = {
    role: Role
    uid: string
    staff: StaffMember[]
    existingRosterId?: string
}

type NewStaffType = {
    name: string
    email: string
    department: IssueCategory
    role: Role
}

const AdminCreateRosterPage = ({ role, uid, staff, existingRosterId }: AdminCreateProps) => {
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
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [rosterId, setRosterId] = useState<string | undefined>(existingRosterId);
    const [newStaffData, setNewStaffData] = useState<NewStaffType>({
        name: '',
        email: '',
        department: 'other',
        role: "staff"
    });

    // ✅ NEW: Load roster when month/year changes
    useEffect(() => {
        const loadRoster = async () => {
            setIsLoading(true);

            try {
                const result = await fetchRosterByMonthYear(months[selectedMonth], selectedYear);

                if (result.success && result.data) {
                    // Roster exists - load it
                    setRosterId(result.data.id);
                    setShifts(result.data.shifts || []);

                    toast.success('Roster Loaded', {
                        description: `Loaded ${result.data.shifts?.length || 0} shifts for ${months[selectedMonth]} ${selectedYear}`,
                    });
                } else {
                    // No roster exists for this month/year - reset
                    setRosterId(undefined);
                    setShifts([]);

                    // Only show info toast, not error
                    toast.info(`No roster found for ${months[selectedMonth]} ${selectedYear}`);
                }
            } catch (error) {
                console.error("Error loading roster:", error);
                toast.error('Error', {
                    description: 'Failed to load roster. You can still create a new one.',
                });

                // Reset on error
                setRosterId(undefined);
                setShifts([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadRoster();
    }, [selectedMonth, selectedYear]);

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
        return date > start && date < end;
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


    // Add shift - now using server action
    const addShift = async (staffId: string, date: string, startTime: string, endTime: string, notes?: string) => {
        if (!uid) {
            toast.error("Access Denied", { description: 'Only administrators can create shifts.' });
            return;
        }

        const staffMember = staffMembers.find(s => s.id === staffId);
        if (!staffMember) {
            toast.error('Error', { description: 'Invalid staff member selected.' });
            return;
        }

        // Ensure roster exists (create if doesn't exist)
        if (!rosterId) {
            const result = await createRoster({
                month: months[selectedMonth],
                year: selectedYear,
                shifts: [],
            });

            if (result.success && result.data) {
                setRosterId(result.data.id);
                toast.success('Roster ready', { description: 'Now adding your shift...' });
            } else {
                toast.error('Error', { description: result.message });
                return;
            }
        }

        // Create new shift
        const newShift: Shift = { id: crypto.randomUUID(), staffId, date, startTime, endTime, notes };
        setShifts(prev => [...prev, newShift]);

        // Add shift to server
        try {
            const result = await addShiftToRoster(rosterId!, { staffId, date, startTime, endTime, notes });
            if (!result.success) {
                setShifts(prev => prev.filter(s => s.id !== newShift.id));
                toast.error('Error', { description: result.message });
            } else {
                toast.success('Success', { description: 'Shift added successfully.' });
            }
        } catch (error) {
            console.error("Error adding shift:", error);
            setShifts(prev => prev.filter(s => s.id !== newShift.id));
            toast.error('Error', { description: 'Failed to add shift.' });
        }
    };

    // In AdminCreateRosterPage
    const handleNotesUpdated = (shiftId: string, notes: string) => {
        setShifts(prev =>
            prev.map(s => s.id === shiftId ? { ...s, notes: notes.trim() || undefined } : s)
        );
    };

    // Remove shift - now using server action
    const removeShift = async (shiftId: string) => {
        if (!uid) {
            toast.error('Access Denied', {
                description: 'Only administrators can remove shifts.',
            });
            return;
        }

        if (!rosterId) {
            toast.error('Error', {
                description: 'Roster ID not found.',
            });
            return;
        }

        // Remove locally first for immediate UI update
        const originalShifts = [...shifts];
        setShifts(shifts.filter(s => s.id !== shiftId));

        // Then sync with server
        try {
            const result = await removeShiftFromRoster(rosterId, shiftId);

            if (!result.success) {
                // Rollback on failure
                setShifts(originalShifts);
                toast.error('Error', {
                    description: result.message,
                });
            } else {
                toast.success('Success', {
                    description: 'Shift removed successfully.',
                });
            }
        } catch (error) {
            console.error("Error:", error);
            setShifts(originalShifts);
            toast.error('Error', {
                description: 'Failed to remove shift.',
            });
        }
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
    const addStaffMember = (disabled = true) => {
        if (!uid) {
            toast.error('Access Denied', {
                description: 'Only administrators can add staff members.',
            });
            return;
        }

        if (disabled) {
            toast.error('Action Disabled', {
                description: 'Staff members are automatically added when they are verified',
            });
            return
        }

        if (newStaffData.name && newStaffData.email && newStaffData.department && newStaffData.role) {
            const newStaff: StaffMember = {
                id: Date.now().toString(),
                name: newStaffData.name,
                email: newStaffData.email,
                department: newStaffData.department,
                color: staffColorPalette[staffMembers.length % staffColorPalette.length],
                isVerified: false,
                role: newStaffData.role
            };
            setStaffMembers([...staffMembers, newStaff]);
            setNewStaffData({ name: '', email: '', department: 'other', role: "staff" });
            setIsAddStaffDialogOpen(false);

            toast.success('Success', {
                description: 'Staff member added successfully.',
            });
        }
    };

    // Save roster - now using server action
    const saveRoster = async () => {
        if (!uid) {
            toast.error('Access Denied', {
                description: 'Only administrators can save rosters.',
            });
            return;
        }

        setIsSaving(true);

        try {
            // If rosterId doesn't exist, create new roster
            if (!rosterId) {
                const result = await createRoster({
                    month: months[selectedMonth],
                    year: selectedYear,
                    shifts,
                });

                if (result.success && result.data) {
                    setRosterId(result.data.id);
                    setShowSuccess(true);
                    setTimeout(() => setShowSuccess(false), 3000);

                    toast.success('Success', {
                        description: 'Roster created successfully. You can now add shifts!',
                    });
                } else {
                    toast.error('Error', {
                        description: result.message,
                    });
                }
            } else {
                // Roster already exists, shifts are auto-saved via server actions
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 3000);

                toast.success('Success', {
                    description: 'Roster saved successfully.',
                });
            }
        } catch (error) {
            console.error('Error saving roster:', error);
            toast.error('Error', {
                description: 'Failed to save roster.',
            });
        } finally {
            setIsSaving(false);
        }
    };

    // Copy previous month's roster (admin only)
    const copyPreviousMonth = () => {
        if (!uid) {
            toast.error('Access Denied', {
                description: 'Only administrators can copy rosters.',
            });
            return;
        }

        toast.info('Info', {
            description: 'Copy previous month feature coming soon.',
        });
        // API call would go here
    };

    // Export roster
    const exportRoster = () => {
        if (!currentUser) return;

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

        toast.success('Success', {
            description: 'Roster exported successfully.',
        });
    };

    // Quick add shift from template - ✅ UPDATED with guard
    const quickAddShift = (day: number, template: typeof shiftTemplates[0]) => {
        if (!selectedStaff) return;

        const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        // ✅ GUARD: Prevent adding shift if staff already has one on this date
        const existingShift = shifts.find(
            shift => shift.staffId === selectedStaff && shift.date === dateStr
        );

        if (existingShift) {
            toast.error('Already Assigned', {
                description: `${staffMembers.find(s => s.id === selectedStaff)?.name} already has a shift on this day.`
            });
            return;
        }

        addShift(selectedStaff, dateStr, template.start, template.end);
    };

    return (
        <div className="min-h-screen bg-background p-3 sm:p-4 md:p-6 lg:p-8">
            {/* Success notification */}
            {showSuccess && (
                <SuccessAlert />
            )}

            <div className="max-w-480 mx-auto space-y-4 sm:space-y-6">
                {/* ✅ NEW: Loading state alert */}
                {isLoading && (
                    <Alert>
                        <Clock className="h-4 w-4 animate-spin" />
                        <AlertTitle>Loading Roster</AlertTitle>
                        <AlertDescription>
                            Fetching roster data for {months[selectedMonth]} {selectedYear}...
                        </AlertDescription>
                    </Alert>
                )}

                {/* Info Alert for new roster */}
                {!rosterId && !isLoading && (
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>New Roster</AlertTitle>
                        <AlertDescription>
                            No roster exists for {months[selectedMonth]} {selectedYear}.
                            Click &quot;Create Roster&quot; to start scheduling shifts.
                        </AlertDescription>
                    </Alert>
                )}

                {/* ✅ NEW: Roster loaded alert */}
                {rosterId && !isLoading && (
                    <Alert className="border-primary/50 bg-primary/5">
                        <Shield className="h-4 w-4 text-primary" />
                        <AlertTitle className="text-primary">Roster Loaded</AlertTitle>
                        <AlertDescription>
                            Editing roster for {months[selectedMonth]} {selectedYear} • {shifts.length} shift{shifts.length !== 1 ? 's' : ''} scheduled
                        </AlertDescription>
                    </Alert>
                )}

                {/* Header */}
                <Card>
                    <CardHeader className="p-4 sm:p-6">
                        <div className="flex flex-col gap-5">

                            {/* Back button */}
                            <Link href="/admin" className="w-fit">
                                <Button variant="ghost" size="sm" className="gap-2 hover:bg-muted">
                                    <ArrowLeft className="h-4 w-4" />
                                    Back to Dashboard
                                </Button>
                            </Link>

                            {/* Title + primary actions */}
                            <div className="flex flex-col lg:flex-row lg:items-start gap-4 lg:gap-6">
                                {/* Title section */}
                                <div className="flex-1 min-w-0">
                                    <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
                                        {rosterId ? "Edit" : "Create"} Staff Roster
                                    </CardTitle>

                                    <CardDescription className="mt-2 text-sm sm:text-base">
                                        Schedule your hospitality staff for{" "}
                                        <span className="font-medium">
                                            {months[selectedMonth]} {selectedYear}
                                        </span>
                                    </CardDescription>

                                    <div className="flex flex-wrap gap-2 mt-3">
                                        <Badge variant="secondary" className="text-xs">
                                            <Shield className="w-3 h-3 mr-1" />
                                            Admin Access
                                        </Badge>

                                        {rosterId && (
                                            <Badge variant="outline" className="text-xs">
                                                Roster ID: {rosterId.slice(0, 8)}…
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                                    <Button
                                        variant="outline"
                                        onClick={copyPreviousMonth}
                                        disabled={isSaving || isLoading}
                                        className="flex-1 sm:flex-none gap-2"
                                    >
                                        <Copy className="w-4 h-4" />
                                        <span className="hidden sm:inline">Copy Previous</span>
                                    </Button>

                                    <Button
                                        variant="outline"
                                        onClick={exportRoster}
                                        disabled={isSaving || isLoading}
                                        className="flex-1 sm:flex-none gap-2"
                                    >
                                        <Download className="w-4 h-4" />
                                        <span className="hidden sm:inline">Export</span>
                                    </Button>

                                    <Button
                                        onClick={saveRoster}
                                        disabled={isSaving || isLoading}
                                        className="flex-1 sm:flex-none gap-2"
                                    >
                                        <Save className="w-4 h-4" />
                                        {isSaving
                                            ? "Saving…"
                                            : rosterId
                                                ? "Save Changes"
                                                : "Create Roster"}
                                    </Button>
                                </div>
                            </div>

                            {/* Filters + view toggle */}
                            <div className="flex flex-col md:flex-row md:items-end gap-4">
                                {/* Month / Year */}
                                <div className="flex items-end gap-2 sm:gap-3">

                                    <div className="space-y-1.5">
                                        <Label htmlFor="month" className="text-xs sm:text-sm">
                                            Month
                                        </Label>
                                        <Select
                                            value={selectedMonth.toString()}
                                            onValueChange={(val) => setSelectedMonth(Number(val))}
                                            disabled={isLoading} // ✅ Disable while loading
                                        >
                                            <SelectTrigger id="month" className="h-9 sm:h-10">
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

                                    <div className="space-y-1.5">
                                        <Label htmlFor="year" className="text-xs sm:text-sm">
                                            Year
                                        </Label>
                                        <Select
                                            value={selectedYear.toString()}
                                            onValueChange={(val) => setSelectedYear(Number(val))}
                                            disabled={isLoading} // ✅ Disable while loading
                                        >
                                            <SelectTrigger id="year" className="h-9 sm:h-10">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {years.map((year) => (
                                                    <SelectItem key={year} value={year.toString()}>
                                                        {year}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* View toggle */}
                                <Tabs
                                    value={viewMode}
                                    onValueChange={(val) =>
                                        setViewMode(val as "calendar" | "list")
                                    }
                                    className="w-full md:w-auto"
                                >
                                    <TabsList className="grid grid-cols-2 h-9 sm:h-10">
                                        <TabsTrigger
                                            value="calendar"
                                            className="gap-2 text-xs sm:text-sm"
                                        >
                                            <Calendar className="w-4 h-4" />
                                            Calendar
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="list"
                                            className="gap-2 text-xs sm:text-sm"
                                        >
                                            <Users className="w-4 h-4" />
                                            Staff List
                                        </TabsTrigger>
                                    </TabsList>
                                </Tabs>
                            </div>
                        </div>
                    </CardHeader>

                </Card>

                {/* Main Content Grid */}
                <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-[280px_1fr] xl:grid-cols-[320px_1fr] lg:gap-4 xl:gap-6">
                    {/* Mobile Staff Menu Button */}
                    <div className="lg:hidden">
                        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                            <SheetTrigger asChild>
                                <Button variant="outline" className="w-full gap-2 h-auto py-3" disabled={isLoading}>
                                    <Menu className="w-4 h-4" />
                                    <span className="flex-1 text-left">Staff & Templates</span>
                                    {selectedStaff && (
                                        <Badge variant="secondary" className="text-xs">
                                            {staffMembers.find(s => s.id === selectedStaff)?.name.split(' ')[0]}
                                        </Badge>
                                    )}
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-[85vw] sm:w-100 overflow-y-auto p-4 sm:p-6">
                                <SheetHeader className="mb-4">
                                    <SheetTitle className="text-lg sm:text-xl">Staff Management</SheetTitle>
                                    <SheetDescription className="text-xs sm:text-sm">
                                        Select staff and use quick shift templates
                                    </SheetDescription>
                                </SheetHeader>
                                <div className="space-y-4">
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
                                    setSelectedTemplate={setSelectedTemplate}
                                />
                            </Card>
                        )}
                    </div>

                    {/* Main Calendar/List View */}
                    <Card>
                        <CardContent className="p-3 sm:p-4 md:p-6">
                            {/* ✅ Show loading skeleton while fetching */}
                            {isLoading ? (
                                <div className="space-y-3 animate-pulse">
                                    <div className="grid grid-cols-7 gap-2">
                                        {Array.from({ length: 35 }).map((_, i) => (
                                            <div key={i} className="aspect-square bg-muted rounded-lg" />
                                        ))}
                                    </div>
                                </div>
                            ) : viewMode === 'calendar' ? (
                                <div className="space-y-3 sm:space-y-4">
                                    {/* Calendar Header */}
                                    <div className="grid grid-cols-7 gap-0.5 sm:gap-1 md:gap-2 text-center font-semibold text-[10px] xs:text-xs sm:text-sm text-muted-foreground mb-2">
                                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                            <div key={day} className="hidden sm:block py-1">{day}</div>
                                        ))}
                                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                                            <div key={`mobile-${idx}`} className="sm:hidden py-1">{day}</div>
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
                                        rosterId={rosterId}
                                        onNotesUpdated={handleNotesUpdated}
                                    />

                                    {/* Mobile Quick Add Panel */}
                                    {selectedDate && selectedStaff && rosterId && (
                                        <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-background border-t p-3 sm:p-4 space-y-2 z-50 shadow-lg">
                                            <div className="text-xs sm:text-sm font-semibold mb-2">
                                                Add shift for {new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                {shiftTemplates.map((template, idx) => (
                                                    <Button
                                                        key={idx}
                                                        size="sm"
                                                        variant="secondary"
                                                        className="text-xs h-9"
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
                                                className="w-full text-xs h-9"
                                                onClick={() => setSelectedDate('')}
                                            >
                                                Close
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                // List View
                                <div className="space-y-3 sm:space-y-4">
                                    {staffMembers.map(staff => {
                                        const staffShifts = getShiftsForStaff(staff.id).sort((a, b) =>
                                            new Date(a.date).getTime() - new Date(b.date).getTime()
                                        );

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
                                                                {staff.department} • {staffShifts.length} shift{staffShifts.length !== 1 ? 's' : ''} scheduled
                                                            </CardDescription>
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="p-3 sm:p-4 pt-0">
                                                    {staffShifts.length > 0 ? (
                                                        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3">
                                                            {staffShifts.map(shift => (
                                                                <div
                                                                    key={shift.id}
                                                                    className="p-2.5 sm:p-3 rounded-lg border bg-muted/50 relative group"
                                                                >
                                                                    <div className="font-semibold text-xs sm:text-sm mb-1">
                                                                        {new Date(shift.date).toLocaleDateString('en-US', {
                                                                            month: 'short',
                                                                            day: 'numeric',
                                                                            weekday: 'short'
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
                                                                            onNotesUpdated={handleNotesUpdated}
                                                                        />

                                                                        <Button
                                                                            size="sm"
                                                                            variant="destructive"
                                                                            className="h-6 w-6 sm:h-7 sm:w-7 p-0 md:absolute md:top-2 md:right-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity"
                                                                            onClick={() => removeShift(shift.id)}
                                                                        >
                                                                            <Trash2 className="w-3 h-3" />
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="text-center py-6 sm:py-8 text-muted-foreground text-xs sm:text-sm">
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