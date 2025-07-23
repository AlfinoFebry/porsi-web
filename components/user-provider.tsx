"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createRobustClient, robustAuth, robustDb } from "@/utils/supabase/robust-client";
import { User } from "@supabase/supabase-js";

type UserContextType = {
  user: User | null;
  userType: "siswa" | "alumni" | "admin" | null;
  isLoading: boolean;
  isProfileLoading: boolean;
};

const UserContext = createContext<UserContextType>({
  user: null,
  userType: null,
  isLoading: true,
  isProfileLoading: true,
});

export const useUser = () => useContext(UserContext);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<"siswa" | "alumni" | "admin" | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  const fetchUserType = async (userId: string) => {
    if (!isMounted) return;
    
    try {
      setIsProfileLoading(true);
      
      const result = await robustDb.safeQuery(
        async (client) => {
          return await client
            .from("profil")
            .select("tipe_user")
            .eq("id", userId)
            .single();
        },
        null,
        'fetchUserType'
      );

      if (!isMounted) return;

      if (result && result.data && !result.error) {
        setUserType(result.data.tipe_user);
      } else {
        console.error("User type fetch error:", result?.error);
        setUserType(null);
      }
    } catch (error) {
      if (!isMounted) return;
      console.error("User type fetch error:", error);
      setUserType(null);
    } finally {
      if (isMounted) {
        setIsProfileLoading(false);
      }
    }
  };

  useEffect(() => {
    setIsMounted(true);
    const supabase = createRobustClient();

    // Get initial user with robust auth
    const getUser = async () => {
      if (!isMounted) return;
      
      const { data: { user }, error } = await robustAuth.getUser();
      
      if (!isMounted) return;
      
      setUser(user);
      setIsLoading(false);

      if (user && !error) {
        await fetchUserType(user.id);
      } else {
        setUserType(null);
        setIsProfileLoading(false);
      }
    };

    getUser();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!isMounted) return;
        
        setUser(session?.user ?? null);
        setIsLoading(false);

        if (session?.user) {
          await fetchUserType(session.user.id);
        } else {
          setUserType(null);
          setIsProfileLoading(false);
        }
      }
    );

    return () => {
      setIsMounted(false);
      subscription.unsubscribe();
    };
  }, []);

  return (
    <UserContext.Provider value={{ user, userType, isLoading, isProfileLoading }}>
      {children}
    </UserContext.Provider>
  );
} 