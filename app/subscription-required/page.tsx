import { Card, CardContent } from "@/components/ui/card";
import { auth } from "@/db/server";
import { ShieldAlert } from "lucide-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";


const SubscriptionRequired = async () => {
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
    } catch {
        redirect("/");
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <Card className="max-w-2xl w-full border-destructive">
                <CardContent className="flex flex-col items-center justify-center py-16 px-6">
                    <ShieldAlert className="h-16 w-16 text-destructive mb-6" />
                    <h1 className="text-3xl font-bold text-foreground mb-4 text-center">
                        Subscription Required
                    </h1>
                    <p className="text-muted-foreground text-center mb-6 max-w-md">
                        Your account administrator&apos;s subscription is either inactive, expired, or not set up.
                        Please contact your administrator to resolve this issue.
                    </p>
                    <div className="bg-muted/50 rounded-lg p-4 w-full max-w-md">
                        <h3 className="font-semibold text-sm mb-2">Why am I seeing this?</h3>
                        <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• Your admin&apos;s subscription may have expired</li>
                            <li>• Payment may be past due</li>
                            <li>• The subscription may have been canceled</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default SubscriptionRequired;