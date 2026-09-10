"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_URL, setToken } from "../../lib/auth";

export default function LoginPage() {
    const router = useRouter();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function onSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError("");
        const form = new FormData(e.currentTarget);
        const body = new URLSearchParams({
            username: String(form.get("username")),
            password: String(form.get("password")),
        });

        const res = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body,
        });

        if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            setError(body.detail ?? "Login failed");
            setLoading(false);
            return;
        }

        const token = (await res.json()) as { access_token: string };
        setToken(token.access_token);
        router.push("/");
    }

    return (
        <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 dark:bg-black">
            <form
                onSubmit={onSubmit}
                className="w-full max-w-sm space-y-4 rounded-xl bg-white p-8 shadow dark:bg-zinc-900"
            >
                <h1 className="text-2xl font-semibold">Log in</h1>
                {error && (
                    <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
                        {error}
                    </p>
                )}
                <label className="block">
                    <span className="block text-sm font-medium">Username</span>
                    <input
                        name="username"
                        required
                        className="input"
                    />
                </label>
                <label className="block">
                    <span className="block text-sm font-medium">Password</span>
                    <input
                        name="password"
                        type="password"
                        required
                        className="input"
                    />
                </label>
                <button
                    type="submit"
                    disabled={loading}
                    className="mt-1 w-full rounded bg-zinc-900 py-2 font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-black"
                >
                    {loading ? "Logging in..." : "Log in"}
                </button>
                <p className="text-center text-sm text-zinc-500">
                    No account?{" "}
                    <Link href="/register" className="underline">
                        Register
                    </Link>
                </p>
            </form>
        </div>
    );
}
