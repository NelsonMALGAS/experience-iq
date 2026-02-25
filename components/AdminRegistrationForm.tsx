"use client";

import { AppUser, IssueCategory, Property, Role } from "@/types";
import { FormEvent, useState, useEffect } from "react";
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
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/db/client";
import { Loader2 } from "lucide-react";

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
    const [availableProperties, setAvailableProperties] = useState<Property[]>([]);
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
    const [adminId, setAdminId] = useState<string | undefined>(undefined);
    const [loadingProperties, setLoadingProperties] = useState(false);

    const router = useRouter();

    // Fetch available properties for staff
    useEffect(() => {
        if (role !== "staff") return;

        setLoadingProperties(true);

        const propertiesRef = collection(db, "properties");
        const unsubscribe = onSnapshot(
            propertiesRef,
            (snapshot) => {
                const fetchedProperties: Property[] = [];
                snapshot.forEach((doc) => {
                    fetchedProperties.push({
                        id: doc.id,
                        ...doc.data(),
                    } as Property);
                });

                setAvailableProperties(fetchedProperties);
                setLoadingProperties(false);
            },
            (error) => {
                console.error("Error fetching properties:", error);
                toast.error("Failed to load properties");
                setLoadingProperties(false);
            }
        );

        return () => unsubscribe();
    }, [role]);

    // Handle staff property selection
    const handlePropertySelect = (propertyId: string) => {
        const property = availableProperties.find((p) => p.id === propertyId);
        if (property) {
            setSelectedProperty(property);
            setAdminId(property.ownerId ?? undefined);
            setErrors((prev) => ({ ...prev, selectedProperty: undefined }));
        }
    };

    // --- PROPERTY HANDLERS (Admin only) ---
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
                ownerId: uid,
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

        if (role === "admin" && properties.length === 0) {
            newErrors.properties = "At least one property is required";
        }

        if (role === "staff" && !selectedProperty) {
            newErrors.selectedProperty = "Please select a property";
        }

        if (role === "staff" && selectedProperty && !selectedProperty.ownerId) {
            newErrors.selectedProperty = "Selected property has no owner. Please contact administrator.";
        }

        if (role === "staff" && !department) {
            newErrors.department = "Please select a department";
        }

        if (
            role === "admin" &&
            properties.some((p) => !p.name.trim() || !p.location.trim())
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
                // Type guard: ensures selectedProperty is not null
                if (!selectedProperty) {
                    throw new Error("Staff must have a selected property");
                }
                // Explicit type assertion
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
                // 🔁 Refresh token BEFORE redirect so custom claims are available
                await currentUser.getIdToken(true);

                toast.success("🎉 Success", { description: "User successfully registered" });
                router.push(`/${role}`);
                return;
            }

            toast.error("🚨 Error", { description: result?.error ?? "Something went wrong" });
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

            {/* Name Input */}
            <div className="space-y-2">
                <Input
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={!!currentUser?.displayName}
                />

                {errors.name && (
                    <p className="text-sm text-destructive">{errors.name}</p>
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
                    <label className="text-sm font-medium">Department</label>

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

            {/* Staff Property Selection */}
            {role === "staff" && (
                <div className="space-y-2">
                    <label className="text-sm font-medium">
                        Select Property
                    </label>

                    {loadingProperties ? (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm">Loading properties...</span>
                        </div>
                    ) : availableProperties.length === 0 ? (
                        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4">
                            <p className="text-sm text-destructive">
                                No properties available. Please contact an administrator.
                            </p>
                        </div>
                    ) : (
                        <>
                            <Select
                                value={selectedProperty?.id ?? ""}
                                onValueChange={handlePropertySelect}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a property" />
                                </SelectTrigger>

                                <SelectContent>
                                    {availableProperties.map((property) => (
                                        <SelectItem
                                            key={property.id}
                                            value={property.id}
                                        >
                                            {property.name} - {property.location}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

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
                        </>
                    )}
                </div>
            )}

            {/* Admin Property Creation */}
            {role === "admin" && (
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

            {/* Submit Button */}
            <Button
                type="submit"
                disabled={
                    submitting ||
                    (role === "staff" &&
                        (loadingProperties || availableProperties.length === 0))
                }
            >
                {submitting ? "Submitting..." : "Complete Registration"}
            </Button>
        </form>
    );
};

export default AdminRegistrationForm;