"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_URL } from "../../lib/auth";

export default function RegisterPage() {
    const router = useRouter();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function onSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError("");
        const data = Object.fromEntries(new FormData(e.currentTarget));

        const res = await fetch(`${API_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            setError(body.detail ?? "Registration failed");
            setLoading(false);
            return;
        }

        router.push("/login");
    }

    return (
        <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 dark:bg-black">
            <form
                onSubmit={onSubmit}
                className="w-full max-w-sm space-y-4 rounded-xl bg-white p-8 shadow dark:bg-zinc-900"
            >
                <h1 className="text-2xl font-semibold">Create account</h1>
                {error && (
                    <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
                        {error}
                    </p>
                )}
                <label className="block">
                    <span className="block text-sm font-medium">Name</span>
                    <input
                        name="name"
                        required
                        className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800"
                    />
                </label>
                <label className="block">
                    <span className="block text-sm font-medium">Username</span>
                    <input
                        name="username"
                        required
                        className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800"
                    />
                </label>
                <label className="block">
                    <span className="block text-sm font-medium">Email</span>
                    <input
                        name="email"
                        type="email"
                        required
                        className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800"
                    />
                </label>
                <label className="block">
                    <span className="block text-sm font-medium">Password</span>
                    <input
                        name="password"
                        type="password"
                        required
                        className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800"
                    />
                </label>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded bg-zinc-900 py-2 font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-black"
                >
                    {loading ? "Registering..." : "Register"}
                </button>
                <p className="text-center text-sm text-zinc-500">
                    Already have an account?{" "}
                    <Link href="/login" className="text-underline underline">
                        Log in
                    </Link>
                </p>
            </form>
        </div>
    );
}
