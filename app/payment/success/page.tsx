import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { auth, db } from "@/db/server";

const PaymentSuccess = async () => {
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
            <Card className="max-w-2xl w-full border-primary">
                <CardContent className="flex flex-col items-center justify-center py-16 px-6">
                    <div className="rounded-full bg-primary/10 p-4 mb-6">
                        <CheckCircle2 className="h-16 w-16 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold text-foreground mb-4 text-center">
                        Payment Successful!
                    </h1>
                    <p className="text-muted-foreground text-center mb-8 max-w-md">
                        Your subscription has been activated successfully. You now have full access to all admin features.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button asChild size="lg">
                            <Link href="/admin">
                                Go to Dashboard
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="lg">
                            <Link href="/admin/settings">
                                Manage Subscription
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default PaymentSuccess;