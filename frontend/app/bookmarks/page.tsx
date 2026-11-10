import { apiFetch } from "@/lib/auth";
import { WorkshopFull } from "@/lib/models";
import { getCurrentUser } from "@/lib/session";
import { WorkshopListItem } from "@/components/WorkshopListItem";

export default async function BookmarksPage() {
    const user = await getCurrentUser();
    let workshops: WorkshopFull[] = [];

    if (user) {
        const bres = await apiFetch("/bookmark/", { cache: "no-store" });
        if (bres.ok) {
            const bookmarks = await bres.json();
            if (Array.isArray(bookmarks) && bookmarks.length > 0) {
                const all = await apiFetch("/workshop/", { cache: "no-store" });
                if (all.ok) {
                    const data = await all.json();
                    const ids = new Set(bookmarks.map((b: { workshop_id: number }) => b.workshop_id));
                    workshops = (Array.isArray(data) ? data : []).filter((w: WorkshopFull) => ids.has(w.id));
                }
            }
        }
    }

    return (
        <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-zinc-50 px-38 py-10 dark:bg-black">
            <h1 className="mb-6 text-2xl font-semibold">Bookmarks</h1>
            <div className="mb-4 min-h-0 w-full flex-1 items-start overflow-y-auto rounded-xl bg-white px-8 py-2 shadow dark:bg-zinc-900">
                {workshops.length === 0 ? (
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
