"use client";

import { AppUser, IssueCategory, Property, Role } from "@/types";
import { FormEvent, useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useCurrentUser from "@/hooks/useCurrentUser";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { User } from "firebase/auth";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { STAFF_DEPARTMENTS } from "@/constants";
import Image from "next/image";
import { PropertySelect } from "./properties/PropertySelect";

type AdminRegistrationFormProps = {
    role: Role;
    uid: AppUser["uid"];
};

type FormErrors = {
    properties?: string;
    name?: string;
    department?: string;
    selectedProperty?: string;
};

const AdminRegistrationForm = ({ role, uid }: AdminRegistrationFormProps) => {
    const { currentUser, loading } = useCurrentUser();
    const [properties, setProperties] = useState<Property[]>([]);
    const [department, setDepartment] = useState<IssueCategory>("other");
    const [name, setName] = useState(currentUser?.displayName || "");
    const [errors, setErrors] = useState<FormErrors>({});
    const [submitting, setSubmitting] = useState(false);

    // Staff-specific state
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
    const [adminId, setAdminId] = useState<string | undefined>(undefined);

    const router = useRouter();

    // Initialize placeholder properties for admin
    useEffect(() => {
        if (role === "admin") {
            setProperties([
                {
                    id: crypto.randomUUID(),
                    name: "-",
                    location: "-",
                    totalIssues: 0,
                    resolvedIssues: 0,
                    openIssues: 0,
                    avgResolutionTime: 0,
                    code: "",
                    rooms: [],
                    ownerId: uid,
                },
                {
                    id: crypto.randomUUID(),
                    name: "-",
                    location: "-",
                    totalIssues: 0,
                    resolvedIssues: 0,
                    openIssues: 0,
                    avgResolutionTime: 0,
                    code: "",
                    rooms: [],
                    ownerId: uid,
                },
            ]);
        }
    }, [role, uid]);

    // Handle staff property selection
    const handlePropertyChange = useCallback((property: Property | null) => {
        setSelectedProperty(property);
        setAdminId(property?.ownerId ?? undefined);
        if (property) {
            setErrors((prev) => ({ ...prev, selectedProperty: undefined }));
        }
    }, []);

    // --- VALIDATION ---
    const validate = (): FormErrors => {
        const newErrors: FormErrors = {};

        if (!currentUser?.displayName && !name.trim()) {
            newErrors.name = "Name is required";
        }

        if (role === "staff" && !selectedProperty) {
            newErrors.selectedProperty = "Please select a property";
        }

        if (role === "staff" && selectedProperty && !selectedProperty.ownerId) {
            newErrors.selectedProperty =
                "Selected property has no owner. Please contact administrator.";
        }

        if (role === "staff" && !department) {
            newErrors.department = "Please select a department";
        }

        return newErrors;
    };

    const buildAppUserPayload = (
        role: Role,
        uid: string,
        firebaseUser: User,
        properties: Property[],
        fallbackName: string,
        selectedProperty: Property | null,
        adminId: string | undefined
    ): AppUser => {
        const base = {
            photoURL: firebaseUser.photoURL ?? "/images/avatar.png",
            uid,
            role,
            isVerified: false,
            email: firebaseUser.email,
            displayName:
                firebaseUser.displayName ?? fallbackName.trim() ?? null,
            isAnonymous: firebaseUser.isAnonymous,
            authMetadata: {
                creationTime: firebaseUser.metadata.creationTime ?? null,
                lastSignInTime: firebaseUser.metadata.lastSignInTime ?? null,
            },
        };

        switch (role) {
            case "guest":
                return {
                    ...base,
                    role: "guest",
                    property: null,
                    email: null,
                };

            case "staff": {
                if (!selectedProperty) {
                    throw new Error("Staff must have a selected property");
                }
                const staffProperty: Property = selectedProperty;
                return {
                    ...base,
                    role: "staff",
                    property: [staffProperty],
                    adminId: adminId,
                    department: department,
                };
            }

            case "admin":
                return {
                    ...base,
                    role: "admin",
                    property: properties,
                };
        }
    };

    // --- SUBMIT ---
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!currentUser) return;

        const validationErrors = validate();
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) return;

        setSubmitting(true);

        try {
            const payload = buildAppUserPayload(
                role,
                uid,
                currentUser,
                properties,
                name,
                selectedProperty,
                adminId
            );

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_URL}/api/register-user`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...payload, department }),
                }
            );

            const result = await response.json();

            if (response.status === 200) {
                router.push(`/${role}`);
                return;
            }

            if (response.status === 201) {
                await currentUser.getIdToken(true);
                toast.success("🎉 Success", {
                    description: "User successfully registered",
                });
                router.push(`/${role}`);
                return;
            }

            toast.error("🚨 Error", {
                description: result?.error ?? "Something went wrong",
            });
        } catch (err) {
            console.error(err);
            toast.error("Unexpected error occurred");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return null;

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4 py-12">
            <div className="w-full max-w-xl space-y-8">
                {/* Logo + Branding */}
                <div className="flex flex-col items-center text-center space-y-4">
                    <Image
                        src="/images/experienceIQ.png"
                        alt="ExperienceIQ Logo"
                        width={180}
                        height={60}
                        priority
                        className="object-contain"
                    />

                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Welcome to ExperienceIQ
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Complete your {role} onboarding to get started
                        </p>
                    </div>
                </div>

                {/* Card */}
                <div className="bg-card border rounded-2xl shadow-sm p-8 space-y-6">
                    <div className="space-y-1">
                        <h2 className="text-xl font-semibold capitalize">
                            {role} Registration
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            {role === "admin" &&
                                "Set up your account to start managing properties and staff."}
                            {role === "staff" &&
                                "Join a property team and start resolving guest issues efficiently."}
                            {role === "guest" &&
                                "Create your guest profile to begin reporting issues."}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Name Input */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Full Name</label>
                            <Input
                                placeholder="Enter your full name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={!!currentUser?.displayName}
                            />

                            {errors.name && (
                                <p className="text-sm text-destructive">
                                    {errors.name}
                                </p>
                            )}

                            {currentUser?.displayName && (
                                <p className="text-xs text-muted-foreground">
                                    Name pulled from your account
                                </p>
                            )}
                        </div>

                        {/* Staff Department Selection */}
                        {role === "staff" && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Department
                                </label>

                                <Select
                                    value={department}
                                    onValueChange={(value) =>
                                        setDepartment(value as IssueCategory)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select department" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        {STAFF_DEPARTMENTS.map((dept) => (
                                            <SelectItem key={dept} value={dept}>
                                                {dept.charAt(0).toUpperCase() +
                                                    dept.slice(1)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {errors.department && (
                                    <p className="text-sm text-destructive">
                                        {errors.department}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Staff Property Selection - WITH INFINITE SCROLL */}
                        {role === "staff" && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Select Property
                                </label>

                                <PropertySelect
                                    value={selectedProperty}
                                    onChange={handlePropertyChange}
                                    placeholder="Search and select a property..."
                                    limit={2}
                                />

                                {errors.selectedProperty && (
                                    <p className="text-sm text-destructive">
                                        {errors.selectedProperty}
                                    </p>
                                )}

                                {selectedProperty && (
                                    <p className="text-xs text-muted-foreground">
                                        You will be assigned to{" "}
                                        <span className="font-medium">
                                            {selectedProperty.name}
                                        </span>
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Admin Property Info */}
                        {role === "admin" && (
                            <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800 p-4">
                                <div className="flex items-start gap-3">
                                    <div className="shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                                        <svg
                                            className="w-5 h-5 text-blue-600 dark:text-blue-400"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                                            Property Management
                                        </h3>
                                        <p className="text-sm text-blue-800 dark:text-blue-200">
                                            You&apos;ll be able to add and manage
                                            properties after completing your
                                            subscription. This allows you to configure
                                            multiple properties, add rooms, and
                                            customize settings for your hospitality
                                            business.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            disabled={submitting}
                            className="w-full"
                            size="lg"
                        >
                            {submitting ? "Submitting..." : "Complete Registration"}
                        </Button>
                    </form>
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-muted-foreground">
                    © {new Date().getFullYear()}{" "}
                    <span className="text-primary font-semibold">
                        ExperienceIQ
                    </span>
                    . All rights reserved.
                </p>
            </div>
        </div>
    );
};

export default AdminRegistrationForm;