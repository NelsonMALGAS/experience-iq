"use client";

import { AppUser, IssueCategory, Property, Role } from "@/types";
import { FormEvent, useState } from "react";
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

type AdminRegistrationFormProps = {
    role: Role;
    uid: AppUser["uid"];
};

type FormErrors = {
    properties?: string;
    name?: string;
    department?: string;
};


const AdminRegistrationForm = ({ role, uid }: AdminRegistrationFormProps) => {

    const { currentUser, loading } = useCurrentUser();
    const [properties, setProperties] = useState<Property[]>([]);
    const [department, setDepartment] = useState<IssueCategory>("other")
    const [name, setName] = useState(currentUser?.displayName || "");
    const [errors, setErrors] = useState<FormErrors>({});
    const [submitting, setSubmitting] = useState(false);


    const router = useRouter();

    // --- PROPERTY HANDLERS ---
    const addProperty = () => {
        setProperties((prev) => [
            ...prev,
            {
                id: crypto.randomUUID(),
                name: "",
                location: "",
                totalIssues: 0,
                resolvedIssues: 0,
                openIssues: 0,
                avgResolutionTime: 0,
                code: "",
                rooms: [],
                ownerId: uid
            },
        ]);
    };

    const updateProperty = <K extends keyof Property>(
        index: number,
        key: K,
        value: Property[K]
    ) => {
        setProperties((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [key]: value };
            return updated;
        });
    };

    // --- VALIDATION ---
    const validate = (): FormErrors => {
        const newErrors: FormErrors = {};

        if (!currentUser?.displayName && !name.trim()) {
            newErrors.name = "Name is required";
        }

        if ((role === "admin" || role === "staff") && properties.length === 0) {
            newErrors.properties = "At least one property is required";
        }

        if (role === "staff" && !department) {
            newErrors.department = "Please select a department";
        }


        if (
            properties.some(
                (p) => !p.name.trim() || !p.location.trim()
            )
        ) {
            newErrors.properties = "Property name and location are required";
        }

        return newErrors;
    };

    const buildAppUserPayload = (
        role: Role,
        uid: string,
        firebaseUser: User,
        properties: Property[],
        fallbackName: string
    ): AppUser => {
        const base = {
            photoURL: firebaseUser.photoURL ?? "/images/avatar.png",
            uid,
            role,
            isVerified: false,
            email: firebaseUser.email,
            displayName:
                firebaseUser.displayName ??
                fallbackName.trim() ??
                null,
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
                    email: null
                };

            case "staff":
                return {
                    ...base,
                    role: "staff",
                    property: [properties[0]],
                    department: department
                };

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
                name
            );


            const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/register-user`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...payload, department }),
            });

            const result = await response.json();

            if (response.status === 200) {
                router.push(`/${role}`);
                return;
            }

            if (response.status === 201) {
                // 🔁 Refresh token BEFORE redirect so custom claims are available
                await currentUser.getIdToken(true);

                toast.success("User successfully registered");
                router.push(`/${role}`);
                return;
            }

            toast.error(result?.error ?? "Something went wrong");
        } catch (err) {
            console.error(err);
            toast.error("Unexpected error occurred");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return null;

    return (
        <form onSubmit={handleSubmit} className="mt-24 space-y-6 max-w-xl">
            <h2 className="text-xl font-semibold">{`${role.charAt(0).toUpperCase()}${role.slice(1)}`} Onboarding</h2>

            <div className="space-y-2">
                <Input
                    placeholder="Full Name"
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
                                    {dept.charAt(0).toUpperCase() + dept.slice(1)}
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

            {(role === "staff" || role === "admin") && (
                <div className="space-y-3">
                    {properties.map((prop, i) => (
                        <div key={prop.id} className="flex gap-2">
                            <Input
                                placeholder="Property Name"
                                value={prop.name}
                                onChange={(e) =>
                                    updateProperty(i, "name", e.target.value)
                                }
                            />
                            <Input
                                placeholder="Property Location"
                                value={prop.location}
                                onChange={(e) =>
                                    updateProperty(i, "location", e.target.value)
                                }
                            />
                        </div>
                    ))}

                    {errors.properties && (
                        <p className="text-sm text-destructive">
                            {errors.properties}
                        </p>
                    )}

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addProperty}
                    >
                        Add Property
                    </Button>
                </div>
            )}

            <Button type="submit" disabled={submitting}>
                {submitting ? "Submitting..." : "Complete Registration"}
            </Button>
        </form>
    );
};

export default AdminRegistrationForm;
