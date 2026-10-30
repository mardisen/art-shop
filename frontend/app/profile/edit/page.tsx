"use client";

import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/auth";
import { FormField } from "@/components/FormField";
import { Button } from "@/components/Button";
import { UserContext } from "@/lib/providers";

export default function EditProfilePage() {
    const router = useRouter();
    const user = useContext(UserContext);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    useEffect(() => {
        if (user) {
            setName(user.name || "");
            setSurname(user.surname || "");
            setEmail(user.email || "");
        }
    }, [user]);

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError("");

        const payload: any = {
            name,
            surname,
            email,
        };
        if (password) payload.password = password;

        const res = await apiFetch("/auth/me", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            setError(body.detail ?? "Profile update failed");
            setLoading(false);
            return;
        }

        router.push("/");
    }

    return (
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-zinc-50 px-4 pt-8 pb-4 dark:bg-black">
            <form
                onSubmit={onSubmit}
                className="mx-auto w-full max-w-sm space-y-4 rounded-xl bg-white p-8 shadow dark:bg-zinc-900"
            >
                <h1 className="text-2xl font-semibold">Edit profile</h1>
                {error && (
                    <p className="rounded bg-yellow-50 px-3 py-2 text-sm text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400">
                        {error}
                    </p>
                )}
                <FormField label="Name" name="name" value={name} onChange={(e) => setName(e.target.value)} required />
                <FormField label="Surname" name="surname" value={surname} onChange={(e) => setSurname(e.target.value)} required />
                <FormField label="Email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <FormField label="New password (optional)" name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required={false} />
                <div className="flex gap-2">
                    <Button type="button" variant="secondary" onClick={() => router.push("/")}>
                        Cancel
                    </Button>
                    <Button type="submit" loading={loading} loadingText="Saving">
                        Save
                    </Button>
                </div>
            </form>
        </div>
    );
}
