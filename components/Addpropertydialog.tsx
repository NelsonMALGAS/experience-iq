'use client';

import { useState, useTransition } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Loader2, Trash } from "lucide-react";
import { toast } from "sonner";
import { createProperty } from "@/app/actions";
import { generateRandomCode } from "@/utils/staffDashboardUtils";
import { Room } from "@/types";

type FormDataTypes = {
    name: string,
    location: string,
    rooms: Room[]
}

export function AddPropertyDialog() {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [formData, setFormData] = useState<FormDataTypes>({
        name: "",
        location: "",
        rooms: []
    });

    const addRoom = () => {
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
    };

    const updateRoom = (index: number, field: keyof Room, value: string) => {
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


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        startTransition(async () => {
            const result = await createProperty({ ...formData, code: generateRandomCode(6, 6, ""), });

            if (result.success) {
                toast.success(result.message);
                setFormData({ name: "", location: "", rooms: [] });
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
            <DialogContent className="sm:max-w-125">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-display">Add New Property</DialogTitle>
                        <DialogDescription>
                            Create a new property to manage issues and track performance.
                        </DialogDescription>
                    </DialogHeader>

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
                                disabled={isPending}
                                required
                                className="h-11"
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
                                disabled={isPending}
                                required
                                className="h-11"
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
                                    disabled={isPending}
                                >
                                    <Plus className="h-4 w-4 mr-1" />
                                    Add Room
                                </Button>
                            </div>

                            {formData.rooms.length === 0 && (
                                <p className="text-xs text-muted-foreground">
                                    No rooms added yet. Click “Add Room” to add rooms for this property.
                                </p>
                            )}

                            <div className="space-y-2">
                                {formData.rooms.map((room, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <Input
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

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={isPending}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isPending}>
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