"use client";

import { useState } from "react";
import { RoomCard } from "./RoomCard";
import { Room } from "@/types";
import { Button } from "@/components/ui/button";

type Props = {
    rooms: (Room & {
        currentGuestName?: string | null;
        checkInDate?: Date | null;
        checkOutDate?: Date | null;
    })[];
    propertyId: string;
};

const ROOMS_PER_PAGE = 8;

export function RoomsSection({ rooms, propertyId }: Props) {
    const [page, setPage] = useState(1);

    const totalPages = Math.ceil(rooms.length / ROOMS_PER_PAGE);

    const paginatedRooms = rooms.slice(
        (page - 1) * ROOMS_PER_PAGE,
        page * ROOMS_PER_PAGE
    );

    return (
        <div className="space-y-6">
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