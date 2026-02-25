"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
    collection,
    query,
    orderBy,
    limit,
    startAfter,
    getDocs,
    DocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/db/client";
import { Property } from "@/types";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type PropertySelectProps = {
    value: Property | null;
    onChange: (property: Property | null) => void;
    disabled?: boolean;
    placeholder?: string;
    limit?: number;
};

export function PropertySelect({
    value,
    onChange,
    disabled = false,
    placeholder = "Select a property...",
    limit: limitCount = 10,
}: PropertySelectProps) {
    const [open, setOpen] = useState(false);
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(false);
    const [lastVisible, setLastVisible] = useState<DocumentSnapshot | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const observerTarget = useRef<HTMLDivElement>(null);

    // Fetch initial properties
    const fetchInitialProperties = useCallback(async () => {
        try {
            setLoading(true);

            const propertiesRef = collection(db, "properties");
            const q = query(
                propertiesRef,
                orderBy("name"),
                limit(limitCount)
            );

            const snapshot = await getDocs(q);

            const fetched: Property[] = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Property[];

            setProperties(fetched);
            setLastVisible(snapshot.docs[snapshot.docs.length - 1] || null);
            setHasMore(snapshot.docs.length === limitCount);
        } catch (error) {
            console.error("Error fetching properties:", error);
        } finally {
            setLoading(false);
        }
    }, [limitCount]);

    // Fetch more properties
    const fetchMoreProperties = useCallback(async () => {
        if (!lastVisible || !hasMore || loading) return;

        try {
            setLoading(true);

            const propertiesRef = collection(db, "properties");
            const q = query(
                propertiesRef,
                orderBy("name"),
                startAfter(lastVisible),
                limit(limitCount)
            );

            const snapshot = await getDocs(q);

            const fetched: Property[] = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Property[];

            setProperties((prev) => [...prev, ...fetched]);
            setLastVisible(snapshot.docs[snapshot.docs.length - 1] || null);
            setHasMore(snapshot.docs.length === limitCount);
        } catch (error) {
            console.error("Error fetching more properties:", error);
        } finally {
            setLoading(false);
        }
    }, [lastVisible, hasMore, loading, limitCount]);

    // Load initial properties when popover opens
    useEffect(() => {
        if (open && properties.length === 0) {
            fetchInitialProperties();
        }
    }, [open, properties.length, fetchInitialProperties]);

    // Intersection Observer for infinite scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    fetchMoreProperties();
                }
            },
            { threshold: 1.0 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => observer.disconnect();
    }, [fetchMoreProperties, hasMore, loading]);

    // Filter properties based on search
    const filteredProperties = properties.filter((property) =>
        property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.location.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSelect = (property: Property) => {
        onChange(property);
        setOpen(false);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    disabled={disabled}
                    className="w-full justify-between"
                >
                    {value ? (
                        <span className="truncate">
                            {value.name} — {value.location}
                        </span>
                    ) : (
                        <span className="text-muted-foreground">{placeholder}</span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
                <Command>
                    <CommandInput
                        placeholder="Search properties..."
                        value={searchQuery}
                        onValueChange={setSearchQuery}
                    />
                    <CommandList className="max-h-75 overflow-y-auto">
                        <CommandEmpty>
                            {loading ? "Loading properties..." : "No properties found."}
                        </CommandEmpty>
                        <CommandGroup>
                            {filteredProperties.map((property) => (
                                <CommandItem
                                    key={property.id}
                                    value={property.id}
                                    onSelect={() => handleSelect(property)}
                                    className="cursor-pointer"
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value?.id === property.id
                                                ? "opacity-100"
                                                : "opacity-0"
                                        )}
                                    />
                                    <div className="flex flex-col">
                                        <span className="font-medium">{property.name}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {property.location}
                                        </span>
                                    </div>
                                </CommandItem>
                            ))}

                            {/* Loading indicator */}
                            {loading && (
                                <div className="flex items-center justify-center py-4">
                                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                    <span className="ml-2 text-sm text-muted-foreground">
                                        Loading more...
                                    </span>
                                </div>
                            )}

                            {/* Intersection observer target */}
                            {hasMore && !loading && (
                                <div
                                    ref={observerTarget}
                                    className="h-4 w-full"
                                    aria-hidden="true"
                                />
                            )}

                            {/* End of list indicator */}
                            {!hasMore && properties.length > 0 && (
                                <div className="py-4 text-center text-sm text-muted-foreground">
                                    No more properties
                                </div>
                            )}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}