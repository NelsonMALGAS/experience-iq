import { Card, CardContent } from "@/components/ui/card";
import { XCircle } from "lucide-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { auth, db } from "@/db/server";

const PaymentCanceled = async () => {
    const cookieStore = await cookies();
    const session = cookieStore?.get("_SESSION_")?.value;

    if (!session) {
        redirect("/");
    }

    try {
        const decoded = await auth?.verifySessionCookie(session, true);
        if (!decoded) {
            redirect("/");
        }

        const uid = decoded.uid;
        const userDoc = await db?.collection("users").doc(uid).get();

        if (!userDoc?.exists) {
            redirect("/");
        }

        const userData = userDoc.data();
        const role = userData?.role;

        if (role !== "admin") {
            redirect("/");
        }
    } catch {
        redirect("/");
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <Card className="max-w-2xl w-full border-destructive">
                <CardContent className="flex flex-col items-center justify-center py-16 px-6">
                    <div className="rounded-full bg-destructive/10 p-4 mb-6">
                        <XCircle className="h-16 w-16 text-destructive" />
                    </div>
                    <h1 className="text-3xl font-bold text-foreground mb-4 text-center">
                        Payment Canceled
                    </h1>
                    <p className="text-muted-foreground text-center mb-2 max-w-md">
                        Your payment was not completed. No charges have been made to your account.
                    </p>
                    <p className="text-sm text-muted-foreground text-center mb-8 max-w-md">
                        If you encountered an issue or have questions, please contact our support team.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button asChild size="lg">
                            <Link href="/payment">
                                Try Again
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="lg">
                            <Link href="/contact">
                                Contact Support
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default PaymentCanceled;