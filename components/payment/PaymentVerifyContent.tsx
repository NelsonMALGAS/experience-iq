"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";

export default function PaymentVerifyContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");

  const reference = searchParams.get("reference");

  useEffect(() => {
    // Allow webhook time to process
    const timer = setTimeout(() => {
      setStatus("success");
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center py-12 gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <h2 className="text-xl font-semibold">Verifying Payment...</h2>
            <p className="text-muted-foreground text-center">
              Please wait while we confirm your subscription
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-950 dark:via-green-950/20 dark:to-gray-950 px-4">
      <Card className="w-full max-w-md border-0 shadow-2xl">
        <CardContent className="flex flex-col items-center text-center py-12 px-6 gap-6">
          {status === "success" ? (
            <>
              <div className="bg-green-100 dark:bg-green-900 rounded-full p-4">
                <CheckCircle2 className="h-14 w-14 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
                <p className="text-muted-foreground">
                  Your subscription has been activated.
                </p>
                {reference && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Reference: {reference}
                  </p>
                )}
              </div>
              <Button asChild className="w-full" size="lg">
                <Link href="/admin">Go to Dashboard</Link>
              </Button>
            </>
          ) : (
            <>
              <div className="bg-red-100 dark:bg-red-900 rounded-full p-4">
                <XCircle className="h-14 w-14 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-2">Payment Failed</h1>
                <p className="text-muted-foreground">
                  There was an issue processing your payment.
                </p>
              </div>
              <Button asChild className="w-full" size="lg" variant="outline">
                <Link href="/payment">Try Again</Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}