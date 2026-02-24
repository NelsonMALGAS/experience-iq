import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { auth, db } from "@/db/server";
import { XCircle, ArrowRight, HelpCircle, RefreshCw } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

const PaymentCanceled = async () => {
    const cookieStore = await cookies();
    const session = cookieStore?.get("_SESSION_")?.value;

    if (!session) redirect("/");

    try {
        const decoded = await auth?.verifySessionCookie(session, true);
        if (!decoded) redirect("/");

        const uid = decoded.uid;
        const userDoc = await db?.collection("users").doc(uid).get();
        if (!userDoc?.exists) redirect("/");

        const role = userDoc.data()?.role;
        if (role !== "admin") redirect("/");
    } catch {
        redirect("/");
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-50 via-gray-50 to-zinc-50 dark:from-gray-950 dark:via-slate-950 dark:to-gray-950 flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-2xl">

                {/* Main Card */}
                <Card className="border-0 shadow-2xl bg-white/80 mt-20 dark:bg-gray-900/80 backdrop-blur-xl overflow-hidden">
                    <CardContent className="p-8 sm:p-12">
                        {/* Canceled Icon Container */}
                        <div className="mb-8 flex justify-center">
                            <div className="relative">

                                {/* Canceled icon */}
                                <div className="relative bg-linear-to-br from-gray-100 to-slate-200 dark:from-gray-800 dark:to-slate-800 rounded-full p-8 shadow-xl border-4 border-white dark:border-gray-900">
                                    <XCircle className="h-16 w-16 text-muted-foreground" strokeWidth={2.5} />
                                </div>
                            </div>
                        </div>

                        {/* Message */}
                        <div className="text-center space-y-4 mb-10">
                            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
                                Payment Canceled
                            </h1>
                            <p className="text-lg text-muted-foreground max-w-md mx-auto">
                                No worries! Your payment was not processed and no charges were made to your account.
                            </p>
                        </div>

                        {/* Info Box */}
                        <div className="bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-2xl p-6 mb-8 border border-blue-200 dark:border-blue-800">
                            <div className="flex items-start gap-3">
                                <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                                <div>
                                    <h3 className="font-semibold text-foreground mb-2">
                                        Common reasons for cancellation
                                    </h3>
                                    <ul className="space-y-2 text-sm text-muted-foreground">
                                        <li className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                            Changed your mind about the plan
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                            Need to review features before subscribing
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                            Technical issue during checkout
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <Button
                                asChild
                                size="lg"
                                variant="outline"
                            >
                                <Link href="/payment" className="flex items-center justify-center gap-2">
                                    <RefreshCw className="h-4 w-4" />
                                    Try Again
                                </Link>
                            </Button>
                            <Button
                                asChild
                                size="lg"
                                variant="outline"
                                className="w-full border-2 hover:bg-accent group"
                            >
                                <Link href="/admin" className="flex items-center justify-center gap-2">
                                    Go to Dashboard
                                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </Button>
                        </div>

                        {/* Support Link */}
                        <div className="text-center">
                            <Button
                                asChild
                                variant="ghost"
                                className="text-muted-foreground hover:text-foreground"
                            >
                                <Link href="#" className="flex items-center justify-center gap-2">
                                    <HelpCircle className="h-4 w-4" />
                                    Contact Support
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Footer Help Text */}
                <div className="text-center mt-6 space-y-2">
                    <p className="text-sm text-muted-foreground">
                        Have questions about our plans?{" "}
                        <Link href="/payment" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                            View pricing details
                        </Link>
                    </p>
                    <p className="text-xs text-muted-foreground">
                        You can subscribe anytime to unlock all features
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PaymentCanceled;