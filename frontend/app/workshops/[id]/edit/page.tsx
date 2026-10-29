"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { apiFetch } from "@/lib/auth";
import { UserContext } from "@/lib/providers";
import { useContext } from "react";
import { WorkshopForm } from "@/components/WorkshopForm";
import { WorkshopFull } from "@/lib/models";

export default function EditWorkshopPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id;
    const user = useContext(UserContext);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [workshop, setWorkshop] = useState<WorkshopFull | null>(null);
    const [lat, setLat] = useState<number>(41.1171432);
    const [lng, setLng] = useState<number>(16.8718715);

    useEffect(() => {
        async function load() {
            if (!id) return;
            const res = await apiFetch(`/workshop/${id}`, { cache: "no-store" });
            if (!res.ok) {
                setError("Workshop not found");
                setFetching(false);
                return;
            }
            const data = await res.json();
            setWorkshop(data);
            setLat(data.latitude);
            setLng(data.longitude);
            setFetching(false);
        }
        load();
    }, [id]);

    async function onSubmit(values: any) {
        if (!workshop) return;
        setLoading(true);
        setError("");

        const payload = {
            ...values,
            latitude: lat,
            longitude: lng,
            link: values.link || null,
            type: workshop.type,
        };

        const res = await apiFetch(`/workshop/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            setError(body.detail ?? "Workshop update failed");
            setLoading(false);
            return;
        }

        router.push("/workshops");
    }

    async function onDelete() {
        if (!id) return;
        if (!confirm("Delete this workshop?")) return;
        setDeleting(true);
        setError("");
        const res = await apiFetch(`/workshop/${id}`, { method: "DELETE" });
        if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            setError(body.detail ?? "Workshop deletion failed");
            setDeleting(false);
            return;
        }
        router.push("/workshops");
    }

    if (fetching) {
        return (
            <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 dark:bg-black">
                <p>Loading...</p>
            </div>
        );
    }

    if (!workshop) {
        return (
            <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 dark:bg-black">
                <p>Workshop not found</p>
            </div>
        );
    }

    if (workshop.created_by !== user.id) {
        return (
            <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 dark:bg-black">
                <p>Not authorized</p>
            </div>
        );
    }

    return (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center bg-zinc-50 px-4 py-4 dark:bg-black">
            <div className="w-full max-w-5xl flex-1 min-h-0 space-y-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Edit workshop</h1>
                </div>
                <WorkshopForm
                    initialValues={{
                        name: workshop.name,
                        address: workshop.address,
                        description: workshop.description,
                        link: workshop.link || "",
                        date: workshop.date,
                        latitude: lat,
                        longitude: lng,
                    }}
                    onSubmit={onSubmit}
                    submitText="Save"
                    loadingText="Saving"
                    loading={loading}
                    error={error}
                    onCancel={() => router.push("/workshops")}
                    showDelete
                    onDelete={onDelete}
                    deleting={deleting}
                />
            </div>
        </div>
    );
}
