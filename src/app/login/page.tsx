"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            const result = await signIn("credentials", {
                username,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError("Ugyldig brukernavn eller passord");
                return;
            }

            router.push("/"); // Redirect to home page after successful login
        } catch (error) {
            setError("En feil oppstod under innlogging");
        }
    };

    return (
        <div className="flex items-center justify-center p-4 md:p-6" style={{ minHeight: 'calc(100vh - 64px)' }}>
            <Card className="w-full max-w-md  border border-gray-200 rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-br from-gray-50 to-white py-8">
                    <CardTitle className="text-3xl text-center text-gray-900 mb-1">Logg inn</CardTitle>
                </CardHeader>
                <CardContent className="pt-8 pb-8 px-6 md:px-8">
                    {error && (
                        <div className="mb-6 p-4 text-sm text-red-800 bg-red-50  rounded-xl">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-900">
                                Brukernavn
                            </label>
                            <Input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder=""
                                required
                                className="h-12 rounded-xl text-base"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-900">
                                Passord
                            </label>
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder=""
                                required
                                className="h-12 rounded-xl text-base"
                            />
                        </div>

                        <Button type="submit" className="w-full gap-2 h-12 rounded-xl text-base font-semibold mt-6" size="lg">
                            <LogIn className="h-5 w-5" />
                            Logg inn
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}