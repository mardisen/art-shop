"use client";

import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/auth";
import { UserContext } from "@/lib/providers";
import { Role } from "@/lib/models";
import { WorkshopForm } from "@/components/WorkshopForm";

export default function CreateWorkshopPage() {
    const router = useRouter();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [lat, setLat] = useState<number>(41.1171432);
    const [lng, setLng] = useState<number>(16.8718715);
    const { user } = useContext(UserContext);

    useEffect(() => {
        if (user.role != Role.Professor) router.push("/login");
    }, [user]);

    useEffect(() => {
        if (typeof navigator !== "undefined" && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setLat(pos.coords.latitude);
                    setLng(pos.coords.longitude);
                },
                () => {},
            );
        }
    }, []);

    async function onSubmit(values: any) {
        setLoading(true);
        setError("");

        const payload = {
            ...values,
            latitude: lat,
            longitude: lng,
            link: values.link || null,
        };

        const res = await apiFetch(`/workshop/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            setError(body.detail ?? "Workshop creation failed");
            setLoading(false);
            return;
        }

        router.push("/workshops");
    }

    return (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center bg-zinc-50 px-4 py-4 dark:bg-black">
            <div className="w-full max-w-5xl flex-1 min-h-0 space-y-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Create workshop</h1>
                </div>
                <WorkshopForm
                    initialValues={{
                        name: "",
                        address: "",
                        description: "",
                        link: "",
                        date: "",
                        latitude: lat,
                        longitude: lng,
                        type: "Other",
                    }}
                    onSubmit={onSubmit}
                    submitText="Confirm"
                    loadingText="Creating"
                    loading={loading}
                    error={error}
                    onCancel={() => router.push("/workshops")}
                />
            </div>
        </div>
    );
}
