"use client";

import { useState, useEffect } from "react";

export function useSidebarState() {
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        // Get initial state from localStorage
        const storedState = localStorage.getItem("sidebarCollapsed");
        if (storedState) {
            setIsCollapsed(JSON.parse(storedState));
        }

        // Create a custom event to listen for sidebar state changes
        const handleStorageChange = () => {
            const currentState = localStorage.getItem("sidebarCollapsed");
            if (currentState) {
                setIsCollapsed(JSON.parse(currentState));
            }
        };

        window.addEventListener("storage", handleStorageChange);

        // Create a custom event for the same page updates
        window.addEventListener("sidebarStateChange", handleStorageChange);

        return () => {
            window.removeEventListener("storage", handleStorageChange);
            window.removeEventListener("sidebarStateChange", handleStorageChange);
        };
    }, []);

    return isCollapsed;
} 