"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

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
        <div className="min-h-screen flex items-center justify-center">
            <div className="p-8 bg-black rounded-lg shadow-md w-96">
                <h1 className="text-2xl font-bold mb-6 text-center">Logg Inn</h1>

                {error && (
                    <div className="mb-4 p-4 text-red-700 bg-red-100 rounded">
                        {error === "Invalid username or password" ? "Ugyldig brukernavn eller passord" : "En feil oppstod under innlogging"}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">Brukernavn</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">Passord</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                    >
                        Logg inn
                    </button>
                </form>
            </div>
        </div>
    );
}