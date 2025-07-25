"use client";

import { useState, useCallback } from "react";

type ToastVariant = "default" | "destructive";

interface Toast {
    id: string;
    title: string;
    description?: string;
    variant?: ToastVariant;
}

interface ToastOptions {
    title: string;
    description?: string;
    variant?: ToastVariant;
}

let toastCount = 0;

export function useToast() {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const toast = useCallback((options: ToastOptions) => {
        const id = (++toastCount).toString();
        const newToast: Toast = {
            id,
            ...options,
            variant: options.variant || "default",
        };

        setToasts((prev) => [...prev, newToast]);

        // Auto remove after 5 seconds
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 5000);

        return id;
    }, []);

    const dismiss = useCallback((toastId: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== toastId));
    }, []);

    return {
        toast,
        dismiss,
        toasts,
    };
} 