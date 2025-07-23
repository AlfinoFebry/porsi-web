"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";

type UserProfile = {
  id: string;
  nama: string;
  email: string;
  tipe_user: "siswa" | "alumni" | "admin";
  nama_sekolah?: string;
  jurusan?: string;
  kelas?: string;
  nama_perguruan_tinggi?: string;
  jurusan_kuliah?: string;
};

type UserContextType = {
  user: User | null;
  userType: "siswa" | "alumni" | "admin" | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isProfileLoading: boolean;
};

const UserContext = createContext<UserContextType>({
  user: null,
  userType: null,
  profile: null,
  isLoading: true,
  isProfileLoading: true,
});

export const useUser = () => useContext(UserContext);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<"siswa" | "alumni" | "admin" | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      setIsProfileLoading(true);
      const supabase = createClient();

      const { data: profileData, error } = await supabase
        .from("profil")
        .select("id, nama, email, tipe_user, nama_sekolah, jurusan, kelas, nama_perguruan_tinggi, jurusan_kuliah")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Profile fetch error:", error);
        setProfile(null);
        setUserType(null);
      } else if (profileData) {
        setProfile(profileData);
        setUserType(profileData.tipe_user);
      }
    } catch (error) {
      console.error("Profile fetch error:", error);
      setProfile(null);
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
        await fetchProfile(user.id);
      } else {
        setProfile(null);
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
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
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
    <UserContext.Provider value={{ user, userType, profile, isLoading, isProfileLoading }}>
      {children}
    </UserContext.Provider>
  );
} 