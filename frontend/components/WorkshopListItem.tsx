"use client";

import Link from "next/link";
import { BookmarkButton } from "@/components/BookmarkButton";
import { WorkshopFull } from "@/lib/models";
import { useContext, useState } from "react";
import { UserContext } from "@/lib/providers";
import { apiFetch } from "@/lib/auth";

export function WorkshopListItem({ workshop, showDelete = false, showEdit = false, showBookmark = true }: { workshop: WorkshopFull; showDelete?: boolean; showEdit?: boolean; showBookmark?: boolean }) {
    const userContext = useContext(UserContext);
    const user = (userContext as any).user ?? (userContext as any);
    const [deleting, setDeleting] = useState(false);
    const [hidden, setHidden] = useState(false);

    async function onDelete() {
        if (!confirm("Delete this workshop?")) return;
        setDeleting(true);
        const res = await apiFetch(`/workshop/${workshop.id}`, { method: "DELETE" });
        if (res.ok) {
            setHidden(true);
        }
        setDeleting(false);
    }

    if (hidden) return null;

    return (
        <li className="py-4">
            <div className="flex items-center justify-between">
                <Link href={`/workshops/${workshop.id}`} className="text-lg font-medium hover:underline">
                    {workshop.name}
                </Link>
                <div className="flex items-center gap-2">
                    {showBookmark && <BookmarkButton workshopId={workshop.id} />}
                    {workshop.created_by && user?.id && workshop.created_by === user.id && (
                        <>
                            {showEdit && (
                                <Link href={`/workshops/${workshop.id}/edit`} className="text-sm underline">
                                    Edit
                                </Link>
                            )}
                            {showDelete && (
                                <button onClick={onDelete} disabled={deleting} className="text-sm text-red-600 underline">
                                    {deleting ? "Deleting" : "Delete"}
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
            <p className="mt-1 text-sm text-zinc-500">{workshop.address}</p>
            <p className="mt-1 text-xs text-zinc-400">{workshop.type}</p>
            <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">{workshop.description}</p>
            {workshop.link && (
                <Link
                    href={workshop.link.startsWith("http") ? workshop.link : `https://${workshop.link}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-block text-sm font-medium underline"
                >
                    Visit website
                </Link>
            )}
        </li>
    );
}
