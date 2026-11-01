"use client";

import { apiFetch } from "@/lib/auth";
import { WorkshopFull } from "@/lib/models";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "@/lib/providers";
import { Role } from "@/lib/models";
import { WorkshopListItem } from "@/components/WorkshopListItem";

export default function MyWorkshopsPage() {
    const userContext = useContext(UserContext);
    const user = (userContext as any).user ?? userContext;
    const [workshops, setWorkshops] = useState<WorkshopFull[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            if (!user?.id) {
                setWorkshops([]);
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const res = await apiFetch("/workshop/");
                if (!res.ok) {
                    setWorkshops([]);
                    setLoading(false);
                    return;
                }
                const data = await res.json();
                setWorkshops((Array.isArray(data) ? data : []).filter((w: WorkshopFull) => w.created_by === user.id));
            } catch {
                setWorkshops([]);
            }
            setLoading(false);
        }
        load();
    }, [user?.id]);

    if (user?.role !== Role.Professor) {
        return (
            <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 dark:bg-black">
                <p>Not authorized</p>
            </div>
        );
    }

    return (
        <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-zinc-50 px-38 py-10 dark:bg-black">
            <h1 className="mb-6 text-2xl font-semibold">My Workshops</h1>
            <div className="mb-4 min-h-0 w-full flex-1 items-start overflow-y-auto rounded-xl bg-white px-8 py-2 shadow dark:bg-zinc-900">
                {loading ? (
                    <p className="px-4 text-zinc-500">Loading...</p>
                ) : workshops.length === 0 ? (
                    <p className="px-4 text-zinc-500">No workshops.</p>
                ) : (
                    <ul className="w-full divide-y divide-zinc-200 px-4 dark:divide-zinc-800">
                        {workshops.map((w) => (
                            <WorkshopListItem key={w.id} workshop={w} />
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
