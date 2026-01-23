"use client";

import * as Sentry from "@sentry/nextjs";
import NextError from "next/error";
import { useEffect } from "react";
import "./globals.css";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error, reset
}: {
  error: Error & { digest?: string };
  reset?: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  /**
  * Handles broken session deletion
  */
  const handleAuthAction = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_URL}/api/session`, {
        method: "DELETE",
        credentials: "include",
      });
      reset?.();
      window.location.href = "/";
    } catch (err) {
      console.error("Error clearing session:", err);
    }
  };

  return (
    <html lang="en">
      <body>
        {/* `NextError` is the default Next.js error page component. Its type
        definition requires a `statusCode` prop. However, since the App Router
        does not expose status codes for errors, we simply pass 0 to render a
        generic error message. */}
        <NextError statusCode={0} />
        <Button variant="outline" onClick={handleAuthAction}>Try Again</Button>
      </body>
    </html>
  );
}
