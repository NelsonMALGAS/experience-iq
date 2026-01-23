"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { AppUser, Property, Role } from "@/types";
import useCurrentUser from "@/hooks/useCurrentUser";
import { toast } from "sonner";


interface SignUpData {
    uid?: string;
    email: string;
    name: string;
    password: string;
    role: Role;
    property?: Property[] | null;
}

interface LoginData {
    uid: string;
    email: string;
    password: string;
}

interface AuthContextType {
    user: AppUser | null;
    role: Role | null;
    login: (data: LoginData) => Promise<void>;
    signUp: (data: SignUpData) => Promise<void>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const { handleSignOut } = useCurrentUser();
    const [user, setUser] = useState<AppUser | null>(null);

    // client AuthContext
    const login = async ({ uid, email, password }: LoginData) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ uid, email, password }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Login failed");

            setUser(data.user);
            toast.success("Logged in successfully");
        } catch (err) {
            console.error(err);
        }
    };

    const signUp = async ({ email, name, password, role, property }: SignUpData) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/auth/sign-up`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, name, password, role, property, displayName: name }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Signup failed");

            setUser(data.user);
            toast.success("Account created successfully");
        } catch (err) {
            console.error(err);
        }
    };


    // Logout
    const logout = async () => {
        try {
            await handleSignOut();
            setUser(null);
        } catch (err) {
            console.error("Logout error:", err);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                role: user?.role ?? null,
                login,
                signUp,
                logout,
                isAuthenticated: !!user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

// Hook for consuming auth context
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
}
