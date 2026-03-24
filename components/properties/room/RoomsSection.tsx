"use client";

import { useEffect, useState } from "react";
import { RoomCard } from "./RoomCard";
import { Room } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
    rooms: (Room & {
        currentGuestName?: string | null;
        checkInDate?: Date | null;
        checkOutDate?: Date | null;
    })[];
    propertyId: string;
};

type StatusFilter = "all" | "available" | "occupied" | "maintenance"

const ROOMS_PER_PAGE = 8;

export function RoomsSection({ rooms, propertyId }: Props) {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

    const filteredRooms = rooms.filter((room) => {
        const matchesSearch = room.roomNumber
            .toLowerCase()
            .includes(search.toLowerCase());

        const matchesStatus =
            statusFilter === "all" ? true : room.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const totalPages = Math.ceil(filteredRooms.length / ROOMS_PER_PAGE);

    const paginatedRooms = filteredRooms.slice(
        (page - 1) * ROOMS_PER_PAGE,
        page * ROOMS_PER_PAGE
    );


    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPage(1);
    }, [search, statusFilter]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">

                {/* Search */}
                <Input
                    type="text"
                    placeholder="Search room number..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full sm:max-w-xs rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />

                {/* Status Filter */}
                <div className="flex gap-2 flex-wrap">
                    {["all", "available", "occupied", "maintenance"].map((status) => (
                        <Button
                            key={status}
                            variant={statusFilter === status ? "default" : "outline"}
                            onClick={() => setStatusFilter(status as StatusFilter)}
                            className="px-3 py-1.5 text-xs rounded-full border transition-colors"
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Button>
                    ))}
                </div>
            </div>
            <p className="text-xs text-muted-foreground">
                Showing {paginatedRooms.length} of {filteredRooms.length} rooms
            </p>
            {/* Rooms Grid */}
            <div className="grid gap-4 sm:gap-5 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {paginatedRooms.map((room) => (
                    <RoomCard
                        key={room.id}
                        room={room}
                        propertyId={propertyId}
                    />
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between border-t pt-4">
                    <Button
                        size="sm"
                        variant="outline"
                        disabled={page === 1}
                        onClick={() => setPage((p) => p - 1)}
                    >
                        Previous
                    </Button>

                    <span className="text-sm text-muted-foreground">
                        Page <span className="font-medium text-foreground">{page}</span> of {totalPages}
                    </span>

                    <Button
                        size="sm"
                        variant="outline"
                        disabled={page === totalPages}
                        onClick={() => setPage((p) => p + 1)}
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
}