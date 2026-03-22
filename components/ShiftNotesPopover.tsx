"use client"

import { useState } from 'react';
import { StickyNote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { updateShiftNotes } from '@/app/actions/rosterActions';
import { toast } from 'sonner';

type ShiftNotesPopoverProps = {
    rosterId: string | undefined;
    shiftId: string;
    existingNotes?: string;
    onNotesUpdated: (shiftId: string, notes: string) => void;
}

const MAX_LENGTH: number = 30;

export function ShiftNotesPopover({
    rosterId,
    shiftId,
    existingNotes,
    onNotesUpdated,
}: ShiftNotesPopoverProps) {
    const [open, setOpen] = useState(false);
    const [notes, setNotes] = useState(existingNotes ?? '');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {

        if (!rosterId) {
            toast.error("Error", { description: "Roster ID is required" })
            return
        }
        setIsSaving(true);
        try {
            const result = await updateShiftNotes(rosterId, shiftId, notes);
            if (result.success) {
                onNotesUpdated(shiftId, notes);
                toast.success("🎉Success", { description: 'Note saved successfully' });
                setOpen(false);
            } else {
                toast.error('🚨Failed to save notes', { description: result.message });
            }
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    size="sm"
                    variant="ghost"
                    className="h-5 w-5 p-0 opacity-60 hover:opacity-100"
                    title={existingNotes ? "Edit note" : "Add note"}
                >
                    <StickyNote className={`w-3 h-3 ${existingNotes ? 'fill-primary text-primary' : ''}`} />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3" side="top">
                <p className="text-xs font-medium mb-2">Shift Notes</p>
                <div className="space-y-1">
                    <Textarea
                        value={notes}
                        onChange={(e) => {
                            const value = e.target.value;

                            // Extra safety (handles paste edge cases)
                            if (value.length <= MAX_LENGTH) {
                                setNotes(value);
                            }
                        }}
                        placeholder="Add a note for this shift..."
                        className="text-xs resize-none"
                        maxLength={MAX_LENGTH}
                        rows={3}
                        autoFocus
                    />

                    <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">
                            Max {MAX_LENGTH} characters
                        </span>
                        <span
                            className={`${notes.length >= MAX_LENGTH
                                ? "text-red-500 font-medium"
                                : "text-muted-foreground"
                                }`}
                        >
                            {notes.length}/{MAX_LENGTH}
                        </span>
                    </div>
                </div>
                <div className="flex gap-2 mt-2">
                    <Button
                        size="sm"
                        className="flex-1 h-7 text-xs"
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? 'Saving…' : 'Save'}
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs"
                        onClick={() => setOpen(false)}
                    >
                        Cancel
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}