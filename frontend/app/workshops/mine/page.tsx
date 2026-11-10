import { apiFetch } from "@/lib/auth";
import { Role, WorkshopFull } from "@/lib/models";
import { getCurrentUser } from "@/lib/session";
import { WorkshopListItem } from "@/components/WorkshopListItem";

export default async function MyWorkshopsPage() {
    const user = await getCurrentUser();

    if (user?.role !== Role.Professor) {
        return (
            <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 dark:bg-black">
                <p>Not authorized</p>
            </div>
        );
    }

    const res = await apiFetch("/workshop/", { cache: "no-store" });
    const data = res.ok ? await res.json() : [];
    const workshops: WorkshopFull[] = (Array.isArray(data) ? data : []).filter(
        (w: WorkshopFull) => w.created_by === user.id,
    );

    return (
        <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-zinc-50 px-38 py-10 dark:bg-black">
            <h1 className="mb-6 text-2xl font-semibold">My Workshops</h1>
            <div className="mb-4 min-h-0 w-full flex-1 items-start overflow-y-auto rounded-xl bg-white px-8 py-2 shadow dark:bg-zinc-900">
                {workshops.length === 0 ? (
                    <p className="px-4 text-zinc-500">No workshops.</p>
                ) : (
                    <ul className="w-full divide-y divide-zinc-200 px-4 dark:divide-zinc-800">
                        {workshops.map((w) => (
                            <WorkshopListItem
                                key={w.id}
                                workshop={w}
                                showDelete
                                showEdit
                                showBookmark={false}
                                canManage
                            />
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
