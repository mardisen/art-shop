"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/auth";

export function DeleteWorkshopButton({ workshopId }: { workshopId: number }) {
    const router = useRouter();
    const [deleting, setDeleting] = useState(false);

    async function onDelete() {
        if (!confirm("Delete this workshop?")) return;
        setDeleting(true);
        const res = await apiFetch(`/workshop/${workshopId}`, { method: "DELETE" });
        setDeleting(false);
        if (res.ok) router.refresh();
    }

    return (
        <button onClick={onDelete} disabled={deleting} className="text-sm text-red-600 underline">
            {deleting ? "Deleting" : "Delete"}
        </button>
    );
}
