"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QrCode, Shield, Eye, EyeOff } from "lucide-react";
import { FaGoogle } from "react-icons/fa"
import { Role } from "@/types";
import { toast } from "sonner";
import useCurrentUser from "@/hooks/useCurrentUser";
import { signInAnonymously, signInWithPopup } from "firebase/auth";
import { auth, googleAuth } from "@/db/client";
import { useRouter } from "next/navigation";
import { DUMMY_ROOMS } from "@/constants/mockData";

interface AuthFormType {
    role: Role
}

interface Errors {
    email?: string,
    password?: string,
    name?: string,
    confirmPassword?: string
}

interface Data {
    email: string,
    password: string,
    name: string,
    confirmPassword: string
}

const AuthForm = ({ role }: AuthFormType) => {

    const { handleRegister, handleLogin, createSession } = useCurrentUser();

    const [mode, setMode] = useState<"login" | "signup">("login");
    const [formErrors, setFormErrors] = useState<Errors | undefined>();
    const [userRole, setUserRole] = useState<Role>(role || "guest");
    const [formData, setFormData] = useState<Data>({
        email: "",
        password: "",
        name: "",
        confirmPassword: ""
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [qrCode, setQrCode] = useState("");

    const router = useRouter()

    useEffect(() => {
        if (typeof window === "undefined") return;

        const url = new URL(window.location.href);
        const currentRole = url.searchParams.get("role") || "";

        if (currentRole !== userRole) {
            url.searchParams.set("role", userRole);
            router.replace(url.toString(), { scroll: false }); // prevent scroll jump
        }
    }, [userRole, router]);


    const validate = (data: Data) => {
        const errors: Errors = {};
        const { email, password, confirmPassword, name } = data;

        // Email validation
        if (!email) {
            errors.email = "Please enter your email address.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.email = " (e.g. yourname@example.com).";
        }

        // Password validation
        if (!password) {
            errors.password = "Please enter your password to continue.";
        } else if (password.length < 6) {
            errors.password = "Your password should be at least 6 characters long.";
        }

        // Confirm password validation (signup only)
        if (mode === "signup") {
            if (!confirmPassword) {
                errors.confirmPassword = "Please confirm your password.";
            } else if (password !== confirmPassword) {
                errors.confirmPassword = "Passwords do not match.";
            }

            if (!name || name.length === 0) {
                errors.name = "Name is required"
            }
        }

        return errors;
    };

    const handleGoogleSignIn = async () => {

        setIsLoading(true);
        try {
            const result = await signInWithPopup(auth, googleAuth);
            const user = result?.user;

            await createSession(user, role)
            const token = await user?.getIdToken(true);


            await fetch(`${process.env.NEXT_PUBLIC_URL}/api/session`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, role }),
            });

            toast.success("Logged in successfully", {
                position: "top-center",
                description: "🎉 Success"
            });

            router.push(`/onboarding/${role}/?role=${role}`);
        } catch (error) {
            console.error("Sign-in error:", error);
            toast.error("Failed to login", {
                position: "top-center",
                description: "🚨 Error"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const updatedData = { ...formData, [name]: value };
        setFormData(updatedData);
        setFormErrors(validate(updatedData));
    };

    // Handle form submission
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const errors = validate(formData);

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        setIsLoading(true);
        setFormErrors({});

        const { email, password } = formData;

        if (!userRole) {
            toast.error("Role is reqired")
            return
        }

        if (mode === "signup") {
            await handleRegister(email, password, userRole);
        } else {
            await handleLogin(email, password, userRole);
        }
    };



    const handleQRLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // 1️⃣ Validate room code
            const room = DUMMY_ROOMS.find(
                (r) => r.code.toUpperCase() === qrCode.trim().toUpperCase()
            );

            if (!room) {
                toast.error("Invalid room code. Please try again.");
                return;
            }

            // 2️⃣ Anonymous Firebase login (guest)
            const result = await signInAnonymously(auth);

            await createSession(result.user, "guest")


            const guestSession = {
                uid: result.user.uid,
                role: "guest",
                roomId: room.roomId,
                propertyId: room.propertyId,
                roomNumber: room.roomNumber,
            };

            // 3️⃣ Store guest session (localStorage for now)
            localStorage.setItem("guestSession", JSON.stringify(guestSession));

            toast.success(`Welcome! Room ${room.roomNumber}`);

            // 4️⃣ Redirect to issue creation
            router.push("/guest/add-issue");
        } catch (error) {
            console.error(error);
            toast.error("Unable to login as guest");
        } finally {
            setIsLoading(false);
        }
    };

    const inputErrorClass = (field: keyof Errors) =>
        formErrors?.[field] ? "border border-red-500 focus-visible:ring-red-500" : "";


    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 mb-8">
            <div className="w-full max-w-md space-y-6">
                {/* Logo */}
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-display font-bold text-foreground">Experience<span className="text-primary">IQ</span></h1>
                    <p className="text-muted-foreground">Service Recovery Platform</p>
                </div>

                <Card className="border-primary/20 shadow-xl">
                    <CardHeader className="text-center pb-2">
                        <CardTitle className="text-xl">Welcome</CardTitle>
                        <CardDescription>Access your dashboard or guest portal</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="staff" className="w-full" onValueChange={(value) => setUserRole(value as Role)}>
                            <TabsList className="grid w-full grid-cols-2 mb-6">
                                <TabsTrigger value="staff" className="flex items-center gap-2 cursor-pointer">
                                    <Shield className="h-4 w-4" /> Staff
                                </TabsTrigger>
                                <TabsTrigger value="guest" className="flex items-center gap-2 cursor-pointer">
                                    <QrCode className="h-4 w-4" /> Guest
                                </TabsTrigger>
                            </TabsList>

                            {/* --- STAFF / ADMIN --- */}
                            <TabsContent value="staff">
                                {/* Toggle login/signup */}
                                <div className="flex justify-center gap-4 mb-4">
                                    <Button variant={mode === "login" ? "default" : "outline"} onClick={() => setMode("login")}>
                                        Login
                                    </Button>
                                    <Button variant={mode === "signup" ? "default" : "outline"} onClick={() => setMode("signup")}>
                                        Sign Up
                                    </Button>
                                </div>

                                <div className="flex flex-col gap-2 mb-4">
                                    <Button
                                        variant="outline"
                                        className="flex items-center justify-center gap-2 w-full"
                                        onClick={handleGoogleSignIn}
                                    >
                                        <FaGoogle className="h-4 w-4" />
                                        Sign in with Google
                                    </Button>
                                </div>

                                {mode === "login" ? (
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        {/* Email */}
                                        <div className="flex flex-col gap-1">
                                            <Input
                                                placeholder="Email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className={formErrors?.email ? "border-red-500 focus-visible:ring-red-500" : ""}
                                            />
                                            {formErrors?.email && (
                                                <p className="text-sm text-red-500">{formErrors.email}</p>
                                            )}
                                        </div>

                                        {/* Password */}
                                        <div className="flex flex-col gap-1">
                                            <div className="relative">
                                                <Input
                                                    name="password"
                                                    placeholder="Password"
                                                    type={showPassword ? "text" : "password"}
                                                    value={formData.password}
                                                    onChange={handleChange}
                                                    className={formErrors?.password ? "border-red-500 focus-visible:ring-red-500 pr-10" : "pr-10"}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" />
                                                    )}
                                                </button>
                                            </div>

                                            {formErrors?.password && (
                                                <p className="text-sm text-red-500">{formErrors.password}</p>
                                            )}
                                        </div>

                                        <Button type="submit" className="w-full" disabled={isLoading}>
                                            {isLoading ? "Signing in..." : "Sign In"}
                                        </Button>
                                    </form>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="flex flex-col gap-1">
                                            <Input
                                                name="name"
                                                placeholder="Full Name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                className={inputErrorClass("name")}
                                            />
                                            {formErrors?.name && (
                                                <p className="text-sm text-red-500">{formErrors.name}</p>
                                            )}
                                        </div>

                                        {/* Email */}
                                        <div className="flex flex-col gap-1">
                                            <Input
                                                name="email"
                                                placeholder="Email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className={inputErrorClass("email")}
                                            />
                                            {formErrors?.email && (
                                                <p className="text-sm text-red-500">{formErrors.email}</p>
                                            )}
                                        </div>

                                        {/* Password */}
                                        <div className="flex flex-col gap-1">
                                            <Input
                                                name="password"
                                                type="password"
                                                placeholder="Password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                className={inputErrorClass("password")}
                                            />
                                            {formErrors?.password && (
                                                <p className="text-sm text-red-500">{formErrors.password}</p>
                                            )}
                                        </div>

                                        {/* Confirm Password */}
                                        <div className="flex flex-col gap-1">
                                            <Input
                                                name="confirmPassword"
                                                type="password"
                                                placeholder="Confirm Password"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                className={inputErrorClass("confirmPassword")}
                                            />
                                            {formErrors?.confirmPassword && (
                                                <p className="text-sm text-red-500">{formErrors.confirmPassword}</p>
                                            )}
                                        </div>

                                        <Button type="submit" className="w-full" disabled={isLoading}>
                                            {isLoading ? "Creating Account..." : "Sign Up"}
                                        </Button>
                                    </form>
                                )}
                            </TabsContent>

                            {/* --- GUEST --- */}
                            <TabsContent value="guest">
                                <form onSubmit={handleQRLogin} className="space-y-4">
                                    <div className="text-center p-6 border-2 border-dashed rounded-lg bg-primary/5">
                                        <QrCode className="h-16 w-16 mx-auto mb-4 text-primary" />
                                        <p className="text-sm text-muted-foreground">
                                            Scan the QR code in your room or enter a code manually
                                        </p>
                                    </div>
                                    <Input
                                        placeholder="Enter Room Code"
                                        value={qrCode}
                                        onChange={(e) => setQrCode(e.target.value.toUpperCase())}
                                        maxLength={8}
                                        className="text-center text-lg tracking-widest"
                                        autoFocus
                                    />
                                    <Button type="submit" className="w-full" disabled={isLoading || qrCode.length <= 5}>
                                        {isLoading ? "Verifying..." : "Access Guest Portal"}
                                    </Button>
                                </form>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AuthForm;



// Added email validation for admin and staff registrations
