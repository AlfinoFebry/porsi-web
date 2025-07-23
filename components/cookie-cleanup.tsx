"use client";

import { useEffect } from 'react';

// Cookie corruption detection and cleanup
const CORRUPTED_COOKIE_PATTERNS = [
  /^base64-/,
  /^undefined$/,
  /^null$/,
  /^NaN$/,
];

function isCorruptedCookie(value: string): boolean {
  if (!value || typeof value !== 'string') return true;
  return CORRUPTED_COOKIE_PATTERNS.some(pattern => pattern.test(value));
}

function cleanCorruptedCookies(): boolean {
  if (typeof window === 'undefined') return false;
  
  let foundCorruption = false;
  const cookieNames = ['sb-access-token', 'sb-refresh-token', 'sb-provider-token'];
  
  // Check and clean document cookies
  cookieNames.forEach(name => {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [cookieName, cookieValue] = cookie.trim().split('=');
      if (cookieName === name && cookieValue && isCorruptedCookie(cookieValue)) {
        console.warn(`🧹 Cleaning corrupted cookie: ${name}`);
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
        foundCorruption = true;
      }
    }
  });
  
  // Check and clean localStorage
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith('supabase.auth.token')) {
        const value = localStorage.getItem(key);
        if (value && isCorruptedCookie(value)) {
          console.warn(`🧹 Cleaning corrupted localStorage: ${key}`);
          localStorage.removeItem(key);
          foundCorruption = true;
        }
      }
    }
  } catch (e) {
    console.warn('Error checking localStorage:', e);
  }
  
  return foundCorruption;
}

export function CookieCleanup() {
  useEffect(() => {
    // Clean any corrupted cookies on app initialization
    const foundCorruption = cleanCorruptedCookies();
    if (foundCorruption) {
      console.log('🔄 Corrupted cookies cleaned on app initialization');
    }

    // Monitor storage events for corruption
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key && e.key.startsWith('supabase.auth.token') && e.newValue) {
        if (isCorruptedCookie(e.newValue)) {
          console.warn('🚨 Corrupted cookie detected in storage event');
          localStorage.removeItem(e.key);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return null; // This component doesn't render anything
}
