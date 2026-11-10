"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/auth";
import { Institute } from "@/lib/models";
import { FormField } from "@/components/FormField";
import { Button } from "@/components/Button";

export function InstituteForm({ institute }: { institute?: Institute }) {
    const router = useRouter();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

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

        const res = await apiFetch(institute ? `/institute/${institute.id}` : "/institute/", {
            method: institute ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            setError(body.detail ?? (institute ? "Institute update failed" : "Institute creation failed"));
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
                <h1 className="text-2xl font-semibold">{institute ? "Edit institute" : "Create institute"}</h1>
                {error && (
                    <p className="rounded bg-yellow-50 px-3 py-2 text-sm text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400">
                        {error}
                    </p>
                )}
                <FormField label="Name" name="name" defaultValue={institute?.name ?? ""} required />
                <FormField label="Address" name="address" defaultValue={institute?.address ?? ""} required />
                <FormField
                    label="Description (optional)"
                    name="description"
                    defaultValue={institute?.description ?? ""}
                />
                <FormField label="Link (optional)" name="link" defaultValue={institute?.link ?? ""} />
                <div className="flex gap-2">
                    <Button type="button" variant="secondary" onClick={() => router.push("/")}>
                        Cancel
                    </Button>
                    <Button type="submit" loading={loading} loadingText={institute ? "Saving" : "Creating"}>
                        {institute ? "Save" : "Create"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
