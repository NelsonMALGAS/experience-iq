import { AlertCircle, Calendar, CalendarDays, Clock } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { auth, db } from "@/db/server";
import { RosterData, Shift } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { calculateDuration, formatDate, formatTime } from "@/lib/rosterHelpers";
import { Badge } from "../ui/badge";

interface StaffShift extends Shift {
    month: string;
    year: number;
    rosterId: string;
}

const RosterContent = async ({ uid }: { uid: string }) => {
    if (!auth || !db) throw new Error("Firebase admin not initialized");

    const staffShifts: StaffShift[] = [];
    let hasError = false;

    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
    const currentYear = currentDate.getFullYear();

    try {
        const rostersSnapshot = await db
            .collection('rosters')
            .where('month', '==', currentMonth)
            .where('year', '==', currentYear)
            .get();

        rostersSnapshot.forEach((doc) => {
            const rosterData = { id: doc.id, ...doc.data() } as RosterData;

            if (rosterData.shifts && Array.isArray(rosterData.shifts)) {
                const userShifts = rosterData.shifts
                    .filter((shift) => shift.staffId === uid)
                    .map((shift) => ({
                        ...shift,
                        month: rosterData.month,
                        year: rosterData.year,
                        rosterId: doc.id,
                    }));

                staffShifts.push(...userShifts);
            }
        });

        staffShifts.sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            return dateA - dateB;
        });
    } catch (error) {
        console.error('Error fetching rosters:', error);
        hasError = true;
    }

    return (
        <>
            {/* Error Alert */}
            {hasError && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Unable to load shifts</AlertTitle>
                    <AlertDescription>
                        We couldn&apos;t load your shifts at the moment. Please try refreshing the page.
                        If the problem persists, contact your administrator.
                    </AlertDescription>
                </Alert>
            )}

            {/* Stats Card */}
            {!hasError && staffShifts.length > 0 && (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base sm:text-lg">Schedule Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            <div className="space-y-1">
                                <p className="text-xs sm:text-sm text-muted-foreground">Total Shifts</p>
                                <p className="text-xl sm:text-2xl font-bold tabular-nums">{staffShifts.length}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs sm:text-sm text-muted-foreground">Total Hours</p>
                                <p className="text-xl sm:text-2xl font-bold tabular-nums">
                                    {staffShifts.reduce((total, shift) => {
                                        const [startHours, startMinutes] = shift.startTime.split(':').map(Number);
                                        const [endHours, endMinutes] = shift.endTime.split(':').map(Number);
                                        let durationMinutes = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
                                        if (durationMinutes < 0) durationMinutes += 24 * 60;
                                        return total + durationMinutes / 60;
                                    }, 0).toFixed(1)}h
                                </p>
                            </div>
                            <div className="space-y-1 col-span-2 sm:col-span-1">
                                <p className="text-xs sm:text-sm text-muted-foreground">Next Shift</p>
                                <p className="text-sm sm:text-base font-semibold">
                                    {(() => {
                                        const today = new Date();
                                        today.setHours(0, 0, 0, 0);
                                        const upcomingShifts = staffShifts.filter(
                                            (shift) => new Date(shift.date) >= today
                                        );
                                        if (upcomingShifts.length === 0) return 'None';
                                        const nextShift = upcomingShifts[0];
                                        return new Date(nextShift.date).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                        });
                                    })()}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Shifts Display */}
            {!hasError && staffShifts.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16">
                        <CalendarDays className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mb-4" />
                        <h3 className="text-lg sm:text-xl font-semibold mb-2">No Shifts Scheduled</h3>
                        <p className="text-sm sm:text-base text-muted-foreground text-center max-w-md px-4">
                            You don&apos;t have any shifts scheduled for {currentMonth} {currentYear} yet.
                            Check back later or contact your manager if you think this is an error.
                        </p>
                    </CardContent>
                </Card>
            ) : !hasError ? (
                <div className="space-y-3 sm:space-y-4">
                    {/* Desktop Table View */}
                    <Card className="hidden md:block">
                        <CardHeader>
                            <CardTitle className="text-lg">Your Schedule</CardTitle>
                            <CardDescription>
                                All your shifts for {currentMonth} {currentYear}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-3 px-4 font-semibold text-sm">Date</th>
                                            <th className="text-left py-3 px-4 font-semibold text-sm">Start Time</th>
                                            <th className="text-left py-3 px-4 font-semibold text-sm">End Time</th>
                                            <th className="text-left py-3 px-4 font-semibold text-sm">Duration</th>
                                            <th className="text-left py-3 px-4 font-semibold text-sm">Notes</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {staffShifts.map((shift, index) => {
                                            const isPast = new Date(shift.date) < new Date();
                                            return (
                                                <tr
                                                    key={`${shift.rosterId}-${shift.id}-${index}`}
                                                    className={`border-b hover:bg-muted/50 transition-colors ${isPast ? 'opacity-60' : ''}`}
                                                >
                                                    <td className="py-3 px-4">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="w-4 h-4 text-muted-foreground" />
                                                            <span className="font-medium">{formatDate(shift.date)}</span>
                                                            {isPast && (
                                                                <Badge variant="secondary" className="text-xs">Past</Badge>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="w-4 h-4 text-muted-foreground" />
                                                            {formatTime(shift.startTime)}
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4">{formatTime(shift.endTime)}</td>
                                                    <td className="py-3 px-4">
                                                        <Badge variant="outline">
                                                            {calculateDuration(shift.startTime, shift.endTime)}
                                                        </Badge>
                                                    </td>
                                                    <td className="py-3 px-4 text-sm text-muted-foreground">
                                                        {shift.notes || '-'}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Mobile/Tablet Card View */}
                    <div className="md:hidden space-y-3">
                        {staffShifts.map((shift, index) => {
                            const isPast = new Date(shift.date) < new Date();
                            return (
                                <Card
                                    key={`${shift.rosterId}-${shift.id}-${index}`}
                                    className={isPast ? 'opacity-60' : ''}
                                >
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1">
                                                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                                                    <Calendar className="w-4 h-4" />
                                                    {formatDate(shift.date)}
                                                </CardTitle>
                                                <CardDescription className="text-xs sm:text-sm">
                                                    {shift.month} {shift.year}
                                                </CardDescription>
                                            </div>
                                            {isPast && (
                                                <Badge variant="secondary" className="text-xs">Past</Badge>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <p className="text-xs text-muted-foreground">Start Time</p>
                                                <p className="text-sm font-semibold flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {formatTime(shift.startTime)}
                                                </p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-xs text-muted-foreground">End Time</p>
                                                <p className="text-sm font-semibold">{formatTime(shift.endTime)}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs text-muted-foreground">Duration</p>
                                            <Badge variant="outline" className="text-xs">
                                                {calculateDuration(shift.startTime, shift.endTime)}
                                            </Badge>
                                        </div>
                                        {shift.notes && (
                                            <div className="space-y-1 pt-2 border-t">
                                                <p className="text-xs text-muted-foreground">Notes</p>
                                                <p className="text-sm">{shift.notes}</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            ) : null}

            {/* Footer Info */}
            {!hasError && staffShifts.length > 0 && (
                <Card className="bg-muted/50">
                    <CardContent className="py-4">
                        <p className="text-xs sm:text-sm text-center text-muted-foreground">
                            Shifts are updated by your manager. If you notice any discrepancies,
                            please contact your supervisor or HR department.
                        </p>
                    </CardContent>
                </Card>
            )}
        </>
    );
}

export default RosterContent