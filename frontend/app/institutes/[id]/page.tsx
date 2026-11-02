"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/auth";
import Link from "next/link";

export default function InstituteDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id;
    const [institute, setInstitute] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function load() {
            if (!id) return;
            const res = await apiFetch(`/institute/${id}`, { cache: "no-store" });
            if (!res.ok) {
                setError("Institute not found");
                setLoading(false);
                return;
            }
            const data = await res.json();
            setInstitute(data);
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

    if (!institute) {
        return (
            <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 dark:bg-black">
                <p>{error || "Institute not found"}</p>
            </div>
        );
    }

    return (
        <div className="flex min-h-0 flex-1 flex-col bg-zinc-50 px-4 py-8 dark:bg-black">
            <div className="mx-auto w-full max-w-2xl space-y-4 rounded-xl bg-white p-8 shadow dark:bg-zinc-900">
                <h1 className="text-2xl font-semibold">{institute.name}</h1>
                {institute.address && <p className="text-sm text-zinc-600 dark:text-zinc-400">{institute.address}</p>}
                {institute.description && <p>{institute.description}</p>}
                {institute.link && (
                    <Link
                        href={institute.link.startsWith("http") ? institute.link : `https://${institute.link}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block text-sm font-medium underline"
                    >
                        Visit website
                    </Link>
                )}
                <div>
                    <button className="text-sm underline hover:cursor-pointer" onClick={() => router.back()}>
                        Back
                    </button>
                </div>
            </div>
        </div>
    );
}
