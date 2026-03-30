"use client"

import Image from "next/image";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Mail, ShieldCheck, Clock } from "lucide-react";
import useCurrentUser from "@/hooks/useCurrentUser";
import { formatDistanceToNow } from "date-fns";
import { AppUser } from "@/types";

type ProfileInfoProps = {
    user: AppUser | null
}

export function ProfileInfo({ user }: ProfileInfoProps) {

    const { currentUser } = useCurrentUser()

    const lastSignIn = currentUser?.metadata?.lastSignInTime
        ? new Date(currentUser.metadata.lastSignInTime)
        : null;

    return (
        <Popover>
            {/* Trigger */}
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 px-2 py-1.5 hover:bg-muted"
                >
                    <Image
                        src={currentUser?.photoURL || "/images/avatar.png"}
                        alt="User avatar"
                        width={32}
                        height={32}
                        className="rounded-full object-cover"
                    />

                    <p className="text-sm font-medium text-sidebar-foreground truncate">
                        {currentUser?.displayName || user?.displayName}
                    </p>
                </Button>
            </PopoverTrigger>

            {/* Content */}
            <PopoverContent className="w-72 p-4" align="end">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <Image
                        src={currentUser?.photoURL || "/images/avatar.png"}
                        alt="User avatar"
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                    />

                    <div className="min-w-0">
                        <p className="font-medium truncate">
                            {currentUser?.displayName || user?.displayName || "Guest"}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                            {currentUser?.email}
                        </p>
                    </div>
                </div>

                <Separator className="my-4" />

                {/* Info */}
                <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">

                        <span className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            Last sign in
                        </span>
                        <span className="font-medium">
                            {lastSignIn
                                ? formatDistanceToNow(lastSignIn, { addSuffix: true })
                                : "—"}
                        </span>

                    </div>

                    <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-muted-foreground">
                            <Mail className="h-4 w-4" />
                            Email verified
                        </span>
                        <span className="font-medium">
                            {currentUser?.emailVerified ? "Yes" : "No"}
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-muted-foreground">
                            <ShieldCheck className="h-4 w-4" />
                            Provider
                        </span>
                        <span className="font-medium">
                            {currentUser?.providerData?.[0]?.providerId ?? "password"}
                        </span>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
