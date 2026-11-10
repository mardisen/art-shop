import { apiFetch } from "@/lib/auth";
import { Institute } from "@/lib/models";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BackButton } from "@/components/BackButton";

export default async function InstituteDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const res = await apiFetch(`/institute/${id}`, { cache: "no-store" });
    if (!res.ok) notFound();

    const institute = (await res.json()) as Institute;

    return (
        <div className="flex min-h-0 flex-1 flex-col bg-zinc-50 px-4 py-8 dark:bg-black">
            <div className="mx-auto w-full max-w-2xl space-y-4 rounded-xl bg-white p-8 shadow dark:bg-zinc-900">
                <h1 className="text-2xl font-semibold">{institute.name}</h1>
                {institute.address && <p className="text-sm text-zinc-600 dark:text-zinc-400">{institute.address}</p>}
                {institute.description && <p>{institute.description}</p>}
                {institute.link && (
                    <Link
                        href={institute.link.startsWith("http") ? institute.link : `https://${institute.link}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block text-sm font-medium underline"
                    >
                        Visit website
                    </Link>
                )}
                <div>
                    <BackButton />
                </div>
            </div>
        </div>
    );
}
