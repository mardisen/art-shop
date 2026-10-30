import { apiFetch } from "@/lib/auth";
import Link from "next/link";
import { Pagination } from "@/components/Pagination";
import { WorkshopFull } from "@/lib/models";

async function getWorkshops(): Promise<WorkshopFull[]> {
    const res = await apiFetch(`/workshop/`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
}

const ITEMS_PER_PAGE = 10;

export default async function WorkshopsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
    const params = await searchParams;
    const workshops = await getWorkshops();

    const currentPage = Math.max(1, parseInt(params.page || "1", 10) || 1);
    const totalPages = Math.max(1, Math.ceil(workshops.length / ITEMS_PER_PAGE));
    const page = Math.min(currentPage, totalPages);
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const paginatedWorkshops = workshops.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return (
        <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-zinc-50 px-38 py-10 dark:bg-black">
            <h1 className="mb-6 text-2xl font-semibold">Workshops</h1>
            <div className="mb-4 min-h-0 w-full flex-1 items-start overflow-y-auto rounded-xl shadow bg-white px-8 py-2">
                {workshops.length === 0 ? (
                    <p className="px-4 text-zinc-500">No workshops found.</p>
                ) : (
                    <ul className="w-full divide-y divide-zinc-200 px-4 dark:divide-zinc-800">
                        {paginatedWorkshops.map((w) => (
                            <li key={w.id} className="py-4">
                                <h2 className="text-lg font-medium">{w.name}</h2>
                                <p className="mt-1 text-sm text-zinc-500">{w.address}</p>
                                <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">{w.description}</p>
                                {w.link && (
                                    <Link
                                        href={w.link.startsWith("http") ? w.link : `https://${w.link}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-3 inline-block text-sm font-medium underline"
                                    >
                                        Visit website
                                    </Link>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <Pagination
                currentPage={page}
                totalPages={totalPages}
                basePath="/workshops"
                totalItems={workshops.length}
                itemsPerPage={ITEMS_PER_PAGE}
            />
        </div>
    );
}
