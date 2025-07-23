"use client";

import { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useUser } from "./user-provider";

export function AdminProfileHandler() {
    const { user } = useUser();

    useEffect(() => {
        const handleAdminProfileCreation = async () => {
            if (!user) return;

            // Check if this is an admin registration from OAuth
            const isAdminRegistration = localStorage.getItem('admin_registration');
            const schoolName = localStorage.getItem('admin_school_name');

            if (isAdminRegistration && schoolName) {
                try {
                    const supabase = createClient();

                    // Check if profile already exists
                    const { data: existingProfile } = await supabase
                        .from('profil')
                        .select('id')
                        .eq('id', user.id)
                        .single();

                    if (!existingProfile) {
                        // Create admin profile
                        const profileData = {
                            id: user.id,
                            nama: user.email?.split('@')[0] || 'Admin', // Use email username as name
                            email: user.email || '',
                            nama_sekolah: schoolName,
                            tipe_user: "admin",
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                        };

                        const { error: profileError } = await supabase
                            .from('profil')
                            .upsert(profileData);

                        if (profileError) {
                            console.error('Error creating admin profile:', {
                                error: profileError,
                                message: profileError.message,
                                details: profileError.details,
                                hint: profileError.hint,
                                code: profileError.code
                            });
                        } else {
                            console.log('Admin profile created successfully after OAuth');
                            // Force a page refresh to update navigation
                            window.location.reload();
                        }
                    }

                    // Clean up localStorage
                    localStorage.removeItem('admin_school_name');
                    localStorage.removeItem('admin_registration');
                } catch (error) {
                    console.error('Error in admin profile creation:', error);
                    // Clean up localStorage even on error
                    localStorage.removeItem('admin_school_name');
                    localStorage.removeItem('admin_registration');
                }
            }
        };

        handleAdminProfileCreation();
    }, [user]);

    // This component doesn't render anything
    return null;
}