import { CalendarGridProps } from "@/types";
import { Trash2 } from "lucide-react";
import { Button } from "./ui/button";


const CalendarGrid = (props: CalendarGridProps) => {

    const {
        firstDay,
        daysInMonth,
        selectedYear,
        selectedMonth,
        selectedDate,
        selectedStaff,
        staffMembers,
        shiftTemplates,
        isMobileMenuOpen,
        getShiftsForDate,
        setSelectedDate,
        setIsMobileMenuOpen,
        removeShift,
        quickAddShift,
    } = props
    return (
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
    )
}

export default CalendarGrid