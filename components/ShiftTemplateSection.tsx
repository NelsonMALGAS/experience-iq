"use client"

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

export const ShiftTemplatesSection = (props: ShiftTemplatesSectionProps) => {

    const {
        shiftTemplates,
        selectedDate,
        setSelectedTemplate,
        selectedTemplate,
    } = props
    return (
        <>
            <CardHeader>
                <CardTitle className="text-lg">Quick Add Shifts</CardTitle>
                <CardDescription className="text-xs">
                    Select a date on the calendar, then click a template
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
                {shiftTemplates.map((template, idx) => {
                    const isActive = selectedTemplate?.label === template.label;

                    return (
                        <div
                            key={idx}
                            className={`
                                p-3 rounded-lg border-2 cursor-pointer transition-all duration-150
                                ${template.color}
                                ${isActive
                                    ? "border-primary shadow-sm ring-1 ring-primary"
                                    : "border-transparent hover:border-primary/30"
                                }
                            `}
                            onClick={() => setSelectedTemplate(template)}
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
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                            {selectedTemplate
                                ? `"${selectedTemplate.label}" will be added on ${new Date(selectedDate).toLocaleDateString()}`
                                : `Click any template above to add a shift on ${new Date(selectedDate).toLocaleDateString()}`
                            }
                        </AlertDescription>
                    </Alert>
                )}
            </CardContent>
        </>
    );
};