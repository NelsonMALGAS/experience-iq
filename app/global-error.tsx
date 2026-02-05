"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import "./globals.css";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, RefreshCcw, Home, LogOut, ArrowLeft } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset?: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  /**
   * Clears session and resets the app
   */
  const handleClearSession = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_URL}/api/session`, {
        method: "DELETE",
        credentials: "include",
      });

      if (typeof window !== "undefined") {
        localStorage.clear();
        sessionStorage.clear();
      }

      if (reset) reset();
      window.location.href = "/";
    } catch (err) {
      console.error("Error clearing session:", err);
      window.location.href = "/";
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Friendly Error Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-accent/20 blur-2xl rounded-full" />
            <div className="relative bg-accent/10 p-6 rounded-full">
              <AlertTriangle className="h-14 w-14 text-destructive" />
            </div>
          </div>
        </div>

        {/* Error Card */}
        <Card className="shadow-lg border border-border">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
              Oops! Something went wrong
            </CardTitle>
            <CardDescription className="text-sm sm:text-base text-muted-foreground">
              Don&apos;t worry, this happens sometimes. Let&apos;s get you back on track.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Error Summary */}
            {error.message && (
              <Alert variant="destructive" className="bg-destructive/10 border-destructive/50">
                <AlertDescription className="ml-2 text-sm">
                  <span className="font-semibold">Error:</span> Try refreshing the page
                </AlertDescription>
              </Alert>
            )}

            {/* Error Digest */}
            {error.digest && (
              <div className="bg-muted rounded-md p-2 text-center">
                <p className="text-xs text-muted-foreground">
                  Error ID: <span className="font-mono font-semibold">Something went wrong. Try refreshing the page</span>
                </p>
              </div>
            )}

            {/* Main Actions */}
            <div className="space-y-3">
              <Button
                onClick={handleClearSession}
                className="w-full h-12 text-base font-semibold flex items-center justify-center gap-2"
                size="lg"
              >
                <RefreshCcw className="h-5 w-5" />
                Refresh & Restart
              </Button>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={handleClearSession}
                  variant="outline"
                  className="h-11 flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Go Back
                </Button>
                <Button
                  onClick={handleClearSession}
                  variant="outline"
                  className="h-11 flex items-center justify-center gap-2"
                >
                  <Home className="h-4 w-4" />
                  Home
                </Button>
              </div>

              <Button
                onClick={handleClearSession}
                variant="destructive"
                className="w-full h-11 flex items-center justify-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Clear Session & Restart
              </Button>
            </div>

            {/* Help Text */}
            <div className="text-center pt-3 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Need help? Contact our support at{" "}
                <a
                  href="mailto:zmalgas69@gmail.com"
                  className="text-primary hover:underline font-medium"
                >
                  zmalgas69@gmail.com
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer Info */}
        <div className="mt-4 text-center text-xs text-muted-foreground">
          <p>This error has been automatically reported to our team.</p>
        </div>
      </div>
    </div>
  );
}
