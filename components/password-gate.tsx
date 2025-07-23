"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/form-message";

interface PasswordGateProps {
    onSuccess: () => void;
    correctPassword: string;
}

export function PasswordGate({ onSuccess, correctPassword }: PasswordGateProps) {
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        // Simulate a brief loading state for better UX
        await new Promise(resolve => setTimeout(resolve, 300));

        if (password === correctPassword) {
            onSuccess();
        } else {
            setError("Password salah. Silakan coba lagi.");
        }

        setIsLoading(false);
    };

    return (
        <div className="min-h-[calc(100vh-16rem)] w-full flex flex-col items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                <Card>
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-bold">
                            Akses Admin
                        </CardTitle>
                        <CardDescription>
                            Masukkan password untuk mengakses halaman registrasi admin
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Masukkan password admin"
                                    required
                                    disabled={isLoading}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isLoading || !password.trim()}
                            >
                                {isLoading ? "Memverifikasi..." : "Lanjutkan"}
                            </Button>

                            {error && (
                                <FormMessage message={{ error }} />
                            )}
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}