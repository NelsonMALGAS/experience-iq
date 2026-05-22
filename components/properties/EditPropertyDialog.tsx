"use client";

import { useState, useTransition, useEffect } from "react";
import { Pencil, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
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
import { Property } from "@/types";
import { updateProperty } from "@/app/actions/update-property";

// ── Types ─────────────────────────────────────────────────────────────────────

interface EditPropertyDialogProps {
    property: Property;
    /** Optional: called after a successful save so the parent can optimistically refresh */
    onSuccess?: (updated: Pick<Property, "id" | "name" | "location">) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function EditPropertyDialog({
    property,
    onSuccess,
}: EditPropertyDialogProps) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    // Form state
    const [name, setName] = useState(property.name);
    const [location, setLocation] = useState(property.location);

    // Per-field client validation errors
    const [nameError, setNameError] = useState<string | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);

    // Server-returned errors / success feedback
    const [serverError, setServerError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Reset form whenever the dialog opens
    useEffect(() => {
        if (open) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setName(property.name);
            setLocation(property.location);
            setNameError(null);
            setLocationError(null);
            setServerError(null);
            setSuccessMessage(null);
        }
    }, [open, property.name, property.location]);

    // ── Client-side validation ────────────────────────────────────────────────

    function validateForm(): boolean {
        let valid = true;

        const trimmedName = name.trim();
        const trimmedLocation = location.trim();

        if (!trimmedName || trimmedName.length < 2) {
            setNameError("Property name must be at least 2 characters.");
            valid = false;
        } else if (trimmedName.length > 80) {
            setNameError("Property name must be 80 characters or fewer.");
            valid = false;
        } else {
            setNameError(null);
        }

        if (!trimmedLocation || trimmedLocation.length < 2) {
            setLocationError("Location must be at least 2 characters.");
            valid = false;
        } else if (trimmedLocation.length > 120) {
            setLocationError("Location must be 120 characters or less.");
            valid = false;
        } else {
            setLocationError(null);
        }

        return valid;
    }

    // ── Submit ────────────────────────────────────────────────────────────────

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setServerError(null);
        setSuccessMessage(null);

        if (!validateForm()) return;

        startTransition(async () => {
            const result = await updateProperty(
                property.id,
                name.trim(),
                location.trim()
            );

            if (!result.success) {
                // Populate field errors returned from the server
                if (result.fieldErrors?.name) {
                    setNameError(result.fieldErrors.name[0]);
                }
                if (result.fieldErrors?.location) {
                    setLocationError(result.fieldErrors.location[0]);
                }
                setServerError(result.message);
                return;
            }

            // ── Success path ──────────────────────────────────────────────────
            setSuccessMessage(result.message);

            onSuccess?.({
                id: property.id,
                name: name.trim(),
                location: location.trim(),
            });

            // Close the dialog after a short delay so the user sees feedback
            setTimeout(() => setOpen(false), 800);
        });
    }


    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-colors"
                    aria-label={`Edit property: ${property.name}`}
                >
                    <Pencil className="h-3.5 w-3.5" />
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold">
                        Edit Property
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground text-sm">
                        Update the name or location for{" "}
                        <span className="font-medium text-foreground">{property.name}</span>
                        .
                    </DialogDescription>
                </DialogHeader>

                <form
                    id="edit-property-form"
                    onSubmit={handleSubmit}
                    className="space-y-5 py-2"
                    noValidate
                >
                    {/* Property Name */}
                    <div className="space-y-1.5">
                        <Label htmlFor="edit-property-name" className="text-sm font-medium">
                            Property Name
                            <span className="text-destructive ml-0.5" aria-hidden="true">
                                *
                            </span>
                        </Label>
                        <Input
                            id="edit-property-name"
                            name="name"
                            type="text"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                if (nameError) setNameError(null);
                            }}
                            placeholder="Enter property name"
                            autoComplete="off"
                            disabled={isPending}
                            aria-required="true"
                            aria-invalid={!!nameError}
                            aria-describedby={nameError ? "name-error" : undefined}
                            className={
                                nameError
                                    ? "border-destructive focus-visible:ring-destructive"
                                    : ""
                            }
                        />
                        {nameError && (
                            <p
                                id="name-error"
                                role="alert"
                                className="flex items-center gap-1.5 text-xs text-destructive"
                            >
                                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                                {nameError}
                            </p>
                        )}
                    </div>

                    {/* Location */}
                    <div className="space-y-1.5">
                        <Label
                            htmlFor="edit-property-location"
                            className="text-sm font-medium"
                        >
                            Location
                            <span className="text-destructive ml-0.5" aria-hidden="true">
                                *
                            </span>
                        </Label>
                        <Input
                            id="edit-property-location"
                            name="location"
                            type="text"
                            value={location}
                            onChange={(e) => {
                                setLocation(e.target.value);
                                if (locationError) setLocationError(null);
                            }}
                            placeholder="Enter property location"
                            autoComplete="off"
                            disabled={isPending}
                            aria-required="true"
                            aria-invalid={!!locationError}
                            aria-describedby={locationError ? "location-error" : undefined}
                            className={
                                locationError
                                    ? "border-destructive focus-visible:ring-destructive"
                                    : ""
                            }
                        />
                        {locationError && (
                            <p
                                id="location-error"
                                role="alert"
                                className="flex items-center gap-1.5 text-xs text-destructive"
                            >
                                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                                {locationError}
                            </p>
                        )}
                    </div>

                    {/* Server-level error */}
                    {serverError && (
                        <div
                            role="alert"
                            className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
                        >
                            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                            <span>{serverError}</span>
                        </div>
                    )}

                    {/* Success feedback */}
                    {successMessage && (
                        <div
                            role="status"
                            aria-live="polite"
                            className="flex items-center gap-2 rounded-md border border-success/40 bg-success/10 px-3 py-2.5 text-sm text-success"
                        >
                            <CheckCircle2 className="h-4 w-4 shrink-0" />
                            <span>{successMessage}</span>
                        </div>
                    )}
                </form>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setOpen(false)}
                        disabled={isPending}
                        aria-label="Cancel editing"
                        className="pr-2"
                    >
                        Cancel
                    </Button>

                    <Button
                        type="submit"
                        form="edit-property-form"
                        disabled={isPending}
                        aria-label="Save property changes"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Saving…
                            </>
                        ) : (
                            "Save Changes"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}