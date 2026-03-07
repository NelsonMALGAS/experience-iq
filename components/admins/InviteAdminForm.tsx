"use client";


import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, UserPlus, ChevronDown } from "lucide-react";
import { EligibleAdminForInvite, Property } from "@/types";
import { DEFAULT_PERMISSIONS } from "@/constants";
import { inviteAdminToProperty } from "@/app/admin-invite-actions";


interface InviteAdminFormProps {
    eligibleAdmins: EligibleAdminForInvite[];
    properties: Property[];
    inviterUid: string;
}

function getInitials(name: string) {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

export function InviteAdminForm({ eligibleAdmins, properties, inviterUid }: InviteAdminFormProps) {
    const [isPending, startTransition] = useTransition();
    const [selectedAdmin, setSelectedAdmin] = useState<string>("");
    const [selectedProperty, setSelectedProperty] = useState<string>("");
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

    const handleInvite = () => {
        if (!selectedAdmin || !selectedProperty) return;
        setResult(null);

        startTransition(async () => {
            const res = await inviteAdminToProperty(
                inviterUid,
                selectedAdmin,
                selectedProperty,
                DEFAULT_PERMISSIONS
            );
            setResult({
                success: res.success,
                message: res.success
                    ? "Invitation sent successfully."
                    : "Failed to send invitation.",
            });
            if (res.success) {
                setSelectedAdmin("");
                setSelectedProperty("");
            }
        });
    };

    return (
        <div className="space-y-5">
            {/* Admin selector */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Select Admin to Invite</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                    {eligibleAdmins.map((admin) => (
                        <button
                            key={admin.uid}
                            type="button"
                            onClick={() => setSelectedAdmin(admin.uid)}
                            className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all duration-150
                                ${selectedAdmin === admin.uid
                                    ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                                    : "border-border hover:border-slate-400 bg-card"
                                }`}
                        >
                            <Avatar className="h-8 w-8 shrink-0 border border-border">
                                <AvatarFallback className="text-xs font-semibold bg-muted">
                                    {getInitials(admin.displayName)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                                <p className="text-sm font-medium truncate">{admin.displayName}</p>
                                <p className="text-xs text-muted-foreground truncate">{admin.email}</p>
                            </div>
                            {selectedAdmin === admin.uid && (
                                <Badge className="ml-auto shrink-0 bg-primary/10 text-primary border-primary/20 text-xs">
                                    Selected
                                </Badge>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Property selector */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Select Property</label>
                <div className="relative">
                    <select
                        value={selectedProperty}
                        onChange={(e) => setSelectedProperty(e.target.value)}
                        className="w-full appearance-none rounded-md border border-input bg-background px-3 py-2 pr-8 text-sm
                                   focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                        <option value="">Choose a property...</option>
                        {properties.map((p) => (
                            <option key={p.id} value={p.id}>{p.name} — {p.location}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
            </div>

            {/* Result feedback */}
            {result && (
                <p className={`text-sm px-3 py-2 rounded-lg border ${result.success
                    ? "bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900/40"
                    : "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/40"
                    }`}>
                    {result.message}
                </p>
            )}

            <Button
                onClick={handleInvite}
                disabled={isPending || !selectedAdmin || !selectedProperty}
                className="gap-2"
            >
                {isPending ? (
                    <><Loader2 className="h-4 w-4 animate-spin" />Sending invitation…</>
                ) : (
                    <><UserPlus className="h-4 w-4" />Send Invitation</>
                )}
            </Button>
        </div>
    );
}