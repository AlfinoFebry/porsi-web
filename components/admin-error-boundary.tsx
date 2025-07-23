"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface AdminErrorBoundaryState {
    hasError: boolean;
    error?: Error;
}

interface AdminErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
}

export class AdminErrorBoundary extends React.Component<
    AdminErrorBoundaryProps,
    AdminErrorBoundaryState
> {
    constructor(props: AdminErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): AdminErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("Admin Error Boundary caught an error:", error, errorInfo);
    }

    resetError = () => {
        this.setState({ hasError: false, error: undefined });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                const FallbackComponent = this.props.fallback;
                return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
            }

            return <DefaultAdminErrorFallback error={this.state.error} resetError={this.resetError} />;
        }

        return this.props.children;
    }
}

function DefaultAdminErrorFallback({
    error,
    resetError
}: {
    error?: Error;
    resetError: () => void;
}) {
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        Admin System Error
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                            Terjadi kesalahan pada sistem admin. Silakan coba lagi atau hubungi administrator.
                        </p>
                        {error && (
                            <details className="text-xs text-muted-foreground">
                                <summary className="cursor-pointer hover:text-foreground">
                                    Detail Error (untuk developer)
                                </summary>
                                <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                                    {error.message}
                                    {error.stack && `\n\n${error.stack}`}
                                </pre>
                            </details>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <Button onClick={resetError} className="flex-1">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Coba Lagi
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => window.location.href = '/dashboard'}
                            className="flex-1"
                        >
                            Kembali ke Dashboard
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

// Hook version for functional components
export function useAdminErrorHandler() {
    const handleError = React.useCallback((error: Error, errorInfo?: string) => {
        console.error("Admin Error:", error, errorInfo);

        // You could also send error to monitoring service here
        // Example: sendErrorToMonitoring(error, errorInfo);
    }, []);

    return { handleError };
}