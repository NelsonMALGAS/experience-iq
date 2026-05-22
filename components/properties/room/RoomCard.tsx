"use client";

import { useState, useTransition } from "react";
import { Room } from "@/types";
import { Button } from "@/components/ui/button";

import {
    checkInRoom,
    checkOutRoom,
    setRoomMaintenance,
} from "@/app/actions/rooms";
import { toast } from "sonner";
import {
    BedDouble,
    LogIn,
    LogOut,
    Wrench,
    User,
    CalendarCheck,
    CalendarX,
    X,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export interface SerializedRoom {
    id: string;
    roomNumber: string;
    status: "available" | "occupied" | "maintenance";
    currentGuestName?: string | null;
    checkInDate?: string | null;
    checkOutDate?: string | null;
    createdAt: string | null;
}

type RoomCardProps = {
    room: Room & {
        currentGuestName?: string | null;
        checkInDate?: Date | null;
        checkOutDate?: Date | null;
    };
    propertyId: string;
};

const statusConfig = {
    available: {
        label: "Available",
        className:
            "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
        dot: "bg-emerald-500",
    },
    occupied: {
        label: "Occupied",
        className:
            "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400",
        dot: "bg-blue-500",
    },
    maintenance: {
        label: "Maintenance",
        className:
            "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400",
        dot: "bg-amber-500",
    },
};


export function RoomCard({ room, propertyId }: RoomCardProps) {
    const [isPending, startTransition] = useTransition();
    const [showCheckInModal, setShowCheckInModal] = useState(false);
    const [guestName, setGuestName] = useState("");
    const [checkIn, setCheckIn] = useState("");
    const [checkOut, setCheckOut] = useState("");

    const config = statusConfig[room.status] ?? statusConfig.available;

    const today = new Date().toISOString().split("T")[0];

    const minCheckoutDate = checkIn
        ? new Date(new Date(checkIn).getTime() + 86400000)
            .toISOString()
            .split("T")[0]
        : "";

    function handleCheckIn() {
        if (!guestName.trim()) {
            toast.error("Please enter a guest name.");
            return;
        }

        if (!checkIn || !checkOut) {
            toast.error("Please select check-in and check-out dates.");
            return;
        }

        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        const todayDate = new Date(today);

        if (checkInDate < todayDate) {
            toast.error("Check-in date cannot be in the past.");
            return;
        }

        const diffInMs = checkOutDate.getTime() - checkInDate.getTime();
        const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

        if (diffInDays < 1) {
            toast.error("Check-out must be at least 1 day after check-in.");
            return;
        }

        startTransition(async () => {
            const result = await checkInRoom({
                propertyId,
                roomId: room.id,
                name: guestName.trim(),
                checkInDate,
                checkOutDate,
            });

            if (result.success) {
                toast.success(`Guest checked in to Room ${room.roomNumber}.`);
                setShowCheckInModal(false);
                setGuestName("");
                setCheckIn("");
                setCheckOut("");
            } else {
                toast.error(result.error ?? "Something went wrong.");
            }
        });
    }

    function handleCheckOut() {
        startTransition(async () => {
            const result = await checkOutRoom({ propertyId, roomId: room.id });
            if (result.success) {
                toast.success(`Room ${room.roomNumber} checked out.`);
            } else {
                toast.error(result.error ?? "Something went wrong.");
            }
        });
    }

    function handleMaintenance() {
        startTransition(async () => {
            const result = await setRoomMaintenance({
                propertyId,
                roomId: room.id,
            });
            if (result.success) {
                toast.success(`Room ${room.roomNumber} set to maintenance.`);
            } else {
                toast.error(result.error ?? "Something went wrong.");
            }
        });
    }

    const nights =
        checkIn && checkOut
            ? Math.max(
                0,
                Math.ceil(
                    (new Date(checkOut).getTime() -
                        new Date(checkIn).getTime()) /
                    (1000 * 60 * 60 * 24)
                )
            )
            : 0;

    return (
        <>
            <div
                className={`
                    relative rounded-xl border bg-background p-4 space-y-4
                    transition-all duration-200
                    hover:shadow-md hover:border-foreground/20
                    ${isPending ? "opacity-60 pointer-events-none" : ""}
                `}
            >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                            <BedDouble className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <p className="text-sm font-semibold text-foreground leading-tight">
                            Room {room.roomNumber}
                        </p>
                    </div>

                    {/* Status badge */}
                    <span
                        className={`
                            inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5
                            text-xs font-medium
                            ${config.className}
                        `}
                    >
                        <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
                        {config.label}
                    </span>
                </div>

                {/* Guest info */}
                <div className="space-y-1.5 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <User className="h-3.5 w-3.5 shrink-0" />
                        <span>
                            {room.status === "occupied" && room.currentGuestName
                                ? room.currentGuestName
                                : "—"}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CalendarCheck className="h-3.5 w-3.5 shrink-0" />
                        <span>
                            {room.status === "occupied" && room.checkInDate
                                ? new Date(room.checkInDate).toLocaleDateString("en-US", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric"
                                })
                                : "—"}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CalendarX className="h-3.5 w-3.5 shrink-0" />
                        <span>
                            {room.status === "occupied" && room.checkOutDate
                                ? new Date(room.checkOutDate).toLocaleDateString("en-US", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric"
                                })
                                : "—"}
                        </span>
                    </div>
                </div>



                <div className="border-t" />

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                    {room.status !== "occupied" && (
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs gap-1.5"
                            onClick={() => setShowCheckInModal(true)}
                            disabled={isPending || room.status === "maintenance"}
                        >
                            <LogIn className="h-3 w-3" />
                            {isPending ? "Updating…" : "Check In"}
                        </Button>
                    )}

                    {room.status === "occupied" && (
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs gap-1.5"
                            onClick={handleCheckOut}
                            disabled={isPending}
                        >
                            <LogOut className="h-3 w-3" />
                            {isPending ? "Updating…" : "Check Out"}
                        </Button>
                    )}

                    {room.status !== "maintenance" && (
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs gap-1.5 text-amber-600 border-amber-200 hover:bg-amber-50 dark:hover:bg-amber-950/30 dark:border-amber-800 dark:text-amber-400"
                            onClick={handleMaintenance}
                            disabled={isPending}
                        >
                            <Wrench className="h-3 w-3" />
                            {isPending ? "Updating…" : "Maintenance"}
                        </Button>
                    )}

                    {room.status === "maintenance" && (
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs gap-1.5 text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-400"
                            onClick={handleCheckOut}
                            disabled={isPending}
                        >
                            <LogIn className="h-3 w-3" />
                            {isPending ? "Updating…" : "Mark Available"}
                        </Button>
                    )}
                </div>
            </div>

            {/* Check-In Modal */}
            {showCheckInModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setShowCheckInModal(false);
                    }}
                >
                    <div className="relative w-full max-w-sm mx-4 rounded-2xl border bg-background shadow-xl p-6 space-y-5">
                        <button
                            aria-label="Close dialog"
                            onClick={() => setShowCheckInModal(false)}
                            className="absolute right-4 top-4 rounded-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>

                        <h3 className="text-base font-semibold">
                            Check In — Room {room.roomNumber}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Enter guest details to check in.
                        </p>

                        <div className="space-y-3">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-foreground">
                                    Guest Name
                                </Label>
                                <Input
                                    type="text"
                                    value={guestName}
                                    onChange={(e) => setGuestName(e.target.value)}
                                    placeholder="e.g. John Doe"
                                    className="w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-foreground">
                                        Check-In Date
                                    </Label>
                                    <Input
                                        type="date"
                                        value={checkIn}
                                        min={today}
                                        onChange={(e) => {
                                            setCheckIn(e.target.value);
                                            setCheckOut("");
                                        }}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-foreground">
                                        Check-Out Date
                                    </Label>
                                    <Input
                                        type="date"
                                        value={checkOut}
                                        min={minCheckoutDate}
                                        onChange={(e) => setCheckOut(e.target.value)}
                                        className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                    />
                                </div>

                                {checkIn && checkOut && nights > 0 && (
                                    <div className="space-y-1 text-xs text-muted-foreground">
                                        <p>
                                            {checkIn} → {checkOut}
                                        </p>
                                        <p className="font-medium text-foreground">
                                            {nights} night{nights > 1 ? "s" : ""}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-1">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setShowCheckInModal(false)}
                                disabled={isPending}
                            >
                                Cancel
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleCheckIn}
                                disabled={isPending}
                            >
                                {isPending ? "Checking In…" : "Confirm Check In"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}