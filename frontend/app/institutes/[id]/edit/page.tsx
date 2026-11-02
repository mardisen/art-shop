"use client";

import { useContext, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { apiFetch } from "@/lib/auth";
import { FormField } from "@/components/FormField";
import { Button } from "@/components/Button";
import { UserContext } from "@/lib/providers";
import { Role } from "@/lib/models";

export default function EditInstitutePage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id;
    const userContext = useContext(UserContext);
    const user = (userContext as any).user ?? userContext;
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [institute, setInstitute] = useState<any>(null);

    useEffect(() => {
        async function load() {
            if (!id) return;
            const res = await apiFetch(`/institute/${id}`, { cache: "no-store" });
            if (!res.ok) {
                setError("Institute not found");
                setFetching(false);
                return;
            }
            const data = await res.json();
            setInstitute(data);
            setFetching(false);
        }
        load();
    }, [id]);

    if (user?.role !== Role.Professor || String(user?.institute_id) !== String(id)) {
        return (
            <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 dark:bg-black">
                <p>Not authorized</p>
            </div>
        );
    }

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!institute) return;
        setLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const payload = {
            name: formData.get("name"),
            address: formData.get("address"),
            description: formData.get("description") || null,
            link: formData.get("link") || null,
        };

        const res = await apiFetch(`/institute/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            setError(body.detail ?? "Institute update failed");
            setLoading(false);
            return;
        }

        router.push("/");
    }

    // async function onDelete() {
    //     if (!id) return;
    //     if (!confirm("Delete this institute?")) return;
    //     setDeleting(true);
    //     setError("");
    //     const res = await apiFetch(`/institute/${id}`, { method: "DELETE" });
    //     if (!res.ok) {
    //         const body = await res.json().catch(() => ({}));
    //         setError(body.detail ?? "Institute deletion failed");
    //         setDeleting(false);
    //         return;
    //     }
    //     router.push("/");
    // }

    if (fetching) {
        return (
            <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 dark:bg-black">
                <p>Loading...</p>
            </div>
        );
    }

    if (!institute) {
        return (
            <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 dark:bg-black">
                <p>Institute not found</p>
            </div>
        );
    }

    return (
        <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 dark:bg-black">
            <form
                onSubmit={onSubmit}
                className="w-full max-w-sm space-y-4 rounded-xl bg-white p-8 shadow dark:bg-zinc-900"
            >
                <h1 className="text-2xl font-semibold">Edit institute</h1>
                {error && (
                    <p className="rounded bg-yellow-50 px-3 py-2 text-sm text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400">
                        {error}
                    </p>
                )}
                <FormField label="Name" name="name" defaultValue={institute.name} required />
                <FormField label="Address" name="address" defaultValue={institute.address} required />
                <FormField label="Description (optional)" name="description" defaultValue={institute.description || ""} />
                <FormField label="Link (optional)" name="link" defaultValue={institute.link || ""} />
                <div className="flex gap-2">
                    <Button type="button" variant="secondary" onClick={() => router.push("/")}>
                        Cancel
                    </Button>
                    {/* <Button type="button" variant="danger" loading={deleting} loadingText="Deleting" onClick={onDelete}>
                        Delete
                    </Button> */}
                    <Button type="submit" loading={loading} loadingText="Saving">
                        Save
                    </Button>
                </div>
            </form>
        </div>
    );
}
