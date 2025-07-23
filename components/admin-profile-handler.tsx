"use client";

import { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export function AdminProfileHandler() {
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        const handleAdminProfile = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                // Check for pending admin registration
                const adminRegData = localStorage.getItem('admin_registration_data');
                const pendingProfile = localStorage.getItem('pending_admin_profile');

                if (adminRegData) {
                    const regData = JSON.parse(adminRegData);
                    
                    // Check if profile already exists
                    const { data: existingProfile } = await supabase
                        .from('profil')
                        .select('id, tipe_user')
                        .eq('id', user.id)
                        .single();

                    if (!existingProfile) {
                        // Create admin profile
                        const profileData = {
                            id: user.id,
                            nama: user.email?.split('@')[0] || 'Admin',
                            email: user.email || '',
                            nama_sekolah: regData.namaSekolah,
                            tipe_user: "admin",
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                        };

                        const { error } = await supabase
                            .from('profil')
                            .insert(profileData);

                        if (error) {
                            console.error('Error creating admin profile:', error);
                        } else {
                            console.log('Admin profile created successfully');
                        }
                    }
                    
                    localStorage.removeItem('admin_registration_data');
                } else if (pendingProfile) {
                    // Handle pending profile from email confirmation
                    const profileData = JSON.parse(pendingProfile);
                    if (profileData.userId === user.id) {
                        const { error } = await supabase
                            .from('profil')
                            .insert({
                                id: profileData.userId,
                                nama: profileData.email.split('@')[0] || 'Admin',
                                email: profileData.email,
                                nama_sekolah: profileData.namaSekolah,
                                tipe_user: "admin",
                                created_at: new Date().toISOString(),
                                updated_at: new Date().toISOString(),
                            });

                        if (!error) {
                            localStorage.removeItem('pending_admin_profile');
                        }
                    }
                }
            } catch (error) {
                console.error('Error in AdminProfileHandler:', error);
            }
        };

        handleAdminProfile();
    }, [supabase]);

    return null;
}