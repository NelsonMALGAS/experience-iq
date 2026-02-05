"use client"

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Search, ArrowLeft } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl animate-fade-in">
                {/* 404 Illustration */}
                <div className="text-center mb-8">
                    <div className="relative inline-block">
                        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                        <h1 className="relative text-9xl font-bold text-primary/20 dark:text-primary/10 select-none">
                            404
                        </h1>
                    </div>
                </div>

                {/* Main Card */}
                <Card className="border-2 shadow-2xl">
                    <CardHeader className="text-center pb-4">
                        <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                            <Search className="h-8 w-8 text-primary" />
                        </div>
                        <CardTitle className="text-3xl font-bold text-foreground mb-2">
                            Page Not Found
                        </CardTitle>
                        <CardDescription className="text-base">
                            Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved or deleted.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        {/* Helpful Links */}
                        <div className="bg-muted rounded-lg p-4">
                            <h3 className="text-sm font-semibold text-foreground mb-3">
                                Try one of these:
                            </h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                    Check the URL for typos
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                    Use the navigation menu to find what you need
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                    Return to the homepage and start fresh
                                </li>
                            </ul>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-2 pt-2">
                            <Link href="/" className="block">
                                <Button className="w-full h-12 text-base font-semibold">
                                    <Home className="h-5 w-5 mr-2" />
                                    Go to Homepage
                                </Button>
                            </Link>

                            <Button
                                onClick={() => window.history.back()}
                                variant="outline"
                                className="w-full h-11"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Go Back
                            </Button>
                        </div>

                        {/* Support */}
                        <div className="text-center pt-4 border-t">
                            <p className="text-sm text-muted-foreground">
                                Need help?{" "}
                                <Link
                                    href="#"
                                    className="text-primary hover:underline font-medium"
                                >
                                    Contact Support
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Footer Text */}
                <div className="mt-6 text-center">
                    <p className="text-xs text-muted-foreground">
                        Error Code: 404 - Page Not Found
                    </p>
                </div>
            </div>
        </div>
    );
}