"use client";

import { ChangeEvent, FormEvent, useEffect, useState, useRef } from "react";
import { QRCodeCanvas } from "qrcode.react"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QrCode, Shield, Eye, EyeOff, Lock } from "lucide-react";
import { FaGoogle } from "react-icons/fa";
import { IssueCategory, Role } from "@/types";
import { toast } from "sonner";
import useCurrentUser from "@/hooks/useCurrentUser";
import { signInAnonymously, signInWithPopup } from "firebase/auth";
import { getAuthInstance, getGoogleAuthProvider } from "@/db/client";
import { useRouter, useSearchParams } from "next/navigation";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { STAFF_DEPARTMENTS } from "@/constants";
import { setGuestSession, validateRoomCode } from "@/utils/guestAuthUtils";
import { Alert, AlertDescription } from "./ui/alert";
import { usePostHog } from "posthog-js/react";

interface AuthFormType {
    role: Role;
}

interface Errors {
    email?: string;
    password?: string;
    name?: string;
    confirmPassword?: string;
    department?: string;
}

interface Data {
    email: string;
    password: string;
    name: string;
    confirmPassword: string;
    department: IssueCategory;
}


const AuthForm = ({ role }: AuthFormType) => {
    const { handleRegister, handleLogin, handlePasswordReset, createSession } = useCurrentUser();
    const router = useRouter();
    const searchParams = useSearchParams();
    const qrRef = useRef<HTMLCanvasElement | null>(null);
    const posthog = usePostHog();

    const [mode, setMode] = useState<"login" | "signup">("login");
    const [formErrors, setFormErrors] = useState<Errors | undefined>();

    // Get role from URL or fallback to prop
    const urlRole = (searchParams.get("role") as Role) || role || "guest";
    const [userRole, setUserRole] = useState<Role>(urlRole);

    const [formData, setFormData] = useState<Data>({
        email: "",
        password: "",
        name: "",
        confirmPassword: "",
        department: "other",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [qrCode, setQrCode] = useState("");

    // Sync userRole with URL parameter
    useEffect(() => {
        const currentUrlRole = searchParams.get("role") as Role;
        if (currentUrlRole && currentUrlRole !== userRole) {
            setUserRole(currentUrlRole);
        }
    }, [searchParams, userRole]);

    // Set department based on role
    useEffect(() => {
        if (userRole === "admin") {
            setFormData((prev) => ({ ...prev, department: "other" }));
        } else if (userRole === "guest") {
            setFormData((prev) => ({ ...prev, department: "other" }));
        } else if (userRole === "staff") {
            setFormData((prev) => ({ ...prev, department: "other" }));
        }
    }, [userRole]);

    const validate = (data: Data) => {
        const errors: Errors = {};
        const { email, password, confirmPassword, name } = data;

        // Email validation
        if (!email) {
            errors.email = "Please enter your email address.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.email = "Please enter a valid email (e.g. yourname@example.com).";
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
                errors.name = "Name is required";
            }
        }

        return errors;
    };



    const handleResetPassword = async () => {
        if (!formData.email) {
            toast.error("Please enter your email first");
            return;
        }

        setIsLoading(true);

        try {
            await handlePasswordReset(formData.email);

            toast.success("Password reset email sent", {
                description: "Check your inbox to reset your password",
            });
        } catch (error) {
            toast.error("Failed to send reset email", {
                description: error instanceof Error ? error.message : "Please try again",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Google Sign-In redirects to onboarding for staff/admin
    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        try {
            const auth = await getAuthInstance();
            const googleAuthProvider = await getGoogleAuthProvider();

            const result = await signInWithPopup(auth, googleAuthProvider);
            const user = result?.user;

            await createSession(user, userRole, formData.department);
            posthog.identify(user.uid, {
                email: user.email,
                role: userRole,
            });
            const token = await user?.getIdToken(true);
            const { department } = formData;

            await fetch(`${process.env.NEXT_PUBLIC_URL}/api/session`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, role: userRole, department }),
            });

            toast.success("🎉 Success", {
                position: "top-center",
                description: "Logged in successfully",
            });

            // ✅ FIXED: Redirect to onboarding for staff/admin
            if (userRole === "staff" || userRole === "admin") {
                router.push(`/onboarding/${userRole}`);
            } else {
                router.push(`/onboarding/${userRole}/?role=${userRole}`);
            }
        } catch (error) {
            console.error("Sign-in error:", error);
            toast.error("🚨 Error", {
                position: "top-center",
                description: "Failed to login",
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

    //  Email/Password login and signup now redirect to onboarding
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const errors = validate(formData);

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        setIsLoading(true);
        setFormErrors({});

        const { email, password, department } = formData;

        if (!userRole) {
            toast.error("Role is required", { description: "Please select a role" });
            setIsLoading(false);
            return;
        }

        try {
            if (mode === "signup") {
                await handleRegister(email, password, userRole, department);
            } else {
                await handleLogin(email, password, userRole, department);
            }

            // ✅ FIXED: Redirect to onboarding after successful auth
            toast.success("🎉 Success", {
                position: "top-center",
                description: mode === "signup" ? "Account created successfully" : "Logged in successfully",
            });

            // ✅ Redirect to onboarding for staff/admin
            if (userRole === "staff" || userRole === "admin") {
                router.push(`/onboarding/${userRole}`);
            } else {
                router.push(`/onboarding/${userRole}`);
            }
        } catch (error) {
            console.error("Auth error:", error);
            toast.error("🚨 Error", {
                position: "top-center",
                description: mode === "signup" ? "Failed to create account" : "Failed to login",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleQRLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const validation = await validateRoomCode(qrCode);

            if (!validation.isValid || !validation.property || !validation.room) {
                toast.error(validation.error || "Invalid room code");
                return;
            }
            const auth = await getAuthInstance();

            //  Reuse existing user
            let user = auth.currentUser;

            if (!user) {
                const result = await signInAnonymously(auth);
                user = result.user;
            }

            await createSession(user, "guest", "other");

            // save the user.uid to localStorage for the device
            localStorage.setItem("guestId", user.uid);

            setGuestSession({
                uid: user.uid,
                role: "guest",
                propertyId: validation.property.id,
                propertyName: validation.property.name,
                propertyLocation: validation.property.location,
                roomId: validation.room.id,
                roomNumber: validation.room.roomNumber,
            });

            toast.success(`Welcome! Room ${validation.room.roomNumber}`);
            // ✅ Guest goes directly to add-issue (no onboarding needed)
            router.push("/guest/add-issue");
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("Unable to login");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleTabChange = (value: string) => {
        // Only allow tab changes for guest/staff roles
        if (userRole === "admin") {
            return; // Prevent tab changes for admin
        }

        const newRole = value as Role;
        setUserRole(newRole);

        // Update URL
        const params = new URLSearchParams(searchParams.toString());
        params.set("role", newRole);
        router.replace(`/login?${params.toString()}`, { scroll: false });
    };

    const downloadQR = () => {
        if (!qrRef.current) return;

        const canvas = qrRef.current;
        const url = canvas.toDataURL("image/png");

        const link = document.createElement("a");
        link.href = url;
        link.download = `${qrCode}-qr.png`;
        link.click();
    };

    const inputErrorClass = (field: keyof Errors) =>
        formErrors?.[field] ? "border border-red-500 focus-visible:ring-red-500" : "";

    // Determine if tabs should be disabled
    const tabsDisabled = userRole === "admin";

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 mb-8">
            <div className="w-full max-w-md space-y-6">
                {/* Logo */}
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-display font-bold text-foreground">
                        Experience<span className="text-primary">IQ</span>
                    </h1>
                    <p className="text-muted-foreground">Service Recovery Platform</p>
                </div>

                <Card className="border-primary/20 shadow-xl">
                    <CardHeader className="text-center pb-2">
                        <CardTitle className="text-xl">Welcome</CardTitle>
                        <CardDescription>
                            {userRole === "admin"
                                ? "Administrative Access Portal"
                                : "Access your dashboard or guest portal"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Admin Role Alert */}
                        {userRole === "admin" && (
                            <Alert className="mb-4 border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
                                <Lock className="h-4 w-4 text-amber-600 dark:text-amber-500" />
                                <AlertDescription className="text-amber-800 dark:text-amber-300 text-sm">
                                    You are accessing the <strong>Admin Portal</strong>. Staff and Guest
                                    access is restricted.
                                </AlertDescription>
                            </Alert>
                        )}

                        <Tabs
                            value={userRole === "admin" ? "staff" : userRole}
                            onValueChange={handleTabChange}
                            className="w-full"
                        >
                            <TabsList
                                className={`grid w-full grid-cols-2 mb-6 ${tabsDisabled ? "opacity-50 cursor-not-allowed" : ""
                                    }`}
                            >
                                <TabsTrigger
                                    value="staff"
                                    className="flex items-center gap-2 cursor-pointer"
                                    disabled={tabsDisabled}
                                >
                                    <Shield className="h-4 w-4" />
                                    {userRole === "admin" ? "Admin" : "Staff"}
                                </TabsTrigger>
                                <TabsTrigger
                                    value="guest"
                                    className="flex items-center gap-2 cursor-pointer"
                                    disabled={tabsDisabled}
                                >
                                    <QrCode className="h-4 w-4" /> Guest
                                </TabsTrigger>
                            </TabsList>

                            {/* STAFF / ADMIN Content */}
                            <TabsContent value="staff">
                                {/* Toggle login/signup */}
                                <div className="flex justify-center gap-4 mb-4">
                                    <Button
                                        variant={mode === "login" ? "default" : "outline"}
                                        onClick={() => setMode("login")}
                                    >
                                        Login
                                    </Button>
                                    <Button
                                        variant={mode === "signup" ? "default" : "outline"}
                                        onClick={() => setMode("signup")}
                                    >
                                        Sign Up
                                    </Button>
                                </div>

                                <div className="flex flex-col gap-2 mb-4">
                                    <Button
                                        variant="outline"
                                        className="flex items-center justify-center gap-2 w-full"
                                        onClick={handleGoogleSignIn}
                                        disabled={isLoading}
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
                                                type="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className={inputErrorClass("email")}
                                                disabled={isLoading}
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
                                                    className={`${inputErrorClass("password")} pr-10`}
                                                    disabled={isLoading}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                                    disabled={isLoading}
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

                                            <div className="flex justify-end">
                                                <button
                                                    type="button"
                                                    onClick={handleResetPassword}
                                                    className="text-xs text-muted-foreground hover:text-primary transition-colors"
                                                    disabled={isLoading}
                                                >
                                                    Forgot password?
                                                </button>
                                            </div>
                                        </div>

                                        <Button type="submit" className="w-full" disabled={isLoading}>
                                            {isLoading ? "Signing in..." : "Sign In"}
                                        </Button>
                                    </form>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        {/* Name */}
                                        <div className="flex flex-col gap-1">
                                            <Input
                                                name="name"
                                                placeholder="Full Name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                className={inputErrorClass("name")}
                                                disabled={isLoading}
                                            />
                                            {formErrors?.name && (
                                                <p className="text-sm text-red-500">{formErrors.name}</p>
                                            )}
                                        </div>

                                        {/* Email */}
                                        <div className="flex flex-col gap-1">
                                            <Input
                                                name="email"
                                                type="email"
                                                placeholder="Email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className={inputErrorClass("email")}
                                                disabled={isLoading}
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
                                                disabled={isLoading}
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
                                                disabled={isLoading}
                                            />
                                            {formErrors?.confirmPassword && (
                                                <p className="text-sm text-red-500">
                                                    {formErrors.confirmPassword}
                                                </p>
                                            )}
                                        </div>

                                        {/* Department Select (only for staff/admin) */}
                                        {(userRole === "staff" || userRole === "admin") && (
                                            <div className="flex flex-col gap-1">
                                                <Label htmlFor="department" className="text-sm">
                                                    Department
                                                </Label>
                                                <Select
                                                    value={formData.department}
                                                    onValueChange={(val) =>
                                                        setFormData({
                                                            ...formData,
                                                            department: val as IssueCategory,
                                                        })
                                                    }
                                                    disabled={isLoading}
                                                >
                                                    <SelectTrigger id="department">
                                                        <SelectValue placeholder="Select Department" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {STAFF_DEPARTMENTS.map((dept) => (
                                                            <SelectItem key={dept} value={dept}>
                                                                {dept}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {formErrors?.department && (
                                                    <p className="text-sm text-red-500">
                                                        {formErrors.department}
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        <Button type="submit" className="w-full" disabled={isLoading}>
                                            {isLoading ? "Creating Account..." : "Sign Up"}
                                        </Button>
                                    </form>
                                )}
                            </TabsContent>

                            {/* GUEST Content */}
                            <TabsContent value="guest">
                                <form onSubmit={handleQRLogin} className="space-y-6">
                                    <div className="text-center p-6 border-2 border-dashed rounded-lg bg-primary/5 space-y-4">

                                        {qrCode ? (
                                            <>
                                                <div className="flex justify-center">
                                                    <QRCodeCanvas
                                                        value={qrCode}
                                                        size={180}
                                                        level="H"
                                                        bgColor="transparent"
                                                        fgColor="#f97316"
                                                        marginSize={1}
                                                        ref={qrRef}
                                                    />
                                                </div>

                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={downloadQR}
                                                    className="mt-2"
                                                >
                                                    Download QR Code
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                <QrCode className="h-16 w-16 mx-auto text-primary" />
                                                <p className="text-sm text-muted-foreground">
                                                    Scan the QR code in your room or enter the code manually
                                                </p>
                                            </>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="roomCode" className="text-sm text-muted-foreground">
                                            Room Code{" "}
                                            <span className="font-mono">(PROPERTYCODE-ROOM)</span>
                                        </Label>

                                        <Input
                                            id="roomCode"
                                            placeholder="e.g. SUNSET12-305"
                                            value={qrCode}
                                            onChange={(e) =>
                                                setQrCode(e.target.value.toUpperCase())
                                            }
                                            maxLength={16}
                                            className="text-center text-lg tracking-widest font-mono"
                                            autoFocus
                                            disabled={isLoading}
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={isLoading || qrCode.length <= 5}
                                    >
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