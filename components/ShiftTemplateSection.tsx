"use client";

import { AlertCircle, Clock } from "lucide-react";
import { CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dispatch, SetStateAction } from "react";
import { ShiftTemplate } from "@/types";

export type ShiftTemplatesSectionProps = {
    shiftTemplates: ShiftTemplate[];
    selectedDate: string;
    selectedTemplate: ShiftTemplate | null;
    setSelectedTemplate: Dispatch<SetStateAction<ShiftTemplate | null>>;
};

export const ShiftTemplatesSection = ({
    shiftTemplates,
    selectedDate,
    setSelectedTemplate,
    selectedTemplate,
}: ShiftTemplatesSectionProps) => {
    return (

        <div className="flex flex-col min-h-0 h-full">
            {/* ── Header ─────────────────────────────────────────────── */}
            <CardHeader className="shrink-0 pb-3">
                <CardTitle className="text-lg">Quick Add Shifts</CardTitle>
                <CardDescription className="text-xs">
                    Select a date on the calendar, then click a template
                </CardDescription>
            </CardHeader>

            {/* ── Scrollable template list ────────────────────────────── */}
            <CardContent className="flex-1 overflow-y-auto min-h-0 space-y-2">
                {shiftTemplates.map((template, idx) => {
                    const isActive = selectedTemplate?.label === template.label;

                    return (
                        <div
                            key={idx}
                            onClick={() => setSelectedTemplate(template)}
                            className={`
                                p-3 rounded-lg border-2 cursor-pointer transition-all duration-150 select-none
                                ${template.color}
                                ${isActive
                                    ? "border-primary shadow-sm ring-1 ring-primary"
                                    : "border-transparent hover:border-primary/30"
                                }
                            `}
                        >
                            <div className="font-semibold text-sm">{template.label}</div>
                            <div className="text-xs flex items-center gap-1 mt-1 opacity-80">
                                <Clock className="w-3 h-3" />
                                {template.start} - {template.end}
                            </div>
                        </div>
                    );
                })}

                {selectedDate && (
                    <Alert className="mt-1">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                            {selectedTemplate
                                ? `"${selectedTemplate.label}" will be added on ${new Date(selectedDate).toLocaleDateString()}`
                                : `Click any template above to add a shift on ${new Date(selectedDate).toLocaleDateString()}`}
                        </AlertDescription>
                    </Alert>
                )}
            </CardContent>
        </div>
    );
};