import { useEffect, useRef } from "react";
import { CalendarGridProps } from "@/types";
import { Trash2, Clock } from "lucide-react";
import { ShiftNotesPopover } from "./ShiftNotesPopover";


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
        rangeStart,
        rangeEnd,
        isDraggingRange,
        setIsDraggingRange,
        onDateSelect,
        isDateInRange,
        selectedTemplate,
        setSelectedTemplate,
        rosterId,
        onNotesUpdated
    } = props;

    const draggedToNewCell = useRef(false);

    // Global mouseup — ends drag regardless of where pointer is released.
    useEffect(() => {
        const handleMouseUp = () => {
            if (isDraggingRange) setIsDraggingRange(false);
        };
        window.addEventListener("mouseup", handleMouseUp);
        return () => window.removeEventListener("mouseup", handleMouseUp);
    }, [isDraggingRange, setIsDraggingRange]);

    // Suppress browser drag-image / text-select while dragging cells.
    useEffect(() => {
        const prevent = (e: MouseEvent) => {
            if (isDraggingRange) e.preventDefault();
        };
        window.addEventListener("dragstart", prevent);
        window.addEventListener("selectstart", prevent as EventListener);
        return () => {
            window.removeEventListener("dragstart", prevent);
            window.removeEventListener("selectstart", prevent as EventListener);
        };
    }, [isDraggingRange]);

    // ✅ HELPER: Check if the selected staff member already has a shift on this date
    const hasShiftOnDate = (staffId: string, dateStr: string): boolean => {
        if (!staffId) return false;
        return getShiftsForDate(dateStr).some((shift) => shift.staffId === staffId);
    };

    // The template that will actually be used when creating a shift.
    // Falls back to the first template so drag never silently no-ops.
    const activeTemplate = selectedTemplate ?? shiftTemplates[0];

    // ✅ UPDATED: Create a shift on `day` only when:
    // 1. Staff is selected
    // 2. Staff doesn't already have a shift on that date
    const addShiftIfMissing = (day: number, dateStr: string) => {
        if (!selectedStaff) return;

        // ✅ GUARD: Don't add if staff already has a shift on this date
        if (hasShiftOnDate(selectedStaff, dateStr)) return;

        quickAddShift(day, activeTemplate);
    };

    // Resolve the staff member object once for the picker panel label.
    const activeStaff = staffMembers.find((s) => s.id === selectedStaff);

    // The date string that the desktop picker panel targets.
    // Derived the same way the parent's mobile panel does it.
    const pickerDay = selectedDate ? new Date(selectedDate + "T00:00:00").getDate() : null;

    return (
        <div className="space-y-3">
            {/* ── Calendar grid ── */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {/* Empty cells for days before month starts */}
                {Array.from({ length: firstDay }).map((_, idx) => (
                    <div key={`empty-${idx}`} className="aspect-square" />
                ))}

                {/* Days of the month */}
                {Array.from({ length: daysInMonth }).map((_, idx) => {
                    const day = idx + 1;
                    const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                    const dayShifts = getShiftsForDate(dateStr);
                    const isToday =
                        new Date().getDate() === day &&
                        new Date().getMonth() === selectedMonth &&
                        new Date().getFullYear() === selectedYear;
                    const isSelected = selectedDate === dateStr;

                    // ✅ NEW: Check if this day is disabled for the selected staff
                    const isDisabledForStaff = selectedStaff ? hasShiftOnDate(selectedStaff, dateStr) : false;

                    const isRangeEndpoint = dateStr === rangeStart || dateStr === rangeEnd;
                    const inRange = isDateInRange(dateStr);

                    // ✅ UPDATED: Adjust border/background based on disabled state
                    const borderBg = isDisabledForStaff
                        ? "border-muted bg-muted/30 cursor-not-allowed"
                        : isSelected || isRangeEndpoint
                            ? "border-primary bg-primary/5"
                            : inRange
                                ? "border-primary/40 bg-primary/10"
                                : "border-border hover:border-primary/50";

                    return (
                        <div
                            key={day}
                            onClick={() => {
                                // ✅ GUARD: Prevent interaction if day is disabled
                                if (isDisabledForStaff) return;

                                if (draggedToNewCell.current) {
                                    draggedToNewCell.current = false;
                                    return;
                                }
                                setSelectedDate(isSelected ? "" : dateStr);
                                if (isMobileMenuOpen) setIsMobileMenuOpen(false);
                            }}
                            onMouseDown={(e) => {
                                // ✅ GUARD: Prevent drag start if day is disabled
                                if (isDisabledForStaff) return;

                                if (e.button !== 0) return;
                                draggedToNewCell.current = false;
                                onDateSelect(dateStr);
                                setIsDraggingRange(true);
                                addShiftIfMissing(day, dateStr);
                            }}
                            onMouseEnter={() => {
                                // ✅ GUARD: Prevent drag-over if day is disabled
                                if (isDisabledForStaff) return;

                                if (!isDraggingRange) return;
                                if (dateStr === rangeStart) return;
                                draggedToNewCell.current = true;
                                onDateSelect(dateStr);
                                addShiftIfMissing(day, dateStr);
                            }}
                            className={`
                                aspect-square p-1 sm:p-2 rounded-lg border-2 transition-all select-none
                                ${isDisabledForStaff ? "cursor-not-allowed opacity-60" : "cursor-pointer"}
                                ${borderBg}
                                ${isToday ? "ring-1 sm:ring-2 ring-orange-500 ring-offset-1 sm:ring-offset-2" : ""}
                            `}
                            title={isDisabledForStaff ? `${activeStaff?.name} already has a shift on this day` : undefined}
                        >
                            <div className="h-full flex flex-col">
                                <div className={`font-semibold text-[10px] sm:text-sm mb-0.5 sm:mb-1 ${isDisabledForStaff ? "text-muted-foreground" : ""}`}>
                                    {day}
                                </div>

                                {/* Shift chips */}
                                <div className="flex-1 space-y-0.5 sm:space-y-1 overflow-y-auto">
                                    {dayShifts.map((shift) => {
                                        const staff = staffMembers.find((s) => s.id === shift.staffId);
                                        const isCurrentStaffShift = shift.staffId === selectedStaff;

                                        return (
                                            <div
                                                key={shift.id}
                                                className={`
                                                    text-[8px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 sm:py-1 rounded text-foreground font-medium 
                                                    flex items-center justify-between gap-0.5 sm:gap-1 hover:opacity-80 transition-opacity group
                                                    ${isCurrentStaffShift ? "ring-1 ring-foreground/20" : ""}
                                                `}
                                                style={{ backgroundColor: staff?.color }}
                                                title={`${staff?.name} - Click to remove`}
                                            >
                                                <span className="truncate">
                                                    {(() => {
                                                        const name = staff?.name ?? "";
                                                        const firstWord = name.split(" ")[0];

                                                        return firstWord.length <= 2 ? name.slice(0, 7) : firstWord;
                                                    })()}
                                                </span>

                                                <div className="flex items-center gap-0.5 shrink-0">
                                                    <ShiftNotesPopover
                                                        rosterId={rosterId}
                                                        shiftId={shift.id}
                                                        existingNotes={shift.notes}
                                                        onNotesUpdated={onNotesUpdated}
                                                    />
                                                    <Trash2
                                                        className="w-4 h-4 sm:w-3 sm:h-3 opacity-0 group-hover:opacity-100 text-red-300"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            removeShift(shift.id);
                                                        }}
                                                    />
                                                </div>

                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Mobile-only "Selected" or "Already Assigned" indicator */}
                                {isSelected && selectedStaff && (
                                    <div className="sm:hidden mt-1 text-center">
                                        {isDisabledForStaff ? (
                                            <div className="text-[8px] text-destructive font-semibold">Assigned</div>
                                        ) : (
                                            <div className="text-[8px] text-primary font-semibold">Selected</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ── Desktop shift-picker panel ── */}
            {selectedDate && selectedStaff && pickerDay !== null && (
                <div className="hidden sm:flex items-center gap-3 rounded-xl border bg-muted/40 backdrop-blur-sm px-4 py-3 animate-in fade-in slide-in-from-top-2 duration-200">

                    {/* Who we're scheduling */}
                    <div className="flex items-center gap-2 shrink-0 pr-3 border-r border-muted">
                        <div
                            className="w-7 h-7 rounded-md flex items-center justify-center text-white text-xs font-bold shrink-0"
                            style={{ backgroundColor: activeStaff?.color }}
                        >
                            {activeStaff?.name.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">
                            {activeStaff?.name.split(" ")[0]}
                        </span>
                    </div>

                    {/* Date label */}
                    <div className="flex items-center gap-1.5 shrink-0 text-sm text-muted-foreground pr-3 border-r border-muted">
                        <Clock className="w-3.5 h-3.5" />
                        <span>
                            {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                            })}
                        </span>
                    </div>

                    {/* ✅ UPDATED: Show message if day is already assigned */}
                    {hasShiftOnDate(selectedStaff, selectedDate) ? (
                        <div className="flex-1 text-sm text-muted-foreground italic">
                            {activeStaff?.name.split(" ")[0]} already has a shift on this day
                        </div>
                    ) : (
                        /* Template pills */
                        <div className="flex flex-wrap gap-2 flex-1">
                            {shiftTemplates.map((template, idx) => {
                                const isActive = selectedTemplate === template;
                                return (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedTemplate(template);

                                            // ✅ GUARD: Only add shift if staff doesn't have one on this date
                                            if (!hasShiftOnDate(selectedStaff, selectedDate)) {
                                                quickAddShift(pickerDay, template);
                                            }
                                        }}
                                        className={`
                                            inline-flex flex-col items-start px-3 py-1.5 rounded-lg border text-left transition-all duration-150
                                            ${isActive
                                                ? "border-primary bg-primary/10 shadow-sm shadow-primary/10"
                                                : "border-muted bg-background hover:border-primary/50 hover:bg-primary/5"
                                            }
                                        `}
                                    >
                                        <span className={`text-xs font-semibold ${isActive ? "text-primary" : "text-foreground"}`}>
                                            {template.label}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground">
                                            {template.start} – {template.end}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Dismiss */}
                    <button
                        type="button"
                        onClick={() => setSelectedDate("")}
                        className="shrink-0 ml-2 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Close"
                    >
                        ✕
                    </button>
                </div>
            )}
        </div>
    );
};

export default CalendarGrid;