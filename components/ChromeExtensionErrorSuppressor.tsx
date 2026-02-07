"use client"

import { useEffect } from 'react';

/**
 * Suppresses Chrome extension errors in both development and production
 * 
 * WHY THIS IS SAFE:
 * - Only suppresses errors from browser extensions (not your app errors)
 * - Extension errors don't affect app functionality
 * - Keeps console clean for debugging real issues
 * 
 * WHAT IT SUPPRESSES:
 * - "runtime.lastError" - Extension communication failures
 * - "Receiving end does not exist" - Extension message passing errors
 * - "Could not establish connection" - Extension context errors
 * - "Extension context invalidated" - Extension reload errors
 * 
 * YOUR APP ERRORS WILL STILL SHOW - This only filters extension noise
 */
export function ChromeExtensionErrorSuppressor() {
    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Extension error patterns to suppress
        const EXTENSION_ERROR_PATTERNS = [
            'runtime.lastError',
            'Receiving end does not exist',
            'Could not establish connection',
            'Extension context invalidated',
            'chrome-extension://',
            'moz-extension://', // Firefox extensions
            'Manifest version 2 is deprecated',
            'Manifest version 3',
        ];

        /**
         * Check if an error is from a browser extension
         */
        const isExtensionError = (errorMessage: string): boolean => {
            return EXTENSION_ERROR_PATTERNS.some(pattern =>
                errorMessage.toLowerCase().includes(pattern.toLowerCase())
            );
        };

        // ============================================
        // 1. Suppress console.error for extension errors
        // ============================================
        const originalConsoleError = console.error;
        const originalConsoleWarn = console.warn;

        console.error = (...args: unknown[]) => {
            const errorString = String(args[0] || '');

            if (isExtensionError(errorString)) {
                // Silently ignore extension errors
                return;
            }

            // Log all other errors normally
            originalConsoleError.apply(console, args);
        };

        console.warn = (...args: unknown[]) => {
            const warnString = String(args[0] || '');

            if (isExtensionError(warnString)) {
                // Silently ignore extension warnings
                return;
            }

            // Log all other warnings normally
            originalConsoleWarn.apply(console, args);
        };

        // ============================================
        // 2. Suppress unhandled promise rejections from extensions
        // ============================================
        const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
            const error = event.reason;
            const errorMessage = error?.message || error?.toString() || String(error);

            if (isExtensionError(errorMessage)) {
                // Prevent the error from showing in console
                event.preventDefault();
                return;
            }

            // Let other promise rejections through
        };

        window.addEventListener('unhandledrejection', handleUnhandledRejection);

        // ============================================
        // 3. Suppress window error events from extensions
        // ============================================
        const handleWindowError = (event: ErrorEvent) => {
            const errorMessage = event.message || String(event.error);

            if (isExtensionError(errorMessage)) {
                // Prevent the error from showing
                event.preventDefault();
                return false;
            }

            // Let other errors through
            return true;
        };

        window.addEventListener('error', handleWindowError);

        // ============================================
        // Cleanup: Restore original functions on unmount
        // ============================================
        return () => {
            console.error = originalConsoleError;
            console.warn = originalConsoleWarn;
            window.removeEventListener('unhandledrejection', handleUnhandledRejection);
            window.removeEventListener('error', handleWindowError);
        };
    }, []);

    // This component doesn't render anything
    return null;
}

