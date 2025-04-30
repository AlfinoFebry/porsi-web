"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { ThemeSwitcher } from "@/components/theme-switcher";

export default function SettingsPage() {
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Mock user data
  const [formData, setFormData] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    school: "SMA 1",
    grade: "12"
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess(true);
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="border rounded-lg">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-semibold">Profile Settings</h2>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full p-2 rounded-md border border-input bg-background"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-2 rounded-md border border-input bg-background"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="school" className="text-sm font-medium">
                    School
                  </label>
                  <input
                    id="school"
                    name="school"
                    value={formData.school}
                    onChange={handleChange}
                    className="w-full p-2 rounded-md border border-input bg-background"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="grade" className="text-sm font-medium">
                    Grade
                  </label>
                  <select
                    id="grade"
                    name="grade"
                    value={formData.grade}
                    onChange={handleChange}
                    className="w-full p-2 rounded-md border border-input bg-background"
                  >
                    <option value="10">10</option>
                    <option value="11">11</option>
                    <option value="12">12</option>
                  </select>
                </div>
                
                <div className="pt-2">
                  <button
                    type="submit"
                    className="bg-primary text-primary-foreground py-2 px-4 rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:pointer-events-none"
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
                
                {success && (
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md text-green-600 dark:text-green-400 text-sm">
                    Your settings have been saved successfully.
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="border rounded-lg">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-semibold">Appearance</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="font-medium">Theme</div>
                  <p className="text-sm text-muted-foreground">
                    Select a theme for your dashboard.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <ThemeSwitcher />
                  <span className="text-sm">Toggle between light and dark mode</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border rounded-lg">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-semibold">Account</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="font-medium">Sign Out</div>
                  <p className="text-sm text-muted-foreground">
                    Sign out from your account.
                  </p>
                </div>
                <button className="bg-destructive/10 text-destructive py-2 px-4 rounded-md font-medium hover:bg-destructive/20 transition-colors">
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 