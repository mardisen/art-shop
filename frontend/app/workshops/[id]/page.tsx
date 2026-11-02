"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "@/lib/auth";
import { WorkshopFull } from "@/lib/models";
import Link from "next/link";

export default function WorkshopDetailPage() {
    const params = useParams();
    const id = params?.id;
    const [workshop, setWorkshop] = useState<WorkshopFull | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function load() {
            if (!id) return;
            const res = await apiFetch(`/workshop/${id}`, { cache: "no-store" });
            if (!res.ok) {
                setError("Workshop not found");
                setLoading(false);
                return;
            }
            const data = await res.json();
            setWorkshop(data);
            setLoading(false);
        }
        load();
    }, [id]);

    if (loading) {
        return (
            <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 dark:bg-black">
                <p>Loading...</p>
            </div>
        );
    }

    if (!workshop) {
        return (
            <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 dark:bg-black">
                <p>{error || "Workshop not found"}</p>
            </div>
        );
    }

    return (
        <div className="flex min-h-0 flex-1 flex-col bg-zinc-50 px-4 py-8 dark:bg-black">
            <div className="mx-auto w-full max-w-2xl space-y-4 rounded-xl bg-white p-8 shadow dark:bg-zinc-900">
                <h1 className="text-2xl font-semibold">{workshop.name}</h1>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {workshop.type} • {workshop.date}
                </p>
                <p>{workshop.description}</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{workshop.address}</p>
                {workshop.link && (
                    <Link
                        href={workshop.link.startsWith("http") ? workshop.link : `https://${workshop.link}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block text-sm font-medium underline"
                    >
                        Visit website
                    </Link>
                )}
            </div>
        </div>
    );
}
