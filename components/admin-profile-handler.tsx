"use client";

import { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useUser } from "./user-provider";

export function AdminProfileHandler() {
  const { user, isLoading: userLoading } = useUser();

  useEffect(() => {
    const handleAdminProfileCreation = async () => {
      const supabase = createClient();

      // Check if we have admin registration data first
      const adminRegistrationData = localStorage.getItem("admin_registration_data");
      const isAdminRegistration = localStorage.getItem("admin_registration");
      const schoolName = localStorage.getItem("admin_school_name");
      const pendingAdminProfile = localStorage.getItem("pending_admin_profile");

      // If no admin registration data, exit early
      if (!adminRegistrationData && !isAdminRegistration && !pendingAdminProfile) {
        return;
      }

      let currentUser = user;

      // If UserProvider is loading or no user, try direct auth check
      if (userLoading || !user) {
        try {
          const { data: { user: directUser }, error } = await supabase.auth.getUser();
          
          if (directUser) {
            currentUser = directUser;
          } else {
            return;
          }
        } catch (error) {
          return;
        }
      }

      if (!currentUser) {
        return;
      }

      let shouldCreateProfile = false;
      let schoolNameToUse = "";

      // Determine if we need to create an admin profile and get school name
      if (adminRegistrationData) {
        try {
          const regData = JSON.parse(adminRegistrationData);
          shouldCreateProfile = regData.isAdmin;
          schoolNameToUse = regData.namaSekolah;
        } catch (error) {
          console.error("Error parsing admin registration data:", error);
        }
      } else if (pendingAdminProfile) {
        // Legacy support for old pending profile format
        try {
          const profileData = JSON.parse(pendingAdminProfile);
          if (profileData.userId === currentUser.id) {
            shouldCreateProfile = true;
            schoolNameToUse = profileData.namaSekolah;
          }
        } catch (error) {
          console.error("Error parsing pending admin profile:", error);
        }
      } else if (isAdminRegistration && schoolName) {
        // Legacy support
        shouldCreateProfile = true;
        schoolNameToUse = schoolName;
      }

      if (shouldCreateProfile && schoolNameToUse) {
        try {
          // Check if profile already exists
          const { data: existingProfile, error: checkError } = await supabase
            .from("profil")
            .select("id, tipe_user")
            .eq("id", currentUser.id)
            .single();

          if (!existingProfile || existingProfile.tipe_user !== "admin") {
            // Create admin profile
            const profileData = {
              id: currentUser.id,
              nama: currentUser.email?.split("@")[0] || "Admin",
              email: currentUser.email || "",
              nama_sekolah: schoolNameToUse,
              tipe_user: "admin",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };

            const { error: profileError } = await supabase
              .from("profil")
              .upsert(profileData, { onConflict: "id" });

            if (profileError) {
              console.error("Error creating admin profile:", {
                error: profileError,
                message: profileError.message,
                details: profileError.details,
                hint: profileError.hint,
                code: profileError.code,
              });
            } else {
              // Clean up all possible localStorage keys
              localStorage.removeItem("admin_registration_data");
              localStorage.removeItem("pending_admin_profile");
              localStorage.removeItem("admin_school_name");
              localStorage.removeItem("admin_registration");
              
              // Force a page refresh to update navigation and user state
              window.location.reload();
            }
          } else {
            // Clean up localStorage even if profile exists
            localStorage.removeItem("admin_registration_data");
            localStorage.removeItem("pending_admin_profile");
            localStorage.removeItem("admin_school_name");
            localStorage.removeItem("admin_registration");
          }
        } catch (error) {
          console.error("Error in admin profile creation:", error);
          // Clean up localStorage even on error
          localStorage.removeItem("admin_registration_data");
          localStorage.removeItem("pending_admin_profile");
          localStorage.removeItem("admin_school_name");
          localStorage.removeItem("admin_registration");
        }
      }
    };

    // Run immediately and also with a delay
    handleAdminProfileCreation();
    const timeoutId = setTimeout(handleAdminProfileCreation, 1000);
    
    return () => clearTimeout(timeoutId);
  }, [user, userLoading]);

  // This component doesn't render anything
  return null;
}
