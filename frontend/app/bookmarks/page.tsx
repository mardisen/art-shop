"use client";

import { apiFetch } from "@/lib/auth";
import { WorkshopFull } from "@/lib/models";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "@/lib/providers";
import { WorkshopListItem } from "@/components/WorkshopListItem";

export default function BookmarksPage() {
    const { user } = useContext(UserContext)
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
                const bres = await apiFetch("/bookmark/");
                if (!bres.ok) {
                    setWorkshops([]);
                    setLoading(false);
                    return;
                }
                const bookmarks = await bres.json();
                if (!Array.isArray(bookmarks) || bookmarks.length === 0) {
                    setWorkshops([]);
                    setLoading(false);
                    return;
                }
                const all = await apiFetch("/workshop/", { cache: "no-store" });
                if (!all.ok) {
                    setWorkshops([]);
                    setLoading(false);
                    return;
                }
                const data = await all.json();
                const ids = new Set(bookmarks.map((b: any) => b.workshop_id));
                setWorkshops((Array.isArray(data) ? data : []).filter((w: WorkshopFull) => ids.has(w.id)));
            } catch {
                setWorkshops([]);
            }
            setLoading(false);
        }
        load();
    }, [user?.id]);

    return (
        <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-zinc-50 px-38 py-10 dark:bg-black">
            <h1 className="mb-6 text-2xl font-semibold">Bookmarks</h1>
            <div className="mb-4 min-h-0 w-full flex-1 items-start overflow-y-auto rounded-xl bg-white px-8 py-2 shadow dark:bg-zinc-900">
                {loading ? (
                    <p className="px-4 text-zinc-500">Loading...</p>
                ) : workshops.length === 0 ? (
                    <p className="px-4 text-zinc-500">No bookmarks.</p>
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
