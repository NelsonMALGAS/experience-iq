import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight, Sparkles } from "lucide-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth, db } from "@/db/server";



const PaymentSuccess = async (props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) => {
    const cookieStore = await cookies();
    const session = cookieStore?.get("_SESSION_")?.value;

    const searchParams = await props.searchParams;

    const reference = searchParams.reference;
    const trxref = searchParams.trxref;

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
        <div className="min-h-screen bg-linear-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-950 dark:via-green-950/20 dark:to-gray-950 flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-2xl">

                {/* Main Card */}
                <Card className="border-0 shadow-2xl bg-white/80 mt-20 dark:bg-gray-900/80 backdrop-blur-xl overflow-hidden">
                    <CardContent className="p-8 sm:p-12">
                        {/* Success Animation Container */}
                        <div className="mb-8 flex justify-center">
                            <div className="relative">
                                {/* Success icon */}
                                <div className="relative bg-linear-to-br from-green-500 to-emerald-600 rounded-full p-8 shadow-2xl">
                                    <CheckCircle2 className="h-16 w-16 text-white" strokeWidth={2.5} />
                                </div>
                            </div>
                        </div>

                        {/* Success Message */}
                        <div className="text-center space-y-4 mb-10">
                            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
                                Payment Successful! 🎉
                            </h1>
                            <p className="text-lg text-muted-foreground max-w-md mx-auto">
                                Your subscription has been activated. You now have full access to all premium features.
                            </p>
                            {(reference || trxref) && (
                                <div className="w-full bg-muted/50 border rounded-lg px-4 py-3 mt-4">
                                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">
                                        Transaction Reference
                                    </p>
                                    <div className="flex items-center justify-center">
                                        <span className="text-sm font-mono break-all text-foreground">
                                            {reference || trxref}
                                        </span>

                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Feature Highlights */}
                        <div className="bg-linear-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-2xl p-6 mb-8 border border-green-200 dark:border-green-800">
                            <div className="flex items-start gap-3 mb-4">
                                <Sparkles className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                                <div>
                                    <h3 className="font-semibold text-foreground mb-2">
                                        What&apos;s next?
                                    </h3>
                                    <ul className="space-y-2 text-sm text-muted-foreground">
                                        <li className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                            Access your ExperienceIQ Dashboard
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                            Set up your properties and team
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                            Start monitoring guest satisfaction
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Button
                                asChild
                                size="lg"
                                className="w-full bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 group"
                            >
                                <Link href="/admin" className="flex items-center justify-center gap-2">
                                    Go to Dashboard
                                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </Button>
                            <Button
                                asChild
                                size="lg"
                                variant="outline"
                                className="w-full border-2 hover:bg-accent"
                            >
                                <Link href="#">
                                    Manage Subscription
                                </Link>
                            </Button>
                        </div>

                        {/* Footer Note */}
                        <p className="text-center text-sm text-muted-foreground mt-8">
                            A confirmation email has been sent to your inbox
                        </p>
                    </CardContent>
                </Card>

                {/* Help Text */}
                <p className="text-center text-sm text-muted-foreground mt-6">
                    Need help getting started?{" "}
                    <Link href="#" className="text-green-600 dark:text-green-400 hover:underline font-medium">
                        View our setup guide
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default PaymentSuccess;