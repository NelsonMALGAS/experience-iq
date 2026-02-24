"use client"

import { AppUser, Role } from "@/types";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import AdminRegistrationForm from "./AdminRegistrationForm";
import LoadingState from "./LoadingState";

type AdminOnboardingFormProps = {
    role: Role,
    uid: AppUser["uid"]
}

const AdminOnboardingForm = ({ role, uid }: AdminOnboardingFormProps) => {
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const router = useRouter();

    useEffect(() => {
        async function checkUser() {
            try {
                // ✅ CRITICAL: Add timestamp to prevent ANY caching
                const timestamp = Date.now();
                const url = `${process.env.NEXT_PUBLIC_URL}/api/check-registration?t=${timestamp}&uid=${uid}`;

                const res = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Cache-Control': 'no-cache, no-store, must-revalidate',
                        'Pragma': 'no-cache',
                        'Expires': '0',
                    },
                    // ✅ Force no caching at all levels
                    cache: 'no-store',
                });

                if (!res.ok) {
                    console.error('Registration check failed:', res.status);
                    throw new Error('Failed to check registration status');
                }

                const data = await res.json();

                // ✅ Not authenticated - redirect to login
                if (!data.authenticated) {
                    router.push(`/login?role=${role}`);
                    return;
                }

                // ✅ Authenticated AND registered - redirect to dashboard
                if (data.registered === true) {
                    // ✅ Use replace to prevent back button issues
                    router.replace(`/${data.role}`);
                    return;
                }

                setShowForm(true);
            } catch (error) {
                console.error("Error checking registration:", error);

                // ✅ On error, redirect to login to be safe
                router.push(`/login?role=${role}`);
            } finally {
                setLoading(false);
            }
        }

        // ✅ Small delay to ensure session is set
        const timer = setTimeout(() => {
            checkUser();
        }, 100);

        return () => clearTimeout(timer);
    }, [role, router, uid]);

    // ✅ Show loading state while checking
    if (loading) {
        return <LoadingState message="Checking your account..." />;
    }

    // ✅ If not showing form, show loading (during redirect)
    if (!showForm) {
        return <LoadingState message="Redirecting..." />;
    }

    // ✅ User is authenticated but not registered - show form
    return (
        <div>
            <AdminRegistrationForm role={role} uid={uid} />
        </div>
    );
}

export default AdminOnboardingForm;