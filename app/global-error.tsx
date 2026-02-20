"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  AlertCircle,
  RefreshCw,
  Home,
  LogIn,
  ShieldAlert,
  WifiOff,
  Lock
} from "lucide-react";

/**
 * SECURITY: Maps backend errors to safe, user-friendly messages
 * Never exposes Firebase, Firestore, or internal error details
 */
function getSafeErrorMessage(error: Error): {
  title: string;
  message: string;
  icon: typeof AlertCircle;
  suggestion: string;
} {
  const errorString = error.message?.toLowerCase() || "";
  const errorName = error.name?.toLowerCase() || "";

  // Authentication & Session Errors
  if (
    errorString.includes("auth") ||
    errorString.includes("session") ||
    errorString.includes("token") ||
    errorString.includes("unauthorized") ||
    errorString.includes("unauthenticated") ||
    errorName.includes("autherror")
  ) {
    return {
      title: "Session Expired",
      message: "Your session has expired for security reasons.",
      icon: Lock,
      suggestion: "Please sign in again to continue.",
    };
  }

  // Permission Errors
  if (
    errorString.includes("permission") ||
    errorString.includes("forbidden") ||
    errorString.includes("access denied") ||
    errorString.includes("not authorized")
  ) {
    return {
      title: "Access Restricted",
      message: "You don't have permission to access this resource.",
      icon: ShieldAlert,
      suggestion: "If you believe this is an error, please contact support.",
    };
  }

  // Network & Connection Errors
  if (
    errorString.includes("network") ||
    errorString.includes("fetch") ||
    errorString.includes("connection") ||
    errorString.includes("timeout") ||
    errorString.includes("offline")
  ) {
    return {
      title: "Connection Issue",
      message: "We're having trouble connecting to our servers.",
      icon: WifiOff,
      suggestion: "Please check your internet connection and try again.",
    };
  }

  // Firestore/Database Errors (sanitize completely)
  if (
    errorString.includes("firestore") ||
    errorString.includes("firebase") ||
    errorString.includes("database") ||
    errorString.includes("collection")
  ) {
    return {
      title: "Service Temporarily Unavailable",
      message: "We're experiencing technical difficulties.",
      icon: AlertCircle,
      suggestion: "Our team has been notified. Please try again in a few moments.",
    };
  }

  // Default fallback (safest option)
  return {
    title: "Something Went Wrong",
    message: "We encountered an unexpected issue.",
    icon: AlertCircle,
    suggestion: "Please try again. If the problem persists, contact support.",
  };
}

/**
 * SECURITY: Comprehensive session cleanup
 * Clears all auth state to prevent stale sessions
 */
async function clearSessionCompletely() {
  try {
    // 1. Call API to delete server-side session cookie
    await fetch("/api/session", {
      method: "DELETE",
      credentials: "include",
    }).catch(() => {
      // Silently fail - session might already be invalid
    });

    // 2. Clear all browser storage
    if (typeof window !== "undefined") {
      localStorage.clear();
      sessionStorage.clear();

      // 3. Clear all cookies client-side (belt and suspenders)
      document.cookie.split(";").forEach((cookie) => {
        const name = cookie.split("=")[0].trim();
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      });
    }
  } catch (err) {
    // SECURITY: Never expose cleanup errors to user
    console.error("Session cleanup error:", err);
  }
}

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset?: () => void;
}) {
  const [isClearing, setIsClearing] = useState(false);

  // SECURITY: Log error to Sentry but never display raw error
  useEffect(() => {
    Sentry.captureException(error, {
      tags: {
        component: "global-error",
        digest: error.digest,
      },
      contexts: {
        error_details: {
          message: error.message,
          name: error.name,
          stack: error.stack,
        },
      },
    });
  }, [error]);

  // Get safe, user-friendly error information
  const errorInfo = getSafeErrorMessage(error);
  const ErrorIcon = errorInfo.icon;

  /**
   * SECURITY: All user actions must clear session completely
   * Prevents auth issues from cascading or persisting
   */
  const handleAction = async (destination: "login" | "home" | "retry") => {
    setIsClearing(true);

    // Always clear session first
    await clearSessionCompletely();

    // Small delay for UX (shows loading state)
    await new Promise(resolve => setTimeout(resolve, 300));

    // Navigate based on action
    switch (destination) {
      case "login":
        window.location.href = "/";
        break;
      case "home":
        window.location.href = "/";
        break;
      case "retry":
        if (reset) {
          reset();
        } else {
          window.location.reload();
        }
        break;
    }
  };

  return (
    <html>
      <body>
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="w-full max-w-lg animate-in fade-in duration-500">
            {/* Error Icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full animate-pulse" />

                {/* Icon container */}
                <div className="relative bg-card border-2 border-primary/20 p-6 rounded-full shadow-lg">
                  <ErrorIcon className="h-12 w-12 text-primary" strokeWidth={1.5} />
                </div>
              </div>
            </div>

            {/* Main Error Card */}
            <Card className="shadow-xl border-border backdrop-blur-sm">
              <CardHeader className="text-center space-y-2 pb-4">
                <CardTitle className="text-2xl sm:text-3xl font-bold text-foreground">
                  {errorInfo.title}
                </CardTitle>
                <CardDescription className="text-base text-muted-foreground">
                  {errorInfo.message}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Suggestion Alert */}
                <Alert className="bg-muted/50 border-border">
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  <AlertDescription className="ml-2 text-sm text-muted-foreground">
                    {errorInfo.suggestion}
                  </AlertDescription>
                </Alert>

                <Separator className="my-4" />

                {/* Primary Action - Return to Login */}
                <Button
                  onClick={() => handleAction("login")}
                  disabled={isClearing}
                  className="w-full h-12 text-base font-semibold gap-2"
                  size="lg"
                >
                  {isClearing ? (
                    <>
                      <RefreshCw className="h-5 w-5 animate-spin" />
                      Clearing session...
                    </>
                  ) : (
                    <>
                      <LogIn className="h-5 w-5" />
                      Return to Login
                    </>
                  )}
                </Button>

                {/* Secondary Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => handleAction("home")}
                    disabled={isClearing}
                    variant="outline"
                    className="h-11 gap-2"
                  >
                    <Home className="h-4 w-4" />
                    Go Home
                  </Button>

                  <Button
                    onClick={() => handleAction("retry")}
                    disabled={isClearing}
                    variant="outline"
                    className="h-11 gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Try Again
                  </Button>
                </div>

                <Separator className="my-4" />

                {/* Support Contact */}
                <div className="text-center space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Need assistance?
                  </p>
                  <a
                    href="mailto:support@experienceiq.com"
                    className="text-sm text-primary hover:underline font-medium inline-flex items-center gap-1"
                  >
                    Contact Support
                  </a>
                </div>

                {/* Error ID (for support reference only) */}
                {error.digest && (
                  <div className="pt-3 border-t border-border">
                    <div className="bg-muted/30 rounded-md p-2 text-center">
                      <p className="text-xs text-muted-foreground">
                        Error Reference: <span className="font-mono font-medium">{error.digest.substring(0, 8)}</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        (Include this when contacting support)
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Footer Notice */}
            <div className="mt-6 text-center space-y-2">
              <p className="text-xs text-muted-foreground">
                This error has been automatically reported to our team.
              </p>
              <p className="text-xs text-muted-foreground">
                Your session has been cleared for security.
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}