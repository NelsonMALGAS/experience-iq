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



    if (loading || !showForm) {
        return (
            <LoadingState message="Checking your account..." />
        )
    }
    return (
        <div>
            <AdminRegistrationForm role={role} uid={uid} />
        </div>
    )
}

export default AdminOnboardingForm