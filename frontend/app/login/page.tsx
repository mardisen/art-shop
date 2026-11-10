"use client";

import { useContext, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_URL, setCookieToken } from "../../lib/auth";
import { FormField } from "../../components/FormField";
import { Button } from "../../components/Button";
import { TokenContext } from "@/lib/providers";

export default function LoginPage() {
    const router = useRouter();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { token, setToken } = useContext(TokenContext);

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
        setCookieToken(token.access_token);
        setToken(token.access_token);
        router.push("/");
    }

    return (
        <div className="flex min-h-0 w-full flex-1 flex-col overflow-y-auto bg-zinc-50 px-4 py-8 dark:bg-black">
            <form
                onSubmit={onSubmit}
                className="m-auto w-full max-w-sm space-y-4 rounded-xl bg-white p-8 shadow dark:bg-zinc-900"
            >
                <h1 className="text-2xl font-semibold">Log in</h1>
                {error && (
                    <p className="rounded bg-yellow-50 px-3 py-2 text-sm text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400">
                        {error}
                    </p>
                )}
                <FormField label="Email" name="username" />
                <FormField label="Password" name="password" type="password" />
                <Button type="submit" loading={loading} loadingText="Logging in">
                    Log in
                </Button>
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
