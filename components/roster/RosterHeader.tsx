"use client"

import Link from "next/link"
import { ArrowLeft, Shield, Copy, Download, Save, Calendar, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { months, years } from "@/constants"

type Props = {
    rosterId: string | undefined
    selectedMonth: number
    selectedYear: number
    viewMode: "calendar" | "list"
    isSaving: boolean
    isLoading: boolean
    onMonthChange: (val: number) => void
    onYearChange: (val: number) => void
    onViewModeChange: (val: "calendar" | "list") => void
    onSave: () => void
    onCopyPrevious: () => void
    onExport: () => void
}

export function RosterHeader({
    rosterId,
    selectedMonth,
    selectedYear,
    viewMode,
    isSaving,
    isLoading,
    onMonthChange,
    onYearChange,
    onViewModeChange,
    onSave,
    onCopyPrevious,
    onExport,
}: Props) {
    const isDisabled = isSaving || isLoading

    return (
        <Card>
            <CardHeader className="p-4 sm:p-6">
                <div className="flex flex-col gap-5">
                    {/* Back button */}
                    <Link href="/admin" className="w-fit">
                        <Button variant="ghost" size="sm" className="gap-2 hover:bg-muted">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Dashboard
                        </Button>
                    </Link>

                    {/* Title + primary actions */}
                    <div className="flex flex-col lg:flex-row lg:items-start gap-4 lg:gap-6">
                        <div className="flex-1 min-w-0">
                            <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
                                {rosterId ? "Edit" : "Create"} Staff Roster
                            </CardTitle>
                            <CardDescription className="mt-2 text-sm sm:text-base">
                                Schedule your hospitality staff for{" "}
                                <span className="font-medium">
                                    {months[selectedMonth]} {selectedYear}
                                </span>
                            </CardDescription>
                            <div className="flex flex-wrap gap-2 mt-3">
                                <Badge variant="secondary" className="text-xs">
                                    <Shield className="w-3 h-3 mr-1" />
                                    Admin Access
                                </Badge>
                                {rosterId && (
                                    <Badge variant="outline" className="text-xs">
                                        Roster ID: {rosterId.slice(0, 8)}…
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                            <Button
                                variant="outline"
                                onClick={onCopyPrevious}
                                disabled={isDisabled}
                                className="flex-1 sm:flex-none gap-2"
                            >
                                <Copy className="w-4 h-4" />
                                <span className="hidden sm:inline">Copy Previous</span>
                            </Button>
                            <Button
                                variant="outline"
                                onClick={onExport}
                                disabled={isDisabled}
                                className="flex-1 sm:flex-none gap-2"
                            >
                                <Download className="w-4 h-4" />
                                <span className="hidden sm:inline">Export</span>
                            </Button>
                            <Button onClick={onSave} disabled={isDisabled} className="flex-1 sm:flex-none gap-2">
                                <Save className="w-4 h-4" />
                                {isSaving ? "Saving…" : rosterId ? "Save Changes" : "Create Roster"}
                            </Button>
                        </div>
                    </div>

                    {/* Filters + view toggle */}
                    <div className="flex flex-col md:flex-row md:items-end gap-4">
                        <div className="flex items-end gap-2 sm:gap-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="month" className="text-xs sm:text-sm">Month</Label>
                                <Select
                                    value={selectedMonth.toString()}
                                    onValueChange={(val) => onMonthChange(Number(val))}
                                    disabled={isLoading}
                                >
                                    <SelectTrigger id="month" className="h-9 sm:h-10">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {months.map((month, idx) => (
                                            <SelectItem key={idx} value={idx.toString()}>{month}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="year" className="text-xs sm:text-sm">Year</Label>
                                <Select
                                    value={selectedYear.toString()}
                                    onValueChange={(val) => onYearChange(Number(val))}
                                    disabled={isLoading}
                                >
                                    <SelectTrigger id="year" className="h-9 sm:h-10">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {years.map((year) => (
                                            <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <Tabs
                            value={viewMode}
                            onValueChange={(val) => onViewModeChange(val as "calendar" | "list")}
                            className="w-full md:w-auto"
                        >
                            <TabsList className="grid grid-cols-2 h-9 sm:h-10">
                                <TabsTrigger value="calendar" className="gap-2 text-xs sm:text-sm">
                                    <Calendar className="w-4 h-4" />
                                    Calendar
                                </TabsTrigger>
                                <TabsTrigger value="list" className="gap-2 text-xs sm:text-sm">
                                    <Users className="w-4 h-4" />
                                    Staff List
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                </div>
            </CardHeader>
        </Card>
    )
}