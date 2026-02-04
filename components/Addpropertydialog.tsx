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
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createProperty } from "@/app/actions";
import { generateRandomCode } from "@/utils/staffDashboardUtils";

export function AddPropertyDialog() {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [formData, setFormData] = useState({
        name: "",
        location: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        startTransition(async () => {
            const result = await createProperty({ ...formData, code: generateRandomCode(6), });

            if (result.success) {
                toast.success(result.message);
                setFormData({ name: "", location: "" });
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