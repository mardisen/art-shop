import { apiFetch } from "@/lib/auth";
import { Institute, WorkshopFull } from "@/lib/models";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function WorkshopDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const res = await apiFetch(`/workshop/${id}`, { cache: "no-store" });
    if (!res.ok) notFound();

    const workshop = (await res.json()) as WorkshopFull;

    let institute: Institute | null = null;
    if (workshop.institute_id) {
        const ires = await apiFetch(`/institute/${workshop.institute_id}`, { cache: "no-store" });
        if (ires.ok) institute = (await ires.json()) as Institute;
    }

    return (
        <div className="flex min-h-0 flex-1 flex-col bg-zinc-50 px-4 py-8 dark:bg-black">
            <div className="mx-auto w-full max-w-2xl space-y-4 rounded-xl bg-white p-8 shadow dark:bg-zinc-900">
                <h1 className="text-2xl font-semibold">{workshop.name}</h1>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {workshop.type} • {workshop.date}
                </p>
                <p>{workshop.description}</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{workshop.address}</p>
                {workshop.link && (
                    <Link
                        href={workshop.link.startsWith("http") ? workshop.link : `https://${workshop.link}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block text-sm font-medium underline"
                    >
                        Visit website
                    </Link>
                )}
                {institute && (
                    <div className="mt-4 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
                        <h2 className="text-lg font-medium">Institute</h2>
                        <Link href={`/institutes/${institute.id}`} className="text-sm font-medium underline">
                            {institute.name}
                        </Link>
                        {institute.address && <p className="text-sm text-zinc-600 dark:text-zinc-400">{institute.address}</p>}
                        {institute.description && <p className="mt-1 text-sm">{institute.description}</p>}
                        {institute.link && (
                            <Link
                                href={institute.link.startsWith("http") ? institute.link : `https://${institute.link}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-2 inline-block text-sm underline"
                            >
                                Institute website
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
