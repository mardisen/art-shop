"use client";

import { useContext, useEffect, useState } from "react";
import { apiFetch } from "@/lib/auth";
import { UserContext } from "@/lib/providers";

export function BookmarkButton({ workshopId }: { workshopId: number }) {
    const userContext = useContext(UserContext);
    const user = (userContext as any).user ?? userContext;
    const [bookmarked, setBookmarked] = useState(false);

    useEffect(() => {
        async function load() {
            if (!user?.id) {
                setBookmarked(false);
                return;
            }
            try {
                const res = await apiFetch("/bookmark/");
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data)) {
                        setBookmarked(data.some((b: any) => b.workshop_id === workshopId));
                    }
                }
            } catch {}
        }
        load();
    }, [user?.id, workshopId]);

    async function toggle() {
        if (!user?.id) return;
        if (bookmarked) {
            const res = await apiFetch(`/bookmark/${workshopId}`, { method: "DELETE" });
            if (res.ok) setBookmarked(false);
        } else {
            const res = await apiFetch("/bookmark/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ workshop_id: workshopId }),
            });
            if (res.ok) setBookmarked(true);
        }
    }

    if (!user?.id) return null;

    return (
        <button onClick={toggle} className="text-sm text-yellow-600">
            {bookmarked ? "Unbookmark" : "Bookmark"}
        </button>
    );
}
