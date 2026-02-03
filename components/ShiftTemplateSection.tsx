"use client"

import { AlertCircle, Clock } from "lucide-react";
import { CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dispatch, SetStateAction } from "react";

export const ShiftTemplatesSection = ({
    shiftTemplates,
    selectedDate,
    setSelectedTemplate,
}: {
    shiftTemplates: Array<{ label: string; start: string; end: string; color: string }>;
    selectedDate: string;
    setSelectedTemplate: Dispatch<SetStateAction<{
        label: string;
        start: string;
        end: string;
        color: string;
    } | null>>
}) => {
    return (
        <>
            <CardHeader>
                <CardTitle className="text-lg">Quick Add Shifts</CardTitle>
                <CardDescription className="text-xs">
                    Select a date on the calendar, then click a template
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
                {shiftTemplates.map((template, idx) => (
                    <div
                        key={idx}
                        className={`p-3 rounded-lg border cursor-pointer ${template.color}`}
                        onClick={() => setSelectedTemplate(template)}
                    >
                        <div className="font-semibold text-sm">{template.label}</div>
                        <div className="text-xs flex items-center gap-1 mt-1 opacity-80">
                            <Clock className="w-3 h-3" />
                            {template.start} - {template.end}
                        </div>
                    </div>
                ))}
                {selectedDate && (
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                            Click any template above to add a shift on {new Date(selectedDate).toLocaleDateString()}
                        </AlertDescription>
                    </Alert>
                )}
            </CardContent>
        </>
    );
};