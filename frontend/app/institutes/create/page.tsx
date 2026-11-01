"use client";

import { useContext, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/auth";
import { FormField } from "@/components/FormField";
import { Button } from "@/components/Button";
import { UserContext } from "@/lib/providers";
import { Role } from "@/lib/models";

export default function CreateInstitutePage() {
    const router = useRouter();
    const userContext = useContext(UserContext);
    const user = (userContext as any).user ?? userContext;
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    if (user?.role !== Role.Professor) {
        return (
            <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 dark:bg-black">
                <p>Not authorized</p>
            </div>
        );
    }

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const payload = {
            name: formData.get("name"),
            address: formData.get("address"),
            description: formData.get("description") || null,
            link: formData.get("link") || null,
        };

        const res = await apiFetch("/institute/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            setError(body.detail ?? "Institute creation failed");
            setLoading(false);
            return;
        }

        router.push("/");
    }

    return (
        <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 dark:bg-black">
            <form
                onSubmit={onSubmit}
                className="w-full max-w-sm space-y-4 rounded-xl bg-white p-8 shadow dark:bg-zinc-900"
            >
                <h1 className="text-2xl font-semibold">Create institute</h1>
                {error && (
                    <p className="rounded bg-yellow-50 px-3 py-2 text-sm text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400">
                        {error}
                    </p>
                )}
                <FormField label="Name" name="name" required />
                <FormField label="Address" name="address" required />
                <FormField label="Description (optional)" name="description" />
                <FormField label="Link (optional)" name="link" />
                <div className="flex gap-2">
                    <Button type="button" variant="secondary" onClick={() => router.push("/")}>
                        Cancel
                    </Button>
                    <Button type="submit" loading={loading} loadingText="Creating">
                        Create
                    </Button>
                </div>
            </form>
        </div>
    );
}
