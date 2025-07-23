"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
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

  const fetchUserType = async (userId: string) => {
    try {
      setIsProfileLoading(true);
      const supabase = createClient();

      const { data: profileData, error } = await supabase
        .from("profil")
        .select("tipe_user")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("User type fetch error:", error);
        setUserType(null);
      } else if (profileData) {
        setUserType(profileData.tipe_user);
      }
    } catch (error) {
      console.error("User type fetch error:", error);
      setUserType(null);
    } finally {
      setIsProfileLoading(false);
    }
  };

  useEffect(() => {
    const supabase = createClient();

    // Get initial user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setIsLoading(false);

      if (user) {
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
      subscription.unsubscribe();
    };
  }, []);

  return (
    <UserContext.Provider value={{ user, userType, isLoading, isProfileLoading }}>
      {children}
    </UserContext.Provider>
  );
} 