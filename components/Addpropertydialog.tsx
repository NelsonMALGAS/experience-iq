'use client';

import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Plus, Loader2, Trash, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { generateRandomCode } from "@/utils/staffDashboardUtils";
import { Property, Room, UserSubscription } from "@/types";
import { createProperty } from "@/app/optimised-actions";
import { getPlanByPriceId } from "@/lib/plans";


type FormDataTypes = {
    name: string,
    location: string,
    rooms: Room[]
    ownerId: string
}

type AddPropertyDialogProps = {
    uid: string
    properties: Property[]
    subscription?: UserSubscription | null
}

// ── NEW: Bulk generation state type ──────────────────────────────────────────
type BulkConfig = {
    start: string;
    end: string;
    pattern: "sequential" | "floor-based";
    skip: string;
};
// ─────────────────────────────────────────────────────────────────────────────

export function AddPropertyDialog({ uid, properties, subscription }: AddPropertyDialogProps) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [formData, setFormData] = useState<FormDataTypes>({
        name: "",
        location: "",
        rooms: [],
        ownerId: uid
    });
    const lastRoomRef = useRef<HTMLInputElement | null>(null);
    const plan = getPlanByPriceId(subscription?.priceId)

    const disabled = plan ? properties.length >= plan.limits.propertyLimit : false

    // ── NEW: Bulk config state ─────────────────────────────────────────────────
    const [bulkConfig, setBulkConfig] = useState<BulkConfig>({
        start: "",
        end: "",
        pattern: "sequential",
        skip: "",
    });
    // ─────────────────────────────────────────────────────────────────────────

    const addRoom = () => {

        // If there are rooms, check the last one
        if (formData.rooms.length > 0) {
            const lastRoom = formData.rooms[formData.rooms.length - 1];

            if (!lastRoom.roomNumber.trim()) {
                toast.error("Please fill in the previous room first.");
                return;
            }
        }

        setFormData((prev) => ({
            ...prev,
            rooms: [
                ...prev.rooms,
                {
                    id: crypto.randomUUID(),
                    roomNumber: "",
                    status: "available",
                    createdAt: new Date()
                },
            ],
        }));

        // Focus after state updates
        setTimeout(() => {
            lastRoomRef.current?.focus();
        }, 0);
    };

    const updateRoom = (index: number, field: keyof Room, value: string) => {
        if (field === "roomNumber") {
            const trimmedValue = value.trim();

            const isDuplicate = formData.rooms.some((room, i) =>
                i !== index && room.roomNumber.trim() === trimmedValue
            );

            if (isDuplicate) {
                toast.error("🚨 Error", { description: `Room number ${trimmedValue} already exists` });
                return;
            }
        }

        setFormData((prev) => ({
            ...prev,
            rooms: prev.rooms.map((room, i) =>
                i === index ? { ...room, [field]: value } : room
            ),
        }));
    };

    const removeRoom = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            rooms: prev.rooms.filter((_, i) => i !== index),
        }));
    };

    const hasDuplicateRooms = () => {
        const roomNumbers = formData.rooms.map(r => r.roomNumber.trim());
        const unique = new Set(roomNumbers);
        return unique.size !== roomNumbers.length;
    };

    // ── NEW: Bulk room generation logic ───────────────────────────────────────
    const generateRoomsFromRange = () => {
        const startNum = parseInt(bulkConfig.start, 10);
        const endNum = parseInt(bulkConfig.end, 10);

        // Validate inputs
        if (!bulkConfig.start || !bulkConfig.end || isNaN(startNum) || isNaN(endNum)) {
            toast.error("Invalid range", { description: "Start and End must be valid numbers." });
            return;
        }
        if (startNum > endNum) {
            toast.error("Invalid range", { description: "Start must be less than or equal to End." });
            return;
        }
        if (endNum - startNum > 9999) {
            toast.error("Range too large", { description: "Please generate no more than 10,000 rooms at a time." });
            return;
        }

        // Parse skip numbers
        const skipSet = new Set<number>(
            bulkConfig.skip
                .split(",")
                .map(s => parseInt(s.trim(), 10))
                .filter(n => !isNaN(n))
        );

        // Existing room numbers for duplicate detection
        const existingNumbers = new Set(formData.rooms.map(r => r.roomNumber.trim()));

        const generated: number[] = [];

        if (bulkConfig.pattern === "sequential") {
            // Simple increment from start → end
            for (let i = startNum; i <= endNum; i++) {
                generated.push(i);
            }
        } else {
            // Floor-based: group by hundreds digit
            // e.g. 101–109, then 201–209 based on the floor (hundreds) of start/end
            const startFloor = Math.floor(startNum / 100);
            const endFloor = Math.floor(endNum / 100);
            const endRooms = endNum % 100;

            for (let floor = startFloor; floor <= endFloor; floor++) {
                const floorStart = floor === startFloor ? startNum : floor * 100 + 1;
                const floorEnd = floor === endFloor ? endNum : floor * 100 + endRooms;

                for (let room = floorStart; room <= floorEnd; room++) {
                    generated.push(room);
                }
            }
        }

        // Filter out skipped and already-existing room numbers
        let duplicateCount = 0;
        const newRooms: Room[] = [];

        for (const num of generated) {
            if (skipSet.has(num)) continue;

            const roomStr = String(num);
            if (existingNumbers.has(roomStr)) {
                duplicateCount++;
                continue;
            }

            newRooms.push({
                id: crypto.randomUUID(),
                roomNumber: roomStr,
                status: "available",
                createdAt: new Date(),
            });

            // Track so within-batch duplicates are also caught
            existingNumbers.add(roomStr);
        }

        if (newRooms.length === 0) {
            toast.warning("No new rooms generated", {
                description: "All rooms in this range already exist or were skipped.",
            });
            return;
        }

        // Append to existing rooms
        setFormData(prev => ({
            ...prev,
            rooms: [...prev.rooms, ...newRooms],
        }));

        // Feedback
        if (duplicateCount > 0) {
            toast.success(`Generated ${newRooms.length} room${newRooms.length !== 1 ? "s" : ""}`, {
                description: `${duplicateCount} duplicate${duplicateCount !== 1 ? "s" : ""} were skipped.`,
            });
        } else {
            toast.success(`Generated ${newRooms.length} room${newRooms.length !== 1 ? "s" : ""} successfully.`);
        }

        // Reset bulk inputs after generation
        setBulkConfig(prev => ({ ...prev, start: "", end: "", skip: "" }));
    };
    // ─────────────────────────────────────────────────────────────────────────


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!plan) {
            toast.error("Subscription required", {
                description: "Please subscribe to a plan before creating a property.",
                duration: 10000
            });
            return;
        }

        if (hasDuplicateRooms()) {
            toast.error("Duplicate room numbers are not allowed.");
            return;
        }

        if (properties.length >= plan.limits.propertyLimit) {
            toast.error("Property limit reached", {
                description: `Your plan allows up to ${plan.limits.propertyLimit} ${plan.limits.propertyLimit === 1 ? "property" : "properties"
                    }. Please upgrade your plan to add more.`,
                duration: 10000
            })
            return
        }

        const cleanedRooms = formData.rooms.map(room => ({
            ...room,
            roomNumber: room.roomNumber.trim()
        }));

        startTransition(async () => {
            const result = await createProperty({
                ...formData,
                rooms: cleanedRooms,
                code: generateRandomCode(6, 6, ""),
            });

            if (result.success) {
                toast.success(result.message);
                setFormData({ name: "", location: "", rooms: [], ownerId: uid });
                // ── NEW: Reset bulk config on success ──────────────────────────
                setBulkConfig({ start: "", end: "", pattern: "sequential", skip: "" });
                // ───────────────────────────────────────────────────────────────
                setOpen(false);
            } else {
                toast.error(result.message);
            }
        });
    };

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };


    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="text-white hover:opacity-90 shadow-gold" variant="default">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Property
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-125 max-h-[90vh] flex flex-col">

                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">

                    <DialogHeader>
                        <DialogTitle className="text-2xl font-display">Add New Property</DialogTitle>
                        <DialogDescription>
                            Create a new property to manage issues and track performance.
                        </DialogDescription>
                    </DialogHeader>
                    {disabled && (
                        <Alert variant="destructive" className="mt-4">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Property limit reached</AlertTitle>
                            <AlertDescription>
                                Your current plan allows up to {plan?.limits.propertyLimit}{" "}
                                {plan?.limits.propertyLimit === 1 ? "property" : "properties"}.
                                Please upgrade your subscription to add more.
                            </AlertDescription>
                        </Alert>
                    )}
                    <div className="flex-1 overflow-y-auto pr-2">

                        <div className="grid gap-6 py-6">
                            {/* Property Name */}
                            <div className="grid gap-2">
                                <Label htmlFor="name" className="text-sm font-medium">
                                    Property Name <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    placeholder="e.g., Grand Plaza Hotel"
                                    value={formData.name}
                                    onChange={(e) => handleChange("name", e.target.value)}
                                    disabled={isPending || disabled}
                                    required
                                    className="h-11 hover:disabled:cursor-not-allowed"
                                />
                            </div>

                            {/* Location */}
                            <div className="grid gap-2">
                                <Label htmlFor="location" className="text-sm font-medium">
                                    Location <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="location"
                                    placeholder="e.g., New York, NY"
                                    value={formData.location}
                                    onChange={(e) => handleChange("location", e.target.value)}
                                    disabled={isPending || disabled}
                                    required
                                    className="h-11 hover:disabled:cursor-not-allowed"
                                />
                            </div>

                            {/* Rooms Section */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm font-medium">Rooms</Label>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={addRoom}
                                        disabled={isPending || disabled}
                                        className="hover:disabled:cursor-not-allowed"
                                    >
                                        <Plus className="h-4 w-4 mr-1" />
                                        Add Room
                                    </Button>
                                </div>

                                {/* ── NEW: Bulk Add Rooms section ─────────────────────────────── */}
                                <div className="rounded-lg border border-dashed p-4 space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Wand2 className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm font-medium">Bulk Add Rooms</span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="bulk-start" className="text-xs text-muted-foreground">
                                                Start Room
                                            </Label>
                                            <Input
                                                id="bulk-start"
                                                type="number"
                                                placeholder="e.g. 101"
                                                value={bulkConfig.start}
                                                onChange={(e) =>
                                                    setBulkConfig(prev => ({ ...prev, start: e.target.value }))
                                                }
                                                disabled={isPending || disabled}
                                                className="h-9"
                                                min={1}
                                            />
                                        </div>
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="bulk-end" className="text-xs text-muted-foreground">
                                                End Room
                                            </Label>
                                            <Input
                                                id="bulk-end"
                                                type="number"
                                                placeholder="e.g. 709"
                                                value={bulkConfig.end}
                                                onChange={(e) =>
                                                    setBulkConfig(prev => ({ ...prev, end: e.target.value }))
                                                }
                                                disabled={isPending || disabled}
                                                className="h-9"
                                                min={1}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-1.5">
                                        <Label htmlFor="bulk-pattern" className="text-xs text-muted-foreground">
                                            Pattern
                                        </Label>
                                        <Select
                                            value={bulkConfig.pattern}
                                            onValueChange={(value) =>
                                                setBulkConfig(prev => ({
                                                    ...prev,
                                                    pattern: value as BulkConfig["pattern"],
                                                }))
                                            }
                                            disabled={isPending || disabled}
                                        >
                                            <SelectTrigger id="bulk-pattern" className="h-9">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="sequential">
                                                    Sequential — 101, 102, 103…
                                                </SelectItem>
                                                <SelectItem value="floor-based">
                                                    Floor-based — 101–109, 201–209…
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="grid gap-1.5">
                                        <Label htmlFor="bulk-skip" className="text-xs text-muted-foreground">
                                            Skip Numbers{" "}
                                            <span className="text-muted-foreground/60">(optional, comma-separated)</span>
                                        </Label>
                                        <Input
                                            id="bulk-skip"
                                            placeholder="e.g. 13, 666"
                                            value={bulkConfig.skip}
                                            onChange={(e) =>
                                                setBulkConfig(prev => ({ ...prev, skip: e.target.value }))
                                            }
                                            disabled={isPending || disabled}
                                            className="h-9"
                                        />
                                    </div>

                                    <Button
                                        type="button"
                                        variant="secondary"
                                        size="sm"
                                        onClick={generateRoomsFromRange}
                                        disabled={isPending || disabled || !bulkConfig.start || !bulkConfig.end}
                                        className="w-full"
                                    >
                                        <Wand2 className="h-4 w-4 mr-2" />
                                        Generate Rooms
                                    </Button>
                                </div>
                                {/* ── END NEW ────────────────────────────────────────────────── */}

                                <Separator />

                                {formData.rooms.length === 0 ? (
                                    <p className="text-xs text-muted-foreground">
                                        No rooms added yet. Use &quot;Bulk Add Rooms&quot; above or click &quot;Add Room&quot; to add rooms one by one.
                                    </p>
                                ) : (
                                    <p className="text-xs text-muted-foreground">
                                        {formData.rooms.length} room{formData.rooms.length !== 1 ? "s" : ""} added.
                                    </p>
                                )}

                                <div className="space-y-2">
                                    {formData.rooms.map((room, index) => (
                                        <div key={room.id} className="flex items-center gap-2">
                                            <Input
                                                ref={index === formData.rooms.length - 1 ? lastRoomRef : null}
                                                placeholder="Room Number"
                                                value={room.roomNumber}
                                                onChange={(e) => updateRoom(index, "roomNumber", e.target.value)}
                                                required
                                                className="h-10 flex-1"
                                            />

                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeRoom(index)}
                                                disabled={isPending}
                                            >
                                                <Trash className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Info Note */}
                            <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
                                <p className="font-medium text-foreground mb-1">Initial Statistics</p>
                                <ul className="space-y-1 text-xs">
                                    <li>• Total Issues: 0</li>
                                    <li>• Open Issues: 0</li>
                                    <li>• Average Resolution Time: 0 minutes</li>
                                </ul>
                                <p className="mt-2 text-xs">
                                    These values will update automatically as issues are reported and resolved.
                                </p>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={isPending}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isPending || disabled}>
                            {isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Property
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}