"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/auth";
import { Workshop, WorkshopFull } from "@/lib/models";
import { WorkshopForm } from "@/components/WorkshopForm";

const BARI_LAT = 41.1171432;
const BARI_LNG = 16.8718715;

export function WorkshopEditor({ workshop }: { workshop?: WorkshopFull }) {
    const router = useRouter();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [lat, setLat] = useState(workshop?.latitude ?? BARI_LAT);
    const [lng, setLng] = useState(workshop?.longitude ?? BARI_LNG);

    useEffect(() => {
        if (workshop) return;
        if (typeof navigator !== "undefined" && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setLat(pos.coords.latitude);
                    setLng(pos.coords.longitude);
                },
                () => {},
            );
        }
    }, [workshop]);

    async function onSubmit(values: Workshop) {
        setLoading(true);
        setError("");

        const payload: Workshop = {
            ...values,
            latitude: lat,
            longitude: lng,
            link: values.link || null,
            type: workshop ? workshop.type : values.type,
        };

        const res = await apiFetch(workshop ? `/workshop/${workshop.id}` : "/workshop/", {
            method: workshop ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            setError(body.detail ?? (workshop ? "Workshop update failed" : "Workshop creation failed"));
            setLoading(false);
            return;
        }

        router.push("/workshops");
    }

    async function onDelete() {
        if (!workshop) return;
        if (!confirm("Delete this workshop?")) return;
        setDeleting(true);
        setError("");
        const res = await apiFetch(`/workshop/${workshop.id}`, { method: "DELETE" });
        if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            setError(body.detail ?? "Workshop deletion failed");
            setDeleting(false);
            return;
        }
        router.push("/workshops");
    }

    return (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center bg-zinc-50 px-4 py-4 dark:bg-black">
            <div className="w-full max-w-5xl flex-1 min-h-0 space-y-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">{workshop ? "Edit workshop" : "Create workshop"}</h1>
                </div>
                <WorkshopForm
                    initialValues={{
                        name: workshop?.name ?? "",
                        address: workshop?.address ?? "",
                        description: workshop?.description ?? "",
                        link: workshop?.link ?? "",
                        date: workshop?.date ?? "",
                        latitude: lat,
                        longitude: lng,
                        type: workshop?.type ?? "Other",
                    }}
                    onSubmit={onSubmit}
                    submitText={workshop ? "Save" : "Confirm"}
                    loadingText={workshop ? "Saving" : "Creating"}
                    loading={loading}
                    error={error}
                    onCancel={() => router.push("/workshops")}
                    showDelete={!!workshop}
                    onDelete={workshop ? onDelete : undefined}
                    deleting={deleting}
                />
            </div>
        </div>
    );
}
