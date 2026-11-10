"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FormField } from "../../components/FormField";
import { Button } from "../../components/Button";
import { apiFetch } from "@/lib/auth";
import { Institute, Role } from "@/lib/models";

export default function RegisterPage() {
    const router = useRouter();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [role, setRole] = useState<Role>(Role.Artist);
    const [institutes, setInstitutes] = useState<Institute[]>([]);
    const [instituteId, setInstituteId] = useState("");

    useEffect(() => {
        async function loadInstitutes() {
            try {
                const res = await apiFetch("/institute/");
                if (res.ok) {
                    const data = await res.json();
                    setInstitutes(Array.isArray(data) ? data : []);
                }
            } catch {}
        }
        loadInstitutes();
    }, []);

    async function onSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError("");
        const form = new FormData(e.currentTarget);

        const payload: Record<string, unknown> = {
            name: form.get("name"),
            surname: form.get("surname"),
            email: form.get("email"),
            password: form.get("password"),
            role,
        };
        if (role === Role.Professor && instituteId) {
            payload.institute_id = Number(instituteId);
        }

        const res = await apiFetch("/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
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
        <div className="flex min-h-0 w-full flex-1 flex-col overflow-y-auto bg-zinc-50 px-4 py-8 dark:bg-black">
            <form
                onSubmit={onSubmit}
                className="m-auto w-full max-w-sm space-y-4 rounded-xl bg-white p-8 shadow dark:bg-zinc-900"
            >
                <h1 className="text-2xl font-semibold">Create account</h1>
                {error && (
                    <p className="rounded bg-yellow-50 px-3 py-2 text-sm text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400">
                        {error}
                    </p>
                )}
                <FormField label="Name" name="name" required />
                <FormField label="Surname" name="surname" required />
                <FormField label="Email" name="email" type="email" required />
                <FormField label="Password" name="password" type="password" required />
                <label className="block">
                    <span className="block text-sm font-medium">Role</span>
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value as Role)}
                        className="input"
                    >
                        <option value={Role.Artist}>Artist</option>
                        <option value={Role.Professor}>Professor</option>
                    </select>
                </label>
                {role === Role.Professor && (
                    <label className="block">
                        <span className="block text-sm font-medium">Institute</span>
                        <select
                            value={instituteId}
                            onChange={(e) => setInstituteId(e.target.value)}
                            className="input"
                        >
                            <option value="">None</option>
                            {institutes.map((inst) => (
                                <option key={inst.id} value={inst.id}>
                                    {inst.name}
                                </option>
                            ))}
                        </select>
                    </label>
                )}
                <Button type="submit" loading={loading} loadingText="Registering">
                    Register
                </Button>
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
