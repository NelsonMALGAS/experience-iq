"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Property, UserSubscription } from "@/types";
import { MapPin, Search, Building2, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { AddPropertyDialog } from "@/components/Addpropertydialog";
import CopyPropertyCode from "@/components/CopyPropertyCode";
import { PropertyDetailsPopover } from "@/components/properties/PropertyDetailsPopover";
import { useState, useMemo, useEffect, useRef } from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import usePagination from "@/hooks/usePagination";

interface PropertiesClientProps {
    uid: string;
    properties: Property[];
    subscription: UserSubscription | null | undefined;
}

export const PropertiesClient = ({ uid, properties, subscription }: PropertiesClientProps) => {
    const [searchInput, setSearchInput] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);


    // Debounce: only update the actual search term 400ms after the user stops typing
    useEffect(() => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);

        debounceTimer.current = setTimeout(() => {
            setDebouncedSearch(searchInput.trim().toLowerCase());
        }, 400);

        return () => {
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
        };
    }, [searchInput]);

    // Filter properties by name using the debounced value
    const filteredProperties = useMemo(() => {
        if (!debouncedSearch) return properties;
        return properties.filter((p) =>
            p.name.toLowerCase().includes(debouncedSearch)
        );
    }, [properties, debouncedSearch]);

    const {
        paginatedData,
        currentPage,
        itemsPerPage,
        hasNext,
        hasPrev,
        nextPage,
        prevPage,
        reset,
        totalPages
    } = usePagination(filteredProperties, 6)

    useEffect(() => {
        reset();
    }, [debouncedSearch, reset]);

    const totalIssues = properties.reduce((sum, p) => sum + p.totalIssues, 0);
    const hasSearch = debouncedSearch.length > 0;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-foreground">Properties</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage and monitor all properties with live statistics
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search properties..."
                            className="pl-9 bg-card"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                        />
                        {/* Clear button */}
                        {searchInput && (
                            <button
                                onClick={() => setSearchInput("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors text-xs"
                                aria-label="Clear search"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                    <AddPropertyDialog uid={uid} properties={properties} subscription={subscription} />
                </div>
            </div>

            {/* Info Badge */}
            {properties.length > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20 w-fit">
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    <p className="text-xs text-primary font-medium">
                        {hasSearch
                            ? `Showing ${filteredProperties.length} of ${properties.length} properties`
                            : `Live statistics derived from ${totalIssues} issues`}
                    </p>
                </div>
            )}

            {/* Properties Grid */}
            {filteredProperties.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {paginatedData.map((property, index) => {
                            const resolutionRate =
                                property.totalIssues > 0
                                    ? Math.round(
                                        ((property.totalIssues - property.openIssues) /
                                            property.totalIssues) *
                                        100
                                    )
                                    : 0;

                            return (
                                <Card
                                    key={property.id}
                                    className="group relative overflow-hidden border border-border bg-card transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-slide-up"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    {/* Header */}
                                    <div className="relative h-32 bg-linear-to-br from-primary/10 via-primary/5 to-transparent">
                                        <div className="absolute inset-0 bg-linear-to-t from-background/80 to-transparent" />
                                        <CopyPropertyCode code={property.code} />
                                        <div className="absolute bottom-4 left-4 space-y-1">
                                            <h3 className="text-lg font-semibold text-card-foreground">
                                                {property.name}
                                            </h3>
                                            <p className="flex items-center gap-1 text-sm text-muted-foreground">
                                                <MapPin className="h-3.5 w-3.5" />
                                                {property.location}
                                            </p>
                                        </div>
                                        <div className="absolute top-3 right-3">
                                            <PropertyDetailsPopover property={property} />
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <CardContent className="p-6 space-y-4">
                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="rounded-lg bg-muted/50 p-3 text-center">
                                                <p className="text-2xl font-bold text-foreground">
                                                    {property.totalIssues}
                                                </p>
                                                <p className="text-xs text-muted-foreground">Total</p>
                                            </div>
                                            <div
                                                className={`rounded-lg p-3 text-center ${property.openIssues > 0
                                                    ? "bg-destructive/10"
                                                    : "bg-success/10"
                                                    }`}
                                            >
                                                <p
                                                    className={`text-2xl font-bold ${property.openIssues > 0
                                                        ? "text-destructive"
                                                        : "text-success"
                                                        }`}
                                                >
                                                    {property.openIssues}
                                                </p>
                                                <p className="text-xs text-muted-foreground">Open</p>
                                            </div>
                                            <div className="rounded-lg bg-muted/50 p-3 text-center">
                                                <p className="text-2xl font-bold text-foreground">
                                                    {property.avgResolutionTime}h
                                                </p>
                                                <p className="text-xs text-muted-foreground">Avg</p>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">Resolution Rate</span>
                                                <span className="font-medium text-foreground">
                                                    {resolutionRate}%
                                                </span>
                                            </div>
                                            <Progress value={resolutionRate} className="h-2" />
                                        </div>

                                        <div className="pt-2 border-t border-border">
                                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                <span>Resolved Issues</span>
                                                <span className="font-medium text-success">
                                                    {property.resolvedIssues}
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="px-6 pb-6 pt-0">
                                        <Button asChild variant="outline" className="w-full">
                                            <Link href={`/admin/properties/${property.id}`}>
                                                View Property
                                            </Link>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            );
                        })}
                    </div>
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-6">
                            {/* Info */}
                            <p className="text-xs text-muted-foreground">
                                Showing {(currentPage - 1) * itemsPerPage + 1}–
                                {Math.min(currentPage * itemsPerPage, filteredProperties.length)} of {filteredProperties.length}
                            </p>

                            {/* Controls */}
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={prevPage}
                                    disabled={!hasPrev}
                                    aria-label="Previous page"
                                >
                                    <ChevronLeft className="h-3.5 w-3.5" />
                                </Button>

                                <span className="text-xs px-2">
                                    {currentPage} / {totalPages}
                                </span>

                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={nextPage}
                                    disabled={!hasNext}
                                    aria-label="Next page"
                                >
                                    <ChevronRight className="h-3.5 w-3.5" />
                                </Button>

                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={reset}
                                    aria-label="Reset pagination"
                                >
                                    <RotateCcw className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                /* Empty State — shown for both no properties and no search results */
                <Card className="border-dashed border-2">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <div className="rounded-full bg-muted p-6 mb-4">
                            <Building2 className="h-12 w-12 text-muted-foreground" />
                        </div>
                        {hasSearch ? (
                            <>
                                <h3 className="text-xl font-semibold text-foreground mb-2">
                                    No Properties Found
                                </h3>
                                <p className="text-muted-foreground text-center mb-6 max-w-md">
                                    No properties match &ldquo;{debouncedSearch}&rdquo;. Try a different name.
                                </p>
                                <button
                                    aria-label="Clear search"
                                    onClick={() => setSearchInput("")}
                                    className="text-sm text-primary underline underline-offset-4 hover:opacity-80 transition-opacity"
                                >
                                    Clear search
                                </button>
                            </>
                        ) : (
                            <>
                                <h3 className="text-xl font-semibold text-foreground mb-2">
                                    No Properties Yet
                                </h3>
                                <p className="text-muted-foreground text-center mb-6 max-w-md">
                                    Get started by adding your first property. Properties help you organize
                                    and track issues across different locations.
                                </p>
                                <AddPropertyDialog
                                    uid={uid}
                                    properties={properties}
                                    subscription={subscription}
                                />
                            </>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
};