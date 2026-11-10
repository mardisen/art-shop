import Link from "next/link";
import { BookmarkButton } from "@/components/BookmarkButton";
import { DeleteWorkshopButton } from "@/components/DeleteWorkshopButton";
import { WorkshopFull } from "@/lib/models";

export function WorkshopListItem({
    workshop,
    showDelete = false,
    showEdit = false,
    showBookmark = true,
    canManage = false,
}: {
    workshop: WorkshopFull;
    showDelete?: boolean;
    showEdit?: boolean;
    showBookmark?: boolean;
    canManage?: boolean;
}) {
    return (
        <li className="py-4">
            <div className="flex items-center justify-between">
                <Link href={`/workshops/${workshop.id}`} className="text-lg font-medium hover:underline">
                    {workshop.name}
                </Link>
                <div className="flex items-center gap-2">
                    {showBookmark && <BookmarkButton workshopId={workshop.id} />}
                    {canManage && (
                        <>
                            {showEdit && (
                                <Link href={`/workshops/${workshop.id}/edit`} className="text-sm underline">
                                    Edit
                                </Link>
                            )}
                            {showDelete && <DeleteWorkshopButton workshopId={workshop.id} />}
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
