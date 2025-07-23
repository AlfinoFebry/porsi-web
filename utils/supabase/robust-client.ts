import { createBrowserClient } from "@supabase/ssr";
import { SupabaseClient, User, AuthResponse, Session } from "@supabase/supabase-js";

// Singleton pattern to prevent multiple client instances
let clientInstance: SupabaseClient | null = null;

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

// Safe operation wrapper
async function safeSupabaseOperation<T>(
  operation: () => Promise<T>,
  fallback: T,
  operationName: string = 'Unknown'
): Promise<T> {
  try {
    const result = await operation();
    return result;
  } catch (error) {
    console.warn(`🔧 Supabase operation "${operationName}" failed:`, error);
    
    // Check if it's a cookie parsing error
    if (error instanceof Error && error.message.includes('Failed to parse cookie')) {
      console.warn('🍪 Cookie parsing error detected, cleaning up...');
      const foundCorruption = cleanCorruptedCookies();
      if (foundCorruption) {
        // Reload the page to get fresh state
        window.location.reload();
        return fallback;
      }
    }
    
    return fallback;
  }
}

export function createRobustClient(): SupabaseClient {
  // Clean any corrupted cookies on initialization
  if (typeof window !== 'undefined') {
    const foundCorruption = cleanCorruptedCookies();
    if (foundCorruption) {
      console.log('🔄 Corrupted cookies cleaned, reloading for fresh state...');
      setTimeout(() => window.location.reload(), 100);
    }
  }
  
  // Return existing instance if available
  if (clientInstance) {
    return clientInstance;
  }
  
  // Create new client instance
  try {
    clientInstance = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    console.log('✅ Robust Supabase client initialized');
    return clientInstance;
  } catch (error) {
    console.error('❌ Failed to create Supabase client:', error);
    throw error;
  }
}

// Enhanced auth operations with error handling
export const robustAuth = {
  async getUser() {
    const client = createRobustClient();
    try {
      return await client.auth.getUser();
    } catch (error) {
      console.warn('🔧 getUser failed:', error);
      if (error instanceof Error && error.message.includes('Failed to parse cookie')) {
        cleanCorruptedCookies();
        window.location.reload();
      }
      return { data: { user: null }, error };
    }
  },
  
  async signOut() {
    const client = createRobustClient();
    
    // Clean localStorage before signing out
    if (typeof window !== 'undefined') {
      try {
        localStorage.clear();
        console.log('🧹 LocalStorage cleared on logout');
      } catch (e) {
        console.warn('Error clearing localStorage:', e);
      }
    }
    
    try {
      return await client.auth.signOut();
    } catch (error) {
      console.warn('🔧 signOut failed:', error);
      return { error };
    }
  },
  
  async getSession() {
    const client = createRobustClient();
    try {
      return await client.auth.getSession();
    } catch (error) {
      console.warn('🔧 getSession failed:', error);
      if (error instanceof Error && error.message.includes('Failed to parse cookie')) {
        cleanCorruptedCookies();
        window.location.reload();
      }
      return { data: { session: null }, error };
    }
  }
};

// Enhanced database operations
export const robustDb = {
  async safeQuery<T>(
    queryFn: (client: SupabaseClient) => Promise<T>,
    fallback: T,
    operationName: string = 'Database Query'
  ): Promise<T> {
    const client = createRobustClient();
    return safeSupabaseOperation(
      () => queryFn(client),
      fallback,
      operationName
    );
  }
};

// Storage event monitoring for cookie corruption
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key && e.key.startsWith('supabase.auth.token') && e.newValue) {
      if (isCorruptedCookie(e.newValue)) {
        console.warn('🚨 Corrupted cookie detected in storage event');
        localStorage.removeItem(e.key);
      }
    }
  });
}

export default createRobustClient;
