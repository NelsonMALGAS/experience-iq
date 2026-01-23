"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Property, Role } from "@/types";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";


const AdminOnBoarding = () => {

    const params = useSearchParams()
    const role = params.get("role") as Role
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [properties, setProperties] = useState<Property[]>([]);


    const router = useRouter()

    useEffect(() => {
        async function checkUser() {

            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_URL}/api/check-registration`
                );
                const data = await res.json();

                if (!data.authenticated) {
                    router.push("/sign-in?role=admin");
                    return;
                }

                if (data.registered && data.role) {
                    router.push(`/${data.role}`);
                    return;
                }

                // Authenticated but not registered, show the form
                setShowForm(true);
            } catch (error) {
                console.error("Error checking registration:", error);
            } finally {
                setLoading(false);
            }
        }

        checkUser();

    }, [router]);

    // --- PROPERTY HANDLERS ---
    const addProperty = () => {
        setProperties([
            ...properties,
            { id: Date.now().toString(), name: "", location: "", totalIssues: 0, resolvedIssues: 0, openIssues: 0, avgResolutionTime: 3000 },
        ]);
    };

    const updateProperty = (index: number, key: keyof Property, value: string | number) => {
        const updated = [...properties];
        updated[index] = { ...updated[index], [key]: value } as Property;
        setProperties(updated);
    };

    if (loading || !showForm) {
        return (
            <div className="mt-24 text-foreground">Loading...</div>
        )
    }
    return (
        <div className="mt-24">

            AdminOnBoarding Form

            {(role === "staff" || role === "admin") && (
                <div>
                    {properties.map((prop, i) => (
                        <div key={i} className="flex gap-2 mb-1">
                            <Input placeholder="Property Name" value={prop.name} onChange={(e) => updateProperty(i, "name", e.target.value)} required />
                            <Input placeholder="Property Location" value={prop.location} onChange={(e) => updateProperty(i, "location", e.target.value)} required />
                        </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={addProperty}>
                        Add Property
                    </Button>
                </div>
            )}

        </div>
    )
}

export default AdminOnBoarding