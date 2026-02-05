"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import "./globals.css";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertTriangle,
  RefreshCcw,
  Home,
  LogOut,
  Bug,
  ArrowLeft
} from "lucide-react";

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset?: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  /**
   * Handles broken session deletion and page refresh
   */
  const handleClearSession = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_URL}/api/session`, {
        method: "DELETE",
        credentials: "include",
      });

      // Clear local storage
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
      }

      // Redirect to home
      window.location.href = "/";
    } catch (err) {
      console.error("Error clearing session:", err);
      // Force reload even if session clear fails
      window.location.href = "/";
    }
  };

  /**
   * Simple page refresh to retry
   */
  const handleRefresh = () => {
    if (reset) {
      reset();
    } else {
      window.location.reload();
    }
  };

  /**
   * Go back to previous page
   */
  const handleGoBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = "/";
    }
  };

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-linear-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl animate-fade-in">
            {/* Error Icon */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full" />
                <div className="relative bg-red-100 dark:bg-red-900/30 p-6 rounded-full">
                  <AlertTriangle className="h-16 w-16 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </div>

            {/* Main Error Card */}
            <Card className="border-2 shadow-2xl">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-3xl font-bold text-foreground mb-2">
                  Oops! Something went wrong
                </CardTitle>
                <CardDescription className="text-base">
                  We encountered an unexpected error. Don&apos;t worry, we&apos;re here to help you get back on track.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Error Details */}
                {error.message && (
                  <Alert variant="destructive" className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                    <Bug className="h-4 w-4" />
                    <AlertDescription className="ml-2">
                      <span className="font-semibold">Error:</span> {error.message}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Error Digest */}
                {error.digest && (
                  <div className="bg-muted rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground">
                      Error ID: <span className="font-mono font-semibold">{error.digest}</span>
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3 pt-4">
                  {/* Primary Action - Refresh */}
                  <Button
                    onClick={handleRefresh}
                    className="w-full h-12 text-base font-semibold"
                    size="lg"
                  >
                    <RefreshCcw className="h-5 w-5 mr-2" />
                    Try Again
                  </Button>

                  {/* Secondary Actions */}
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={handleGoBack}
                      variant="outline"
                      className="h-11"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Go Back
                    </Button>
                    <Button
                      onClick={() => window.location.href = '/'}
                      variant="outline"
                      className="h-11"
                    >
                      <Home className="h-4 w-4 mr-2" />
                      Home
                    </Button>
                  </div>

                  {/* Session Clear Action */}
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground text-center mb-3">
                      If the problem persists, try clearing your session:
                    </p>
                    <Button
                      onClick={handleClearSession}
                      variant="destructive"
                      className="w-full h-11"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Clear Session & Restart
                    </Button>
                  </div>
                </div>

                {/* Help Text */}
                <div className="text-center pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Need help? Contact our support team at{" "}
                    <a
                      href="mailto:support@example.com"
                      className="text-primary hover:underline font-medium"
                    >
                      support@example.com
                    </a>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Additional Info */}
            <div className="mt-6 text-center">
              <p className="text-xs text-muted-foreground">
                This error has been automatically reported to our team.
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}