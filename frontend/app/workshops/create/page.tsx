"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { API_URL, apiFetch } from "@/lib/auth";
import { FormField } from "@/components/FormField";
import { Button } from "@/components/Button";
import "leaflet/dist/leaflet.css";

const MapPicker = dynamic(() => import("@/components/MapPicker"), { ssr: false });

export default function CreateWorkshopPage() {
    const router = useRouter();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [lat, setLat] = useState<number>(41.1171432);
    const [lng, setLng] = useState<number>(16.8718715);

    useEffect(() => {
        if (typeof navigator !== "undefined" && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setLat(pos.coords.latitude);
                    setLng(pos.coords.longitude);
                },
                () => {
                    // keep Bari default
                }
            );
        }
    }, []);

    async function onSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError("");
        const formData = new FormData(e.currentTarget);

        const payload = {
            name: formData.get("name"),
            address: formData.get("address"),
            description: formData.get("description"),
            link: formData.get("link") || null,
            date: formData.get("date"),
            latitude: lat,
            longitude: lng
        };

        const { getCookieToken } = await import("@/lib/auth");
        const token = await getCookieToken();
        const headers: HeadersInit = { "Content-Type": "application/json" };
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const res = await apiFetch(`/workshop/`, {
            method: "POST",
            headers,
            body: JSON.stringify(payload)
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
            <form
                onSubmit={onSubmit}
                className="min-h-0 w-full max-w-5xl flex-1 space-y-4 overflow-auto rounded-xl bg-white p-8 shadow dark:bg-zinc-900"
            >
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Create workshop</h1>
                </div>
                {error && (
                    <p className="rounded bg-yellow-50 px-3 py-2 text-sm text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400">
                        {error}
                    </p>
                )}
                <div className="flex w-full flex-row justify-between space-x-12">
                    <div className="flex flex-col space-y-2 flex-1">
                        <FormField label="Name" name="name" required />
                        <FormField label="Address" name="address" required />
                        <FormField label="Description" name="description" required />
                    </div>
                    <div className="flex flex-col space-y-2 flex-1">
                        <FormField label="Link (optional)" name="link" />
                        <FormField label="Date" name="date" type="date" required />
                    </div>
                </div>
                <div>
                    <p className="mb-2 text-sm font-medium">Location</p>
                    <MapPicker
                        lat={lat}
                        lng={lng}
                        onChange={(l, n) => {
                            setLat(l);
                            setLng(n);
                        }}
                    />
                    <p className="mt-1 text-xs text-zinc-500">
                        {lat.toFixed(6)}, {lng.toFixed(6)}
                    </p>
                </div>
                <Button type="submit" loading={loading} loadingText="Creating">
                    Create
                </Button>
            </form>
        </div>
    );
}
