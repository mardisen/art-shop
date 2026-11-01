"use client";

import Link from "next/link";
import { BookmarkButton } from "@/components/BookmarkButton";
import { WorkshopFull } from "@/lib/models";
import { useContext } from "react";
import { UserContext } from "@/lib/providers";

export function WorkshopListItem({ workshop }: { workshop: WorkshopFull }) {
    const { user } = useContext(UserContext);

    return (
        <li className="py-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium">{workshop.name}</h2>
                <div className="flex items-center gap-2">
                    <BookmarkButton workshopId={workshop.id} />
                    {workshop.created_by && user?.id && workshop.created_by === user.id && (
                        <Link href={`/workshops/${workshop.id}/edit`} className="text-sm underline">
                            Edit
                        </Link>
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
