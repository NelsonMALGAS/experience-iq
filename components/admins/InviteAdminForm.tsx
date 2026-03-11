"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AdminPermissions, Property } from "@/types";
import { DEFAULT_PERMISSIONS, PERMISSION_LABELS, PERMISSION_DESCRIPTIONS } from "@/constants";
import { inviteAdminToProperty } from "@/app/admin-invite-actions";
import { Building2, ShieldCheck, CheckSquare, Loader2, Send } from "lucide-react";
import { toast } from "sonner";

interface EligibleAdmin {
    uid: string;
    displayName: string;
    email: string;
}

interface InviteAdminFormProps {
    eligibleAdmins: EligibleAdmin[];
    properties: Property[];
    inviterUid: string;
}

export function InviteAdminForm({
    eligibleAdmins,
    properties,
    inviterUid,
}: InviteAdminFormProps) {
    const [isPending, startTransition] = useTransition();

    const [selectedAdminId, setSelectedAdminId] = useState<string>("");
    const [selectedPropertyIds, setSelectedPropertyIds] = useState<Set<string>>(new Set());
    const [selectAll, setSelectAll] = useState(false);
    const [permissions, setPermissions] = useState<AdminPermissions>(DEFAULT_PERMISSIONS);

    // ── Property selection ────────────────────────────────────────────────

    function handleSelectAll(checked: boolean) {
        setSelectAll(checked);
        if (checked) {
            setSelectedPropertyIds(new Set(properties.map((p) => p.id)));
        } else {
            setSelectedPropertyIds(new Set());
        }
    }

    function handlePropertyToggle(propertyId: string, checked: boolean) {
        setSelectedPropertyIds((prev) => {
            const next = new Set(prev);
            if (checked) {
                next.add(propertyId);
            } else {
                next.delete(propertyId);
                setSelectAll(false);
            }
            // Sync selectAll state
            if (next.size === properties.length) setSelectAll(true);
            return next;
        });
    }

    // ── Permission toggle ─────────────────────────────────────────────────

    function handlePermissionToggle(key: keyof AdminPermissions, checked: boolean) {
        setPermissions((prev) => ({ ...prev, [key]: checked }));
    }

    // ── Submit ────────────────────────────────────────────────────────────

    function handleSubmit() {
        if (!selectedAdminId) {
            toast.error("Please select an admin to invite.");
            return;
        }
        if (selectedPropertyIds.size === 0) {
            toast.error("Please select at least one property.");
            return;
        }

        const selectedAdmin = eligibleAdmins.find((a) => a.uid === selectedAdminId);
        if (!selectedAdmin) return;

        // Snapshot state synchronously BEFORE entering startTransition to avoid
        // stale closure reads after the async boundary.
        const propertyIdList = Array.from(selectedPropertyIds);
        const adminIdSnapshot = selectedAdminId;
        const permissionsSnapshot = { ...permissions };

        startTransition(async () => {
            // Fire all invitations in parallel — inviteAdminToProperty handles
            // duplicate detection and validation per property internally.
            const results = await Promise.all(
                propertyIdList.map((propertyId) =>
                    inviteAdminToProperty(inviterUid, adminIdSnapshot, propertyId, permissionsSnapshot)
                )
            );

            const succeeded = results.filter((r) => r.success).length;
            const alreadyPending = results.filter(
                (r) => !r.success && r.error?.toLowerCase().includes("pending")
            ).length;
            const alreadyAccess = results.filter(
                (r) => !r.success && r.error?.toLowerCase().includes("already has access")
            ).length;
            const failed = results.filter(
                (r) =>
                    !r.success &&
                    !r.error?.toLowerCase().includes("pending") &&
                    !r.error?.toLowerCase().includes("already has access")
            );

            if (succeeded > 0) {
                const parts: string[] = [
                    `${succeeded} invitation${succeeded > 1 ? "s" : ""} sent`,
                ];
                if (alreadyPending > 0)
                    parts.push(`${alreadyPending} already pending`);
                if (alreadyAccess > 0)
                    parts.push(`${alreadyAccess} already have access`);
                toast.success(parts.join(" · "));

                // Reset form on at least partial success
                setSelectedAdminId("");
                setSelectedPropertyIds(new Set());
                setSelectAll(false);
                setPermissions(DEFAULT_PERMISSIONS);
            } else if (alreadyPending === propertyIdList.length || alreadyAccess === propertyIdList.length) {
                toast.info("No new invitations needed — all selected properties are already covered.");
            } else if (failed.length > 0) {
                // Surface the first meaningful error
                toast.error("Failed to send invitations.");
            } else {
                toast.info("No new invitations were created.");
            }
        });
    }

    const permissionKeys = Object.keys(DEFAULT_PERMISSIONS) as (keyof AdminPermissions)[];

    return (
        <div className="space-y-6">

            {/* ── Step 1: Select Admin ──────────────────────────────────────── */}
            <div className="space-y-2">
                <Label className="text-sm font-semibold">Admin</Label>
                <Select value={selectedAdminId} onValueChange={setSelectedAdminId}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a verified admin…" />
                    </SelectTrigger>
                    <SelectContent>
                        {eligibleAdmins.map((admin) => (
                            <SelectItem key={admin.uid} value={admin.uid}>
                                <div className="flex flex-col p-4">
                                    <span className="font-medium">{admin.displayName}</span>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <Separator />

            {/* ── Step 2: Select Properties ─────────────────────────────────── */}
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    <Label className="text-sm font-semibold">Properties</Label>
                    {selectedPropertyIds.size > 0 && (
                        <Badge className="ml-auto text-xs bg-primary/10 text-primary border-primary/20">
                            {selectedPropertyIds.size} selected
                        </Badge>
                    )}
                </div>

                {properties.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No properties found.</p>
                ) : (
                    <div className="rounded-lg border border-border divide-y divide-border overflow-hidden">
                        {/* Select All row */}
                        <div className="flex items-center gap-3 px-4 py-3 bg-muted/40">
                            <Checkbox
                                id="select-all"
                                checked={selectAll}
                                onCheckedChange={(checked) => handleSelectAll(!!checked)}
                            />
                            <Label
                                htmlFor="select-all"
                                className="text-sm font-medium cursor-pointer select-none flex-1"
                            >
                                Select All Properties
                            </Label>
                            <CheckSquare className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>

                        {/* Individual property rows */}
                        {properties.map((property) => (
                            <div
                                key={property.id}
                                className="flex items-center gap-3 px-4 py-3 hover:bg-muted/20 transition-colors"
                            >
                                <Checkbox
                                    id={`property-${property.id}`}
                                    checked={selectedPropertyIds.has(property.id)}
                                    onCheckedChange={(checked) =>
                                        handlePropertyToggle(property.id, !!checked)
                                    }
                                />
                                <Label
                                    htmlFor={`property-${property.id}`}
                                    className="flex-1 cursor-pointer select-none"
                                >
                                    <span className="text-sm font-medium">{property.name}</span>
                                    <span className="block text-xs text-muted-foreground">
                                        {property.location}
                                    </span>
                                </Label>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Separator />

            {/* ── Step 3: Select Permissions ────────────────────────────────── */}
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <Label className="text-sm font-semibold">Permissions</Label>
                </div>

                <div className="rounded-lg border border-border divide-y divide-border overflow-hidden">
                    {permissionKeys.map((key) => (
                        <div
                            key={key}
                            className="flex items-start gap-3 px-4 py-3 hover:bg-muted/20 transition-colors"
                        >
                            <Checkbox
                                id={`perm-${key}`}
                                checked={permissions[key]}
                                onCheckedChange={(checked) =>
                                    handlePermissionToggle(key, !!checked)
                                }
                                className="mt-0.5"
                            />
                            <Label
                                htmlFor={`perm-${key}`}
                                className="flex-1 cursor-pointer select-none"
                            >
                                <span className="text-sm font-medium">{PERMISSION_LABELS[key]}</span>
                                <span className="block text-xs text-muted-foreground">
                                    {PERMISSION_DESCRIPTIONS[key]}
                                </span>
                            </Label>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Submit ────────────────────────────────────────────────────── */}
            <Button
                onClick={handleSubmit}
                disabled={isPending || !selectedAdminId || selectedPropertyIds.size === 0}
                className="w-full"
            >
                {isPending ? (
                    <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sending Invitations…
                    </>
                ) : (
                    <>
                        <Send className="h-4 w-4 mr-2" />
                        Send {selectedPropertyIds.size > 0 ? `${selectedPropertyIds.size} ` : ""}
                        Invitation{selectedPropertyIds.size !== 1 ? "s" : ""}
                    </>
                )}
            </Button>
        </div>
    );
}