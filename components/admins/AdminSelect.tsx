"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/helpers";

interface EligibleAdmin {
    uid: string;
    displayName: string;
    email: string;
}

interface AdminSelectProps {
    eligibleAdmins: EligibleAdmin[];
    selectedAdminId: string;
    onValueChange: (value: string) => void;
}

// Deterministic muted accent from initials — stays within shadcn muted palette
const AVATAR_COLORS = [
    "bg-blue-100   text-blue-700   dark:bg-blue-900/40   dark:text-blue-300",
    "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    "bg-amber-100  text-amber-700  dark:bg-amber-900/40  dark:text-amber-300",
    "bg-rose-100   text-rose-700   dark:bg-rose-900/40   dark:text-rose-300",
    "bg-cyan-100   text-cyan-700   dark:bg-cyan-900/40   dark:text-cyan-300",
];

function avatarColor(uid: string): string {
    const idx =
        uid.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) %
        AVATAR_COLORS.length;
    return AVATAR_COLORS[idx];
}

// ── Shared inline avatar+text row used in both trigger and dropdown items ───
function AdminRow({
    admin,
    compact = false,
}: {
    admin: EligibleAdmin;
    compact?: boolean;
}) {
    const initials = getInitials(admin.displayName);
    const color = avatarColor(admin.uid);

    return (
        <div className="flex items-center gap-3.5 min-w-0 py-1">
            <Avatar
                className={`shrink-0 border border-border/60 ${compact ? "h-9 w-9" : "h-11 w-11"
                    }`}
            >
                <AvatarFallback
                    className={`text-[11px] font-semibold ${color}`}
                >
                    {initials}
                </AvatarFallback>
            </Avatar>

            <div className="flex flex-col min-w-0 justify-center gap-0.5">
                <span className="font-medium text-foreground text-sm truncate">
                    {admin.displayName}
                </span>

                <span className="text-xs text-muted-foreground truncate">
                    {admin.email}
                </span>
            </div>
        </div>
    );
}

export function AdminSelect({
    eligibleAdmins,
    selectedAdminId,
    onValueChange,
}: AdminSelectProps) {
    const selectedAdmin = eligibleAdmins.find((a) => a.uid === selectedAdminId);

    return (
        <Select value={selectedAdminId} onValueChange={onValueChange}>
            {/* ── Trigger ─────────────────────────────────────────────────── */}
            <SelectTrigger
                className="w-full h-auto py-2.5 px-3 border-border bg-background hover:bg-muted/40 focus:ring-1 focus:ring-ring transition-colors duration-150 [&>span]:flex-1 [&>span]:min-w-0"
            >
                {selectedAdmin ? (
                    <AdminRow admin={selectedAdmin} compact />
                ) : (
                    <SelectValue>
                        <span className="text-sm text-muted-foreground">
                            Select a verified admin…
                        </span>
                    </SelectValue>
                )}
            </SelectTrigger>

            {/* ── Dropdown ─────────────────────────────────────────────────── */}
            <SelectContent
                className="p-1.5 border-border shadow-lg shadow-black/6 max-h-72"
            >
                {eligibleAdmins.map((admin) => (
                    <SelectItem
                        key={admin.uid}
                        value={admin.uid}
                        className="rounded-md px-2 py-2 cursor-pointer focus:bg-muted/60 data-[state=checked]:bg-primary/8 transition-colors duration-100 [&>span:first-child]:hidden"
                    >
                        <AdminRow admin={admin} />
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}