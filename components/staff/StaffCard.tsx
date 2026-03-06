"use client"

import { unverifyStaffUser, verifyStaffUser } from "@/app/staffVerificationActions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { StaffMember } from "@/types";
import { CheckCircle2, ShieldOff, Mail, Briefcase } from "lucide-react";
import { ActionButton } from "../FormActionButton";

interface StaffCardProps {
    staff: StaffMember;
}

function getInitials(name: string): string {
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

function truncateName(name: string) {
    return name.length > 10 ? name.slice(0, 10) + "..." : name;
}


export function StaffCard({ staff }: StaffCardProps) {
    // Bind the staffId into the server action via a hidden input + form action
    const verifyAction = verifyStaffUser.bind(null, staff.id);
    const unverifyAction = unverifyStaffUser.bind(null, staff.id);
    // const deleteStaff = deleteStaffUser.bind(null, staff.id);

    return (
        <Card className="group border border-border bg-card hover:shadow-lg transition-all duration-200">
            <CardContent className="p-5 flex flex-col gap-4">

                {/* Top Section */}
                <div className="flex items-start gap-4">

                    {/* Avatar */}
                    <Avatar className="h-11 w-11 shrink-0 border border-border shadow-sm">
                        <AvatarFallback className="bg-muted text-muted-foreground text-sm font-semibold">
                            {getInitials(staff.name)}
                        </AvatarFallback>
                    </Avatar>

                    {/* Name + Meta */}
                    <div className="flex-1 min-w-0 space-y-1">

                        {/* Name Row */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold text-foreground">
                                {truncateName(staff.name)}
                            </p>

                            <Badge variant="outline" className="text-[10px]">
                                Staff
                            </Badge>

                            {staff.isVerified && (
                                <Badge className="text-[10px] bg-green-100 text-green-800 border-green-200">
                                    Verified
                                </Badge>
                            )}
                        </div>

                        {/* Email */}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground truncate">
                            <Mail className="h-3 w-3 shrink-0" />
                            <span className="truncate">{staff.email}</span>
                        </div>

                        {/* Department */}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Briefcase className="h-3 w-3 shrink-0" />
                            <span>{staff.department}</span>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-border" />

                {/* Action */}
                <div className="flex justify-end">
                    {staff.isVerified ? (
                        <form action={unverifyAction}>
                            <ActionButton
                                label="Unverify"
                                icon={<ShieldOff className="h-3.5 w-3.5" />}
                                variant="outline"
                                className="text-yellow-600 border-yellow-200 hover:bg-yellow-50 hover:text-yellow-700 dark:hover:bg-yellow-950/30"
                            />
                        </form>
                    ) : (
                        <>
                            <form action={verifyAction}>
                                <ActionButton
                                    label="Verify"
                                    icon={<CheckCircle2 className="h-3.5 w-3.5" />}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                />
                            </form>
                            {/* <form action={deleteStaff}>
                                <ActionButton
                                    label="Delete"
                                    icon={<Trash2 className="h-3.5 w-3.5" />}
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                />
                            </form> */}
                        </>
                    )}
                </div>

            </CardContent>
        </Card>
    );
}