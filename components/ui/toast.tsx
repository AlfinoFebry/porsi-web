"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToastProps {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "destructive";
  onDismiss: (id: string) => void;
}

export function Toast({ id, title, description, variant = "default", onDismiss }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onDismiss(id), 300);
    }, 5000);

    return () => clearTimeout(timer);
  }, [id, onDismiss]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => onDismiss(id), 300);
  };

  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-50 w-full max-w-sm rounded-lg border p-4 shadow-lg transition-all duration-300",
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0",
        variant === "destructive"
          ? "border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-900/20 dark:text-red-100"
          : "border-border bg-background text-foreground"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <div className="font-medium">{title}</div>
          {description && (
            <div className="mt-1 text-sm opacity-90">{description}</div>
          )}
        </div>
        <button
          onClick={handleDismiss}
          className="rounded-sm opacity-70 hover:opacity-100 transition-opacity"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Array<{
    id: string;
    title: string;
    description?: string;
    variant?: "default" | "destructive";
  }>>([]);

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Global toast function that can be called from anywhere
  useEffect(() => {
    const handleToast = (event: CustomEvent) => {
      const { title, description, variant } = event.detail;
      const id = Date.now().toString();
      setToasts(prev => [...prev, { id, title, description, variant }]);
    };

    window.addEventListener('show-toast', handleToast as EventListener);
    return () => window.removeEventListener('show-toast', handleToast as EventListener);
  }, []);

  return (
    <>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          title={toast.title}
          description={toast.description}
          variant={toast.variant}
          onDismiss={dismissToast}
        />
      ))}
    </>
  );
}

// Helper function to show toast from anywhere
export function showToast(options: {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}) {
  const event = new CustomEvent('show-toast', { detail: options });
  window.dispatchEvent(event);
} 